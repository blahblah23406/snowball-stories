import React from 'react';
import './Snowflake.css';

const Snowflake = ({ left, top, size = '15px', delay = '0s', duration = '10s', opacity = 0.8 }) => {
    return (
        <img
            className="snowflake"
            src="/snowflake-svgrepo-com_3.svg"
            alt="Snowflake"
            style={{
                left,
                top,
                width: size,
                height: size,
                animationDelay: delay,
                animationDuration: duration,
                opacity: opacity
            }}
        />
    );
};

export default Snowflake;
