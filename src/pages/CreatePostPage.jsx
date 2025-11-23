import React, { useState , useMemo, useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import api from "../api"
import "../styles/Posting.css"
import toast from 'react-hot-toast'
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

function CreatePostPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const quillRef = useRef(null);

    const imageHandler = ()=>{
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async ()=>{
            const file = input.files[0];
            if(!file) return;

            const formData = new FormData();
            formData.append('image', file);

            const loadingToast = toast.loading("Image uploading...");

            try{
                const res = await api.post('/posts/upload-image',formData, {
                    headers:{'Content-Type' : 'multipart/form-data'}
                });

                const imageUrl = res.data.url;

                const quill = quillRef.current.getEditor();
                const range = quill.getSelection();
                quill.insertEmbed(range.index, 'image', imageUrl);

                toast.success("Image Uploaded", { id: loadingToast });


            }catch(error)
            {
                console.error("Error:", error);
                toast.error("Image upload error", { id: loadingToast });
            }
        }
    }

    const modules = useMemo(()=>({
        toolbar : {
            container : [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers : {
                image:imageHandler
            }
        }
    }),[])


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");

        try {
            const response = await api.post("/posts", {
                title: title,
                content: content,
                tags: tagsArray
            });
            toast.success("Post Created");
            const newPostId = response.data.savedPost._id;
            navigate(`/posts/${newPostId}`)
        } catch (error) {
            console.error("Create Post error :", error)
            setError(error.response ? error.response.data.message : "Post could not be created!");
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='post-form-container'>
            <div className='post-form-card'>
                <h1 className='post-form-title'>Create New Post</h1>

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor="title">Title</label>
                        <input className='form-input' type="text" id='title' value={title} onChange={(e) => { setTitle(e.target.value) }} placeholder='Title' required />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="tags">Tags (seperate with commas)</label>
                        <input className='form-input' type="text" id='tags' placeholder='Tag1, tag2, tag3...' value={tags} onChange={(e) => { setTags(e.target.value) }} />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="content">Content</label>
                        <ReactQuill
                            ref={quillRef}
                            theme='snow'
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            placeholder='Write'
                            className='editor-input'
                        />
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
    )
}

export default CreatePostPage
