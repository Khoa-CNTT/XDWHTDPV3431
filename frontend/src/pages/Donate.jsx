import React, { useState } from 'react';
import './Donate.css'; // Import file CSS

const Donate = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDonate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/donate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency }),
      });

      const data = await response.json();
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl; // Chuyển hướng đến PayPal để thanh toán
      } else {
        setError('Không thể tạo thanh toán. Vui lòng thử lại.');
      }
    } catch (error) {
      setError('Lỗi khi thực hiện quyên góp. Vui lòng kiểm tra kết nối và thử lại.');
      console.error('Lỗi quyên góp:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donation-form-container">
      <h2>Quyên Góp Cho Cộng Đồng</h2>
      <p>Hỗ trợ các dự án từ thiện để tạo nên sự thay đổi tích cực!</p>
      <form onSubmit={handleDonate} className="donation-form">
        <div className="form-group">
          <label htmlFor="amount">Số tiền quyên góp:</label>
          <input
            type="number"
            id="amount"
            placeholder="Nhập số tiền (VD: 100)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="currency">Chọn loại tiền tệ:</label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="VND">VND</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <button type="submit" className="donate-button" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Quyên Góp Ngay'}
        </button>
      </form>
    </div>
  );
};

export default Donate;