import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const SignInForm = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      setSuccess("Đăng nhập thành công! Đang chuyển hướng...");
      setError("");
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      setSuccess("");
    }
  };

  // Chuyển hướng khi user đã có giá trị và đã submit form
  useEffect(() => {
    if (user && submitted) {
      // Kiểm tra vai trò người dùng và chuyển hướng phù hợp
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
        <h1>Sign In</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message" style={{color:'#16a34a',marginBottom:8}}>{success}</div>}
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
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default SignInForm;
