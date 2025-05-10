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
        const statsRes = await api.get('/admin/stats');
        console.log('Stats response:', statsRes.data);
        setStats(statsRes.data);

        // Fetch users
        const usersRes = await api.get('/admin/users');
        console.log('Users response:', usersRes.data);
        setUsers(usersRes.data);

        // Fetch charity needs
        const charityNeedsRes = await api.get('/admin/charity-needs');
        console.log('Charity needs response:', charityNeedsRes.data);
        setCharityNeeds(charityNeedsRes.data);

        // Fetch donations
        const donationsRes = await api.get('/admin/donations');
        console.log('Donations response:', donationsRes.data);
        setDonations(donationsRes.data);

        // Fetch logs
        const logsRes = await api.get('/admin/logs');
        console.log('Logs response:', logsRes.data);
        setLogs(logsRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error.response || error);
        if (error.response) {
          console.error('Error status:', error.response.status);
          console.error('Error data:', error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  // --- USERS ---
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
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
    if (window.confirm('Are you sure you want to delete this charity need?')) {
      try {
        await api.delete(`/admin/charity-needs/${needId}`);
        setCharityNeeds(charityNeeds.filter(need => need.id !== needId));
      } catch (error) {
        console.error('Error deleting charity need:', error);
      }
    }
  };

  const handleApproveCharityNeed = async (needId) => {
    try {
      await api.patch(`/admin/charity-needs/${needId}/approve`);
      setCharityNeeds(charityNeeds.map(n => n.id === needId ? { ...n, status: 'active' } : n));
    } catch (error) {
      console.error('Error approving charity need:', error);
    }
  };

  const handleRejectCharityNeed = async (needId) => {
    try {
      await api.patch(`/admin/charity-needs/${needId}/reject`);
      setCharityNeeds(charityNeeds.map(n => n.id === needId ? { ...n, status: 'rejected' } : n));
    } catch (error) {
      console.error('Error rejecting charity need:', error);
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
      n.creator.name.toLowerCase().includes(charityNeedSearch.toLowerCase()))
  );

  // --- RENDER ---
  const renderDashboard = () => (
    <div className="admin-dashboard">
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Charity Needs</h3>
          <p className="stat-number">{stats.totalCharityNeeds}</p>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Contributions</h3>
          <p className="stat-number">{stats.totalContributions}</p>
        </div>
      </div>
      <div className="recent-charity-needs">
        <h2>Recent Charity Needs</h2>
        {stats.recentCharityNeeds.length > 0 ? (
          <div className="charity-needs-list">
            {stats.recentCharityNeeds.map(need => (
              <div key={need.id} className="charity-need-item">
                <h4>{need.title}</h4>
                <p>Created by: {need.creator.name}</p>
                <p>Status: {need.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent charity needs</p>
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
          <option value="active">Đang hoạt động</option>
          <option value="rejected">Đã từ chối</option>
        </select>
      </div>
      <div className="charity-needs-list">
        {filteredCharityNeeds.map(need => (
          <div key={need.id} className="charity-need-item">
            <div className="charity-need-info">
              <h4>{need.title}</h4>
              <p>Người tạo: {need.creator.name}</p>
              <span className={`status-badge ${need.status}`}>
                {need.status === 'pending' ? 'Đang chờ duyệt' :
                 need.status === 'active' ? 'Đang hoạt động' : 'Đã từ chối'}
              </span>
              <p className="description">{need.description}</p>
            </div>
            <div className="charity-need-actions">
              {need.status === 'pending' && (
                <>
                  <button onClick={() => handleApproveCharityNeed(need.id)} className="approve-btn">
                    Duyệt
                  </button>
                  <button onClick={() => handleRejectCharityNeed(need.id)} className="reject-btn">
                    Từ chối
                  </button>
                </>
              )}
              <button onClick={() => handleDeleteCharityNeed(need.id)} className="delete-btn">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDonations = () => (
    <div className="admin-donations">
      <h2>Donations Management</h2>
      <div className="donations-list">
        {donations.map(donation => (
          <div key={donation.id} className="donation-item">
            <div className="donation-info">
              <h4>Donation #{donation.id}</h4>
              <p>Donor: {donation.user.name}</p>
              <p>Charity Need: {donation.need.title}</p>
              <p>Amount: ${donation.amount}</p>
              <p>Status: {donation.status}</p>
              <p>Date: {new Date(donation.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="admin-notifications">
      <h2>Send Notification</h2>
      <form onSubmit={handleSendNotification}>
        <div className="form-group">
          <label>Message:</label>
          <textarea
            value={notification}
            onChange={(e) => setNotification(e.target.value)}
            placeholder="Enter notification message..."
            required
          />
        </div>
        <div className="form-group">
          <label>Target:</label>
          <select
            value={notificationTarget}
            onChange={(e) => setNotificationTarget(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="donors">Donors Only</option>
            <option value="recipients">Recipients Only</option>
          </select>
        </div>
        <button type="submit">Send Notification</button>
      </form>
    </div>
  );

  const renderLogs = () => (
    <div className="admin-logs">
      <h2>Activity Logs</h2>
      <div className="logs-list">
        {logs.map(log => (
          <div key={log.id} className="log-item">
            <div className="log-info">
              <p>Action: {log.action}</p>
              <p>User: {log.evaluator.name}</p>
              <p>Date: {new Date(log.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-logo">Admin Panel</div>
        <div className="admin-user-info">
          <p>Welcome, {user?.name}</p>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
        <nav className="admin-nav">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`nav-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="admin-content">
        <div className="admin-header">
          <h1>{TABS.find(t=>t.key===activeTab)?.label || ''}</h1>
        </div>
        <div className="admin-main">
          {loading ? <div className="loading">Loading...</div> : (
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