import React from 'react'
import { Link } from 'react-router-dom'
import "../styles/Posting.css"

function NotFoundPage() {
    return (
        <div className="post-form-container" style={{ textAlign: 'center', marginTop: '50px' }}>
            <div className="post-form-card" style={{ padding: '60px 20px' }}>

                <h1 style={{ fontSize: '4rem', margin: 0, color: '#e74d3c8b' }}>404</h1>

                <h2 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>
                    Page Not Found
                </h2>

                <p style={{ color: '#666', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 30px auto' }}>
                    The page you are looking for has been deleted or its name has been changed.
                </p>

                <Link to="/" className="submit-btn" style={{ textDecoration: 'none', padding: '12px 30px', display: 'inline-block' }}>
                    Return to Home
                </Link>

            </div>
        </div>
    )
}

export default NotFoundPage
