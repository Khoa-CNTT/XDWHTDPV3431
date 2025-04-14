import { Link } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import './Navbar.css'
import Button from "../Button/Button";
import AuthPage from "../AuthPage/AuthPage";
import logo from "../Assets/logo.png"



const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };
  return (
    <div className="navbar">
      <div className="logo"> <Link to="/"><img src={logo} alt ="logo" className="logo-picture"/></Link></div>
      <div className="nav-links">
        <Link to="/">Trang chủ</Link>
        <Link to="/projects">Các dự án</Link>
        <Link to="/create">Tạo dự án </Link>
        <Link to="/guide">Hướng dẫn</Link>
      </div>

      <div className="user">
        {user ? (
          <>
            <span>Xin chào, {user.email}</span>
            <Button text="Log Out"onClick={handleLogout}/>
          </>
        ) : (
          <>
            <Button text="Đăng nhập" onClick={() => navigate('/auth?mode=login')}/>
            <Button text="Đăng ký" onClick={() => navigate('/auth?mode=signup')}/>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar
