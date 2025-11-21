import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import LoginPage from '../pages/LoginPage'
import PostDetailsPage from '../pages/PostDetailsPage'
import RegisterPage from '../pages/RegisterPage'
import CreatePostPage from '../pages/CreatePostPage'
import ProtectedRoute from '../components/ProtectedRoute'
import PostEditPage from '../pages/PostEditPage'
import ProfilePage from '../pages/ProfilePage'

function RouterConfig() {
  return (
    <Routes>
      <Route exact path="/" element={<Home />}></Route>
      <Route exact path="/login" element={<LoginPage />}></Route>
      <Route exact path="/posts/:id" element={<PostDetailsPage />}></Route>
      <Route exact path="/register" element={<RegisterPage />}></Route>
      <Route exact path="/profile/:id" element={<ProfilePage/>}></Route>


      <Route element={<ProtectedRoute />}>
        <Route exact path="/create-post" element={<CreatePostPage />}></Route>
        <Route exact path="/posts/edit/:id" element={<PostEditPage/>}></Route>
      </Route>
    </Routes>
  )
}

export default RouterConfig
