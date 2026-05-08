import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchISSLocation, fetchAstros, calculateDistance } from '../utils/api';
import { RefreshCw, Users, Navigation } from 'lucide-react';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom ISS Icon
const issIcon = new L.Icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
  iconSize: [50, 32],
  iconAnchor: [25, 16],
});

// Custom hook to center map
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

const ISSDashboard = () => {
  const [totalTracked, setTotalTracked] = useState(0);
  const [positions, setPositions] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [locationName, setLocationName] = useState('Locating...');
  const [astros, setAstros] = useState({ number: 0, people: [] });
  const [loading, setLoading] = useState(true);

  const updateLocation = async () => {
    try {
      const loc = await fetchISSLocation();
      if (loc) {
        setTotalTracked(prev => prev + 1);
        setPositions(prev => {
          const newPositions = [...prev, loc].slice(-15);
          
          let currentSpeed = speed || 27600; // Default or last speed
          
          if (prev.length > 0) {
            const lastLoc = prev[prev.length - 1];
            const dist = calculateDistance(lastLoc.lat, lastLoc.lng, loc.lat, loc.lng);
            const timeDiff = (loc.timestamp - lastLoc.timestamp) / 3600;
            if (timeDiff > 0) {
              currentSpeed = dist / timeDiff;
              setSpeed(currentSpeed);
            }
          }

          // Always dispatch an update to keep the chart moving
          window.dispatchEvent(new CustomEvent('iss-speed-update', { 
            detail: { 
              speed: currentSpeed, 
              lat: loc.lat,
              lng: loc.lng,
              timestamp: new Date(loc.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
            }
          }));
          
          return newPositions;
        });

        // Reverse Geocoding
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}&zoom=10&addressdetails=1`);
          const data = await res.json();
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.state || 'Remote Area';
            const country = data.address.country || '';
            setLocationName(`${city}${country ? ', ' + country : ''}`);
          } else {
            setLocationName("Over ocean / Remote area");
          }
        } catch (e) {
          setLocationName("Over ocean / Remote area");
        }
        setLoading(false);
      }
    } catch (err) {
      console.error("ISS Update Error:", err);
    }
  };

  const getAstros = async () => {
    const data = await fetchAstros();
    if (data) {
      setAstros(data);
      localStorage.setItem('astros_cache', JSON.stringify(data));
    }
  };

  useEffect(() => {
    updateLocation();
    getAstros();
    const interval = setInterval(updateLocation, 15000);
    return () => clearInterval(interval);
  }, []);

  const currentPos = positions.length > 0 ? positions[positions.length - 1] : { lat: 0, lng: 0 };
  const path = positions.map(p => [p.lat, p.lng]);

  return (
    <div className="bg-[#fff9f5] dark:bg-gray-800 rounded-2xl border border-[#eee4da] dark:border-gray-700 p-4 md:p-6 flex flex-col h-full shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-[#2c3e50] dark:text-white">ISS Live Tracking</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={updateLocation} 
            className="flex-1 sm:flex-none px-4 py-1.5 bg-white dark:bg-gray-700 border border-[#eee4da] dark:border-gray-600 rounded-full text-xs font-semibold text-gray-700 dark:text-white hover:bg-gray-50 transition"
          >
            Refresh Now
          </button>
          <div className="flex-1 sm:flex-none px-4 py-1.5 bg-white dark:bg-gray-700 border border-[#eee4da] dark:border-gray-600 rounded-full text-xs font-semibold text-gray-700 dark:text-white flex items-center justify-center gap-2">
            Auto: <span className="text-green-600 uppercase">ON</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { label: 'Lat / Lng', value: `${currentPos.lat.toFixed(3)}, ${currentPos.lng.toFixed(3)}` },
          { label: 'Speed', value: `${speed > 0 ? speed.toFixed(2) : '27600.00'}`, unit: 'km/h' },
          { label: 'Nearest Place', value: locationName, truncate: true },
          { label: 'Tracked', value: totalTracked },
        ].map((stat, i) => (
          <div key={i} className="bg-[#fdfbf7] dark:bg-gray-700 p-3 md:p-4 rounded-xl border border-[#f3ebdf] dark:border-gray-600">
            <p className="text-[9px] md:text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-sm md:text-base lg:text-lg font-bold text-gray-800 dark:text-white ${stat.truncate ? 'truncate' : ''}`} title={stat.value}>
              {stat.value} {stat.unit && <span className="text-[10px] md:text-xs font-medium">{stat.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-[300px] md:min-h-[400px] rounded-xl overflow-hidden border border-[#eee4da] dark:border-gray-600 relative z-0">
        {positions.length > 0 ? (
          <MapContainer 
            center={[currentPos.lat, currentPos.lng]} 
            zoom={3} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="dark:filter dark:invert dark:hue-rotate-180"
            />
            <ChangeView center={[currentPos.lat, currentPos.lng]} />
            <Marker position={[currentPos.lat, currentPos.lng]} icon={issIcon}>
              <Tooltip permanent direction="top" offset={[0, -10]}>
                ISS Location
              </Tooltip>
            </Marker>
            {path.length > 1 && <Polyline positions={path} color="#ff4d4d" weight={3} dashArray="5, 10" />}
          </MapContainer>
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-900 animate-pulse flex items-center justify-center text-gray-400 text-sm">
            Initializing Orbital Tracking...
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[#eee4da] dark:border-gray-700">
        <h3 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Astronauts on Craft ({astros.number})
        </h3>
        <div className="flex flex-wrap gap-2">
          {astros.people.length > 0 ? astros.people.map((p, i) => (
            <span key={i} className="px-3 py-1 bg-white dark:bg-gray-700 border border-[#eee4da] dark:border-gray-600 text-[10px] font-bold rounded-full text-gray-600 dark:text-gray-300 shadow-sm">
              {p.name}
            </span>
          )) : (
            Array(5).fill(0).map((_, i) => <div key={i} className="w-20 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />)
          )}
        </div>
      </div>
    </div>
  );
};

export default ISSDashboard;
