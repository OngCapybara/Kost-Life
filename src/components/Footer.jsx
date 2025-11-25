import React from 'react';
import '../styles/Footer.css';

export default function Footer() {
    return (
        <footer className="app-footer">
            <p>&copy; {new Date().getFullYear()} Kost-Life Project | Developed by Ong Capybara. All rights reserved.</p>
        </footer>
    );
}