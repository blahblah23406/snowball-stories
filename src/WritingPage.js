import './WritingPage.css';
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    setDoc,
    getDoc
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ImageButton from './ImageButton';

var key = 0;
var docKey = null;
var uid = null;
var username = null;
var docInfo = null;

// Initialize Firebase with your Firebase configuration
initializeApp({
    apiKey: "AIzaSyCZ9Eia_8WUjVwHeLO-2CwOSketMB_Cwhs",
    authDomain: "snowball-stories.firebaseapp.com",
    projectId: "snowball-stories",
    storageBucket: "snowball-stories.appspot.com",
    messagingSenderId: "874662831073",
    appId: "1:874662831073:web:8ed4031c527b263a0568a0",
    measurementId: "G-XR3N6JDFZK"
});

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [editText, setEditText] = useState('');
    const [message, setMessage] = useState('Loading user...');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, user => {
            if (user) {
                setCurrentUser({uid: user.uid, displayName: user.displayName || "No username available"});
                setMessage('Loading document...');
                uid = user.uid;
                username = user.displayName;
                findOrCreateDocument(user.uid);
            } else {
                setCurrentUser(null);
                setMessage('Please log in.');
                setLoading(false);
            }
        });

        const handleBeforeUnload = async (event) => {
            // Prevent the browser from closing immediately
            event.preventDefault();
            event.returnValue = '';

            try {
                const db = getFirestore();
                const snowballFightCollection = collection(db, "snowball-fight");
                const docRef = doc(snowballFightCollection, docKey);

                // Await the document snapshot
                const docSnapshot = await getDoc(docRef);

                if (!docSnapshot.exists()) {
                    setMessage('Document not found.');
                    return;
                }

                console.log("YAY");
                if (docKey !== null) {
                    console.log("EVEN BETTER");
                    if (key === 1) {
                        await updateDoc(docRef, {
                            ['Introduction Paragraph Text']: "",
                        });
                    } else if (key === 2) {
                        await updateDoc(docRef, {
                            ['Body Paragraph Text']: "",
                        });
                    } else if (key === 3) {
                        await updateDoc(docRef, {
                            ['Conclusion Paragraph Text']: "",
                        });
                    }
                }

                // Now the Firestore operations have completed, we can allow the browser to close
                event.returnValue = null;

            } catch (error) {
                console.error('Error handling beforeunload:', error);
                // If an error occurs, we still prevent the browser from closing
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

// Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };


    }, []);

    const findOrCreateDocument = async (userId) => {
        console.log('Starting to find or create document...');
        try {
            const db = getFirestore();
            const snowballFightCollection = collection(db, "snowball-fight");
            console.log('Firestore and collection initialized.');

            // Query to fetch documents with incomplete body paragraphs
            console.log('Querying for documents with incomplete body paragraphs...');
            const bodyQ = query(
                snowballFightCollection,
                where("Body Paragraph Text", "==", ""),
                where("Introduction Paragraph Text", "!=", ""),
            );
            const bodySnapshot = await getDocs(bodyQ);
            console.log(bodySnapshot);

            // Query to fetch documents with incomplete conclusion paragraphs
            console.log('Querying for documents with incomplete conclusion paragraphs...');
            const conclusionQ = query(
                snowballFightCollection,
                where("Conclusion Paragraph Text", "==", ""),
                where("Body Paragraph Text", "!=", "")
            );

            const conclusionSnapshot = await getDocs(conclusionQ);
            console.log(conclusionSnapshot);

            // Combine both snapshots into a single array
            const allSnapshots = [...bodySnapshot.docs, ...conclusionSnapshot.docs];

            if (allSnapshots.length === 0) {
                console.log('No documents with incomplete paragraphs found, creating a new document...');
                // Create a new document since there are no suitable existing documents
                await createNewDocument(snowballFightCollection, userId);
            } else {
                console.log('Found documents with incomplete paragraphs, processing...');
                // Sort the combined array based on creation timestamp in ascending order
                allSnapshots.sort((a, b) => a.data().createdAt - b.data().createdAt);

                let earliestSuitableDoc = null;

                // Iterate through the sorted array to find the earliest suitable document
                for (const doc of allSnapshots) {
                    console.log(doc.id);

                    // Check if the user is already associated with the document
                    const userIntroData = doc.data()["Introduction Paragraph Text User"];
                    const userBodyData = doc.data()["Body Paragraph Text User"];
                    const userConcluData = doc.data()["Conclusion Paragraph Text User"];

                    console.log(doc.id + " " + userIntroData + " " + userBodyData + " " + userConcluData);

                    // Check if the necessary properties exist and if the user is associated with the document
                    if (
                        userIntroData !== undefined &&
                        userBodyData !== undefined &&
                        userConcluData !== undefined &&
                        doc.data()["Introduction Paragraph Text"] !== "" &&
                        !userIntroData.includes(userId) &&
                        !userBodyData.includes(userId) &&
                        !userConcluData.includes(userId)
                    ) {
                        console.log('User not associated with document, selecting earliest suitable document...');
                        earliestSuitableDoc = doc;
                        break;
                    }
                }

                if (earliestSuitableDoc) {
                    console.log('Processing earliest suitable document...');
                    await processExistingDocument(earliestSuitableDoc.id, earliestSuitableDoc.data(), userId, snowballFightCollection);
                } else {
                    console.log('All documents have user association, creating a new document...');
                    await createNewDocument(snowballFightCollection, userId);
                }
            }
        } catch (error) {
            console.log(`Error in document retrieval or creation: ${error.message}`);
            setMessage(`Error in document retrieval or creation: ${error.message}`);
        }
    };


    const createNewDocument = async (collectionRef, userId) => {
        try {
            const newDocumentRef = doc(collectionRef);
            await setDoc(newDocumentRef, {
                'Introduction Paragraph Text': '',
                'Introduction Paragraph Text User': '',
                'Body Paragraph Text': '',
                'Body Paragraph Text User': '',
                'Conclusion Paragraph Text': '',
                'Conclusion Paragraph Text User': '',
                'createdAt': new Date()
            });

            const newDocumentId = newDocumentRef.id; // Get the new document ID
            determineParagraphEdit(newDocumentId, 'Introduction Paragraph Text');
            setLoading(false);
        } catch (error) {
            setMessage(`Error creating new document: ${error.message}`);
        }
    };

    const processExistingDocument = async (docId, docData, userId, collectionRef) => {
        try {
            setMessage("bye")
            determineParagraphEdit(docId, docData);
        } catch (error) {
            setMessage(`Error processing existing document: ${error.message}`);
        }
    };


    const determineParagraphEdit = async (docId, docData) => {
        docKey = docId;
        docInfo = docData;
        setMessage(docId);
        const db = getFirestore();
        const snowballFightCollection = collection(db, "snowball-fight");
        const docRef = doc(snowballFightCollection, docId);
        const docSnapshot = await getDoc(docRef);
        if (!docSnapshot.exists()) {
            setMessage('Document not found.');
            return;
        }

        if (!docData['Introduction Paragraph Text']) {
            await updateDoc(docRef, {
                ['Introduction Paragraph Text']: "Taken",
            });
            setMessage("Welcome " + username + "! Time for a new story!");
            setEditText("Start the story!")
            key = 1;
        } else if (!docData['Body Paragraph Text']) {
            await updateDoc(docRef, {
                ['Body Paragraph Text']: "Taken",
            });
            setMessage("Welcome " + username + "! The current progress of the story is: " + docData['Introduction Paragraph Text']);
            setEditText("Continue the story!")
            key = 2;
        } else if (!docData['Conclusion Paragraph Text']) {
            await updateDoc(docRef, {
                ['Conclusion Paragraph Text']: "Taken",
            });
            setMessage("Welcome " + username + "! The current progress of the story is: " + docData['Introduction Paragraph Text'] + " " + docData['Body Paragraph Text']);
            setEditText("Finish the story!")
            key = 3;
        }
        setLoading(false);
        console.log(key);
    };


    const handleEditSubmit = async () => {
        try {
            if (!currentUser) {
                setMessage('You must be logged in to update the document.');
                return;
            }

            if (!docKey) {
                setMessage('Document key is not defined.');
                return;
            }

            const db = getFirestore();
            const snowballFightCollection = collection(db, "snowball-fight");

            // Create a Firestore document reference
            const docRef = doc(snowballFightCollection, docKey);

            // Fetch the document using the document reference
            const docSnapshot = await getDoc(docRef);

            // Check if the document exists
            if (!docSnapshot.exists()) {
                setMessage('Document not found.');
                return;
            }

            // Determine the paragraph being edited based on the current state
            let paragraphField = '';
            switch (key) {
                case 1:
                    paragraphField = 'Introduction Paragraph Text';
                    break;
                case 2:
                    paragraphField = 'Body Paragraph Text';
                    break;
                case 3:
                    paragraphField = 'Conclusion Paragraph Text';
                    break;
                default:
                    setMessage('Invalid paragraph.');
                    return;
            }

            // Update the document with the edited text in the appropriate paragraph
            await updateDoc(docRef, {
                [paragraphField]: editText,
                [`${paragraphField} User`]: currentUser.uid,
            });

            setMessage('Document updated successfully.');

            window.location.reload();
        } catch (error) {
            setMessage(`Error updating document: ${error.message}`);
        }
    };


    if (loading) return <p>{message}</p>;


    return (
        <div className="global-background">
            <div className="mega-container">
                <div className="container">
                    <p>{message}</p>
                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
                              style={{marginBottom: '10px'}}/>
                </div>
                <div style={{marginBottom: '10px'}}>
                    <ImageButton imageUrl="https://i.ibb.co/wg7NcLz/skeeyee-removebg-preview.png"
                                 onClick={handleEditSubmit} text="Submit"/>
                </div>
                <a href={`/paststory/${uid}`}>Your Past Stories</a>
            </div>


        </div>

    );


}

export default App;

