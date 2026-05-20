import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiUserPlus,
  FiCheckCircle,
  FiMail,
  FiSearch
} from "react-icons/fi";
import { apiListBooks } from "../api/books";

export default function LandingPage() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);

  // ✅ IMPORTANT: Get API_BASE same way as BooksPage
  const API_BASE =
    localStorage.getItem("ulms_api_base_url") ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost/university-library/backend/public/index.php";

  const PUBLIC_BASE = String(API_BASE).replace(/\/index\.php\/?$/i, "");

  // ✅ Load featured books from API
  useEffect(() => {
    let cancelled = false;
    async function loadFeatured() {
      setLoadingFeatured(true);
      try {
        const res = await apiListBooks({ page: 1, limit: 6 });
        if (!cancelled) {
          setFeatured(res.items || []);
        }
      } catch (e) {
        console.error("Failed to load featured books:", e);
        setFeatured([]);
      } finally {
        if (!cancelled) setLoadingFeatured(false);
      }
    }
    loadFeatured();
    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ Helper function to construct book cover URLs
  function coverSrc(b) {
    const u = (b?.cover_image_url || "").trim();
    if (!u) return "";
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    if (u.startsWith("/")) return `${PUBLIC_BASE}${u}`;
    return `${PUBLIC_BASE}/${u}`;
  }

  // ✅ Handle search submission
  async function onSearch(e) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;

    setSearchQuery(query);
    setLoadingSearch(true);
    try {
      const res = await apiListBooks({ 
        page: 1, 
        limit: 12, 
        q: query 
      });
      setSearchResults(res.items || []);
    } catch (e) {
      console.error("Search failed:", e);
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  }

  // ✅ Clear search and return to featured books
  function clearSearch() {
    setQ("");
    setSearchQuery("");
    setSearchResults([]);
  }

  function onExploreBooks() {
    const section = document.getElementById("recommendation");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      nav("/app/books");
    }
  }

  return (
    <div className="min-h-screen bg-[#e9eff0]">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#0b1437] via-[#0f2b2a] to-[#1b5e20] text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-extrabold tracking-tight">
            <FiBookOpen className="text-amber-300" />
            <span>Library</span>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
            <a href="#home" className="text-white/90 hover:text-white">Home</a>
            <a href="#profile" className="text-white/90 hover:text-white">Profile</a>
            <a href="#services" className="text-white/90 hover:text-white">Services</a>
            <a href="#recommendation" className="text-white/90 hover:text-white">Featured Books</a>
          </nav>

          <div className="flex items-center gap-2">
            <NavLink
              to="/login"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15"
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-amber-300"
            >
              Register
            </NavLink>
          </div>
        </div>
      </header>

      {/* Show Search Results OR Featured Content */}
      {searchQuery ? (
        // ✅ SEARCH RESULTS VIEW
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Search Results for "{searchQuery}"
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Found {searchResults.length} book(s)
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={onSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search books..."
                  className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Search
              </button>
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-lg border border-slate-300 bg-white px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Results Grid */}
          {loadingSearch ? (
            <div className="text-center text-slate-600 py-12">
              <div className="inline-block animate-spin">
                <FiBookOpen className="text-2xl" />
              </div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center text-slate-600 py-12">
              <p>No books found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {searchResults.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-100">
                    {coverSrc(b) ? (
                      <img
                        alt={b.title}
                        src={coverSrc(b)}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-200">
                        <div className="text-center text-slate-500">
                          <FiBookOpen className="text-3xl mx-auto" />
                          <p className="text-xs mt-2">No Cover</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-sm font-extrabold text-slate-900 truncate">{b.title}</div>
                  <div className="text-xs font-semibold text-slate-500 truncate">{b.author || "Unknown"}</div>
                  <div className="mt-2 text-xs text-slate-600">
                    Available: <span className={`font-bold ${b.copies_available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {b.copies_available}/{b.copies_total}
                    </span>
                  </div>
                  <button
                    onClick={() => nav("/login")}
                    className="mt-3 w-full rounded-xl bg-[#0f2b2a] px-4 py-2 text-sm font-extrabold text-white hover:bg-[#123534]"
                    type="button"
                  >
                    Borrow (Login)
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        // ✅ FEATURED CONTENT VIEW
        <>
          {/* Hero */}
          <section
            id="home"
            className="relative overflow-hidden"
          >
            <div
              className="h-[360px] w-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=60)"
              }}
            >
              <div className="h-full w-full bg-black/55">
                <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-4 text-center">
                  <div className="text-white/95 text-lg font-semibold">
                    Welcome to
                  </div>
                  <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-amber-300 sm:text-4xl">
                    CAVITE STATE UNIVERSITY IMUS CAMPUS
                  </h1>
                  <p className="mt-2 text-sm text-white/80">University Library System</p>

                  <form
                    onSubmit={onSearch}
                    className="mt-5 flex w-full max-w-xl items-center gap-2 rounded-full bg-white/95 p-2 shadow"
                  >
                    <div className="pl-3 text-slate-500">
                      <FiSearch />
                    </div>
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search books..."
                      className="w-full bg-transparent px-2 py-2 text-sm font-semibold text-slate-800 outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-[#0f2b2a] px-5 py-2 text-sm font-extrabold text-white hover:bg-[#123534]"
                    >
                      Search
                    </button>
                  </form>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={onExploreBooks}
                      className="rounded-full bg-[#1b5e20] px-5 py-2 text-sm font-extrabold text-white hover:bg-[#1f6a24]"
                      type="button"
                    >
                      Explore Books
                    </button>
                    <button
                      onClick={() => nav("/register")}
                      className="rounded-full bg-white/10 px-5 py-2 text-sm font-extrabold text-white ring-1 ring-white/25 hover:bg-white/15"
                      type="button"
                    >
                      Become Member
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission & Vision */}
          <section id="profile" className="mx-auto max-w-6xl px-4 py-10">
            <div className="grid gap-6 md:grid-cols-[260px_1fr]">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                  <img
                    alt="Campus"
                    className="h-full w-full object-cover"
                    src="/logo-cvsu.jpg"
                    onError={(e) => {
                      // Fallback if image not found
                      e.currentTarget.src = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=60";
                    }}
                  />
                </div>
                <div className="mt-3 text-xs font-bold text-slate-500">
                  Cavite State University
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-extrabold text-slate-900">About Our Library</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Cavite State University is committed to providing excellent, equitable, and relevant
                  educational opportunities. Our library system supports students and staff with access to
                  comprehensive book collections and learning services that encourage reading, research,
                  and lifelong learning.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Browse our collection of books, manage your borrowing requests, and access library
                  services through our integrated system.
                </p>
              </div>
            </div>
          </section>

          {/* Services */}
          <section
            id="services"
            className="relative overflow-hidden bg-slate-900"
          >
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1455885666463-26842f5afc43?auto=format&fit=crop&w=1600&q=60)",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
            <div className="relative mx-auto max-w-6xl px-4 py-12">
              <div className="text-center">
                <div className="text-xs font-extrabold tracking-[0.2em] text-white/80">
                  OUR SERVICES
                </div>
                <h3 className="mt-2 text-2xl font-extrabold text-white">
                  What you can do in the Library System
                </h3>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <ServiceCard icon={FiUserPlus} title="Online Member Registration" />
                <ServiceCard icon={FiBookOpen} title="Browse & Search Books" />
                <ServiceCard icon={FiCheckCircle} title="Manage Borrow Requests" />
                <ServiceCard icon={FiMail} title="Library Notifications" />
                <ServiceCard icon={FiSearch} title="Advanced Search Filters" />
                <ServiceCard icon={FiBookOpen} title="View Borrowing History" />
              </div>
            </div>
          </section>

          {/* Featured books */}
          <section id="recommendation" className="mx-auto max-w-6xl px-4 py-12">
            <div className="text-center">
              <h3 className="text-lg font-extrabold text-slate-900">Featured Books</h3>
              <p className="mt-1 text-sm text-slate-600">
                Latest additions to our collection
              </p>
            </div>

            <div className="mt-8">
              {loadingFeatured ? (
                <div className="text-center text-slate-600 py-12">
                  <div className="inline-block animate-spin">
                    <FiBookOpen className="text-2xl" />
                  </div>
                  <p className="mt-2">Loading featured books...</p>
                </div>
              ) : featured.length === 0 ? (
                <div className="text-center text-slate-600 py-12">
                  No books available yet. Please check back later!
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                  {featured.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                    >
                      <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-100">
                        {coverSrc(b) ? (
                          <img
                            alt={b.title}
                            src={coverSrc(b)}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-slate-200">
                            <div className="text-center text-slate-500">
                              <FiBookOpen className="text-3xl mx-auto" />
                              <p className="text-xs mt-2">No Cover</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 text-sm font-extrabold text-slate-900 truncate">{b.title}</div>
                      <div className="text-xs font-semibold text-slate-500 truncate">{b.author || "Unknown"}</div>
                      <div className="mt-2 text-xs text-slate-600">
                        Available: <span className={`font-bold ${b.copies_available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {b.copies_available}/{b.copies_total}
                        </span>
                      </div>
                      <button
                        onClick={() => nav("/login")}
                        className="mt-3 w-full rounded-xl bg-[#0f2b2a] px-4 py-2 text-sm font-extrabold text-white hover:bg-[#123534]"
                        type="button"
                      >
                        Borrow (Login)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-xs font-semibold text-slate-500">
          © {new Date().getFullYear()} Cavite State University - University Library System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ icon: Icon, title }) {
  return (
    <div className="rounded-2xl bg-emerald-900/60 p-5 text-white shadow-sm ring-1 ring-white/10 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
          <Icon className="text-amber-300" />
        </div>
        <div className="text-sm font-extrabold">{title}</div>
      </div>
    </div>
  );
}
