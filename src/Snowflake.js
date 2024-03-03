import React from 'react';
import './Snowflake.css';

const Snowflake = ({ left, top}) => {
    return (
        <img
            className="snowflake"
            src="/snowflake-svgrepo-com_3.svg"
            alt="Snowflake"
            style={{left, top}}
        />
    );
};

export default Snowflake;
