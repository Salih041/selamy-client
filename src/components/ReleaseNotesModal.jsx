import { useState, useEffect } from 'react';
import {releaseNotes} from "../ReleaseNotes";
import {FaTimes } from 'react-icons/fa';
import { CgNotes } from "react-icons/cg";
import "../styles/ReleaseNotesModal.css"

const ReleaseNotes = ()=>{
    const [isOpen, setIsOpen] = useState(false);
    const [hasNewUpdate, setHasNewUpdate] = useState(false);

    const latestVersion = releaseNotes[0]?.version;

    useEffect(()=>{
        const lastSeenVersion = localStorage.getItem('last_seen_release');
        if (lastSeenVersion !== latestVersion) {
            setHasNewUpdate(true);
        }

    }, [latestVersion]);

    const handleOpen = ()=>{
        setIsOpen(true);
        setHasNewUpdate(false);
        localStorage.setItem('last_seen_release', latestVersion);
    }

    const getBadgeClass = (type) => {
        switch (type) {
            case 'feature': return 'rn-badge rn-feat';
            case 'fix': return 'rn-badge rn-fix';
            default: return 'rn-badge rn-default';
        }
    };

    return (
        <>
            <button className="rn-floating-btn" onClick={handleOpen} aria-label="Release Notes">
                <CgNotes size={24} />
                {hasNewUpdate && <span className="rn-notification-dot"></span>}
            </button>

            {isOpen && (
                <div className="rn-overlay" onClick={() => setIsOpen(false)}>
                    <div className="rn-modal" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="rn-header">
                            <h2>What's New</h2>
                            <button className="rn-close-btn" onClick={() => setIsOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="rn-content">
                            {releaseNotes.map((release, index) => (
                                <div key={index} className={`rn-version-item ${index === 0 ? 'rn-latest' : ''}`}>
                                    <div className="rn-version-header">
                                        <span className="rn-version-tag">{release.version}</span>
                                        <span className="rn-date">{release.date}</span>
                                        {index === 0 && <span className="rn-new-label">NEW</span>}
                                    </div>
                                    <h3 className="rn-title">{release.title}</h3>
                                    
                                    <ul className="rn-list">
                                        {release.items.map((item, idx) => (
                                            <li key={idx}>
                                                <span className={getBadgeClass(item.type)}>
                                                    {item.type.toUpperCase()}
                                                </span>
                                                <span className="rn-text">{item.content}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="rn-footer">
                            SelamY
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ReleaseNotes;