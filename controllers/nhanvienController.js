const db = require("../config/db");

// 📘 Lấy danh sách nhân viên
exports.getAllNhanVien = (req, res) => {
  const sql = "SELECT * FROM NhanVien ORDER BY ho_ten ASC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi lấy danh sách nhân viên:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json(result);
  });
};

// 🔍 Lấy thông tin nhân viên theo ID
exports.getNhanVienById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM NhanVien WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi lấy thông tin nhân viên:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }
    res.json(result[0]);
  });
};

// ➕ Thêm nhân viên mới
exports.addNhanVien = (req, res) => {
 let {
  ho_ten,
  ngay_sinh,
  gioi_tinh,
  chuc_vu,
  luong_co_ban,
  ngay_vao_lam,
  trang_thai
} = req.body;

// Nếu giới tính rỗng → mặc định là "Khác"
if (!gioi_tinh) gioi_tinh = "Khác";

  const sql = `
    INSERT INTO NhanVien 
      (ho_ten, ngay_sinh, gioi_tinh, chuc_vu, luong_co_ban, ngay_vao_lam, trang_thai)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [ho_ten, ngay_sinh, gioi_tinh, chuc_vu, luong_co_ban, ngay_vao_lam, trang_thai || "Đang làm"],
    (err, result) => {
      if (err) {
        console.error("❌ Lỗi thêm nhân viên:", err);
        return res.status(500).json({ message: "Lỗi khi thêm nhân viên" });
      }
      res.json({ message: "✅ Thêm nhân viên thành công!", id: result.insertId });
    }
  );
};

// ✏️ Cập nhật thông tin nhân viên
exports.updateNhanVien = (req, res) => {
  const { id } = req.params;
  const {
    ho_ten,
    ngay_sinh,
    gioi_tinh,
    chuc_vu,
    luong_co_ban,
    ngay_vao_lam,
    trang_thai
  } = req.body;

  const sql = `
    UPDATE NhanVien
    SET ho_ten = ?, ngay_sinh = ?, gioi_tinh = ?, chuc_vu = ?, 
        luong_co_ban = ?, ngay_vao_lam = ?, trang_thai = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [ho_ten, ngay_sinh, gioi_tinh, chuc_vu, luong_co_ban, ngay_vao_lam, trang_thai, id],
    (err, result) => {
      if (err) {
        console.error("❌ Lỗi khi cập nhật nhân viên:", err);
        return res.status(500).json({ message: "Lỗi server" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Không tìm thấy nhân viên cần cập nhật!" });
      }
      res.json({ message: "✅ Cập nhật thông tin nhân viên thành công!" });
    }
  );
};

// 🗑️ Xóa nhân viên theo ID
exports.deleteNhanVien = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM NhanVien WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi xóa nhân viên:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên cần xóa!" });
    }
    res.json({ message: "✅ Xóa nhân viên thành công!" });
  });
};


// 🔎 Tìm nhân viên theo tên hoặc ID (không phân biệt hoa thường, có dấu)
exports.searchNhanVien = (req, res) => {
  const { keyword } = req.query;
  if (!keyword) return res.json([]);

  // Loại bỏ dấu tiếng Việt và chuẩn hóa chữ thường trong SQL
  const sql = `
    SELECT * FROM NhanVien
    WHERE 
      LOWER(CONVERT(ho_ten USING utf8mb4)) COLLATE utf8mb4_general_ci LIKE LOWER(CONCAT('%', ?, '%'))
      OR id = ?
    ORDER BY id DESC
  `;

  db.query(sql, [keyword, keyword], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi tìm nhân viên:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json(result);
  });
};

