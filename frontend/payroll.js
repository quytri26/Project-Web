const API_NV = "http://localhost:3000/api/chamcong/nhanvien/all";
const API_LUONG = "http://localhost:3000/api/bangluong/tinhluong";
const API_SAVE = "http://localhost:3000/api/bangluong/save";

// --- LOGIC CHỈNH SỬA VÀ LƯU ---

function calculateTotal(data) {
  // Tính lại tổng lương dựa trên các trường có thể chỉnh sửa
  const luongCoBan = data.luong_co_ban || 0;
  const thuong = parseFloat(data.thuong) || 0;
  const phat = parseFloat(data.phat) || 0;
  
  // Lương tháng 13 (giả sử luong_thu_13 = luong_co_ban nếu tháng là 12)
  const luongThu13 = data.thang_thu == 12 ? luongCoBan : 0; 
  
  return luongCoBan + luongThu13 + thuong - phat;
}

function saveEdit(btn, nvId) {
  const row = btn.closest("tr");
  const data = window.luongData.find(item => item.nhan_vien_id == nvId);

  if (!data) return alert("Lỗi: Không tìm thấy dữ liệu nhân viên.");

  // Lấy giá trị đã chỉnh sửa
  const newThuong = row.querySelector("input[name='thuong']").value.replace(/[^0-9]/g, '');
  const newPhat = row.querySelector("input[name='phat']").value.replace(/[^0-9]/g, '');
  const newTrangThai = row.querySelector("select[name='trang_thai']").value;

  // Cập nhật vào data object
  data.thuong = parseInt(newThuong) || 0;
  data.phat = parseInt(newPhat) || 0;
  data.trang_thai = newTrangThai;
  
  // Tính lại tổng lương
  data.tong_luong = calculateTotal(data);

  // Cập nhật lại giao diện (gọi lại toggleEdit để chuyển sang chế độ xem)
  toggleEdit(btn); 
}

function toggleEdit(btn) {
  const row = btn.closest("tr");
  const nvId = row.querySelector("td:nth-child(2)").textContent; // ID là cột thứ 2
  const data = window.luongData.find(item => item.nhan_vien_id == nvId);

  if (!data) return;

  const isEditing = btn.textContent.includes("Lưu");

  if (isEditing) {
    // CHUYỂN SANG CHẾ ĐỘ XEM
    btn.textContent = "✏️ Chỉnh sửa";
    btn.classList.remove("btn-success");
    btn.classList.add("btn-warning");
    btn.onclick = () => toggleEdit(btn);

    // Cập nhật lại giá trị hiển thị sau khi đã tính toán và lưu trong saveEdit
    row.querySelector("td:nth-child(7)").innerHTML = data.thuong.toLocaleString() + " ₫";
    row.querySelector("td:nth-child(8)").innerHTML = data.phat.toLocaleString() + " ₫";
    row.querySelector("td:nth-child(9) strong").textContent = data.tong_luong.toLocaleString() + " ₫";
    row.querySelector("td:nth-child(10) .badge").textContent = data.trang_thai;

    // Đặt lại thuộc tính contenteditable về false cho các ô không phải Thưởng/Phạt/Trạng thái
    row.querySelectorAll("td").forEach((cell, index) => {
      if (![6, 7, 9].includes(index)) { // Cột Thưởng (6), Phạt (7), Trạng thái (9)
         cell.classList.remove("bg-light"); // Xóa highlight
      }
    });

  } else {
    // CHUYỂN SANG CHẾ ĐỘ CHỈNH SỬA
    btn.textContent = "✅ Lưu";
    btn.classList.remove("btn-warning");
    btn.classList.add("btn-success");
    btn.onclick = () => saveEdit(btn, nvId); // Gán sự kiện lưu

    // Chuyển đổi các cột có thể chỉnh sửa thành input/select
    
    // Cột Thưởng (Cột thứ 7)
    const thuongCell = row.querySelector("td:nth-child(7)");
    thuongCell.innerHTML = `<input type="number" name="thuong" class="form-control form-control-sm" value="${data.thuong}" min="0" style="width: 100px;">`;
    thuongCell.classList.add("bg-light");

    // Cột Phạt (Cột thứ 8)
    const phatCell = row.querySelector("td:nth-child(8)");
    phatCell.innerHTML = `<input type="number" name="phat" class="form-control form-control-sm" value="${data.phat}" min="0" style="width: 100px;">`;
    phatCell.classList.add("bg-light");
    
    // Cột Trạng thái (Cột thứ 10)
    const trangThaiCell = row.querySelector("td:nth-child(10)");
    trangThaiCell.innerHTML = `
        <select name="trang_thai" class="form-select form-select-sm">
            <option value="Chưa trả" ${data.trang_thai === 'Chưa trả' ? 'selected' : ''}>Chưa trả</option>
            <option value="Đã trả" ${data.trang_thai === 'Đã trả' ? 'selected' : ''}>Đã trả</option>
        </select>`;
    trangThaiCell.classList.add("bg-light");
  }
}

// --- LOGIC TÍNH LƯƠNG ---

document.getElementById("btnTinh").addEventListener("click", async () => {
  const thang = document.getElementById("thang").value;
  const nvInput = document.getElementById("nhanvien").value.trim();

  if (!thang) return alert("Vui lòng chọn tháng!");

  document.getElementById("labelThang").textContent = thang;
  document.getElementById("ketqua").classList.remove("d-none");

  const tbody = document.getElementById("bangLuong");
  tbody.innerHTML = "";
  window.luongData = [];

  try {
    let danhSachNV = [];

    // 🧭 Nếu người dùng nhập ID hoặc tên
    if (nvInput) {
      const resNV = await fetch(API_NV);
      const allNV = await resNV.json();

      const found = allNV.find(
        (nv) =>
          nv.id == nvInput ||
          nv.ho_ten.toLowerCase().includes(nvInput.toLowerCase())
      );

      if (!found) return alert("Không tìm thấy nhân viên!");
      danhSachNV = [found];
    } else {
      // Nếu để trống → lấy tất cả
      const resNV = await fetch(API_NV);
      danhSachNV = await resNV.json();
    }

    // 🔁 Tính lương cho từng nhân viên
    for (const nv of danhSachNV) {
      const res = await fetch(`${API_LUONG}?thang=${thang}&nhanvien=${nv.id}`);

      // ✅ Đã sửa: Kiểm tra res.ok trước khi gọi res.json()
      if (!res.ok) {
        // Bỏ qua nếu có lỗi (ví dụ: 404 - Không có dữ liệu chấm công)
        continue;
      }
      
      const data = await res.json();
      
      // Gán thêm luong_co_ban vào data để tính toán lại sau này
      // Giả sử luong_co_ban được trả về từ API tính lương
      if (!data.luong_co_ban) {
         // Nếu API không trả về, cần bổ sung logic để lấy từ NV hoặc giả định.
         // Tạm thời sử dụng một giá trị placeholder nếu không có
         data.luong_co_ban = 0; 
      }
      
      // Thêm nút chỉnh sửa vào hàng
      const editButton = `<button class="btn btn-warning btn-sm" onclick="toggleEdit(this)">✏️ Chỉnh sửa</button>`;

      const row = `
        <tr>
          <td>${editButton}</td> <td>${data.nhan_vien_id}</td>
          <td>${data.ten}</td>
          <td>${data.thang}</td>
          <td>${data.thang_thu}</td>
          <td>${data.tong_gio_lam}</td>
          <td>${data.thuong.toLocaleString()} ₫</td>
          <td>${data.phat.toLocaleString()} ₫</td>
          <td><strong>${data.tong_luong.toLocaleString()} ₫</strong></td>
          <td><span class="badge bg-secondary">${data.trang_thai}</span></td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
      window.luongData.push(data);
    }

    if (window.luongData.length === 0)
      alert("Không có dữ liệu chấm công cho tháng này!");
  } catch (err) {
    console.error(err);
    alert("Lỗi khi tính lương!");
  }
});

// 💾 Lưu toàn bộ bảng lương vào DB
document.getElementById("btnLuuAll").addEventListener("click", async () => {
  if (!window.luongData || window.luongData.length === 0)
    return alert("Không có dữ liệu để lưu!");

  try {
    for (const luong of window.luongData) {
      const payload = {
          nhan_vien_id: luong.nhan_vien_id,
          thang: luong.thang, 
          thang_thu: luong.thang_thu, 
          tong_gio_lam: luong.tong_gio_lam,
          thuong: luong.thuong,
          phat: luong.phat,
          tong_luong: luong.tong_luong,
          trang_thai: luong.trang_thai
      };
      
      const response = await fetch(API_SAVE, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log(`Lưu NV ID ${luong.nhan_vien_id}: ${result.action}`);
    }
    alert("✅ Lưu toàn bộ bảng lương thành công!");
    
    document.getElementById("bangLuong").innerHTML = "";
    document.getElementById("ketqua").classList.add("d-none");

  } catch (err) {
    console.error(err);
    alert("❌ Lỗi khi lưu bảng lương!");
  }
});