import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import "../styles/Posting.css"
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

function PostEditPage() {

    const MAX_LENGTH = 20000

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const quillRef = useRef(null);
    const [charCount, setCharCount] = useState(0);

    const getInitialCharCount = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent.length || 0;
    };

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('image', file);

            const loadingToast = toast.loading("Image uploading...");

            try {
                // Sadece resim yükleyen rotamıza istek atıyoruz
                const res = await api.post('/posts/upload-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const imageUrl = res.data.url;

                const quill = quillRef.current.getEditor();
                const range = quill.getSelection();
                quill.insertEmbed(range ? range.index : 0, 'image', imageUrl);

                toast.success("Image Uploaded", { id: loadingToast });

            } catch (error) {
                console.error("Error:", error);
                toast.error("Image upload error", { id: loadingToast });
            }
        };
    }

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), []);

    const { id } = useParams();

    const handleContentChange = (value, delta, source, editor) => {
        setContent(value);
        setCharCount(editor.getLength() - 1);
    };

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                const response = await api.get(`/posts/${id}`);
                setTitle(response.data.title);
                setContent(response.data.content);

                setCharCount(getInitialCharCount(response.data.content));

                if (response.data.tags && Array.isArray(response.data.tags)) {
                    setTags(response.data.tags.join(", "));
                }
                setIsLoading(false)
            } catch (error) {
                console.error("Error:", error);
                setError("Post data could not be loaded.");
                toast.error(error.message || "Error")
                setIsLoading(false);
            }
        }
        fetchPostData();
    }, [id])

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (charCount > MAX_LENGTH) {
            toast.error(`Content is too long! Limit: ${MAX_LENGTH}`);
            return;
        }

        setIsLoading(true);
        setError(null);

        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
        try {
            await api.put(`/posts/${id}`, {
                title: title,
                content: content,
                tags: tagsArray
            });
            toast.success("Post Updated")

            navigate(`/posts/${id}`);

        } catch (error) {
            console.error("Error:", error);
            setError(error.response ? error.response.data.message : "Error.");
            toast.error(error.message || "Error")
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }

    const isOverLimit = charCount > MAX_LENGTH;

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
                        <input className='form-input' type="text" id='title' value={title} onChange={(e) => { setTitle(e.target.value) }} maxLength={40} required />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="tags">Tags (seperate with commas(,))</label>
                        <input className='form-input' type="text" id='tags' placeholder='Tag1, tag2, tag3...' value={tags} onChange={(e) => { setTags(e.target.value) }} />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="content">Content</label>
                        <ReactQuill
                            ref={quillRef}
                            theme='snow'
                            value={content}
                            onChange={handleContentChange}
                            className='editor-input'
                            modules={modules}
                        />
                        <div className={`char-counter ${isOverLimit ? 'limit-exceeded' : ''}`}>
                            {charCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()} characters
                        </div>
                    </div>

                    {error && <div className="form-error">{error}</div>}

                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading || isOverLimit} style={{ opacity: (isLoading || isOverLimit) ? 0.6 : 1 }}>
                            Share
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PostEditPage
