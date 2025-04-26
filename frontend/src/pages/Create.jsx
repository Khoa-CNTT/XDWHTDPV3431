import React, { useState } from 'react';
import { FaPaypal, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaSpinner, FaMoneyBillWave } from 'react-icons/fa';
import './Create.css';

const Create = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    category: 'education',
    imageUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paypalConnected, setPaypalConnected] = useState(false);

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
    } else if (formData.description.length < 50) {
      newErrors.description = 'Mô tả dự án phải có ít nhất 50 ký tự';
    }

    if (!formData.goal.trim()) {
      newErrors.goal = 'Vui lòng nhập mục tiêu gây quỹ';
    } else if (isNaN(formData.goal) || parseFloat(formData.goal) <= 0) {
      newErrors.goal = 'Vui lòng nhập số tiền hợp lệ';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Vui lòng nhập URL hình ảnh';
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Vui lòng nhập URL hợp lệ';
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

  const connectPaypal = async () => {
    try {
      // Simulate PayPal connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPaypalConnected(true);
    } catch (error) {
      console.error('Lỗi kết nối PayPal:', error);
      alert('Không thể kết nối với PayPal. Vui lòng thử lại.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!paypalConnected) {
      alert('Vui lòng kết nối tài khoản PayPal trước');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate PayPal transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically interact with PayPal API
      console.log('Form submitted:', formData);
      
      setIsSuccess(true);
      setFormData({
        title: '',
        description: '',
        goal: '',
        category: 'education',
        imageUrl: '',
      });
    } catch (error) {
      console.error('Lỗi khi gửi form:', error);
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
            <p>Dự án của bạn đã được tạo và sẵn sàng nhận quyên góp thông qua PayPal.</p>
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
        <FaPaypal className="header-icon" />
        <h2>Tạo Dự Án Mới</h2>
        <p className="header-subtitle">
          Bắt đầu dự án từ thiện của bạn và nhận quyên góp thông qua PayPal. Kết nối tài khoản PayPal và điền thông tin bên dưới.
        </p>
      </div>

      <div className="paypal-section">
        <button 
          className="connect-paypal-btn"
          onClick={connectPaypal}
          disabled={paypalConnected}
        >
          <FaPaypal className="paypal-icon" />
          {paypalConnected ? 'Đã kết nối PayPal' : 'Kết nối PayPal'}
        </button>
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
            placeholder="Nhập tên dự án của bạn"
          />
          {errors.title && (
            <div className="error-message">
              <FaExclamationCircle className="error-icon" />
              {errors.title}
            </div>
          )}
          <div className="input-hint">
            <FaInfoCircle className="hint-icon" />
            Chọn một tên rõ ràng và mô tả cho dự án của bạn
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô Tả Dự Án</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={errors.description ? 'error-input' : ''}
            placeholder="Mô tả chi tiết về dự án của bạn"
          />
          {errors.description && (
            <div className="error-message">
              <FaExclamationCircle className="error-icon" />
              {errors.description}
            </div>
          )}
          <div className="input-hint">
            <FaInfoCircle className="hint-icon" />
            Cung cấp mô tả chi tiết về mục tiêu và tác động của dự án
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="goal">Mục Tiêu Gây Quỹ (VND)</label>
          <div className="currency-input-container">
            <input
              type="number"
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleInputChange}
              className={errors.goal ? 'error-input' : ''}
              placeholder="Nhập số tiền bằng VND"
              step="1000"
              min="0"
            />
            <FaMoneyBillWave className="currency-icon" />
          </div>
          {errors.goal && (
            <div className="error-message">
              <FaExclamationCircle className="error-icon" />
              {errors.goal}
            </div>
          )}
          <div className="input-hint">
            <FaInfoCircle className="hint-icon" />
            Đặt mục tiêu gây quỹ thực tế bằng VND
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Danh Mục</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="education">Giáo dục</option>
            <option value="healthcare">Y tế</option>
            <option value="environment">Môi trường</option>
            <option value="poverty">Xóa đói giảm nghèo</option>
            <option value="disaster">Cứu trợ thiên tai</option>
            <option value="children">Trẻ em</option>
            <option value="elderly">Người cao tuổi</option>
            <option value="other">Khác</option>
          </select>
          <div className="input-hint">
            <FaInfoCircle className="hint-icon" />
            Chọn danh mục phù hợp nhất với dự án của bạn
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">URL Hình Ảnh Dự Án</label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            className={errors.imageUrl ? 'error-input' : ''}
            placeholder="Nhập URL hình ảnh"
          />
          {errors.imageUrl && (
            <div className="error-message">
              <FaExclamationCircle className="error-icon" />
              {errors.imageUrl}
            </div>
          )}
          <div className="input-hint">
            <FaInfoCircle className="hint-icon" />
            Cung cấp URL cho hình ảnh chính của dự án
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting || !paypalConnected}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="spinner" />
              Đang tạo dự án...
            </>
          ) : (
            <>
              <FaCheckCircle className="submit-icon" />
              Tạo Dự Án
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Create;
