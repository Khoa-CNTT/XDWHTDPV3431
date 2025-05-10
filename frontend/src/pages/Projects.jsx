import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Projects.css";

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projectList, setProjectList] = useState([]);
  const [selectedQr, setSelectedQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5000/api/charity-needs');
        // Map dữ liệu từ API sang định dạng hiển thị
        const formattedData = response.data.map(item => ({
          id: item.id,
          title: item.title,
          organizationName: item.organization_name,
          location: item.location,
          targetGroup: item.target_group,
          itemsNeeded: item.items_needed,
          image: item.image,
          raisedAmount: item.raised_amount,
          fundingGoal: item.funding_goal,
          raisedPercent: item.raised_percent,
          blockchainLink: item.blockchain_link,
          projectLink: item.project_link,
          fundAvatar: item.fund_avatar,
          isInterested: item.is_interested
        }));
        setProjectList(formattedData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dự án:", error);
        setError("Không thể tải dữ liệu dự án. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleInterestToggle = async (projectId) => {
    try {
      // Gọi API để cập nhật trạng thái quan tâm
      await axios.patch(`http://localhost:5000/api/charity-needs/${projectId}/toggle-interest`);
      
      // Cập nhật state local
      setProjectList((prevList) =>
        prevList.map((project) =>
          project.id === projectId
            ? { ...project, isInterested: !project.isInterested }
            : project
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái quan tâm:", error);
    }
  };

  const toggleQrCode = (projectLink) => {
    setSelectedQr(selectedQr === projectLink ? null : projectLink);
  };

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="projects-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu dự án...</p>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <div className="projects-page">
        <div className="error-container">
          <h2>Đã xảy ra lỗi</h2>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo khi không có dự án
  if (projectList.length === 0) {
    return (
      <div className="projects-page">
        <h1>Chương trình từ thiện</h1>
        <div className="no-projects">
          <p>Hiện chưa có chương trình từ thiện nào đang hoạt động.</p>
          <button 
            className="create-project-button"
            onClick={() => navigate('/create')}
          >
            Tạo chương trình mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <h1>Chương trình từ thiện</h1>
      <p>Hãy chọn chương trình từ thiện mà bạn muốn hỗ trợ</p>
      <div className="project-list">
        {projectList.map((project) => (
          <div key={project.id} className="project-item">
            <img
              src={project.image || "/placeholder-image.jpg"}
              alt={project.title}
              className="project-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-image.jpg";
              }}
            />

            <h3>{project.organizationName || "Tổ chức từ thiện"}</h3>
            <h2>{project.title}</h2>
            
            <div className="project-details">
              <p className="location">
                <i className="fas fa-map-marker-alt"></i> {project.location || "Địa điểm"}
              </p>
              <p className="target-group">
                <i className="fas fa-users"></i> {project.targetGroup || "Đối tượng hưởng lợi"}
              </p>
              <p className="items-needed">
                <i className="fas fa-box"></i> {project.itemsNeeded || "Nhu yếu phẩm cần thiết"}
              </p>
            </div>

            <button
              onClick={() => handleInterestToggle(project.id)}
              className={`interest-btn ${
                project.isInterested ? "interested" : ""
              }`}
            >
              <span className="interest-icon">
                {project.isInterested ? "✓" : "+"}
              </span>
            </button>

            <div className="progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${project.raisedPercent}%` }}
                />
              </div>
              <p className="amount">Đã quyên góp: {project.raisedAmount} ETH</p>
              <p className="target">Mục tiêu: {project.fundingGoal} ETH</p>
            </div>

            <div className="project-actions">
              <div className="action-buttons">
                <button
                  onClick={() => navigate(`/charity-needs/${project.id}`)}
                  className="button details-btn"
                >
                  Xem chi tiết
                </button>
                <a 
                  href={project.blockchainLink || "#"} 
                  className="button fund-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kiểm tra blockchain
                </a>
                <button
                  onClick={() => toggleQrCode(project.projectLink)}
                  className="button qr-btn"
                >
                  {selectedQr === project.projectLink ? "Đóng QR" : "Mở QR"}
                </button>
              </div>
            </div>

            {selectedQr === project.projectLink && (
              <div className="qr-code">
                <img
                  src={project.fundAvatar || "/placeholder-qr.jpg"}
                  alt={`QR Code for ${project.title}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-qr.jpg";
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="view-all">
        <button className="button view-all-btn">Xem tất cả</button>
      </div>
    </div>
  );
};

export default ProjectsPage;
