import { http } from "./http";

export async function apiUploadAvatar(file) {
  const fd = new FormData();
  fd.append("avatar", file);

  const res = await http.post("/auth/avatar", fd, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return res.data;
}