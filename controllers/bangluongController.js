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


exports.tinhLuongTheoThang = (req, res) => { // Loại bỏ 'async'
  const { thang, nhanvien } = req.query;
  if (!thang || !nhanvien) {
    return res.status(400).json({ message: "Thiếu tham số tháng hoặc nhân viên" });
  }

  // 🧮 Tách năm và tháng
  const [nam, thangNum] = thang.split("-");

  // 1️⃣ Lấy thông tin nhân viên
  const sqlNV = "SELECT id, ho_ten, luong_co_ban FROM NhanVien WHERE id = ?";
  
  db.query(sqlNV, [nhanvien], (errNV, nvRows) => {
    if (errNV) {
      console.error("❌ Lỗi khi lấy thông tin nhân viên:", errNV);
      return res.status(500).json({ message: "Lỗi khi tính lương" });
    }

    if (nvRows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });

    const nhanVien = nvRows[0];

    // 2️⃣ Lấy dữ liệu chấm công trong tháng
    const sqlCC = "SELECT * FROM ChamCong WHERE nhan_vien_id = ? AND MONTH(ngay) = ? AND YEAR(ngay) = ?";
    
    db.query(sqlCC, [nhanvien, thangNum, nam], (errCC, ccRows) => {
      if (errCC) {
        console.error("❌ Lỗi khi lấy dữ liệu chấm công:", errCC);
        return res.status(500).json({ message: "Lỗi khi tính lương" });
      }

      if (ccRows.length === 0)
        return res.status(404).json({ message: "Không có dữ liệu chấm công trong tháng này" });

      // 3️⃣ Tính tổng số giờ làm
     const tongGio = ccRows.reduce(
  (sum, r) => {
    const gioVao = parseFloat(r.gio_vao);
    const gioRa = parseFloat(r.gio_ra);
    const soGioLam = gioRa - gioVao;
    
    // Nếu kết quả phép trừ là số dương, cộng vào tổng
    return sum + (soGioLam > 0 ? soGioLam : 0);
  },
  0
);

      // 4️⃣ Đếm số lần đi muộn, nghỉ phép, không phép
      const diMuon = ccRows.filter((r) => r.ghi_chu === "Đi muộn").length;
      const nghiPhep = ccRows.filter((r) => r.ghi_chu === "Nghỉ phép").length;
      const khongPhep = ccRows.filter((r) => r.ghi_chu === "Không phép").length;

      // 5️⃣ Tính thưởng và phạt
      let thuong = 0;
      let phat = 0;

      if (tongGio >= 240 && nghiPhep === 0 && khongPhep === 0) thuong += 500000;
      const tongNghi = nghiPhep + khongPhep;
      if (diMuon > 5 || tongNghi > 5) phat += 500000 * Math.floor((diMuon + tongNghi) / 5);

      // 6️⃣ Tính tháng thưởng cuối năm
      const thangThu = parseInt(thangNum);
      const luongThu13 = thangThu === 12 ? nhanVien.luong_co_ban : 0;

      const tongLuong = nhanVien.luong_co_ban + luongThu13 + thuong - phat;

      // ✅ 7️⃣ Trả kết quả
      res.json({
        nhan_vien_id: nhanVien.id,
        ten: nhanVien.ho_ten,
        luong_co_ban: nhanVien.luong_co_ban,
        thang: nam,
        thang_thu: thangNum,
        tong_gio_lam: tongGio,
        thuong,
        phat,
        tong_luong: tongLuong,
        trang_thai: "Chưa trả",
      });
    }); // Kết thúc query chấm công
  }); // Kết thúc query nhân viên
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

// ... [Giữ nguyên tất cả các hàm hiện tại (getAll, getById, add, update, delete, tinhLuongTheoThang)]

// ✅ ĐÃ THÊM: Hàm kiểm tra và lưu (UPSERT)
exports.saveBangLuong = (req, res) => {
    const { nhan_vien_id, thang, thang_thu, tong_gio_lam, thuong, phat, tong_luong, trang_thai } = req.body;

    // 1. Kiểm tra xem bản ghi đã tồn tại chưa
    const sqlCheck = "SELECT id FROM BangLuong WHERE nhan_vien_id = ? AND thang = ? AND thang_thu = ?";
    
    db.query(sqlCheck, [nhan_vien_id, thang, thang_thu], (errCheck, resultCheck) => {
        if (errCheck) {
            console.error("❌ Lỗi kiểm tra bản ghi:", errCheck);
            return res.status(500).json({ message: "Lỗi server" });
        }

        if (resultCheck.length > 0) {
            // 2. Nếu ĐÃ TỒN TẠI: Thực hiện CẬP NHẬT (UPDATE)
            const id = resultCheck[0].id;
            const sqlUpdate = `
                UPDATE BangLuong
                SET tong_gio_lam = ?, thuong = ?, phat = ?, tong_luong = ?, trang_thai = ?
                WHERE id = ?
            `;
            db.query(
                sqlUpdate,
                [tong_gio_lam, thuong || 0, phat || 0, tong_luong || 0, trang_thai || "Chưa trả", id],
                (errUpdate) => {
                    if (errUpdate) {
                        console.error("❌ Lỗi cập nhật bảng lương:", errUpdate);
                        return res.status(500).json({ message: "Lỗi khi cập nhật bảng lương" });
                    }
                    res.json({ message: "✅ Cập nhật bảng lương thành công!", id: id, action: "UPDATE" });
                }
            );
        } else {
            // 3. Nếu CHƯA TỒN TẠI: Thực hiện THÊM MỚI (INSERT)
            const sqlInsert = `
                INSERT INTO BangLuong (nhan_vien_id, thang, thang_thu, tong_gio_lam, thuong, phat, tong_luong, trang_thai)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(
                sqlInsert,
                [nhan_vien_id, thang, thang_thu, tong_gio_lam, thuong || 0, phat || 0, tong_luong || 0, trang_thai || "Chưa trả"],
                (errInsert, resultInsert) => {
                    if (errInsert) {
                        console.error("❌ Lỗi thêm bảng lương:", errInsert);
                        return res.status(500).json({ message: "Lỗi khi thêm bảng lương" });
                    }
                    res.json({ message: "✅ Thêm bảng lương thành công!", id: resultInsert.insertId, action: "INSERT" });
                }
            );
        }
    });
};