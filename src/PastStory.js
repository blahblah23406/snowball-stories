import './PastStory.css';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const PastStory = () => {
    const { uid } = useParams();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPastStories = async () => {
            if (!uid) return;
            try {
                const q = query(collection(db, 'snowball-fight'));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter(doc =>
                        doc["Introduction Paragraph Text User"] === uid ||
                        doc["Body Paragraph Text User"] === uid ||
                        doc["Conclusion Paragraph Text User"] === uid
                    )
                    .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

                setDocuments(data);
            } catch (error) {
                console.error("Error fetching past stories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPastStories();
    }, [uid]);

    return (
        <div className="global-background">
            <div className="document-collection">
                <h1>Past Stories</h1>
                {loading ? (
                    <p className="loading-text">Loading your stories...</p>
                ) : (
                    <div className="document-list">
                        {documents.length > 0 ? (
                            documents.map((doc, index) => (
                                <div key={doc.id} className="document-item">
                                    <h2>Story {index + 1}</h2>
                                    <a href={`/paststoryviewer/${doc.id}`} className="view-link">View Story</a>
                                </div>
                            ))
                        ) : (
                            <p className="no-docs-text">No collaborative stories found yet. Go write some!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PastStory;
