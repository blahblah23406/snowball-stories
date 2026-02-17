import './PastStoryDisplay.css';
import React, { useState, useEffect } from 'react';
import {doc, getDoc} from 'firebase/firestore';
import {useParams} from "react-router-dom";
import { db } from './firebase';


// Function to get document data from Firestore
const getDocumentData = async (documentId) => {
    console.log(documentId);
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
