import React from 'react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from "../../api"

function PostDetailsPage() {

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setError(null);
        setIsLoading(true);

        const response = await api.get(`/posts/${id}`);
        setPost(response.data)
        console.log(response.data)

      } catch (error) {
        console.log("error : ", error);
        setError(error.response ? error.response.data.message : error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPost();
  },[id])

  if(isLoading) return(<p>Loading</p>)
  if (error) return (<p>Error: {error}</p>)
  if(!post) return(<h4>Post Not Found</h4>)
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.author.username}</p>
      <p>{post.content}</p>
      <p>🌧️{post.likeCount}</p>
      <p>⛈️{post.commentCount}</p>
    </div>
  )
}

export default PostDetailsPage
