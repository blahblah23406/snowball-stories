import { collection, query, getDocs, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
    const userId = uid;
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        const fetchCollectionDocuments = async () => {
            try {
                const db = getFirestore(app);
                const q = query(collection(db, "snowball-fight"));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter(doc =>
                        doc["Introduction Paragraph Text User"] === userId ||
                        doc["Body Paragraph Text User"] === userId ||
                        doc["Conclusion Paragraph Text User"] === userId
                    );
                setDocuments(data);
            } catch (error) {
                console.error("Error fetching collection documents:", error);
            }
        };

        fetchCollectionDocuments();
    }, [userId]); // Include userId in the dependency array

    return (
        <div style={{ height: "400px", overflow: "auto" }}>
            <h1>Collection Documents</h1>
            {documents.length > 0 ? (
                <div>
                    {documents.map((doc, index) => (
                        <div key={index}>
                            <h2>Story {doc.id}</h2>
                            {/* Display other fields here */}
                            <a href={`/paststoryviewer/${doc.id}`}>View Story</a>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No documents found for user ID: {userId}</p>
            )}
        </div>
    );
};

export default CollectionDocuments;