import './PastStory.css';
import { collection, query, getDocs, where, or } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from './firebase';
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CollectionDocuments = () => {
    // We use the authenticated user to fetch stories securely.
    // The 'uid' param is technically redundant for data fetching but might be used for routing.
    // We ignore it for security to prevent IDOR (seeing other users' stories).
    const { uid } = useParams();
    const [user, loading, error] = useAuthState(auth);
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        const fetchCollectionDocuments = async () => {
            if (!user) return;

            try {
                const userId = user.uid;

                // Secure server-side query: Only fetch documents where the user is an author.
                // This prevents downloading the entire database and protects other users' data.
                const q = query(
                    collection(db, "snowball-fight"),
                    or(
                        where("Introduction Paragraph Text User", "==", userId),
                        where("Body Paragraph Text User", "==", userId),
                        where("Conclusion Paragraph Text User", "==", userId)
                    )
                );

                const querySnapshot = await getDocs(q);

                // Map and sort locally (since we don't want to rely on composite indexes being present)
                const data = querySnapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => a.createdAt - b.createdAt);

                setDocuments(data);
            } catch (error) {
                console.error("Error fetching collection documents:", error);
            }
        };

        if (!loading) {
            fetchCollectionDocuments();
        }
    }, [user, loading]);

    if (loading) {
        return <div className="global-background"><div className="document-collection"><p>Loading...</p></div></div>;
    }

    if (!user) {
        return (
            <div className="global-background">
                <div className="document-collection">
                    <h1>Past Stories</h1>
                    <p>Please log in to view your past stories.</p>
                </div>
            </div>
        );
    }

    // Optional: If you want to enforce that the URL matches the logged-in user
    if (uid && uid !== user.uid) {
         // We could redirect or show a warning.
         // For now, we just show the logged-in user's stories as that is the secure behavior "Your Stories".
    }

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
                        <p>No documents found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionDocuments;
