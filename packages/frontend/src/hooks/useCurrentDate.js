import { useState, useEffect } from 'react';
import { getLocalDateString } from '../utils/overdue';

/**
 * Returns today's local date (YYYY-MM-DD), refreshed when the tab is
 * refocused or becomes visible. Only changes state when the date changes.
 * @returns {string} Current local date
 */
function useCurrentDate() {
  const [today, setToday] = useState(() => getLocalDateString());

  useEffect(() => {
    const refresh = () => setToday(getLocalDateString());
    const handleVisibility = () => {
      if (document.visibilityState !== 'hidden') {
        refresh();
      }
    };

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return today;
}

export default useCurrentDate;
