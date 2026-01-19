import { DateTime } from 'luxon';

function getYearProgress() {
  const now = DateTime.now();
  
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
  const progress = getYearProgress();
  
  document.getElementById('percent').textContent = `${progress.percent.toFixed(2)}%`;
  document.getElementById('progressFill').style.width = `${progress.percent}%`;
  document.getElementById('daysElapsed').textContent = progress.daysElapsed;
  document.getElementById('daysInYear').textContent = progress.daysInYear;
  document.getElementById('daysRemaining').textContent = progress.daysRemaining;
  document.getElementById('leapYear').textContent = progress.isLeapYear ? '🎉 Leap Year!' : '';
}

// Update immediately
updateDisplay();

// Update every hour
setInterval(updateDisplay, 1000 * 60 * 60);
