import React from 'react';
import { 
  FolderOpen, 
  ExternalLink, 
  Images, 
  CheckCircle2, 
  ShieldCheck, 
  HardDrive, 
  Share2, 
  DownloadCloud
} from 'lucide-react';
import { GOOGLE_DRIVE_FOLDER_URL, ROBOT_IMAGES } from '../data/robotData';

interface DriveFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: any) => void;
}

export const DriveFolderModal: React.FC<DriveFolderModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Google Drive Source Repository</h3>
              <p className="text-xs text-slate-400">Folder ID: 1Be6yD3VVVJlAumxnnH9KQtoHKgFBjut5</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 text-xl font-bold p-1"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Repository Folder:</span>
              <span className="font-bold text-emerald-400 font-mono">ROBOTICS</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Cataloged Assets:</span>
              <span className="font-bold text-slate-200">29 High-Resolution Photos</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Subsystems Covered:</span>
              <span className="text-slate-300">LiDAR, Jetson Nano, Motors, Wheels, Camera</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">CDN Delivery:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Google UserContent High-Res
              </span>
            </div>
          </div>

          <p className="text-slate-400 leading-relaxed">
            All 29 photographic assets from this Google Drive folder are indexed in this application with interactive hardware hotspots, technical component callouts, and zoom capability.
          </p>

          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-start space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Google Workspace Integration Ready:</strong> With permission from the app's users, you can also connect and sync live robot documentation or telemetry logs back into Google Drive.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              onSelectTab('gallery');
            }}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center space-x-2 border border-slate-700"
          >
            <Images className="w-4 h-4" />
            <span>Browse 29 Photos in Gallery</span>
          </button>

          <a
            href={GOOGLE_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>Open in Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
