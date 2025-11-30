import React from 'react';
import '../styles/Footer.css';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

function Footer() {
    const currentYear = new Date().getFullYear();
    const version = "v1.5.0";
    return (
        <footer className="footer">
            <div className="footer-content">

                <div className="footer-left">
                    <p>&copy; {currentYear} SelamY</p>
                    <span className="footer-version">{version}</span>
                </div>

                <div className="footer-right">
                    <span className="footer-developer">Developed by <strong>Salih</strong></span>

                    <div className="footer-socials">
                        <a href="https://www.github.com/Salih041" target="_blank" rel="noopener noreferrer" title="GitHub">
                            <FaGithub />
                        </a>
                        <a href="https://www.linkedin.com/in/salihozbk41" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                            <FaLinkedin />
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    )
}

export default Footer
