-- Tạo cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS QuanLyNhanSu;
USE QuanLyNhanSu;

-- Bảng nhân viên
CREATE TABLE IF NOT EXISTS NhanVien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    ngay_sinh DATE,
    gioi_tinh ENUM('Nam', 'Nữ', 'Khác'),
    chuc_vu VARCHAR(100),
    luong_co_ban DECIMAL(15,2) NOT NULL,
    ngay_vao_lam DATE,
    trang_thai ENUM('Đang làm', 'Thử việc', 'Nghỉ việc') DEFAULT 'Đang làm'
);

-- Bảng chấm công
CREATE TABLE IF NOT EXISTS ChamCong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nhan_vien_id INT NOT NULL,
    ngay DATE NOT NULL,
    gio_vao TIME,
    gio_ra TIME,
    so_gio_lam DECIMAL(5,2),
    ghi_chu VARCHAR(255),
    FOREIGN KEY (nhan_vien_id) REFERENCES NhanVien(id)
);


-- Bảng bảng lương
CREATE TABLE IF NOT EXISTS BangLuong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nhan_vien_id INT NOT NULL,
    thang YEAR(4) NOT NULL,
    thang_thu TINYINT NOT NULL, -- 1..12
    tong_gio_lam DECIMAL(10,2),
    thuong DECIMAL(15,2) DEFAULT 0,
    phat DECIMAL(15,2) DEFAULT 0,
    tong_luong DECIMAL(15,2),
    trang_thai ENUM('Chưa trả', 'Đã trả') DEFAULT 'Chưa trả',
    FOREIGN KEY (nhan_vien_id) REFERENCES NhanVien(id)
);
