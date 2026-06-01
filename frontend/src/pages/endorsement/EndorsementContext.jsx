// src/pages/endorsement/EndorsementContext.jsx
import React, { createContext, useContext, useState } from "react";
import { DUMMY_ENDORSEMENTS } from "./new-requests/NewRequests";

const EndorsementContext = createContext();

export const EndorsementProvider = ({ children }) => {
  const [activeRequests, setActiveRequests] = useState(DUMMY_ENDORSEMENTS);
  const [transferredItems, setTransferredItems] = useState([]);

  const addTransferred = (item) => {
    // 1. Add to transferred
    setTransferredItems(prev => [...prev, item]);
    // 2. Remove from active
    setActiveRequests(prev => prev.filter(e => e.id !== item.id));
  };

  const updateTransferred = (updatedItem) => {
    setTransferredItems(prev => 
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  };

  return (
    <EndorsementContext.Provider value={{ activeRequests, transferredItems, addTransferred, updateTransferred }}>
      {children}
    </EndorsementContext.Provider>
  );
};

export const useEndorsementContext = () => useContext(EndorsementContext);