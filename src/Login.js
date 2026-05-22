import './Login.css';
import React, { useEffect, useState } from 'react';
import { auth, googleProvider, signInWithRedirect, onAuthStateChanged } from './firebase';
import WritingPage from './WritingPage';
import Snowflake from './Snowflake';

function Login() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [snowflakes, setSnowflakes] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
        });
        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, []);

    useEffect(() => {
        const generateSnowflakes = () => {
            const count = 80; // Optimized count for beautiful, high-performance rendering
            const newSnowflakes = Array.from({ length: count }, () => {
                const sizeVal = Math.floor(Math.random() * 14) + 8; // 8px to 22px
                const delayVal = (Math.random() * -15).toFixed(2); // Negative delay so they are instantly scattered
                const durationVal = (Math.random() * 8 + 7).toFixed(2); // 7s to 15s speed
                const opacityVal = (Math.random() * 0.55 + 0.3).toFixed(2); // 0.3 to 0.85 opacity
                const leftPercent = (Math.random() * 100).toFixed(2);
                
                return {
                    left: `${leftPercent}%`,
                    size: `${sizeVal}px`,
                    delay: `${delayVal}s`,
                    duration: `${durationVal}s`,
                    opacity: parseFloat(opacityVal)
                };
            });
            setSnowflakes(newSnowflakes);
        };

        generateSnowflakes();
    }, []);

    const handleLogin = () => {
        signInWithRedirect(auth, googleProvider);
    };

    if (isLoading) {
        return (
            <div className="login-loading-screen">
                <div className="loading-spinner"></div>
                <p>Entering the winter wonderland...</p>
            </div>
        );
    }

    return (
        <div>
            {user ? (
                <WritingPage user={user} />
            ) : (
                <div className="login-page-wrapper">
                    <div className="snow-overlay">
                        {snowflakes.map((flake, index) => (
                            <Snowflake 
                                key={index} 
                                left={flake.left} 
                                top="-20px" 
                                size={flake.size}
                                delay={flake.delay}
                                duration={flake.duration}
                                opacity={flake.opacity}
                            />
                        ))}
                    </div>
                    <div className="login-glass-card center-align">
                        <div className="card-sparkle"></div>
                        <div className="winter-icon">❄️</div>
                        <h1 className="brand-title">Snowball Stories!</h1>
                        <p className="brand-subtitle">Cooperative writing, one flurry at a time.</p>
                        
                        <button className="google-signin-btn" onClick={handleLogin}>
                            <svg className="google-icon" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.56h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48c0,-0.6 -0.05,-1.17 -0.15,-1.68Z" fill="#4285F4" />
                                    <path d="M12,20.72c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.56c-0.9,0.6 -2.07,0.98 -3.3,0.98c-2.34,0 -4.33,-1.58 -5.03,-3.72H2.9v2.66c1.49,2.97 4.57,5.02 8.1,5.02Z" fill="#34A853" />
                                    <path d="M6.97,13.24c-0.18,-0.54 -0.28,-1.12 -0.28,-1.72c0,-0.6 0.1,-1.18 0.28,-1.72V7.14H2.9c-0.6,1.2 -0.94,2.56 -0.94,4c0,1.44 0.34,2.8 0.94,4l4.07,-3.16Z" fill="#FBBC05" />
                                    <path d="M12,6.78c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,4.09 14.43,3.28 12,3.28c-3.53,0 -6.61,2.05 -8.1,5.02l4.07,3.16c0.7,-2.14 2.69,-3.72 5.03,-3.72Z" fill="#EA4335" />
                                </g>
                            </svg>
                            <span className="btn-text">Sign in with Google</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;