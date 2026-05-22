import './PastStoryDisplay.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const getDocumentData = async (documentId) => {
    const docRef = doc(db, "snowball-fight", documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        throw new Error('No such document!');
    }
};

function PastStoryDisplay() {
    const [documentData, setDocumentData] = useState(null);
    const [error, setError] = useState(null);
    const { documentId } = useParams();

    useEffect(() => {
        const fetchDocumentData = async () => {
            if (!documentId) return;
            try {
                const data = await getDocumentData(documentId);
                setDocumentData(data);
            } catch (err) {
                console.error('Error fetching document:', err);
                setError(err.message);
            }
        };

        fetchDocumentData();
    }, [documentId]);

    return (
        <div className="global-background">
            <div className="your-story">
                <h1>Your Story</h1>
                {error ? (
                    <p className="error-text">Error: {error}</p>
                ) : documentData ? (
                    <div className="story-content">
                        <p><strong>Introduction:</strong> {documentData["Introduction Paragraph Text"]}</p>
                        <p><strong>Body:</strong> {documentData["Body Paragraph Text"]}</p>
                        <p><strong>Conclusion:</strong> {documentData["Conclusion Paragraph Text"]}</p>
                    </div>
                ) : (
                    <p className="loading-text">Loading story...</p>
                )}
            </div>
        </div>
    );
}

export default PastStoryDisplay;
