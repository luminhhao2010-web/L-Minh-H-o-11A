import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Activity, 
  Flame, 
  Wind, 
  BatteryCharging, 
  Wifi, 
  Monitor, 
  Sparkles, 
  Sliders, 
  RefreshCw,
  Zap,
  HardDrive
} from 'lucide-react';

interface TelemetryDashboardProps {
  batteryVoltage: number;
  linearVel: number;
  angularVel: number;
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({
  batteryVoltage,
  linearVel,
  angularVel,
}) => {
  const [cpuUsage, setCpuUsage] = useState([28, 34, 19, 42]);
  const [gpuUsage, setGpuUsage] = useState(48);
  const [ramUsedGb, setRamUsedGb] = useState(2.35);
  const [socTemp, setSocTemp] = useState(44.2);
  const [fanPwmPct, setFanPwmPct] = useState(45);
  const [fanMode, setFanMode] = useState<'auto' | '50' | '100'>('auto');
  const [oledPage, setOledPage] = useState<number>(0);
  const [customOledText, setCustomOledText] = useState('');

  // Dynamic telemetry jitter
  useEffect(() => {
    const interval = setInterval(() => {
      const isMoving = Math.abs(linearVel) > 0.05 || Math.abs(angularVel) > 0.05;

      setCpuUsage([
        Math.min(95, Math.max(12, Math.round(25 + (isMoving ? 25 : 0) + (Math.random() - 0.5) * 15))),
        Math.min(95, Math.max(12, Math.round(30 + (isMoving ? 30 : 0) + (Math.random() - 0.5) * 15))),
        Math.min(95, Math.max(12, Math.round(18 + (isMoving ? 15 : 0) + (Math.random() - 0.5) * 12))),
        Math.min(95, Math.max(12, Math.round(35 + (isMoving ? 20 : 0) + (Math.random() - 0.5) * 18))),
      ]);

      setGpuUsage(prev => {
        const base = isMoving ? 62 : 44;
        return Math.min(98, Math.max(15, Math.round(base + (Math.random() - 0.5) * 16)));
      });

      setSocTemp(prev => {
        const target = isMoving ? 48.5 : 43.0;
        return Number((prev + (target - prev) * 0.1 + (Math.random() - 0.5) * 0.4).toFixed(1));
      });

      setRamUsedGb(prev => Number((2.32 + (Math.random() - 0.5) * 0.08).toFixed(2)));
    }, 1200);

    return () => clearInterval(interval);
  }, [linearVel, angularVel]);

  // Fan control logic
  useEffect(() => {
    if (fanMode === '100') {
      setFanPwmPct(100);
    } else if (fanMode === '50') {
      setFanPwmPct(50);
    } else {
      // Auto
      const calculatedPwm = Math.min(100, Math.max(25, Math.round((socTemp - 35) * 4.5)));
      setFanPwmPct(calculatedPwm);
    }
  }, [fanMode, socTemp]);

  // Auto cycle OLED display pages every 4 seconds if no custom text
  useEffect(() => {
    if (customOledText) return;
    const interval = setInterval(() => {
      setOledPage(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, [customOledText]);

  // Battery calculations
  const cellVoltage = Number((batteryVoltage / 3).toFixed(2));
  const currentDrawA = Number((1.45 + (Math.abs(linearVel) + Math.abs(angularVel)) * 0.85).toFixed(2));
  const totalPowerW = Number((batteryVoltage * currentDrawA).toFixed(1));
  const batteryPct = Math.min(100, Math.max(0, Math.round(((batteryVoltage - 10.5) / (12.6 - 10.5)) * 100)));
  const estimatedHoursLeft = Number(((2.6 * (batteryPct / 100)) / currentDrawA).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Cpu className="w-4 h-4" />
            <span>NVIDIA Jetson Nano Dev Kit Rev2</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Jetson SoC Hardware Telemetry & Health Monitor
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time diagnostics from the Tegra X1 processor, 128-core Maxwell GPU, 3S battery fuel gauge, thermal zones, and the 128x32 I2C OLED display emulator.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-slate-950 border border-slate-800 text-emerald-400">
            tegrastats: ACTIVE (1000ms)
          </span>
        </div>
      </div>

      {/* Main Grid: SoC Compute & Thermals + Battery & OLED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compute & CPU/GPU Loads (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* CPU Quad Core Gauges */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">ARM Cortex-A57 (Quad-Core @ 1.43 GHz)</h3>
                  <p className="text-xs text-slate-400">Individual core load allocation</p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-400">
                Avg: {Math.round(cpuUsage.reduce((a, b) => a + b, 0) / 4)}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {cpuUsage.map((load, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Core {idx}
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-100 mb-2">
                    {load}%
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${load}%` }}
                      className={`h-full transition-all duration-300 ${
                        load > 80 ? 'bg-rose-500' : load > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GPU & Memory Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* GPU Maxwell 128-Core */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-3 mb-4">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">128-core Maxwell GPU</h3>
                  <p className="text-[11px] text-slate-400">CUDA / TensorRT Inference Load</p>
                </div>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-mono font-bold text-cyan-400">{gpuUsage}%</span>
                <span className="text-xs font-mono text-slate-400">Clock: 921.6 MHz</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 mb-3">
                <div
                  style={{ width: `${gpuUsage}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                />
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>472 GFLOPs FP16 Compute</span>
                <span>Active Model: YOLOv8 Nano</span>
              </div>
            </div>

            {/* RAM Memory Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-3 mb-4">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">4GB 64-bit LPDDR4</h3>
                  <p className="text-[11px] text-slate-400">Unified System & Video Memory</p>
                </div>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-mono font-bold text-purple-400">{ramUsedGb} GB</span>
                <span className="text-xs font-mono text-slate-400">of 4.00 GB (59%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 mb-3">
                <div
                  style={{ width: `${(ramUsedGb / 4) * 100}%` }}
                  className="h-full bg-purple-500 transition-all duration-300"
                />
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Bandwidth: 25.6 GB/s</span>
                <span>Swap: 2.0GB ZRAM</span>
              </div>
            </div>
          </div>

          {/* Thermals & Active Fan Cooling */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Thermal Architecture & Active Cooling</h3>
                  <p className="text-xs text-slate-400">Tegra X1 junction sensor & 4-wire PWM fan</p>
                </div>
              </div>

              {/* Fan Mode Selector */}
              <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                <button
                  onClick={() => setFanMode('auto')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    fanMode === 'auto' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Auto PWM
                </button>
                <button
                  onClick={() => setFanMode('50')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    fanMode === '50' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  50%
                </button>
                <button
                  onClick={() => setFanMode('100')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    fanMode === '100' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Max 100%
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Tegra SoC Temp</div>
                  <div className="text-3xl font-mono font-bold text-amber-400 mt-1">{socTemp}°C</div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <div>Throttle Limit: 85°C</div>
                  <div>Status: <span className="text-emerald-400 font-bold">NORMAL</span></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Cooling Fan Speed</div>
                  <div className="text-3xl font-mono font-bold text-cyan-400 mt-1 flex items-center gap-2">
                    <Wind className={`w-6 h-6 ${fanPwmPct > 0 ? 'animate-spin' : ''}`} />
                    <span>{fanPwmPct}%</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <div>Est. RPM: {Math.round(fanPwmPct * 45)} RPM</div>
                  <div>Target Temp: 45°C</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3S Li-Po Battery Fuel Gauge & 128x32 OLED Display */}
        <div className="space-y-6">
          {/* 3S Li-Po Battery Fuel Gauge */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">3S Li-ion Battery Pack</h3>
                <p className="text-[11px] text-slate-400">11.1V Nom / 12.6V Peak (2600 mAh)</p>
              </div>
            </div>

            <div className="text-center my-4">
              <div className="text-4xl font-mono font-bold text-emerald-400">
                {batteryVoltage.toFixed(2)} V
              </div>
              <div className="text-xs text-slate-400 mt-1 font-semibold">
                {batteryPct}% Remaining • ~{estimatedHoursLeft} hours runtime
              </div>
            </div>

            {/* Individual Cell Voltages */}
            <div className="grid grid-cols-3 gap-2 my-4">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500 uppercase">Cell 1</div>
                <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{cellVoltage}V</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500 uppercase">Cell 2</div>
                <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{cellVoltage}V</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500 uppercase">Cell 3</div>
                <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{cellVoltage}V</div>
              </div>
            </div>

            {/* Current & Power Draw */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Discharge Current:</span>
                <span className="font-bold text-amber-400">{currentDrawA} A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Power Consumption:</span>
                <span className="font-bold text-slate-100">{totalPowerW} W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Step-down Regulator:</span>
                <span className="text-emerald-400">5.0V @ 4.0A (Jetson)</span>
              </div>
            </div>
          </div>

          {/* 0.91" 128x32 OLED Screen Emulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">0.91" I2C OLED Display</h3>
                  <p className="text-[11px] text-slate-400">SSD1306 (Address 0x3C, 128x32)</p>
                </div>
              </div>

              {/* Page indicator */}
              <div className="flex space-x-1">
                {[0, 1, 2, 3].map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setOledPage(p);
                      setCustomOledText('');
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      oledPage === p && !customOledText ? 'bg-cyan-400 scale-125' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* OLED Physical Screen Mockup (Authentic cyan pixel rendering) */}
            <div className="bg-black p-4 rounded-xl border-2 border-slate-800 shadow-inner flex flex-col justify-center min-h-[90px] relative overflow-hidden font-mono select-none">
              <div className="absolute top-1 right-2 text-[9px] text-cyan-500/40 font-bold uppercase">
                SSD1306 128x32
              </div>

              {customOledText ? (
                <div className="text-cyan-400 text-xs tracking-wider leading-relaxed whitespace-pre-wrap">
                  {customOledText}
                </div>
              ) : oledPage === 0 ? (
                <div className="text-cyan-400 text-xs space-y-1">
                  <div className="font-bold flex justify-between">
                    <span>IP: 192.168.1.142</span>
                    <span className="text-[10px]">WLAN0</span>
                  </div>
                  <div className="text-[11px] text-cyan-300">SSID: LAB_ROBOTICS_5G</div>
                  <div className="text-[10px] text-cyan-500">RSSI: -58dBm • 867Mbps</div>
                </div>
              ) : oledPage === 1 ? (
                <div className="text-cyan-400 text-xs space-y-1">
                  <div className="font-bold flex justify-between">
                    <span>BAT: {batteryVoltage.toFixed(2)}V</span>
                    <span>{batteryPct}%</span>
                  </div>
                  <div className="text-[11px] text-cyan-300">DRAIN: {currentDrawA}A • {totalPowerW}W</div>
                  <div className="text-[10px] text-cyan-500">RUNTIME: ~{estimatedHoursLeft}H REMAINING</div>
                </div>
              ) : oledPage === 2 ? (
                <div className="text-cyan-400 text-xs space-y-1">
                  <div className="font-bold flex justify-between">
                    <span>CPU: {Math.round(cpuUsage[0])}%</span>
                    <span>GPU: {gpuUsage}%</span>
                  </div>
                  <div className="text-[11px] text-cyan-300">TEMP: {socTemp}°C • FAN: {fanPwmPct}%</div>
                  <div className="text-[10px] text-cyan-500">RAM: {ramUsedGb}G / 4.0G</div>
                </div>
              ) : (
                <div className="text-cyan-400 text-xs space-y-1">
                  <div className="font-bold flex justify-between">
                    <span>ROS 2: HUMBLE</span>
                    <span className="text-emerald-400">OK</span>
                  </div>
                  <div className="text-[11px] text-cyan-300">NODES: rplidar, diff_drive</div>
                  <div className="text-[10px] text-cyan-500">TOPICS: /cmd_vel, /scan, /odom</div>
                </div>
              )}
            </div>

            {/* Custom Text Tester */}
            <div className="mt-4">
              <label className="text-[11px] text-slate-400 block mb-1">
                Simulate Text Broadcast to Robot OLED:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. MISSION: WAYPOINT REACHED"
                  value={customOledText}
                  onChange={e => setCustomOledText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 font-mono"
                />
                {customOledText && (
                  <button
                    onClick={() => setCustomOledText('')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
