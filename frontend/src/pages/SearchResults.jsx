import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button/Button";
import "./SearchResults.css";

const SearchResults = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("q") || "";
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:5000/api/charity-needs');
        
        // Lọc dự án theo tiêu đề hoặc mô tả
        const filtered = response.data.data.filter(campaign => 
          campaign.title.toLowerCase().includes(query.toLowerCase()) ||
          (campaign.description && campaign.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        setCampaigns(filtered);
      } catch (err) {
        console.error("Lỗi khi tìm kiếm:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (query.trim()) {
      fetchCampaigns();
    } else {
      setCampaigns([]);
      setLoading(false);
    }
  }, [query]);

  if (loading) {
    return (
      <div className="search-results-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tìm kiếm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results-page">
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

  return (
    <div className="search-results-page">
      <h2>Kết quả tìm kiếm cho: <span className="search-query">{query}</span></h2>
      
      {campaigns.length === 0 ? (
        <div className="no-results">
          <p>Không tìm thấy dự án phù hợp với từ khóa "{query}"</p>
        </div>
      ) : (
        <div className="campaign-grid">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="campaign-item">
              <div className="campaign-image">
                <img 
                  src={campaign.image || '/default-image.jpg'} 
                  alt={campaign.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-image.jpg';
                  }}
                />
                <div className="campaign-hover">
                  <Link to={`/projects/${campaign.id}`}>
                    <Button text="Quyên góp ngay" variant="slide" />
                  </Link>
                </div>
              </div>
              <div className="campaign-info">
                <h3>{campaign.title}</h3>
                <p className="description">{campaign.description || 'Không có mô tả.'}</p>
                <div className="funding-info">
                  <p>Đã quyên góp: <span>{Number(campaign.raised_amount || 0).toLocaleString()} ETH</span></p>
                  <p>Mục tiêu: <span>{Number(campaign.funding_goal || 0).toLocaleString()} ETH</span></p>
                </div>
                <div className="progress-container">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${campaign.funding_goal > 0 ? (campaign.raised_amount / campaign.funding_goal) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults; 