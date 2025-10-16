const db = require("../config/db");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// 📊 Lấy dữ liệu báo cáo theo năm + tháng
exports.getMonthlyReport = (req, res) => {
  const { year, month } = req.params;
  console.log("📅 Báo cáo nhận tham số:", year, month);

  const sql = `
    SELECT 
      nv.id,
      nv.ho_ten,
      CONCAT(bl.thang_thu, '/', bl.nam) AS thang,
      bl.tong_luong,
      bl.trang_thai
    FROM bangluong bl
    JOIN nhan_vien nv ON bl.nhan_vien_id = nv.id
    WHERE bl.nam = ? AND bl.thang_thu = ?
    ORDER BY nv.ho_ten ASC
  `;

  db.query(sql, [year, month], (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn báo cáo:", err);
      return res.status(500).json({ message: "Lỗi khi truy vấn dữ liệu báo cáo" });
    }
    console.log(`✅ Tìm thấy ${results.length} dòng dữ liệu`);
    res.json(results);
  });
};

// 📥 Xuất Excel
exports.exportExcel = async (req, res) => {
  const { year, month } = req.params;

  const sql = `
    SELECT 
      nv.id,
      nv.ho_ten,
      CONCAT(bl.thang_thu, '/', bl.nam) AS thang,
      bl.tong_luong,
      bl.trang_thai
    FROM bangluong bl
    JOIN nhan_vien nv ON bl.nhan_vien_id = nv.id
    WHERE bl.nam = ? AND bl.thang_thu = ?
    ORDER BY nv.ho_ten ASC
  `;

  db.query(sql, [year, month], async (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi xuất Excel:", err);
      return res.status(500).send("Lỗi khi xuất Excel");
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Báo cáo lương");

    sheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Họ tên", key: "ho_ten", width: 30 },
      { header: "Tháng/Năm", key: "thang", width: 15 },
      { header: "Tổng lương", key: "tong_luong", width: 20 },
      { header: "Trạng thái", key: "trang_thai", width: 15 },
    ];

    sheet.addRows(results);

    const filePath = path.join(__dirname, `../exports/baocao_${year}_${month}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath);
  });
};

// 📄 Xuất PDF
exports.exportPDF = (req, res) => {
  const { year, month } = req.params;

  const sql = `
    SELECT 
      nv.id,
      nv.ho_ten,
      CONCAT(bl.thang_thu, '/', bl.nam) AS thang,
      bl.tong_luong,
      bl.trang_thai
    FROM bangluong bl
    JOIN nhan_vien nv ON bl.nhan_vien_id = nv.id
    WHERE bl.nam = ? AND bl.thang_thu = ?
    ORDER BY nv.ho_ten ASC
  `;

  db.query(sql, [year, month], (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi xuất PDF:", err);
      return res.status(500).send("Lỗi khi xuất PDF");
    }

    const filePath = path.join(__dirname, `../exports/baocao_${year}_${month}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text(`BÁO CÁO LƯƠNG THÁNG ${month}/${year}`, { align: "center" });
    doc.moveDown();

    results.forEach((row) => {
      doc.fontSize(12).text(
        `ID: ${row.id} | ${row.ho_ten} | ${row.thang} | ${row.tong_luong} | ${row.trang_thai}`
      );
      doc.moveDown(0.5);
    });

    doc.end();
    stream.on("finish", () => res.download(filePath));
  });
};
