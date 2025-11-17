import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
    (response) => { return response },

    async (error) => {
        if (error.response && error.response.status === 401) {
            console.error("invalid token! logging out")
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
)

export default api;