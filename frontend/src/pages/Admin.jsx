import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Admin.css';

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'users', label: 'Users' },
  { key: 'projects', label: 'Projects' },
  { key: 'donations', label: 'Donations' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'logs', label: 'Activity Logs' },
];

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUsers: 0,
    totalDonations: 0,
    recentProjects: []
  });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [donations, setDonations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');
  const [notification, setNotification] = useState('');
  const [notificationTarget, setNotificationTarget] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, projectsRes, donationsRes, logsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/projects'),
          api.get('/admin/donations'),
          api.get('/admin/logs'),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setProjects(projectsRes.data);
        setDonations(donationsRes.data);
        setLogs(logsRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
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
        setUsers(users.filter(user => user._id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };
  const handleToggleRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };
  const handleToggleLock = async (userId, isLocked) => {
    try {
      await api.patch(`/admin/users/${userId}/lock`, { locked: !isLocked });
      setUsers(users.map(u => u._id === userId ? { ...u, locked: !isLocked } : u));
    } catch (error) {
      console.error('Error locking/unlocking user:', error);
    }
  };

  // --- PROJECTS ---
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/admin/projects/${projectId}`);
        setProjects(projects.filter(project => project._id !== projectId));
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };
  const handleApproveProject = async (projectId) => {
    try {
      await api.patch(`/admin/projects/${projectId}/approve`);
      setProjects(projects.map(p => p._id === projectId ? { ...p, status: 'active' } : p));
    } catch (error) {
      console.error('Error approving project:', error);
    }
  };
  const handleRejectProject = async (projectId) => {
    try {
      await api.patch(`/admin/projects/${projectId}/reject`);
      setProjects(projects.map(p => p._id === projectId ? { ...p, status: 'rejected' } : p));
    } catch (error) {
      console.error('Error rejecting project:', error);
    }
  };

  // --- NOTIFICATIONS ---
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notification) return;
    try {
      await api.post('/admin/notifications', {
        message: notification,
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
  const filteredProjects = projects.filter(p =>
    (projectStatusFilter === 'all' || p.status === projectStatusFilter) &&
    (p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.creator.name.toLowerCase().includes(projectSearch.toLowerCase()))
  );

  // --- RENDER ---
  const renderDashboard = () => (
    <div className="admin-dashboard">
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p className="stat-number">{stats.totalProjects}</p>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Donations</h3>
          <p className="stat-number">{stats.totalDonations}</p>
        </div>
      </div>
      <div className="recent-projects">
        <h2>Recent Projects</h2>
        {stats.recentProjects.length > 0 ? (
          <div className="projects-list">
            {stats.recentProjects.map(project => (
              <div key={project._id} className="project-item">
                <h4>{project.title}</h4>
                <p>Created by: {project.creator.name}</p>
                <p>Status: {project.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent projects</p>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-users">
      <h2>User Management</h2>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={userSearch}
        onChange={e => setUserSearch(e.target.value)}
        style={{marginBottom: 16, padding: 8, borderRadius: 6, border: '1px solid #ddd', width: 260}}
      />
      {filteredUsers.length > 0 ? (
        <div className="users-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role === 'admin' ? 'admin-badge' : 'user-badge'}`}>{user.role}</span>
                  </td>
                  <td>
                    {user.locked ? <span className="status-badge cancelled">Locked</span> : <span className="status-badge active">Active</span>}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="action-btn" onClick={() => handleToggleRole(user._id, user.role)}>{user.role === 'admin' ? 'Set User' : 'Set Admin'}</button>
                    <button className="action-btn" onClick={() => handleToggleLock(user._id, user.locked)}>{user.locked ? 'Unlock' : 'Lock'}</button>
                    <button className="action-btn delete-btn" onClick={() => handleDeleteUser(user._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No users found</p>
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="admin-projects">
      <h2>Project Management</h2>
      <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
        <input
          type="text"
          placeholder="Search by title or creator..."
          value={projectSearch}
          onChange={e => setProjectSearch(e.target.value)}
          style={{padding:8,borderRadius:6,border:'1px solid #ddd',width:220}}
        />
        <select value={projectStatusFilter} onChange={e=>setProjectStatusFilter(e.target.value)} style={{padding:8,borderRadius:6,border:'1px solid #ddd'}}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {filteredProjects.length > 0 ? (
        <div className="projects-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Creator</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr key={project._id}>
                  <td>{project.title}</td>
                  <td>{project.creator.name}</td>
                  <td><span className={`status-badge ${project.status.toLowerCase()}`}>{project.status}</span></td>
                  <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                  <td>
                    {project.status === 'pending' && <button className="action-btn" onClick={()=>handleApproveProject(project._id)}>Approve</button>}
                    {project.status === 'pending' && <button className="action-btn" onClick={()=>handleRejectProject(project._id)}>Reject</button>}
                    <button className="action-btn delete-btn" onClick={()=>handleDeleteProject(project._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No projects found</p>
      )}
    </div>
  );

  const renderDonations = () => (
    <div className="admin-donations">
      <h2>Donations History</h2>
      {donations.length > 0 ? (
        <div className="donations-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Project</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d._id}>
                  <td>{d.user?.name || 'N/A'}</td>
                  <td>{d.project?.title || 'N/A'}</td>
                  <td>{d.amount.toLocaleString()} đ</td>
                  <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No donations found</p>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="admin-notifications">
      <h2>Send Notification</h2>
      <form onSubmit={handleSendNotification} style={{marginBottom:24}}>
        <textarea
          value={notification}
          onChange={e=>setNotification(e.target.value)}
          placeholder="Enter notification message..."
          rows={3}
          style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ddd',marginBottom:8}}
        />
        <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:8}}>
          <label>Target:</label>
          <select value={notificationTarget} onChange={e=>setNotificationTarget(e.target.value)} style={{padding:8,borderRadius:6,border:'1px solid #ddd'}}>
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>
        <button className="action-btn" type="submit">Send Notification</button>
      </form>
      {/* Có thể hiển thị danh sách thông báo đã gửi ở đây nếu muốn */}
    </div>
  );

  const renderLogs = () => (
    <div className="admin-logs">
      <h2>Activity Logs</h2>
      {logs.length > 0 ? (
        <div className="logs-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.user?.name || 'System'}</td>
                  <td>{log.action}</td>
                  <td>{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No logs found</p>
      )}
    </div>
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
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
              {activeTab === 'projects' && renderProjects()}
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