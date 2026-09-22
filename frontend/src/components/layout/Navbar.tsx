import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
    : "rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const menu =
    user?.role === "COMPANY"
      ? [
          { to: "/company/jobs", label: "Lowongan" },
          { to: "/company/jobs/new", label: "Buat Lowongan" },
        ]
      : [
          { to: "/jobs", label: "Cari Kerja" },
          { to: "/my-applications", label: "Lamaran Saya" },
        ];

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-emerald-600">
          IndoKerja
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {user &&
            menu.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          {user && (
            <button
              onClick={handleLogout}
              className="ml-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          ☰
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-1 border-t px-4 py-2 md:hidden">
          {user &&
            menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navLinkClass}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          {user && (
            <button onClick={handleLogout} className="text-left text-sm text-red-600">
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}