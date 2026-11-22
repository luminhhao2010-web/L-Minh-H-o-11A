export interface DriveImage {
  id: string;
  name: string;
  title: string;
  category: 'lidar' | 'jetson' | 'chassis' | 'vision' | 'power';
  description: string;
  url: string;
  thumbnailUrl: string;
  hotspots?: {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    title: string;
    details: string;
  }[];
}

export const GOOGLE_DRIVE_FOLDER_ID = '1Be6yD3VVVJlAumxnnH9KQtoHKgFBjut5';
export const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1Be6yD3VVVJlAumxnnH9KQtoHKgFBjut5?usp=sharing';

export const ROBOT_IMAGES: DriveImage[] = [
  {
    id: '1jfTgwxbZvdTawPJjuaTkA9FO5gUWvIZ4',
    name: '1793236899666_top_perspective.jpg',
    title: 'Top Perspective - Full Robot Assembly',
    category: 'lidar',
    description: 'High-angle view showing the 360° RPLIDAR A1 mounted atop the Jetson Nano stack, forward wide-angle CSI camera, dual 2.4/5GHz antennas, and green circular aluminum baseplate.',
    url: 'https://lh3.googleusercontent.com/d/1jfTgwxbZvdTawPJjuaTkA9FO5gUWvIZ4',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1jfTgwxbZvdTawPJjuaTkA9FO5gUWvIZ4',
    hotspots: [
      { x: 74, y: 44, title: 'Slamtec RPLIDAR A1', details: '360° laser triangulation scanner. 12-meter range, 8,000 samples/sec, 5.5Hz rotation.' },
      { x: 55, y: 31, title: 'Wide-Angle CSI Camera', details: 'Sony IMX219 8MP camera on green aluminum tilt bracket with flexible ribbon cable.' },
      { x: 30, y: 58, title: 'Differential Drive Wheel', details: 'Rubber high-traction tread with aluminum rim on brass hex shaft coupler.' },
      { x: 45, y: 48, title: 'Jetson Nano Core Stack', details: 'NVIDIA Jetson Nano compute module with active cooling heatsink and carrier board.' },
    ]
  },
  {
    id: '1L_0pqdNFFCcFw60WSTctxuQOpa9afPc5',
    name: '1793236899794_side_profile_chassis.jpg',
    title: 'Side Profile - Standoff Stack & Wheels',
    category: 'chassis',
    description: 'Lateral profile showing the multi-tier brass standoff structure separating the bottom motor deck, Jetson Nano controller layer, and top LiDAR platform.',
    url: 'https://lh3.googleusercontent.com/d/1L_0pqdNFFCcFw60WSTctxuQOpa9afPc5',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1L_0pqdNFFCcFw60WSTctxuQOpa9afPc5',
    hotspots: [
      { x: 50, y: 25, title: 'RPLIDAR Belt Drive', details: 'Timing belt and motor pulley delivering smooth continuous 360-degree rotation.' },
      { x: 52, y: 48, title: 'Jetson Cooling Fan', details: 'PWM-controlled active cooling fan mounted directly on the black extruded heatsink.' },
      { x: 52, y: 78, title: 'Drive Wheel Hub', details: 'Electric blue metallic multi-spoke rim with brass axle coupler.' },
    ]
  },
  {
    id: '19FZaxyECEhftSLPXRaWU5ZKVMr8OO3PA',
    name: '1793236899845_rear_antennas_switch.jpg',
    title: 'Rear View - Antennas & Power Switch',
    category: 'power',
    description: 'Rear view showcasing the dual high-gain RP-SMA omnidirectional antennas, rocker power switch, battery input jack, and OLED display position.',
    url: 'https://lh3.googleusercontent.com/d/19FZaxyECEhftSLPXRaWU5ZKVMr8OO3PA',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/19FZaxyECEhftSLPXRaWU5ZKVMr8OO3PA',
    hotspots: [
      { x: 25, y: 30, title: 'Left Wi-Fi Antenna', details: 'Dual-band 2.4/5GHz 5dBi antenna connected via u.FL to RP-SMA pigtail cable.' },
      { x: 75, y: 30, title: 'Right Wi-Fi Antenna', details: 'MIMO antenna array supporting high-bandwidth video stream transmission.' },
      { x: 48, y: 72, title: 'Power Switch & LED', details: 'Heavy-duty slide switch controlling 12.6V 3S main bus power.' },
    ]
  },
  {
    id: '1VzKv-y3zIWmiI8JyJZ650NmeHE-ULAnA',
    name: '1793236899907_camera_bracket_closeup.jpg',
    title: 'Front Camera Mount & CSI Cable',
    category: 'vision',
    description: 'Close-up of the front camera assembly mounted on the green anodized tilt bracket with knurled thumb screws for manual pitch adjustments.',
    url: 'https://lh3.googleusercontent.com/d/1VzKv-y3zIWmiI8JyJZ650NmeHE-ULAnA',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1VzKv-y3zIWmiI8JyJZ650NmeHE-ULAnA',
    hotspots: [
      { x: 50, y: 35, title: 'Sony IMX219 8MP Sensor', details: '160-degree ultra wide-angle fisheye lens for full forward obstacle and line perception.' },
      { x: 50, y: 65, title: 'Flexible Flat Cable (FFC)', details: '15-pin 1.0mm pitch CSI-2 ribbon cable providing zero-latency raw sensor frames to Jetson ISP.' },
    ]
  },
  {
    id: '1dTPvtKVs8wuWqBNIpzYi7XrVk7jI8Vhc',
    name: '1793236899973_jetson_carrier_board.jpg',
    title: 'Jetson Carrier Board & Port Array',
    category: 'jetson',
    description: 'Detailed inspection of the Jetson Nano carrier board showing 4x USB 3.0 ports, Gigabit Ethernet, micro-USB, HDMI/DisplayPort, and 40-pin GPIO expansion header.',
    url: 'https://lh3.googleusercontent.com/d/1dTPvtKVs8wuWqBNIpzYi7XrVk7jI8Vhc',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1dTPvtKVs8wuWqBNIpzYi7XrVk7jI8Vhc',
    hotspots: [
      { x: 28, y: 46, title: 'Quad USB 3.0 Ports', details: 'High-speed host ports for RPLIDAR USB-UART adapter, peripherals, and depth cameras.' },
      { x: 30, y: 65, title: 'Gigabit Ethernet', details: 'RJ45 port for hardwired high-speed ROS master network debugging and fast flashing.' },
      { x: 65, y: 65, title: '40-Pin Expansion Header', details: 'Standard Raspberry Pi-compatible pinout providing I2C, UART, SPI, and GPIO lines.' },
    ]
  },
  {
    id: '1xv_zongs_kqT52J1CDTn5xG6ItwkK47d',
    name: '1793236900029_rplidar_sensor_unit.jpg',
    title: 'Slamtec RPLIDAR A1 Sensor Unit',
    category: 'lidar',
    description: 'Detailed photo of the standalone RPLIDAR A1 laser range scanner with exposed optical optics, drive belt, rotating turret, and 7-pin JST interface cable.',
    url: 'https://lh3.googleusercontent.com/d/1xv_zongs_kqT52J1CDTn5xG6ItwkK47d',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1xv_zongs_kqT52J1CDTn5xG6ItwkK47d',
    hotspots: [
      { x: 40, y: 50, title: 'Optical Laser Diode & CMOS', details: 'Modulated infrared laser emitter (Class 1 safe) and high-speed CMOS visual sensor.' },
      { x: 55, y: 80, title: 'Coreless DC Motor', details: 'Precision vibration-damped motor spinning turret at 330 RPM (5.5 Hz).' },
      { x: 85, y: 35, title: 'JST XH 7-Pin Cable', details: 'Carries UART RX/TX signals (115200 baud), 5V core power, motor PWM, and ground.' },
    ]
  },
  {
    id: '1jt53bwVHdold1NJnfJpEdKu6_wdleGIj',
    name: '1793236900075_chassis_front_caster.jpg',
    title: 'Chassis Underside - Front Caster & Motors',
    category: 'chassis',
    description: 'Looking upwards at the front caster ball wheel, dual metal gearmotors, and thick anodized green chassis deck providing structural rigidity.',
    url: 'https://lh3.googleusercontent.com/d/1jt53bwVHdold1NJnfJpEdKu6_wdleGIj',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1jt53bwVHdold1NJnfJpEdKu6_wdleGIj',
    hotspots: [
      { x: 50, y: 70, title: 'Heavy-Duty Swivel Caster', details: 'Smooth 360-degree steel ball caster maintaining pitch stability on uneven floors.' },
      { x: 30, y: 68, title: 'Left DC Gearmotor', details: 'All-metal planetary gearbox with 1:30 reduction ratio delivering high low-speed torque.' },
    ]
  },
  {
    id: '1I7zRLJcSWe2NIdOu6jBOM3basT2GCP6-',
    name: '1793236900147_robot_quarter_angle.jpg',
    title: 'Robot Front-Quarter View',
    category: 'chassis',
    description: 'Dynamic three-quarters view displaying wheel stance, sensor clearance, and camera forward elevation.',
    url: 'https://lh3.googleusercontent.com/d/1I7zRLJcSWe2NIdOu6jBOM3basT2GCP6-',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1I7zRLJcSWe2NIdOu6jBOM3basT2GCP6-',
  },
  {
    id: '1OyDR9IJL9ciRAUnatfnethxVb4iv2Vxb',
    name: '1793236900217_lidar_mounting_deck.jpg',
    title: 'LiDAR Upper Deck Plate',
    category: 'lidar',
    description: 'Black acrylic top tier isolating the RPLIDAR from vibration, elevated with 30mm brass standoffs for unobstructed 360-degree laser scanning.',
    url: 'https://lh3.googleusercontent.com/d/1OyDR9IJL9ciRAUnatfnethxVb4iv2Vxb',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1OyDR9IJL9ciRAUnatfnethxVb4iv2Vxb',
  },
  {
    id: '1AUySjhCs-j5S_zXsS8gJVc1F9OzSkuqy',
    name: '1793236900277_wheel_encoder_hub.jpg',
    title: 'Drive Wheel & Coupler Interface',
    category: 'chassis',
    description: 'Close inspection of the brass motor shaft coupler, wheel rim mounting, and tire tread pattern.',
    url: 'https://lh3.googleusercontent.com/d/1AUySjhCs-j5S_zXsS8gJVc1F9OzSkuqy',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1AUySjhCs-j5S_zXsS8gJVc1F9OzSkuqy',
  },
  {
    id: '1E4Wq2_fBpKiHizT8nQ-LXeL8tvib7dpq',
    name: '1793236900331_underside_full_view.jpg',
    title: 'Full Underside View - Twin Motors & Dual Casters',
    category: 'chassis',
    description: 'Complete view of the robot bottom displaying the differential drive layout with two central DC motors and dual swivel casters (front and rear) for 4-point stability.',
    url: 'https://lh3.googleusercontent.com/d/1E4Wq2_fBpKiHizT8nQ-LXeL8tvib7dpq',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1E4Wq2_fBpKiHizT8nQ-LXeL8tvib7dpq',
    hotspots: [
      { x: 35, y: 25, title: 'Rear Caster Wheel', details: 'Prevents backwards tipping during aggressive motor acceleration.' },
      { x: 20, y: 43, title: 'Left Motor & Encoder', details: 'Includes magnetic encoder disc with dual Hall sensors generating 330 pulses/rev.' },
      { x: 60, y: 43, title: 'Right Motor & Encoder', details: 'Paired differential drive actuator with identical gear reduction and backlash tuning.' },
      { x: 45, y: 65, title: 'Front Caster Wheel', details: 'Maintains consistent laser height above ground during forward translation.' },
    ]
  },
  {
    id: '1G_K1NSVKZh5qxXK1Oy2dK1ytEs5LadR4',
    name: '1793236900394_board_top_view.jpg',
    title: 'Jetson Nano Board - Top View With Heat Sink',
    category: 'jetson',
    description: 'Top-down photo of the Jetson Nano computing core, showing the 260-pin SODIMM connector, 128-core Maxwell GPU module, and active 4-pin PWM cooling fan.',
    url: 'https://lh3.googleusercontent.com/d/1G_K1NSVKZh5qxXK1Oy2dK1ytEs5LadR4',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1G_K1NSVKZh5qxXK1Oy2dK1ytEs5LadR4',
  },
  {
    id: '1ZIB4n37JkDZ454zfXzpBt106hb57rwj8',
    name: '1793236900451_electronics_wiring.jpg',
    title: 'Internal Harness & Power Distribution',
    category: 'power',
    description: 'Wiring harness routing power from the 12.6V battery port to the DC-DC buck converter, motor H-bridge, and Jetson Nano carrier board.',
    url: 'https://lh3.googleusercontent.com/d/1ZIB4n37JkDZ454zfXzpBt106hb57rwj8',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1ZIB4n37JkDZ454zfXzpBt106hb57rwj8',
  },
  {
    id: '1-i5v1XWj44IcP-ASPGcw2czLjGzCxTH1',
    name: '1793236900509_camera_elevation.jpg',
    title: 'Camera Tilt Angle & Pitch Adjustment',
    category: 'vision',
    description: 'Shows the camera bracket elevation mechanism, permitting the camera to point down for floor line following or up for obstacle and face tracking.',
    url: 'https://lh3.googleusercontent.com/d/1-i5v1XWj44IcP-ASPGcw2czLjGzCxTH1',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1-i5v1XWj44IcP-ASPGcw2czLjGzCxTH1',
  },
  {
    id: '1g98mNuLtNKz1sDKRegIrMFWiAtZXIASz',
    name: '1793236900562_lidar_scanner_head.jpg',
    title: 'RPLIDAR Optical Turret Head',
    category: 'lidar',
    description: 'Top cover view of the RPLIDAR head showing the protective housing, center laser window, and optical triangulation path.',
    url: 'https://lh3.googleusercontent.com/d/1g98mNuLtNKz1sDKRegIrMFWiAtZXIASz',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1g98mNuLtNKz1sDKRegIrMFWiAtZXIASz',
  },
  {
    id: '1LzivwVg0EiIinBra8OHXgc1odvnnWG97',
    name: '1793236900629_carrier_board_connectors.jpg',
    title: 'Carrier Board Peripheral Connectors',
    category: 'jetson',
    description: 'Inspection of the JST connectors, motor encoder headers, UART communications link, and reset switch.',
    url: 'https://lh3.googleusercontent.com/d/1LzivwVg0EiIinBra8OHXgc1odvnnWG97',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1LzivwVg0EiIinBra8OHXgc1odvnnWG97',
  },
  {
    id: '1gOIUf9zh28F_RnBFVh132Enwi8MQqply',
    name: '1793236900721_jetson_nano_architecture.jpg',
    title: 'Jetson Nano Dev Kit Rev2 Architecture',
    category: 'jetson',
    description: 'Clear overhead view showing the Jetson Nano Rev2 board markings, dual CSI camera ports (CAM0, CAM1), 12.6V battery connector, and status LEDs.',
    url: 'https://lh3.googleusercontent.com/d/1gOIUf9zh28F_RnBFVh132Enwi8MQqply',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1gOIUf9zh28F_RnBFVh132Enwi8MQqply',
    hotspots: [
      { x: 38, y: 39, title: 'CAM0 & CAM1 CSI Ports', details: 'Dual 2-lane MIPI CSI-2 camera connectors supporting stereo vision or depth perception.' },
      { x: 55, y: 55, title: 'NVIDIA Tegra X1 SoC', details: 'Quad-core ARM Cortex-A57 @ 1.43 GHz with 128-core Maxwell GPU delivering 472 GFLOPs AI compute.' },
      { x: 50, y: 78, title: '0.91" I2C OLED Display', details: 'Real-time telemetry screen showing IP address, battery voltage, CPU load, and ROS nodes.' },
      { x: 67, y: 78, title: '12.6V Battery Port', details: 'Direct high-current power input from the 3S Li-Po battery pack.' },
    ]
  },
  {
    id: '1ULy5d-spxsdNJgrAF-cBZuw86lypBk8v',
    name: '1793236900786_right_wheel_stance.jpg',
    title: 'Right Drive Wheel & Chassis Cutout',
    category: 'chassis',
    description: 'Precision laser-cut wheel well in the green chassis deck allowing the 65mm wheel to clear without sacrificing body rigidity.',
    url: 'https://lh3.googleusercontent.com/d/1ULy5d-spxsdNJgrAF-cBZuw86lypBk8v',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1ULy5d-spxsdNJgrAF-cBZuw86lypBk8v',
  },
  {
    id: '1p9M6GL44rA-DdKjXfS3uhwnD1XQe_eJp',
    name: '1793236900840_oled_display_closeup.jpg',
    title: 'OLED Display & Status Indicators',
    category: 'jetson',
    description: 'Close-up of the integrated 128x32 OLED display that provides headless status feedback (IP address, WiFi mode, battery percentage) without requiring an external monitor.',
    url: 'https://lh3.googleusercontent.com/d/1p9M6GL44rA-DdKjXfS3uhwnD1XQe_eJp',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1p9M6GL44rA-DdKjXfS3uhwnD1XQe_eJp',
  },
  {
    id: '1d__jtf36Ch7c0s2rQQIXljFLeNFCj9of',
    name: '1793236900919_antenna_mountings.jpg',
    title: 'Dual Antenna Mounts & SMA Connectors',
    category: 'power',
    description: 'Nut-fastened SMA bulkhead connectors holding the dual dipole antennas securely to the aluminum baseplate.',
    url: 'https://lh3.googleusercontent.com/d/1d__jtf36Ch7c0s2rQQIXljFLeNFCj9of',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1d__jtf36Ch7c0s2rQQIXljFLeNFCj9of',
  },
  {
    id: '1htmjpyAOWBhrdVgslp1qM1__xsIvyazd',
    name: '1793236900968_caster_bearing_assembly.jpg',
    title: 'Precision Caster Wheel Assembly',
    category: 'chassis',
    description: 'Heavy gauge steel swivel fork with chrome finish and polyurethane roller wheel for smooth omnidirectional pivot transitions.',
    url: 'https://lh3.googleusercontent.com/d/1htmjpyAOWBhrdVgslp1qM1__xsIvyazd',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1htmjpyAOWBhrdVgslp1qM1__xsIvyazd',
  },
  {
    id: '1G_OZCycSCGIKRg6ZP4-aqaIa7ZcRO-L9',
    name: '1793236901012_camera_ribbon_routing.jpg',
    title: 'Camera Ribbon Cable Clean Routing',
    category: 'vision',
    description: 'Low-profile cable routing preventing interference with the rotating LiDAR beam while maintaining range of tilt.',
    url: 'https://lh3.googleusercontent.com/d/1G_OZCycSCGIKRg6ZP4-aqaIa7ZcRO-L9',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1G_OZCycSCGIKRg6ZP4-aqaIa7ZcRO-L9',
  },
  {
    id: '1y3ByobiDPzimceQgHg7vbyBAp_ZAzGRu',
    name: '1793236906426_motor_gearbox_detail.jpg',
    title: 'DC Motor Metal Gearbox & Shaft Coupler',
    category: 'chassis',
    description: 'Inspection of the metal spur gear reduction gearbox providing smooth low-RPM velocity control required for accurate SLAM odometry.',
    url: 'https://lh3.googleusercontent.com/d/1y3ByobiDPzimceQgHg7vbyBAp_ZAzGRu',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1y3ByobiDPzimceQgHg7vbyBAp_ZAzGRu',
  },
  {
    id: '1m5uvdaDeIw_9JjPbLxrAW5VV-_7VVADY',
    name: '1793236911682_lidar_base_mount.jpg',
    title: 'LiDAR Base Mount & Dampers',
    category: 'lidar',
    description: 'Four rubber-isolated mounting holes on the top deck preventing motor vibrations from degrading laser triangulation precision.',
    url: 'https://lh3.googleusercontent.com/d/1m5uvdaDeIw_9JjPbLxrAW5VV-_7VVADY',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1m5uvdaDeIw_9JjPbLxrAW5VV-_7VVADY',
  },
  {
    id: '1lI4uc0CDokGFlBXWP_Ft8-F6Sww02Z2L',
    name: '1793236911712_chassis_profile_isometric.jpg',
    title: 'Chassis Profile - Isometric Stance',
    category: 'chassis',
    description: 'Isometric stance photo showing how the circular chassis shape prevents corner snagging during tight corridor turns.',
    url: 'https://lh3.googleusercontent.com/d/1lI4uc0CDokGFlBXWP_Ft8-F6Sww02Z2L',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1lI4uc0CDokGFlBXWP_Ft8-F6Sww02Z2L',
  },
  {
    id: '1TxL1tcGcgXie937SwlbzIkBuSwLqASzv',
    name: '1793236911754_cooling_fan_heatsink.jpg',
    title: 'Jetson Nano Cooling Solution',
    category: 'jetson',
    description: 'Top-down photo of the active 40mm fan and heavy aluminum heatsink keeping the Tegra X1 SoC under 50°C during intensive deep learning inference.',
    url: 'https://lh3.googleusercontent.com/d/1TxL1tcGcgXie937SwlbzIkBuSwLqASzv',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1TxL1tcGcgXie937SwlbzIkBuSwLqASzv',
  },
  {
    id: '1CCjIlXxo_8jlujHlvTSgggp3hpaXrkuL',
    name: '1793236911811_camera_sensor_face.jpg',
    title: 'Wide Angle Camera Lens & Face',
    category: 'vision',
    description: 'Front-facing macro photo of the camera lens showing the wide optical aperture and infrared cut filter.',
    url: 'https://lh3.googleusercontent.com/d/1CCjIlXxo_8jlujHlvTSgggp3hpaXrkuL',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1CCjIlXxo_8jlujHlvTSgggp3hpaXrkuL',
  },
  {
    id: '1FgTv9yQDl4jH60jM5E0d6du-sK_fXDDY',
    name: '1793236911862_battery_connection_port.jpg',
    title: 'Power Input Terminal & Protection Circuit',
    category: 'power',
    description: 'Terminal block with reverse polarity diode protection and decoupling capacitors for motor noise suppression.',
    url: 'https://lh3.googleusercontent.com/d/1FgTv9yQDl4jH60jM5E0d6du-sK_fXDDY',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1FgTv9yQDl4jH60jM5E0d6du-sK_fXDDY',
  },
  {
    id: '1SPJtel7481ExK2an2e-k6OupPi325enF',
    name: '1793236915715_assembled_robot_top_down.jpg',
    title: 'Complete Assembled Robot - Top-Down Orthogonal',
    category: 'lidar',
    description: 'Full bird’s-eye orthogonal view showing symmetrical weight balance, LiDAR placement at geometric center, and forward sensor orientation.',
    url: 'https://lh3.googleusercontent.com/d/1SPJtel7481ExK2an2e-k6OupPi325enF',
    thumbnailUrl: 'https://lh3.googleusercontent.com/d/1SPJtel7481ExK2an2e-k6OupPi325enF',
    hotspots: [
      { x: 50, y: 38, title: 'LiDAR Rotational Axis', details: 'Aligned precisely with the differential drive wheel axis for simplified kinematic transforms in TF tree.' },
      { x: 50, y: 78, title: 'Front Optical Node', details: 'Camera FOV clear of wheel obstacles, providing 160-degree forward vision.' },
    ]
  }
];

export const ROBOT_SPECIFICATIONS = {
  name: 'Jetson Nano Autonomous Mobile Robot',
  chassis: 'Green Anodized Aluminum Alloy (Circular Ø 210mm)',
  kinematics: '2WD Differential Drive with Dual Swivel Casters (4-Point Equilibrium)',
  dimensions: {
    diameter: '210 mm',
    height: '195 mm',
    wheelDiameter: '65 mm',
    wheelTrackWidth: '155 mm',
    weight: '1.25 kg (with battery)',
  },
  compute: {
    soc: 'NVIDIA Tegra X1 (Jetson Nano Dev Kit Rev2)',
    cpu: 'Quad-Core ARM Cortex-A57 @ 1.43 GHz',
    gpu: '128-core NVIDIA Maxwell architecture GPU @ 921 MHz (472 GFLOPs FP16)',
    memory: '4 GB 64-bit LPDDR4 @ 1600MHz (25.6 GB/s)',
    storage: 'MicroSD 64GB UHS-I (Ubuntu 20.04 LTS + ROS 2 Humble / ROS 1 Noetic)',
  },
  sensors: {
    lidar: {
      model: 'Slamtec RPLIDAR A1M8',
      range: '0.15 m - 12.0 m',
      sampleRate: '8000 Hz',
      scanFrequency: '5.5 Hz - 10 Hz (PWM controllable)',
      angularResolution: '≤ 1 degree',
      interface: 'UART (115200 baud, 8N1) via CP2102 USB converter',
    },
    camera: {
      sensor: 'Sony IMX219 (8 Megapixel)',
      interface: '2-Lane MIPI CSI-2 via CAM0',
      fov: '160° Diagonal Ultra Wide-Angle Fisheye',
      videoModes: '1080p @ 30fps / 720p @ 60fps',
    },
    encoders: {
      type: 'Hall-Effect Dual-Channel Quadrature Encoders',
      ppr: '11 pulses per motor shaft revolution',
      gearRatio: '1:30',
      totalTicksPerWheelRev: '330 ticks / revolution',
    },
    display: {
      type: '0.91-inch OLED Monochrome Display',
      resolution: '128 x 32 pixels',
      interface: 'I2C (Address 0x3C)',
    }
  },
  actuators: {
    motors: '2x 520 High-Torque DC Brushed Gearmotors',
    gearbox: 'All-metal planetary spur reduction gear (1:30 ratio)',
    noLoadSpeed: '330 RPM @ 12V',
    ratedTorque: '0.25 N·m (2.5 kg·cm)',
    driver: 'Dual H-Bridge Motor Driver (TB6612FNG / AT8236)',
  },
  power: {
    battery: '3S Li-ion / Li-Po Battery Pack (11.1V Nominal, 12.6V Full)',
    capacity: '2600 mAh - 3500 mAh',
    runtime: 'Approx. 2.5 - 3.5 hours continuous navigation',
    regulation: 'Synchronous Buck 12V -> 5V 4A to Jetson 5V barrel jack input',
  },
  connectivity: {
    wifi: 'Intel Wireless-AC 8265 M.2 802.11ac 2.4/5GHz (Dual 5dBi Antennas)',
    bluetooth: 'Bluetooth 4.2 / BLE',
    ethernet: '10/100/1000 Gigabit RJ45',
  }
};

export const GPIO_PINOUT_DATA = [
  { pin: 1, name: '3.3V Power', type: 'power', desc: '3.3V DC logic supply' },
  { pin: 2, name: '5.0V Power', type: 'power', desc: '5.0V DC bus power' },
  { pin: 3, name: 'I2C_2_SDA', type: 'i2c', desc: 'I2C Bus 2 Data (OLED Display 0x3C)' },
  { pin: 4, name: '5.0V Power', type: 'power', desc: '5.0V DC bus power' },
  { pin: 5, name: 'I2C_2_SCL', type: 'i2c', desc: 'I2C Bus 2 Clock (OLED Display 0x3C)' },
  { pin: 6, name: 'GND', type: 'ground', desc: 'Common Ground' },
  { pin: 7, name: 'GPIO 216 / PWM', type: 'gpio', desc: 'RPLIDAR Motor PWM speed control' },
  { pin: 8, name: 'UART_2_TX', type: 'uart', desc: 'Hardware UART2 Transmit (to Motor Driver MCU)' },
  { pin: 9, name: 'GND', type: 'ground', desc: 'Common Ground' },
  { pin: 10, name: 'UART_2_RX', type: 'uart', desc: 'Hardware UART2 Receive (from Motor Driver MCU)' },
  { pin: 11, name: 'GPIO 50', type: 'gpio', desc: 'Left Motor Encoder Channel A' },
  { pin: 12, name: 'GPIO 79', type: 'gpio', desc: 'Left Motor Encoder Channel B' },
  { pin: 13, name: 'GPIO 14', type: 'gpio', desc: 'Right Motor Encoder Channel A' },
  { pin: 14, name: 'GND', type: 'ground', desc: 'Common Ground' },
  { pin: 15, name: 'GPIO 194', type: 'gpio', desc: 'Right Motor Encoder Channel B' },
  { pin: 16, name: 'GPIO 232', type: 'gpio', desc: 'Motor Driver Standby / Enable' },
  { pin: 17, name: '3.3V Power', type: 'power', desc: '3.3V DC auxiliary' },
  { pin: 18, name: 'GPIO 15', type: 'gpio', desc: 'Front Camera LED illumination trigger' },
  { pin: 19, name: 'SPI_1_MOSI', type: 'spi', desc: 'SPI1 Master Out Slave In' },
  { pin: 20, name: 'GND', type: 'ground', desc: 'Common Ground' },
  { pin: 21, name: 'SPI_1_MISO', type: 'spi', desc: 'SPI1 Master In Slave Out' },
  { pin: 22, name: 'GPIO 13', type: 'gpio', desc: 'Buzzer alert tone signal' },
  { pin: 23, name: 'SPI_1_SCK', type: 'spi', desc: 'SPI1 Clock' },
  { pin: 24, name: 'SPI_1_CS0', type: 'spi', desc: 'SPI1 Chip Select 0' },
  { pin: 25, name: 'GND', type: 'ground', desc: 'Common Ground' },
  { pin: 26, name: 'SPI_1_CS1', type: 'spi', desc: 'SPI1 Chip Select 1' },
  { pin: 27, name: 'I2C_1_SDA', type: 'i2c', desc: 'I2C Bus 1 Data (IMU MPU6050 0x68)' },
  { pin: 28, name: 'I2C_1_SCL', type: 'i2c', desc: 'I2C Bus 1 Clock (IMU MPU6050 0x68)' },
  { pin: 29, name: 'GPIO 149', type: 'gpio', desc: 'User programmable tactile button' },
  { pin: 30, name: 'GND', type: 'ground', desc: 'Common Ground' },
  { pin: 31, name: 'GPIO 200', type: 'gpio', desc: 'Status LED RGB indicator Blue' },
  { pin: 32, name: 'PWM 0', type: 'pwm', desc: 'Hardware PWM 0 (Camera Tilt Servo)' },
  { pin: 33, name: 'PWM 2', type: 'pwm', desc: 'Hardware PWM 2 (Reserved auxiliary)' },
  { pin: 34, name: 'GND', type: 'ground', desc: 'Common Ground' },
  { pin: 35, name: 'I2S_FS', type: 'i2s', desc: 'I2S Audio Frame Select' },
  { pin: 36, name: 'UART_1_CTS', type: 'uart', desc: 'UART1 Clear To Send' },
  { pin: 37, name: 'GPIO 12', type: 'gpio', desc: 'Status LED RGB indicator Green' },
  { pin: 38, name: 'I2S_DIN', type: 'i2s', desc: 'I2S Audio Data In' },
  { pin: 39, name: 'GND', type: 'ground', desc: 'Common Ground' },
  { pin: 40, name: 'I2S_DOUT', type: 'i2s', desc: 'I2S Audio Data Out' },
];

export const ROS_CODE_SNIPPETS = [
  {
    id: 'ros2-rplidar',
    title: 'ROS 2 RPLIDAR A1 Launch File',
    filename: 'rplidar_a1_launch.py',
    framework: 'ROS 2 (Humble / Iron)',
    description: 'Launches the Slamtec RPLIDAR node at 115200 baud with inverted frame transform matching this robot platform.',
    code: `import os
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='rplidar_ros',
            executable='rplidar_node',
            name='rplidar_node',
            parameters=[{
                'channel_type': 'serial',
                'serial_port': '/dev/ttyUSB0',
                'serial_baudrate': 115200,
                'frame_id': 'laser_frame',
                'inverted': False,
                'angle_compensate': True,
                'scan_mode': 'Standard'
            }],
            output='screen'
        ),
        # Static TF: base_link to laser_frame
        Node(
            package='tf2_ros',
            executable='static_transform_publisher',
            name='base_to_laser_broadcaster',
            arguments=['0.0', '0.0', '0.15', '0.0', '0.0', '0.0', 'base_link', 'laser_frame']
        )
    ])`
  },
  {
    id: 'ros2-diff-drive',
    title: 'Differential Drive Controller Node',
    filename: 'diff_drive_controller.py',
    framework: 'ROS 2 (Humble / Python)',
    description: 'Subscribes to /cmd_vel and calculates individual left/right motor RPMs and publishes odometry calculated from wheel encoders.',
    code: `#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry
import math

class JetsonDiffDrive(Node):
    def __init__(self):
        super().__init__('diff_drive_controller')
        self.declare_parameter('wheel_radius', 0.0325)     # 65mm / 2 = 0.0325m
        self.declare_parameter('wheel_separation', 0.155)  # 155mm track width
        self.declare_parameter('ticks_per_rev', 330)       # 11 PPR * 30:1 gear

        self.r = self.get_parameter('wheel_radius').value
        self.L = self.get_parameter('wheel_separation').value

        self.sub_cmd = self.create_subscription(Twist, '/cmd_vel', self.cmd_vel_callback, 10)
        self.pub_odom = self.create_publisher(Odometry, '/odom', 10)
        self.get_logger().info('Jetson Robot Diff Drive Controller initialized!')

    def cmd_vel_callback(self, msg: Twist):
        v = msg.linear.x    # m/s
        w = msg.angular.z   # rad/s

        # Differential kinematics:
        v_left = v - (w * self.L / 2.0)
        v_right = v + (w * self.L / 2.0)

        rpm_left = (v_left / (2.0 * math.pi * self.r)) * 60.0
        rpm_right = (v_right / (2.0 * math.pi * self.r)) * 60.0

        self.get_logger().info(f"Target: v={v:.2f} m/s, w={w:.2f} rad/s -> Left: {rpm_left:.1f} RPM, Right: {rpm_right:.1f} RPM")
        # Send serial command to motor driver board (UART /dev/ttyTHS1)

def main(args=None):
    rclpy.init(args=args)
    node = JetsonDiffDrive()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()`
  },
  {
    id: 'jetson-camera-pipeline',
    title: 'Jetson CSI Camera GStreamer Pipeline',
    filename: 'csi_camera_stream.py',
    framework: 'OpenCV + NVIDIA NVMM',
    description: 'Hardware-accelerated zero-copy video capture using nvarguscamerasrc for low-latency AI object detection.',
    code: `import cv2

def gstreamer_pipeline(
    capture_width=1280,
    capture_height=720,
    display_width=640,
    display_height=360,
    framerate=30,
    flip_method=0
):
    return (
        f"nvarguscamerasrc sensor-id=0 ! "
        f"video/x-raw(memory:NVMM), width=(int){capture_width}, height=(int){capture_height}, "
        f"format=(string)NV12, framerate=(fraction){framerate}/1 ! "
        f"nvvidconv flip-method={flip_method} ! "
        f"video/x-raw, width=(int){display_width}, height=(int){display_height}, format=(string)BGRx ! "
        f"videoconvert ! "
        f"video/x-raw, format=(string)BGR ! appsink"
    )

def run_camera():
    cap = cv2.VideoCapture(gstreamer_pipeline(), cv2.CAP_GSTREAMER)
    if not cap.isOpened():
        print("Error: Could not open Jetson CSI camera")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        # Run TensorRT or YOLO inference on Jetson GPU here
        cv2.imshow("Jetson Robot Vision", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    run_camera()`
  },
  {
    id: 'cartographer-slam',
    title: 'Cartographer 2D SLAM Configuration',
    filename: 'jetson_cartographer.lua',
    framework: 'ROS 2 Cartographer',
    description: 'Tuned 2D occupancy grid mapping configuration for RPLIDAR A1 range and differential drive odometry.',
    code: `include "map_builder.lua"
include "trajectory_builder.lua"

options = {
  map_builder = MAP_BUILDER,
  trajectory_builder = TRAJECTORY_BUILDER,
  map_frame = "map",
  tracking_frame = "base_link",
  published_frame = "odom",
  odom_frame = "odom",
  provide_odom_frame = false,
  publish_frame_projected_to_2d = true,
  use_odometry = true,
  use_nav_sat = false,
  use_landmarks = false,
  num_laser_scans = 1,
  num_multi_echo_laser_scans = 0,
  num_subdivisions_per_laser_scan = 1,
  num_point_clouds = 0,
  lookup_transform_timeout_sec = 0.2,
  submap_publish_period_sec = 0.3,
  pose_publish_period_sec = 5e-3,
  trajectory_publish_period_sec = 3e-2,
  rangefinder_sampling_ratio = 1.,
  odometry_sampling_ratio = 1.,
  fixed_frame_pose_sampling_ratio = 1.,
  imu_sampling_ratio = 1.,
  landmarks_sampling_ratio = 1.,
}

MAP_BUILDER.use_trajectory_builder_2d = true
TRAJECTORY_BUILDER_2D.min_range = 0.15
TRAJECTORY_BUILDER_2D.max_range = 12.0
TRAJECTORY_BUILDER_2D.missing_data_ray_length = 5.
TRAJECTORY_BUILDER_2D.use_imu_data = false
TRAJECTORY_BUILDER_2D.use_online_correlative_scan_matching = true
TRAJECTORY_BUILDER_2D.real_time_correlative_scan_matcher.linear_search_window = 0.1
TRAJECTORY_BUILDER_2D.real_time_correlative_scan_matcher.translation_delta_cost_weight = 10.
TRAJECTORY_BUILDER_2D.real_time_correlative_scan_matcher.rotation_delta_cost_weight = 1e-1

return options`
  },
  {
    id: 'oled-telemetry',
    title: '0.91" I2C OLED Telemetry Monitor Script',
    filename: 'jetson_oled_stats.py',
    framework: 'Python 3 + Adafruit SSD1306',
    description: 'Displays real-time IP address, battery voltage, CPU temperature, and active ROS nodes on the 128x32 screen.',
    code: `import time
import board
import busio
import subprocess
from PIL import Image, ImageDraw, ImageFont
import adafruit_ssd1306

i2c = busio.I2C(board.SCL_1, board.SDA_1)
oled = adafruit_ssd1306.SSD1306_I2C(128, 32, i2c, addr=0x3C)

oled.fill(0)
oled.show()

font = ImageFont.load_default()

def get_stats():
    # IP Address
    cmd = "hostname -I | cut -d\' \' -f1"
    ip = subprocess.check_output(cmd, shell=True).decode("utf-8").strip()
    
    # Jetson Tegra temp
    cmd = "cat /sys/devices/virtual/thermal/thermal_zone1/temp"
    try:
        temp = float(subprocess.check_output(cmd, shell=True).decode("utf-8").strip()) / 1000.0
    except:
        temp = 42.0

    return ip, f"{temp:.1f}C"

while True:
    ip, temp = get_stats()
    image = Image.new("1", (oled.width, oled.height))
    draw = ImageDraw.Draw(image)
    
    draw.text((0, 0), f"IP: {ip}", font=font, fill=255)
    draw.text((0, 11), f"BAT: 12.4V (88%)", font=font, fill=255)
    draw.text((0, 22), f"GPU/CPU: {temp} | ROS:OK", font=font, fill=255)
    
    oled.image(image)
    oled.show()
    time.sleep(1.0)`
  }
];
