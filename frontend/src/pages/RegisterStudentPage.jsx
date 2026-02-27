import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRegisterStudent } from "../api/auth";

const IMUS_COURSES = [
  "AB Journalism",
  "Bachelor of Elementary Education",
  "Bachelor of Secondary Education",
  "BS Business Management",
  "BS Computer Science",
  "BS Entrepreneurship",
  "BS Hospitality Management (formerly BS Hotel and Restaurant Management)",
  "BS Information Technology",
  "BS Office Administration",
  "BS Psychology",
  "Bachelor Of Early Childhood Education",
  "Teacher Certificate Program"
];

const EMAIL_DOMAIN = "@cvsu.edu.ph";

// SQL/HTML injection related patterns you want to block
const FORBIDDEN_PATTERNS = [
  /'/, // single quote
  /"/, // double quote
  /;/, // end of SQL statement
  /--/, // SQL comment
  /</, // HTML injection
  />/ // HTML injection
];

function hasForbiddenChars(value) {
  const v = String(value || "");
  return FORBIDDEN_PATTERNS.some((re) => re.test(v));
}

// Remove forbidden tokens from a string (so user can't type them)
function sanitizeNoForbidden(value) {
  let v = String(value || "");
  v = v.replace(/['";<>]/g, ""); // remove single forbidden chars
  v = v.replace(/--/g, ""); // remove SQL comment token
  return v;
}

// Name rule: letters + spaces + dot + hyphen only (no numbers/special chars)
function sanitizeName(value) {
  return String(value || "")
    .replace(/[0-9]/g, "") // remove numbers
    .replace(/[^a-zA-Z\s.-]/g, ""); // remove special chars except space . -
}

function isValidName(value) {
  const v = String(value || "").trim();
  if (!v) return false;
  return /^[A-Za-z][A-Za-z\s.-]*$/.test(v);
}

// Student number rule (example): digits + hyphen only
// "2026-00123" => allowed
function sanitizeStudentNumber(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[^0-9-]/g, ""); // remove letters & special chars (keep digits and -)
}

function isValidStudentNumber(value) {
  const v = String(value || "").trim();
  if (!v) return false;
  // Accept:
  // - 5+ digits (e.g. 202600123)
  // - or format ####-##### (e.g. 2026-00123)
  return /^(\d{5,}|\d{4}-\d{5})$/.test(v);
}

function sanitizeEmailLocalPart(value) {
  // allow letters, numbers, dot, underscore, hyphen
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "");
}

export default function RegisterStudentPage() {
  const nav = useNavigate();
  const courseOptions = useMemo(() => IMUS_COURSES, []);

  const [form, setForm] = useState({
    name: "",
    emailLocal: "",
    password: "",
    student_number: "",
    department: "",
    year_level: ""
  });

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const fullEmail = form.emailLocal ? `${form.emailLocal}${EMAIL_DOMAIN}` : "";

  function validate() {
    const name = form.name.trim();
    if (!name) return "Name is required.";
    if (name.length > 50) return "Name must be 50 characters or less.";
    if (!isValidName(name))
      return "Name must contain letters only (allowed: spaces, dot, hyphen).";
    if (hasForbiddenChars(name)) return "Name contains forbidden characters.";

    if (!form.emailLocal) return "CVSU email is required.";
    if (hasForbiddenChars(form.emailLocal)) return "Email contains forbidden characters.";

    if (!form.password) return "Password is required.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (hasForbiddenChars(form.password))
      return "Password contains forbidden characters: ' \" ; -- < >";

    if (!form.student_number) return "Student number is required.";
    if (!isValidStudentNumber(form.student_number))
      return "Student number must be digits only (allowed: hyphen). Example: 2026-00123";
    // keep as safety (should be impossible to type)
    if (hasForbiddenChars(form.student_number))
      return "Student number contains forbidden characters.";

    if (!form.department) return "Course is required.";
    if (hasForbiddenChars(form.department)) return "Course contains forbidden characters.";

    const yl = Number(form.year_level);
    if (!(yl >= 1 && yl <= 6)) return "Year level must be 1–6.";

    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setLoading(true);
    try {
      await apiRegisterStudent({
        name: form.name.trim(),
        email: fullEmail,
        password: form.password,
        student_number: form.student_number.trim(),
        department: form.department,
        year_level: Number(form.year_level)
      });

      setNotice("Registration submitted. Please wait for admin approval.");
      setTimeout(() => nav("/login"), 1200);
    } catch (e2) {
      setError(e2?.response?.data?.error || e2?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-slate-50">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <h1 className="text-xl font-semibold">Student Registration</h1>
        <p className="mt-1 text-sm text-slate-600">
          After registering, your account will be <b>pending</b> until approved by the admin.
        </p>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <Field label="Name">
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: sanitizeName(e.target.value).slice(0, 50)
                })
              }
              required
              maxLength={50}
              aria-label="Full name"
              placeholder="e.g. Juan D. Cruz"
            />
            <div className="mt-1 text-xs text-slate-500">{form.name.length}/50</div>
          </Field>

          <Field label="CVSU Email">
            <div className="mt-1 flex overflow-hidden rounded-lg border border-slate-300">
              <input
                className="w-full px-3 py-2 text-sm outline-none"
                value={form.emailLocal}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emailLocal: sanitizeEmailLocalPart(e.target.value)
                  })
                }
                required
                aria-label="CVSU email local part"
                placeholder="juan.delacruz"
              />
              <div className="border-l border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {EMAIL_DOMAIN}
              </div>
            </div>
          </Field>

          <Field label="Password">
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: sanitizeNoForbidden(e.target.value)
                })
              }
              required
              minLength={8}
              aria-label="Password"
            />
            <div className="mt-1 text-xs text-slate-500">
              Forbidden: <span className="font-mono">' " ; -- &lt; &gt;</span>
            </div>
          </Field>

          <Field label="Student Number">
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.student_number}
              onChange={(e) =>
                setForm({
                  ...form,
                  student_number: sanitizeStudentNumber(sanitizeNoForbidden(e.target.value))
                })
              }
              required
              placeholder="e.g. 202600123"
              aria-label="Student number"
              inputMode="numeric"
            />
            <div className="mt-1 text-xs text-slate-500">
              Digits only (hyphen allowed).
            </div>
          </Field>

          <Field label="Department / Course (Imus Campus)">
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              required
              aria-label="Course"
            >
              <option value="" disabled>
                Select course
              </option>
              {courseOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Year Level">
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.year_level}
              onChange={(e) => setForm({ ...form, year_level: e.target.value })}
              required
              aria-label="Year level"
            >
              <option value="" disabled>
                Select year level
              </option>
              <option value="1">1st</option>
              <option value="2">2nd</option>
              <option value="3">3rd</option>
              <option value="4">4th</option>
            </select>
          </Field>

          {notice ? (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {notice}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Submitting…" : "Register"}
          </button>

          <div className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="text-blue-700 hover:underline" to="/login">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}