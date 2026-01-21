import { DateTime } from 'luxon';

function formatBreakdown(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  
  return parts.join(', ');
}

function formatBreakdownMinutes(totalMinutes) {
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = Math.floor(totalMinutes % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  
  return parts.join(', ');
}

function formatBreakdownHours(totalHours) {
  const days = Math.floor(totalHours / 24);
  const hours = Math.floor(totalHours % 24);
  
  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0 || parts.length === 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  
  return parts.join(', ');
}

function getYearProgress(selectedDate, granularity) {
  const now = selectedDate || DateTime.now();
  
  const yearStart = now.startOf('year');
  const yearEnd = now.endOf('year');
  
  // Calculate in seconds for precision
  const elapsedSeconds = now.diff(yearStart, 'seconds').seconds;
  const totalSeconds = yearEnd.diff(yearStart, 'seconds').seconds;
  const remainingSeconds = totalSeconds - elapsedSeconds;
  
  const percentComplete = (elapsedSeconds / totalSeconds) * 100;
  
  let elapsed, total, remaining, breakdown, showBreakdown;
  
  switch (granularity) {
    case 'days':
      elapsed = Math.floor(elapsedSeconds / 86400);
      total = Math.ceil(totalSeconds / 86400);
      remaining = Math.ceil(remainingSeconds / 86400);
      showBreakdown = false;
      break;
      
    case 'hours':
      const totalHours = Math.floor(elapsedSeconds / 3600);
      elapsed = totalHours;
      total = Math.ceil(totalSeconds / 3600);
      remaining = Math.ceil(remainingSeconds / 3600);
      breakdown = formatBreakdownHours(totalHours);
      showBreakdown = true;
      break;
      
    case 'minutes':
      const totalMinutes = Math.floor(elapsedSeconds / 60);
      elapsed = totalMinutes;
      total = Math.ceil(totalSeconds / 60);
      remaining = Math.ceil(remainingSeconds / 60);
      breakdown = formatBreakdownMinutes(totalMinutes);
      showBreakdown = true;
      break;
      
    case 'seconds':
      elapsed = Math.floor(elapsedSeconds);
      total = Math.ceil(totalSeconds);
      remaining = Math.ceil(remainingSeconds);
      breakdown = formatBreakdown(elapsedSeconds);
      showBreakdown = true;
      break;
  }
  
  return {
    percent: percentComplete,
    elapsed,
    total,
    remaining,
    breakdown,
    showBreakdown,
    isLeapYear: now.isInLeapYear,
    granularity
  };
}

function updateDatetimeInput() {
  const liveCheckbox = document.getElementById('liveCheckbox');
  const datetimeInput = document.getElementById('datetimeInput');
  
  if (liveCheckbox.checked) {
    const now = DateTime.now();
    // Format as YYYY-MM-DDTHH:mm:ss for datetime-local input
    datetimeInput.value = now.toFormat("yyyy-MM-dd'T'HH:mm:ss");
  }
}

function updateDisplay() {
  const datetimeInput = document.getElementById('datetimeInput');
  const granularitySelect = document.getElementById('granularitySelect');
  const precisionInput = document.getElementById('precisionInput');
  const liveCheckbox = document.getElementById('liveCheckbox');
  
  const selectedDatetimeStr = datetimeInput.value;
  const granularity = granularitySelect.value;
  const precision = precisionInput.value === '' ? 6 : parseInt(precisionInput.value);
  
  // Parse the selected datetime or use current date/time
  const selectedDate = selectedDatetimeStr 
    ? DateTime.fromISO(selectedDatetimeStr)
    : DateTime.now();
  
  const progress = getYearProgress(selectedDate, granularity);
  
  // Update percentage with specified precision
  const percentElement = document.getElementById('percent');
  const displayPercent = precision === 0 
    ? Math.round(progress.percent).toString()
    : progress.percent.toFixed(precision);
  percentElement.textContent = `${displayPercent}%`;
  
  // Update tooltip with full precision (only if it changed to avoid resetting tooltip timer)
  const newTitle = `Full precision: ${progress.percent}%`;
  if (percentElement.title !== newTitle) {
    percentElement.title = newTitle;
  }
  
  document.getElementById('progressFill').style.width = `${progress.percent}%`;
  
  // Update stats
  document.getElementById('elapsed').textContent = progress.elapsed.toLocaleString();
  document.getElementById('total').textContent = progress.total.toLocaleString();
  document.getElementById('remaining').textContent = progress.remaining.toLocaleString();
  
  // Update labels
  const unitLabel = granularity.charAt(0).toUpperCase() + granularity.slice(1);
  document.getElementById('elapsedLabel').textContent = `${unitLabel} Elapsed`;
  document.getElementById('totalLabel').textContent = `${unitLabel} in Year`;
  document.getElementById('remainingLabel').textContent = `${unitLabel} Remaining`;
  
  // Update breakdown
  const breakdownDiv = document.getElementById('breakdown');
  if (progress.showBreakdown) {
    breakdownDiv.style.display = 'block';
    document.getElementById('breakdownValue').textContent = progress.breakdown;
  } else {
    breakdownDiv.style.display = 'none';
  }
  
  // Update leap year indicator
  document.getElementById('leapYear').textContent = progress.isLeapYear ? '🎉 Leap Year!' : '';
}

// Initialize inputs
function initializeControls() {
  const datetimeInput = document.getElementById('datetimeInput');
  const granularitySelect = document.getElementById('granularitySelect');
  const precisionInput = document.getElementById('precisionInput');
  const liveCheckbox = document.getElementById('liveCheckbox');
  
  // Set initial datetime to now
  updateDatetimeInput();
  
  // Add event listeners
  datetimeInput.addEventListener('change', updateDisplay);
  granularitySelect.addEventListener('change', updateDisplay);
  precisionInput.addEventListener('change', updateDisplay);
  precisionInput.addEventListener('input', updateDisplay);
  
  liveCheckbox.addEventListener('change', () => {
    datetimeInput.disabled = liveCheckbox.checked;
    if (liveCheckbox.checked) {
      updateDatetimeInput();
      updateDisplay();
    }
  });
  
  // Set initial disabled state
  datetimeInput.disabled = liveCheckbox.checked;
}

// Initialize and update immediately
initializeControls();
updateDisplay();

// Main update loop - runs every second
setInterval(() => {
  const liveCheckbox = document.getElementById('liveCheckbox');
  
  // If live mode is enabled, update the datetime input
  if (liveCheckbox.checked) {
    updateDatetimeInput();
  }
  
  // Always update the display (for tooltip and live updates)
  updateDisplay();
}, 1000);
