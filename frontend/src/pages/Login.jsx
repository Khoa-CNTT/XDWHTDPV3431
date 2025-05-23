import React, { useState } from "react";
import "./Login.css";
import SignInForm from "./SignIn";
import SignUpForm from "./SignUp";

const Login = () => {
  const [type, setType] = useState("signIn");
  const handleOnClick = text => {
    if (text !== type) {
      setType(text);
      return;
    }
  };
  const containerClass =
    "container " + (type === "signUp" ? "right-panel-active" : "");
  return (
    <>
    <style>
      
    </style>
    <div className="login">
      <div className={containerClass} id="container">
        <SignUpForm onSwitchToSignIn={() => handleOnClick("signIn")} />
        <SignInForm />
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Chào mừng bạn trở lại!</h1>
              <p>
                Để duy trì kết nối với chúng tôi, vui lòng đăng nhập bằng thông tin cá nhân của bạn.
              </p>
              <button
                className="ghost"
                id="signIn"
                onClick={() => handleOnClick("signIn")}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Xin chào, bạn thân mến!</h1>
              <p>Nhập thông tin cá nhân của bạn và bắt đầu hành trình cùng chúng tôi.</p>
              <button
                className="ghost "
                id="signUp"
                onClick={() => handleOnClick("signUp")}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
};

export default Login;
