import React from 'react'

function Post({postProps}) {
    const {title,content,comments,commentCount,like,likeCount} = postProps;
    return (
        <div>
            <h1>{title}</h1>
            <p>{content}</p>
            <p>🌧️{commentCount}</p>
        </div>
    )
}

export default Post
