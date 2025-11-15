import React from 'react'
import { NavLink } from 'react-router-dom';

function Post({postProps}) {
    const {_id,title,content,comments,commentCount,like,likeCount} = postProps;
    return (
        <div>
            <h1>{title}</h1>
            <p>{content}</p>
            <NavLink to={`/posts/${_id}`}>git</NavLink>
            <p>🌧️{commentCount}</p>
        </div>
    )
}

export default Post
