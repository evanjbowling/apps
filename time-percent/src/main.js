import { DateTime } from 'luxon';

function calculateBreakdown(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  return { days, hours, minutes, seconds };
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
  
  // Calculate breakdowns (always)
  const elapsedBreakdown = calculateBreakdown(elapsedSeconds);
  const remainingBreakdown = calculateBreakdown(remainingSeconds);
  
  let elapsed, total, remaining;
  
  switch (granularity) {
    case 'days':
      elapsed = Math.floor(elapsedSeconds / 86400);
      total = Math.ceil(totalSeconds / 86400);
      remaining = Math.ceil(remainingSeconds / 86400);
      break;
      
    case 'hours':
    case 'minutes':
    case 'seconds':
      // Calculate base units
      const divisor = granularity === 'hours' ? 3600 : (granularity === 'minutes' ? 60 : 1);
      elapsed = Math.floor(elapsedSeconds / divisor);
      total = Math.ceil(totalSeconds / divisor);
      remaining = Math.ceil(remainingSeconds / divisor);
      break;
  }
  
  return {
    percent: percentComplete,
    elapsed,
    total,
    remaining,
    elapsedBreakdown,
    remainingBreakdown,
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
  
  // Update slider position and track gradient
  const progressSlider = document.getElementById('progressSlider');
  progressSlider.value = progress.percent;
  progressSlider.style.setProperty('--progress', `${progress.percent}%`);
  
  // Update stats
  document.getElementById('elapsed').textContent = progress.elapsed.toLocaleString();
  document.getElementById('total').textContent = progress.total.toLocaleString();
  document.getElementById('remaining').textContent = progress.remaining.toLocaleString();
  
  // Update labels (just the unit)
  const unitLabel = granularity.charAt(0).toUpperCase() + granularity.slice(1);
  document.getElementById('elapsedLabel').textContent = unitLabel;
  document.getElementById('totalLabel').textContent = unitLabel;
  document.getElementById('remainingLabel').textContent = unitLabel;
  
  // Always update breakdown tables
  document.getElementById('elapsedDays').textContent = progress.elapsedBreakdown.days;
  document.getElementById('elapsedHours').textContent = progress.elapsedBreakdown.hours;
  document.getElementById('elapsedMinutes').textContent = progress.elapsedBreakdown.minutes;
  document.getElementById('elapsedSeconds').textContent = progress.elapsedBreakdown.seconds;
  
  document.getElementById('remainingDays').textContent = progress.remainingBreakdown.days;
  document.getElementById('remainingHours').textContent = progress.remainingBreakdown.hours;
  document.getElementById('remainingMinutes').textContent = progress.remainingBreakdown.minutes;
  document.getElementById('remainingSeconds').textContent = progress.remainingBreakdown.seconds;
  
  // Update leap year indicator
  document.getElementById('leapYear').textContent = progress.isLeapYear ? '🎉 Leap Year!' : '';
}

// Initialize inputs
function initializeControls() {
  const datetimeInput = document.getElementById('datetimeInput');
  const granularitySelect = document.getElementById('granularitySelect');
  const precisionInput = document.getElementById('precisionInput');
  const liveCheckbox = document.getElementById('liveCheckbox');
  const progressSlider = document.getElementById('progressSlider');
  
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
  
  // Slider event handler
  progressSlider.addEventListener('input', (e) => {
    // Uncheck live mode
    liveCheckbox.checked = false;
    datetimeInput.disabled = false;
    
    // Calculate the datetime based on slider percentage
    const percent = parseFloat(e.target.value);
    const now = DateTime.now();
    const yearStart = now.startOf('year');
    const yearEnd = now.endOf('year');
    const totalSeconds = yearEnd.diff(yearStart, 'seconds').seconds;
    const targetSeconds = (percent / 100) * totalSeconds;
    const targetDate = yearStart.plus({ seconds: targetSeconds });
    
    // Update datetime input
    datetimeInput.value = targetDate.toFormat("yyyy-MM-dd'T'HH:mm:ss");
    
    // Update display
    updateDisplay();
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
