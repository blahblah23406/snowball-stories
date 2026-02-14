import './PastStory.css';
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CollectionDocuments = () => {
    const { uid } = useParams();
    const [user, loading, error] = useAuthState(auth);
    const [documents, setDocuments] = useState([]);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        const fetchCollectionDocuments = async () => {
            if (loading) return;
            if (!user) return;

            // Security check: Ensure user is accessing their own stories
            if (user.uid !== uid) {
                setFetchError("Unauthorized: You can only view your own stories.");
                return;
            }

            try {
                const snowballRef = collection(db, "snowball-fight");

                // Parallel queries for each paragraph type to avoid downloading the entire collection
                // This fixes the Excessive Data Exposure vulnerability
                const q1 = query(snowballRef, where("Introduction Paragraph Text User", "==", uid));
                const q2 = query(snowballRef, where("Body Paragraph Text User", "==", uid));
                const q3 = query(snowballRef, where("Conclusion Paragraph Text User", "==", uid));

                const [snap1, snap2, snap3] = await Promise.all([
                    getDocs(q1),
                    getDocs(q2),
                    getDocs(q3)
                ]);

                // Combine and deduplicate documents
                const docMap = new Map();

                [...snap1.docs, ...snap2.docs, ...snap3.docs].forEach(doc => {
                    if (!docMap.has(doc.id)) {
                        docMap.set(doc.id, { id: doc.id, ...doc.data() });
                    }
                });

                const data = Array.from(docMap.values())
                    .sort((a, b) => a.createdAt - b.createdAt);

                setDocuments(data);
            } catch (error) {
                console.error("Error fetching collection documents:", error);
                setFetchError("Error fetching documents.");
            }
        };

        fetchCollectionDocuments();
    }, [user, loading, uid]);

    if (loading) return <div className="global-background"><p>Loading...</p></div>;
    if (error) return <div className="global-background"><p>Error: {error.message}</p></div>;
    if (!user) return <div className="global-background"><p>Please log in to view your stories.</p></div>;
    if (fetchError) return <div className="global-background"><p>{fetchError}</p></div>;

    return (
        <div className="global-background">
            <div className="document-collection">
                <h1>Past Stories</h1>
                <div className="document-list">
                    {documents.length > 0 ? (
                        documents.map((doc, index) => (
                            <div key={index} className="document-item">
                                <h2>Story {index + 1}</h2>
                                <a href={`/paststoryviewer/${doc.id}`}>View Story</a>
                            </div>
                        ))
                    ) : (
                        <p>No documents found for user ID: {uid}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionDocuments;
