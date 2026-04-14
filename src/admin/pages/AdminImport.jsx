import { useState } from 'react';
import {
  importFullSeason,
  importCircuits,
  importDrivers,
  importConstructors,
  importRaces,
  importRaceResults,
  importQualifying,
  importSprint,
  importStandings,
  importSeason,
} from '../../services/importService';

const CURRENT_YEAR = new Date().getFullYear();

export default function AdminImport() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [round, setRound] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  function addLogs(newLogs) {
    setLogs((prev) => [...newLogs, ...prev]);
  }

  async function run(fn) {
    setLoading(true);
    try {
      const result = await fn();
      if (Array.isArray(result)) addLogs(result);
    } catch (e) {
      addLogs([{ message: e.message, type: 'error', timestamp: new Date().toISOString() }]);
    }
    setLoading(false);
  }

  async function runWithSeason(fn) {
    setLoading(true);
    try {
      const { seasonId, logs: sLogs } = await importSeason(year);
      addLogs(sLogs);
      if (seasonId) {
        const result = await fn(seasonId);
        if (Array.isArray(result)) addLogs(result);
      }
    } catch (e) {
      addLogs([{ message: e.message, type: 'error', timestamp: new Date().toISOString() }]);
    }
    setLoading(false);
  }

  const buttons = [
    { label: '🌍 Full Season Import', action: () => run(() => importFullSeason(year)) },
    { label: '🏁 Circuits', action: () => run(() => importCircuits(year)) },
    { label: '👤 Drivers', action: () => run(() => importDrivers(year)) },
    { label: '🏎 Constructors', action: () => run(() => importConstructors(year)) },
    { label: '📅 Races', action: () => runWithSeason((sid) => importRaces(year, sid)) },
    { label: '📋 Race Results', action: () => run(() => importRaceResults(year, round || null)) },
    { label: '⏱ Qualifying', action: () => run(() => importQualifying(year, round)), requiresRound: true },
    { label: '⚡ Sprint', action: () => run(() => importSprint(year, round)), requiresRound: true },
    { label: '🏆 Standings', action: () => runWithSeason((sid) => importStandings(year, sid)) },
  ];

  return (
    <div>
      <h1>Import Data</h1>

      <div style={styles.controls}>
        <div style={styles.field}>
          <label style={styles.label}>Season Year</label>
          <input
            type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))}
            min={1950} max={CURRENT_YEAR} style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Round (optional)</label>
          <input
            type="number" value={round} onChange={(e) => setRound(e.target.value)}
            placeholder="e.g. 1" min={1} style={styles.input}
          />
        </div>
      </div>

      <div style={styles.btnGrid}>
        {buttons.map(({ label, action, requiresRound }) => (
          <button
            key={label}
            onClick={action}
            disabled={loading || (requiresRound && !round)}
            style={{
              ...styles.btn,
              ...(requiresRound && !round ? styles.btnDisabled : {}),
            }}
            title={requiresRound && !round ? 'Enter a round number first' : ''}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <div style={styles.loading}>⏳ Importing...</div>}

      {logs.length > 0 && (
        <div style={styles.logBox}>
          <div style={styles.logHeader}>
            <strong>Import Log</strong>
            <button onClick={() => setLogs([])} style={styles.clearBtn}>Clear</button>
          </div>
          {logs.map((log, i) => (
            <div
              key={i}
              style={{
                ...styles.logEntry,
                color: log.type === 'error' ? '#e10600' : '#2d7a2d',
              }}
            >
              <span style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString()}</span>
              {log.type === 'error' ? '❌' : '✅'} {log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  controls: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontWeight: 600, fontSize: '0.85rem' },
  input: { padding: '0.5rem', border: '1px solid #ddd', borderRadius: 4, width: 140 },
  btnGrid: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.5rem' },
  btn: {
    background: '#15151e', color: '#fff', border: 'none', padding: '0.6rem 1rem',
    borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  loading: { padding: '1rem', background: '#fff8e1', borderRadius: 4, marginBottom: '1rem' },
  logBox: {
    background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8,
    padding: '1rem', maxHeight: 400, overflowY: 'auto',
  },
  logHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  clearBtn: {
    background: 'transparent', border: '1px solid #ddd', padding: '2px 8px',
    borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem',
  },
  logEntry: { padding: '4px 0', borderBottom: '1px solid #f5f5f5', fontSize: '0.85rem' },
  logTime: { color: '#999', marginRight: 8, fontSize: '0.8rem' },
};
