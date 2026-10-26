(() => {
  'use strict';
  function hasUnsupportedUnits(units, metadata) {
    return (Array.isArray(units) ? units : []).some(unit => {
      const line = String(unit?.line ?? '');
      const info = metadata?.[line];
      return !info || info.pvpEligible === false || info.mode === 'adventure';
    });
  }
  globalThis.KantoReplayCompat = Object.freeze({hasUnsupportedUnits});
})();
