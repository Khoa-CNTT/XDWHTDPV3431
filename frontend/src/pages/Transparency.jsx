import React, { useState, useEffect } from 'react';
import { transparencyService } from '../services/transparencyService';
import { formatDate } from '../utils/format';
import './Transparency.css';

const Transparency = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [charityNeeds, setCharityNeeds] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, donationsData, charityNeedsData, logsData] = await Promise.all([
          transparencyService.getStats(),
          transparencyService.getAllDonations(),
          transparencyService.getAllCharityNeeds(),
          transparencyService.getLogs()
        ]);

        setStats(statsData);
        setDonations(donationsData);
        setCharityNeeds(charityNeedsData);
        setLogs(logsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lastUpdate]);

  const refreshData = () => {
    setLastUpdate(Date.now());
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'newDonation') {
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="transparency-page">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Thống kê
        </button>
        <button
          className={`tab-button ${activeTab === 'donations' ? 'active' : ''}`}
          onClick={() => setActiveTab('donations')}
        >
          Quyên góp
        </button>
        <button
          className={`tab-button ${activeTab === 'charity-needs' ? 'active' : ''}`}
          onClick={() => setActiveTab('charity-needs')}
        >
          Nhu cầu từ thiện
        </button>
        <button
          className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Nhật ký
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'stats' && (
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Tổng số người dùng</h3>
                <p className="stat-value">{stats?.totalUsers || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Tổng số quyên góp</h3>
                <p className="stat-value">{stats?.totalDonations || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Tổng số nhu cầu từ thiện</h3>
                <p className="stat-value">{stats?.totalCharityNeeds || 0}</p>
              </div>
            </div>
            <div className="recent-charity-needs">
              <h2>Nhu cầu từ thiện gần đây</h2>
              <div className="recent-charity-needs-list">
                {stats?.recentCharityNeeds?.map(need => (
                  <div key={need.id} className="recent-charity-need-item">
                    <h3>{need.title}</h3>
                    <p>Người tạo: {need.created_by?.name || 'Không xác định'}</p>
                    <p>Ngày tạo: {formatDate(need.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="donations-section">
            <h2>Lịch sử quyên góp</h2>
            <div className="donations-table">
              <table>
                <thead>
                  <tr>
                    <th>Người quyên góp</th>
                    <th>Nhu cầu từ thiện</th>
                    <th>Số tiền</th>
                    <th>Ngày quyên góp</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map(donation => (
                    <tr key={donation.id}>
                      <td>{donation.user?.name || 'Anonymous'}</td>
                      <td>{donation.need?.title || 'Không xác định'}</td>
                      <td>{donation.amount}</td>
                      <td>{formatDate(donation.created_at)}</td>
                      <td>{donation.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'charity-needs' && (
          <div className="charity-needs-section">
            <h2>Danh sách nhu cầu từ thiện</h2>
            <div className="charity-needs-grid">
              {charityNeeds.map(need => (
                <div key={need.id} className="charity-need-card">
                  <h3>{need.title}</h3>
                  <p>Người tạo: {need.created_by?.name || 'Không xác định'}</p>
                  <p>Trạng thái: {need.status}</p>
                  <p>Ngày tạo: {formatDate(need.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-section">
            <h2>Nhật ký hoạt động</h2>
            <div className="logs-list">
              {logs.map(log => (
                <div key={log.id} className="log-item">
                  <p className="log-message">{log.message}</p>
                  <p className="log-meta">
                    {log.user?.name || 'System'} - {formatDate(log.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transparency; 