import './PastStory.css';
import { collection, query, getDocs, getFirestore, where } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";


const firebaseConfig = {
    apiKey: "AIzaSyCZ9Eia_8WUjVwHeLO-2CwOSketMB_Cwhs",
    authDomain: "snowball-stories.firebaseapp.com",
    projectId: "snowball-stories",
    storageBucket: "snowball-stories.appspot.com",
    messagingSenderId: "874662831073",
    appId: "1:874662831073:web:8ed4031c527b263a0568a0",
    measurementId: "G-XR3N6JDFZK"
};

const app = initializeApp(firebaseConfig);

const CollectionDocuments = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollectionDocuments = async (userId) => {
            try {
                const db = getFirestore(app);
                const snowballRef = collection(db, "snowball-fight");

                // Perform 3 separate queries to avoid downloading the entire collection
                // This prevents excessive data exposure by only fetching relevant documents
                const q1 = query(snowballRef, where("Introduction Paragraph Text User", "==", userId));
                const q2 = query(snowballRef, where("Body Paragraph Text User", "==", userId));
                const q3 = query(snowballRef, where("Conclusion Paragraph Text User", "==", userId));

                const [snap1, snap2, snap3] = await Promise.all([
                    getDocs(q1),
                    getDocs(q2),
                    getDocs(q3)
                ]);

                // Merge results by ID to handle duplicates (if a user contributed multiple parts)
                const docsMap = new Map();
                [...snap1.docs, ...snap2.docs, ...snap3.docs].forEach(doc => {
                    docsMap.set(doc.id, { id: doc.id, ...doc.data() });
                });

                const data = Array.from(docsMap.values())
                    .sort((a, b) => a.createdAt - b.createdAt);

                setDocuments(data);
            } catch (error) {
                console.error("Error fetching collection documents:", error);
            } finally {
                setLoading(false); // Stop loading once data is fetched
            }
        };

        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                // Not logged in
                navigate("/");
            } else if (user.uid !== uid) {
                // Unauthorized access to another user's stories
                navigate("/");
            } else {
                // Authorized
                fetchCollectionDocuments(user.uid);
            }
        });
        return () => unsubscribe();
    }, [uid, navigate]);

    if (loading) {
        return <div className="global-background"><p style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Loading...</p></div>;
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
                        <p>No documents found for user ID: {uid}</p>
                    )}
                </div>

            </div>
        </div>

    );
};

export default CollectionDocuments;
