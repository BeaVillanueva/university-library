import { http } from "./http";

// GET all announcements
export async function getAnnouncements() {
  const { data } = await http.get("/announcements");
  return data;
}

// CREATE announcement
export async function createAnnouncement(payload) {
  const { data } = await http.post("/announcements", payload);
  return data;
}

// UPDATE announcement
export async function updateAnnouncement(id, payload) {
  const { data } = await http.put(`/announcements/${id}`, payload);
  return data;
}

// DELETE announcement
export async function deleteAnnouncement(id) {
  const { data } = await http.delete(`/announcements/${id}`);
  return data;
}

// ======================
// Compatible sa AnnouncementPanel.jsx
// ======================

// LIST
export const apiListAnnouncements = getAnnouncements;
export const apiGetAnnouncements = getAnnouncements;

// CREATE
export async function apiCreateAnnouncement(title, message) {
  return createAnnouncement({
    title,
    message,
    status: "active",
  });
}

// UPDATE
export async function apiUpdateAnnouncement(id, title, message, status) {
  return updateAnnouncement(id, {
    title,
    message,
    status,
  });
}

// DELETE
export const apiDeleteAnnouncement = deleteAnnouncement;