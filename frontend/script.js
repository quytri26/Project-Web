const API_URL = "http://localhost:3000/api/nhanvien";

const form = document.getElementById("employeeForm");
const tableBody = document.getElementById("employeeTableBody");
const resetBtn = document.getElementById("resetBtn");

// 📅 Hàm định dạng ngày (YYYY-MM-DD → DD/MM/YYYY)
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// 🧾 Load danh sách nhân viên
async function loadEmployees() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    data.sort((a, b) => a.ho_ten.localeCompare(b.ho_ten, "vi", { sensitivity: "base" }));
    console.log("📦 Dữ liệu từ API:", data);

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Chưa có nhân viên nào.</td></tr>`;
      return;
    }

    tableBody.innerHTML = data
      .map(
        (nv) => `
        <tr>
          <td>${nv.id}</td>
          <td>${nv.ho_ten || ""}</td>
          <td>${formatDate(nv.ngay_sinh)}</td>
          <td>${nv.gioi_tinh || ""}</td>
          <td>${nv.chuc_vu || ""}</td>
          <td>${nv.luong_co_ban?.toLocaleString("vi-VN") || ""}</td>
          <td>${formatDate(nv.ngay_vao_lam)}</td>
          <td>${nv.trang_thai || ""}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editEmployee(${nv.id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${nv.id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (error) {
    console.error("❌ Lỗi tải danh sách:", error);
  }
}

// ➕ Thêm hoặc cập nhật nhân viên
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const ngaySinh = document.getElementById("ngay_sinh").value;
  const ngayVaoLam = document.getElementById("ngay_vao_lam").value;

  // Kiểm tra tuổi & ngày làm việc
  if (ngaySinh && ngayVaoLam) {
    const birthDate = new Date(ngaySinh);
    const startDate = new Date(ngayVaoLam);
    const todayDate = new Date();

    const minStartDate = new Date(birthDate);
    minStartDate.setFullYear(minStartDate.getFullYear() + 16);

    if (startDate < minStartDate) {
      alert("❌ Nhân viên phải đủ 16 tuổi mới có thể vào làm!");
      return;
    }

    if (startDate > todayDate) {
      alert("❌ Ngày vào làm không được vượt quá ngày hiện tại!");
      return;
    }
  }

  const id = document.getElementById("employeeId").value;

  const body = {
    ho_ten: document.getElementById("ho_ten").value,
    ngay_sinh: document.getElementById("ngay_sinh").value,
    gioi_tinh: document.getElementById("gioi_tinh").value || "Khác",
    chuc_vu: document.getElementById("chuc_vu").value,
    luong_co_ban: parseFloat(document.getElementById("luong_co_ban").value || 0),
    ngay_vao_lam: document.getElementById("ngay_vao_lam").value,
    trang_thai: document.getElementById("trang_thai").value,
  };

  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/${id}` : API_URL;

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  alert(id ? "✅ Cập nhật thành công!" : "✅ Thêm mới thành công!");
  form.reset();
  document.getElementById("employeeId").value = "";
  loadEmployees();
});

// 🔄 Nút Hủy / reset form
resetBtn.addEventListener("click", () => {
  form.reset();
  document.getElementById("employeeId").value = "";
});

// ✏️ Sửa nhân viên
async function editEmployee(id) {
  const res = await fetch(`${API_URL}/${id}`);
  const nv = await res.json();

  document.getElementById("employeeId").value = nv.id;
  document.getElementById("ho_ten").value = nv.ho_ten;
  document.getElementById("ngay_sinh").value = nv.ngay_sinh?.split("T")[0] || "";
  document.getElementById("gioi_tinh").value = nv.gioi_tinh;
  document.getElementById("chuc_vu").value = nv.chuc_vu;
  document.getElementById("luong_co_ban").value = nv.luong_co_ban;
  document.getElementById("ngay_vao_lam").value = nv.ngay_vao_lam?.split("T")[0] || "";
  document.getElementById("trang_thai").value = nv.trang_thai;
}

// 🗑️ Xóa nhân viên
async function deleteEmployee(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này không?")) return;
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  alert("✅ Xóa thành công!");
  loadEmployees();
}

// 🔍 Tìm kiếm nhân viên theo tên hoặc ID
const searchBtn = document.getElementById("searchBtn");
const clearSearch = document.getElementById("clearSearch");

if (searchBtn && clearSearch) {
  searchBtn.addEventListener("click", async () => {
    const keyword = document.getElementById("searchInput").value.trim();
    if (!keyword) {
      loadEmployees();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      data.sort((a, b) => a.ho_ten.localeCompare(b.ho_ten, "vi", { sensitivity: "base" }));
      
      if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Không tìm thấy nhân viên nào.</td></tr>`;
        return;
      }

      tableBody.innerHTML = data.map(
        (nv) => `
        <tr>
          <td>${nv.id}</td>
          <td>${nv.ho_ten || ""}</td>
          <td>${formatDate(nv.ngay_sinh)}</td>
          <td>${nv.gioi_tinh || ""}</td>
          <td>${nv.chuc_vu || ""}</td>
          <td>${nv.luong_co_ban?.toLocaleString("vi-VN") || ""}</td>
          <td>${formatDate(nv.ngay_vao_lam)}</td>
          <td>${nv.trang_thai || ""}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editEmployee(${nv.id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${nv.id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>`
      ).join("");
    } catch (err) {
      console.error("❌ Lỗi tìm kiếm:", err);
    }
  });

  // 🧹 Xóa tìm kiếm
  clearSearch.addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    loadEmployees();
  });
}

// 🚀 Khi trang load xong, tự động hiển thị danh sách nhân viên
document.addEventListener("DOMContentLoaded", loadEmployees);
