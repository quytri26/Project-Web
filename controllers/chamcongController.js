const db = require("../config/db");

// 🔹 Lấy danh sách nhân viên (thêm mới)
exports.getAllNhanVien = (req, res) => {
  const sql = "SELECT id, ho_ten FROM NhanVien ORDER BY ho_ten ASC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi lấy danh sách nhân viên:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json(result);
  });
};

// 📋 Lấy toàn bộ danh sách chấm công
exports.getAllChamCong = (req, res) => {
  const sql = `
    SELECT cc.*, nv.ho_ten 
    FROM ChamCong cc
    JOIN NhanVien nv ON cc.nhan_vien_id = nv.id
    ORDER BY cc.ngay DESC
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi lấy danh sách chấm công:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json(result);
  });
};

// 🔍 Lấy chấm công theo ID
exports.getChamCongById = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT cc.*, nv.ho_ten 
    FROM ChamCong cc
    JOIN NhanVien nv ON cc.nhan_vien_id = nv.id
    WHERE cc.id = ?
  `;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi lấy dữ liệu chấm công:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy dữ liệu chấm công" });
    }
    res.json(result[0]);
  });
};

// ➕ Thêm chấm công mới
exports.addChamCong = (req, res) => {
  const { nhan_vien_id, ngay, gio_vao, gio_ra, so_gio_lam, ghi_chu } = req.body;
  const sql = `
    INSERT INTO ChamCong (nhan_vien_id, ngay, gio_vao, gio_ra, so_gio_lam, ghi_chu)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [nhan_vien_id, ngay, gio_vao, gio_ra, so_gio_lam, ghi_chu], (err, result) => {
    if (err) {
      console.error("❌ Lỗi thêm chấm công:", err);
      return res.status(500).json({ message: "Lỗi khi thêm chấm công" });
    }
    res.json({ message: "✅ Thêm chấm công thành công!", id: result.insertId });
  });
};

// ✏️ Cập nhật thông tin chấm công
exports.updateChamCong = (req, res) => {
  const { id } = req.params;
  const { nhan_vien_id, ngay, gio_vao, gio_ra, so_gio_lam, ghi_chu } = req.body;
  const sql = `
    UPDATE ChamCong 
    SET nhan_vien_id = ?, ngay = ?, gio_vao = ?, gio_ra = ?, so_gio_lam = ?, ghi_chu = ?
    WHERE id = ?
  `;
  db.query(sql, [nhan_vien_id, ngay, gio_vao, gio_ra, so_gio_lam, ghi_chu, id], (err, result) => {
    if (err) {
      console.error("❌ Lỗi cập nhật chấm công:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi chấm công cần cập nhật!" });
    }
    res.json({ message: "✅ Cập nhật chấm công thành công!" });
  });
};

// 🗑️ Xóa bản ghi chấm công
exports.deleteChamCong = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM ChamCong WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi xóa chấm công:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi để xóa!" });
    }
    res.json({ message: "✅ Xóa chấm công thành công!" });
  });
};
