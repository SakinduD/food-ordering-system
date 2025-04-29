import { useState } from 'react';

const categories = [
  { label: 'All', value: '', icon: '🍽️' },
  { label: 'Sri Lankan Traditional', value: 'Sri Lankan Traditional', icon: '🍛' },
  { label: 'Rice & Curry', value: 'Rice & Curry', icon: '🍚' },
  { label: 'Kottu & Roti', value: 'Kottu & Roti', icon: '🥘' },
  { label: 'Seafood Special', value: 'Seafood Special', icon: '🦐' },
  { label: 'Street Food', value: 'Street Food', icon: '🌯' },
  { label: 'Desserts & Sweets', value: 'Desserts & Sweets', icon: '🍮' },
  { label: 'Beverages', value: 'Beverages', icon: '🥤' },
  { label: 'Burgers', value: 'Burgers', icon: '🍔' },
  { label: 'Vegetarian & Vegan', value: 'Vegetarian & Vegan', icon: '🥗' },
  { label: 'Snacks & Short Eats', value: 'Snacks & Short Eats', icon: '🍥' },
];

const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onSelectCategory(category.value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border 
          ${
            selectedCategory === category.value
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-orange-100'
          } transition`}
        >
          <span>{category.icon}</span>
          <span className="text-sm font-medium">{category.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
