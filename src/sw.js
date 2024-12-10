import { saveLocationToDatabase } from "./lib/actions";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

cleanupOutdatedCaches(); // Cleanup outdated caches
precacheAndRoute(self.__WB_MANIFEST); // Precache all the assets in the manifest

// Install event listener to cache assets
self.addEventListener("install", (event) => {
  console.log("Service Worker Installed");
  self.skipWaiting();
});

// Activate event listener to take control of clients immediately
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

// Function to sync location data with the backend
async function syncLocationData() {
  const locations = await getStoredLocations();
  for (const location of locations) {
    const { user_id, latitude, longitude } = location;
    const isSaved = await saveLocationToDatabase(user_id, latitude, longitude); // Use the saveLocationToDatabase function to send data to the server

    // If location was successfully saved, remove from IndexedDB
    if (isSaved) {
      console.log("Location synced successfully!");
      console.log("Location removed!");
      await removeLocation(location);
    } else {
      console.error("Failed to sync location:", location);
    }
  }
}

// Function to get stored locations from IndexedDB
async function getStoredLocations() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("locationDB", 1);

    request.onsuccess = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("locations")) {
        console.error('Object store "locations" not found in IndexedDB.');
        resolve([]);
        return;
      }

      console.log('Object store "locations" found in IndexedDB.✨');
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
      deleteRequest.onsuccess = resolve;
      deleteRequest.onerror = reject;
    };
    request.onerror = reject;
  });
}
