/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Get the last written time from the local storage or indexedDB
const getLastWritten = () => {
  const lastWritten = localStorage.getItem('lastWritten');
  if (lastWritten) {
    return parseInt(lastWritten);
  } else {
    return getLastWrittenFromIndexedDB();
  }
};

// Get the last written time from indexedDB
const getLastWrittenFromIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('locationDB', 1);

    request.onsuccess = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains('meta')) {
        console.error('Object store "meta" not found in IndexedDB.');
        resolve(0);
        return;
      }

      const transaction = db.transaction('meta', 'readonly');
      const metaStore = transaction.objectStore('meta');
      const getRequest = metaStore.get('lastWritten');

      getRequest.onsuccess = () => {
        const result = getRequest.result;
        resolve(result ? result.value : 0);
      };
      getRequest.onerror = reject;
    };
    request.onerror = reject;
  });
};

// Check if it's possible to write data
const canWriteData = async () => {
  const lastWritten = await getLastWritten();
  const now = new Date().getTime();

  if (lastWritten && now - parseInt(lastWritten.toString()) < 3000000) { // 300000 ms = 5 menit
    console.log('now:', new Date(now).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
    console.log('lastWritten:', new Date(parseInt(lastWritten.toString() || '0')).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
    return false;
  }
  return true;
};

// Save location to the main database
export const saveLocationToDatabase = async (user_id: string, latitude: number, longitude: number) => {
  const locationData = { user_id, latitude, longitude };

  if (navigator.onLine) {
    if (await canWriteData()) {
      const response = await fetch(`${BASE_URL}/save-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Location saved to Supabase:', data);
        localStorage.setItem('lastWritten', new Date().getTime().toString());
      } else {
        console.error('Error saving location:', data.message);
        console.log('Saving location to indexedDB...');
        await storeLocationData(locationData);
      }
    } else {
      console.log('Too soon to save location Supabase. Please wait 5 minutes.');
    }
  } else {
    if (await canWriteData()) {
      console.log('Offline. Saving location to indexedDB...');
      await storeLocationData(locationData);
    } else {
      console.log('Too soon to save location to IndexDB. Please wait 5 minutes.');
    }
  }
};

// Save location to indexedDB
function storeLocationData(location: any) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('locationDB', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('locations')) {
        db.createObjectStore('locations', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('meta')) {
        const metaStore = db.createObjectStore('meta', { keyPath: 'key' });
        metaStore.put({ key: 'lastWritten', value: 0 });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['locations', 'meta'], 'readwrite');
      const store = transaction.objectStore('locations');
      const metaStore = transaction.objectStore('meta');
      store.add(location);
      console.log('Location saved to indexedDB:', location);
      const now = new Date().getTime();
      metaStore.put({ key: 'lastWritten', value: now });
      console.log('lastWritten updated in IndexedDB:', now);
      console.log('Please check your connection to save to the main database.');
      resolve(true);
    };

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject(event);
    };
  });
}

// Get the latest location for each user
export const getLatestLocationForEachUser = async () => {
  try {
    const response = await fetch(`${BASE_URL}/latest-locations`);
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      console.error("Error fetching latest locations:", data.message);
      return [];
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return [];
  }
};
