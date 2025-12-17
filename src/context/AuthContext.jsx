import React, { createContext, useContext, useState, useEffect, useRef } from 'react'; // ✅ Import useRef
import { onIdTokenChanged } from 'firebase/auth'; 
import { auth } from '../firebase'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const REFRESH_INTERVAL_MS = 1000 * 60 * 50; 

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    // ✅ GUNAKAN useRef untuk menyimpan ID interval di luar scope
    const intervalRef = useRef(null); 

    // 🔹 1. Setup Awal Sesi (Sama, Sudah Benar)
    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe; 
    }, []);

    // 🔹 2. Logic Refresh Token Proaktif (Timer) - DIREVISI
    useEffect(() => {
        // Hapus interval lama sebelum membuat yang baru
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (currentUser) {
            const user = currentUser; // Pastikan menggunakan objek user terbaru

            const forceTokenRefresh = () => {
                console.log("AuthProvider: Memaksa refresh Firebase ID Token...");
                user.getIdToken(true) 
                    .catch(error => {
                        console.error("Gagal refresh ID Token:", error);
                    });
            };
            
            // 1. Jalankan refresh pertama kali
            forceTokenRefresh();

            // 2. Atur interval baru dan simpan ID-nya di useRef
            const newIntervalId = setInterval(forceTokenRefresh, REFRESH_INTERVAL_MS);
            intervalRef.current = newIntervalId; // ✅ Simpan ID di ref

        }

        // Cleanup: Hapus interval saat effect dijalankan lagi, atau komponen unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current); // ✅ Cleanup menggunakan ref
                intervalRef.current = null;
            }
        };
    }, [currentUser]); // Dependency Array: [currentUser]

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