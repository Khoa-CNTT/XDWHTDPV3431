import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          setProject(projectSnap.data());
        } else {
          console.log('Không tìm thấy dự án!');
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu dự án:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) return <p className="loading">Đang tải...</p>;
  if (!project) return <p className="error">Không tìm thấy dự án!</p>;

  return (
    <div className="project-details">
      <h1 className="project-title">{project.title}</h1>
      <img src={project.image} alt={project.title} className="project-image" />
      <p className="project-info"><strong>Danh mục:</strong> {project.category}</p>
      <p className="project-info"><strong>Quỹ:</strong> {project.fundName}</p>
      <p className="project-info"><strong>Số tiền đã quyên góp:</strong> {project.raisedAmount} ({project.raisedPercent})</p>
      <p className="project-info"><strong>Mục tiêu:</strong> {project.fundingGoal}</p>
      <button 
        className="donate-button" 
        onClick={() => {
          if (project.projectLink != "none") {
            window.open(project.projectLink, '_blank');
          } else {
            navigate(`/projects/${projectId}/payment`);
          }
        }}
      >
        Quyên góp ngay
      </button>
      <h3 className="project-subtitle">Giao dịch:</h3>
      {project.transactions && project.transactions.length > 0 ? (
        <ul className="transaction-list">
          {project.transactions.map((txn, index) => (
            <li key={index} className="transaction-item">
              {txn.donorName} - {txn.amount} - {txn.date}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-transactions">Chưa có giao dịch nào.</p>
      )}
      
    </div>
  );
};

export default ProjectDetails;