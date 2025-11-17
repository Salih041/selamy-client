import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';


function PostEditPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
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
            } catch (error) {
                console.error("Error:", err);
                setError("Post data could not be loaded.");
                setIsLoading(false);
            }
        }
        fetchPostData();
    }, [id])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await api.put(`/posts/${id}`, {
                title: title,
                content: content
            });

            navigate(`/posts/${id}`);

        } catch (error) {
            console.error("Error:", error);
            setError(error.response ? error.response.data.message : "Error.");
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
        <div>
            <h1>Postu Düzenle</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Başlık:</label>
                    <input
                        type="text"
                        id="title"
                        value={title} // State'ten gelen dolu veri
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content">İçerik:</label>
                    <textarea
                        id="content"
                        value={content} // State'ten gelen dolu veri
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows="10"
                    />
                </div>

                <button type="submit" disabled={!isLoading}>
                    {!isLoading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
            </form>
        </div>
    );
}

export default PostEditPage
