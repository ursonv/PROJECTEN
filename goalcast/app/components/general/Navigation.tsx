import { useState } from "react";
import { Link, useLocation } from "@remix-run/react";
import Modal from "../popup/Modal";
import UsbForm from "../forms/UsbForm";

export default function Navigation() {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  const navItems = [
    { to: "/", icon: "fa-solid fa-home", label: "Dashboard" },
    { to: "/projecten", icon: "fa-solid fa-folder", label: "Projecten" },
    { to: "/meldingen", icon: "fa-solid fa-bell", label: "Meldingen" },
    { to: "/instellingen", icon: "fa-solid fa-gear", label: "Instellingen" },
  ];

  return (
    <>
      <nav className="position-fixed top-0 start-0 h-100 d-flex flex-column justify-content-between c-navbar">
        <div>
          <div className="c-logo">
            <Link to="/">
              <img src="/logo-dark.png" alt="logo-dark" className="c-logo__img" />
            </Link>
          </div>

          <ul className="nav flex-column mt-3">
            {navItems.map((item) => (
              <li key={item.to} className="nav-item c-navbar__item">
                <Link
                  to={item.to}
                  className={`d-flex align-items-center ${
                    location.pathname === item.to ? "c-navbar__item--active" : "c-navbar__item--link"
                  }`}
                >
                  <div className="d-flex align-items-center justify-content-center">
                    <i className={item.icon}></i>
                  </div>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="c-navbar__button">
          <button
            className="btn w-100 d-flex justify-content-center align-items-center c-navbar__button--btn"
            onClick={() => setShowModal(true)} data-tour="usb-toevoegen-nav"
          >
            USB TOEVOEGEN <i className="fa-regular fa-square-plus ms-2"></i>
          </button>
        </div>
      </nav>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3>Nieuwe GoalCast USB toevoegen</h3>
        <UsbForm onSuccess={() => setShowModal(false)} />
      </Modal>
    </>
  );
}
