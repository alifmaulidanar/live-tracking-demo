/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
let isSaving = false;

const ensureStoresExist = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("locationDB", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
        console.log("Object store 'meta' created.");
      }
      if (!db.objectStoreNames.contains("locations")) {
        db.createObjectStore("locations", { keyPath: "id", autoIncrement: true });
        console.log("Object store 'locations' created.");
      }
    };

    request.onsuccess = () => {
      const db = request.result;

      // Jika object store "meta" atau "locations" tidak ada, lakukan upgrade
      const storesToCreate: string[] = [];
      if (!db.objectStoreNames.contains("meta")) {
        storesToCreate.push("meta");
      }
      if (!db.objectStoreNames.contains("locations")) {
        storesToCreate.push("locations");
      }

      if (storesToCreate.length > 0) {
        console.warn(`Missing object stores: ${storesToCreate.join(", ")}. Upgrading database...`);
        const version = db.version + 1;
        db.close(); // Tutup database sebelum upgrade
        const upgradeRequest = indexedDB.open("locationDB", version);

        upgradeRequest.onupgradeneeded = () => {
          const upgradeDB = upgradeRequest.result;
          if (!upgradeDB.objectStoreNames.contains("meta")) {
            upgradeDB.createObjectStore("meta", { keyPath: "key" });
            console.log("Object store 'meta' created during upgrade.");
          }
          if (!upgradeDB.objectStoreNames.contains("locations")) {
            upgradeDB.createObjectStore("locations", { keyPath: "id", autoIncrement: true });
            console.log("Object store 'locations' created during upgrade.");
          }
        };

        upgradeRequest.onsuccess = () => resolve();
        upgradeRequest.onerror = reject;
      } else {
        resolve();
      }
    };

    request.onerror = reject;
  });
};


// Get the last written time from the local storage or indexedDB
const getLastWritten = (): Promise<number> => {
  const lastWritten = localStorage.getItem('lastWritten');
  if (lastWritten) {
    return Promise.resolve(parseInt(lastWritten));
  } else {
    return getLastWrittenFromIndexedDB();
  }
};

const updateLastWritten = async (timestamp: number) => {
  await ensureStoresExist();
  try {
    localStorage.setItem("lastWritten", timestamp.toString());
    const request = indexedDB.open("locationDB", 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("meta", "readwrite");
      const metaStore = transaction.objectStore("meta");
      metaStore.put({ key: "lastWritten", value: timestamp });
      console.log("lastWritten updated in IndexedDB:", timestamp);
    };

    request.onerror = (error) => {
      console.error("Error updating lastWritten in IndexedDB:", error);
    };
  } catch (error) {
    console.error("Error updating lastWritten:", error);
  }
};

// Get the last written time from indexedDB
const getLastWrittenFromIndexedDB = async (): Promise<number> => {
  await ensureStoresExist();
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("locationDB", 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("meta", "readonly");
      const metaStore = transaction.objectStore("meta");
      const getRequest = metaStore.get("lastWritten");

      getRequest.onsuccess = () => {
        const result = getRequest.result;
        console.log("Fetched lastWritten from IndexedDB:", result);
        resolve(result ? result.value : 0);
      };
      getRequest.onerror = (error) => {
        console.error("Error fetching lastWritten from IndexedDB:", error);
        reject(error);
      };
    };

    request.onerror = (error) => {
      console.error("Error opening IndexedDB:", error);
      reject(error);
    };
  });
};

// Check if it's possible to write data
const canWriteData = async () => {
  const lastWritten = await getLastWritten();
  const now = new Date().getTime();

  console.log('Checking canWriteData...');
  console.log('now:', new Date(now).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
  console.log('lastWritten:', new Date(parseInt(lastWritten.toString() || '0')).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));

  // console log if there a meta object store in indexedDB
  const request = indexedDB.open('locationDB', 1);
  request.onsuccess = () => {
    const db = request.result;
    if (db.objectStoreNames.contains('meta')) {
      console.log('Object store "meta" found in IndexedDB.');
    } else {
      console.error('Object store "meta" not found in IndexedDB.');
    }
  };

  if (lastWritten && now - lastWritten < 300000) { // 300000 ms = 5 menit
    console.log('Too soon to write data. Please wait 5 minutes.');
    return false;
  }

  console.log('Can write data!');
  return true;
};

// Save location to the main database
export const saveLocationToDatabase = async (user_id: string, latitude: number, longitude: number) => {
  if (isSaving) {
    console.log("Save operation is already in progress. Skipping...");
    return;
  }
  isSaving = true;

  try {
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
          updateLastWritten(new Date().getTime());
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
  } catch (error) {
    console.error("Error in saveLocationToDatabase:", error);
  } finally {
    isSaving = false;
  }
};

// Save location to indexedDB
async function storeLocationData(location: any) {
  await ensureStoresExist();
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("locationDB", 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["locations", "meta"], "readwrite");
      const store = transaction.objectStore("locations");
      store.add(location);
      console.log("Location saved to indexedDB:", location);

      const now = new Date().getTime();
      updateLastWritten(now);
      console.log("lastWritten updated in IndexedDB:", now);
      resolve(true);
    };

    request.onerror = (event) => {
      console.error("Error opening IndexedDB:", event);
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
