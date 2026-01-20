import { ref } from 'vue';

// Global state
const dailyRate = ref(9.21);
const lastSyncedDate = ref<string | null>(null);
const isUpdatedToday = ref(false);
const isOffline = ref(false);

const STORAGE_KEY_RATE = 'goldback_daily_rate';
const STORAGE_KEY_DATE = 'goldback_last_synced';

export function useGoldbackRate() {

  const loadFromCache = () => {
    const cachedRate = localStorage.getItem(STORAGE_KEY_RATE);
    const cachedDate = localStorage.getItem(STORAGE_KEY_DATE);

    if (cachedRate) {
      dailyRate.value = parseFloat(cachedRate);
    }
    if (cachedDate) {
      lastSyncedDate.value = cachedDate;
      
      // Check if updated today
      const last = new Date(cachedDate);
      const now = new Date();
      if (last.toDateString() === now.toDateString()) {
        isUpdatedToday.value = true;
      }
    }
  };

  const saveToCache = (rate: number, date: string) => {
    localStorage.setItem(STORAGE_KEY_RATE, rate.toString());
    localStorage.setItem(STORAGE_KEY_DATE, date);
  };

  const syncOfficialRate = async () => {
    // Check if current time is > 10:00 AM MST (America/Denver)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Denver',
      hour: 'numeric',
      hour12: false
    });
    const hourInMST = parseInt(formatter.format(now), 10);

    if (hourInMST < 10) {
      return; // Too early to sync
    }

    try {
      // Placeholder for API fetch
      // const response = await fetch('https://api.goldback.com/rate');
      const newRate = 9.21; // Placeholder value
      
      if (dailyRate.value !== newRate || !isUpdatedToday.value) {
        dailyRate.value = newRate;
        isUpdatedToday.value = true;
        const timestamp = new Date().toLocaleString();
        lastSyncedDate.value = timestamp;
        saveToCache(newRate, timestamp);
      }
      isOffline.value = false;
    } catch (error) {
      console.error('Rate sync failed:', error);
      isOffline.value = true;
    }
  };

  // Initialize state from storage
  loadFromCache();

  return {
    dailyRate,
    lastSyncedDate,
    isUpdatedToday,
    isOffline,
    syncOfficialRate
  };
}