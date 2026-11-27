import React, { useState } from 'react';
import { 
  Terminal, 
  Trash2, 
  Filter, 
  Search, 
  RefreshCcw, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { SecurityEvent } from '../types';
import { api } from '../services/api';

interface EventLogViewerProps {
  logs: SecurityEvent[];
  onRefresh: () => void;
}

export const EventLogViewer: React.FC<EventLogViewerProps> = ({
  logs,
  onRefresh,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  const handleClearLogs = async () => {
    if (!window.confirm('Clear all security event logs from SQLite database?')) return;
    setIsClearing(true);
    try {
      await api.clearLogs();
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsClearing(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesLayer = selectedLayer === 'ALL' || log.layer.includes(selectedLayer);
    const matchesSearch = 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.layer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLayer && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="cyber-panel p-5 rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-slate-100">
              PERSISTENT SECURITY AUDIT TRAIL (SQLITE)
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              {logs.length} EVENTS RECORDED
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-mono bg-space-900 hover:bg-space-850 border border-slate-800 rounded text-slate-300"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>REFRESH LOGS</span>
            </button>
            <button
              onClick={handleClearLogs}
              disabled={isClearing}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-mono bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 rounded text-rose-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR LOGS</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search message, event type, or layer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-space-900 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Layer Filter Buttons */}
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar font-mono text-xs">
            {['ALL', 'CONSENSUS', 'SIGNAL', 'HOMOMORPHIC', 'SAFE_MODE'].map((layerKey) => (
              <button
                key={layerKey}
                onClick={() => setSelectedLayer(layerKey)}
                className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-all ${
                  selectedLayer === layerKey
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-space-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {layerKey}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table / Feed */}
      <div className="cyber-panel p-4 rounded-xl space-y-2">
        {filteredLogs.length > 0 ? (
          <div className="space-y-1.5 font-mono text-xs">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const hasDetails = log.details && Object.keys(log.details).length > 0;

              return (
                <div
                  key={log.id}
                  className="rounded-lg bg-space-900/80 border border-slate-800/80 overflow-hidden"
                >
                  <div
                    onClick={() => hasDetails && setExpandedLogId(isExpanded ? null : log.id)}
                    className={`p-3 flex items-center justify-between cursor-pointer hover:bg-space-850/80 transition-colors ${
                      hasDetails ? '' : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      {hasDetails ? (
                        isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )
                      ) : (
                        <div className="w-3.5" />
                      )}

                      <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        log.status === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        log.status === 'WARNING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {log.status}
                      </span>

                      <span className="text-cyan-400 font-semibold shrink-0">
                        [{log.layer.replace('LAYER_', 'L').replace('_', ' ')}]
                      </span>

                      <span className="text-slate-200 truncate">{log.message}</span>
                    </div>

                    <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                      #{log.id}
                    </span>
                  </div>

                  {/* Expanded JSON Inspector */}
                  {isExpanded && hasDetails && (
                    <div className="p-3 bg-space-950 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block mb-1">EVENT METADATA & TELEMETRY PAYLOAD:</span>
                      <pre className="text-[11px] text-cyan-300 font-mono overflow-x-auto p-2 rounded bg-space-900 border border-slate-800">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center font-mono text-xs text-slate-500">
            No events match current filter.
          </div>
        )}
      </div>
    </div>
  );
};
