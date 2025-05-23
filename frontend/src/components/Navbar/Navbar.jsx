import { Link, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUser, faWallet } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  // State phụ để force update khi user thay đổi
  const [_, setForce] = useState(0);
  useEffect(() => {
    setForce(f => f + 1);
  }, [user]);

  // Kiểm tra địa chỉ ví khi component mount và khi user thay đổi
  useEffect(() => {
    const checkWalletAddress = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await axios.get('/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.data && response.data.wallet_address) {
            setWalletAddress(response.data.wallet_address);
          }
        } catch (error) {
          console.error('Error fetching wallet address:', error);
        }
      }
    };
    checkWalletAddress();
  }, [isAuthenticated, user]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const connectWallet = async () => {
    // Nếu đang trong quá trình kết nối, không cho phép kết nối lại
    if (isConnecting) {
      alert('Đang trong quá trình kết nối ví. Vui lòng đợi...');
      return;
    }

    try {
      setIsConnecting(true);

      // Kiểm tra xem MetaMask đã được cài đặt chưa
      if (typeof window.ethereum === 'undefined') {
        alert('Vui lòng cài đặt MetaMask để kết nối ví!');
        return;
      }

      // Kiểm tra token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập lại!');
        navigate('/login');
        return;
      }

      // Kiểm tra xem đã kết nối với mạng đúng chưa
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current chainId:', chainId);
      if (chainId !== '0xaa36a7') { // Sepolia Testnet
        alert('Vui lòng chuyển sang mạng Sepolia Testnet!');
        return;
      }

      // Kiểm tra xem đã có tài khoản được kết nối chưa
      let accounts;
      try {
        accounts = await window.ethereum.request({ method: 'eth_accounts' });
      } catch (error) {
        console.error('Error getting accounts:', error);
        accounts = [];
      }

      // Nếu chưa có tài khoản nào được kết nối, yêu cầu kết nối
      if (!accounts || accounts.length === 0) {
        try {
          accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
          if (error.code === 4001) {
            // Người dùng từ chối kết nối
            alert('Bạn đã từ chối kết nối ví!');
            return;
          } else if (error.code === -32002) {
            // Đang có request kết nối khác đang chờ
            alert('Đang có yêu cầu kết nối ví khác đang chờ xử lý. Vui lòng thử lại sau!');
            return;
          } else {
            throw error;
          }
        }
      }

      if (!accounts || accounts.length === 0) {
        alert('Không thể lấy địa chỉ ví. Vui lòng thử lại!');
        return;
      }

      const address = accounts[0];
      console.log('Selected address:', address);

      // Kiểm tra định dạng địa chỉ ví
      const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
      console.log('Is valid address:', isValidAddress);
      if (!isValidAddress) {
        alert('Địa chỉ ví không hợp lệ! Địa chỉ ví phải bắt đầu bằng 0x và theo sau là 40 ký tự hex.');
        return;
      }

      // Lưu địa chỉ ví vào database
      console.log('Sending request to update wallet address:', {
        address,
        type: typeof address,
        length: address.length
      });
      console.log('Token:', token);
      try {
        const requestData = { wallet_address: address };
        console.log('Request data:', requestData);
        
        const response = await axios.put('/api/users/wallet', 
          requestData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Server response:', response.data);
        if (response.data && response.data.success) {
          setWalletAddress(address);
          alert('Kết nối ví thành công!');
        } else {
          const errorMessage = response.data?.error?.message || 'Có lỗi xảy ra khi kết nối ví';
          if (response.data?.error?.details) {
            console.error('Validation errors:', response.data.error.details);
            const details = response.data.error.details;
            if (Array.isArray(details)) {
              const messages = details.map(d => `${d.field}: ${d.message}`).join('\n');
              alert(`${errorMessage}\n\nChi tiết lỗi:\n${messages}`);
            } else {
              alert(errorMessage);
            }
          } else {
            alert(errorMessage);
          }
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          // Lỗi từ server
          if (error.response.status === 400) {
            const errorMessage = error.response.data?.error?.message || 'Địa chỉ ví không hợp lệ!';
            if (error.response.data?.error?.details) {
              console.error('Validation errors:', error.response.data.error.details);
              const details = error.response.data.error.details;
              if (Array.isArray(details)) {
                const messages = details.map(d => `${d.field}: ${d.message}`).join('\n');
                alert(`${errorMessage}\n\nChi tiết lỗi:\n${messages}`);
              } else {
                alert(errorMessage);
              }
            } else {
              alert(errorMessage);
            }
          } else if (error.response.status === 409) {
            alert('Địa chỉ ví này đã được sử dụng bởi tài khoản khác!');
          } else if (error.response.status === 401) {
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
            navigate('/login');
          } else {
            const errorMessage = error.response.data?.error?.message || 'Có lỗi xảy ra khi kết nối ví. Vui lòng thử lại!';
            alert(errorMessage);
          }
        } else if (error.code === 4001) {
          // Người dùng từ chối kết nối
          alert('Bạn đã từ chối kết nối ví!');
        } else if (error.code === -32002) {
          // Đang có request kết nối khác đang chờ
          alert('Đang có yêu cầu kết nối ví khác đang chờ xử lý. Vui lòng thử lại sau!');
        } else {
          // Lỗi khác
          alert('Có lỗi xảy ra khi kết nối ví. Vui lòng thử lại!');
        }
        throw error;
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        // Lỗi từ server
        if (error.response.status === 400) {
          alert(error.response.data.message || 'Địa chỉ ví không hợp lệ!');
        } else if (error.response.status === 409) {
          alert('Địa chỉ ví này đã được sử dụng bởi tài khoản khác!');
        } else if (error.response.status === 401) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
          navigate('/login');
        } else {
          alert(error.response.data.message || 'Có lỗi xảy ra khi kết nối ví. Vui lòng thử lại!');
        }
      } else if (error.code === 4001) {
        // Người dùng từ chối kết nối
        alert('Bạn đã từ chối kết nối ví!');
      } else if (error.code === -32002) {
        // Đang có request kết nối khác đang chờ
        alert('Đang có yêu cầu kết nối ví khác đang chờ xử lý. Vui lòng thử lại sau!');
      } else {
        // Lỗi khác
        alert('Có lỗi xảy ra khi kết nối ví. Vui lòng thử lại!');
      }
    } finally {
      setIsConnecting(false);
    }
  };

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
        <Link to="/transparency">Minh bạch</Link>
      </div>

      {/* User & Search Buttons */}
      <div className="user-actions">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-icon">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </form>
        {isAuthenticated && (
          <button 
            className="wallet-button"
            onClick={connectWallet}
            disabled={isConnecting}
            title={walletAddress ? `Đã kết nối: ${walletAddress}` : "Kết nối ví"}
          >
            <FontAwesomeIcon icon={faWallet} />
          </button>
        )}
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
