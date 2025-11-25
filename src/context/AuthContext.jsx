// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // Status loading global

    useEffect(() => {
        // Langganan (subscribe) ke status autentikasi Firebase
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false); // Sesi sudah terverifikasi
        });

        return unsubscribe; // Cleanup function
    }, []);

    const value = {
        currentUser,
        loading
    };

    // Render children hanya setelah status loading selesai
    return (
        <AuthContext.Provider value={value}>
            {!loading && children} 
            {loading && <div className="loading-screen">Memuat sesi...</div>}
        </AuthContext.Provider>
    );
};