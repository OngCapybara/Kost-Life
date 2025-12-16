import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, onIdTokenChanged } from 'firebase/auth'; // ✅ Gunakan onIdTokenChanged
import { auth } from '../firebase'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const REFRESH_INTERVAL_MS = 1000 * 60 * 50; // Refresh token setiap 50 menit

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    // 🔹 1. Setup Awal Sesi dan Monitor Token
    useEffect(() => {
        // onIdTokenChanged lebih baik untuk memantau perubahan status autentikasi dan token
        const unsubscribe = onIdTokenChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe; 
    }, []);

    // 🔹 2. Logic Refresh Token Proaktif (Timer)
    useEffect(() => {
        let intervalId;

        const startRefreshTimer = (user) => {
            const forceTokenRefresh = () => {
                console.log("AuthProvider: Memaksa refresh Firebase ID Token...");
                user.getIdToken(true) // Memaksa refresh token
                    .catch(error => {
                        console.error("Gagal refresh ID Token:", error);
                    });
            };

            // Jalankan refresh pertama kali
            forceTokenRefresh();

            // Atur interval
            intervalId = setInterval(forceTokenRefresh, REFRESH_INTERVAL_MS);
        };

        if (currentUser) {
            startRefreshTimer(currentUser);
        }

        // Cleanup: Hapus interval saat user logout atau AuthProvider unmount
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [currentUser]); 

    const value = {
        currentUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} 
            {loading && <div className="loading-screen">Memuat sesi...</div>}
        </AuthContext.Provider>
    );
};