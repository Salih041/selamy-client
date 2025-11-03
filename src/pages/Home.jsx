import React, {useState,useEffect} from 'react'
import api from '../../api';
import { Link } from 'react-router-dom';
import Post from '../components/Post';

function Home() {

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, limit:20, totalResults: 0})
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null)

    useEffect(()=>{
        const fetchPosts = async ()=>{
            try{
                setIsLoading(true);
                setError(null);

                const response = await api.get(`/posts?page=${page}&limit=20`);
                setPosts(response.data.data);
                setPagination(response.data.pagination)
            }catch(error){
                console.log("error : " ,error);
                setError(error.response ? error.response.data.message : error.message);
            }finally{
                setIsLoading(false);
            }
        }
        fetchPosts();
    },[page])

    if (isLoading) return <p>LOading...</p>;
    if (error) return <p>Error: {error}</p>;
    return (
        <div>
            {
                posts.map((post)=>(
                    <Post key={post._id} postProps={post}></Post>
                ))
            }
        </div>
    )
}

export default Home
