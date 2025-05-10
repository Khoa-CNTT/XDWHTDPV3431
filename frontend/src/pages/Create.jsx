import React, { useState } from 'react';
import { FaPaypal, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaSpinner, FaMoneyBillWave } from 'react-icons/fa';
import { charityNeedService } from '../services/charityNeedService';
import './Create.css';

const Create = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organization_name: '',
    location: '',
    target_group: '',
    items_needed: '',
    image: '',
    funding_goal: '',
    blockchain_link: '',
    project_link: '',
    fund_avatar: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên dự án';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Tên dự án phải có ít nhất 5 ký tự';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả dự án';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Mô tả dự án phải có ít nhất 20 ký tự';
    }

    if (!formData.organization_name.trim()) {
      newErrors.organization_name = 'Vui lòng nhập tên tổ chức';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Vui lòng nhập địa điểm';
    }

    if (!formData.target_group.trim()) {
      newErrors.target_group = 'Vui lòng nhập đối tượng hưởng lợi';
    }

    if (!formData.items_needed.trim()) {
      newErrors.items_needed = 'Vui lòng nhập nhu yếu phẩm cần thiết';
    }

    if (!formData.funding_goal.trim()) {
      newErrors.funding_goal = 'Vui lòng nhập mục tiêu gây quỹ';
    } else if (isNaN(formData.funding_goal) || parseFloat(formData.funding_goal) <= 0) {
      newErrors.funding_goal = 'Vui lòng nhập số tiền hợp lệ';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'Vui lòng nhập URL hình ảnh';
    } else if (!isValidUrl(formData.image)) {
      newErrors.image = 'Vui lòng nhập URL hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await charityNeedService.createNeed({
        ...formData,
        raised_amount: 0,
        raised_percent: 0,
        is_interested: false
      });
      
      console.log('Dự án đã được tạo:', response);
      
      setIsSuccess(true);
      setFormData({
        title: '',
        description: '',
        organization_name: '',
        location: '',
        target_group: '',
        items_needed: '',
        image: '',
        funding_goal: '',
        blockchain_link: '',
        project_link: '',
        fund_avatar: ''
      });
    } catch (error) {
      console.error('Lỗi khi tạo dự án:', error);
      alert('Không thể tạo dự án. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <div className="create-project-container">
        <div className="success-container">
          <div className="success-message">
            <FaCheckCircle className="success-icon" />
            <h2>Dự án đã được tạo thành công!</h2>
            <p>Dự án của bạn đã được tạo và sẵn sàng nhận quyên góp.</p>
            <button className="back-button" onClick={handleBack}>
              Tạo Dự Án Khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-project-container">
      <div className="create-header">
        <h2>Tạo Dự Án Từ Thiện Mới</h2>
        <p className="header-subtitle">
          Điền thông tin chi tiết về dự án từ thiện của bạn
        </p>
      </div>

      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Tên Dự Án</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={errors.title ? 'error-input' : ''}
            placeholder="Nhập tên dự án"
          />
          {errors.title && (
            <div className="error-message">
              <FaExclamationCircle className="error-icon" />
              {errors.title}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô Tả Dự Án</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={errors.description ? 'error-input' : ''}
            placeholder="Nhập mô tả chi tiết về dự án"
            rows="4"
          />
          {errors.description && (
            <div className="error-message">
              <FaExclamationCircle className="error-icon" />
              {errors.description}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="organization_name">Tên Tổ Chức</label>
          <input
            type="text"
            id="organization_name"
            name="organization_name"
            value={formData.organization_name}
            onChange={handleInputChange}
            className={errors.organization_name ? 'error-input' : ''}
            placeholder="Nhập tên tổ chức"
          />
          {errors.organization_name && (
            <div className="error-message">
              <FaExclamationCircle className="error-icon" />
              {errors.organization_name}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="location">Địa Điểm</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className={errors.location ? 'error-input' : ''}
            placeholder="Nhập địa điểm"
          />
          {errors.location && (
            <div className="error-message">
              <FaExclamationCircle className="error-icon" />
              {errors.location}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="target_group">Đối Tượng Hưởng Lợi</label>
          <input
            type="text"
            id="target_group"
            name="target_group"
            value={formData.target_group}
            onChange={handleInputChange}
            className={errors.target_group ? 'error-input' : ''}
            placeholder="Nhập đối tượng hưởng lợi"
          />
          {errors.target_group && (
            <div className="error-message">
              <FaExclamationCircle className="error-icon" />
              {errors.target_group}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="items_needed">Nhu Yếu Phẩm Cần Thiết</label>
          <textarea
            id="items_needed"
            name="items_needed"
            value={formData.items_needed}
            onChange={handleInputChange}
            className={errors.items_needed ? 'error-input' : ''}
            placeholder="Nhập nhu yếu phẩm cần thiết"
          />
          {errors.items_needed && (
            <div className="error-message">
              <FaExclamationCircle className="error-icon" />
              {errors.items_needed}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="image">URL Hình Ảnh</label>
          <input
            type="text"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            className={errors.image ? 'error-input' : ''}
            placeholder="Nhập URL hình ảnh"
          />
          {errors.image && (
            <div className="error-message">
              <FaExclamationCircle className="error-icon" />
              {errors.image}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="funding_goal">Mục Tiêu Gây Quỹ</label>
          <input
            type="number"
            id="funding_goal"
            name="funding_goal"
            value={formData.funding_goal}
            onChange={handleInputChange}
            className={errors.funding_goal ? 'error-input' : ''}
            placeholder="Nhập mục tiêu gây quỹ"
          />
          {errors.funding_goal && (
            <div className="error-message">
              <FaExclamationCircle className="error-icon" />
              {errors.funding_goal}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="blockchain_link">Link Blockchain</label>
          <input
            type="text"
            id="blockchain_link"
            name="blockchain_link"
            value={formData.blockchain_link}
            onChange={handleInputChange}
            placeholder="Nhập link blockchain (không bắt buộc)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="project_link">Link Dự Án</label>
          <input
            type="text"
            id="project_link"
            name="project_link"
            value={formData.project_link}
            onChange={handleInputChange}
            placeholder="Nhập link dự án (không bắt buộc)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="fund_avatar">Avatar Quỹ</label>
          <input
            type="text"
            id="fund_avatar"
            name="fund_avatar"
            value={formData.fund_avatar}
            onChange={handleInputChange}
            placeholder="Nhập URL avatar quỹ (không bắt buộc)"
          />
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <FaSpinner className="spinner" />
              Đang tạo...
            </>
          ) : (
            'Tạo Dự Án'
          )}
        </button>
      </form>
    </div>
  );
};

export default Create;
