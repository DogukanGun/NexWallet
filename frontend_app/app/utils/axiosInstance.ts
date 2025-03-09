import axios from 'axios';
import { useLoading } from '../context/LoadingContext';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api', // Set your API base URL here for SSR
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Start loading
        const { setLoading } = useLoading();
        setLoading(true);
        return config;
    },
    (error) => {
        // Stop loading on error
        const { setLoading } = useLoading();
        setLoading(false);
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Stop loading
        const { setLoading } = useLoading();
        setLoading(false);
        return response;
    },
    (error) => {
        // Stop loading on error
        const { setLoading } = useLoading();
        setLoading(false);
        return Promise.reject(error);
    }
);

export default axiosInstance; 