import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRegisterStudent } from "../api/auth";
import { useUi } from "../state/UiContext";
import {
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiLock,
  FiHash,
  FiBookOpen,
  FiLayers
} from "react-icons/fi";




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

const FORBIDDEN_PATTERNS = [/'/, /"/, /;/, /--/, /</, />/];

function hasForbiddenChars(value) {
  const v = String(value || "");
  return FORBIDDEN_PATTERNS.some((re) => re.test(v));
}

function sanitizeNoForbidden(value) {
  let v = String(value || "");
  v = v.replace(/['";<>]/g, "");
  v = v.replace(/--/g, "");
  return v;
}

function sanitizeName(value) {
  return String(value || "")
    .replace(/[0-9]/g, "")
    .replace(/[^a-zA-Z\s.-]/g, "");
}

function isValidName(value) {
  const v = String(value || "").trim();
  if (!v) return false;
  return /^[A-Za-z][A-Za-z\s.-]*$/.test(v);
}

function sanitizeStudentNumber(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[^0-9-]/g, "");
}

function isValidStudentNumber(value) {
  const v = String(value || "").trim();
  if (!v) return false;
  return /^(\d{5,}|\d{4}-\d{5})$/.test(v);
}

function sanitizeEmailLocalPart(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "");
}

export default function RegisterStudentPage() {
  const { a11yMode } = useUi();
  const nav = useNavigate();
  const courseOptions = useMemo(() => IMUS_COURSES, []);

  const [form, setForm] = useState({
    name: "",
    emailLocal: "",
    password: "",
    student_number: "",
    department: "",
  });

  const [showPw, setShowPw] = useState(false);
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
    if (hasForbiddenChars(form.student_number))
      return "Student number contains forbidden characters.";

    if (!form.department) return "Course is required.";
    if (hasForbiddenChars(form.department)) return "Course contains forbidden characters.";

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
    <div className="min-h-screen w-full">
      <div
        className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/imus-campus.jpg)" }}
      >
        <div className="min-h-screen w-full bg-black/45">
          <div className="min-h-screen w-full grid place-items-center p-6">
            {/* ✅ made it "pahaba" by using max-w-md and 1-column layout */}
            <div
              className={[
                "w-full max-w-md rounded-2xl border border-white/25 p-6 shadow-2xl",
                "bg-white/15 backdrop-blur-xl text-white",
                a11yMode ? "a11y-outline" : ""
              ].join(" ")}
            >
              <div className="text-center">
                <h1 className="text-xl font-semibold">Cavite State University - Imus Campus</h1>
                <p className="mt-1 text-sm text-white/80">Register an Account</p>
              </div>

              {/* ✅ 1 column */}
              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                {/* Full Name */}
                <div>
                  <label className="text-sm font-medium text-white/90" htmlFor="name">
                    Full Name
                  </label>
                  <div className="relative mt-1">
                    <FiUser className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                    <input
                      id="name"
                      className="w-full rounded-lg border border-white/25 bg-white/10 py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: sanitizeName(e.target.value).slice(0, 50)
                        })
                      }
                      required
                      maxLength={50}
                      placeholder="e.g. Juan D. Cruz"
                    />
                  </div>
                  <div className="mt-1 text-xs text-white/70">{form.name.length}/50</div>
                </div>

                {/* CVSU Email */}
                <div>
                  <label className="text-sm font-medium text-white/90" htmlFor="emailLocal">
                    CVSU Email
                  </label>
                  <div className="relative mt-1 flex overflow-hidden rounded-lg border border-white/25 bg-white/10">
                    <FiMail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                    <input
                      id="emailLocal"
                      className="w-full bg-transparent py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/60 outline-none"
                      value={form.emailLocal}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          emailLocal: sanitizeEmailLocalPart(e.target.value)
                        })
                      }
                      required
                      placeholder="juan.delacruz"
                    />
                    <div className="border-l border-white/20 bg-white/10 px-3 py-3 text-sm text-white/80">
                      {EMAIL_DOMAIN}
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-medium text-white/90" htmlFor="password">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <FiLock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                    <input
                      id="password"
                      type={showPw ? "text" : "password"}
                      className="w-full rounded-lg border border-white/25 bg-white/10 py-3 pl-12 pr-12 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                      value={form.password}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          password: sanitizeNoForbidden(e.target.value)
                        })
                      }
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-white/80 hover:text-white"
                      aria-label="Hold to show password"
                      title="Hold to show password"
                      onMouseDown={() => setShowPw(true)}
                      onMouseUp={() => setShowPw(false)}
                      onMouseLeave={() => setShowPw(false)}
                      onTouchStart={() => setShowPw(true)}
                      onTouchEnd={() => setShowPw(false)}
                      onTouchCancel={() => setShowPw(false)}
                    >
                      {showPw ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-white/70">
                    Forbidden: <span className="font-mono">' " ; -- &lt; &gt;</span>
                  </div>
                </div>

                {/* Student Number */}
                <div>
                  <label className="text-sm font-medium text-white/90" htmlFor="student_number">
                    Student Number
                  </label>
                  <div className="relative mt-1">
                    <FiHash className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                    <input
                      id="student_number"
                      className="w-full rounded-lg border border-white/25 bg-white/10 py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/60 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                      value={form.student_number}
                      onChange={(e) => {
                        const raw = sanitizeNoForbidden(e.target.value);

                        // digits only, max 9 digits
                        const digitsOnly = raw.replace(/\D/g, "").slice(0, 9);

                        setForm({
                          ...form,
                          student_number: sanitizeStudentNumber(digitsOnly)
                        });
                      }}
                      required
                      placeholder="9-digit student number (e.g. 202600123)"
                      inputMode="numeric"
                      maxLength={9}
                      pattern="\d{9}"
                      title="Student number must be exactly 9 digits."
                    />
                  </div>
                </div>

                {/* Department/Course */}
                <div>
                  <label className="text-sm font-medium text-white/90" htmlFor="department">
                    Department / Course (Imus Campus)
                  </label>
                  <div className="relative mt-1">
                    <FiBookOpen className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                    <select
                      id="department"
                      className="w-full rounded-lg border border-white/25 bg-white/10 py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      required
                    >
                      <option value="" disabled className="text-slate-900">
                        Select course
                      </option>
                      {courseOptions.map((c) => (
                        <option key={c} value={c} className="text-slate-900">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>


                {notice ? (
                  <div className="rounded-lg border border-emerald-200/30 bg-emerald-500/15 px-3 py-2 text-sm text-white">
                    {notice}
                  </div>
                ) : null}
                {error ? (
                  <div className="rounded-lg border border-red-300/40 bg-red-500/20 px-3 py-2 text-sm text-white">
                    {error}
                  </div>
                ) : null}

                <button
                  className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-green-700 px-3 py-3 text-sm font-semibold text-white shadow-lg hover:from-emerald-400 hover:to-green-600 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Submitting…" : "Sign Up"}
                </button>

                <div className="text-center text-sm text-white/90">
                  Already have an account?{" "}
                  <Link className="text-white hover:underline" to="/login">
                    Log in
                  </Link>
                </div>
              </form>
            </div>

        
          </div>
        </div>
      </div>
    </div>
  );
}