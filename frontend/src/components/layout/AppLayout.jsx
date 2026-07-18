import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/setup", label: "Setup" },
  { to: "/upload", label: "Upload" },
  { to: "/generate", label: "Generate" },
  { to: "/review", label: "Review" },
  { to: "/disclosure", label: "Disclosure" },
];

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="app-brand">
          Aiga
        </NavLink>
        <nav className="app-nav" aria-label="Workflow">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
