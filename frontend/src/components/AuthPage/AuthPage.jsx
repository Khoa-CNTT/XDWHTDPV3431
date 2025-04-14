import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase'; // Đảm bảo đã cấu hình firebase.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Button from '../Button/Button';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); // Chuyển đổi giữa đăng nhập và đăng ký
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'donor', // Mặc định là donor
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý đăng ký
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Đăng ký với Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Thêm thông tin người dùng vào Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: formData.username,
        email: formData.email,
        role: user,
        created_at: new Date().toISOString(),
      });
      setFormData({ username: '', email: '', password: '', role: 'donor' });
      setIsLogin(true); // Chuyển về chế độ đăng nhập sau khi đăng ký
    } catch (error) {
      setError(error.message);
    }
  };

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h1>
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Tên người dùng</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên người dùng"
                required={!isLogin}
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              required
            />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="role">Vai trò</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="donor">Người quyên góp</option>
                <option value="creator">Người tạo dự án</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
          )}
          {error && <p className="error">{error}</p>}
          <Button
            text={isLogin ? 'Đăng nhập' : 'Đăng ký'}
            variant="primary"
            type="submit"
          />
        </form>
        <p className="toggle-text">
          {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? ' Đăng ký ngay' : ' Đăng nhập'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;