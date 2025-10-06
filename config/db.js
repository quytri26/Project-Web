// Import thư viện MySQL
const mysql = require("mysql");

// Tạo kết nối đến cơ sở dữ liệu MySQL
const db = mysql.createConnection({
  host: "localhost",      // hoặc 127.0.0.1
  user: "root",           
  password: "",     
  database: "QuanLyNhanSu" 
});

// Kiểm tra kết nối
db.connect(err => {
  if (err) {
    console.error("❌ Kết nối MySQL thất bại:", err);
    return;
  }
  console.log("✅ Đã kết nối MySQL thành công!");
});

// Xuất kết nối để file khác dùng
module.exports = db;
