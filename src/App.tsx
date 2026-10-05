/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Settings, Info, RefreshCw, X, Rocket, Globe, Sliders, Check, Download, Smartphone } from 'lucide-react';
import { SpaceCanvas } from './components/SpaceCanvas';
import { ZeroSpaceCanvas } from './components/ZeroSpaceCanvas';
import { CelestialDossier } from './components/CelestialDossier';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<'solar' | 'zero'>('solar');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Celestial navigation and detail focus state
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);

  // Simulation controls state
  const [showOrbits, setShowOrbits] = useState(true);
  const [showAsteroids, setShowAsteroids] = useState(true);
  const [showKuiperBelt, setShowKuiperBelt] = useState(true);
  const [showComet, setShowComet] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [reduceSunGlare, setReduceSunGlare] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [rotationSpeed, setRotationSpeed] = useState(2);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResetView = () => {
    setSelectedBodyId(null);
    window.dispatchEvent(new CustomEvent('reset-space-view'));
    setIsMenuOpen(false);
  };

  return (
    <main className="w-screen h-screen relative bg-[#010403] select-none overflow-hidden">
      <AnimatePresence mode="wait">
        {currentMode === 'solar' ? (
          <motion.div 
            key="solar" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0"
          >
            <SpaceCanvas 
              showOrbits={showOrbits} 
              showAsteroids={showAsteroids} 
              showKuiperBelt={showKuiperBelt}
              showComet={showComet}
              showLabels={showLabels}
              reduceSunGlare={reduceSunGlare}
              simSpeed={simSpeed} 
              rotationSpeed={rotationSpeed}
              selectedBodyId={selectedBodyId}
              onSelectBody={(id) => setSelectedBodyId(id)}
            />
          </motion.div>
        ) : (
          <motion.div 
            key="zero" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0"
          >
            <ZeroSpaceCanvas />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Astronomical Dossier Drawer on the Right */}
      <CelestialDossier
        selectedId={selectedBodyId}
        onClose={() => setSelectedBodyId(null)}
        onSelect={(id) => setSelectedBodyId(id)}
      />
      
      {/* Upper right action menu with framer-motion expansion */}
      <div className="absolute top-5 right-5 z-20 flex flex-col items-end" ref={menuRef}>
        <motion.div
          layout
          initial={{ borderRadius: 9999 }}
          animate={{
            width: isMenuOpen ? 200 : 44,
            height: isMenuOpen ? 196 : 44,
            borderRadius: isMenuOpen ? 16 : 9999,
          }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          className="bg-neutral-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        >
          <AnimatePresence mode="wait">
            {!isMenuOpen ? (
              <motion.button
                id="menu-toggle-button"
                key="closed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setIsMenuOpen(true)}
                className="w-11 h-11 min-h-[44px] flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors focus:outline-none cursor-pointer"
                aria-label="Options"
              >
                <MoreVertical className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.div
                key="open"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="flex flex-col w-full h-full p-2"
              >
                <div className="flex justify-between items-center px-2 py-1.5 mb-1 border-b border-white/10">
                  <span className="text-neutral-400 text-xs font-medium uppercase tracking-widest">Options</span>
                  <button 
                    id="menu-close-button"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1 -mr-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {currentMode === 'solar' ? (
                  <button 
                    id="switch-mode-button"
                    onClick={() => { setCurrentMode('zero'); setIsMenuOpen(false); }}
                    className="flex items-center gap-3 px-2 py-2 mt-1 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <Rocket className="w-4 h-4 text-neutral-400" /> Zero Space
                  </button>
                ) : (
                  <button 
                    id="switch-mode-button"
                    onClick={() => { setCurrentMode('solar'); setIsMenuOpen(false); }}
                    className="flex items-center gap-3 px-2 py-2 mt-1 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-neutral-400" /> Solar System
                  </button>
                )}
                <button 
                  id="menu-settings-button"
                  onClick={() => { setIsSettingsOpen(true); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 px-2 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-neutral-400" /> Settings
                </button>
                <button 
                  id="menu-reset-button"
                  onClick={handleResetView}
                  className="flex items-center gap-3 px-2 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-neutral-400" /> Reset View
                </button>
                <button 
                  id="menu-about-button"
                  onClick={() => { setIsAboutOpen(true); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 px-2 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <Info className="w-4 h-4 text-neutral-400" /> About
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              id="settings-modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-[#0a0a0a]/90 border border-white/10 rounded-2xl shadow-2xl p-5 text-neutral-200 backdrop-blur-2xl"
            >
              <div className="flex justify-between items-center pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-neutral-400" />
                  <h3 className="font-semibold text-base text-white">Simulation Settings</h3>
                </div>
                <button
                  id="close-settings-button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Orbit Lines Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-300">Orbit Lines</span>
                  <button
                    id="toggle-orbits-button"
                    onClick={() => setShowOrbits(!showOrbits)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      showOrbits ? 'bg-white' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                        showOrbits ? 'translate-x-6 bg-black' : 'translate-x-1 bg-neutral-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Asteroid Belt Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-300">Asteroid Belt</span>
                  <button
                    id="toggle-asteroids-button"
                    onClick={() => setShowAsteroids(!showAsteroids)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      showAsteroids ? 'bg-white' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                        showAsteroids ? 'translate-x-6 bg-black' : 'translate-x-1 bg-neutral-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Kuiper Belt Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-300">Kuiper Belt</span>
                  <button
                    id="toggle-kuiper-button"
                    onClick={() => setShowKuiperBelt(!showKuiperBelt)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      showKuiperBelt ? 'bg-white' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                        showKuiperBelt ? 'translate-x-6 bg-black' : 'translate-x-1 bg-neutral-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Halley's Comet Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-300">Halley&apos;s Comet (1P)</span>
                  <button
                    id="toggle-comet-button"
                    onClick={() => setShowComet(!showComet)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      showComet ? 'bg-white' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                        showComet ? 'translate-x-6 bg-black' : 'translate-x-1 bg-neutral-400'
                      }`}
                    />
                  </button>
                </div>

                {/* 3D Planet Labels Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-300">3D Body Labels</span>
                  <button
                    id="toggle-labels-button"
                    onClick={() => setShowLabels(!showLabels)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      showLabels ? 'bg-white' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                        showLabels ? 'translate-x-6 bg-black' : 'translate-x-1 bg-neutral-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Reduce Sun Glare Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-300">Reduce Sun Glare</span>
                  <button
                    id="toggle-sun-glare-button"
                    onClick={() => setReduceSunGlare(!reduceSunGlare)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      reduceSunGlare ? 'bg-white' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                        reduceSunGlare ? 'translate-x-6 bg-black' : 'translate-x-1 bg-neutral-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Simulation Speed */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-neutral-300">Orbital Speed</span>
                    <span className="text-xs font-mono text-neutral-400">{simSpeed}x</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0.5, 1, 2, 4].map((speed) => (
                      <button
                        key={speed}
                        id={`speed-btn-${speed}`}
                        onClick={() => setSimSpeed(speed)}
                        className={`py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                          simSpeed === speed
                            ? 'bg-white text-black shadow-sm'
                            : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Axial Rotation Speed */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-neutral-300">Rotation Speed</span>
                    <span className="text-xs font-mono text-neutral-400">{rotationSpeed}x</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 5].map((speed) => (
                      <button
                        key={speed}
                        id={`rot-speed-btn-${speed}`}
                        onClick={() => setRotationSpeed(speed)}
                        className={`py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                          rotationSpeed === speed
                            ? 'bg-white text-black shadow-sm'
                            : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                <button
                  id="done-settings-button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-5 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {isAboutOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              id="about-modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-[#0a0a0a]/90 border border-white/10 rounded-2xl shadow-2xl p-6 text-neutral-200 backdrop-blur-2xl"
            >
              <div className="flex justify-between items-center pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-neutral-400" />
                  <h3 className="font-semibold text-base text-white">Solar System & Zero Space</h3>
                </div>
                <button
                  id="close-about-button"
                  onClick={() => setIsAboutOpen(false)}
                  className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-neutral-400">
                <p>
                  An interactive 3D Solar System simulation featuring the Sun, all 8 major planets, and dwarf planet Pluto with its moon Charon, procedural surface textures, orbits, planetary rings, and asteroid belt, complemented by a Zero Space sandbox.
                </p>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3 mt-4">
                  <div className="font-medium text-neutral-300 text-xs uppercase tracking-widest">Navigation Controls</div>
                  <ul className="space-y-2 text-neutral-400">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neutral-600" /> <span className="text-neutral-200">Orbit / Rotate:</span> Left click and drag</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neutral-600" /> <span className="text-neutral-200">Pan:</span> Right click and drag</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neutral-600" /> <span className="text-neutral-200">Zoom:</span> Scroll mouse wheel</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-neutral-600" /> <span className="text-neutral-200">Zero Space Glide:</span> Click anywhere on the ground plane</li>
                  </ul>
                </div>

                {/* APK Icon Asset Preview */}
                <div className="p-4 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-neutral-900/60 rounded-xl border border-indigo-500/20 flex items-center gap-4">
                  <div className="relative group">
                    <img 
                      src="/icon-512.png" 
                      alt="SPECGIT APK Icon" 
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl shadow-lg border border-white/20 object-cover shrink-0"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Android APK Icon</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Official specgit launcher icon for Android APK packaging.
                    </p>
                    <a
                      href="/icon-512.png"
                      download="specgit_icon.png"
                      className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-medium transition-colors"
                    >
                      <Download className="w-3 h-3 text-neutral-300" />
                      Download Icon
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                <div className="text-xs text-neutral-500 font-medium">
                  Developed by muhit
                </div>
                <button
                  id="dismiss-about-button"
                  onClick={() => setIsAboutOpen(false)}
                  className="px-5 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}


