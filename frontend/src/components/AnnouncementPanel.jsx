// frontend/src/components/AnnouncementPanel.jsx

import React, { useEffect, useState } from 'react';
import { FiX, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { apiListAnnouncements, apiCreateAnnouncement, apiUpdateAnnouncement, apiDeleteAnnouncement } from '../api/announcements';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../state/AuthContext';
import Alert from './Alert';

export default function AnnouncementPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', message: '', status: 'active' });

  const isAdmin = ['admin', 'librarian'].includes(user?.role);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await apiListAnnouncements();
      setAnnouncements(res.announcements || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await apiUpdateAnnouncement(editId, formData.title, formData.message, formData.status);
        setEditId(null);
      } else {
        await apiCreateAnnouncement(formData.title, formData.message);
      }
      setFormData({ title: '', message: '', status: 'active' });
      setShowForm(false);
      await loadAnnouncements();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('announcement.confirm_delete'))) return;
    try {
      await apiDeleteAnnouncement(id);
      await loadAnnouncements();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete announcement');
    }
  };

  const handleEdit = (announcement) => {
    setEditId(announcement.id);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      status: announcement.status,
    });
    setShowForm(true);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">{t('announcement.title')}</h2>
        {isAdmin && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditId(null);
              setFormData({ title: '', message: '', status: 'active' });
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FiPlus /> {t('announcement.create')}
          </button>
        )}
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {showForm && isAdmin && (
        <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('announcement.title')}
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder={t('announcement.title')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('announcement.message')}
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                rows="4"
                placeholder={t('announcement.message')}
              />
            </div>

            {editId && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('announcement.status')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="active">{t('announcement.active')}</option>
                  <option value="inactive">{t('announcement.inactive')}</option>
                </select>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                {t('button.save')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-400"
              >
                {t('button.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-slate-600">{t('button.loading')}</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-8 text-slate-600">
          {t('announcement.no_announcements')}
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-4 border border-slate-200 rounded-lg bg-white hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{ann.title}</h3>
                  <p className="text-slate-700 mt-1">{ann.message}</p>
                  <div className="mt-2 text-xs text-slate-500 flex gap-4">
                    <span>{t('announcement.posted_by')}: {ann.posted_by_name}</span>
                    <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded ${ann.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {ann.status === 'active' ? t('announcement.active') : t('announcement.inactive')}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(ann)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
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
    </div>
  );
}