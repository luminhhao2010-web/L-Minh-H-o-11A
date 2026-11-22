import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Gamepad2, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Octagon, 
  Gauge, 
  RotateCcw, 
  Zap, 
  Volume2, 
  VolumeX, 
  Activity,
  CheckCircle2
} from 'lucide-react';
import { ROBOT_SPECIFICATIONS } from '../data/robotData';

interface TeleopCockpitProps {
  linearVel: number;
  setLinearVel: (v: number) => void;
  angularVel: number;
  setAngularVel: (w: number) => void;
  isEstopActive: boolean;
  setIsEstopActive: (active: boolean) => void;
  onResetPose: () => void;
}

export const TeleopCockpit: React.FC<TeleopCockpitProps> = ({
  linearVel,
  setLinearVel,
  angularVel,
  setAngularVel,
  isEstopActive,
  setIsEstopActive,
  onResetPose,
}) => {
  const [speedProfile, setSpeedProfile] = useState<'turtle' | 'normal' | 'turbo'>('normal');
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({});
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [leftEncoderTicks, setLeftEncoderTicks] = useState(0);
  const [rightEncoderTicks, setRightEncoderTicks] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Speed scale multipliers
  const maxLinear = speedProfile === 'turtle' ? 0.2 : speedProfile === 'normal' ? 0.35 : 0.55;
  const maxAngular = speedProfile === 'turtle' ? 1.0 : speedProfile === 'normal' ? 1.8 : 2.6;

  // Track width and wheel radius from robot specs
  const wheelRadius = 0.0325; // 65mm / 2 = 0.0325m
  const trackWidth = 0.155; // 155mm
  const ticksPerRev = 330;

  // Compute Left & Right Wheel velocities & RPM
  const vLeft = linearVel - (angularVel * trackWidth) / 2.0;
  const vRight = linearVel + (angularVel * trackWidth) / 2.0;
  const leftRpm = (vLeft / (2 * Math.PI * wheelRadius)) * 60;
  const rightRpm = (vRight / (2 * Math.PI * wheelRadius)) * 60;

  // Integrate simulated encoder ticks
  useEffect(() => {
    if (linearVel === 0 && angularVel === 0) return;
    const interval = setInterval(() => {
      const dt = 0.05;
      const leftRevPerSec = leftRpm / 60;
      const rightRevPerSec = rightRpm / 60;
      setLeftEncoderTicks(prev => prev + Math.round(leftRevPerSec * ticksPerRev * dt));
      setRightEncoderTicks(prev => prev + Math.round(rightRevPerSec * ticksPerRev * dt));
    }, 50);

    return () => clearInterval(interval);
  }, [leftRpm, rightRpm]);

  // Audio motor hum synthesis
  useEffect(() => {
    if (!soundEnabled) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      return;
    }

    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (Math.abs(linearVel) > 0.01 || Math.abs(angularVel) > 0.01) {
      if (!oscRef.current) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
        gainRef.current = gain;
      } else {
        const absSpeed = Math.max(Math.abs(linearVel), Math.abs(angularVel));
        const freq = 70 + absSpeed * 150;
        oscRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
      }
    } else if (oscRef.current) {
      oscRef.current.stop();
      oscRef.current.disconnect();
      oscRef.current = null;
    }
  }, [soundEnabled, linearVel, angularVel]);

  // Keyboard handler for W/A/S/D and Arrow Keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEstopActive) return;
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
        setActiveKeys(prev => ({ ...prev, [key]: true }));

        if (key === ' ') {
          // Spacebar emergency halt
          setLinearVel(0);
          setAngularVel(0);
          return;
        }

        let lin = 0;
        let ang = 0;

        if (key === 'w' || key === 'arrowup') lin += maxLinear;
        if (key === 's' || key === 'arrowdown') lin -= maxLinear;
        if (key === 'a' || key === 'arrowleft') ang += maxAngular;
        if (key === 'd' || key === 'arrowright') ang -= maxAngular;

        setLinearVel(lin);
        setAngularVel(ang);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setActiveKeys(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });

      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        setLinearVel(0);
        setAngularVel(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEstopActive, maxLinear, maxAngular, setLinearVel, setAngularVel]);

  // Touch / Mouse Virtual Joystick Handling
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const [joystickThumb, setJoystickThumb] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingJoystick = useRef(false);

  const updateJoystickPosition = useCallback((clientX: number, clientY: number) => {
    if (!joystickBaseRef.current || isEstopActive) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2 - 20;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    setJoystickThumb({ x: dx, y: dy });

    // Normalize: Y is linear (-1 to 1, inverted because up is negative Y in screen), X is angular (-1 to 1)
    const normLinear = (-dy / maxRadius) * maxLinear;
    const normAngular = (-dx / maxRadius) * maxAngular;

    setLinearVel(Number(normLinear.toFixed(2)));
    setAngularVel(Number(normAngular.toFixed(2)));
  }, [isEstopActive, maxLinear, maxAngular, setLinearVel, setAngularVel]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingJoystick.current = true;
    updateJoystickPosition(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingJoystick.current) {
      updateJoystickPosition(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    isDraggingJoystick.current = false;
    setJoystickThumb({ x: 0, y: 0 });
    setLinearVel(0);
    setAngularVel(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Joystick & Keyboard Direct Drive */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Differential Drive Teleoperation</h3>
                <p className="text-xs text-slate-400">Tactile dual-axis joystick or keyboard WASD / Arrow control</p>
              </div>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Disable motor sound' : 'Enable motor sound synthesis'}
              className={`p-2 rounded-lg border text-xs flex items-center space-x-1.5 transition-colors ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Speed Profiles & E-Stop Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Profile:</span>
              <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                <button
                  onClick={() => setSpeedProfile('turtle')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    speedProfile === 'turtle' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Turtle (0.2m/s)
                </button>
                <button
                  onClick={() => setSpeedProfile('normal')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    speedProfile === 'normal' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Normal (0.35m/s)
                </button>
                <button
                  onClick={() => setSpeedProfile('turbo')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    speedProfile === 'turbo' ? 'bg-rose-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Turbo (0.55m/s)
                </button>
              </div>
            </div>

            {/* E-STOP Button */}
            <button
              onClick={() => {
                const nextState = !isEstopActive;
                setIsEstopActive(nextState);
                if (nextState) {
                  setLinearVel(0);
                  setAngularVel(0);
                }
              }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all shadow-lg ${
                isEstopActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/40'
                  : 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-600/60'
              }`}
            >
              <Octagon className="w-4 h-4 fill-current" />
              <span>{isEstopActive ? 'RESUME SYSTEM' : 'EMERGENCY STOP (SPACE)'}</span>
            </button>
          </div>

          {/* Interactive Controller Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
            {/* Virtual Joystick */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Virtual Omnidirectional Stick
              </span>
              <div
                ref={joystickBaseRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`relative w-48 h-48 rounded-full border-2 bg-slate-950 shadow-inner flex items-center justify-center touch-none select-none ${
                  isEstopActive
                    ? 'border-rose-900/60 opacity-50 cursor-not-allowed'
                    : 'border-emerald-500/30 cursor-grab active:cursor-grabbing hover:border-emerald-500/60'
                }`}
              >
                {/* Cross axis markings */}
                <div className="absolute w-full h-[1px] bg-slate-800" />
                <div className="absolute h-full w-[1px] bg-slate-800" />
                <div className="absolute w-24 h-24 rounded-full border border-slate-800/80" />

                {/* Joystick thumb */}
                <div
                  style={{
                    transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`,
                  }}
                  className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform duration-75 ${
                    isEstopActive
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-500 text-slate-950 font-bold'
                  }`}
                >
                  <Gamepad2 className="w-6 h-6" />
                </div>
              </div>
              <span className="text-[11px] text-slate-500 mt-2">Drag handle to steer & accelerate</span>
            </div>

            {/* Keyboard WASD Visual Guide */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Keyboard Teleop Controls
              </span>
              <div className="flex flex-col items-center space-y-2">
                {/* W */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm border shadow-md transition-all ${
                    activeKeys['w'] || activeKeys['arrowup']
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-95 shadow-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  W / ↑
                </div>

                {/* A S D */}
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm border shadow-md transition-all ${
                      activeKeys['a'] || activeKeys['arrowleft']
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-95 shadow-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    A / ←
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm border shadow-md transition-all ${
                      activeKeys['s'] || activeKeys['arrowdown']
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-95 shadow-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    S / ↓
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm border shadow-md transition-all ${
                      activeKeys['d'] || activeKeys['arrowright']
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-95 shadow-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    D / →
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-400 text-center">
                <span>Hold keys to drive. Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">Space</kbd> for instant stop.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Motor Driver: <strong>TB6612 H-Bridge PWM</strong></span>
          </div>
          <button
            onClick={onResetPose}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Odometry (0,0,0)</span>
          </button>
        </div>
      </div>

      {/* Right: Real-time Kinematics & Motor Telemetry */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Differential Kinematics</h3>
              <p className="text-xs text-slate-400">Twist command to individual wheel RPMs</p>
            </div>
          </div>

          {/* Velocity Meters */}
          <div className="space-y-4 mb-6">
            {/* Linear Velocity */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400">Linear Velocity (v):</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {linearVel.toFixed(2)} m/s
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (Math.abs(linearVel) / 0.6) * 100)}%` }}
                  className="h-full bg-emerald-500 transition-all duration-75"
                />
              </div>
            </div>

            {/* Angular Velocity */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400">Angular Velocity (ω):</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">
                  {angularVel.toFixed(2)} rad/s
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (Math.abs(angularVel) / 2.8) * 100)}%` }}
                  className="h-full bg-cyan-500 transition-all duration-75"
                />
              </div>
            </div>
          </div>

          {/* Left / Right Wheel RPM Gauges */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Left Wheel */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Left Wheel
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">
                {leftRpm.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">RPM</div>
              <div className="mt-2 text-[10px] text-emerald-400/90 font-mono">
                {vLeft.toFixed(2)} m/s
              </div>
            </div>

            {/* Right Wheel */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Right Wheel
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">
                {rightRpm.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">RPM</div>
              <div className="mt-2 text-[10px] text-emerald-400/90 font-mono">
                {vRight.toFixed(2)} m/s
              </div>
            </div>
          </div>

          {/* Quadrature Encoder Counts */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span>Encoder Resolution:</span>
              <span className="text-slate-200">330 pulses/rev</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Left Encoder Ticks:</span>
              <span className="text-emerald-400 font-semibold">{leftEncoderTicks}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Right Encoder Ticks:</span>
              <span className="text-emerald-400 font-semibold">{rightEncoderTicks}</span>
            </div>
          </div>
        </div>

        {/* Kinematic specs reference */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
          <div>Wheel Diameter: <strong>65 mm</strong> (R = 0.0325m)</div>
          <div>Track Gauge Width: <strong>155 mm</strong> (L = 0.155m)</div>
        </div>
      </div>
    </div>
  );
};
