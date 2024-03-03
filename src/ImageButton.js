// ImageButton.js

import React from 'react';
import './ImageButton.css'

function ImageButton({ imageUrl, onClick, text }) {
    return (
        <button onClick={onClick} className="image-button">
            <img src={imageUrl} alt="Button"/>
            <span className="button-text">{text}</span>
        </button>
    );
}

export default ImageButton;
