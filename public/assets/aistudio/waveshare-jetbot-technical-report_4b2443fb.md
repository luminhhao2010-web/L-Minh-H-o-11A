---
title: "Báo cáo kỹ thuật: Waveshare JetBot - Phần cứng, Phần mềm, Vận hành"
language: vi
doc_type: technical_research_report
subject: Waveshare JetBot (JetBot 2GB AI Kit, JetBot ROS AI Kit, UGV Rover ROS 2)
domain: [edge AI, robotics, computer vision, ROS, SLAM, embedded systems]
keywords: [JetBot, Jetson Nano, Jetson Orin Nano, RP2040, ESP32, ROS 1, ROS 2, SLAM, TensorRT, RPLIDAR, IMU, EKF, ESP-NOW, Docker]
---

# Waveshare JetBot: Báo cáo kỹ thuật toàn diện

## 0. Tóm tắt nhanh (TL;DR)

- **Là gì:** Dòng robot tự hành edge-AI của Waveshare, gồm 3 cấp: JetBot 2GB AI Kit (giáo dục), JetBot ROS AI Kit (nghiên cứu), UGV Rover ROS 2 (cao cấp, Jetson Orin Nano).
- **Kiến trúc cốt lõi:** Phân tầng "não - tiểu não". Jetson (Linux, không real-time) xử lý nhận thức/AI. Vi điều khiển thời gian thực (RP2040 hoặc ESP32) xử lý động cơ, encoder, IMU.
- **Giao tiếp Jetson ↔ MCU:** I2C (RP2040 là I2C slave tại địa chỉ `0x60`) và USB serial (`/dev/ttyACM0`, `/dev/ttyACM1`).
- **Nguồn:** 3 pin Li-ion 18650 nối tiếp (11.1 V - 12.6 V), hạ xuống 5 V cho Jetson, có mạch bảo vệ 4 lớp (S-8254AA + AO4407A).
- **Cảm biến chính:** Camera Sony IMX219 (160° FOV, MIPI CSI-2), Lidar RPLIDAR A1/D500, IMU 9 trục MPU9250/MPU9255, encoder Hall, micro MEMS.
- **Phần mềm:** Ubuntu 18.04 (Nano) / 22.04 (Orin Nano), JetPack, Docker (nvidia-container-runtime), ROS 1 (Melodic/Noetic) hoặc ROS 2 Humble.
- **Hiệu năng AI:** TensorRT FP16 giảm độ trễ p99 từ 98.82 ms (FP32) xuống 39.63 ms; độ trễ toàn trình p99 giảm từ 639.73 ms xuống 121.78 ms nhờ hàng đợi Latest-Frame Slot.
- **Đa robot:** Biến thể UGV dùng ESP-NOW (ESP32) cho liên lạc swarm độ trễ rất thấp.

---

## 1. Tổng quan kiến trúc và định hướng công nghệ

### 1.1 Bối cảnh
Xu hướng edge computing và thị giác máy tính: chạy AI trực tiếp trên thiết bị tự hành để tránh độ trễ của cloud. JetBot là nguyên mẫu đầy đủ tính năng cho các bài toán:

- SLAM (lập bản đồ và định vị đồng thời)
- Tránh vật cản cục bộ (local collision avoidance)
- Phân tích hình ảnh chiều sâu
- Robot bầy đàn (swarm robotics)

### 1.2 Nguyên lý thiết kế: kiến trúc hai tầng

| Tầng | Vai trò | Phần cứng | Đặc tính |
|---|---|---|---|
| "Não" (cognitive) | AI, thị giác, SLAM, điều hướng | NVIDIA Jetson (Linux) | Công suất lớn, KHÔNG deterministic |
| "Tiểu não" (motor control) | PID động cơ, đọc encoder, IMU, PWM | RP2040 hoặc ESP32 | Real-time, deterministic |

**Lý do:** Linux không phải hệ điều hành thời gian thực. Khi GPU tải nặng, các luồng đọc GPIO có thể bị tạm dừng, dẫn tới mất encoder tick và sai odometry. Tách MCU riêng loại bỏ rủi ro này.

---

## 2. Các biến thể sản phẩm (so sánh tổng hợp)

| Thuộc tính | JetBot 2GB AI Kit | JetBot ROS AI Kit (Kit B, Pro) | UGV Rover ROS 2 |
|---|---|---|---|
| Phân khúc | Giáo dục cơ bản | Nghiên cứu cao cấp | Nghiên cứu cao cấp / off-road |
| Máy tính chủ | Jetson Nano 2GB | Jetson Nano (4GB, B01) | Jetson Orin Nano (4GB hoặc 8GB) |
| Vi điều khiển phụ | (không nêu rõ) | RP2040 | ESP32 |
| Khung gầm | Hợp kim nhôm | Kim loại, cứng hơn | Hợp kim nhôm dày 2 mm |
| Dẫn động | Vi sai 2WD + bánh caster trước/sau | (vi sai, động cơ kim loại) | 6 bánh 4WD hoặc bánh xích, treo độc lập |
| Động cơ | TT motor, tỷ số 1:48, 240 RPM không tải | Giảm tốc kim loại 37-520, tỷ số 1:30, 333 RPM không tải | Truyền động kín |
| Encoder | (không nêu) | Hall AB phase 11 dây | (không nêu) |
| Khối lượng | ~0.912 kg | ~1.135 kg (một số phụ kiện: 1.966 kg) | > 2.7 kg |
| Tốc độ tối đa | (không nêu) | (không nêu) | 1.3 m/s |
| Hệ điều hành | Ubuntu 18.04 LTS | Ubuntu 18.04 / 20.04 | Ubuntu 22.04 LTS |
| Phần mềm robot | Jupyter notebooks | ROS 1 Melodic / Noetic | ROS 2 Humble LTS |
| Đặc trưng thêm | - | Lidar, IMU, SLAM, Navigation | Pan-Tilt 2 trục, OAK-D Lite, NVMe 256GB, ESP-NOW |

> Ô ghi "(không nêu)" nghĩa là tài liệu gốc không cung cấp thông tin, không phải là không có.

---

## 3. Bộ xử lý trung tâm (Jetson)

### 3.1 Bảng thông số

| Nền tảng | CPU | GPU | Băng thông bộ nhớ | Năng lực tính toán |
|---|---|---|---|---|
| Jetson Nano 2GB | ARM Cortex-A57 quad-core @ 1.43 GHz | Maxwell 128 lõi | LPDDR4 25.6 GB/s (64-bit) | 472 GFLOPS |
| Jetson Nano 4GB (B01) | ARM Cortex-A57 quad-core @ 1.43 GHz | Maxwell 128 lõi | LPDDR4 25.6 GB/s (64-bit) | 472 GFLOPS |
| Jetson Orin Nano (4GB/8GB) | ARM Cortex-A78AE | Ampere | LPDDR5 ~68 GB/s (ước tính) | 20 TOPS |

### 3.2 Ghi chú
- **Waveshare Jetson Nano Dev Kit:** tích hợp eMMC 16GB trực tiếp lên module (không chỉ dựa vào microSD) → ổn định hơn khi đọc/ghi liên tục trong môi trường rung lắc.
- **UGV Rover (Orin Nano):** chuyển từ Maxwell sang Ampere, hiệu suất AI lên tới 20 TOPS. Dùng NVMe 256GB tốc độ cao để lưu dữ liệu point cloud, hỗ trợ LLM/VLM mà không nghẽn lưu trữ.

---

## 4. Kiến trúc điều khiển kép và giao thức thời gian thực

### 4.1 Vấn đề cần giải quyết
Vòng lặp PID động cơ có chu kỳ mili-giây không thể chạy ổn định trên Ubuntu (non-real-time). Chuỗi hậu quả:

```
GPU tải nặng (phân tích ảnh)
  → OS tạm dừng thread đọc GPIO
  → mất encoder tick
  → odometry sai
  → định vị không gian sai
```

### 4.2 Giải pháp: MCU chuyên dụng

**RP2040 (JetBot ROS AI Kit)**

| Thông số | Giá trị |
|---|---|
| Lõi | Dual-core ARM Cortex-M0+ |
| Xung nhịp | Tới 133 MHz |
| SRAM | 264 KB |
| Flash | 2 MB |
| Nhiệm vụ | Giao tiếp trực tiếp với động cơ và cảm biến quán tính |

**ESP32 (UGV Rover):** thay RP2040, bổ sung năng lực truyền dẫn không dây cấp thấp (dùng cho ESP-NOW, xem mục 10.3).

### 4.3 Giao thức Jetson ↔ RP2040

| Kênh | Chi tiết |
|---|---|
| I2C | RP2040 giả lập I2C slave tại địa chỉ **`0x60`**, có bản đồ thanh ghi lệnh chuẩn hóa |
| USB Type-C | Linux thấy RP2040 là serial ảo `/dev/ttyACM0` và `/dev/ttyACM1`, băng thông cao hơn cho dữ liệu thô |

**Luồng điều khiển:**

```
Lõi AI (Jetson) → ghi lệnh vận tốc qua I2C 0x60 → RP2040 giải mã
  → sinh PWM → IC cầu H (TB6612FNG) → động cơ
```

### 4.4 Nạp firmware RP2040 (UF2)

1. Giữ nút **BOOT**.
2. Nhấn rồi nhả nút **RESET**.
3. Bo mạch hiện như ổ USB mass storage tên **`RPI-RP2`**.
4. Chép file `.uf2` vào ổ đó.
5. Chip tự ghi Flash và khởi động lại. Không cần công cụ nạp bên thứ ba.

**Công cụ phát triển:** C/C++ SDK (CMake), MicroPython (Thonny IDE). Cho phép chỉnh bộ lọc tín hiệu và thông số PID ngay trên phần cứng.

---

## 5. Cơ khí: khung gầm, động cơ, truyền động

### 5.1 JetBot 2GB AI Kit (giáo dục)
- Khung: hợp kim nhôm nhẹ.
- Động cơ: 2 × TT motor, tỷ số 1:48, **240 RPM** không tải.
- Khối lượng: ~**0.912 kg**.
- Truyền động: vi sai 2WD, bánh caster ở phía trước và sau để giữ thăng bằng.

### 5.2 JetBot ROS AI Kit (Kit B, Professional)
- Khối lượng: **1.135 kg** (một số phụ kiện: 1.966 kg).
- Động cơ: giảm tốc kim loại **37-520**, tỷ số **1:30**, **333 RPM** không tải, mô-men xoắn cao hơn.
- Encoder: Hall 11 dây pha AB gắn đuôi động cơ. Hai kênh A/B lệch pha 90° → MCU suy ra cả số vòng tuyệt đối lẫn chiều quay. Dùng cho wheel odometry sai số tích lũy thấp.

### 5.3 UGV Rover ROS 2 (cao cấp)
- Di chuyển: 6 bánh 4WD độc lập hoặc bánh xích off-road, treo độc lập.
- Khung: hợp kim nhôm dày **2 mm**. Khối lượng **> 2.7 kg**.
- Tốc độ tối đa: **1.3 m/s** (động cơ truyền động kín).
- **Pan-Tilt 2 trục 360°:** dùng servo bus nối tiếp **ST3215**, mô-men xoắn tới **30 KG.CM**. Cho phép hướng camera và Lidar độc lập với hướng di chuyển của khung.

---

## 6. Nguồn, bảo vệ pin, nhiệt

### 6.1 Chuỗi cấp nguồn

```
3 × Li-ion 18650 (nối tiếp, 3.7 V danh định, 4.2 V đầy)
  → 11.1 V - 12.6 V
  ├─→ IC cầu H TB6612FNG (cấp thẳng 12.6 V, giảm sụt áp khi tăng tốc đột ngột)
  └─→ IC điều áp APW7313 (hoặc LDO tương tự) → 5 V ổn định → Jetson
```

Mục đích hạ áp ổn định 5 V: tránh kernel panic khi động cơ rút dòng lớn gây nhiễu.

### 6.2 Bảo vệ pin

| Thành phần | Chức năng |
|---|---|
| IC **S-8254AA** + MOSFET **AO4407A** | 4 lớp bảo vệ: quá áp sạc (overcharge), xả sâu (over-discharge), quá dòng (over-current), đoản mạch (short circuit) |

**Lưu ý vận hành quan trọng:** S-8254AA thường tự vào chế độ khóa an toàn khi tháo pin (an toàn vận chuyển). Sau khi gắn pin mới, **phải cắm bộ cấp nguồn 12.6 V vào cổng sạc vài giây** để đánh thức mạch bảo vệ thì robot mới khởi động được.

### 6.3 Đo lường pin (telemetry)
- Cảm biến: **INA219** (hoặc **ADS1115** ở một số bo), giao tiếp I2C.
- Đo: điện áp mảng pin và dòng tiêu thụ/sạc.
- Hiển thị: phần trăm pin trên màn hình OLED 0.91 inch 128×32.

### 6.4 Quản lý nhiệt và công suất

| Hạng mục | Chi tiết |
|---|---|
| Quạt | PWM 40×20 mm, 5 V (Fan-4020-PWM-5V), điều tốc theo nhiệt độ CPU/GPU |
| Tinh chỉnh | `jtop` (gói `jetson-stats`) để chỉnh fan curve |
| Chế độ công suất | `nvpmodel -m 0` = MAXN (10 W); `nvpmodel -m 1` = 5 W |

### 6.5 Bảng tóm tắt

| Phân hệ | Linh kiện | Chức năng / giới hạn |
|---|---|---|
| Lưu trữ năng lượng | 3 × pin 18650 Li-ion | Nối tiếp, 11.1 V - 12.6 V |
| Bảo vệ pin | S-8254AA + AO4407A | Chống đoản mạch, xả sâu |
| Telemetry | INA219 / ADS1115 | I2C, đo áp/dòng, tính dung lượng |
| Công suất CPU | `nvpmodel` | 10 W (MAXN) hoặc 5 W |
| Tản nhiệt | Quạt 4020 PWM 5 V + `jtop` | Điều tốc theo nhiệt độ lõi |

---

## 7. Hệ cảm biến

### 7.1 Camera
- **Chính:** Sony **IMX219** CMOS, 8 MP, độ phân giải thô **3280 × 2464**, góc nhìn **160° FOV**.
- **Giao diện:** MIPI CSI-2 (DSI/CSI-2 đa làn), đưa dữ liệu thẳng vào GPU, tránh độ trễ và tải CPU của USB.
- **Ứng dụng:** bám vạch (line tracking) cận cảnh, nhận diện biển báo, vật cản ở góc cao.
- **Thay thế:** IMX462 2MP Starlight (quan sát ban đêm); OAK-D Lite (đo chiều sâu, trên UGV ROS 2).

### 7.2 Lidar
- **Model:** RPLIDAR A1 (hoặc D500), quét cơ học 360°.
- **Nguyên lý:** phát hàng nghìn xung laser/giây, tính thời gian phản xạ (hoặc biến dạng tam giác quang học) → point cloud 2D.
- **Đầu ra:** occupancy grid map. Làm nền cho thuật toán tránh va chạm cục bộ.
- **Nguồn:** công tắc riêng (PWR Switch) để tiết kiệm pin khi không dùng Lidar.

### 7.3 IMU
- **Model:** 9 trục **MPU9250** hoặc **MPU9255** (con quay, gia tốc kế, từ kế).
- **Vấn đề:** drift error và nhiễu tích lũy. Khởi tạo sai làm robot xoay sai hướng.

**Quy trình hiệu chuẩn (Waveshare):**

1. Khi chạy chương trình MCU, IMU vào chế độ hiệu chuẩn nội bộ. LED **sáng tĩnh**.
2. Đặt robot **đứng yên tuyệt đối trên mặt phẳng nằm ngang**.
3. Sau vài giây, nếu thu nhiễu nền thành công, LED chuyển sang **nhấp nháy**.
4. Nếu không thành công: nhấn nút **RESET** trên bo để thu lại.

**Trong ROS:** dữ liệu IMU được **EKF (Extended Kalman Filter)** trộn với wheel odometry, tạo bản tin `/tf` odom ổn định.

### 7.4 Âm thanh (HCI)
- IC âm thanh giao tiếp USB độc lập.
- 2 micro MEMS silicon + 1 cặp loa.
- Chức năng: nghe lệnh giọng nói → NLP → thực thi → trả lời bằng TTS (Speech Synthesis).

### 7.5 Bảng tóm tắt cảm biến

| Cảm biến | Model | Giao diện | Dữ liệu |
|---|---|---|---|
| Camera | Sony IMX219 (8MP, 160°) | MIPI CSI-2 | Ảnh RGB |
| Camera đêm | IMX462 Starlight 2MP | (tùy chọn) | Ảnh thiếu sáng |
| Camera sâu | OAK-D Lite | (UGV ROS 2) | Chiều sâu |
| Lidar | RPLIDAR A1 / D500 | (qua USB/UART) | `/scan`, point cloud 2D |
| IMU | MPU9250 / MPU9255 | MCU | Gia tốc, góc quay, từ trường |
| Encoder | Hall AB 11 dây | MCU | Tick bánh xe, chiều quay |
| Pin | INA219 / ADS1115 | I2C | Áp, dòng |
| Âm thanh | 2 MEMS mic + loa | USB | Giọng nói |

---

## 8. Hệ điều hành, Docker, ROS

### 8.1 Hệ điều hành và SDK

| Dòng | Hệ điều hành |
|---|---|
| Nano cơ bản | Ubuntu 18.04 LTS |
| Orin Nano cao cấp | Ubuntu 22.04 LTS |

Image đi kèm **NVIDIA JetPack**: CUDA Toolkit, cuDNN, TensorRT.

### 8.2 Docker
NVIDIA JetBot và Waveshare khuyến nghị dùng Docker để tránh xung đột thư viện Python và giữ môi trường ROS nguyên vẹn.

**Quy trình cấu hình:**

1. Sửa `/etc/docker/daemon.json`: đặt default runtime là `nvidia-container-runtime` (để CUDA GPU hiển thị trong container).
2. Do bộ nhớ trên module Jetson Nano dung lượng thấp, **rsync `/var/lib/docker`** sang phân vùng ngoài (microSD hoặc NVMe mount tại `/data`).
3. Thêm **dependency trong Systemd** để tránh boot race condition (Docker khởi động trước khi ổ ngoài mount xong).

### 8.3 ROS 1 (Ubuntu 18.04/20.04: Melodic hoặc Noetic)
- Workspace: `catkin_ws`.
- Gói cốt lõi: **`jetbot_pro`** (76.2% Python, 13.5% C++).

| Lệnh / thành phần | Chức năng |
|---|---|
| `roslaunch jetbot_pro jetbot.launch` | Chạy chassis node. Giao tiếp USB/I2C với RP2040, chuyển đổi vận tốc động học bánh xe, lắng nghe `/cmd_vel` |
| `roslaunch jetbot_pro slam.launch` | Chạy Gmapping. Nghe `/scan` từ Lidar, kết hợp `/tf` odom → bản đồ xác suất 2D |
| `roslaunch jetbot_pro nav.launch` | Chạy Navigation Stack (cục bộ + toàn cục). Nạp bản đồ từ slam vào AMCL (Adaptive Monte Carlo Localization) |
| Topic `/cmd_vel` | Kiểu `geometry_msgs/Twist`. `linear.x` = tiến/lùi, `angular.z` = rẽ/xoay. Thường chuẩn hóa trong [-1, 1] |
| `rviz`, `rqt_plot` | Trực quan hóa TF tree, bản đồ SLAM 2D thời gian thực, đồ thị PWM/IMU |

### 8.4 ROS 2 (UGV Rover Orin Nano: Humble LTS)

| Điểm so sánh | ROS 1 | ROS 2 |
|---|---|---|
| Mô hình truyền thông | Có ROS Master (máy chủ - máy khách) | DDS, đồ thị phân tán ngang hàng (peer-to-peer) |
| Chịu lỗi mạng | Thấp hơn | Cao hơn (fault-tolerance) |
| Nút thắt ROS Master | Có | Không |
| Đa robot trên cùng Wi-Fi | Hạn chế | Phù hợp hơn |

- Nguồn container khuyến nghị: **`jetson-containers`** (repo Dusty-nv). Có sẵn **Cartographer**, **Navigation2**, thư viện CUDA tương thích **JetPack 6 / 5.1**.

---

## 9. Hiệu suất deep learning và tối ưu TensorRT

### 9.1 Vấn đề của FP32
Mô hình huấn luyện bằng PyTorch (ví dụ: YOLOv3, SSD MobileNet cho detection; ResNet18, VGG19, Inception V4 cho classification) giữ trọng số FP32. Chạy thẳng trên GPU biên Maxwell:

- Khối lượng tính lớn làm cạn băng thông RAM.
- Độ trễ hàng trăm ms.
- Không kịp xử lý camera live → robot có thể va chạm.

### 9.2 Giải pháp TensorRT
- **Layer fusion** (hợp nhất lớp mạng).
- **Quantization FP32 → FP16 (half-precision).** Độ chính xác phân loại vẫn trên 90%, đồng thời giải phóng gấp đôi hiệu quả băng thông 25.6 GB/s và tăng GFLOPS đạt được.

### 9.3 Số liệu benchmark (Jetson Nano)

| Chỉ số | Giá trị | Ngữ cảnh |
|---|---|---|
| FPS, ResNet18 + TensorRT FP16 | ~**17 FPS** | Tập lệnh phức hợp (theo dõi + nhận dạng, ảnh độ phân giải cao) |
| FPS, YOLO qua Ultralytics Engine | **37.35 FPS** | Một số khung cảnh lượng giá |
| FPS, PyTorch FP32 (không tối ưu) | ~**20.42 FPS** | Bản không tối ưu |
| Độ trễ p99, TensorRT FP16 | **39.63 ms** | 99% khung hình xử lý trong thời gian này |
| Độ trễ p99, FP32 gốc | **98.82 ms** | Cùng điều kiện |
| Độ trễ p99 toàn trình (camera → điều tốc động cơ), không tối ưu | **639.73 ms** | |
| Độ trễ p99 toàn trình, FP16 + Latest-Frame Slot | **121.78 ms** | Giảm ~5.3 lần |

> Các dòng FPS đo trên các tác vụ/mô hình khác nhau, **không so sánh trực tiếp** với nhau.

**Latest-Frame Slot:** cơ chế hàng đợi ảnh chỉ giữ khung mới nhất, hủy khung cũ khi quá tải → không có hàng đợi dư thừa.

**Ứng dụng:** Auto Collision Avoidance (thử nghiệm thực địa, ví dụ môi trường rừng rậm).

---

## 10. Điều khiển từ xa, headless, swarm

### 10.1 Chế độ headless
JetBot thường chạy không màn hình/chuột/bàn phím.

1. Service Systemd **`display-ip.service`** chạy sau khi OS khởi động.
2. Script Python quét IP của Wi-Fi/LAN hoặc USB virtual LAN **`192.168.55.1`**.
3. Hiển thị IP luân phiên lên OLED 128×32 qua thư viện **SSD1306**.
4. Từ PC, mở trình duyệt: `http://<Jetbot_IP>:8888` → **JupyterLab**.
5. Trong JupyterLab: dùng Terminal và Notebooks để huấn luyện nhận diện biển báo (object classify), bám line màu (target line patrol), lưu tập ảnh tại chỗ.

### 10.2 Điều khiển thủ công bằng gamepad
- Gamepad không dây (chế độ Xbox 360 / PC / PS3 / Android).
- Gửi tín hiệu tới node ROS `teleop_joy.py` hoặc qua MQTT.
- Thao tác: nút **HOME** đổi mode; giữ **A** + xoay joystick → sinh vận tốc gửi tới `/cmd_vel`.
- Dùng để kiểm tra bộ hiệu chuẩn steering offset (robot có chạy lệch trên đường thẳng không).

### 10.3 Swarm / Multi-robot (UGV)

| Mục | Chi tiết |
|---|---|
| Giao thức | **ESP-NOW** trên ESP32 |
| Cơ chế | Điểm-điểm dựa trên **MAC Address**, bỏ qua TCP/IP/Wi-Fi handshake |
| Độ trễ nêu trong tài liệu | Tối đa ~100 µs giữa các JetBot |
| Lợi ích | Đồng bộ tọa độ lập bản đồ giữa nhóm robot, phù hợp robot phân tán |

---

## 11. Kết luận của báo cáo gốc

1. Dùng MCU lõi kép RP2040/ESP32 qua bus I2C giúp loại bỏ latency jitter ở tầng điều khiển thấp, giảm tải cho Jetson.
2. Nguồn 12.6 V với bảo vệ đa cấp S-8254AA, kết hợp IMU 9 trục + EKF thời gian thực, cho nền tảng lý tưởng cho SLAM.
3. Chuyển mô hình từ PyTorch FP32 sang TensorRT FP16 cho phép phân tích thị giác thời gian thực ở độ trễ cấp mili-giây.
4. Docker + ROS 1/ROS 2 cô lập môi trường và dễ mở rộng tính năng.

---

## 12. Bảng thuật ngữ (Glossary)

| Thuật ngữ | Giải nghĩa |
|---|---|
| SBC | Single Board Computer, máy tính một bo mạch |
| GFLOPS / TOPS | Giga phép tính dấu phẩy động/giây; Tera phép tính/giây |
| MCU | Vi điều khiển (RP2040, ESP32) |
| PID | Bộ điều khiển tỷ lệ - tích phân - vi phân |
| PWM | Điều chế độ rộng xung |
| H-bridge (cầu H) | Mạch điều khiển chiều và công suất động cơ (TB6612FNG) |
| Odometry | Ước lượng vị trí từ chuyển động bánh xe |
| EKF | Extended Kalman Filter, bộ lọc trộn nhiều cảm biến |
| SLAM | Simultaneous Localization and Mapping |
| Gmapping | Thuật toán SLAM 2D trên ROS 1 |
| AMCL | Adaptive Monte Carlo Localization, định vị trên bản đồ có sẵn |
| Occupancy grid | Bản đồ lưới thể hiện ô trống/bị chiếm |
| DDS | Data Distribution Service, middleware truyền thông của ROS 2 |
| TensorRT | SDK tối ưu suy luận của NVIDIA |
| FP32 / FP16 | Số thực 32-bit / 16-bit |
| p99 | Phân vị thứ 99 của độ trễ |
| ESP-NOW | Giao thức không dây điểm-điểm của Espressif |
| Headless | Chạy không màn hình/ngoại vi |
| UF2 | Định dạng firmware chép trực tiếp qua USB mass storage |

---

## 13. Ghi chú biên tập về độ tin cậy dữ liệu

*(Phần này do người chuyển đổi thêm vào, không thuộc tài liệu gốc. AI nên coi các mục dưới đây là điểm cần kiểm chứng khi trích dẫn số liệu.)*

- **472 GFLOPS** của Jetson Nano thường được NVIDIA nêu ở FP16. Tài liệu gốc không ghi rõ độ chính xác số.
- **20 TOPS** gắn với Orin Nano 4GB; bản 8GB thường được nêu cao hơn. Tài liệu gốc gộp chung hai bản. Băng thông **68 GB/s** được chính tài liệu ghi là "ước tính".
- **Số FPS** ở mục 9.3 đến từ các tác vụ khác nhau (có trường hợp FP32 20.42 FPS cao hơn con số FP16 ~17 FPS) nên không dùng để kết luận về mức tăng tốc FP16/FP32. Chỉ số **latency p99** là cặp so sánh cùng điều kiện đáng tin hơn.
- **Độ trễ ESP-NOW ~100 µs** là số liệu lý tưởng nêu trong tài liệu, thực tế phụ thuộc môi trường RF và gói tin.
- Một số chi tiết biến thể (MCU, encoder, tốc độ) của bản 2GB và các bản Jetson Nano 4GB không được tài liệu nêu đầy đủ; bảng mục 2 ghi "(không nêu)" cho các trường này.
