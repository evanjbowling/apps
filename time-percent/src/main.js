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

function updateDisplay() {
  const dateInput = document.getElementById('dateInput');
  const granularitySelect = document.getElementById('granularitySelect');
  
  const selectedDateStr = dateInput.value;
  const granularity = granularitySelect.value;
  
  // Parse the selected date
  // If it's today, use current time; if it's a past date, use end of that day
  const today = DateTime.now().toISODate();
  const selectedDate = selectedDateStr 
    ? (selectedDateStr === today ? DateTime.now() : DateTime.fromISO(selectedDateStr).endOf('day'))
    : DateTime.now();
  
  const progress = getYearProgress(selectedDate, granularity);
  
  // Update percentage
  document.getElementById('percent').textContent = `${progress.percent.toFixed(2)}%`;
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
  const dateInput = document.getElementById('dateInput');
  const granularitySelect = document.getElementById('granularitySelect');
  
  const today = DateTime.now().toISODate(); // Format: YYYY-MM-DD
  dateInput.value = today;
  
  // Add event listeners
  dateInput.addEventListener('change', updateDisplay);
  granularitySelect.addEventListener('change', updateDisplay);
}

// Initialize and update immediately
initializeControls();
updateDisplay();

// Update every second when viewing seconds
setInterval(() => {
  const granularitySelect = document.getElementById('granularitySelect');
  const dateInput = document.getElementById('dateInput');
  const today = DateTime.now().toISODate();
  
  // If viewing today and in seconds/minutes granularity, update display
  if (dateInput.value === today && (granularitySelect.value === 'seconds' || granularitySelect.value === 'minutes')) {
    updateDisplay();
  }
}, 1000);

// Update every minute for hours granularity
setInterval(() => {
  const granularitySelect = document.getElementById('granularitySelect');
  const dateInput = document.getElementById('dateInput');
  const today = DateTime.now().toISODate();
  
  if (dateInput.value === today && granularitySelect.value === 'hours') {
    updateDisplay();
  }
}, 60000);
