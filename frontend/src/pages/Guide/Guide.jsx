import React, { useEffect } from "react";
import "./Guide.css";

const Guide = () => {
  useEffect(() => {
    const buttons = document.querySelectorAll(".tab-buttons button");
    const tabs =
      document.querySelectorAll(
        ".tab"
      ); /* Chứa nội dung của các nút có class .tab*/

    function changeTab(event) {
      const target = event.target.getAttribute("data-target");

      buttons.forEach((btn) => btn.classList.remove("active"));
      event.target.classList.add("active");

      tabs.forEach((tab) => tab.classList.remove("active"));
      document.getElementById(target).classList.add("active");
    }

    /*Thêm sự kiện click cho các nút*/
    buttons.forEach((btn) => btn.addEventListener("click", changeTab));

    /*Tự động kích hoạt tab đầu tiên khi tải trang*/
    document.querySelector(".tab-buttons button").click();

    return () => {
      buttons.forEach((btn) => btn.removeEventListener("click", changeTab));
    };
  }, []);

  const toggleDetail = (id) => {
    document.getElementById(id).classList.toggle("show");
  };

  return (
    <div className="guide-container">
      <h1>Hướng Dẫn Gây Quỹ Từ Thiện</h1>

      <div className="tab-buttons">
        <button data-target="instructions">Hướng Dẫn</button>
        <button data-target="verification">Kiểm Tra</button>
        <button data-target="faqs">FAQs</button>
      </div>

      <div className="tab-content">
        {/* Hướng Dẫn */}
        <div id="instructions" className="tab">
          <h2>Cách Thực Hiện Giao Dịch Ủng Hộ</h2>
          <p>Nếu bạn muốn đóng góp, quá trình thực hiện rất đơn giản:</p>
          <button
            className="toggle-btn"
            onClick={() => toggleDetail("donate-detail")}
          >
            Xem chi tiết
          </button>
          <div id="donate-detail" className="detail-content">
            <p>1. Chọn chiến dịch mà bạn muốn đóng góp.</p>
            <p>2. Nhập số tiền và thông tin cần thiết.</p>
            <p>3. Xác nhận giao dịch và hoàn tất thanh toán.</p>
          </div>

          <h2>Cách Tạo Dự Án Gây Quỹ</h2>
          <p>Nếu bạn muốn tạo một dự án từ thiện, đây là cách làm:</p>
          <button
            className="toggle-btn"
            onClick={() => toggleDetail("project-detail")}
          >
            Xem chi tiết
          </button>
          <div id="project-detail" className="detail-content">
            <p>1. Đăng ký tài khoản tổ chức trên hệ thống.</p>
            <p>2. Tạo chiến dịch gây quỹ với thông tin đầy đủ.</p>
            <p>3. Chia sẻ chiến dịch để nhận được sự ủng hộ.</p>
          </div>
        </div>

        {/* Kiểm Tra */}
        <div id="verification" className="tab">
          <h2>Kiểm Tra Giao Dịch</h2>
          <p>Nhập mã giao dịch để kiểm tra trạng thái đóng góp của bạn.</p>
          <input type="text" placeholder="Nhập mã giao dịch..." />
          <button>Kiểm Tra</button>
        </div>

        {/* FAQs */}
        <div id="faqs" className="tab">
          <h2>Câu Hỏi Thường Gặp</h2>
          <p>
            <strong>1. Tôi có thể quyên góp bao nhiêu?</strong>
          </p>
          <p>Bạn có thể quyên góp bất kỳ số tiền nào tùy theo khả năng.</p>

          <p>
            <strong>2. Tôi có thể kiểm tra giao dịch ở đâu?</strong>
          </p>
          <p>Nhập mã giao dịch vào tab "Kiểm Tra" để xem chi tiết.</p>

          <p>
            <strong>
              3. Tôi có thể rút tiền từ chiến dịch gây quỹ khi nào?
            </strong>
          </p>
          <p>Tiền quyên góp sẽ được giải ngân sau khi chiến dịch kết thúc.</p>

          <p>
            <strong>4. Tôi có thể hủy giao dịch sau khi hoàn tất không?</strong>
          </p>
          <p>
            Giao dịch đã hoàn tất không thể hủy, vui lòng kiểm tra kỹ trước khi
            xác nhận.
          </p>

          <p>
            <strong>
              5. Làm sao để tôi biết tiền của tôi đến đúng người nhận?
            </strong>
          </p>
          <p>
            Chúng tôi cung cấp báo cáo minh bạch về từng chiến dịch gây quỹ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Guide;
