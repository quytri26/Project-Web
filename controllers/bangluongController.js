const db = require("../config/db");

// 📘 Lấy danh sách bảng lương
exports.getAllBangLuong = (req, res) => {
  const sql = `
    SELECT bl.*, nv.ho_ten 
    FROM BangLuong bl
    JOIN NhanVien nv ON bl.nhan_vien_id = nv.id
    ORDER BY bl.thang DESC, bl.thang_thu DESC
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi lấy danh sách bảng lương:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json(result);
  });
};

// 🔍 Lấy bảng lương theo ID
exports.getBangLuongById = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT bl.*, nv.ho_ten 
    FROM BangLuong bl
    JOIN NhanVien nv ON bl.nhan_vien_id = nv.id
    WHERE bl.id = ?
  `;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi lấy bảng lương:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bảng lương" });
    }
    res.json(result[0]);
  });
};

// ➕ Thêm bảng lương
exports.addBangLuong = (req, res) => {
  const { nhan_vien_id, thang, thang_thu, tong_gio_lam, thuong, phat, tong_luong, trang_thai } = req.body;

  const sql = `
    INSERT INTO BangLuong (nhan_vien_id, thang, thang_thu, tong_gio_lam, thuong, phat, tong_luong, trang_thai)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [nhan_vien_id, thang, thang_thu, tong_gio_lam, thuong || 0, phat || 0, tong_luong || 0, trang_thai || "Chưa trả"],
    (err, result) => {
      if (err) {
        console.error("❌ Lỗi thêm bảng lương:", err);
        return res.status(500).json({ message: "Lỗi khi thêm bảng lương" });
      }
      res.json({ message: "✅ Thêm bảng lương thành công!", id: result.insertId });
    }
  );
};

// ✏️ Cập nhật bảng lương
exports.updateBangLuong = (req, res) => {
  const { id } = req.params;
  const { nhan_vien_id, thang, thang_thu, tong_gio_lam, thuong, phat, tong_luong, trang_thai } = req.body;

  const sql = `
    UPDATE BangLuong
    SET nhan_vien_id = ?, thang = ?, thang_thu = ?, tong_gio_lam = ?, 
        thuong = ?, phat = ?, tong_luong = ?, trang_thai = ?
    WHERE id = ?
  `;
  db.query(
    sql,
    [nhan_vien_id, thang, thang_thu, tong_gio_lam, thuong, phat, tong_luong, trang_thai, id],
    (err, result) => {
      if (err) {
        console.error("❌ Lỗi cập nhật bảng lương:", err);
        return res.status(500).json({ message: "Lỗi server" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Không tìm thấy bảng lương cần cập nhật!" });
      }
      res.json({ message: "✅ Cập nhật bảng lương thành công!" });
    }
  );
};

// 🗑️ Xóa bảng lương
exports.deleteBangLuong = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM BangLuong WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi xóa bảng lương:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy bảng lương cần xóa!" });
    }
    res.json({ message: "✅ Xóa bảng lương thành công!" });
  });
};
