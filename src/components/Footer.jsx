import React from 'react';
import '../styles/Footer.css';

export default function Footer() {
    return (
        <footer className="app-footer">
            <p>&copy; {new Date().getFullYear()} Kost-Life Project | Developed by Ong Capybara</p>
            <div>
                <a href="https://saweria.co/Ongcapybara" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="saweria-link"
                >
                    Support me :)
                </a>
            </div>
        </footer>
    );
}