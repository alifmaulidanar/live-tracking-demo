import { saveLocationToDatabase } from "../src/lib/actions";

self.addEventListener("install", (event) => {
  console.log("Service Worker Installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");
  event.waitUntil(clients.claim()); // Take control of clients immediately
});

// Background Sync for 'location-sync'
self.addEventListener("sync", (event) => {
  console.log(`Sync event: ${event.tag}`);
  if (event.tag === "location-sync") {
    event.waitUntil(syncLocationData()); // Wait until synchronization completes
  }
});

// Fetch event listener to intercept requests and respond with cached data when server is offline
self.addEventListener("fetch", (event) => {
  if (event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).catch(() => {
            return caches.match("/offline.html"); // Fallback to offline page
          })
        );
      })
    );
  }
});

// Function to sync location data with the backend
async function syncLocationData() {
  const locations = await getStoredLocations();
  for (const location of locations) {
    const { user_id, latitude, longitude } = location;
    const isSaved = await saveLocationToDatabase(user_id, latitude, longitude); // Use the saveLocationToDatabase function to send data to the server

    // If location was successfully saved, remove from IndexedDB
    if (isSaved) {
      console.log("Location saved successfully!");
      console.log("Location removed!");
      await removeLocation(location);
    }
  }
}

// Function to get stored locations from IndexedDB
async function getStoredLocations() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("locationDB", 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("locations", "readonly");
      const store = transaction.objectStore("locations");
      const getAllRequest = store.getAll();

      console.log("Getting stored locations...");
      console.log({ getAllRequest });
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = reject;
    };

    request.onerror = reject;
  });
}

// Function to remove a location from IndexedDB
async function removeLocation(location) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("locationDB", 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("locations", "readwrite");
      const store = transaction.objectStore("locations");
      const deleteRequest = store.delete(location.id);

      console.log("Removing location from IndexedDB...");
      console.log({ deleteRequest });
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = reject;
    };

    request.onerror = reject;
  });
}
