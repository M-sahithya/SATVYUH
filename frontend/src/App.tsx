import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MissionOverview } from './components/MissionOverview';
import { OrbitVisualization3D } from './components/OrbitVisualization3D';
import { SpaceMeshConsensus } from './components/SpaceMeshConsensus';
import { WaveletFiltering } from './components/WaveletFiltering';
import { HomomorphicVault } from './components/HomomorphicVault';
import { SafeModeProtection } from './components/SafeModeProtection';
import { ThreatIntelligence } from './components/ThreatIntelligence';
import { EventLogViewer } from './components/EventLogViewer';
import { SystemArchitecture } from './components/SystemArchitecture';
import { PresentationMode } from './components/PresentationMode';

import { 
  ConstellationStatus, 
  ConsensusStatus, 
  SignalChartData, 
  HomomorphicState, 
  SafeModeStatus, 
  SecurityEvent,
  SystemState
} from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Core state from backend
  const [constellation, setConstellation] = useState<ConstellationStatus | null>(null);
  const [consensus, setConsensus] = useState<ConsensusStatus | null>(null);
  const [signal, setSignal] = useState<SignalChartData | null>(null);
  const [vault, setVault] = useState<HomomorphicState | null>(null);
  const [safemode, setSafemode] = useState<SafeModeStatus | null>(null);
  const [logs, setLogs] = useState<SecurityEvent[]>([]);

  // Fetch all states from backend
  const refreshAllData = useCallback(async () => {
    try {
      const [cRes, csRes, sRes, vRes, smRes, lRes] = await Promise.allSettled([
        api.getConstellationStatus(),
        api.getConsensusStatus(),
        api.getSignalStatus(),
        api.getHomomorphicStatus(),
        api.getSafeModeStatus(),
        api.getLogs(50),
      ]);

      if (cRes.status === 'fulfilled') setConstellation(cRes.value);
      if (csRes.status === 'fulfilled') setConsensus(csRes.value);
      if (sRes.status === 'fulfilled') setSignal(sRes.value);
      if (vRes.status === 'fulfilled') setVault(vRes.value);
      if (smRes.status === 'fulfilled') setSafemode(smRes.value);
      if (lRes.status === 'fulfilled') setLogs(lRes.value);
    } catch (err) {
      console.error('Error refreshing backend data:', err);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
    // Background polling every 4 seconds to sync any backend updates
    const interval = setInterval(refreshAllData, 4000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await api.resetEntireDemo();
      await refreshAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const systemState: SystemState = safemode?.current_state || constellation?.system_safemode_state || 'NORMAL';
  const threatLevel = constellation?.threat_level || 'NOMINAL';

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col bg-grid-cyber selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Futuristic Command Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemState={systemState}
        threatLevel={threatLevel}
        onStartPresentation={() => setIsPresentationOpen(true)}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Interactive Stage Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'overview' && (
          <MissionOverview
            constellation={constellation}
            recentLogs={logs}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'constellation' && (
          <OrbitVisualization3D
            systemState={systemState}
            onSelectNode={() => setActiveTab('consensus')}
          />
        )}

        {activeTab === 'consensus' && (
          <SpaceMeshConsensus
            status={consensus}
            lastResult={consensus?.last_consensus || null}
            onRefresh={refreshAllData}
          />
        )}

        {activeTab === 'wavelet' && (
          <WaveletFiltering
            data={signal}
            onRefresh={refreshAllData}
          />
        )}

        {activeTab === 'vault' && (
          <HomomorphicVault
            state={vault}
            onRefresh={refreshAllData}
          />
        )}

        {activeTab === 'safemode' && (
          <SafeModeProtection
            status={safemode}
            onRefresh={refreshAllData}
          />
        )}

        {activeTab === 'threat' && (
          <ThreatIntelligence
            systemState={systemState}
          />
        )}

        {activeTab === 'logs' && (
          <EventLogViewer
            logs={logs}
            onRefresh={refreshAllData}
          />
        )}

        {activeTab === 'architecture' && (
          <SystemArchitecture />
        )}
      </main>

      {/* 5-Minute Guided Presentation Mode Overlay */}
      <PresentationMode
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onRefreshAll={refreshAllData}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-space-950/90 py-3 px-4 font-mono text-[11px] text-slate-500 text-center flex flex-wrap justify-between items-center max-w-7xl mx-auto w-full">
        <div>
          <span className="text-cyan-400 font-bold">PROJECT SATVYUH</span> — Multi-Layer Satellite Cybersecurity Defence Simulation
        </div>
        <div className="flex items-center space-x-3">
          <span>Python 3.14 + FastAPI + PyWavelets + Paillier + Three.js</span>
          <span className="text-emerald-400">● LOCAL SIMULATION ONLINE</span>
        </div>
      </footer>
    </div>
  );
};
