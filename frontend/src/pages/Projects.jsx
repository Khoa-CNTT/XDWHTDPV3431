import React, { useState, useEffect } from "react";
import { db, collection, getDocs } from "../firebase"; // Import Firestore
import { useNavigate } from "react-router-dom";
import "./Projects.css";

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projectList, setProjectList] = useState([]);
  const [selectedQr, setSelectedQr] = useState(null);

  // Lấy dữ liệu từ Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const projectsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjectList(projectsData);
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

  return (
    <div className="projects-page">
      <h1>Dự án đang gây quỹ</h1>
      <p>Hãy lựa chọn đồng hành cùng dự án mà bạn quan tâm</p>
      <div className="project-list">
        {projectList.map((project) => (
          <div key={project.id} className="project-item">
            <img
              src={project.image}
              alt={project.title}
              className="project-image"
            />

            <h3>{project.fundName}</h3>
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
                  style={{ width: project.raisedPercent }}
                />
              </div>
              <p className="amount">Đã nhận: {project.raisedAmount}</p>
              <p className="target">Mục tiêu: {project.fundingGoal}</p>
            </div>

            <div className="project-actions">
              <div className="action-buttons">
                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="button details-btn"
                >
                  Xem chi tiết
                </button>
                <a href="https://www.google.com/" className="button fund-btn">
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
                  src={project.fundAvatar}
                  alt={`QR Code for ${project.title}`}
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
