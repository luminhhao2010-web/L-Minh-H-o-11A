import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  Sliders, 
  FileCode, 
  Layers, 
  Cpu, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { ROS_CODE_SNIPPETS } from '../data/robotData';

export const RosCodeHub: React.FC = () => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(ROS_CODE_SNIPPETS[0].id);
  const [copied, setCopied] = useState(false);

  // Tunable parameters for interactive code modification
  const [wheelDiameterMm, setWheelDiameterMm] = useState(65);
  const [trackWidthMm, setTrackWidthMm] = useState(155);
  const [gearRatio, setGearRatio] = useState(30);
  const [encoderPpr, setEncoderPpr] = useState(11);

  const selectedSnippet = ROS_CODE_SNIPPETS.find(s => s.id === selectedSnippetId)!;

  // Dynamically update code with user's kinematic tuning
  let displayCode = selectedSnippet.code;
  if (selectedSnippet.id === 'ros2-diff-drive') {
    const wheelRadiusM = (wheelDiameterMm / 2000).toFixed(4);
    const trackWidthM = (trackWidthMm / 1000).toFixed(4);
    const ticksPerRev = gearRatio * encoderPpr;

    displayCode = displayCode
      .replace(/wheel_radius', [0-9.]+\)/, `wheel_radius', ${wheelRadiusM})`)
      .replace(/wheel_separation', [0-9.]+\)/, `wheel_separation', ${trackWidthM})`)
      .replace(/ticks_per_rev', [0-9.]+\)/, `ticks_per_rev', ${ticksPerRev})`);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Code2 className="w-4 h-4" />
            <span>ROS 2 Humble / ROS 1 Noetic Ecosystem</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            ROS 2 Launch Files, Nodes & Kinematic Driver Suite
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Plug-and-play Python nodes, GStreamer CSI pipelines, and Cartographer SLAM configurations customized for this Jetson Nano + RPLIDAR robot hardware.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-slate-950 border border-slate-800 text-cyan-400">
            ros2 launch ready
          </span>
        </div>
      </div>

      {/* Main Container: File Selector Tabs + Kinematics Tuner + Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Snippets Selector & Kinematics Calculator */}
        <div className="space-y-6">
          {/* File Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>Available ROS Modules</span>
            </h3>

            <div className="space-y-1.5">
              {ROS_CODE_SNIPPETS.map(snippet => (
                <button
                  key={snippet.id}
                  onClick={() => setSelectedSnippetId(snippet.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    selectedSnippetId === snippet.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{snippet.title}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">{snippet.filename}</div>
                  <div className="text-[10px] text-emerald-400/80 mt-1">{snippet.framework}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Kinematics Calculator (Tunable for this robot) */}
          {selectedSnippetId === 'ros2-diff-drive' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Kinematic Tuner</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Adjusting these values instantly updates the parameters in the controller code!
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Wheel Diameter:</span>
                    <span className="font-mono text-emerald-400 font-bold">{wheelDiameterMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={wheelDiameterMm}
                    onChange={e => setWheelDiameterMm(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Track Gauge (Separation):</span>
                    <span className="font-mono text-emerald-400 font-bold">{trackWidthMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="220"
                    value={trackWidthMm}
                    onChange={e => setTrackWidthMm(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Gearbox Reduction:</span>
                    <span className="font-mono text-emerald-400 font-bold">1:{gearRatio}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={gearRatio}
                    onChange={e => setGearRatio(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                  <span>Total Ticks / Rev:</span>
                  <span className="text-cyan-400 font-bold">{gearRatio * encoderPpr} ticks</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Code Viewer (3 columns) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-emerald-400">{selectedSnippet.filename}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {selectedSnippet.framework}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedSnippet.description}</p>
            </div>

            <button
              onClick={handleCopy}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                copied
                  ? 'bg-emerald-600 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Syntax Highlighted Code Area */}
          <div className="p-4 bg-slate-950 overflow-x-auto font-mono text-xs text-slate-300 leading-relaxed max-h-[580px] no-scrollbar">
            <pre className="text-slate-200 whitespace-pre">
              <code>{displayCode}</code>
            </pre>
          </div>

          {/* Command Prompt Execution Hint */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-400 font-mono">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>ros2 launch jetson_robot {selectedSnippet.filename}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Tested on Ubuntu 20.04 / 22.04 LTS (JetPack 4.6.1 / 5.1)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
