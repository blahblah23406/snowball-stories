import './WritingPage.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    setDoc,
    getDoc,
    deleteDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import ImageButton from './ImageButton';

function WritingPage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [editText, setEditText] = useState('');
    const [message, setMessage] = useState('Loading user...');
    const [loading, setLoading] = useState(true);

    const editKeyRef = useRef(0);
    const docKeyRef = useRef(null);
    const uidRef = useRef(null);
    const usernameRef = useRef(null);
    const createdDocRef = useRef(false);

    // Delete empty stories from DB to clean up stale docs
    const deleteEmptyDocuments = useCallback(async (collectionRef) => {
        try {
            const emptyDocsQuery = query(
                collectionRef,
                where("Introduction Paragraph Text", "==", ""),
                where("Body Paragraph Text", "==", ""),
                where("Conclusion Paragraph Text", "==", "")
            );

            const emptyDocsSnapshot = await getDocs(emptyDocsQuery);
            const deletePromises = emptyDocsSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
        } catch (error) {
            console.error('Error deleting empty documents:', error);
        }
    }, []);

    // Determine which paragraph block the user is editing next
    const determineParagraphEdit = useCallback(async (docId, docData) => {
        docKeyRef.current = docId;
        const snowballFightCollection = collection(db, "snowball-fight");
        const docRef = doc(snowballFightCollection, docId);
        const docSnapshot = await getDoc(docRef);

        if (!docSnapshot.exists()) {
            setMessage('Document not found.');
            return;
        }

        const usernameStr = usernameRef.current || 'Author';

        if (!docData['Introduction Paragraph Text']) {
            setMessage(`Welcome ${usernameStr}! Time for a new story!`);
            setEditText("Start the story!");
            await updateDoc(docRef, {
                'Introduction Paragraph Text': "Taken"
            });
            editKeyRef.current = 1;
        } else if (!docData['Body Paragraph Text']) {
            setMessage(`Welcome ${usernameStr}! The current progress of the story is: ${docData['Introduction Paragraph Text']}`);
            setEditText("Continue the story!");
            await updateDoc(docRef, {
                'Body Paragraph Text': "Taken"
            });
            editKeyRef.current = 2;
        } else if (!docData['Conclusion Paragraph Text']) {
            setMessage(`Welcome ${usernameStr}! The current progress of the story is: ${docData['Introduction Paragraph Text']} ${docData['Body Paragraph Text']}`);
            setEditText("Finish the story!");
            await updateDoc(docRef, {
                'Conclusion Paragraph Text': "Taken"
            });
            editKeyRef.current = 3;
        }
        setLoading(false);
    }, []);

    const createNewDocument = useCallback(async (collectionRef, userId) => {
        try {
            createdDocRef.current = false;
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

            await determineParagraphEdit(newDocumentRef.id, 'Introduction Paragraph Text');
            setLoading(false);
        } catch (error) {
            setMessage(`Error creating new document: ${error.message}`);
        }
    }, [determineParagraphEdit]);

    const processExistingDocument = useCallback(async (docId, docData) => {
        try {
            setMessage("Processing available story...");
            await determineParagraphEdit(docId, docData);
        } catch (error) {
            setMessage(`Error processing existing document: ${error.message}`);
        }
    }, [determineParagraphEdit]);

    // Main logic to fetch or initialize collaborative stories
    const findOrCreateDocument = useCallback(async (userId) => {
        try {
            const snowballFightCollection = collection(db, "snowball-fight");
            await deleteEmptyDocuments(snowballFightCollection);

            // Fetch incomplete stories
            const bodyQ = query(
                snowballFightCollection,
                where("Body Paragraph Text", "==", ""),
                where("Introduction Paragraph Text", "!=", "")
            );
            const bodySnapshot = await getDocs(bodyQ);

            const conclusionQ = query(
                snowballFightCollection,
                where("Conclusion Paragraph Text", "==", ""),
                where("Body Paragraph Text", "!=", "")
            );
            const conclusionSnapshot = await getDocs(conclusionQ);

            const allSnapshots = [...bodySnapshot.docs, ...conclusionSnapshot.docs];

            if (allSnapshots.length === 0) {
                createdDocRef.current = true;
                await createNewDocument(snowballFightCollection, userId);
            } else {
                allSnapshots.sort((a, b) => a.data().createdAt - b.data().createdAt);

                let earliestSuitableDoc = null;
                for (const doc of allSnapshots) {
                    const userIntroData = doc.data()["Introduction Paragraph Text User"] || '';
                    const userBodyData = doc.data()["Body Paragraph Text User"] || '';
                    const userConcluData = doc.data()["Conclusion Paragraph Text User"] || '';
                    const introData = doc.data()["Introduction Paragraph Text"] || '';
                    const bodyData = doc.data()["Body Paragraph Text"] || '';
                    const concluData = doc.data()["Conclusion Paragraph Text"] || '';

                    // Ensure user is not editing their own previous paragraph
                    if (
                        introData &&
                        !introData.includes("Taken") &&
                        !bodyData.includes("Taken") &&
                        !concluData.includes("Taken") &&
                        !userIntroData.includes(userId) &&
                        !userBodyData.includes(userId) &&
                        !userConcluData.includes(userId)
                    ) {
                        earliestSuitableDoc = doc;
                        break;
                    }
                }

                if (earliestSuitableDoc) {
                    await processExistingDocument(earliestSuitableDoc.id, earliestSuitableDoc.data());
                } else {
                    if (!createdDocRef.current) {
                        await createNewDocument(snowballFightCollection, userId);
                    } else {
                        createdDocRef.current = false;
                    }
                }
            }
        } catch (error) {
            setMessage(`Error in document retrieval or creation: ${error.message}`);
        }
    }, [deleteEmptyDocuments, createNewDocument, processExistingDocument]);

    // Sync visibility state changes (e.g. user tab switches or closes)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'hidden') {
                if (!docKeyRef.current) return;
                try {
                    const snowballFightCollection = collection(db, "snowball-fight");
                    const docRef = doc(snowballFightCollection, docKeyRef.current);

                    if (editKeyRef.current === 1) {
                        await updateDoc(docRef, {
                            'Introduction Paragraph Text': ''
                        });
                    } else if (editKeyRef.current === 2) {
                        await updateDoc(docRef, {
                            'Body Paragraph Text': ''
                        });
                    } else if (editKeyRef.current === 3) {
                        await updateDoc(docRef, {
                            'Conclusion Paragraph Text': ''
                        });
                    }
                } catch (error) {
                    console.error('Error handling visibility change:', error);
                }
            } else if (document.visibilityState === 'visible') {
                if (uidRef.current) {
                    findOrCreateDocument(uidRef.current);
                }
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser({ uid: user.uid, displayName: user.displayName || "No username available" });
                setMessage('Loading document...');
                uidRef.current = user.uid;
                usernameRef.current = user.displayName;
                findOrCreateDocument(user.uid);
            } else {
                setCurrentUser(null);
                setMessage('Please log in.');
                setLoading(false);
            }
        });

        window.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            unsubscribe();
        };
    }, [findOrCreateDocument]);

    const handleEditSubmit = async () => {
        try {
            if (!currentUser) {
                setMessage('You must be logged in to update the document.');
                return;
            }

            if (!docKeyRef.current) {
                setMessage('Document key is not defined.');
                return;
            }

            const snowballFightCollection = collection(db, "snowball-fight");
            const docRef = doc(snowballFightCollection, docKeyRef.current);
            const docSnapshot = await getDoc(docRef);

            if (!docSnapshot.exists()) {
                setMessage('Document not found.');
                return;
            }

            let paragraphField = '';
            switch (editKeyRef.current) {
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

            await updateDoc(docRef, {
                [paragraphField]: editText,
                [`${paragraphField} User`]: currentUser.uid
            });

            setMessage('Document updated successfully.');
            setLoading(true);
            await findOrCreateDocument(currentUser.uid);
        } catch (error) {
            setMessage(`Error updating document: ${error.message}`);
        }
    };

    if (loading) return <div className="loading-container"><p>{message}</p></div>;

    return (
        <div className="global-background">
            <div className="mega-container">
                <div className="container">
                    <p>{message}</p>
                    <textarea 
                        value={editText} 
                        onChange={(e) => setEditText(e.target.value)}
                        style={{ marginBottom: '10px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <ImageButton 
                        imageUrl="https://i.ibb.co/wg7NcLz/skeeyee-removebg-preview.png"
                        onClick={handleEditSubmit} 
                        text="Submit"
                    />
                </div>
                <a href={`/paststory/${uidRef.current}`}>Your Past Stories</a>
            </div>
        </div>
    );
}

export default WritingPage;
