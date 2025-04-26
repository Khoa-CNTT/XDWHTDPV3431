import React, { useState, useEffect } from "react";
import { db, collection, getDocs } from "../firebase"; // Import Firestore
import { useNavigate } from "react-router-dom";
import "./Projects.css";

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projectList, setProjectList] = useState([]);
  const [selectedQr, setSelectedQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy dữ liệu từ Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjectList(projectsData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dự án:", error);
        setError("Không thể tải dữ liệu dự án. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleInterestToggle = (projectId) => {
    setProjectList((prevList) =>
      prevList.map((project) =>
        project.id === projectId
          ? { ...project, isInterested: !project.isInterested }
          : project
      )
    );
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
        <h1>Dự án đang gây quỹ</h1>
        <div className="no-projects">
          <p>Hiện chưa có dự án nào đang gây quỹ.</p>
          <button 
            className="create-project-button"
            onClick={() => navigate('/create')}
          >
            Tạo dự án mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <h1>Dự án đang gây quỹ</h1>
      <p>Hãy lựa chọn đồng hành cùng dự án mà bạn quan tâm</p>
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

            <h3>{project.fundName || "Quỹ từ thiện"}</h3>
            <h2>{project.title}</h2>

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
                  style={{ width: project.raisedPercent || "0%" }}
                />
              </div>
              <p className="amount">Đã nhận: {project.raisedAmount || "0 ETH"}</p>
              <p className="target">Mục tiêu: {project.fundingGoal || "0 ETH"}</p>
            </div>

            <div className="project-actions">
              <div className="action-buttons">
                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="button details-btn"
                >
                  Xem chi tiết
                </button>
                <a 
                  href={project.statementLink || "#"} 
                  className="button fund-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kiểm tra sao kê
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
