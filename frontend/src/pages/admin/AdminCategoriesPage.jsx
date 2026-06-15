import React, { useEffect, useState } from "react";
import { apiCreateCategory, apiDeleteCategory, apiListCategories, apiUpdateCategory } from "../../api/categories";
import Alert from "../../components/Alert";
import ConfirmModal from "../../components/ConfirmModal";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await apiListCategories();
      setItems(res.items || []);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    try {
      await apiCreateCategory(name);
      setNotice("Category created.");
      setName("");
      await load();
    } catch (e2) {
      setError(e2?.response?.data?.error || e2?.message || "Create failed");
    }
  }

  async function rename(id, nextName) {
    setWorkingId(id);
    setError("");
    setNotice("");
    try {
      await apiUpdateCategory(id, nextName);
      setNotice("Updated.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Update failed");
    } finally {
      setWorkingId(null);
    }
  }

  async function remove(id) {
    setWorkingId(id);
    setError("");
    setNotice("");
    try {
      await apiDeleteCategory(id);
      setNotice("Deleted.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Delete failed");
    } finally {
      setWorkingId(null);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Categories</h1>
      <p className="mt-1 text-sm text-slate-600 a11y-muted">Admin can manage categories (CRUD).</p>

      {notice ? (
        <div className="mt-4">
          <Alert type="success">{notice}</Alert>
        </div>
      ) : null}
      {error ? (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
          <div className="text-sm font-semibold">Create Category</div>
          <form className="mt-3 flex gap-2" onSubmit={create}>
            <input
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              aria-label="Category name"
              required
            />
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" aria-label="Create category">
              Create
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 a11y-surface a11y-outline">
          <div className="text-sm font-semibold">All Categories</div>
          <div className="mt-3 space-y-2">
            {loading ? (
              <div className="text-sm text-slate-600 a11y-muted">Loading…</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-slate-600 a11y-muted">No categories.</div>
            ) : (
              items.map((c) => (
                <CategoryRow key={c.id} c={c} onRename={rename} onDelete={setDeleteTarget} disabled={workingId === c.id} />
              ))
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete category?"
        message="Books using this category will become uncategorized."
        confirmText="Delete"
        tone="danger"
        loading={workingId === deleteTarget?.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove(deleteTarget.id)}
      />
    </div>
  );
}

function CategoryRow({ c, onRename, onDelete, disabled }) {
  const [value, setValue] = useState(c.name);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 a11y-outline">
      <input
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm a11y-input a11y-outline"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={`Category name ${c.name}`}
        disabled={disabled}
      />
      <button
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50 a11y-surface a11y-outline"
        onClick={() => onRename(c.id, value)}
        disabled={disabled}
        type="button"
        aria-label={`Save category ${c.name}`}
      >
        Save
      </button>
      <button
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50 a11y-surface a11y-outline"
        onClick={() => onDelete(c)}
        disabled={disabled}
        type="button"
        aria-label={`Delete category ${c.name}`}
      >
        Delete
      </button>
    </div>
  );
}
