// Modal.js
import React from 'react';
import './Modal.css'; // Optional, if you want to style the modal

const Modal = ({ isOpen, onClose, objectName, objectProperties }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Properties for: {objectName}</h3>
        <ul>
          {objectProperties?.map((prop, idx) => (
            <li key={idx}>
              {prop.field}: {prop.value}
            </li>
          ))}
        </ul>
        <button className="close-modal-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
