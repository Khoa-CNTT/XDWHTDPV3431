import React, { useState, useEffect } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import Button from '../components/Button/Button';


// Import ảnh từ thư mục assets
import slide1 from '../components/Assets/slide.jpg';
import slide2 from '../components/Assets/slide2.jpg';
import slide3 from '../components/Assets/slide3.jpg';
import children from '../components/Assets/children.jpeg';
import student from '../components/Assets/student.jpg';
import bridge from '../components/Assets/bridge.jpg';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { title: 'Lan tỏa yêu thương, kết nối cộng đồng. ', 
      backgroundImage: slide1, 
      description: 'Đồng hành phát triển cuộc sống cho cộng đồng yếu thế. Mỗi đóng góp của bạn là một tia hy vọng cho những hoàn cảnh khó khăn. Vi một Việt Nam phát triển vững mạnh' 
    },
    { title: 'Hãy cùng chúng tôi tạo ra sự khác biệt',  
      backgroundImage: slide2 , 
      description: 'Mỗi đóng góp của bạn sẽ giúp mang lại hi vọng và thay đổi cuộc sống của hàng ngàn người.' 
    },
    { title: 'Cam kết minh bạch hoàn toàn',  
      backgroundImage: slide3, 
      description: 'Mọi khoản đóng góp đều được công khai, rõ ràng và sử dụng đúng mục đích. Niềm tin của bạn – Trách nhiệm của chúng tôi!' ,
    },
  ];

  //Tự động chuyển slide mỗi 4 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [slides.length]);

  //Hàm chuyển slide thủ công
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const campaigns = [
    { id: 1, title: 'Hỗ trợ trẻ em mồ côi', raised: '50,000,000 VNĐ', goal: '100,000,000 VNĐ', image: children, description: 'Giúp trẻ em có một tương lai tươi sáng.' },
    { id: 2, title: 'Xây cầu cho vùng sâu', raised: '120,000,000 VNĐ', goal: '200,000,000 VNĐ', image: bridge , description: 'Kết nối cộng đồng qua những cây cầu.' },
    { id: 3, title: 'Học bổng cho học sinh nghèo', raised: '30,000,000 VNĐ', goal: '50,000,000 VNĐ', image: student, description: 'Mang tri thức đến mọi nhà.' },
  ];


  return (
    <div className="homepage-main">

      {/* Banner */}
      <section className="banner">
        <div className="banner-wrapper">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.backgroundImage})` }}
            ></div>
          ))}
          <div className="banner-overlay" key={currentSlide}> 
            <h1>{slides[currentSlide].title}</h1>
            <p>{slides[currentSlide].description}</p>
            <Link to="/projects"><Button text ="Khám phá các dự án" variant = "slide"/></Link>
          </div>
        </div>
        <div className="slide-indicators">
          {slides.map((slide, index) => (
            <span
              key={index}
              className={`indicator ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>
      </section>

      {/* Campaigns */}
      <section className="campaigns">
        <h2>Những dự án sắp hoàn thành</h2>
        <div className="campaign-grid">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="campaign-item">
              <div className="campaign-image">
                <img src={campaign.image} alt={campaign.title} />
                <div className="campaign-hover">
                <Link to="/projects/1"><Button text ="Quyên góp ngay" variant = "slide"/></Link>
                </div>
              </div>
              <div className="campaign-info" >
                <h3>{campaign.title}</h3>
                <p className="description">{campaign.description}</p>
                <div className="funding-info">
                  <p>Đã quyên góp: <span>{campaign.raised}</span></p>
                  <p>Mục tiêu: <span>{campaign.goal}</span></p>
                </div>
                <div className="progress-container">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(parseInt(campaign.raised.replace(/[^0-9]/g, '')) / parseInt(campaign.goal.replace(/[^0-9]/g, ''))) * 100}%`}}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

          {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Cùng nhau tạo nên sự khác biệt</h1>
          <p>
            Mỗi đóng góp của bạn giúp chúng tôi mang hy vọng đến những người cần nó nhất. 
            Hãy chung tay xây dựng một thế giới tốt đẹp hơn!
          </p>
          <Link to="/donate"><Button text="Quyên góp ngay" variant = "slide" /></Link>
        </div>
      </section>
    
    </div>
  );
};

export default Home;