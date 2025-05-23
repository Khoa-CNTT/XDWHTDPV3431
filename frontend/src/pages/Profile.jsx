import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user, changePassword } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordMessage, setChangePasswordMessage] = useState("");

  if (!user) return <div>Bạn chưa đăng nhập.</div>;

  // Lấy ký tự đầu tên user để làm avatar
  const avatarChar = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordMessage("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangePasswordMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPassword.length < 6) {
      setChangePasswordMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordMessage("Mật khẩu mới và nhập lại mật khẩu không khớp.");
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setChangePasswordMessage("Đổi mật khẩu thành công!");
      setTimeout(() => {
        setShowChangePassword(false);
        setChangePasswordMessage("");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 2000);
    } catch (error) {
      // Ưu tiên lấy lỗi tiếng Việt từ backend, nếu không có thì dịch
      let msg = error?.response?.data?.error || error?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      if (msg.includes("current password") || msg.includes("hiện tại")) {
        msg = "Mật khẩu hiện tại không đúng.";
      } else if (msg.includes("required") || msg.includes("thiếu")) {
        msg = "Vui lòng nhập đầy đủ thông tin.";
      } else if (msg.includes("least 6 characters") || msg.includes("ít nhất 6")) {
        msg = "Mật khẩu mới phải có ít nhất 6 ký tự.";
      } else if (msg.includes("not match") || msg.includes("không khớp")) {
        msg = "Mật khẩu mới và nhập lại mật khẩu không khớp.";
      }
      setChangePasswordMessage(msg);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-avatar">{avatarChar}</div>
      <div className="profile-title">Thông tin tài khoản</div>
      <div className="profile-info"><b>Email:</b> {user.email}</div>
      <div className="profile-info"><b>Tên:</b> {user.name}</div>
      <div className="profile-info"><b>Vai trò:</b> {user.role}</div>
      <button className="change-password-btn" onClick={() => setShowChangePassword(v => !v)}>
        Đổi mật khẩu
      </button>
      {showChangePassword && (
        <form className="change-password-form" onSubmit={handleChangePassword}>
          <div>
            <label>Mật khẩu hiện tại:</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Mật khẩu mới:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Nhập lại mật khẩu mới:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Xác nhận</button>
          <button type="button" onClick={() => setShowChangePassword(false)}>Hủy</button>
          {changePasswordMessage && <p>{changePasswordMessage}</p>}
        </form>
      )}
    </div>
  );
};

export default Profile; 