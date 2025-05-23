import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const SignInForm = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      setSuccess("Đăng nhập thành công! Đang chuyển hướng...");
      setError("");
      setSubmitted(true);
    } catch (err) {
      if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else if (err.message === 'Network Error') {
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.");
      } else if (err.response?.status === 401) {
        setError("Email hoặc mật khẩu không chính xác. Vui lòng thử lại.");
      } else {
        setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
      }
      setSuccess("");
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  useEffect(() => {
    if (user && submitted) {
      if (user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, submitted, navigate]);

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleSubmit}>
        <h1>Đăng nhập</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <div className="form-options">
          <label className="remember-me">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            Nhớ tôi
          </label>
          <a href="/forgot-password" className="forgot-password">
            Quên mật khẩu?
          </a>
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
};

export default SignInForm;
