import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import "../styles/Posting.css"
import toast from 'react-hot-toast';

function PostEditPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const { id } = useParams();

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                const response = await api.get(`/posts/${id}`);
                setTitle(response.data.title);
                setContent(response.data.content);
                if(response.data.tags && Array.isArray(response.data.tags)){
                    setTags(response.data.tags.join(", "));
                }
                setIsLoading(false)
            } catch (error) {
                console.error("Error:", error);
                setError("Post data could not be loaded.");
                toast.error(error)
                setIsLoading(false);
            }
        }
        fetchPostData();
    }, [id])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
        try {
            await api.put(`/posts/${id}`, {
                title: title,
                content: content,
                tags : tagsArray
            });
            toast.success("Post Updated")

            navigate(`/posts/${id}`);

        } catch (error) {
            console.error("Error:", error);
            setError(error.response ? error.response.data.message : "Error.");
            toast.error(error)
            setIsLoading(false);
        }finally{
            setIsLoading(false);
        }
    }
    if (isLoading && !title) {
        return <p>Loading...</p>;
    }
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
    return (
        <div className='post-form-container'>
            <div className='post-form-card'>
                <h1 className='post-form-title'>Edit Your Post</h1>

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor="title">Title</label>
                        <input className='form-input' type="text" id='title' value={title} onChange={(e) => { setTitle(e.target.value) }} required />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="tags">Tags (seperate with commas)</label>
                        <input className='form-input' type="text" id='tags' placeholder='Tag1, tag2, tag3...' value={tags} onChange={(e)=>{setTags(e.target.value)}} />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="content">Content</label>
                        <textarea className="form-textarea" id="content" value={content} onChange={(e) => { setContent(e.target.value) }} required></textarea>
                    </div>

                    {error && <div className="form-error">{error}</div>}

                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            Share
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PostEditPage
