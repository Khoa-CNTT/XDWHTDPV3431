import React, { useState, useRef } from "react";

import { db, collection, addDoc } from "../firebase";

import "./Create.css";

const CreatePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    detailsLink: "",
    statementLink: "",
    qrCode: "",
    organizerName: "",
    email: "",
    phone: "",
    website: "",
    legalInfo: "",
    donationMethods: [],
    bankAccount: "",
    refundPolicy: "",
    commitment: "",
  });

  const [submitStatus, setSubmitStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      const donationMethods = checked
        ? [...prevData.donationMethods, value]
        : prevData.donationMethods.filter((method) => method !== value);
      return { ...prevData, donationMethods };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        qrCode: file.name,
      }));
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Project submitted for approval:", formData);

    try {
      // Thêm document vào collection "projects"
      await addDoc(collection(db, "projects"), {
        name: formData.name || null,
        description: formData.description || null,
        targetAmount: formData.targetAmount || null,
        detailsLink: formData.detailsLink || null,
        statementLink: formData.statementLink || null,
        qrCode: formData.qrCode || null,
        organizerName: formData.organizerName || null,
        email: formData.email || null,
        phone: formData.phone || null,
        website: formData.website || null,
        legalInfo: formData.legalInfo || null,
        donationMethods:
          formData.donationMethods.length > 0 ? formData.donationMethods : null,
        bankAccount: formData.bankAccount || null,
        refundPolicy: formData.refundPolicy || null,
        commitment: formData.commitment || null,
        createdAt: new Date(),
      });

      setSubmitStatus(
        "Đã gửi yêu cầu tạo dự án cho admin. Vui lòng chờ duyệt!"
      );
      //   setFormData({
      //     name: "",
      //     description: "",
      //     targetAmount: "",
      //     detailsLink: "",
      //     statementLink: "",
      //     qrCode: "",
      //     organizerName: "",
      //     email: "",
      //     phone: "",
      //     website: "",
      //     legalInfo: "",
      //     donationMethods: [],
      //     bankAccount: "",
      //     refundPolicy: "",
      //     commitment: "",
      //   });
    } catch (error) {
      console.error("Lỗi khi gửi dự án:", error);
      setSubmitStatus("Lỗi khi gửi dự án. Vui lòng thử lại!");
    }
  };

  return (
    <div className="create-page">
      <h1>Tạo Dự Án Mới</h1>
      <p>Điền thông tin chi tiết để gửi yêu cầu tạo dự án</p>

      <form className="create-form" onSubmit={handleSubmit}>
        {/* Thông tin cơ bản */}
        <h2>Thông Tin Cơ Bản</h2>
        <div className="form-group">
          <label htmlFor="name">Tên Dự Án</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên dự án"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô Tả Dự Án</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả dự án"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="targetAmount">Mục Tiêu Số Tiền (VND)</label>
          <input
            type="text"
            id="targetAmount"
            name="targetAmount"
            value={formData.targetAmount}
            onChange={handleChange}
            placeholder="Ví dụ: 000,000,000 VND"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="detailsLink">Link Chi Tiết</label>
          <input
            type="url"
            id="detailsLink"
            name="detailsLink"
            value={formData.detailsLink}
            onChange={handleChange}
            placeholder="http://example.com/project"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="statementLink">Link Sao Kê</label>
          <input
            type="url"
            id="statementLink"
            name="statementLink"
            value={formData.statementLink}
            onChange={handleChange}
            placeholder="http://example.com/statement"
            required
          />
        </div>

        {/* Thông tin người kêu gọi */}
        <h2>Thông Tin Người Kêu Gọi</h2>
        <div className="form-group">
          <label htmlFor="organizerName">
            Tên Người/Tổ Chức Đứng Ra Kêu Gọi
          </label>
          <input
            type="text"
            id="organizerName"
            name="organizerName"
            value={formData.organizerName}
            onChange={handleChange}
            placeholder="Nhập tên cá nhân hoặc tổ chức"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Liên Hệ</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Số Điện Thoại Liên Hệ</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Ví dụ: 0901234567"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="website">Website (Nếu Có)</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="http://example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="legalInfo">
            Thông Tin Pháp Lý (Nếu Là Tổ Chức Phi Lợi Nhuận)
          </label>
          <textarea
            id="legalInfo"
            name="legalInfo"
            value={formData.legalInfo}
            onChange={handleChange}
            placeholder="Thông tin đăng ký pháp lý, giấy phép..."
          />
        </div>

        {/* Phương thức đóng góp */}
        <h2>Phương Thức Đóng Góp</h2>
        <div className="form-group">
          <label>Các Hình Thức Quyên Góp</label>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                value="Chuyển khoản"
                checked={formData.donationMethods.includes("Chuyển khoản")}
                onChange={handleCheckboxChange}
              />
              Chuyển khoản
            </label>
            <label>
              <input
                type="checkbox"
                value="Momo"
                checked={formData.donationMethods.includes("Momo")}
                onChange={handleCheckboxChange}
              />
              Momo
            </label>
            <label>
              <input
                type="checkbox"
                value="ZaloPay"
                checked={formData.donationMethods.includes("ZaloPay")}
                onChange={handleCheckboxChange}
              />
              ZaloPay
            </label>
            <label>
              <input
                type="checkbox"
                value="Thẻ tín dụng"
                checked={formData.donationMethods.includes("Thẻ tín dụng")}
                onChange={handleCheckboxChange}
              />
              Thẻ tín dụng
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="bankAccount">
            Thông Tin Tài Khoản Nhận Quyên Góp
          </label>
          <textarea
            id="bankAccount"
            name="bankAccount"
            value={formData.bankAccount}
            onChange={handleChange}
            placeholder="Số tài khoản, tên ngân hàng, chi nhánh..."
            required
          />
        </div>

        <div className="form-group qr-group">
          <label htmlFor="qrCode">Mã QR Thanh Toán</label>
          <div className="qr-input-group">
            <input
              type="text"
              value={formData.qrCode}
              placeholder="Chọn file jpg, jpeg, png"
              readOnly
            />
            <input
              type="file"
              id="qrCode"
              name="qrCode"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
              required
            />
            <button
              type="button"
              className="attach-qr-btn"
              onClick={handleButtonClick}
            >
              Chọn File
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="refundPolicy">Chính Sách Hoàn Tiền (Nếu Có)</label>
          <textarea
            id="refundPolicy"
            name="refundPolicy"
            value={formData.refundPolicy}
            onChange={handleChange}
            placeholder="Mô tả chính sách hoàn tiền nếu dự án không đạt mục tiêu..."
          />
        </div>

        {/* Cam kết & Minh bạch */}
        <h2>Cam Kết & Minh Bạch</h2>
        <div className="form-group">
          <label htmlFor="commitment">Cam Kết Sử Dụng Quỹ Đúng Mục Đích</label>
          <textarea
            id="commitment"
            name="commitment"
            value={formData.commitment}
            onChange={handleChange}
            placeholder="Lời cam kết về việc sử dụng quỹ"
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Gửi Yêu Cầu Tạo Dự Án
        </button>
      </form>

      {submitStatus && <p className="submit-status">{submitStatus}</p>}
    </div>
  );
};

export default CreatePage;
