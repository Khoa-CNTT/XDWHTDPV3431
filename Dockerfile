# Sử dụng image MySQL chính thức
FROM mysql:latest

# Thiết lập các biến môi trường
ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=charity_db
ENV MYSQL_USER=myuser
ENV MYSQL_PASSWORD=mypassword

# Sao chép hoặc thực hiện các lệnh khởi tạo (nếu cần) tại đây, ví dụ như import dữ liệu ban đầu
# COPY ./init.sql /docker-entrypoint-initdb.d/

# Expose port 3306 cho container MySQL
EXPOSE 3306

# Thực thi container MySQL khi chạy
CMD ["mysqld"]