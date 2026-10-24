export const localPlaces = [
  { name: 'Mumbai, Maharashtra, India', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi, India', lat: 28.6139, lng: 77.209 },
  { name: 'Bengaluru, Karnataka, India', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad, Telangana, India', lat: 17.385, lng: 78.4867 },
  { name: 'Chennai, Tamil Nadu, India', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata, West Bengal, India', lat: 22.5726, lng: 88.3639 },
  { name: 'Pune, Maharashtra, India', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad, Gujarat, India', lat: 23.0225, lng: 72.5714 },
  { name: 'Jaipur, Rajasthan, India', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow, Uttar Pradesh, India', lat: 26.8467, lng: 80.9462 },
  { name: 'Surat, Gujarat, India', lat: 21.1702, lng: 72.8311 },
  { name: 'Nagpur, Maharashtra, India', lat: 21.1458, lng: 79.0882 },
  { name: 'Indore, Madhya Pradesh, India', lat: 22.7196, lng: 75.8577 },
  { name: 'Bhopal, Madhya Pradesh, India', lat: 23.2599, lng: 77.4126 },
  { name: 'Patna, Bihar, India', lat: 25.5941, lng: 85.1376 },
  { name: 'Vadodara, Gujarat, India', lat: 22.3072, lng: 73.1812 },
  { name: 'Coimbatore, Tamil Nadu, India', lat: 11.0168, lng: 76.9558 },
  { name: 'Kochi, Kerala, India', lat: 9.9312, lng: 76.2673 },
  { name: 'Thiruvananthapuram, Kerala, India', lat: 8.5241, lng: 76.9366 },
  { name: 'Chandigarh, India', lat: 30.7333, lng: 76.7794 },
  { name: 'Noida, Uttar Pradesh, India', lat: 28.5355, lng: 77.391 },
  { name: 'Gurugram, Haryana, India', lat: 28.4595, lng: 77.0266 },
  { name: 'Thane, Maharashtra, India', lat: 19.2183, lng: 72.9781 },
  { name: 'Nashik, Maharashtra, India', lat: 19.9975, lng: 73.7898 },
  { name: 'Visakhapatnam, Andhra Pradesh, India', lat: 17.6868, lng: 83.2185 },
  { name: 'Madurai, Tamil Nadu, India', lat: 9.9252, lng: 78.1198 },
  { name: 'Raipur, Chhattisgarh, India', lat: 21.2514, lng: 81.6296 },
  { name: 'Ranchi, Jharkhand, India', lat: 23.3441, lng: 85.3096 },
  { name: 'Guwahati, Assam, India', lat: 26.1445, lng: 91.7362 },
  { name: 'Bhubaneswar, Odisha, India', lat: 20.2961, lng: 85.8245 },
  { name: 'Dehradun, Uttarakhand, India', lat: 30.3165, lng: 78.0322 },
  { name: 'Mysuru, Karnataka, India', lat: 12.2958, lng: 76.6394 },
  { name: 'Panaji, Goa, India', lat: 15.4909, lng: 73.8278 },
  { name: 'Amritsar, Punjab, India', lat: 31.634, lng: 74.8723 },
  { name: 'Varanasi, Uttar Pradesh, India', lat: 25.3176, lng: 82.9739 },
  { name: 'Agra, Uttar Pradesh, India', lat: 27.1767, lng: 78.0081 },
];

const placeLabel = (properties) => {
  const parts = [properties.name, properties.city, properties.state, properties.country].filter(Boolean);
  return parts.filter((part, index) => parts.indexOf(part) === index).join(', ');
};

const localMatches = (query) => {
  const needle = query.trim().toLowerCase();
  const list = needle
    ? localPlaces.filter((place) => place.name.toLowerCase().includes(needle))
    : localPlaces;
  return list.slice(0, 8);
};

export const searchPlaces = async (query) => {
  const local = localMatches(query);
  const needle = query.trim();
  if (needle.length < 2) return local;
  try {
    const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(needle)}&limit=6&lang=en`);
    if (!response.ok) return local;
    const data = await response.json();
    const remote = (data.features || []).map((feature) => ({
      name: placeLabel(feature.properties || {}),
      lat: feature.geometry?.coordinates?.[1],
      lng: feature.geometry?.coordinates?.[0],
    })).filter((place) => place.name && Number.isFinite(place.lat) && Number.isFinite(place.lng));
    const seen = new Set(local.map((place) => place.name.toLowerCase()));
    remote.forEach((place) => {
      if (!seen.has(place.name.toLowerCase())) {
        seen.add(place.name.toLowerCase());
        local.push(place);
      }
    });
    return local.slice(0, 8);
  } catch {
    return local;
  }
};
