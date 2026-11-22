import React, { useState, useEffect } from 'react';
import { 
  Images, 
  Search, 
  Filter, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Info, 
  Layers, 
  Maximize2,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { ROBOT_IMAGES, DriveImage, GOOGLE_DRIVE_FOLDER_URL } from '../data/robotData';

export const GalleryInspector: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeImage, setActiveImage] = useState<DriveImage | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<{ title: string; details: string } | null>(null);

  // Filter images
  const filteredImages = ROBOT_IMAGES.filter(img => {
    const matchesCat = selectedCategory === 'all' || img.category === selectedCategory;
    const matchesSearch = 
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Photos', count: ROBOT_IMAGES.length },
    { id: 'lidar', label: 'LiDAR & Sensors', count: ROBOT_IMAGES.filter(i => i.category === 'lidar').length },
    { id: 'jetson', label: 'Jetson Nano Core', count: ROBOT_IMAGES.filter(i => i.category === 'jetson').length },
    { id: 'chassis', label: 'Chassis & Drive', count: ROBOT_IMAGES.filter(i => i.category === 'chassis').length },
    { id: 'vision', label: 'Vision & Camera', count: ROBOT_IMAGES.filter(i => i.category === 'vision').length },
    { id: 'power', label: 'Power & Antennas', count: ROBOT_IMAGES.filter(i => i.category === 'power').length },
  ];

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeImage) return;
      if (e.key === 'Escape') {
        setActiveImage(null);
      } else if (e.key === 'ArrowRight') {
        const currIdx = filteredImages.findIndex(i => i.id === activeImage.id);
        if (currIdx < filteredImages.length - 1) {
          setActiveImage(filteredImages[currIdx + 1]);
          setZoomLevel(1);
          setSelectedHotspot(null);
        }
      } else if (e.key === 'ArrowLeft') {
        const currIdx = filteredImages.findIndex(i => i.id === activeImage.id);
        if (currIdx > 0) {
          setActiveImage(filteredImages[currIdx - 1]);
          setZoomLevel(1);
          setSelectedHotspot(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImage, filteredImages]);

  const handleNext = () => {
    if (!activeImage) return;
    const currIdx = filteredImages.findIndex(i => i.id === activeImage.id);
    if (currIdx < filteredImages.length - 1) {
      setActiveImage(filteredImages[currIdx + 1]);
      setZoomLevel(1);
      setSelectedHotspot(null);
    }
  };

  const handlePrev = () => {
    if (!activeImage) return;
    const currIdx = filteredImages.findIndex(i => i.id === activeImage.id);
    if (currIdx > 0) {
      setActiveImage(filteredImages[currIdx - 1]);
      setZoomLevel(1);
      setSelectedHotspot(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Folder link */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <FolderOpen className="w-4 h-4" />
            <span>Google Drive Hardware Repository (29 Items)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Physical Robot Hardware Teardown & Inspection Gallery
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            High-resolution photographic documentation of the assembled Jetson Nano + RPLIDAR A1 autonomous mobile robot platform. Click any photo to zoom, inspect subsystem components, and view interactive hotspot annotations.
          </p>
        </div>

        <a
          href={GOOGLE_DRIVE_FOLDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors shadow-lg self-start md:self-center"
        >
          <Images className="w-4 h-4" />
          <span>Open Drive Folder</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search parts, motors, lidar..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
          />
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredImages.map((img, idx) => (
          <div
            key={img.id}
            onClick={() => {
              setActiveImage(img);
              setZoomLevel(1);
              setSelectedHotspot(null);
            }}
            className="group relative bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-all hover:-translate-y-1 hover:shadow-emerald-950/20"
          >
            {/* Image Thumbnail */}
            <div className="aspect-[4/5] bg-slate-950 overflow-hidden relative">
              <img
                src={img.thumbnailUrl}
                alt={img.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

              {/* Category Badge */}
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                  {img.category}
                </span>
              </div>

              {/* Hotspots indicator */}
              {img.hotspots && (
                <div className="absolute top-2.5 right-2.5">
                  <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{img.hotspots.length} Points</span>
                  </span>
                </div>
              )}

              {/* Hover overlay hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-[2px]">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs shadow-xl">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Inspect Hardware</span>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="p-3.5">
              <h3 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-1">
                {img.title}
              </h3>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                {img.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <p className="text-sm text-slate-400">No hardware photos match the search criteria.</p>
        </div>
      )}

      {/* High-Resolution Inspection Modal */}
      {activeImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-6xl max-h-[96vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            {/* Left: Image Viewport with Pan/Zoom & Hotspots */}
            <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[380px] md:min-h-[600px]">
              {/* Zoom Container */}
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                }}
                className="relative max-w-full max-h-[85vh] flex items-center justify-center"
              >
                <img
                  src={activeImage.url}
                  alt={activeImage.title}
                  className="max-h-[80vh] w-auto object-contain select-none shadow-2xl rounded-xl"
                />

                {/* Hotspot Overlays */}
                {showHotspots && activeImage.hotspots && activeImage.hotspots.map((spot, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedHotspot(spot)}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                  >
                    <span className="relative flex h-6 w-6 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950 shadow-md" />
                    </span>
                    {/* Tooltip on hover */}
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-slate-900 text-slate-100 text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap border border-slate-700 pointer-events-none">
                      {spot.title}
                    </span>
                  </button>
                ))}
              </div>

              {/* Viewport Control Bar */}
              <div className="absolute top-4 left-4 flex items-center space-x-1 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-lg">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3.5))}
                  title="Zoom in"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))}
                  title="Zoom out"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  title="Reset zoom"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors text-xs font-mono px-2"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                {activeImage.hotspots && (
                  <button
                    onClick={() => setShowHotspots(!showHotspots)}
                    title={showHotspots ? 'Hide technical annotations' : 'Show technical annotations'}
                    className={`p-1.5 rounded-lg text-xs font-medium px-2 transition-colors ${
                      showHotspots
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Hotspots
                  </button>
                )}
              </div>

              {/* Next & Previous Buttons */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors shadow-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors shadow-xl"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Technical Inspector Sidebar */}
            <div className="w-full md:w-96 bg-slate-900 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 overflow-y-auto max-h-[40vh] md:max-h-[85vh]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    {activeImage.category} Subsystem
                  </span>
                  <button
                    onClick={() => setActiveImage(null)}
                    className="text-slate-400 hover:text-slate-100 p-1 rounded-lg"
                  >
                    &times;
                  </button>
                </div>

                <div className="my-4">
                  <h3 className="text-base font-bold text-slate-100">{activeImage.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {activeImage.description}
                  </p>
                </div>

                {/* Hotspot details card if selected */}
                {selectedHotspot && (
                  <div className="my-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 animate-fadeIn">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-300 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{selectedHotspot.title}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedHotspot.details}
                    </p>
                  </div>
                )}

                {/* Subsystem Technical Notes */}
                <div className="space-y-3 mt-6">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hardware Specifications</span>
                  </h4>
                  <div className="text-xs space-y-2 text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 font-mono">
                    <div className="flex justify-between">
                      <span>Drive Architecture:</span>
                      <strong className="text-slate-200">2WD Diff + 2 Casters</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Compute SoC:</span>
                      <strong className="text-slate-200">Jetson Nano Rev2</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>LiDAR Sensor:</span>
                      <strong className="text-slate-200">RPLIDAR A1 (12m)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Camera Sensor:</span>
                      <strong className="text-slate-200">Sony IMX219 (160° FOV)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Power Bus:</span>
                      <strong className="text-slate-200">12.6V 3S Li-Po</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <a
                  href={`https://drive.google.com/file/d/${activeImage.id}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Original in Google Drive</span>
                </a>
                <a
                  href={activeImage.url}
                  download={activeImage.name}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-colors shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full Resolution</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
