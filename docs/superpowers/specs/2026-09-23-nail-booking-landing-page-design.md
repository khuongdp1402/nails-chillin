# Đặc Tả Thiết Kế: Hệ Thống Đặt Lịch Làm Nail Thông Minh (Nail Salon Booking Landing Page)

**Ngày lập:** 23/09/2026  
**Công nghệ:** Vite + React + Vanilla CSS (Luxury Aesthetic) + LocalStorage & BroadcastChannel Sync

---

## 1. Mục Tiêu Dự Án
Xây dựng một Landing Page cao cấp chuẩn salon cho thương hiệu làm nail nghệ thuật (Aura Nails Studio), tích hợp:
1. Giao diện giới thiệu thương hiệu và dịch vụ sang trọng, tối ưu hiển thị trên cả điện thoại di động và máy tính.
2. Quy trình đặt lịch tự động thông minh:
   - Tự động cộng dồn thời gian của nhiều dịch vụ khách chọn.
   - Thuật toán khóa khung giờ: Chỉ cho phép chọn khung giờ mà toàn bộ khoảng thực hiện dịch vụ `[Giờ bắt đầu, Giờ kết thúc]` hoàn toàn không giao thoa với bất kỳ lịch đã đặt nào.
   - Cơ chế phòng chống xung đột (concurrency lock): Xử lý khi 2 khách hàng cùng đặt 1 khung giờ đồng thời.
   - Màn hình xác nhận thành công hiển thị đầy đủ thông tin đặt chỗ.
3. Trang / Bảng quản lý lịch dành cho Chủ tiệm & Nhân viên:
   - Xem lịch theo ngày dạng timeline bảng chi tiết (Thời gian, Khách hàng, SĐT, Dịch vụ, Thời lượng, Trạng thái, Thao tác).
   - Nạp sẵn dữ liệu demo ngày 25/09/2026 đúng theo kịch bản mẫu của khách.
   - Hỗ trợ thêm lịch khách vãng lai và hủy lịch.

---

## 2. Danh Mục Dịch Vụ Mặc Định & Thời Lượng (Cố Định)
Hệ thống cài đặt sẵn các dịch vụ phổ biến kèm thời lượng cố định:
* **Sơn gel:** 60 phút (1.0 giờ) - 150.000đ
* **Đắp gel / Đắp bột:** 90 phút (1.5 giờ) - 300.000đ
* **Vẽ móng nghệ thuật (Nail Art):** 30 phút (0.5 giờ) - 100.000đ
* **Tháo gel / Phá bột:** 30 phút (0.5 giờ) - 50.000đ
* **Cắt da & Chăm sóc móng:** 30 phút (0.5 giờ) - 80.000đ
* **Úp móng thiết kế:** 60 phút (1.0 giờ) - 220.000đ

Khách hàng có thể chọn nhiều dịch vụ cùng lúc. Hệ thống tính:
$$\text{Tổng thời lượng (phút)} = \sum \text{Dịch vụ đã chọn}$$

---

## 3. Thuật Toán Kiểm Tra Trùng Lịch & Khóa Khung Giờ

### 3.1 Quy tắc thời gian hoạt động:
* Giờ mở cửa: `08:30` (510 phút tính từ 00:00).
* Giờ đóng cửa: `20:30` (1230 phút tính từ 00:00).
* Bước nhảy khung giờ bắt đầu (Slot step): Mỗi `30 phút` (`08:30`, `09:00`, `09:30`, `10:00`,...).

### 3.2 Kiểm tra tính khả dụng của một khung giờ:
Với ngày khách đã chọn $Date$ và tổng thời gian dịch vụ $Duration$ (phút):
Một khung giờ bắt đầu $T_{start}$ (phút) được coi là **HỢP LỆ (Trống)** nếu thỏa mãn 2 điều kiện:
1. **Không vượt quá giờ đóng cửa:**
   $$T_{end} = T_{start} + Duration \le 1230 \text{ (20:30)}$$
2. **Không giao nhau với bất kỳ lịch đã đặt nào trong ngày:**
   Với mọi lịch đã đặt có khoảng $[B_{start}, B_{end})$:
   $$\text{Không giao nhau} \iff (T_{end} \le B_{start}) \lor (T_{start} \ge B_{end})$$
   Nếu tồn tại bất kỳ lịch đã đặt nào mà:
   $$T_{start} < B_{end} \land T_{end} > B_{start}$$
   $\implies$ Khung giờ $T_{start}$ bị **KHÓA / KHÔNG CHO CHỌN**.

### 3.3 Cơ chế chống xung đột đồng thời (Concurrency Lock Prevention):
* Khi khách bấm nút **"Xác Nhận Đặt Lịch"**:
  1. Kiểm tra lại dữ liệu lịch mới nhất từ `localStorage`.
  2. Nếu khung giờ trong tích tắc vừa qua đã có khách khác đặt thành công $\rightarrow$ Lập tức chặn lại và hiển thị thông báo:
     > *"Khung giờ này vừa có người đặt. Vui lòng chọn khung giờ khác."*
     Đồng thời tải lại danh sách các khung giờ còn trống.
  3. Nếu khung giờ vẫn còn trống $\rightarrow$ Lưu lịch vào `localStorage`, đồng thời phát sự kiện qua `BroadcastChannel('nail_booking_channel')` để mọi tab trình duyệt khác tự động cập nhật ngay.

---

## 4. Cấu Trúc Giao Diện & Trải Nghiệm Người Dùng (UI/UX)
- Header: Logo Aura Nails, Navigation, Nút Switch Chế độ Chủ tiệm/Khách hàng.
- Hero: Luxury dark & rose-gold banner, CTA Đặt Lịch Ngay.
- Services: Showcase dịch vụ, giá và thời gian.
- Booking Wizard: 4 bước trực quan, tự động tính tổng giờ, chỉ mở giờ trống, khóa giờ trùng.
- Owner Dashboard: Timeline bảng lịch theo ngày, hiển thị Đã đặt / Còn trống, hủy lịch, thêm nhanh khách vãng lai, nạp dữ liệu mẫu 25/09/2026.
