import './WritingPage.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    auth,
    db,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    onAuthStateChanged
} from './firebase';
import ImageButton from './ImageButton';

function WritingPage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [editText, setEditText] = useState('');
    const [message, setMessage] = useState('Loading user...');
    const [loading, setLoading] = useState(true);
    const [storyProgress, setStoryProgress] = useState({ intro: '', body: '', conclusion: '' });

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

        const data = docSnapshot.data();
        const usernameStr = usernameRef.current || 'Author';
        
        const intro = data['Introduction Paragraph Text'] || '';
        const body = data['Body Paragraph Text'] || '';
        const conclusion = data['Conclusion Paragraph Text'] || '';

        // Exclude "Taken" tags from the actual reading text
        setStoryProgress({
            intro: intro === 'Taken' ? '' : intro,
            body: body === 'Taken' ? '' : body,
            conclusion: conclusion === 'Taken' ? '' : conclusion
        });

        if (!intro || intro === 'Taken') {
            setMessage(`Welcome ${usernameStr}! Let's start a brand new tale.`);
            setEditText("Start the story!");
            await updateDoc(docRef, {
                'Introduction Paragraph Text': "Taken"
            });
            editKeyRef.current = 1;
        } else if (!body || body === 'Taken') {
            setMessage(`Welcome ${usernameStr}! Add a exciting turn to the story.`);
            setEditText("Continue the story!");
            await updateDoc(docRef, {
                'Body Paragraph Text': "Taken"
            });
            editKeyRef.current = 2;
        } else if (!conclusion || conclusion === 'Taken') {
            setMessage(`Welcome ${usernameStr}! Bring this winter journey to an end.`);
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

    const handleSignOut = () => {
        if (auth && typeof auth.signOut === 'function') {
            auth.signOut();
        } else {
            window.location.reload();
        }
    };

    if (loading) {
        return (
            <div className="login-loading-screen">
                <div className="loading-spinner"></div>
                <p>{message}</p>
            </div>
        );
    }

    return (
        <div className="writing-workspace-wrapper">
            {/* Elegant Header */}
            <header className="workspace-header">
                <div className="logo-group">
                    <span className="logo-icon">❄️</span>
                    <h1 className="logo-title">Snowball Stories!</h1>
                </div>
                <div className="user-controls">
                    <span className="user-badge">🖋️ {currentUser?.displayName || "Author"}</span>
                    <button className="signout-button" onClick={handleSignOut}>Log Out</button>
                </div>
            </header>

            <main className="workspace-main-content">
                {/* Visual Step Tracker */}
                <div className="flurry-steps-tracker">
                    <div className={`step-pill ${editKeyRef.current === 1 ? 'active' : ''} ${editKeyRef.current > 1 ? 'completed' : ''}`}>
                        <span className="step-num">1</span>
                        <span className="step-label">Introduction</span>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step-pill ${editKeyRef.current === 2 ? 'active' : ''} ${editKeyRef.current > 2 ? 'completed' : ''}`}>
                        <span className="step-num">2</span>
                        <span className="step-label">Body</span>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step-pill ${editKeyRef.current === 3 ? 'active' : ''} ${editKeyRef.current > 3 ? 'completed' : ''}`}>
                        <span className="step-num">3</span>
                        <span className="step-label">Conclusion</span>
                    </div>
                </div>

                <div className="message-toast">
                    <p className="toast-text">{message}</p>
                </div>

                {/* Cooperative Story Board (Parchment scroll of past text) */}
                {editKeyRef.current > 1 && (storyProgress.intro || storyProgress.body) && (
                    <section className="story-parchment-container">
                        <div className="parchment-header">
                            <h3>📜 The Story So Far...</h3>
                        </div>
                        <div className="parchment-paper">
                            {storyProgress.intro && (
                                <div className="parchment-paragraph intro-section">
                                    <span className="paragraph-tag">Chapter I: The Setup</span>
                                    <p>{storyProgress.intro}</p>
                                </div>
                            )}
                            {storyProgress.body && (
                                <div className="parchment-paragraph body-section">
                                    <span className="paragraph-tag">Chapter II: The Flurry</span>
                                    <p>{storyProgress.body}</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Drafting Container */}
                <section className="drafting-card">
                    <div className="card-header">
                        <h2>
                            {editKeyRef.current === 1 && "✍️ Draft the Introduction"}
                            {editKeyRef.current === 2 && "✍️ Draft the Body Paragraph"}
                            {editKeyRef.current === 3 && "✍️ Draft the Conclusion"}
                        </h2>
                        <p className="card-guideline">
                            {editKeyRef.current === 1 && "Set the stage, describe the winter day, and introduce your characters..."}
                            {editKeyRef.current === 2 && "Add suspense, action, or a surprising snowball fight event..."}
                            {editKeyRef.current === 3 && "Bring the characters inside, wrap up the plot, and leave a cozy warm feeling..."}
                        </p>
                    </div>

                    <div className="editor-container">
                        <textarea 
                            className="story-textarea"
                            value={editText} 
                            onChange={(e) => setEditText(e.target.value)}
                            placeholder="Write your winter story paragraph here..."
                            rows={6}
                        />
                    </div>

                    <div className="action-buttons-group">
                        <ImageButton 
                            imageUrl="https://i.ibb.co/wg7NcLz/skeeyee-removebg-preview.png"
                            onClick={handleEditSubmit} 
                            text="Throw Snowball (Submit)"
                        />
                    </div>
                </section>
            </main>

            {/* Bottom Dashboard Navigation */}
            <footer className="workspace-footer">
                <a className="past-stories-link" href={`/paststory/${uidRef.current}`}>
                    📚 View Your Past Stories Dashboard
                </a>
            </footer>
        </div>
    );
}

export default WritingPage;
