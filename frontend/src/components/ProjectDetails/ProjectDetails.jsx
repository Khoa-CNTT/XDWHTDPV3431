import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/charity-needs/${projectId}`);
        
        // Kiểm tra dữ liệu trả về
        if (!response.data) {
          throw new Error('Dữ liệu dự án không hợp lệ');
        }

        // Map dữ liệu từ API sang định dạng hiển thị
        const projectData = {
          id: response.data.id,
          title: response.data.title,
          organizationName: response.data.organization_name,
          location: response.data.location,
          targetGroup: response.data.target_group,
          itemsNeeded: response.data.items_needed,
          image: response.data.image || "/placeholder-image.jpg",
          raisedAmount: response.data.raised_amount || 0,
          fundingGoal: response.data.funding_goal,
          raisedPercent: response.data.raised_percent || 0,
          blockchainLink: response.data.blockchain_link,
          projectLink: response.data.project_link,
          fundAvatar: response.data.fund_avatar,
          contributions: response.data.contributions || []
        };

        setProject(projectData);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu dự án:', error);
        if (error.response) {
          // Lỗi từ server
          if (error.response.status === 404) {
            setError('Không tìm thấy dự án này. Vui lòng kiểm tra lại ID dự án.');
          } else {
            setError(error.response.data?.message || 'Không thể tải dữ liệu dự án');
          }
        } else if (error.request) {
          // Không nhận được response
          setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        } else {
          // Lỗi khác
          setError(error.message || 'Đã xảy ra lỗi không xác định');
        }
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    } else {
      setError('Không tìm thấy ID dự án');
      setLoading(false);
    }
  }, [projectId]);

  const handleDonate = () => {
    try {
      if (!project) {
        throw new Error('Không có thông tin dự án');
      }
      // Chuyển hướng đến trang quyên góp với ID dự án
      navigate(`/donate/${projectId}`, { 
        state: { 
          projectTitle: project.title,
          projectImage: project.image,
          fundingGoal: project.fundingGoal,
          raisedAmount: project.raisedAmount
        }
      });
    } catch (error) {
      console.error('Lỗi khi chuyển hướng:', error);
      setError('Không thể chuyển đến trang quyên góp. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading">Đang tải thông tin dự án...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error">{error}</p>
        <button 
          className="back-button"
          onClick={() => navigate('/projects')}
        >
          Quay lại danh sách dự án
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="error-container">
        <p className="error">Không tìm thấy thông tin dự án!</p>
        <button 
          className="back-button"
          onClick={() => navigate('/projects')}
        >
          Quay lại danh sách dự án
        </button>
      </div>
    );
  }

  return (
    <div className="project-details">
      <h1 className="project-title">{project.title}</h1>
      <img 
        src={project.image} 
        alt={project.title} 
        className="project-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/placeholder-image.jpg';
        }}
      />
      <div className="project-info-container">
        <p className="project-info"><strong>Danh mục:</strong> {project.targetGroup || 'Chưa cập nhật'}</p>
        <p className="project-info"><strong>Quỹ:</strong> {project.organizationName || 'Chưa cập nhật'}</p>
        <p className="project-info"><strong>Địa điểm:</strong> {project.location || 'Chưa cập nhật'}</p>
        <p className="project-info"><strong>Đối tượng:</strong> {project.targetGroup || 'Chưa cập nhật'}</p>
        <p className="project-info"><strong>Vật phẩm cần thiết:</strong> {project.itemsNeeded || 'Chưa cập nhật'}</p>
        <p className="project-info">
          <strong>Số tiền đã quyên góp:</strong> {Number(project.raisedAmount).toLocaleString()} ETH 
          ({project.raisedPercent}%)
        </p>
        <p className="project-info">
          <strong>Mục tiêu:</strong> {Number(project.fundingGoal).toLocaleString()} ETH
        </p>
      </div>

      <div className="project-actions">
        <button 
          className="donate-button" 
          onClick={handleDonate}
        >
          Quyên góp ngay
        </button>
        {project.blockchainLink && (
          <a 
            href={project.blockchainLink}
            target="_blank"
            rel="noopener noreferrer"
            className="blockchain-link"
          >
            Kiểm tra blockchain
          </a>
        )}
      </div>

      <div className="contributions-section">
        <h3 className="project-subtitle">Lịch sử quyên góp:</h3>
        {project.contributions && project.contributions.length > 0 ? (
          <ul className="transaction-list">
            {project.contributions.map((contribution, index) => (
              <li key={index} className="transaction-item">
                <span className="donor-name">{contribution.user?.name || 'Người quyên góp ẩn danh'}</span>
                <span className="donation-amount">{Number(contribution.amount).toLocaleString()} ETH</span>
                <span className="donation-date">
                  {new Date(contribution.created_at).toLocaleDateString('vi-VN')}
                </span>
                {contribution.message && (
                  <p className="donation-message">{contribution.message}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-transactions">Chưa có giao dịch nào.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;