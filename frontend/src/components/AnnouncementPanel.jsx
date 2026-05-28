import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import {
  apiListAnnouncements,
  apiCreateAnnouncement,
  apiUpdateAnnouncement,
  apiDeleteAnnouncement,
  apiMarkAnnouncementsRead,
} from "../api/announcements";
import { useAuth } from "../state/AuthContext";
import Alert from "./Alert";
import ConfirmModal from "./ConfirmModal";
import { announcePageLoad } from "../hooks/useVoiceGuide";
import { formatDate } from "../utils/dateTime";

export default function AnnouncementPanel() {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    status: "active",
  });

  const isAdmin = ["admin", "librarian"].includes(user?.role);

  useEffect(() => {
  loadAnnouncements();

  announcePageLoad(
    "ANNOUNCEMENTS"
  );

}, []);

  async function loadAnnouncements() {
    setLoading(true);
    try {
      const res = await apiListAnnouncements();
      setAnnouncements(res?.announcements || []);

      if (user?.role === "student" && Number(res?.unread_count || 0) > 0) {
        await apiMarkAnnouncementsRead();
        window.dispatchEvent(new Event("announcements:read"));
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (editId) {
        await apiUpdateAnnouncement(
          editId,
          formData.title,
          formData.message,
          formData.status
        );
      } else {
        await apiCreateAnnouncement(formData.title, formData.message);
      }

      setShowForm(false);
      setEditId(null);
      setFormData({ title: "", message: "", status: "active" });
      await loadAnnouncements();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save announcement");
    }
  }

  function handleEdit(ann) {
    setEditId(ann.id);
    setFormData({
      title: ann.title,
      message: ann.message,
      status: ann.status || "active",
    });
    setShowForm(true);
  }

  async function handleDelete(id) {
    try {
      await apiDeleteAnnouncement(id);
      setDeleteTarget(null);
      await loadAnnouncements();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete announcement");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#27553f]">
            Library Announcements
          </h1>
          <p className="mt-1 text-slate-500">
            Stay updated with library news.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setEditId(null);
              setFormData({ title: "", message: "", status: "active" });
            }}
            className="flex items-center gap-2 rounded-2xl bg-[#27553f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1f4432]"
          >
            <FiPlus />
            New
          </button>
        )}
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {showForm && isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-4">
            <input
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Announcement title"
              className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <textarea
              rows={5}
              required
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Announcement message"
              className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:ring-2 focus:ring-emerald-400"
            />

            {editId && (
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-2xl bg-[#27553f] px-6 py-3 font-semibold text-white hover:bg-[#1f4432]"
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                className="rounded-2xl bg-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading announcements...
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-800">
            No announcements yet
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            New library updates will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="relative h-[390px] overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:ring-2 hover:ring-[#27553f]/20"
              style={{
                backgroundImage: "url('/announcementboard.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-start px-10 pt-[120px] pb-10 text-center">
                {isAdmin && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      ann.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {ann.status === "active" ? "Active" : "Inactive"}
                  </span>
                )}

                <h2 className="mt-4 line-clamp-2 text-2xl font-black uppercase text-[#27553f]">
                  {ann.title}
                </h2>

                <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-700">
                  {ann.message}
                </p>

                <div className="mt-auto -translate-y-4 text-xs text-[#27553f]">
                  <div>
                    Posted by: {ann.posted_by_name || "Library Staff"}
                  </div>
                  <div className="mt-1">
                    {formatDate(ann.created_at)}
                  </div>
                </div>

                {isAdmin && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(ann)}
                      className="rounded-xl bg-[#27553f] p-2 text-white hover:bg-[#1f4432]"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(ann)}
                      className="rounded-xl bg-red-600 p-2 text-white hover:bg-red-700"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete announcement?"
        message={`Delete "${deleteTarget?.title || "this announcement"}"? This cannot be undone.`}
        confirmText="Delete"
        tone="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </div>
  );
}
