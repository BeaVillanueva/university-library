import React, { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiUserPlus,
  FiArchive,
  FiMail,
  FiMapPin,
  FiUsers,
  FiSearch
} from "react-icons/fi";

export default function LandingPage() {
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const featured = useMemo(
    () => [
      {
        title: "Harry Potter",
        author: "J.K. Rowling",
        cover:
          "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=60"
      },
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        cover:
          "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=60"
      },
      {
        title: "The Hunger Games",
        author: "Suzanne Collins",
        cover:
          "https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=600&q=60"
      },
      {
        title: "After",
        author: "Anna Todd",
        cover:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=60"
      },
      {
        title: "Linear Algebra",
        author: "Sheldon Axler",
        cover:
          "https://images.unsplash.com/photo-1455885666463-26842f5afc43?auto=format&fit=crop&w=600&q=60"
      },
      {
        title: "Swapped",
        author: "Jannik Sinner",
        cover:
          "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=60"
      }
    ],
    []
  );

  function onSearch(e) {
    e.preventDefault();
    const query = q.trim();
    // redirect to your Books page with query param (optional)
    if (!query) return nav("/books");
    nav(`/books?query=${encodeURIComponent(query)}`);
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
            <a href="#activities" className="text-white/90 hover:text-white">Activities</a>
            <a href="#recommendation" className="text-white/90 hover:text-white">Recommendation</a>
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
          {/* overlay */}
          <div className="h-full w-full bg-black/55">
            <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-4 text-center">
              <div className="text-white/95 text-lg font-semibold">
                Welcome to
              </div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-amber-300 sm:text-4xl">
                CAVITE STATE UNIVERSITY IMUS CAMPUS
              </h1>

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
                  onClick={() => nav("/books")}
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
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=60"
              />
            </div>
            <div className="mt-3 text-xs font-bold text-slate-500">
              Cavite State University
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">Mission And Vision</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Cavite State University is committed to providing excellent, equitable, and relevant
              educational opportunities. This landing page is a template—replace this text with your
              official mission & vision. You can add more sections such as history, goals, and
              library policies.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              The library supports students and staff through access to books, digital archives, and
              learning services that encourage reading, research, and lifelong learning.
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
            <ServiceCard icon={FiBookOpen} title="Access E-Books" />
            <ServiceCard icon={FiArchive} title="Digital Archives" />
            <ServiceCard icon={FiMail} title="Library Requests" />
            <ServiceCard icon={FiMapPin} title="Branch Locations" />
            <ServiceCard icon={FiUsers} title="Kids & Teens Zone" />
          </div>
        </div>
      </section>

      {/* Featured books */}
      <section id="recommendation" className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <h3 className="text-lg font-extrabold text-slate-900">Featured Books</h3>
          <p className="mt-1 text-sm text-slate-600">
            You can replace this with real data later (API call).
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {featured.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
            >
              <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-100">
                <img
                  alt={b.title}
                  src={b.cover}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="mt-3 text-sm font-extrabold text-slate-900">{b.title}</div>
              <div className="text-xs font-semibold text-slate-500">{b.author}</div>
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
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-xs font-semibold text-slate-500">
          © {new Date().getFullYear()} Library System. All rights reserved.
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