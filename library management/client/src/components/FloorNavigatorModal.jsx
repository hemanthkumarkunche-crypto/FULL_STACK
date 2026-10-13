import React, { useState, useEffect } from 'react';
import {
  X, MapPin, Navigation, Compass, Layers, Info, Check, Copy,
  ArrowRight, ShieldCheck, Box, BookOpen, Sparkles
} from 'lucide-react';

export default function FloorNavigatorModal({
  isOpen,
  onClose,
  book
}) {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [copied, setCopied] = useState(false);
  const [animationStep, setAnimationStep] = useState(1);

  // Sync selected floor with book's floor when opened
  useEffect(() => {
    if (book?.shelfLocation?.floor) {
      setSelectedFloor(book.shelfLocation.floor);
    } else {
      setSelectedFloor(1);
    }
  }, [book, isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Periodic pulse/breadcrumb animation ticker
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev % 4) + 1);
    }, 900);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !book) return null;

  const shelfLoc = book.shelfLocation || {
    floor: 1,
    wing: 'Wing A (Computer Science)',
    aisle: 'A-1',
    rack: 'R-01',
    shelfNumber: 'S-1',
    x: 180,
    y: 190,
    capacity: 50,
    occupied: 40,
    neighbors: ['QA76.6 (Standard Algorithms)', 'QA76.7 (Systems Programming)']
  };

  const currentFloor = selectedFloor;
  const isTargetFloor = currentFloor === (shelfLoc.floor || 1);

  // Target rack coordinates on the SVG canvas (1000 x 540)
  const targetX = shelfLoc.x || 230;
  const targetY = shelfLoc.y || 190;
  const entranceX = 120;
  const entranceY = 480;
  const helpDeskX = 220;
  const helpDeskY = 440;

  // Compute animated breadcrumb path points from Entrance -> Help Desk -> Central Corridor -> Target Rack
  const corridorY = 330;
  const pathD = `M ${entranceX} ${entranceY} L ${helpDeskX} ${helpDeskY} L ${helpDeskX} ${corridorY} L ${targetX} ${corridorY} L ${targetX} ${targetY + 28}`;

  const copyCoordinates = () => {
    const text = `Floor ${shelfLoc.floor || 1}, ${shelfLoc.wing || 'Wing A'}, Aisle ${shelfLoc.aisle}, Rack ${shelfLoc.rack}, Shelf ${shelfLoc.shelfNumber} (Call Number: ${book.callNumber || 'N/A'})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const occupancyPercent = Math.round(((shelfLoc.occupied || 38) / (shelfLoc.capacity || 50)) * 100);

  // Layout racks in grid for current floor visual
  const racksFloor1 = [
    { id: 'R-01', aisle: 'A-1', x: 120, y: 190, wing: 'Wing A' },
    { id: 'R-02', aisle: 'A-1', x: 120, y: 120, wing: 'Wing A' },
    { id: 'R-03', aisle: 'A-2', x: 230, y: 120, wing: 'Wing A' },
    { id: 'R-01', aisle: 'A-2', x: 230, y: 190, wing: 'Wing A' },
    { id: 'R-04', aisle: 'A-3', x: 340, y: 190, wing: 'Wing A' },
    { id: 'R-05', aisle: 'A-3', x: 340, y: 120, wing: 'Wing A' },
    { id: 'R-05', aisle: 'B-1', x: 480, y: 190, wing: 'Wing B' },
    { id: 'R-06', aisle: 'B-1', x: 480, y: 120, wing: 'Wing B' },
    { id: 'R-01', aisle: 'B-3', x: 580, y: 190, wing: 'Wing B' },
    { id: 'R-02', aisle: 'B-3', x: 580, y: 120, wing: 'Wing B' },
    { id: 'R-02', aisle: 'M-1', x: 710, y: 120, wing: 'Wing M' },
    { id: 'R-03', aisle: 'M-2', x: 710, y: 190, wing: 'Wing M' },
  ];

  const racksFloor2 = [
    { id: 'R-03', aisle: 'A-4', x: 320, y: 290, wing: 'Wing A' },
    { id: 'R-06', aisle: 'A-4', x: 320, y: 360, wing: 'Wing A' },
    { id: 'R-02', aisle: 'A-5', x: 440, y: 290, wing: 'Wing A' },
    { id: 'R-03', aisle: 'A-5', x: 440, y: 360, wing: 'Wing A' },
    { id: 'R-04', aisle: 'E-2', x: 820, y: 190, wing: 'Wing E' },
    { id: 'R-02', aisle: 'E-4', x: 820, y: 290, wing: 'Wing E' },
    { id: 'R-05', aisle: 'E-4', x: 820, y: 360, wing: 'Wing E' },
  ];

  const currentRacks = currentFloor === 1 ? racksFloor1 : racksFloor2;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Compass size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Interactive 2D Floor & Rack Navigator
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Find My Shelf
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Guiding you to <strong className="text-slate-200">"{book.title}"</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Floor Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedFloor(1)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  selectedFloor === 1
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Floor 1 (Ground)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFloor(2)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  selectedFloor === 2
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Floor 2 (Upper Stacks)
              </button>
            </div>

            <button
              type="button"
              id="close-floor-nav-modal-btn"
              onClick={onClose}
              aria-label="Close Floor Navigator"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Split Map + Side Details */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left: 2D Interactive SVG Architectural Canvas */}
          <div className="lg:col-span-8 p-4 md:p-6 flex flex-col bg-slate-950/60 border-r border-slate-800">
            {/* Floor Indicator Notice */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">
                  Viewing: Floor {currentFloor} • {currentFloor === 1 ? 'Central Stacks & Circulation' : 'Specialized Engineering Studio'}
                </span>
              </div>
              {!isTargetFloor && (
                <div className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded-md text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                  <Info size={13} />
                  Book is located on Floor {shelfLoc.floor || 1}. Switch floor to view route!
                </div>
              )}
            </div>

            {/* SVG Architectural Floor Plan */}
            <div className="relative flex-1 bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-2 min-h-[360px]">
              {/* Subtle Grid Background */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.4) 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />

              <svg
                viewBox="0 0 960 540"
                className="w-full h-full max-h-[460px] select-none"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Glowing Target Gradient */}
                  <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </radialGradient>

                  {/* Linear Glow for Walk Path */}
                  <linearGradient id="routeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>

                  <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Outer Library Perimeter Wall */}
                <rect
                  x="40"
                  y="40"
                  width="880"
                  height="460"
                  rx="16"
                  fill="#090d16"
                  stroke="#1e293b"
                  strokeWidth="3"
                />

                {/* Zone Partitions & Wing Headers */}
                <text x="70" y="75" fill="#475569" fontSize="13" fontWeight="700" letterSpacing="0.1em">
                  {currentFloor === 1 ? 'WING A (COMPUTER SCIENCE)' : 'WING A (SOFTWARE STUDIO)'}
                </text>
                <text x="440" y="75" fill="#475569" fontSize="13" fontWeight="700" letterSpacing="0.1em">
                  {currentFloor === 1 ? 'WING B (SYSTEMS & NETWORKS)' : 'WING B (STUDY COMMONS)'}
                </text>
                <text x="710" y="75" fill="#475569" fontSize="13" fontWeight="700" letterSpacing="0.1em">
                  {currentFloor === 1 ? 'WING M (MATHEMATICS & PHYSICS)' : 'WING E (ELECTRONICS & HARDWARE)'}
                </text>

                {/* Divider lines between wings */}
                <line x1="410" y1="50" x2="410" y2="430" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1.5" />
                <line x1="680" y1="50" x2="680" y2="430" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1.5" />

                {/* Main Entrance / Turnstiles (Bottom Left) */}
                <rect x="70" y="450" width="100" height="40" rx="8" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="1.5" />
                <text x="120" y="475" fill="#c7d2fe" fontSize="11" fontWeight="700" textAnchor="middle">
                  🚪 MAIN ENTRANCE
                </text>

                {/* Circulation & Help Desk */}
                <rect x="200" y="420" width="130" height="40" rx="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
                <text x="265" y="445" fill="#67e8f9" fontSize="10" fontWeight="700" textAnchor="middle">
                  ℹ️ CIRCULATION DESK
                </text>

                {/* Central Reading Tables / Study Carrels */}
                <rect x="440" y="380" width="200" height="35" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="540" y="402" fill="#64748b" fontSize="10" fontWeight="600" textAnchor="middle">
                  Silent Reading Commons (Tables 1–12)
                </text>

                {/* Escalators / Stairs to Upper Floor */}
                <rect x="800" y="430" width="90" height="45" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="845" y="458" fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="middle">
                  🪜 STAIRS / LIFT
                </text>

                {/* Static Rack Bays */}
                {currentRacks.map((rack, idx) => {
                  const isCurrentTarget = isTargetFloor &&
                    rack.aisle === shelfLoc.aisle &&
                    rack.id === shelfLoc.rack;

                  return (
                    <g key={idx} className="transition-all duration-300">
                      {/* Rack Body */}
                      <rect
                        x={rack.x - 35}
                        y={rack.y - 18}
                        width="70"
                        height="36"
                        rx="5"
                        fill={isCurrentTarget ? '#1e1b4b' : '#0f172a'}
                        stroke={isCurrentTarget ? '#06b6d4' : '#1e293b'}
                        strokeWidth={isCurrentTarget ? 2 : 1}
                      />
                      {/* Shelf interior slots */}
                      <line x1={rack.x - 30} y1={rack.y} x2={rack.x + 30} y2={rack.y} stroke={isCurrentTarget ? '#06b6d4' : '#1e293b'} strokeWidth="1" />
                      {/* Rack Label */}
                      <text
                        x={rack.x}
                        y={rack.y - 4}
                        fill={isCurrentTarget ? '#38bdf8' : '#64748b'}
                        fontSize="9"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {rack.aisle}
                      </text>
                      <text
                        x={rack.x}
                        y={rack.y + 11}
                        fill={isCurrentTarget ? '#f8fafc' : '#94a3b8'}
                        fontSize="8"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {rack.id}
                      </text>
                    </g>
                  );
                })}

                {/* Walking Route Breadcrumbs (Active when viewing the book's target floor) */}
                {isTargetFloor && (
                  <g filter="url(#glowFilter)">
                    {/* Animated Walking Path Polyline */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#routeGrad)"
                      strokeWidth="3.5"
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="24"
                        to="0"
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                    </path>

                    {/* Step Breadcrumb Dots */}
                    <circle cx={entranceX} cy={entranceY} r="5" fill="#10b981" />
                    <circle cx={helpDeskX} cy={helpDeskY} r="4" fill="#06b6d4" />
                    <circle cx={helpDeskX} cy={corridorY} r="4" fill="#06b6d4" />
                    <circle cx={targetX} cy={corridorY} r="4" fill="#818cf8" />
                  </g>
                )}

                {/* Target Rack Highlight & Pulsing Halo */}
                {isTargetFloor && (
                  <g transform={`translate(${targetX}, ${targetY})`}>
                    {/* Outer pulse ring 1 */}
                    <circle cx="0" cy="0" r="46" fill="url(#targetGlow)">
                      <animate attributeName="r" values="36;54;36" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.4s" repeatCount="indefinite" />
                    </circle>

                    {/* Outer pulse ring 2 */}
                    <circle cx="0" cy="0" r="30" fill="none" stroke="#06b6d4" strokeWidth="1.5">
                      <animate attributeName="r" values="24;42;24" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite" />
                    </circle>

                    {/* Center Pin Marker */}
                    <circle cx="0" cy="0" r="12" fill="#06b6d4" stroke="#ffffff" strokeWidth="2.5" />
                    <text x="0" y="3.5" fill="#ffffff" fontSize="9" fontWeight="800" textAnchor="middle">
                      ★
                    </text>

                    {/* Callout Tooltip Banner */}
                    <g transform="translate(0, -38)">
                      <rect x="-65" y="-18" width="130" height="24" rx="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
                      <text x="0" y="-2" fill="#38bdf8" fontSize="9.5" fontWeight="700" textAnchor="middle">
                        📍 SHELF: {shelfLoc.aisle} • {shelfLoc.rack}
                      </text>
                    </g>
                  </g>
                )}
              </svg>
            </div>

            {/* Turn-by-Turn Walk Guide */}
            <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Navigation size={15} className="text-cyan-400" />
                <span>
                  <strong>Walking Route:</strong> Enter Ground Floor Turnstiles → Pass Circulation Desk → Follow Aisle {shelfLoc.aisle} Corridor → Locate Shelf {shelfLoc.rack} ({shelfLoc.shelfNumber})
                </span>
              </div>
              <div className="text-slate-400 font-mono text-[11px] shrink-0 ml-2">
                Approx. 35 meters (45s walk)
              </div>
            </div>
          </div>

          {/* Right: Shelf Details & Inventory Pane */}
          <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-slate-900">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Box size={14} /> Shelf Hardware Telemetry
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ONLINE & VERIFIED
                </span>
              </div>

              {/* Exact Location Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4">
                <div className="text-xs text-slate-400 mb-1">Target Coordinates</div>
                <div className="text-lg font-extrabold text-white flex items-center gap-2">
                  <MapPin size={18} className="text-cyan-400" />
                  {shelfLoc.aisle} • {shelfLoc.rack} • {shelfLoc.shelfNumber}
                </div>
                <div className="text-xs text-cyan-300 mt-1 font-medium">
                  {shelfLoc.wing} • Floor {shelfLoc.floor || 1}
                </div>

                {/* Call Number */}
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Library of Congress Call No.</div>
                    <div className="text-xs font-mono font-bold text-indigo-300">{book.callNumber || 'QA76.6 .C66 2009'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={copyCoordinates}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition"
                    title="Copy Shelf Coordinates"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Rack Capacity & Occupancy Gauge */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Rack Capacity Load</span>
                  <span className="font-bold text-white">{shelfLoc.occupied || 38} / {shelfLoc.capacity || 50} Volumes</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                  <span>{occupancyPercent}% Occupied</span>
                  <span className="text-emerald-400 font-medium">{(shelfLoc.capacity || 50) - (shelfLoc.occupied || 38)} Open Slots</span>
                </div>
              </div>

              {/* Neighboring Shelf Titles (Call Numbers) */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen size={13} className="text-indigo-400" /> Neighboring Books on This Rack
                </div>
                <div className="space-y-2 text-xs">
                  {(shelfLoc.neighbors || ['QA76.6 (Standard Algorithms)', 'QA76.7 (Systems Programming)']).map((item, idx) => (
                    <div key={idx} className="p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={copyCoordinates}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Coordinates Copied to Clipboard!' : 'Copy Shelf Coordinate Code'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 px-4 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
