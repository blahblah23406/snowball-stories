import './Login.css';
import React, { useEffect, useState } from 'react';
import { signInWithRedirect, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
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
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const generateSnowflakes = () => {
            const count = 200;
            const newSnowflakes = Array.from({ length: count }, () => ({
                left: `${Math.random() * window.innerWidth}px`,
                top: `${Math.random() * window.innerHeight}px`
            }));
            setSnowflakes(newSnowflakes);
        };

        generateSnowflakes();
        window.addEventListener('resize', generateSnowflakes);

        return () => {
            window.removeEventListener('resize', generateSnowflakes);
        };
    }, []);

    const handleLogin = () => {
        signInWithRedirect(auth, googleProvider);
    };

    if (isLoading) {
        return <div className="loading-container">Loading...</div>;
    }

    return (
        <div>
            {user ? (
                <WritingPage user={user} />
            ) : (
                <div>
                    {snowflakes.map((flake, index) => (
                        <Snowflake key={index} left={flake.left} top={flake.top} />
                    ))}
                    <div className="widget center-align">
                        <h1>Snowball Stories!</h1>
                        <button className="button-large" onClick={handleLogin}>Login with Google</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;