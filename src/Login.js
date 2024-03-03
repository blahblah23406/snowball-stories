import './Login.css';
import { getAuth, signInWithRedirect, onAuthStateChanged } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import {useEffect, useState} from "react";
import firebase from "firebase/compat/app";
import WritingPage from "./WritingPage";
import Snowflake from './Snowflake';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCZ9Eia_8WUjVwHeLO-2CwOSketMB_Cwhs",
    authDomain: "snowball-stories.firebaseapp.com",
    projectId: "snowball-stories",
    storageBucket: "snowball-stories.appspot.com",
    messagingSenderId: "874662831073",
    appId: "1:874662831073:web:8ed4031c527b263a0568a0",
    measurementId: "G-XR3N6JDFZK"
};

firebase.initializeApp(firebaseConfig);

function Login() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [snowflakes, setSnowflakes] = useState([]);

    useEffect(() => {
        const auth = getAuth();
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
        const auth = getAuth();
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