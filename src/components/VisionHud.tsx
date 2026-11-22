import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Eye, 
  Scan, 
  Sliders, 
  Download, 
  Maximize2, 
  Crosshair, 
  Layers, 
  Sparkles,
  RefreshCw,
  Video
} from 'lucide-react';

interface VisionHudProps {
  linearVel: number;
  angularVel: number;
}

export const VisionHud: React.FC<VisionHudProps> = ({ linearVel, angularVel }) => {
  const [visionMode, setVisionMode] = useState<'yolo' | 'canny' | 'depth' | 'raw'>('yolo');
  const [cameraTiltDeg, setCameraTiltDeg] = useState(15);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.75);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [fps, setFps] = useState(29.8);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  // Simulated detection targets
  const detectedObjects = [
    { id: 1, label: 'Obstacle Box', conf: 0.94, x: 28, y: 35, w: 22, h: 32, dist: '1.4m', color: '#10b981' },
    { id: 2, label: 'Human Worker', conf: 0.89, x: 62, y: 22, w: 18, h: 48, dist: '2.8m', color: '#38bdf8' },
    { id: 3, label: 'Docking Beacon', conf: 0.97, x: 12, y: 55, w: 14, h: 22, dist: '3.6m', color: '#a855f7' },
  ];

  // Render simulated camera frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const render = (time: number) => {
      frameCount++;
      if (time - lastFpsUpdate >= 1000) {
        setFps(Number((29 + Math.random() * 1.5).toFixed(1)));
        lastFpsUpdate = time;
      }

      const w = canvas.width;
      const h = canvas.height;

      // Simulated 3D Laboratory Floor & Room
      const t = time * 0.001;
      const horizonY = h * 0.42 + (cameraTiltDeg - 15) * 3;

      // Ceiling / Upper room background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#020617');
      skyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // Floor
      const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      floorGrad.addColorStop(0, '#1e293b');
      floorGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Perspective floor tiles (moving if linearVel != 0)
      const offsetZ = (t * linearVel * 120) % 40;
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;

      // Horizontal perspective grid lines
      for (let z = 20; z < 240; z += 30) {
        const y = horizonY + Math.pow(z + offsetZ, 1.4) * 0.45;
        if (y < h) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      // Vanishing point perspective lines
      const vanishingX = w / 2 - angularVel * 40;
      for (let x = -w * 0.5; x <= w * 1.5; x += 60) {
        ctx.beginPath();
        ctx.moveTo(vanishingX, horizonY);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Draw simulated obstacles on the floor
      detectedObjects.forEach(obj => {
        const objX = (obj.x / 100) * w;
        const objY = horizonY + (obj.y / 100) * (h - horizonY);
        const objW = (obj.w / 100) * w;
        const objH = (obj.h / 100) * (h - horizonY);

        if (visionMode === 'canny') {
          // Neon wireframe
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(objX, objY, objW, objH);
        } else if (visionMode === 'depth') {
          // Colormap
          const depthGrad = ctx.createLinearGradient(objX, objY, objX + objW, objY + objH);
          depthGrad.addColorStop(0, '#ec4899');
          depthGrad.addColorStop(1, '#eab308');
          ctx.fillStyle = depthGrad;
          ctx.fillRect(objX, objY, objW, objH);
        } else {
          // Regular shaded box
          ctx.fillStyle = '#334155';
          ctx.fillRect(objX, objY, objW, objH);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.strokeRect(objX, objY, objW, objH);
        }

        // YOLO Bounding Box & Label
        if (visionMode === 'yolo' && obj.conf >= confidenceThreshold) {
          ctx.strokeStyle = obj.color;
          ctx.lineWidth = 2;
          ctx.strokeRect(objX - 4, objY - 4, objW + 8, objH + 8);

          // Corner brackets
          const bl = 10;
          ctx.beginPath();
          ctx.moveTo(objX - 4, objY - 4 + bl);
          ctx.lineTo(objX - 4, objY - 4);
          ctx.lineTo(objX - 4 + bl, objY - 4);
          ctx.moveTo(objX + objW + 4 - bl, objY - 4);
          ctx.lineTo(objX + objW + 4, objY - 4);
          ctx.lineTo(objX + objW + 4, objY - 4 + bl);
          ctx.stroke();

          // Label badge
          ctx.fillStyle = obj.color;
          ctx.fillRect(objX - 4, objY - 24, objW + 8, 20);

          ctx.fillStyle = '#020617';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`${obj.label} ${Math.round(obj.conf * 100)}% [${obj.dist}]`, objX, objY - 10);
        }
      });

      // CANNY FILTER EFFECT OVERLAY
      if (visionMode === 'canny') {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.fillRect(0, 0, w, h);
      }

      // HUD RETICLE & CROSSHAIRS
      const cx = w / 2;
      const cy = h / 2;

      ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
      ctx.lineWidth = 1;

      // Center crosshair
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 36, cy);
      ctx.lineTo(cx - 10, cy);
      ctx.moveTo(cx + 10, cy);
      ctx.lineTo(cx + 36, cy);
      ctx.moveTo(cx, cy - 36);
      ctx.lineTo(cx, cy - 10);
      ctx.moveTo(cx, cy + 10);
      ctx.lineTo(cx, cy + 36);
      ctx.stroke();

      // Pitch / Horizon Ladder Marks
      const ladderSpacing = 25;
      for (let i = -2; i <= 2; i++) {
        if (i !== 0) {
          const ly = horizonY + i * ladderSpacing;
          ctx.beginPath();
          ctx.moveTo(cx - 20, ly);
          ctx.lineTo(cx + 20, ly);
          ctx.stroke();
          ctx.fillStyle = 'rgba(52, 211, 153, 0.6)';
          ctx.font = '9px monospace';
          ctx.fillText(`${-i * 10}°`, cx + 24, ly + 3);
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [visionMode, cameraTiltDeg, confidenceThreshold, linearVel, angularVel]);

  const handleCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg');
    setCapturedSnapshot(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/70 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Jetson CSI Video Stream (Sony IMX219)
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                160° FOV Fisheye
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Zero-latency NVMM hardware accelerated GStreamer pipeline
            </p>
          </div>
        </div>

        {/* Vision Mode Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
            <button
              onClick={() => setVisionMode('yolo')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                visionMode === 'yolo' ? 'bg-emerald-600 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              YOLOv8 AI Boxes
            </button>
            <button
              onClick={() => setVisionMode('canny')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                visionMode === 'canny' ? 'bg-emerald-600 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Canny Edges
            </button>
            <button
              onClick={() => setVisionMode('depth')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                visionMode === 'depth' ? 'bg-emerald-600 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Depth Map
            </button>
            <button
              onClick={() => setVisionMode('raw')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                visionMode === 'raw' ? 'bg-emerald-600 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw 1080p
            </button>
          </div>

          <button
            onClick={handleCapture}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Snapshot</span>
          </button>
        </div>
      </div>

      {/* Main HUD Canvas Area */}
      <div className="relative w-full aspect-[16/9] max-h-[540px] bg-slate-950 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full object-contain"
        />

        {/* Top-left Telemetry overlay */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 text-xs font-mono space-y-1">
          <div className="text-emerald-400 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">NVMM HARDWARE ISP</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            <div>Res: <strong>1280x720 @ {fps} FPS</strong></div>
            <div>Exposure: <strong>1/120s Auto</strong></div>
            <div>Sensor: <strong>CAM0 (I2C 0x10)</strong></div>
          </div>
        </div>

        {/* Top-right AI Inference metrics */}
        {visionMode === 'yolo' && (
          <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 text-xs font-mono space-y-1">
            <div className="text-cyan-400 font-bold flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>TensorRT FP16</span>
            </div>
            <div className="text-slate-300 text-[11px] space-y-0.5">
              <div>Inference Latency: <strong>18.4 ms</strong></div>
              <div>Model: <strong>yolov8n-640.engine</strong></div>
              <div>Classes Detected: <strong>{detectedObjects.length}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Servo Tilt and Tuning controls */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-6">
          {/* Camera Tilt Angle */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Camera Pitch (Tilt):</span>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={cameraTiltDeg}
              onChange={e => setCameraTiltDeg(parseInt(e.target.value))}
              className="w-28 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono text-emerald-400 font-bold">{cameraTiltDeg}°</span>
          </div>

          {/* AI Confidence Threshold */}
          {visionMode === 'yolo' && (
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Min Conf:</span>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={confidenceThreshold}
                onChange={e => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-24 accent-emerald-500 cursor-pointer"
              />
              <span className="font-mono text-cyan-400 font-bold">{(confidenceThreshold * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>

        <div className="text-slate-500 text-[11px]">
          Hardware Tilt Bracket: Green Anodized Aluminum with M3 knurled lock screws
        </div>
      </div>

      {/* Snapshot Modal */}
      {capturedSnapshot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Snapshot Captured
              </h3>
              <button
                onClick={() => setCapturedSnapshot(null)}
                className="text-slate-400 hover:text-slate-100 text-lg leading-none"
              >
                &times;
              </button>
            </div>
            <div className="my-4 rounded-xl overflow-hidden border border-slate-800">
              <img src={capturedSnapshot} alt="Robot Snapshot" className="w-full h-auto" />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setCapturedSnapshot(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <a
                href={capturedSnapshot}
                download={`robot_cam_${Date.now()}.jpg`}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Disk</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
