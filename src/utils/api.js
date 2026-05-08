// Proxy to handle CORS/Mixed Content for HTTP APIs
const SECURE_PROXY = 'https://api.allorigins.win/raw?url=';

// Fetch ISS Location
export const fetchISSLocation = async () => {
  try {
    const response = await fetch('http://api.open-notify.org/iss-now.json');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    if (data.message === 'success') {
      return {
        lat: parseFloat(data.iss_position.latitude),
        lng: parseFloat(data.iss_position.longitude),
        timestamp: data.timestamp
      };
    }
  } catch (error) {
    console.error("Error fetching ISS location:", error);
  }
  return null;
};

// Fetch People in Space
export const fetchAstros = async () => {
  try {
    const response = await fetch('http://api.open-notify.org/astros.json');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    if (data.message === 'success') {
      return {
        number: data.number,
        people: data.people
      };
    }
  } catch (error) {
    console.error("Error fetching astros:", error);
  }
  return null;
};

// Calculate Haversine distance
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
