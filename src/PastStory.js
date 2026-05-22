import './PastStory.css';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, collection, query, getDocs } from './firebase';

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
                    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)); // Newest first

                setDocuments(data);
            } catch (error) {
                console.error("Error fetching past stories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPastStories();
    }, [uid]);

    // Check if story is fully written
    const getStoryStatus = (doc) => {
        const intro = doc["Introduction Paragraph Text"];
        const body = doc["Body Paragraph Text"];
        const conclusion = doc["Conclusion Paragraph Text"];

        const hasIntro = intro && intro !== 'Taken';
        const hasBody = body && body !== 'Taken';
        const hasConclusion = conclusion && conclusion !== 'Taken';

        if (hasIntro && hasBody && hasConclusion) {
            return { label: 'Completed', class: 'status-completed', icon: '❄️' };
        }
        return { label: 'In Progress', class: 'status-progress', icon: '🌨️' };
    };

    // Get a short preview snippet from the story
    const getStoryPreview = (doc) => {
        const intro = doc["Introduction Paragraph Text"];
        if (!intro || intro === 'Taken') return "Waiting for introduction flurry...";
        return intro.length > 90 ? `${intro.substring(0, 90)}...` : intro;
    };

    return (
        <div className="past-stories-page-wrapper">
            <header className="workspace-header">
                <div className="logo-group">
                    <span className="logo-icon">📚</span>
                    <h1 className="logo-title">Your Stories</h1>
                </div>
                <a className="back-workspace-btn" href="/">
                    🖋️ Back to Writing Workspace
                </a>
            </header>

            <main className="past-stories-main-content">
                <div className="dashboard-header-text">
                    <h2>Your Story Flurries</h2>
                    <p>Relive your collaborative winter creations below.</p>
                </div>

                {loading ? (
                    <div className="dashboard-loading">
                        <div className="loading-spinner"></div>
                        <p>Gathering your story snowballs...</p>
                    </div>
                ) : (
                    <div className="stories-grid-container">
                        {documents.length > 0 ? (
                            documents.map((doc, index) => {
                                const status = getStoryStatus(doc);
                                const preview = getStoryPreview(doc);
                                return (
                                    <div key={doc.id} className="story-dashboard-card">
                                        <div className="card-top-accent"></div>
                                        <div className="story-card-header">
                                            <span className={`story-status-tag ${status.class}`}>
                                                {status.icon} {status.label}
                                            </span>
                                            <span className="story-date">
                                                {doc.createdAt?.seconds 
                                                    ? new Date(doc.createdAt.seconds * 1000).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) 
                                                    : 'Winter'}
                                            </span>
                                        </div>
                                        <h3 className="story-card-title">Story {documents.length - index}</h3>
                                        <p className="story-card-preview">“{preview}”</p>
                                        <a href={`/paststoryviewer/${doc.id}`} className="story-read-btn">
                                            📖 Read Full Story
                                        </a>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-dashboard-container">
                                <span className="empty-icon">❄️</span>
                                <h3>No stories yet!</h3>
                                <p>You haven't contributed to any winter flurries yet. Head back to the writing workspace to start your first story!</p>
                                <a className="start-story-cta-btn" href="/">
                                    Create a New Story
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PastStory;
