import React from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();

  if (!user) return <div>Bạn chưa đăng nhập.</div>;

  // Lấy ký tự đầu tên user để làm avatar
  const avatarChar = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

  return (
    <div className="profile-container">
      <div className="profile-avatar">{avatarChar}</div>
      <div className="profile-title">Thông tin tài khoản</div>
      <div className="profile-info"><b>Email:</b> {user.email}</div>
      <div className="profile-info"><b>Tên:</b> {user.name}</div>
      <div className="profile-info"><b>Vai trò:</b> {user.role}</div>
    </div>
  );
};

export default Profile; 