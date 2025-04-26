import { Link, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  // State phụ để force update khi user thay đổi
  const [_, setForce] = useState(0);
  useEffect(() => {
    setForce(f => f + 1);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfile = () => {
    setShowMenu(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate("/login");
  };

  const navigate = useNavigate();

  return (
    <div className="navbar">
      {/* Logo */}
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Logo" className="logo-picture" />
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="nav-links">
        <Link to="/">Trang chủ</Link>
        <Link to="/projects">Các dự án</Link>
        <Link to="/create">Tạo dự án</Link>
        <Link to="/donate">Quyên góp</Link>
        <Link to="/guide">Hướng dẫn</Link>
      </div>

      {/* User & Search Buttons */}
      <div className="user-actions">
        <div className="search-icon">
          <FontAwesomeIcon icon={faSearch} />
        </div>
        <div
          className="auth-button"
          onClick={() => {
            if (isAuthenticated) {
              setShowMenu((prev) => !prev);
            } else {
              navigate("/login");
            }
          }}
          style={{ position: "relative" }}
        >
          {isAuthenticated && user && user.name ? (
            <span className="navbar-avatar">{user.name.charAt(0).toUpperCase()}</span>
          ) : (
            <FontAwesomeIcon icon={faUser} />
          )}
          {isAuthenticated && showMenu && (
            <div className="account-menu" ref={menuRef}>
              <button className="account-menu-btn" onClick={handleProfile}>
                Xem Profile
              </button>
              <button className="account-menu-btn logout" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
