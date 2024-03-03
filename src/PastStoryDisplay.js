import './PastStoryDisplay.css';
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {getFirestore, doc, getDoc} from 'firebase/firestore';
import {useParams} from "react-router-dom";

const firebaseConfig = {
    apiKey: "AIzaSyCZ9Eia_8WUjVwHeLO-2CwOSketMB_Cwhs",
    authDomain: "snowball-stories.firebaseapp.com",
    projectId: "snowball-stories",
    storageBucket: "snowball-stories.appspot.com",
    messagingSenderId: "874662831073",
    appId: "1:874662831073:web:8ed4031c527b263a0568a0",
    measurementId: "G-XR3N6JDFZK"
};

// Initialize Firebase
initializeApp(firebaseConfig);


// Function to get document data from Firestore
const getDocumentData = async (documentId) => {
    console.log(documentId);
    const db = getFirestore(); // Get the Firestore database instance
    const docRef = doc(db, "snowball-fight", documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data(); // Return the document data if found
    } else {
        throw new Error('No such document!');
    }
};

function App() {
    const [documentData, setDocumentData] = useState(null);
    const {documentId} = useParams();
    console.log(documentId);
    useEffect(() => {
        // Function to fetch the document data from Firestore
        const fetchDocumentData = async () => {
            try {
                const data = await getDocumentData(documentId);
                setDocumentData(data);
            } catch (error) {
                console.error('Error fetching document:', error);
            }
        };

        // Call the function to fetch document data
        fetchDocumentData();
    }, []);

    return (
        <div className="global-background">
            <div className="your-story">
                <h1>Your Story</h1>
                {documentData ? (
                    <div>
                        <p>Introduction: {documentData["Introduction Paragraph Text"]}</p>
                        <p>Body: {documentData["Body Paragraph Text"]}</p>
                        <p>Conclusion: {documentData["Conclusion Paragraph Text"]}</p>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>

    );
}

export default App;
