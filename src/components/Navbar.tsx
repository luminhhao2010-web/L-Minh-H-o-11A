import React from 'react';
import { 
  Radar, 
  Gamepad2, 
  Camera, 
  Images, 
  Cpu, 
  Binary, 
  Code2, 
  Battery, 
  Wifi, 
  ExternalLink,
  Bot
} from 'lucide-react';
import { GOOGLE_DRIVE_FOLDER_URL } from '../data/robotData';

export type ActiveTab = 'slam' | 'teleop' | 'vision' | 'gallery' | 'telemetry' | 'pinouts' | 'ros';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  batteryVoltage: number;
  isEstopActive: boolean;
  onOpenDriveModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  batteryVoltage,
  isEstopActive,
  onOpenDriveModal,
}) => {
  const batteryPct = Math.min(100, Math.max(0, Math.round(((batteryVoltage - 10.5) / (12.6 - 10.5)) * 100)));

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-emerald-950/60 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-100 tracking-wide text-base">JETSON ROS ROBOT</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
                  ONLINE
                </span>
                {isEstopActive && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-950/90 text-rose-300 border border-rose-500 animate-bounce">
                    E-STOP ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                NVIDIA Jetson Nano • Slamtec RPLIDAR A1 • 2WD Diff Drive
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('slam')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'slam'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Radar className="w-4 h-4" />
              <span>LiDAR & SLAM</span>
            </button>

            <button
              onClick={() => setActiveTab('teleop')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'teleop'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Teleoperation</span>
            </button>

            <button
              onClick={() => setActiveTab('vision')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'vision'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Vision HUD</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'gallery'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Images className="w-4 h-4" />
              <span>Hardware (29)</span>
            </button>

            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'telemetry'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('pinouts')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'pinouts'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Binary className="w-4 h-4" />
              <span>Pinouts</span>
            </button>

            <button
              onClick={() => setActiveTab('ros')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'ros'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>ROS Hub</span>
            </button>
          </nav>

          {/* Quick Metrics & Drive link */}
          <div className="flex items-center space-x-3">
            {/* Battery Indicator */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Battery className={`w-4 h-4 ${batteryPct > 40 ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="font-mono font-medium">{batteryVoltage.toFixed(2)}V</span>
              <span className="text-slate-500 hidden sm:inline">({batteryPct}%)</span>
            </div>

            {/* Wi-Fi RSSI */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span className="font-mono">-58dBm</span>
            </div>

            {/* Google Drive Folder button */}
            <button
              onClick={onOpenDriveModal}
              title="View Google Drive source assets"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition-colors shadow-sm"
            >
              <Images className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Drive Folder</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          <button
            onClick={() => setActiveTab('slam')}
            className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'slam' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            LiDAR & SLAM
          </button>
          <button
            onClick={() => setActiveTab('teleop')}
            className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'teleop' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            Teleoperation
          </button>
          <button
            onClick={() => setActiveTab('vision')}
            className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'vision' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            Vision HUD
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'gallery' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            Gallery (29)
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'telemetry' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            Telemetry
          </button>
          <button
            onClick={() => setActiveTab('pinouts')}
            className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'pinouts' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            Pinouts
          </button>
          <button
            onClick={() => setActiveTab('ros')}
            className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
              activeTab === 'ros' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            ROS Hub
          </button>
        </div>
      </div>
    </header>
  );
};
