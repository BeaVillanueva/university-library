// frontend/src/api/announcements.js

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiListAnnouncements = async () => {
  const res = await axios.get(`${API_BASE}/announcements`);
  return res.data;
};

export const apiCreateAnnouncement = async (title, message) => {
  const res = await axios.post(`${API_BASE}/announcements`, { title, message });
  return res.data;
};

export const apiUpdateAnnouncement = async (id, title, message, status) => {
  const res = await axios.put(`${API_BASE}/announcements/${id}`, {
    title,
    message,
    status,
  });
  return res.data;
};

export const apiDeleteAnnouncement = async (id) => {
  const res = await axios.delete(`${API_BASE}/announcements/${id}`);
  return res.data;
};