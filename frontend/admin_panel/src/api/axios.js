// file: src/api/axios.js
import axios from 'axios';

export const adminApi = axios.create({
    baseURL: import.meta.env.VITE_ADMIN_API_URL
});

export const productApi = axios.create({
    baseURL: import.meta.env.VITE_PRODUCT_API_URL
});