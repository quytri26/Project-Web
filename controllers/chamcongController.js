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

  
  const sqlCheck = `
    SELECT * FROM ChamCong
    WHERE nhan_vien_id = ?
      AND ngay = ?
      AND (
        (CAST(? AS TIME) < gio_ra)  -- giờ vào mới < giờ ra cũ
        AND (CAST(? AS TIME) > gio_vao)  -- giờ ra mới > giờ vào cũ
      )
  `;

  db.query(sqlCheck, [nhan_vien_id, ngay, gio_vao, gio_ra], (err, existing) => {
    if (err) {
      console.error("❌ Lỗi kiểm tra trùng giờ:", err);
      return res.status(500).json({ message: "Lỗi server khi kiểm tra trùng giờ" });
    }

    if (existing.length > 0) {
      const nhanvienQuery = `SELECT ho_ten FROM NhanVien WHERE id = ?`;
      db.query(nhanvienQuery, [nhan_vien_id], (err2, nv) => {
        const name = nv?.[0]?.ho_ten || `ID ${nhan_vien_id}`;
        return res
          .status(400)
          .json({ message: `Ca làm việc của nhân viên ${name} bị trùng hoặc lồng thời gian!` });
      });
      return;
    }

    // 2️⃣ Không trùng → thêm mới
    const sqlInsert = `
      INSERT INTO ChamCong (nhan_vien_id, ngay, gio_vao, gio_ra, so_gio_lam, ghi_chu)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(sqlInsert, [nhan_vien_id, ngay, gio_vao, gio_ra, so_gio_lam, ghi_chu], (err, result) => {
      if (err) {
        console.error("❌ Lỗi thêm chấm công:", err);
        return res.status(500).json({ message: "Lỗi khi thêm chấm công" });
      }
      res.json({ message: "✅ Thêm chấm công thành công!", id: result.insertId });
    });
  });
};


// ✏️ Cập nhật thông tin chấm công

exports.updateChamCong = (req, res) => {
  const { id } = req.params;
  const { nhan_vien_id, ngay, gio_vao, gio_ra, so_gio_lam, ghi_chu } = req.body;

  
  const sqlCheck = `
    SELECT * FROM ChamCong
    WHERE nhan_vien_id = ?
      AND ngay = ?
      AND id <> ?  -- loại trừ bản ghi hiện tại
      AND (
        (CAST(? AS TIME) < gio_ra)
        AND (CAST(? AS TIME) > gio_vao)
      )
  `;

  db.query(sqlCheck, [nhan_vien_id, ngay, gio_vao, gio_ra, id], (err, existing) => {
    if (err) {
      console.error("❌ Lỗi kiểm tra trùng giờ khi cập nhật:", err);
      return res.status(500).json({ message: "Lỗi server khi kiểm tra trùng giờ" });
    }

    // Nếu phát hiện ca trùng
    if (existing.length > 0) {
      const nhanvienQuery = `SELECT ho_ten FROM NhanVien WHERE id = ?`;
      db.query(nhanvienQuery, [nhan_vien_id], (err2, nv) => {
        const name = nv?.[0]?.ho_ten || `ID ${nhan_vien_id}`;
        return res
          .status(400)
          .json({ message: `❌ Ca làm việc của nhân viên ${name} bị trùng hoặc lồng thời gian!` });
      });
      return;
    }

    // 2️⃣ Không trùng → cập nhật bình thường
    const sqlUpdate = `
      UPDATE ChamCong
      SET nhan_vien_id = ?, ngay = ?, gio_vao = ?, gio_ra = ?, so_gio_lam = ?, ghi_chu = ?
      WHERE id = ?
    `;
    db.query(sqlUpdate, [nhan_vien_id, ngay, gio_vao, gio_ra, so_gio_lam, ghi_chu, id], (err, result) => {
      if (err) {
        console.error("❌ Lỗi cập nhật chấm công:", err);
        return res.status(500).json({ message: "Lỗi server khi cập nhật chấm công" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Không tìm thấy bản ghi chấm công cần cập nhật!" });
      }
      res.json({ message: "✅ Cập nhật chấm công thành công!" });
    });
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

// 📊 Lọc bảng chấm công theo tháng hoặc nhân viên
exports.filterChamCong = (req, res) => {
  const { month, year, nhanvien } = req.query;

  let sql = `
    SELECT cc.*, nv.ho_ten
    FROM ChamCong cc
    JOIN NhanVien nv ON cc.nhan_vien_id = nv.id
    WHERE 1=1
  `;
  const params = [];

  if (month && year) {
    sql += " AND MONTH(cc.ngay) = ? AND YEAR(cc.ngay) = ?";
    params.push(month, year);
  }

  if (nhanvien) {
    sql += " AND nv.id = ?";
    params.push(nhanvien);
  }

  sql += " ORDER BY cc.ngay DESC";

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi lọc chấm công:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json(result);
  });
};

// 📅 Lấy dữ liệu chấm công theo ngày
exports.getChamCongByDate = (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: "Thiếu ngày cần xem" });

  const sql = `
    SELECT cc.*, nv.ho_ten 
    FROM ChamCong cc
    JOIN NhanVien nv ON cc.nhan_vien_id = nv.id
    WHERE cc.ngay = ?
  `;

  db.query(sql, [date], (err, result) => {
    if (err) {
      console.error("❌ Lỗi khi lấy dữ liệu chấm công theo ngày:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json(result);
  });
};

