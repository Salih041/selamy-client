import React from 'react'
import { Routes , Route} from 'react-router-dom'
import Home from '../pages/Home'
import LoginPage from '../pages/LoginPage'
import PostDetailsPage from '../pages/PostDetailsPage'

function RouterConfig() {
  return (
    <Routes>
        <Route exact path="/" element={<Home/>}></Route>
        <Route exact path="/login" element={<LoginPage/>}></Route>
        <Route exact path="/posts/:id" element={<PostDetailsPage/>}></Route>
    </Routes>
  )
}

export default RouterConfig
