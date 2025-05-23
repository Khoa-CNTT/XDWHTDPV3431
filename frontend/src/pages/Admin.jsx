import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Admin.css';

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'users', label: 'Users' },
  { key: 'charity-needs', label: 'Charity Needs' },
  { key: 'donations', label: 'Donations' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'logs', label: 'Activity Logs' },
];

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalCharityNeeds: 0,
    totalUsers: 0,
    totalContributions: 0,
    recentCharityNeeds: []
  });
  const [users, setUsers] = useState([]);
  const [charityNeeds, setCharityNeeds] = useState([]);
  const [donations, setDonations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [charityNeedSearch, setCharityNeedSearch] = useState('');
  const [charityNeedStatusFilter, setCharityNeedStatusFilter] = useState('all');
  const [notification, setNotification] = useState('');
  const [notificationTarget, setNotificationTarget] = useState('all');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      console.log('User not admin:', user);
      navigate('/');
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Current user:', user);
        console.log('Token:', localStorage.getItem('token'));
        console.log('Fetching admin data...');
        
        // Fetch stats
        console.log('Fetching stats...');
        const statsRes = await api.get('/admin/stats');
        console.log('Stats response:', JSON.stringify(statsRes.data, null, 2));
        setStats(statsRes.data);

        // Fetch users
        console.log('Fetching users...');
        const usersRes = await api.get('/admin/users');
        console.log('Users response:', JSON.stringify(usersRes.data, null, 2));
        setUsers(usersRes.data);

        // Fetch charity needs
        console.log('Fetching charity needs...');
        const charityNeedsRes = await api.get('/admin/charity-needs');
        console.log('Charity needs response:', JSON.stringify(charityNeedsRes.data, null, 2));
        setCharityNeeds(charityNeedsRes.data);

        // Fetch donations
        console.log('Fetching donations...');
        const donationsRes = await api.get('/admin/donations');
        console.log('Donations response:', JSON.stringify(donationsRes.data, null, 2));
        setDonations(donationsRes.data);

        // Fetch logs
        console.log('Fetching logs...');
        const logsRes = await api.get('/admin/logs');
        console.log('Logs response:', JSON.stringify(logsRes.data, null, 2));
        setLogs(logsRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        if (error.response) {
          console.error('Error status:', error.response.status);
          console.error('Error data:', error.response.data);
          console.error('Error headers:', error.response.headers);
        } else if (error.request) {
          console.error('Error request:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  // --- USERS ---
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này không?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const handleToggleLock = async (userId, isLocked) => {
    try {
      await api.patch(`/admin/users/${userId}/lock`, { isLocked: !isLocked });
      setUsers(users.map(u => u.id === userId ? { ...u, isLocked: !isLocked } : u));
    } catch (error) {
      console.error('Error locking/unlocking user:', error);
    }
  };

  // --- CHARITY NEEDS ---
  const handleDeleteCharityNeed = async (needId) => {
    const needToDelete = charityNeeds.find(need => need.id === needId);
    if (!needToDelete) return;

    const confirmMessage = `Bạn có chắc chắn muốn xóa dự án "${needToDelete.title}"?\n\n` +
      `- Người tạo: ${needToDelete.creator ? needToDelete.creator.name : 'Không xác định'}\n` +
      `- Trạng thái: ${needToDelete.status}\n` +
      `- Số tiền đã quyên góp: ${needToDelete.raised_amount || 0} ETH\n\n` +
      `Lưu ý: Hành động này không thể hoàn tác!`;

    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);
        const response = await api.delete(`/admin/charity-needs/${needId}`);
        
        if (response.data && response.data.message) {
          setCharityNeeds(charityNeeds.filter(need => need.id !== needId));
          setStats(prevStats => ({
            ...prevStats,
            totalCharityNeeds: prevStats.totalCharityNeeds - 1,
            recentCharityNeeds: prevStats.recentCharityNeeds.filter(need => need.id !== needId)
          }));
          alert('Đã xóa dự án thành công!');
        } else {
          throw new Error('Không nhận được phản hồi hợp lệ từ server');
        }
      } catch (error) {
        console.error('Error deleting charity need:', error);
        let errorMessage = 'Không thể xóa dự án. ';
        
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage += 'Dự án không tồn tại.';
          } else if (error.response.status === 403) {
            errorMessage += 'Bạn không có quyền xóa dự án này.';
          } else if (error.response.data && error.response.data.message) {
            errorMessage += error.response.data.message;
          } else {
            errorMessage += 'Vui lòng thử lại sau.';
          }
        } else if (error.request) {
          errorMessage += 'Không thể kết nối đến server.';
        } else {
          errorMessage += error.message || 'Vui lòng thử lại sau.';
        }
        
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleApproveCharityNeed = async (needId) => {
    try {
      await api.patch(`/admin/charity-needs/${needId}/approve`);
      setCharityNeeds(charityNeeds.map(n => n.id === needId ? { ...n, status: 'approved' } : n));
      alert('Đã phê duyệt dự án thành công!');
    } catch (error) {
      console.error('Error approving charity need:', error);
      alert('Không thể phê duyệt dự án. Vui lòng thử lại sau.');
    }
  };

  const handleRejectCharityNeed = async (needId) => {
    const need = charityNeeds.find(n => n.id === needId);
    if (!need) return;
    
    setSelectedNeed(need);
    setRejectModalVisible(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }

    try {
      await api.patch(`/admin/charity-needs/${selectedNeed.id}/reject`, {
        reason: rejectReason
      });
      setCharityNeeds(charityNeeds.map(n => 
        n.id === selectedNeed.id ? { ...n, status: 'rejected' } : n
      ));
      setRejectModalVisible(false);
      setRejectReason('');
      alert('Đã từ chối dự án thành công!');
    } catch (error) {
      console.error('Error rejecting charity need:', error);
      alert('Không thể từ chối dự án. Vui lòng thử lại sau.');
    }
  };

  // --- NOTIFICATIONS ---
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notification) return;
    try {
      await api.post('/admin/notifications', {
        title: 'Admin Notification',
        content: notification,
        target: notificationTarget,
      });
      setNotification('');
      alert('Notification sent!');
    } catch (error) {
      alert('Error sending notification');
    }
  };

  // --- FILTERS ---
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredCharityNeeds = charityNeeds.filter(n =>
    (charityNeedStatusFilter === 'all' || n.status === charityNeedStatusFilter) &&
    (n.title.toLowerCase().includes(charityNeedSearch.toLowerCase()) ||
      (n.creator ? n.creator.name.toLowerCase().includes(charityNeedSearch.toLowerCase()) : false))
  );

  // --- RENDER ---
  const renderDashboard = () => (
    <div className="admin-dashboard">
      <div className="stats-container">
        <div className="stat-card">
          <h3>Tổng số nhu cầu từ thiện</h3>
          <p className="stat-number">{stats.totalCharityNeeds}</p>
        </div>
        <div className="stat-card">
          <h3>Tổng số người dùng</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Tổng số đóng góp</h3>
          <p className="stat-number">{stats.totalContributions}</p>
        </div>
      </div>
      <div className="recent-charity-needs">
        <h2>Nhu cầu từ thiện gần đây</h2>
        {stats.recentCharityNeeds.length > 0 ? (
          <div className="charity-needs-list">
            {stats.recentCharityNeeds.map(need => (
              <div key={need.id} className="charity-need-item">
                <h4>{need.title}</h4>
                <p>Người tạo: {need.creator ? need.creator.name : 'Không xác định'}</p>
                <p>Trạng thái: {need.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Không có nhu cầu từ thiện gần đây</p>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-users">
      <h2>Quản lý người dùng</h2>
      <input
        type="text"
        placeholder="Tìm kiếm theo tên hoặc email..."
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
        className="search-input"
      />
      <div className="users-list">
        {filteredUsers.map(user => (
          <div key={user.id} className="user-item">
            <div className="user-info">
              <h4>{user.name}</h4>
              <p>{user.email}</p>
              <span className={`role-badge ${user.role}`}>
                {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
              </span>
              <span className={`status-badge ${user.isLocked ? 'locked' : 'active'}`}>
                {user.isLocked ? 'Đã khóa' : 'Đang hoạt động'}
              </span>
            </div>
            <div className="user-actions">
              <button onClick={() => handleToggleRole(user.id, user.role)}>
                {user.role === 'admin' ? 'Chuyển thành User' : 'Chuyển thành Admin'}
              </button>
              <button onClick={() => handleToggleLock(user.id, user.isLocked)}>
                {user.isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
              </button>
              <button onClick={() => handleDeleteUser(user.id)} className="delete-btn">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCharityNeeds = () => (
    <div className="admin-charity-needs">
      <h2>Quản lý nhu cầu từ thiện</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="Tìm kiếm theo tiêu đề hoặc người tạo..."
          value={charityNeedSearch}
          onChange={(e) => setCharityNeedSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={charityNeedStatusFilter}
          onChange={(e) => setCharityNeedStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Đang chờ duyệt</option>
          <option value="approved">Đã phê duyệt</option>
          <option value="rejected">Đã từ chối</option>
        </select>
      </div>
      <div className="charity-needs-list">
        {filteredCharityNeeds.map(need => (
          <div key={need.id} className="charity-need-item">
            <div className="charity-need-info">
              <h4>{need.title}</h4>
              <p>Người tạo: {need.creator ? need.creator.name : 'Không xác định'}</p>
              <span className={`status-badge ${need.status}`}>
                {need.status === 'pending' ? 'Đang chờ duyệt' :
                 need.status === 'approved' ? 'Đã phê duyệt' : 'Đã từ chối'}
              </span>
              <p className="description">{need.description}</p>
              <p className="funding-info">
                Đã quyên góp: {Number(need.raised_amount || 0).toLocaleString()} ETH /
                Mục tiêu: {Number(need.funding_goal).toLocaleString()} ETH
              </p>
            </div>
            <div className="charity-need-actions">
              {need.status === 'pending' && (
                <>
                  <button 
                    onClick={() => handleApproveCharityNeed(need.id)} 
                    className="approve-btn"
                    title="Phê duyệt dự án này"
                  >
                    Duyệt
                  </button>
                  <button 
                    onClick={() => handleRejectCharityNeed(need.id)} 
                    className="reject-btn"
                    title="Từ chối dự án này"
                  >
                    Từ chối
                  </button>
                </>
              )}
              <button 
                onClick={() => handleDeleteCharityNeed(need.id)} 
                className="delete-btn"
                title="Xóa dự án này"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {rejectModalVisible && selectedNeed && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Từ chối dự án</h3>
            <p>Dự án: {selectedNeed.title}</p>
            <div className="form-group">
              <label>Lý do từ chối:</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối dự án..."
                rows={4}
                required
              />
            </div>
            <div className="modal-actions">
              <button 
                onClick={handleConfirmReject}
                className="confirm-btn"
              >
                Xác nhận
              </button>
              <button 
                onClick={() => {
                  setRejectModalVisible(false);
                  setRejectReason('');
                }}
                className="cancel-btn"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDonations = () => (
    <div className="admin-donations">
      <h2>Quản lý quyên góp</h2>
      <div className="donations-list">
        {donations.map(donation => (
          <div key={donation.id} className="donation-item">
            <div className="donation-info">
              <h4>Quyên góp #{donation.id}</h4>
              <p>Người quyên góp: {donation.user ? donation.user.name : 'Không xác định'}</p>
              <p>Nhu cầu từ thiện: {donation.need ? donation.need.title : 'Không xác định'}</p>
              <p>Số tiền: ${donation.amount}</p>
              <p>Trạng thái: {donation.status}</p>
              <p>Ngày: {new Date(donation.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="admin-notifications">
      <h2>Gửi thông báo</h2>
      <form onSubmit={handleSendNotification}>
        <div className="form-group">
          <label>Thông điệp:</label>
          <textarea
            value={notification}
            onChange={(e) => setNotification(e.target.value)}
            placeholder="Nhập thông điệp thông báo..."
            required
          />
        </div>
        <div className="form-group">
          <label>Đối tượng:</label>
          <select
            value={notificationTarget}
            onChange={(e) => setNotificationTarget(e.target.value)}
          >
            <option value="all">Tất cả người dùng</option>
            <option value="donors">Chỉ người quyên góp</option>
            <option value="recipients">Chỉ người nhận</option>
          </select>
        </div>
        <button type="submit">Gửi thông báo</button>
      </form>
    </div>
  );

  const renderLogs = () => (
    <div className="admin-logs">
      <h2>Nhật ký hoạt động</h2>
      <div className="logs-list">
        {logs.map(log => (
          <div key={log.id} className="log-item">
            <div className="log-info">
              <p>Hành động: {log.action}</p>
              <p>Người dùng: {log.admin ? log.admin.name : 'Hệ thống'}</p>
              <p>Ngày: {new Date(log.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTabChange = (tabKey) => {
    console.log('Changing tab to:', tabKey);
    setActiveTab(tabKey);
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-logo">Bảng quản trị</div>
        <div className="admin-user-info">
          <p>Chào mừng, {user ? user.name : 'Không xác định'}</p>
          <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
        </div>
        <nav className="admin-nav">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`nav-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="admin-content">
        <div className="admin-header">
          <h1>{TABS.find(t => t.key === activeTab)?.label || ''}</h1>
        </div>
        <div className="admin-main">
          {loading ? <div className="loading">Đang tải...</div> : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'charity-needs' && renderCharityNeeds()}
              {activeTab === 'donations' && renderDonations()}
              {activeTab === 'notifications' && renderNotifications()}
              {activeTab === 'logs' && renderLogs()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;