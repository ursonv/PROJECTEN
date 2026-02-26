import { Link, useLocation } from "@remix-run/react";

export default function MobileNavigation() {
  const location = useLocation();

  const navItems = [
    { to: "/", icon: "fa-solid fa-home", label: "Dashboard" },
    { to: "/projecten", icon: "fa-solid fa-folder", label: "Projecten" },
    { to: "/meldingen", icon: "fa-solid fa-bell", label: "Meldingen" },
    { to: "/instellingen", icon: "fa-solid fa-gear", label: "Instellingen" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="d-lg-none fixed-bottom c-mobile-navbar">
      <div className="d-flex justify-content-around align-items-center c-mobile-navbar__item">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} className="btn btn-link text-white c-mobile-navbar__item--link">
            <i className={`${item.icon} ${isActive(item.to) ? "text-warning" : ""}`}></i>
          </Link>
        ))}
      </div>
    </nav>
  );
}
