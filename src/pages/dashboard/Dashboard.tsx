/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { format, toZonedTime } from 'date-fns-tz';
import { useEffect, useRef, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import { saveLocationToDatabase, getLatestLocationForEachUser } from "@/lib/actions";
import { MapContainer, TileLayer, Marker, Tooltip, Popup, useMap } from "react-leaflet";

export const Dashboard = () => {
  const user = useUser();
  const mapRef = useRef<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocations, setUserLocations] = useState<any[]>([]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Add geocoder control to the map
  useEffect(() => {
    if (mapRef.current) {
      const map = useMap();
      L.Control.Geocoder.nominatim().addTo(map);
    }
  }, []);

  // Fetch all user locations
  useEffect(() => {
    const fetchUserLocations = async () => {
      const locations = await getLatestLocationForEachUser();
      setUserLocations(locations);
    };
    fetchUserLocations();
  }, []);

  // Fetch current user's location
  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout | null = null;
    
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });

          // Call the action function to write data to DB
          if (user) {
            if (debounceTimeout) clearTimeout(debounceTimeout);

            debounceTimeout = setTimeout(() => {
              const user_id = user.id;
              saveLocationToDatabase(user_id, latitude, longitude);
            }, 10000); // Set debounce interval (e.g., 10 seconds)
          }
        }, (error) => {
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true, maximumAge: 10000 
        }
      );

      // Clean up the watchPosition listener and timeout
      return () => {
        navigator.geolocation.clearWatch(watchId);
        if (debounceTimeout) clearTimeout(debounceTimeout);
      };
    }
  }, [user]);

  // Fetch address for each user location
  useEffect(() => {
    if (userLocations.length > 0) {
      userLocations.forEach(async (userLocation) => {
        const { latitude, longitude } = userLocation;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await response.json();
        userLocation.address = data.display_name;
      });
    }
  }, [userLocations]);

  // Render the map
  if (!location) return <div>Loading...</div>;

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocations.map((userLocation) => (
          <Marker
            key={userLocation.user_id}
            position={[userLocation.latitude, userLocation.longitude]}
          >
            <Tooltip permanent direction="top" offset={[-15, -10]}>
              <div>
                <h3>{userLocation.username || "Loading..."}</h3>
                <h3>{userLocation.phone || "Loading..."}</h3>
              </div>
            </Tooltip>
            <Popup>
              <div>
                <h3>{userLocation.username || "Loading..."}</h3>
                <p>Phone: {userLocation.phone || "Loading..."}</p>
                <p>Latitude: {userLocation.latitude || "Loading..."}</p>
                <p>Longitude: {userLocation.longitude || "Loading..."}</p>
                <p>Timestamp: {format(toZonedTime(userLocation.timestamp, 'Asia/Jakarta'), 'PPpp') || "Loading..."}</p>
                <p>Address: {userLocation.address || "Loading..."}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Dashboard;
