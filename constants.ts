import { Planet } from './types';

export const SUN_DATA: Planet = {
  name: 'El Sol',
  size: 'w-24 h-24', 
  orbitSize: 0,
  speed: 0,
  description: 'La Estrella Madre. Fuente de vida.',
  texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/600px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg'
};

export const PLANETS: Planet[] = [
  { 
    name: 'Mercurio', 
    size: 'w-4 h-4', 
    orbitSize: 14, 
    speed: 8, 
    description: 'El planeta más pequeño.',
    texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Mercury_in_color_-_Prockter07-edit1.jpg/600px-Mercury_in_color_-_Prockter07-edit1.jpg'
  },
  { 
    name: 'Venus', 
    size: 'w-6 h-6', 
    orbitSize: 20, 
    speed: 12, 
    description: 'El planeta más caluroso.',
    texture: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg'
  },
  { 
    name: 'Tierra', 
    size: 'w-7 h-7', 
    orbitSize: 28, 
    speed: 20, 
    description: 'Nuestro hogar.',
    texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/600px-The_Earth_seen_from_Apollo_17.jpg'
  },
  { 
    name: 'Marte', 
    size: 'w-5 h-5', 
    orbitSize: 36, 
    speed: 30, 
    description: 'El Planeta Rojo.',
    texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/600px-OSIRIS_Mars_true_color.jpg'
  },
  { 
    name: 'Júpiter', 
    size: 'w-16 h-16', 
    orbitSize: 52, 
    speed: 50, 
    description: 'Gigante gaseoso.',
    texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/600px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg'
  },
  { 
    name: 'Saturno', 
    size: 'w-14 h-14', 
    orbitSize: 68, 
    speed: 70, 
    description: 'El señor de los anillos.',
    hasRings: true,
    tilt: 0,
    textureZoom: '210%', 
    texture: 'https://danielmarin.naukas.com/files/2019/01/saturn_r_edge_on.jpg'
  },
  { 
    name: 'Urano', 
    size: 'w-10 h-10', 
    orbitSize: 82, 
    speed: 90, 
    description: 'Gigante de hielo.',
    textureZoom: '120%', // Zoom reducido a 120% a petición del usuario
    texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus2.jpg/600px-Uranus2.jpg'
  },
  { 
    name: 'Neptuno', 
    size: 'w-10 h-10', 
    orbitSize: 94, 
    speed: 110, 
    description: 'Ventoso y frío.',
    texture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg/600px-Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg'
  },
];