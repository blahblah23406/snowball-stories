import React from 'react';
import './Snowflake.css';

const Snowflake = ({ left, top}) => {
    return (
        <img
            className="snowflake"
            src="/snowflake-svgrepo-com%20(3).svg"
            alt="Snowflake"
            style={{left, top}}
        />
    );
};

export default Snowflake;
