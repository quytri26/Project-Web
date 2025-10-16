// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// 📊 Lấy dữ liệu báo cáo
router.get("/baocao/:year/:month", reportController.getMonthlyReport);

// 📥 Xuất file Excel
router.get("/export/excel/:year/:month", reportController.exportExcel);

// 📄 Xuất file PDF
router.get("/export/pdf/:year/:month", reportController.exportPDF);

module.exports = router;
