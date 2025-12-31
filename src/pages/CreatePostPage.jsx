import React, { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from "../api"
import "../styles/Posting.css"
import toast from 'react-hot-toast'
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

function CreatePostPage() {
    const MAX_LENGTH = 20000;
    const MIN_LENGTH = 200;
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [statu, setStatu] = useState("published");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const quillRef = useRef(null);
    const [charCount, setCharCount] = useState(0);

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
                const res = await api.post('/posts/upload-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const imageUrl = res.data.url;

                const quill = quillRef.current.getEditor();
                const range = quill.getSelection();
                quill.insertEmbed(range.index, 'image', imageUrl);

                toast.success("Image Uploaded", { id: loadingToast });


            } catch (error) {
                console.error("Error:", error);
                toast.error("Image upload error", { id: loadingToast });
            }
        }
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
    }), [])

    const handleContentChange = (value, delta, source, editor) => {
        setContent(value);
        setCharCount(editor.getLength() - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (charCount < MIN_LENGTH) {
            toast.error(`Content is too short! Minimum: ${MIN_LENGTH}`);
            return;
        }
        if (charCount > MAX_LENGTH) {
            toast.error(`Content is too long! Limit: ${MAX_LENGTH}`);
            return;
        }

        const tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag !== "");
        if(tagsArray.length > 15){
            toast.error('Too many tags(max:15)');
            return;
        }
        const isTagTooLong = tagsArray.some(tag=>tag.length > 20);
        if(isTagTooLong){
            toast.error('Some tags are too long (max:20 char)');
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const response = await api.post("/posts", {
                title: title,
                content: content,
                tags: tagsArray,
                statu: statu
            });
            toast.success("Post Created");
            const savedPost = response.data.savedPost;
            navigate(`/posts/${savedPost.slug || savedPost._id}`)
        } catch (error) {
            console.error("Create Post error :", error)
            const errorMessage = error.response?.data?.message || error.message || "Post couldnt be created";
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    const isInvalidLength = charCount < MIN_LENGTH || charCount > MAX_LENGTH;

    return (
        <div className='post-form-container'>
            <div className='post-form-card'>
                <h1 className='post-form-title'>Create New Post</h1>

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor="title">Title</label>
                        <input className='form-input' type="text" id='title' value={title} onChange={(e) => { setTitle(e.target.value) }} maxLength={40} placeholder='Title (max 40 characters)' required />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="tags">Tags (seperate with commas ',')</label>
                        <input className='form-input' type="text" id='tags' placeholder='Tag1, tag2, tag3...' value={tags} onChange={(e) => { setTags(e.target.value) }} />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="content">Content</label>
                        <ReactQuill
                            ref={quillRef}
                            theme='snow'
                            value={content}
                            onChange={handleContentChange}
                            modules={modules}
                            placeholder='Write'
                            className='editor-input'
                        />
                        <div className={`char-counter ${charCount > MAX_LENGTH
                            ? 'limit-exceeded'
                            : (charCount < MIN_LENGTH ? 'under-limit' : '')
                            }`}>
                            {charCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
                        </div>
                    </div>

                    {error && <div className="form-error">{error}</div>}
                    <div className='form-group'>
                        <label>Statu: </label>
                        <select value={statu} onChange={(e) => setStatu(e.target.value)}>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={() => navigate("/")}
                        >
                            Cancel
                        </button>

                        <button type="submit" className="submit-btn" disabled={isLoading || isInvalidLength} style={{ opacity: (isLoading || isInvalidLength) ? 0.6 : 1 }}>
                            {statu === 'draft' ? 'Save Draft' : isLoading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreatePostPage
