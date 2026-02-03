import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({adminOnly = false}) {
    const { isLoggedIn, isAdmin } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if(adminOnly && !isAdmin){
        return <Navigate to="/" replace/>;
    }

    return <Outlet/>
}

export default ProtectedRoute
