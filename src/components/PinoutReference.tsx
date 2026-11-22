import React, { useState } from 'react';
import { 
  Binary, 
  Search, 
  Filter, 
  Layers, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { GPIO_PINOUT_DATA } from '../data/robotData';

export const PinoutReference: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPin, setSelectedPin] = useState<number | null>(3); // Default select Pin 3 (I2C SDA)

  const pinTypes = [
    { id: 'all', label: 'All 40 Pins', color: 'bg-slate-700 text-slate-200' },
    { id: 'i2c', label: 'I2C Buses (OLED/IMU)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    { id: 'uart', label: 'UART (LiDAR/MCU)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { id: 'gpio', label: 'GPIO / Encoders', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { id: 'pwm', label: 'PWM (Servos/Speed)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    { id: 'spi', label: 'SPI Bus', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
    { id: 'power', label: 'Power (3.3V / 5V)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    { id: 'ground', label: 'GND', color: 'bg-slate-800 text-slate-400 border-slate-700' },
  ];

  const getPinColor = (type: string) => {
    switch (type) {
      case 'power': return 'bg-rose-500 text-white';
      case 'ground': return 'bg-slate-700 text-slate-300';
      case 'i2c': return 'bg-blue-500 text-white';
      case 'uart': return 'bg-amber-500 text-slate-950 font-bold';
      case 'pwm': return 'bg-purple-500 text-white';
      case 'spi': return 'bg-cyan-500 text-slate-950 font-bold';
      case 'gpio': return 'bg-emerald-500 text-slate-950 font-bold';
      default: return 'bg-slate-600 text-slate-200';
    }
  };

  const filteredPins = GPIO_PINOUT_DATA.filter(p => {
    const matchesFilter = filterType === 'all' || p.type === filterType;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pin.toString() === searchQuery;
    return matchesFilter && matchesSearch;
  });

  const activePinData = GPIO_PINOUT_DATA.find(p => p.pin === selectedPin);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Binary className="w-4 h-4" />
            <span>Hardware Interconnect Reference</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Jetson Nano 40-Pin GPIO & Sensor Harness Pinout
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Complete electrical mapping for the Slamtec RPLIDAR UART line, quadrature wheel encoders, TB6612 motor driver PWM, 128x32 I2C OLED, and camera tilt servo.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-slate-950 border border-slate-800 text-emerald-400">
            J41 Expansion Header (3.3V Logic)
          </span>
        </div>
      </div>

      {/* Filter and Protocol Selectors */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {pinTypes.map(pt => (
            <button
              key={pt.id}
              onClick={() => setFilterType(pt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                filterType === pt.id
                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-sm'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              {pt.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pin name, encoder, i2c..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
          />
        </div>
      </div>

      {/* Main Grid: Interactive 40-Pin Physical Diagram + Pin Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 40-Pin Interactive Stride (2 columns of 20 pins) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-200">
              Interactive 40-Pin J41 Header Layout
            </h3>
            <span className="text-[11px] text-slate-500">
              Click any pin to inspect subsystem connections
            </span>
          </div>

          {/* Dual row physical pin representation */}
          <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto py-2">
            {/* Odd Pins: 1, 3, 5, ..., 39 */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right pr-2 mb-2">
                Inner Row (Odd 1-39)
              </div>
              {Array.from({ length: 20 }, (_, i) => i * 2 + 1).map(pinNum => {
                const pin = GPIO_PINOUT_DATA.find(p => p.pin === pinNum)!;
                const isSelected = selectedPin === pinNum;
                const isHighlighted = filterType === 'all' || pin.type === filterType;

                return (
                  <button
                    key={pinNum}
                    onClick={() => setSelectedPin(pinNum)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-950/80 ring-2 ring-emerald-500/40 shadow-md'
                        : isHighlighted
                        ? 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                        : 'border-slate-900/60 bg-slate-950/30 opacity-40'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${getPinColor(pin.type)}`}>
                        {pin.pin}
                      </span>
                      <span className="font-semibold text-slate-200 truncate max-w-[140px] text-left">
                        {pin.name}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase text-slate-500">{pin.type}</span>
                  </button>
                );
              })}
            </div>

            {/* Even Pins: 2, 4, 6, ..., 40 */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-2 mb-2">
                Outer Row (Even 2-40)
              </div>
              {Array.from({ length: 20 }, (_, i) => (i + 1) * 2).map(pinNum => {
                const pin = GPIO_PINOUT_DATA.find(p => p.pin === pinNum)!;
                const isSelected = selectedPin === pinNum;
                const isHighlighted = filterType === 'all' || pin.type === filterType;

                return (
                  <button
                    key={pinNum}
                    onClick={() => setSelectedPin(pinNum)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-950/80 ring-2 ring-emerald-500/40 shadow-md'
                        : isHighlighted
                        ? 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                        : 'border-slate-900/60 bg-slate-950/30 opacity-40'
                    }`}
                  >
                    <span className="text-[10px] uppercase text-slate-500">{pin.type}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-200 truncate max-w-[140px] text-right">
                        {pin.name}
                      </span>
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${getPinColor(pin.type)}`}>
                        {pin.pin}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Pin Deep-Dive & Hardware Connection Info */}
        <div className="space-y-6">
          {activePinData ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow ${getPinColor(activePinData.type)}`}>
                    {activePinData.pin}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{activePinData.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Type: {activePinData.type}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Robot Functionality:
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                  {activePinData.desc}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span>Logic Voltage Level:</span>
                  <strong className="text-slate-200">{activePinData.type === 'power' && activePinData.pin === 2 ? '5.0V DC' : '3.3V LVCMOS'}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span>Pull-up Resistor:</span>
                  <strong className="text-slate-200">{activePinData.type === 'i2c' ? '1.8kΩ On-board' : 'Software Pull-up/down'}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span>Connected Device:</span>
                  <strong className="text-emerald-400">
                    {activePinData.name.includes('I2C_2') ? '0.91" OLED Screen (0x3C)' :
                     activePinData.name.includes('I2C_1') ? 'MPU6050 6-DoF IMU (0x68)' :
                     activePinData.name.includes('UART_2') ? 'STM32 Motor MCU / RPLIDAR' :
                     activePinData.name.includes('GPIO 50') || activePinData.name.includes('GPIO 79') ? 'Left Motor Hall Encoder' :
                     activePinData.name.includes('GPIO 14') || activePinData.name.includes('GPIO 194') ? 'Right Motor Hall Encoder' :
                     activePinData.name.includes('PWM 0') ? 'Camera Pitch Servo (MG90S)' : 'Internal Expansion Bus'}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
              Select a pin on the left to see hardware specifications.
            </div>
          )}

          {/* Subsystem Harness Quick Reference */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Subsystem Interconnect Wiring</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="font-bold text-slate-200 flex justify-between">
                  <span>Slamtec RPLIDAR A1</span>
                  <span className="text-amber-400 font-mono">115200 8N1</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Connected via CP2102 USB-to-UART bridge on USB port 1 (/dev/ttyUSB0). Motor speed controlled via PWM pin 7.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="font-bold text-slate-200 flex justify-between">
                  <span>Sony IMX219 Camera</span>
                  <span className="text-emerald-400 font-mono">MIPI CSI-2</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  15-pin 1.0mm FFC ribbon connected to CAM0 interface. I2C control at address 0x10.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="font-bold text-slate-200 flex justify-between">
                  <span>Dual DC Motors & Encoders</span>
                  <span className="text-cyan-400 font-mono">330 Ticks/Rev</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Quadrature channels A/B wired directly to Jetson GPIO interrupt lines for hardware velocity feedback.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
