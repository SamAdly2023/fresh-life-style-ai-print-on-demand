
import React from 'react';
import { Product, Design } from './types';

// Helper function to generate random 2-word product names
const ADJECTIVES = ['Bold', 'Fresh', 'Urban', 'Cosmic', 'Neon', 'Mystic', 'Wild', 'Epic', 'Vivid', 'Retro', 'Prime', 'Royal', 'Swift', 'Bright', 'Cool'];
const NOUNS = ['Design', 'Art', 'Style', 'Vibe', 'Wave', 'Flow', 'Edge', 'Spirit', 'Soul', 'Dream', 'Vision', 'Spark', 'Aura', 'Blend', 'Pulse'];

export const generateProductName = (): string => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
};

export const PRODUCTS: Product[] = [];

// Gallery designs from local product images
export const GALLERY_DESIGNS: Design[] = [
  { id: 'g1', imageUrl: '/product-images/Whisk_02777c7fd9d84418784454d6d4c9d346dr.png', name: 'Cosmic Wave', author: 'Fresh Life', isAI: true },
  { id: 'g2', imageUrl: '/product-images/Whisk_0dadb5a2e69180a8e594d5b8ae310b62dr.png', name: 'Urban Spirit', author: 'Fresh Life', isAI: true },
  { id: 'g3', imageUrl: '/product-images/Whisk_14d1fcc623417209d61473741de7ecf6dr.png', name: 'Neon Dreams', author: 'Fresh Life', isAI: true },
  { id: 'g4', imageUrl: '/product-images/Whisk_1823fed69fadb60adb140c4648993831dr.png', name: 'Wild Edge', author: 'Fresh Life', isAI: true },
  { id: 'g5', imageUrl: '/product-images/Whisk_26208efbed8f6d89910450f86aec72cfdr.png', name: 'Mystic Flow', author: 'Fresh Life', isAI: true },
  { id: 'g6', imageUrl: '/product-images/Whisk_29a02f3ce6fdcea904c45b46f0ad0c14dr.png', name: 'Epic Vision', author: 'Fresh Life', isAI: true },
  { id: 'g7', imageUrl: '/product-images/Whisk_551823eb8e2ae28a8204631fe8aaca3edr.png', name: 'Retro Pulse', author: 'Fresh Life', isAI: true },
  { id: 'g8', imageUrl: '/product-images/Whisk_55877fa302156539e334fb6400b73152dr.png', name: 'Bold Aura', author: 'Fresh Life', isAI: true },
  { id: 'g9', imageUrl: '/product-images/Whisk_624e903aa73f8b0a8654f94e7fe050dadr.png', name: 'Fresh Spark', author: 'Fresh Life', isAI: true },
  { id: 'g10', imageUrl: '/product-images/Whisk_7aecc384fdeb734bf414897788ce4c0fdr.png', name: 'Prime Soul', author: 'Fresh Life', isAI: true },
  { id: 'g11', imageUrl: '/product-images/Whisk_7eddde20a207e50b3414352e9c83a79fdr.png', name: 'Swift Blend', author: 'Fresh Life', isAI: true },
  { id: 'g12', imageUrl: '/product-images/Whisk_85779c7d665abf9bd7a43239f8b25890dr.png', name: 'Royal Vibe', author: 'Fresh Life', isAI: true },
  { id: 'g13', imageUrl: '/product-images/Whisk_aa011ca52b89f108afc4786cec2874a1dr.png', name: 'Vivid Art', author: 'Fresh Life', isAI: true },
  { id: 'g14', imageUrl: '/product-images/Whisk_d8fc26c791200cb8b4e410595739658adr.png', name: 'Cool Style', author: 'Fresh Life', isAI: true },
  { id: 'g15', imageUrl: '/product-images/Whisk_d95a884127f694cbfcc453b10d7e4fa3dr.png', name: 'Bright Wave', author: 'Fresh Life', isAI: true },
  { id: 'g16', imageUrl: '/product-images/Whisk_da365d3f22b446391a54cf2e798c592ddr.png', name: 'Urban Flow', author: 'Fresh Life', isAI: true },
  { id: 'g17', imageUrl: '/product-images/Whisk_ec43d55b981ba4dbd7f4b933a35c64b5dr.png', name: 'Neon Edge', author: 'Fresh Life', isAI: true },
  { id: 'g18', imageUrl: '/product-images/Whisk_ef3f78909d7bd47bb6347496ac112c26dr.png', name: 'Cosmic Spirit', author: 'Fresh Life', isAI: true },
];

export const COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Red', hex: '#FF0000' }
];

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
