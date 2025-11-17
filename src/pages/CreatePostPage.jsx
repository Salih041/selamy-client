import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from "../api"

function CreatePostPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post("/posts", {
                title: title,
                content: content
            });
            const newPostId = response.data.savedPost._id;
            navigate(`/posts/${newPostId}`)
        } catch (error) {
            console.error("Create Post error :", error)
            setError(error.response ? error.response.data.message : "Post could not be created!");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <h1>Create New Post</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content">Contento:</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows="10"
                    />
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? '...' : 'Share'}
                </button>
            </form>
        </div>
    )
}

export default CreatePostPage
