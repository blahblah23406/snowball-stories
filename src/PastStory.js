import './PastStory.css';
import { collection, query, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase";

const CollectionDocuments = () => {
    const { uid } = useParams();
    const userId = uid;
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        const fetchCollectionDocuments = async () => {
            try {
                const q = query(collection(db, "snowball-fight"));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter(doc =>
                        doc["Introduction Paragraph Text User"] === userId ||
                        doc["Body Paragraph Text User"] === userId ||
                        doc["Conclusion Paragraph Text User"] === userId)
                    .sort((a, b) => a.createdAt - b.createdAt);
                setDocuments(data);
            } catch (error) {
                console.error("Error fetching collection documents:", error);
            }
        };

        fetchCollectionDocuments();
    }, [userId]);

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
                        <p>No documents found for user ID: {userId}</p>
                    )}




                </div>

            </div>
        </div>

    );
};

export default CollectionDocuments;
