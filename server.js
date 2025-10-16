const express = require("express");
const cors = require("cors");

// 📦 Import các route
const nhanvienRoutes = require("./routes/nhanvienRoutes");
const chamcongRoutes = require("./routes/chamcongRoutes");
const bangluongRoutes = require("./routes/bangluongRoutes");
const reportRouters = require("./routes/reportRouters");


const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Cho phép truy cập file tĩnh trong thư mục frontend (HTML, CSS, JS,...)
app.use(express.static("frontend"));

// ✅ Gắn các route vào đường dẫn chính
app.use("/api/nhanvien", nhanvienRoutes);
app.use("/api/chamcong", chamcongRoutes);
app.use("/api/bangluong", bangluongRoutes);
app.use("/api/report", reportRouters);

// ✅ Khởi động server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});
