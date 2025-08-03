// Sample menu data for development
// In production, this will come from the database

export interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: 'MAIN_COURSE' | 'BEVERAGES' | 'DESSERTS' | 'SNACKS';
  isAvailable: boolean;
  variants: MenuItemVariant[];
}

export const sampleMenuItems: MenuItem[] = [
  // Main Course
  {
    id: '1',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with tender chicken pieces, served with raita and boiled egg',
    basePrice: 120,
    category: 'MAIN_COURSE',
    isAvailable: true,
    variants: [
      { id: '1a', name: 'Regular', price: 120, isAvailable: true },
      { id: '1b', name: 'Large', price: 150, isAvailable: true },
      { id: '1c', name: 'Family Pack', price: 280, isAvailable: true },
    ],
  },
  {
    id: '2',
    name: 'Paneer Butter Masala',
    description: 'Creamy tomato curry with soft paneer cubes, served with 2 rotis',
    basePrice: 90,
    category: 'MAIN_COURSE',
    isAvailable: true,
    variants: [
      { id: '2a', name: 'With 2 Rotis', price: 90, isAvailable: true },
      { id: '2b', name: 'With Rice', price: 95, isAvailable: true },
      { id: '2c', name: 'Extra Paneer', price: 110, isAvailable: true },
    ],
  },
  {
    id: '3',
    name: 'Mixed Veg Curry',
    description: 'Fresh seasonal vegetables cooked in aromatic spices',
    basePrice: 70,
    category: 'MAIN_COURSE',
    isAvailable: true,
    variants: [
      { id: '3a', name: 'Regular', price: 70, isAvailable: true },
      { id: '3b', name: 'With Rice', price: 80, isAvailable: true },
    ],
  },
  {
    id: '4',
    name: 'Dal Tadka',
    description: 'Yellow lentils tempered with cumin and garlic, served with rice',
    basePrice: 60,
    category: 'MAIN_COURSE',
    isAvailable: false, // Sold out
    variants: [
      { id: '4a', name: 'With Rice', price: 60, isAvailable: false },
      { id: '4b', name: 'With Rotis', price: 65, isAvailable: false },
    ],
  },

  // Beverages
  {
    id: '5',
    name: 'Fresh Lime Water',
    description: 'Refreshing lime water with mint and a hint of salt',
    basePrice: 25,
    category: 'BEVERAGES',
    isAvailable: true,
    variants: [
      { id: '5a', name: 'Sweet', price: 25, isAvailable: true },
      { id: '5b', name: 'Salted', price: 25, isAvailable: true },
      { id: '5c', name: 'Mint Special', price: 30, isAvailable: true },
    ],
  },
  {
    id: '6',
    name: 'Masala Chai',
    description: 'Traditional Indian tea brewed with aromatic spices',
    basePrice: 15,
    category: 'BEVERAGES',
    isAvailable: true,
    variants: [
      { id: '6a', name: 'Regular', price: 15, isAvailable: true },
      { id: '6b', name: 'Strong', price: 18, isAvailable: true },
    ],
  },
  {
    id: '7',
    name: 'Mango Lassi',
    description: 'Creamy yogurt drink blended with fresh mango pulp',
    basePrice: 35,
    category: 'BEVERAGES',
    isAvailable: true,
    variants: [
      { id: '7a', name: 'Regular', price: 35, isAvailable: true },
      { id: '7b', name: 'Large', price: 50, isAvailable: true },
    ],
  },

  // Desserts
  {
    id: '8',
    name: 'Gulab Jamun',
    description: 'Soft milk dumplings soaked in aromatic sugar syrup',
    basePrice: 40,
    category: 'DESSERTS',
    isAvailable: true,
    variants: [
      { id: '8a', name: '2 Pieces', price: 40, isAvailable: true },
      { id: '8b', name: '4 Pieces', price: 70, isAvailable: true },
    ],
  },
  {
    id: '9',
    name: 'Rasgulla',
    description: 'Spongy cottage cheese balls in sweet syrup',
    basePrice: 35,
    category: 'DESSERTS',
    isAvailable: true,
    variants: [
      { id: '9a', name: '2 Pieces', price: 35, isAvailable: true },
      { id: '9b', name: '4 Pieces', price: 60, isAvailable: true },
    ],
  },

  // Snacks
  {
    id: '10',
    name: 'Samosa',
    description: 'Crispy fried pastry filled with spiced potatoes and peas',
    basePrice: 20,
    category: 'SNACKS',
    isAvailable: true,
    variants: [
      { id: '10a', name: '2 Pieces', price: 20, isAvailable: true },
      { id: '10b', name: '4 Pieces', price: 35, isAvailable: true },
    ],
  },
  {
    id: '11',
    name: 'Aloo Tikki',
    description: 'Pan-fried potato patties served with chutneys',
    basePrice: 30,
    category: 'SNACKS',
    isAvailable: true,
    variants: [
      { id: '11a', name: '2 Pieces', price: 30, isAvailable: true },
      { id: '11b', name: 'With Extra Chutney', price: 35, isAvailable: true },
    ],
  },
  {
    id: '12',
    name: 'Bread Pakora',
    description: 'Bread slices stuffed with spiced potato filling and deep fried',
    basePrice: 25,
    category: 'SNACKS',
    isAvailable: true,
    variants: [
      { id: '12a', name: '2 Pieces', price: 25, isAvailable: true },
      { id: '12b', name: '4 Pieces', price: 45, isAvailable: true },
    ],
  },
];