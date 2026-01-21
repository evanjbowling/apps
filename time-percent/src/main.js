import { DateTime } from 'luxon';

function getYearProgress(selectedDate) {
  // Use the selected date or default to now
  const now = selectedDate || DateTime.now();
  
  const yearStart = now.startOf('year');
  const yearEnd = now.endOf('year');
  
  // Get differences in days
  const daysElapsed = now.diff(yearStart, 'days').days;
  const daysInYear = yearEnd.diff(yearStart, 'days').days;
  const daysRemaining = daysInYear - daysElapsed;
  
  const percentComplete = (daysElapsed / daysInYear) * 100;
  
  return {
    percent: percentComplete,
    daysElapsed: Math.floor(daysElapsed),
    daysInYear: Math.ceil(daysInYear),
    daysRemaining: Math.ceil(daysRemaining),
    isLeapYear: now.isInLeapYear
  };
}

function updateDisplay() {
  const dateInput = document.getElementById('dateInput');
  const selectedDateStr = dateInput.value;
  
  // Parse the selected date or use current date
  const selectedDate = selectedDateStr 
    ? DateTime.fromISO(selectedDateStr)
    : DateTime.now();
  
  const progress = getYearProgress(selectedDate);
  
  document.getElementById('percent').textContent = `${progress.percent.toFixed(2)}%`;
  document.getElementById('progressFill').style.width = `${progress.percent}%`;
  document.getElementById('daysElapsed').textContent = progress.daysElapsed;
  document.getElementById('daysInYear').textContent = progress.daysInYear;
  document.getElementById('daysRemaining').textContent = progress.daysRemaining;
  document.getElementById('leapYear').textContent = progress.isLeapYear ? '🎉 Leap Year!' : '';
}

// Initialize date input with today's date
function initializeDateInput() {
  const dateInput = document.getElementById('dateInput');
  const today = DateTime.now().toISODate(); // Format: YYYY-MM-DD
  dateInput.value = today;
  
  // Add event listener for date changes
  dateInput.addEventListener('change', updateDisplay);
}

// Initialize and update immediately
initializeDateInput();
updateDisplay();

// Update every hour (in case the date input is set to today and time passes)
setInterval(() => {
  const dateInput = document.getElementById('dateInput');
  const today = DateTime.now().toISODate();
  
  // If the date input is still set to today, update it
  if (dateInput.value === today) {
    updateDisplay();
  }
}, 1000 * 60 * 60);
