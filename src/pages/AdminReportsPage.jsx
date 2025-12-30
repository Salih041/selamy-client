import React, { useState, useEffect } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { NavLink, useNavigate } from 'react-router-dom'
import { formatRelativeTime } from '../utils/dateFormater'
import "../styles/AdminReportsPage.css"
import DOMPurify from "dompurify"

function AdminReportsPage() {

    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { isAdmin , logout} = useAuth();

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/report");
            setReports(response.data);
        } catch (error) {
            console.error("Failed to fetch reports ", error);
            if(error.response && (error.response.status === 403 || error.response.status === 401)){
                toast.error("Unauthorized Access!");
                logout();
                navigate("/login");
                return;
            }
            toast.error("Failed to Fetch Reports");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!isAdmin) {
            navigate("/");
            return;
        }
        fetchReports();
    }, [isAdmin, navigate]);

    const handleResolveReport = async (reportId) => {
        if (!window.confirm("Are you sure you want to mark this report as resolved and delete?")) return;

        try {
            await api.delete(`/report/${reportId}`);
            setReports(prev => prev.filter(r => r._id !== reportId));
            toast.success("Report Resolved");
        } catch (error) {
            toast.error("Failed to resolve");
        }
    };

    const getTargetLink = (report) => {
        if (report.targetType === 'Post') return `/posts/${report.target}`;
        if (report.targetType === 'User') return `/profile/${report.target}`;
        if (report.targetType === 'Comment') return `/posts/${report.targetPost._id}`;
        return "/";
    }


    if (isLoading) return <div>Loading Reports...</div>;
    return (
        <div className='admin-reports-container'>
            <h1>🛡️ Admin Report Dashboard</h1>

            {
                reports.length === 0 ?
                    <div className='empty-state'>
                        <h3>Empty</h3>
                    </div> :
                    (
                        <div className='table-responsive'>
                            <table className='reports-table'>
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Reason</th>
                                        <th>Description</th>
                                        <th>Reporter</th>
                                        <th>Target ID/Link</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        reports.map(report => (
                                            <tr key={report._id}>
                                                <td>
                                                    <div className='type-badge'>
                                                        <span>{report.targetType}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className='report-reason'>{DOMPurify.sanitize(report.reason, { ALLOWED_TAGS: [] })}</span>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        maxHeight: '100px',
                                                        overflowY: 'auto',
                                                        whiteSpace: 'pre-wrap'
                                                    }}>{DOMPurify.sanitize(report.description, { ALLOWED_TAGS: [] })}</span>
                                                </td>
                                                <td>
                                                    {
                                                        report.reporter ? (<NavLink className="reporter-link" to={`/profile/${report.reporter._id}`}>
                                                            @{report.reporter.username}
                                                        </NavLink>) : "Anonymous"
                                                    }
                                                </td>
                                                <td>
                                                    <NavLink className="view-content-btn" to={getTargetLink(report)} target='_blank' rel='noopener noreferrer'>
                                                        View Content
                                                    </NavLink>
                                                    <div className='tiny-id'>{report.target}</div>
                                                </td>
                                                <td>{formatRelativeTime(report.createdAt)}</td>
                                                <td>
                                                    <div className='action-buttons'>
                                                        <button className='btn-resolve' onClick={() => { handleResolveReport(report._id) }} title='Resolve Report'>Resolve</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    )
            }

        </div>
    )
}

export default AdminReportsPage
