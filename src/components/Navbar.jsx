import React from 'react'
import {Link, NavLink} from "react-router-dom" 

function Navbar() {
  return (
    <nav>
        <div>
            <Link to="/">Name</Link>
        </div>
        <div>
            <NavLink to="/login">login</NavLink>
        </div>
    </nav>
  )
}

export default Navbar
