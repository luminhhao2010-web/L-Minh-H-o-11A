/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { LidarSlamCanvas } from './components/LidarSlamCanvas';
import { TeleopCockpit } from './components/TeleopCockpit';
import { VisionHud } from './components/VisionHud';
import { GalleryInspector } from './components/GalleryInspector';
import { TelemetryDashboard } from './components/TelemetryDashboard';
import { PinoutReference } from './components/PinoutReference';
import { RosCodeHub } from './components/RosCodeHub';
import { DriveFolderModal } from './components/DriveFolderModal';
import { GOOGLE_DRIVE_FOLDER_URL, ROBOT_SPECIFICATIONS } from './data/robotData';
import { 
  Radar, 
  Gamepad2, 
  Camera, 
  Images, 
  Cpu, 
  Binary, 
  Code2, 
  ExternalLink,
  ShieldAlert,
  Bot
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('slam');
  const [robotPose, setRobotPose] = useState({ x: 0, y: 0, theta: 0 });
  const [linearVel, setLinearVel] = useState<number>(0);
  const [angularVel, setAngularVel] = useState<number>(0);
  const [batteryVoltage, setBatteryVoltage] = useState<number>(12.42);
  const [isEstopActive, setIsEstopActive] = useState<boolean>(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);

  const handleResetPose = () => {
    setRobotPose({ x: 0, y: 0, theta: 0 });
    setLinearVel(0);
    setAngularVel(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        batteryVoltage={batteryVoltage}
        isEstopActive={isEstopActive}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Tab View */}
        {activeTab === 'slam' && (
          <div className="space-y-6">
            <LidarSlamCanvas
              robotPose={robotPose}
              setRobotPose={setRobotPose}
              linearVel={linearVel}
              angularVel={angularVel}
              isEstopActive={isEstopActive}
            />
            {/* Quick teleop cockpit beneath SLAM for simultaneous drive & mapping */}
            <TeleopCockpit
              linearVel={linearVel}
              setLinearVel={setLinearVel}
              angularVel={angularVel}
              setAngularVel={setAngularVel}
              isEstopActive={isEstopActive}
              setIsEstopActive={setIsEstopActive}
              onResetPose={handleResetPose}
            />
          </div>
        )}

        {activeTab === 'teleop' && (
          <TeleopCockpit
            linearVel={linearVel}
            setLinearVel={setLinearVel}
            angularVel={angularVel}
            setAngularVel={setAngularVel}
            isEstopActive={isEstopActive}
            setIsEstopActive={setIsEstopActive}
            onResetPose={handleResetPose}
          />
        )}

        {activeTab === 'vision' && (
          <VisionHud
            linearVel={linearVel}
            angularVel={angularVel}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryInspector />
        )}

        {activeTab === 'telemetry' && (
          <TelemetryDashboard
            batteryVoltage={batteryVoltage}
            linearVel={linearVel}
            angularVel={angularVel}
          />
        )}

        {activeTab === 'pinouts' && (
          <PinoutReference />
        )}

        {activeTab === 'ros' && (
          <RosCodeHub />
        )}
      </main>

      {/* Footer / System Status Ticker */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-mono">
              Jetson Nano Rev2 (ARM64) • Ubuntu 20.04 LTS • ROS 2 Humble
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="hover:text-emerald-400 transition-colors flex items-center space-x-1"
            >
              <Images className="w-3.5 h-3.5" />
              <span>Drive Repository (29 Photos)</span>
            </button>
            <span>•</span>
            <a
              href={GOOGLE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center space-x-1"
            >
              <span>Google Drive Folder</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Google Drive Folder Source Modal */}
      <DriveFolderModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onSelectTab={setActiveTab}
      />
    </div>
  );
}
