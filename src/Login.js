import './Login.css';
import { signInWithRedirect, onAuthStateChanged } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import {useEffect, useState} from "react";
import { auth } from "./firebase";
import WritingPage from "./WritingPage";
import Snowflake from './Snowflake';

function Login() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [snowflakes, setSnowflakes] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const generateSnowflakes = () => {
            const newSnowflakes = [];
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            // Generate new snowflakes
            while (newSnowflakes.length < 200) {
                const left = `${Math.random() * screenWidth}px`;
                const top = `${Math.random() * screenHeight}px`;
                newSnowflakes.push({ left, top });
            }
            setSnowflakes(newSnowflakes);
        };

        // Generate snowflakes when the component mounts
        generateSnowflakes();

        // Add event listener to window for resizing
        window.addEventListener('resize', generateSnowflakes);

        // Clean up event listener on component unmount
        return () => {
            window.removeEventListener('resize', generateSnowflakes);
        };
    }, []);

    const handleClick = () => {
        console.log('Button clicked!');
        const provider = new GoogleAuthProvider();
        signInWithRedirect(auth, provider);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {user ? (
                <WritingPage user={user} />
            ) : (
                <div>
                    {snowflakes.map((flake, index) => (
                        <Snowflake key={index} left={flake.left} top={flake.top}/>
                    ))}
                    <div className="widget center-align">
                        <h1>Snowball Stories!</h1>
                        <button className="button-large" onClick={handleClick}>Login with Google</button>
                    </div>
                </div>

            )}
        </div>
    );
}

export default Login;