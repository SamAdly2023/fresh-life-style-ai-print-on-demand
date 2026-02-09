
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

export const GALLERY_DESIGNS: Design[] = [];

export const COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Red', hex: '#FF0000' }
];

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
