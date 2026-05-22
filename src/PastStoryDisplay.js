import './PastStoryDisplay.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, doc, getDoc } from './firebase';

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

    const formatParagraph = (text, placeholder) => {
        if (!text || text === 'Taken') {
            return <p className="story-paragraph-placeholder">❄️ {placeholder}</p>;
        }
        return <p className="story-paragraph-text">{text}</p>;
    };

    return (
        <div className="story-viewer-page-wrapper">
            <header className="workspace-header">
                <div className="logo-group">
                    <span className="logo-icon">📖</span>
                    <h1 className="logo-title">Story Reader</h1>
                </div>
                <button 
                    className="back-dashboard-btn" 
                    onClick={() => window.history.back()}
                >
                    📚 Back to Stories
                </button>
            </header>

            <main className="story-viewer-main-content">
                {error ? (
                    <div className="viewer-error-container">
                        <span className="error-icon">⚠️</span>
                        <h3>Failed to load story</h3>
                        <p>{error}</p>
                        <a className="error-back-btn" href="/">Return to Workspace</a>
                    </div>
                ) : documentData ? (
                    <article className="grand-story-parchment">
                        <div className="parchment-spine"></div>
                        <div className="parchment-content-wrapper">
                            <h2 className="story-main-title">A Winter Flurry Tale</h2>
                            <div className="story-meta-contributors">
                                <span>Collaborative Story Canvas</span>
                            </div>
                            
                            <div className="story-body-chapters">
                                <div className="story-chapter-section intro-chapter">
                                    <div className="chapter-marker">
                                        <span className="chapter-label">Chapter I</span>
                                        <h4 className="chapter-title">The Spark</h4>
                                    </div>
                                    {formatParagraph(
                                        documentData["Introduction Paragraph Text"],
                                        "This chapter is waiting for a writer to lay down the first snow path..."
                                    )}
                                </div>

                                <div className="story-chapter-section body-chapter">
                                    <div className="chapter-marker">
                                        <span className="chapter-label">Chapter II</span>
                                        <h4 className="chapter-title">The Flurry</h4>
                                    </div>
                                    {formatParagraph(
                                        documentData["Body Paragraph Text"],
                                        "The adventure is frozen mid-motion, waiting for a collaborator's action..."
                                    )}
                                </div>

                                <div className="story-chapter-section conclusion-chapter">
                                    <div className="chapter-marker">
                                        <span className="chapter-label">Chapter III</span>
                                        <h4 className="chapter-title">The Warm Hearth</h4>
                                    </div>
                                    {formatParagraph(
                                        documentData["Conclusion Paragraph Text"],
                                        "A cozy ending has yet to be written. The snow still falls..."
                                    )}
                                </div>
                            </div>
                        </div>
                    </article>
                ) : (
                    <div className="dashboard-loading">
                        <div className="loading-spinner"></div>
                        <p>Opening the story scroll...</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default PastStoryDisplay;
