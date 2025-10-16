// ====================== CHẤM CÔNG ======================

// Tính số giờ làm (hỗ trợ ca đêm)
function tinhSoGio(row) {
  const vao = row.querySelector(".gio-vao").value;
  const ra = row.querySelector(".gio-ra").value;
  const regex = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (regex.test(vao) && regex.test(ra)) {
    const [hv, mv] = vao.split(":").map(Number);
    const [hr, mr] = ra.split(":").map(Number);
    let start = hv * 60 + mv;
    let end = hr * 60 + mr;
    if (end < start) end += 24 * 60; // ca đêm
    const diff = (end - start) / 60;
    row.querySelector(".so-gio").textContent = diff.toFixed(2);
  } else {
    row.querySelector(".so-gio").textContent = "0.00";
  }
}

// Tự động tính giờ khi nhập
document.addEventListener("input", (e) => {
  if (e.target.classList.contains("gio-vao") || e.target.classList.contains("gio-ra")) {
    tinhSoGio(e.target.closest("tr"));
  }
});

// Khi chọn ngày chấm công → hiển thị danh sách nhân viên (sắp A-Z, hiển thị ID)
document.getElementById("chamCongDate").addEventListener("change", async () => {
  const date = document.getElementById("chamCongDate").value;
  const tbody = document.querySelector("#employeeTable tbody");

  if (!date) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted">Vui lòng chọn ngày chấm công để xem danh sách nhân viên.</td></tr>`;
    return;
  }

  const res = await fetch("http://localhost:3000/api/chamcong/nhanvien/all");
  let data = await res.json();

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted">Không có nhân viên nào trong hệ thống.</td></tr>`;
    return;
  }

  // 🔹 Sắp xếp theo tên A → Z
  data.sort((a, b) => a.ho_ten.localeCompare(b.ho_ten, "vi", { sensitivity: "base" }));

  // 🔹 Hiển thị ID ở cột đầu tiên
  tbody.innerHTML = data
    .map(
      (nv) => `
      <tr data-id="${nv.id}">
        <td>${nv.id}</td>
        <td>${nv.ho_ten}</td>
        <td><input type="text" class="form-control gio-vao" placeholder="HH:MM" pattern="^([01]\\d|2[0-3]):[0-5]\\d$"></td>
        <td><input type="text" class="form-control gio-ra" placeholder="HH:MM" pattern="^([01]\\d|2[0-3]):[0-5]\\d$"></td>
        <td class="so-gio">0.00</td>
        <td>
          <select class="form-select ghi-chu">
            <option value="">-- Chọn --</option>
            <option value="Đi muộn">Đi muộn</option>
            <option value="Nghỉ phép">Nghỉ phép</option>
            <option value="Không phép">Không phép</option>
          </select>
        </td>
      </tr>`
    )
    .join("");
});

// Lưu chấm công
document.getElementById("saveAttendance").addEventListener("click", async () => {
  const ngay = document.getElementById("chamCongDate").value;
  if (!ngay) return alert("⚠️ Vui lòng chọn ngày chấm công!");

  const rows = document.querySelectorAll("#employeeTable tbody tr");
  let count = 0;

  for (const row of rows) {
    const id = row.dataset.id;
    const gio_vao = row.querySelector(".gio-vao").value;
    const gio_ra = row.querySelector(".gio-ra").value;
    const so_gio = row.querySelector(".so-gio").textContent;
    const ghi_chu = row.querySelector(".ghi-chu").value; 
    const regex = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!regex.test(gio_vao) || !regex.test(gio_ra)) continue;

  const res = await fetch("http://localhost:3000/api/chamcong", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nhan_vien_id: id,
    ngay,
    gio_vao,
    gio_ra,
    ghi_chu,
    so_gio_lam: so_gio,
  }),
});

if (!res.ok) {
  const errData = await res.json();
  console.warn(`⚠️ Lỗi chấm công nhân viên ID ${id}:`, errData.message);
  alert(`❌ Lỗi chấm công nhân viên ID ${id}: ${errData.message}`);
  continue; // bỏ qua không tăng count, không lưu tiếp
}

count++;

  }

  alert(`✅ Đã lưu ${count} bản ghi chấm công cho ngày ${ngay}`);
});

// ====================== XEM BẢNG CHẤM CÔNG ======================

// Chuyển giữa 2 chế độ
document.getElementById("btnChamCong").addEventListener("click", () => {
  document.getElementById("chamCongSection").style.display = "block";
  document.getElementById("xemBangSection").style.display = "none";
});

document.getElementById("btnXemBang").addEventListener("click", () => {
  document.getElementById("chamCongSection").style.display = "none";
  document.getElementById("xemBangSection").style.display = "block";
});

// Lọc bảng chấm công
document.getElementById("btnFilter").addEventListener("click", async () => {
  const month = document.getElementById("filterMonth").value;
  const year = document.getElementById("filterYear").value;
  const nhanvien = document.getElementById("filterNhanVien").value;

  const params = new URLSearchParams();
  if (month) params.append("month", month);
  if (year) params.append("year", year);
  if (nhanvien) params.append("nhanvien", nhanvien);

  const res = await fetch(`http://localhost:3000/api/chamcong/filter?${params.toString()}`);
  const data = await res.json();

  const tbody = document.getElementById("bangChamCongBody");
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted">Không có dữ liệu phù hợp</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map(
      (cc) => `
      <tr>
        <td>${new Date(cc.ngay).toLocaleDateString("vi-VN")}</td>
        <td>${cc.ho_ten}</td>
        <td>${cc.gio_vao}</td>
        <td>${cc.gio_ra}</td>
        <td>${cc.so_gio_lam}</td>
        <td>${cc.ghi_chu || ""}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editChamCong(${cc.id})">✏️ Sửa</button>
          <button class="btn btn-danger btn-sm" onclick="deleteChamCong(${cc.id})">🗑️ Xóa</button>
        </td>
      </tr>`
    )
    .join("");
});



// ✏️ Sửa chấm công với modal
async function editChamCong(id) {
  try {
    const res = await fetch(`http://localhost:3000/api/chamcong/${id}`);
    const cc = await res.json();

    // Gán dữ liệu vào form popup
    document.getElementById("editGioVao").value = cc.gio_vao;
    document.getElementById("editGioRa").value = cc.gio_ra;
    document.getElementById("editGhiChu").value = cc.ghi_chu || "";

    // Hiển thị modal
    const modal = document.getElementById("editModal");
    modal.style.display = "flex";

    // Khi bấm "Lưu"
    document.getElementById("saveEdit").onclick = async () => {
      const gioVao = document.getElementById("editGioVao").value;
      const gioRa = document.getElementById("editGioRa").value;
      const ghiChu = document.getElementById("editGhiChu").value;

      if (!gioVao || !gioRa) return alert("⚠️ Giờ vào/ra không được để trống!");

      const body = {
        nhan_vien_id: cc.nhan_vien_id,
        ngay: cc.ngay.split("T")[0],
        gio_vao: gioVao,
        gio_ra: gioRa,
        ghi_chu: ghiChu,
        so_gio_lam:
          ((new Date(`1970-01-01T${gioRa}:00`) - new Date(`1970-01-01T${gioVao}:00`)) / 3600000).toFixed(2),
      };

      const updateRes = await fetch(`http://localhost:3000/api/chamcong/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!updateRes.ok) {
        const err = await updateRes.json();
        return alert(err.message || "❌ Lỗi khi cập nhật!");
      }

      alert("✅ Cập nhật chấm công thành công!");
      modal.style.display = "none";
      document.getElementById("btnFilter").click(); // Reload bảng
    };

    // Khi bấm "Huỷ"
    // Khi bấm "Huỷ"
      document.getElementById("cancelEdit").onclick = () => {
  const modal = document.getElementById("editModal");
  modal.style.display = "none"; // Đóng popup
  document.getElementById("saveEdit").onclick = null; // Ngắt sự kiện cũ để tránh xung đột
};

  } catch (err) {
    console.error("❌ Lỗi sửa chấm công:", err);
  }
}



// ====================== HÀNH ĐỘNG: SỬA / XÓA CHẤM CÔNG ======================

// ✏️ Sửa chấm công
async function editChamCong(id) {
  try {
    const res = await fetch(`http://localhost:3000/api/chamcong/${id}`);
    const cc = await res.json();

    // Hiển thị dữ liệu ra prompt để sửa nhanh (hoặc bạn có thể mở modal)
    const gioVao = prompt("Nhập giờ vào mới (HH:MM)", cc.gio_vao);
    const gioRa = prompt("Nhập giờ ra mới (HH:MM)", cc.gio_ra);
    const ghiChu = prompt("Ghi chú", cc.ghi_chu || "");

    if (!gioVao || !gioRa) return alert("⚠️ Giờ vào/ra không được để trống!");

    const body = {
      nhan_vien_id: cc.nhan_vien_id,
      ngay: cc.ngay.split("T")[0],
      gio_vao: gioVao,
      gio_ra: gioRa,
    ghi_chu: document.getElementById("ghi_chu").value || null,  
      so_gio_lam:
        ((new Date(`1970-01-01T${gioRa}:00`) - new Date(`1970-01-01T${gioVao}:00`)) / 3600000).toFixed(2),
    };

    const updateRes = await fetch(`http://localhost:3000/api/chamcong/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!updateRes.ok) {
      const err = await updateRes.json();
      return alert(err.message || "❌ Lỗi khi cập nhật!");
    }

    alert("✅ Cập nhật chấm công thành công!");
    document.getElementById("btnFilter").click(); // reload bảng
  } catch (err) {
    console.error("❌ Lỗi sửa chấm công:", err);
  }
}

// 🗑️ Xóa chấm công
async function deleteChamCong(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa bản ghi chấm công này không?")) return;

  try {
    const res = await fetch(`http://localhost:3000/api/chamcong/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) return alert(data.message || "❌ Lỗi khi xóa chấm công!");

    alert("✅ Xóa thành công!");
    document.getElementById("btnFilter").click(); // reload lại bảng
  } catch (err) {
    console.error("❌ Lỗi xóa chấm công:", err);
  }
}
