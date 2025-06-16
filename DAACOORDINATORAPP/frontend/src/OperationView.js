// src/OperationView.js
import React from 'react';
import './OperationView.css';

const OperationView = ({ onClose }) => {
    return (
        <div className="operation-overlay">
            <div className="operation-content">
                <button className="close-btn" onClick={onClose}>X</button>
                <h1>Operation View</h1>
                <p>This will be the overlay for new</p>
            </div>
        </div>
    );
};

export default OperationView;