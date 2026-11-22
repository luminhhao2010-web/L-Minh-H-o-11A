**Role:** You are an Expert WebGL Developer, UI/UX Designer, and Robotics Engineer specializing in interactive 3D hardware simulations using Three.js and GSAP.

**Task:** Create a single-page interactive 3D web simulation to visualize the hardware architecture, software data flows, and AI performance metrics of the Waveshare JetBot Robotics ecosystem (based on the JetBot ROS AI Kit). 

**Output Requirement:** 
You must output exactly ONE complete, working `index.html` file containing all HTML, embedded CSS (dark-mode Sci-Fi theme), and JavaScript (using ES6 modules via unpkg for Three.js and GSAP). Do not output separate files.

**Technical Context & Data to Visualize (Crucial):**

1. **3D Model Construction (Using Primitives):**
   - Since external `.gltf` models are not available, construct a representation of the JetBot using Three.js primitive geometries (Boxes, Cylinders).
   - **Chassis:** A dark grey metallic box.
   - **Wheels:** 4 black cylinders.
   - **"Cognitive Brain" (NVIDIA Jetson):** A green board on top of the chassis.
   - **"Motor Cerebellum" (RP2040 MCU):** A blue board sitting between the Jetson and the chassis.
   - **Lidar (RPLIDAR A1):** A black spinning cylinder on the very top.
   - **Camera (IMX219):** A small black box at the front.

2. **Interactive UI & Animations:**
   - **Exploded View Toggle:** Add a UI button that, when clicked, uses GSAP to smoothly animate the parts separating vertically (Jetson moves up, RP2040 moves slightly up, Chassis stays, wheels move out) to clearly show the dual-controller architecture. Click again to assemble.
   - **Data Flow Visualization:** Create animated particle streams (small glowing spheres) moving between the Jetson (Brain) and the RP2040 (Cerebellum) to represent I2C (address `0x60`) and USB Serial (`/dev/ttyACM0`) communications.

3. **Telemetry & Specs Overlay (HUD):**
   - Build a sleek, absolute-positioned HTML/CSS overlay (HUD) over the WebGL canvas.
   - **Raycasting/Click Interactions:** When the user clicks on specific 3D parts, update the HUD with these details:
     - *Click Jetson:* Show "NVIDIA Jetson Nano | OS: Ubuntu 18.04 | Role: AI, SLAM, Vision".
     - *Click RP2040:* Show "RP2040 MCU | Role: Real-time PID, Motor Control, Odom".
     - *Click Lidar:* Show "RPLIDAR A1 | 360° Scanning | Generates Occupancy Grid".
   
4. **AI Performance Toggle (The "Wow" Factor):**
   - Include a toggle switch in the UI labeled "AI Inference: PyTorch (FP32) vs TensorRT (FP16)".
   - When set to **FP32**: Display warning colors (orange/red), show "Latency p99: 98.82 ms", "Total Response: 639.73 ms", and make the data flow particles move sluggishly.
   - When set to **TensorRT (FP16)**: Display optimized colors (cyan/green), show "Latency p99: 39.63 ms", "Total Response: 121.78 ms", and make the data flow particles move extremely fast and smoothly.

**Constraints:**
- Ensure the scene has basic lighting (AmbientLight, DirectionalLight) so the shapes look 3D.
- Include OrbitControls so the user can rotate and zoom around the robot.
- The code must run immediately when opened in a modern web browser.