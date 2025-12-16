// src/api/apiClient.js

import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './tokenHelpers'; // Sesuaikan path ini
// Asumsi: Anda memiliki endpoint untuk mendapatkan token baru
const REFRESH_URL = 'https://api-backend-anda.com/auth/refresh'; // Ganti dengan URL API Refresh Token Anda

const apiClient = axios.create({
  // Ganti dengan base URL API utama Anda
  baseURL: 'https://api-backend-anda.com/v1', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag untuk mencegah banyak permintaan refresh yang bentrok (race condition)
let isRefreshing = false;
let failedQueue = [];

// Fungsi untuk mengantri permintaan yang gagal
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 🔹 INTERCEPTOR PERMINTAAN (REQUEST)
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      // Menambahkan Access Token ke setiap permintaan yang keluar
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔹 INTERCEPTOR RESPON (RESPONSE) - Kunci untuk Refresh Token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = getRefreshToken();

    // Kondisi untuk memicu Refresh Token: Status 401 dan bukan permintaan refresh itu sendiri
    if (error.response.status === 401 && !originalRequest._retry && refreshToken) {
      
      // Mengatur flag agar tidak terjadi race condition (permintaan refresh ganda)
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true; // Set flag agar permintaan tidak loop tak terbatas
      isRefreshing = true;

      try {
        // 1. Panggil API Refresh Token
        const response = await axios.post(REFRESH_URL, { 
          refreshToken: refreshToken // Sesuaikan format payload
        });
        
        const { access_token, refresh_token } = response.data;

        // 2. Simpan token baru
        saveTokens(access_token, refresh_token);
        
        // 3. Update header permintaan asli dengan token baru
        originalRequest.headers['Authorization'] = 'Bearer ' + access_token;
        
        // 4. Proses dan ulangi semua permintaan yang gagal yang menunggu
        processQueue(null, access_token);
        
        // 5. Kembalikan respons dari permintaan yang asli
        return apiClient(originalRequest); 
        
      } catch (refreshError) {
        // Jika gagal refresh, paksa logout
        clearTokens();
        processQueue(refreshError, null);
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
        
      } finally {
        isRefreshing = false;
      }
    }
    
    // Jika 401 dan tidak ada refresh token, atau error bukan 401
    return Promise.reject(error);
  }
);

export default apiClient;