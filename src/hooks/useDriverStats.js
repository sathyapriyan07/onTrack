import { useMemo } from 'react';

// Status classification helpers
const isFinished = (status) => status === 'Finished' || (status && status.startsWith('+'));
const isDNF = (status) => !isFinished(status) && status !== 'Disqualified' && status !== 'Did not start' && status !== 'Did not qualify' && !!status;
const isDSQ = (status) => status === 'Disqualified';
const isDNS = (status) => status === 'Did not start' || status === 'Did not qualify';

export function useDriverStats(results = [], qualifyingRows = [], standingsRows = []) {
  return useMemo(() => {
    const races       = results.length;
    const wins        = results.filter((r) => r.position === 1).length;
    const podiums     = results.filter((r) => r.position != null && r.position <= 3).length;
    const points      = results.reduce((sum, r) => sum + (r.points || 0), 0);
    const dnfs        = results.filter((r) => isDNF(r.status)).length;
    const dsq         = results.filter((r) => isDSQ(r.status)).length;
    const dns         = results.filter((r) => isDNS(r.status)).length;
    const fastestLaps = results.filter((r) => r.fastest_lap_time != null && r.fastest_lap_time !== '').length;
    const poles       = qualifyingRows.filter((q) => q.position === 1).length;
    const championships = standingsRows.filter((s) => s.position === 1).length;

    // Per-season breakdown for championships display
    const championshipYears = standingsRows
      .filter((s) => s.position === 1)
      .map((s) => s.seasons?.year)
      .filter(Boolean)
      .sort((a, b) => a - b);

    return { races, wins, podiums, points, dnfs, dsq, dns, fastestLaps, poles, championships, championshipYears };
  }, [results, qualifyingRows, standingsRows]);
}
