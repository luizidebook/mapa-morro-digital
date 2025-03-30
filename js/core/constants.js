// Chaves de API
export const ORS_API_KEY =
  '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';
export const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
export const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Queries Overpass
export const queries = {
  'touristSpots-submenu':
    '[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.913);out body;',
  'tours-submenu':
    '[out:json];node["tourism"="information"](around:10000,-13.376,-38.913);out body;',
  'beaches-submenu':
    '[out:json];node["natural"="beach"](around:15000,-13.376,-38.913);out body;',
  'nightlife-submenu':
    '[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.913);out body;',
  'restaurants-submenu':
    '[out:json];node["amenity"="restaurant"](around:15000,-13.376,-38.913);out body;',
  'inns-submenu':
    '[out:json];node["tourism"="hotel"](around:15000,-13.376,-38.913);out body;',
  'shops-submenu':
    '[out:json];node["shop"](around:15000,-13.376,-38.913);out body;',
  'emergencies-submenu':
    '[out:json];node["amenity"~"hospital|police"](around:10000,-13.376,-38.913);out body;',
  'tips-submenu':
    '[out:json];node["tips"](around:10000,-13.376,-38.913);out body;',
  'about-submenu':
    '[out:json];node["about"](around:10000,-13.376,-38.913);out body;',
  'education-submenu':
    '[out:json];node["education"](around:10000,-13.376,-38.913);out body;',
};

// Coordenadas e gamificação
export const TOCA_DO_MORCEGO_COORDS = { lat: -13.3782, lon: -38.914 };
export const PARTNER_CHECKIN_RADIUS = 50;
