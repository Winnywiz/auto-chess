chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes.activeStatus) return;

  const previous = changes.activeStatus.oldValue;
  const current = changes.activeStatus.newValue;
  if (current?.state !== 'recording') return;

  const isNewMatch = previous?.state !== 'recording' || previous?.runId !== current.runId;
  if (!isNewMatch) return;

  const notificationId = `recording-started-${current.runId || current.at || Date.now()}`;
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('media/icons/9110.png'),
    title: 'Recording started',
    message: 'Kanto Tactics is recording this match automatically on this device.',
  }, () => {
    if (chrome.runtime.lastError) console.warn('Could not show recording notification:', chrome.runtime.lastError.message);
  });
});
