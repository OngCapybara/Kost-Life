import React, { useState } from 'react';
import { auth } from '../firebase'; // Import objek auth dari firebase
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'; // Metode Firebase
import Swal from 'sweetalert2';
import '../styles/ProfileSettings.css'; // File CSS baru

export default function ProfileSettings() {
    const user = auth.currentUser;

    // State untuk Edit Profile
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    // State untuk Change Password
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    // --- 1. Fungsi Edit Profile ---
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!user) return;
        setIsProfileLoading(true);

        try {
            // Cek apakah ada perubahan nama
            if (displayName !== user.displayName) {
                await updateProfile(user, { displayName });
            }

            // Cek apakah ada perubahan email
            if (email !== user.email) {
                await updateEmail(user, email);
                // Catatan: Setelah updateEmail, pengguna harus memverifikasi email baru.
            }

            Swal.fire({
                icon: 'success',
                title: 'Profil Berhasil Diperbarui!',
                text: 'Nama dan Email Anda telah diperbarui.',
                background: '#2c2c2c',
                color: '#f0f0f0',
                customClass: { popup: 'swal-custom-popup' }
            });

        } catch (error) {
            console.error("Gagal update profile:", error);
            
            // Handle error spesifik Firebase
            let errorMessage = "Terjadi kesalahan saat memperbarui profil.";
            if (error.code === 'auth/requires-recent-login') {
                errorMessage = "Mohon logout dan login kembali untuk memperbarui email.";
            }

            Swal.fire({
                icon: 'error',
                title: 'Update Gagal!',
                text: errorMessage,
                background: '#2c2c2c',
                color: '#f0f0f0',
                customClass: { popup: 'swal-custom-popup' }
            });
        } finally {
            setIsProfileLoading(false);
        }
    };

    // --- 2. Fungsi Ganti Password ---
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!user || user.providerData[0].providerId === 'google.com' || user.providerData[0].providerId === 'facebook.com') {
            Swal.fire({
                icon: 'info',
                title: 'Tidak Diizinkan',
                text: 'Pengguna yang login melalui penyedia eksternal (Google/Facebook) harus mengganti kata sandi melalui penyedia tersebut.',
                background: '#2c2c2c',
                color: '#f0f0f0',
                customClass: { popup: 'swal-custom-popup' }
            });
            return;
        }

        if (newPassword.length < 6) {
            Swal.fire({
                icon: 'warning',
                title: 'Kata Sandi Baru Terlalu Pendek',
                text: 'Kata sandi baru harus memiliki minimal 6 karakter.',
                background: '#2c2c2c',
                color: '#f0f0f0',
                customClass: { popup: 'swal-custom-popup' }
            });
            return;
        }

        setIsPasswordLoading(true);

        try {
            // Langkah 1: Re-autentikasi pengguna menggunakan kata sandi saat ini
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            
            // Langkah 2: Ganti Kata Sandi
            await updatePassword(user, newPassword);

            Swal.fire({
                icon: 'success',
                title: 'Kata Sandi Berhasil Diganti!',
                text: 'Kata sandi Anda telah diperbarui.',
                background: '#2c2c2c',
                color: '#f0f0f0',
                customClass: { popup: 'swal-custom-popup' }
            });

            // Reset formulir
            setCurrentPassword('');
            setNewPassword('');

        } catch (error) {
            console.error("Gagal ganti password:", error);
            
            let errorMessage = "Terjadi kesalahan saat mengganti kata sandi.";
            if (error.code === 'auth/wrong-password') {
                errorMessage = "Kata sandi saat ini salah. Mohon periksa kembali.";
            } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = "Demi keamanan, Anda harus login ulang sebelum mengganti kata sandi.";
            }

            Swal.fire({
                icon: 'error',
                title: 'Gagal Ganti Kata Sandi!',
                text: errorMessage,
                background: '#2c2c2c',
                color: '#f0f0f0',
                customClass: { popup: 'swal-custom-popup' }
            });

        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <div className="profile-settings-container">
            {/* --- Bagian 1: Edit Profil --- */}
            <section className="setting-card">
                <h2>Edit Detail Profil</h2>
                <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                        <label htmlFor="displayName">Nama Pengguna:</label>
                        <input
                            id="displayName"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled // Email memerlukan re-autentikasi, sebaiknya disabled atau beri peringatan keras
                        />
                        <small>Untuk alasan keamanan, perubahan email membutuhkan login ulang.</small>
                    </div>
                    <button type="submit" className="save-button" disabled={isProfileLoading}>
                        {isProfileLoading ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
                    </button>
                </form>
            </section>

            {/* --- Bagian 2: Ganti Kata Sandi --- */}
            <section className="setting-card">
                <h2>Ganti Kata Sandi</h2>
                <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Kata Sandi Saat Ini:</label>
                        <input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">Kata Sandi Baru (Min. 6 Karakter):</label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="change-pw-button" disabled={isPasswordLoading}>
                        {isPasswordLoading ? 'Memproses...' : 'Ganti Kata Sandi'}
                    </button>
                </form>
            </section>
        </div>
    );
}