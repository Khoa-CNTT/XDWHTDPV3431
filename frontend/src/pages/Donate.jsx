import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Donate.css'; // Import file CSS

const Donate = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Lấy danh sách tất cả dự án nếu không có projectId
  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setSelectedProjectId('');
      setLoading(true);
      axios.get('/api/charity-needs')
        .then(res => {
          const projects = res.data.data || res.data;
          setAllProjects(Array.isArray(projects) ? projects : []);
        })
        .catch(err => {
          console.error('Error fetching projects:', err);
          setError('Không thể tải danh sách dự án.');
        })
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  // Lấy thông tin dự án khi có projectId hoặc đã chọn từ combo box
  useEffect(() => {
    let id = projectId || selectedProjectId;
    if (!id) return;
    setLoading(true);
    setError('');
    axios.get(`/api/charity-needs/${id}`)
      .then(res => {
        if (res.data) {
          setProject({
            projectTitle: res.data.title,
            projectImage: res.data.image,
            fundingGoal: res.data.funding_goal,
            raisedAmount: res.data.raised_amount
          });
        }
      })
      .catch(err => {
        console.error('Error fetching project details:', err);
        setError('Không thể lấy thông tin dự án. Vui lòng thử lại.');
        // Nếu lỗi 404, chuyển về trang chủ
        if (err.response && err.response.status === 404) {
          navigate('/');
        }
      })
      .finally(() => setLoading(false));
  }, [projectId, selectedProjectId, navigate]);

  const handleDonate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const id = projectId || selectedProjectId;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.post(
        `/api/blockchain/needs/${id}/contribute`,
        {
          amount: parseFloat(amount),
          message: message
        },
        config
      );
      if (response.data && (response.data.success || response.data.message)) {
        localStorage.setItem('newDonation', Date.now().toString());
        setTimeout(() => {
          localStorage.removeItem('newDonation');
        }, 1000);
        navigate(`/projects/${id}`, { 
          state: { 
            success: true,
            message: 'Cảm ơn bạn đã quyên góp!'
          }
        });
      } else {
        setError(response.data.message || 'Không thể thực hiện quyên góp. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi khi thực hiện quyên góp:', error);
      setError(error.response?.data?.message || 'Lỗi khi thực hiện quyên góp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Nếu không có projectId và chưa chọn dự án, hiển thị combo box chọn dự án
  if (!projectId && !selectedProjectId) {
    return (
      <div className="donation-form-container">
        <h2>Chọn dự án để quyên góp</h2>
        {loading ? (
          <p className="loading">Đang tải danh sách dự án...</p>
        ) : (
          <div className="form-group">
            <label htmlFor="project-select">Dự án:</label>
            <select
              id="project-select"
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
            >
              <option value="">-- Chọn dự án --</option>
              {allProjects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading">Đang tải thông tin dự án...</p>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="donation-form-container">
      <div className="project-summary">
        <h2>Quyên Góp Cho Dự Án</h2>
        <h3>{project.projectTitle}</h3>
        {project.projectImage && (
          <img 
            src={project.projectImage} 
            alt={project.projectTitle} 
            className="project-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        )}
        <div className="funding-info">
          <p>Đã quyên góp: {Number(project.raisedAmount).toLocaleString()} ETH</p>
          <p>Mục tiêu: {Number(project.fundingGoal).toLocaleString()} ETH</p>
        </div>
      </div>

      <form onSubmit={handleDonate} className="donation-form">
        <div className="form-group">
          <label htmlFor="amount">Số tiền quyên góp (ETH):</label>
          <input
            type="number"
            id="amount"
            placeholder="Nhập số ETH (VD: 0.1)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.0001"
            step="0.0001"
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Lời nhắn (không bắt buộc):</label>
          <textarea
            id="message"
            placeholder="Nhập lời nhắn của bạn..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate(projectId ? `/projects/${projectId}` : '/')}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="donate-button" 
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Quyên Góp Ngay'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Donate;