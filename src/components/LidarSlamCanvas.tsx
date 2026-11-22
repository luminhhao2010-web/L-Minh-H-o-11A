import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Radar, 
  Map as MapIcon, 
  Play, 
  Pause, 
  RotateCcw, 
  Crosshair, 
  AlertTriangle, 
  Sliders, 
  ShieldAlert, 
  Layers,
  Sparkles,
  Download
} from 'lucide-react';

interface LidarSlamCanvasProps {
  robotPose: { x: number; y: number; theta: number };
  setRobotPose: React.Dispatch<React.SetStateAction<{ x: number; y: number; theta: number }>>;
  linearVel: number;
  angularVel: number;
  isEstopActive: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  radius: number;
}

export const LidarSlamCanvas: React.FC<LidarSlamCanvasProps> = ({
  robotPose,
  setRobotPose,
  linearVel,
  angularVel,
  isEstopActive,
}) => {
  const [viewMode, setViewMode] = useState<'radar' | 'slam'>('slam');
  const [isPatrolling, setIsPatrolling] = useState(false);
  const [showRays, setShowRays] = useState(true);
  const [scanRateHz, setScanRateHz] = useState(5.5);
  const [maxRangeM, setMaxRangeM] = useState(8.0);
  const [navGoal, setNavGoal] = useState<{ x: number; y: number } | null>(null);
  const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[]>([]);

  // Telemetry metrics derived from lidar
  const [sectorDistances, setSectorDistances] = useState({
    front: 2.4,
    left: 1.8,
    right: 1.6,
    rear: 3.2,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sweepAngleRef = useRef<number>(0);

  // Environment obstacles in meters (Room centered at 0,0, dimension 10m x 8m)
  const roomBounds = { minX: -4.5, maxX: 4.5, minY: -3.5, maxY: 3.5 };
  
  // Static obstacles / interior walls
  const [obstacles, setObstacles] = useState<Obstacle[]>([
    { x: -2.0, y: 1.2, radius: 0.45 },
    { x: 1.8, y: -1.0, radius: 0.55 },
    { x: 2.2, y: 1.8, radius: 0.4 },
    { x: -1.5, y: -1.8, radius: 0.5 },
    { x: 0.0, y: 2.2, radius: 0.35 },
    { x: 0.0, y: -2.0, radius: 0.4 },
  ]);

  // Occupancy grid state for SLAM (e.g. 100x80 cells)
  const gridResolution = 0.1; // 10cm per cell
  const gridWidth = 90;
  const gridHeight = 70;
  const occupancyGridRef = useRef<number[][]>(
    Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(-1)) // -1: unknown, 0: free, 100: occupied
  );

  // Helper: world coords to grid coords
  const worldToGrid = useCallback((wx: number, wy: number) => {
    const gx = Math.floor((wx - roomBounds.minX) / gridResolution);
    const gy = Math.floor((wy - roomBounds.minY) / gridResolution);
    return { gx, gy };
  }, [roomBounds.minX, roomBounds.minY]);

  // Laser Raycast function: calculates distance from (rx, ry) in direction theta
  const castRay = useCallback((rx: number, ry: number, angle: number, maxR: number): number => {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    let minD = maxR;

    // Check 4 room boundary walls
    if (cosA > 0) {
      const d = (roomBounds.maxX - rx) / cosA;
      if (d > 0 && d < minD) minD = d;
    } else if (cosA < 0) {
      const d = (roomBounds.minX - rx) / cosA;
      if (d > 0 && d < minD) minD = d;
    }

    if (sinA > 0) {
      const d = (roomBounds.maxY - ry) / sinA;
      if (d > 0 && d < minD) minD = d;
    } else if (sinA < 0) {
      const d = (roomBounds.minY - ry) / sinA;
      if (d > 0 && d < minD) minD = d;
    }

    // Check round obstacles
    for (const obs of obstacles) {
      const ox = obs.x - rx;
      const oy = obs.y - ry;
      const proj = ox * cosA + oy * sinA;
      if (proj > 0) {
        const perpDistSq = (ox * ox + oy * oy) - (proj * proj);
        if (perpDistSq < obs.radius * obs.radius) {
          const dToIntersection = proj - Math.sqrt(obs.radius * obs.radius - perpDistSq);
          if (dToIntersection > 0 && dToIntersection < minD) {
            minD = dToIntersection;
          }
        }
      }
    }

    // Add small simulated sensor noise (±1.5cm)
    const noise = (Math.random() - 0.5) * 0.03;
    return Math.max(0.15, Math.min(maxR, minD + noise));
  }, [obstacles, roomBounds]);

  // Autonomous Patrol / Path follower loop
  useEffect(() => {
    if (!navGoal && !isPatrolling) return;

    const interval = setInterval(() => {
      if (isEstopActive) return;

      let target = navGoal;
      if (isPatrolling && !target) {
        // Random exploration target within room
        target = {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 4.5,
        };
        setNavGoal(target);
      }

      if (target) {
        setRobotPose(prev => {
          const dx = target!.x - prev.x;
          const dy = target!.y - prev.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 0.25) {
            // Reached goal
            if (isPatrolling) {
              setNavGoal({
                x: (Math.random() - 0.5) * 6,
                y: (Math.random() - 0.5) * 4.5,
              });
            } else {
              setNavGoal(null);
            }
            return prev;
          }

          const targetAngle = Math.atan2(dy, dx);
          let angleDiff = targetAngle - prev.theta;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

          // Simple proportional controller
          const steer = Math.max(-1.5, Math.min(1.5, angleDiff * 2.2));
          const forward = Math.abs(angleDiff) > 0.6 ? 0.05 : Math.min(0.35, dist * 0.5);

          const dt = 0.05;
          const newTheta = prev.theta + steer * dt;
          const newX = Math.max(roomBounds.minX + 0.3, Math.min(roomBounds.maxX - 0.3, prev.x + Math.cos(newTheta) * forward * dt));
          const newY = Math.max(roomBounds.minY + 0.3, Math.min(roomBounds.maxY - 0.3, prev.y + Math.sin(newTheta) * forward * dt));

          return { x: newX, y: newY, theta: newTheta };
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [navGoal, isPatrolling, isEstopActive, roomBounds, setRobotPose]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Update sweep angle
      sweepAngleRef.current += (scanRateHz * 2 * Math.PI) * dt;
      if (sweepAngleRef.current > Math.PI * 2) {
        sweepAngleRef.current -= Math.PI * 2;
      }

      // Handle teleop velocity integration if not patrolling
      if (!isPatrolling && !navGoal && !isEstopActive && (linearVel !== 0 || angularVel !== 0)) {
        setRobotPose(prev => {
          const newTheta = prev.theta + angularVel * dt;
          const newX = Math.max(roomBounds.minX + 0.3, Math.min(roomBounds.maxX - 0.3, prev.x + Math.cos(newTheta) * linearVel * dt));
          const newY = Math.max(roomBounds.minY + 0.3, Math.min(roomBounds.maxY - 0.3, prev.y + Math.sin(newTheta) * linearVel * dt));
          return { x: newX, y: newY, theta: newTheta };
        });
      }

      // Compute 360-degree LiDAR scan (72 samples for smooth real-time rendering)
      const numPoints = 120;
      const scanPoints: { angle: number; dist: number; wx: number; wy: number }[] = [];
      let minFront = 999;
      let minLeft = 999;
      let minRight = 999;
      let minRear = 999;

      for (let i = 0; i < numPoints; i++) {
        const relAngle = (i / numPoints) * 2 * Math.PI;
        const globalAngle = robotPose.theta + relAngle;
        const dist = castRay(robotPose.x, robotPose.y, globalAngle, maxRangeM);
        const wx = robotPose.x + Math.cos(globalAngle) * dist;
        const wy = robotPose.y + Math.sin(globalAngle) * dist;

        scanPoints.push({ angle: relAngle, dist, wx, wy });

        // Update sectors
        const deg = (relAngle * 180 / Math.PI) % 360;
        if (deg >= 315 || deg < 45) {
          if (dist < minFront) minFront = dist;
        } else if (deg >= 45 && deg < 135) {
          if (dist < minLeft) minLeft = dist;
        } else if (deg >= 135 && deg < 225) {
          if (dist < minRear) minRear = dist;
        } else {
          if (dist < minRight) minRight = dist;
        }

        // SLAM Occupancy Grid Update (Ray trace into grid)
        const hitGrid = worldToGrid(wx, wy);
        if (hitGrid.gx >= 0 && hitGrid.gx < gridWidth && hitGrid.gy >= 0 && hitGrid.gy < gridHeight) {
          occupancyGridRef.current[hitGrid.gy][hitGrid.gx] = 100; // Hit obstacle
        }

        // Clear free space along ray
        const steps = Math.min(25, Math.floor(dist / gridResolution));
        for (let s = 1; s < steps; s++) {
          const fx = robotPose.x + (wx - robotPose.x) * (s / steps);
          const fy = robotPose.y + (wy - robotPose.y) * (s / steps);
          const freeGrid = worldToGrid(fx, fy);
          if (
            freeGrid.gx >= 0 && freeGrid.gx < gridWidth &&
            freeGrid.gy >= 0 && freeGrid.gy < gridHeight &&
            occupancyGridRef.current[freeGrid.gy][freeGrid.gx] !== 100
          ) {
            occupancyGridRef.current[freeGrid.gy][freeGrid.gx] = 0; // Free space
          }
        }
      }

      setSectorDistances({
        front: Number(minFront.toFixed(2)),
        left: Number(minLeft.toFixed(2)),
        right: Number(minRight.toFixed(2)),
        rear: Number(minRear.toFixed(2)),
      });

      // Clear Canvas
      ctx.fillStyle = '#050a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (viewMode === 'radar') {
        // RADAR VIEW (Polar coordinates centered on robot)
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const scale = (Math.min(canvas.width, canvas.height) * 0.45) / maxRangeM;

        // Polar grid rings
        const rings = [1, 2, 3, 5, 8];
        rings.forEach(r => {
          if (r <= maxRangeM) {
            ctx.beginPath();
            ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
            ctx.strokeStyle = r === 1 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.18)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Label
            ctx.fillStyle = 'rgba(52, 211, 153, 0.7)';
            ctx.font = '10px monospace';
            ctx.fillText(`${r}m`, cx + r * scale + 4, cy - 4);
          }
        });

        // Crosshairs & degree axes
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, 15);
        ctx.lineTo(cx, canvas.height - 15);
        ctx.moveTo(15, cy);
        ctx.lineTo(canvas.width - 15, cy);
        ctx.stroke();

        // Degree indicators
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(52, 211, 153, 0.8)';
        ctx.fillText('0° FRONT', cx - 24, 25);
        ctx.fillText('90° LEFT', 20, cy - 6);
        ctx.fillText('180° REAR', cx - 24, canvas.height - 20);
        ctx.fillText('270° RIGHT', canvas.width - 70, cy - 6);

        // Rotating Sweep beam
        const sweepAngle = sweepAngleRef.current;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRangeM * scale);
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxRangeM * scale, -sweepAngle - 0.4, -sweepAngle, false);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(-sweepAngle) * maxRangeM * scale, cy + Math.sin(-sweepAngle) * maxRangeM * scale);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Plot LiDAR Points
        scanPoints.forEach(pt => {
          // In radar view, 0° is forward (up)
          const px = cx + Math.sin(pt.angle) * pt.dist * scale;
          const py = cy - Math.cos(pt.angle) * pt.dist * scale;

          let color = '#10b981'; // Green
          if (pt.dist < 0.4) {
            color = '#ef4444'; // Red danger
          } else if (pt.dist < 1.2) {
            color = '#f59e0b'; // Amber warning
          }

          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Connect dots with faint line to form contour
          if (showRays && pt.dist < 1.0) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(px, py);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        // Robot Center Marker
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#064e3b';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Forward indicator on robot
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy - 2);
        ctx.lineTo(cx, cy - 12);
        ctx.lineTo(cx + 6, cy - 2);
        ctx.fillStyle = '#34d399';
        ctx.fill();

      } else {
        // 2D SLAM OCCUPANCY GRID MAP VIEW
        const padX = 40;
        const padY = 40;
        const mapW = canvas.width - padX * 2;
        const mapH = canvas.height - padY * 2;
        const toScreenX = (wx: number) => padX + ((wx - roomBounds.minX) / (roomBounds.maxX - roomBounds.minX)) * mapW;
        const toScreenY = (wy: number) => padY + ((wy - roomBounds.minY) / (roomBounds.maxY - roomBounds.minY)) * mapH;

        // Render Occupancy Grid Cells
        const cellW = mapW / gridWidth;
        const cellH = mapH / gridHeight;
        for (let gy = 0; gy < gridHeight; gy++) {
          for (let gx = 0; gx < gridWidth; gx++) {
            const val = occupancyGridRef.current[gy][gx];
            if (val === 100) {
              // Occupied wall / obstacle
              ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
              ctx.fillRect(padX + gx * cellW, padY + gy * cellH, cellW + 0.5, cellH + 0.5);
            } else if (val === 0) {
              // Known Free space
              ctx.fillStyle = 'rgba(15, 30, 30, 0.9)';
              ctx.fillRect(padX + gx * cellW, padY + gy * cellH, cellW + 0.5, cellH + 0.5);
            } else {
              // Unknown space (subtle hatch pattern)
              if ((gx + gy) % 6 === 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
                ctx.fillRect(padX + gx * cellW, padY + gy * cellH, cellW, cellH);
              }
            }
          }
        }

        // Room boundary walls (Ground truth)
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(padX, padY, mapW, mapH);

        // Real-time Laser Rays
        if (showRays) {
          ctx.lineWidth = 0.5;
          scanPoints.forEach(pt => {
            const sx = toScreenX(robotPose.x);
            const sy = toScreenY(robotPose.y);
            const hx = toScreenX(pt.wx);
            const hy = toScreenY(pt.wy);

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(hx, hy);
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.12)';
            ctx.stroke();

            // Hit point
            ctx.beginPath();
            ctx.arc(hx, hy, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = '#10b981';
            ctx.fill();
          });
        }

        // Planned Navigation Path
        if (navGoal) {
          const gx = toScreenX(navGoal.x);
          const gy = toScreenY(navGoal.y);

          // Goal marker
          ctx.beginPath();
          ctx.arc(gx, gy, 8, 0, Math.PI * 2);
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(gx, gy, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ec4899';
          ctx.fill();

          // Dotted trajectory line from robot to goal
          ctx.beginPath();
          ctx.setLineDash([6, 4]);
          ctx.moveTo(toScreenX(robotPose.x), toScreenY(robotPose.y));
          ctx.lineTo(gx, gy);
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw Robot Chassis Footprint
        const rx = toScreenX(robotPose.x);
        const ry = toScreenY(robotPose.y);
        const robotRadPx = (0.105 / (roomBounds.maxX - roomBounds.minX)) * mapW;

        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate(robotPose.theta);

        // Circular green anodized chassis
        ctx.beginPath();
        ctx.arc(0, 0, robotRadPx, 0, Math.PI * 2);
        ctx.fillStyle = '#065f46';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // 2 Wheels
        const wheelW = robotRadPx * 0.45;
        const wheelH = robotRadPx * 0.2;
        ctx.fillStyle = '#0284c7'; // Blue rims
        ctx.fillRect(-wheelW / 2, -robotRadPx - wheelH * 0.5, wheelW, wheelH);
        ctx.fillRect(-wheelW / 2, robotRadPx - wheelH * 0.5, wheelW, wheelH);

        // RPLIDAR scanner in center
        ctx.beginPath();
        ctx.arc(0, 0, robotRadPx * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = '#71717a';
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();

        // Forward heading arrow
        ctx.beginPath();
        ctx.moveTo(robotRadPx * 0.3, 0);
        ctx.lineTo(robotRadPx + 6, 0);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(robotRadPx + 6, 0);
        ctx.lineTo(robotRadPx - 2, -4);
        ctx.lineTo(robotRadPx - 2, 4);
        ctx.closePath();
        ctx.fillStyle = '#fbbf24';
        ctx.fill();

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    viewMode,
    scanRateHz,
    maxRangeM,
    robotPose,
    linearVel,
    angularVel,
    isEstopActive,
    isPatrolling,
    navGoal,
    showRays,
    castRay,
    worldToGrid,
    setRobotPose
  ]);

  // Click handler to set 2D Nav Goal in SLAM view
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (viewMode !== 'slam') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const padX = 40;
    const padY = 40;
    const mapW = canvas.width - padX * 2;
    const mapH = canvas.height - padY * 2;

    const normX = (clickX - padX) / mapW;
    const normY = (clickY - padY) / mapH;

    if (normX >= 0 && normX <= 1 && normY >= 0 && normY <= 1) {
      const wx = roomBounds.minX + normX * (roomBounds.maxX - roomBounds.minX);
      const wy = roomBounds.minY + normY * (roomBounds.maxY - roomBounds.minY);
      setNavGoal({ x: Number(wx.toFixed(2)), y: Number(wy.toFixed(2)) });
    }
  };

  const handleResetMap = () => {
    occupancyGridRef.current = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(-1));
    setRobotPose({ x: 0, y: 0, theta: 0 });
    setNavGoal(null);
    setIsPatrolling(false);
  };

  const handleExportMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `slam_map_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header / Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/70 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            {viewMode === 'radar' ? <Radar className="w-5 h-5 animate-spin" /> : <MapIcon className="w-5 h-5 text-emerald-400" />}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              {viewMode === 'radar' ? 'RPLIDAR A1 360° Polar Scan' : '2D Occupancy Grid SLAM & Navigation'}
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                8000 Hz
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {viewMode === 'radar'
                ? 'Real-time laser proximity radar with sector collision avoidance'
                : 'Click map to set 2D Nav Goal or drive to construct floor plan'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
            <button
              onClick={() => setViewMode('slam')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'slam'
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>SLAM Map</span>
            </button>
            <button
              onClick={() => setViewMode('radar')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'radar'
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radar className="w-3.5 h-3.5" />
              <span>360° Radar</span>
            </button>
          </div>

          {/* Autonomous Patrol */}
          <button
            onClick={() => setIsPatrolling(!isPatrolling)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isPatrolling
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isPatrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPatrolling ? 'Pause Patrol' : 'Auto Patrol'}</span>
          </button>

          {/* Reset Map */}
          <button
            onClick={handleResetMap}
            title="Clear SLAM map and reset robot pose"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Export Map Image */}
          <button
            onClick={handleExportMap}
            title="Export SLAM Map as PNG"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[580px] bg-slate-950 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {/* Hazard Clearance Overlay Box */}
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 text-xs font-mono shadow-lg flex flex-col space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between border-b border-slate-800 pb-1">
            <span>LiDAR Clearances</span>
            {sectorDistances.front < 0.45 && (
              <span className="text-rose-400 font-bold flex items-center animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-0.5" /> HAZARD
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-0.5 text-slate-300">
            <div className="flex justify-between items-center space-x-2">
              <span className="text-slate-400">Front:</span>
              <span className={`font-bold ${sectorDistances.front < 0.4 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {sectorDistances.front}m
              </span>
            </div>
            <div className="flex justify-between items-center space-x-2">
              <span className="text-slate-400">Rear:</span>
              <span className="font-bold text-slate-200">{sectorDistances.rear}m</span>
            </div>
            <div className="flex justify-between items-center space-x-2">
              <span className="text-slate-400">Left:</span>
              <span className="font-bold text-slate-200">{sectorDistances.left}m</span>
            </div>
            <div className="flex justify-between items-center space-x-2">
              <span className="text-slate-400">Right:</span>
              <span className="font-bold text-slate-200">{sectorDistances.right}m</span>
            </div>
          </div>
        </div>

        {/* Pose Readout */}
        <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 text-xs font-mono shadow-lg flex flex-col space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-800 pb-1">
            Odometry (Odom)
          </div>
          <div className="text-slate-300 space-y-0.5">
            <div>X: <span className="text-emerald-400 font-semibold">{robotPose.x.toFixed(2)} m</span></div>
            <div>Y: <span className="text-emerald-400 font-semibold">{robotPose.y.toFixed(2)} m</span></div>
            <div>Yaw: <span className="text-emerald-400 font-semibold">{(robotPose.theta * 180 / Math.PI).toFixed(1)}°</span></div>
          </div>
        </div>

        {/* Hint bar in bottom right */}
        {viewMode === 'slam' && (
          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 flex items-center space-x-2">
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span>Click anywhere inside the arena to command a 2D Navigation Goal</span>
          </div>
        )}
      </div>

      {/* Sensor Settings Bar */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Scan Frequency:</span>
            <input
              type="range"
              min="4"
              max="10"
              step="0.5"
              value={scanRateHz}
              onChange={e => setScanRateHz(parseFloat(e.target.value))}
              className="w-20 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono text-emerald-400 font-bold">{scanRateHz} Hz</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Max Range:</span>
            <select
              value={maxRangeM}
              onChange={e => setMaxRangeM(parseFloat(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-200 text-xs"
            >
              <option value="4">4 meters</option>
              <option value="8">8 meters</option>
              <option value="12">12 meters (A1 Max)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-1.5 text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showRays}
              onChange={e => setShowRays(e.target.checked)}
              className="accent-emerald-500"
            />
            <span>Show Laser Beams</span>
          </label>

          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Laser Class: <strong className="text-emerald-400">Class 1 Safe (FDA)</strong></span>
        </div>
      </div>
    </div>
  );
};
