// 📄 report.js — phiên bản cuối cùng
const API_URL = "http://localhost:3000/api/report"; // ✅ Đúng đường dẫn backend
const monthInput = document.getElementById("monthInput");
const tableBody = document.getElementById("reportTableBody");
const btnExcel = document.getElementById("exportExcel");
const btnPDF = document.getElementById("exportPDF");

// 📊 Hàm tải báo cáo theo tháng
async function loadReport() {
  try {
    if (!monthInput.value) {
      tableBody.innerHTML = `
        <tr><td colspan="5" class="text-center text-muted">Vui lòng chọn tháng để xem báo cáo</td></tr>`;
      return;
    }

    const [year, month] = monthInput.value.split("-");
    console.log("📅 Gửi yêu cầu:", year, month);

    const res = await fetch(`${API_URL}/baocao/${year}/${month}`);
    if (!res.ok) throw new Error("Lỗi khi tải dữ liệu từ server");

    const data = await res.json();
    console.log("📦 Dữ liệu nhận được từ server:", data);

    if (!data || data.length === 0) {
      tableBody.innerHTML = `
        <tr><td colspan="5" class="text-center text-muted">Không có dữ liệu cho tháng này</td></tr>`;
      return;
    }

    // ✅ Hiển thị dữ liệu trong bảng
    tableBody.innerHTML = data
      .map(
        (r) => `
        <tr>
          <td>${r.id}</td>
          <td>${r.ho_ten}</td>
          <td>${r.thang}</td>
          <td>${Number(r.tong_luong).toLocaleString("vi-VN")} ₫</td>
          <td>${r.trang_thai || "Chưa duyệt"}</td>
        </tr>`
      )
      .join("");

  } catch (error) {
    console.error("❌ Lỗi khi tải dữ liệu báo cáo:", error);
    tableBody.innerHTML = `
      <tr><td colspan="5" class="text-center text-danger">Lỗi khi tải dữ liệu!</td></tr>`;
  }
}

// 📥 Xuất Excel
btnExcel.addEventListener("click", () => {
  if (!monthInput.value) return alert("Vui lòng chọn tháng!");
  const [year, month] = monthInput.value.split("-");
  window.open(`${API_URL}/export/excel/${year}/${month}`, "_blank");
});

// 📄 Xuất PDF
btnPDF.addEventListener("click", () => {
  if (!monthInput.value) return alert("Vui lòng chọn tháng!");
  const [year, month] = monthInput.value.split("-");
  window.open(`${API_URL}/export/pdf/${year}/${month}`, "_blank");
});

// ⏰ Khi thay đổi tháng, tự động tải báo cáo
monthInput.addEventListener("change", loadReport);

// 🚀 Tải dữ liệu mặc định (nếu có giá trị sẵn)
if (monthInput.value) loadReport();
