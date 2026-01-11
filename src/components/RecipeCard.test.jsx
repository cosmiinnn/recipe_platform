import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecipeCard from './RecipeCard';

// 1. simulate Favorites context
vi.mock('../context/FavoritesContext', () => ({
  useFavorites: () => ({
    isFavorite: () => false,       // recipe is not in favorites
    addToFavorites: vi.fn(),
    removeFromFavorites: vi.fn(),
  }),
}));

describe('RecipeCard Component', () => {
  
  // Fake Recipe
  const mockRecipe = {
    id: '1',
    title: 'Test Pizza',
    description: 'Delicious cheesy pizza',
    imageUrl: 'https://via.placeholder.com/150',
    category: 'Dinner',
    prepTime: 45,
    difficulty: 'Medium',
    likes: 10
  };

  it('renders recipe details correctly', () => {
    // 2. Randăm componenta înfășurată în BrowserRouter (pentru că are Link)
    render(
      <BrowserRouter>
        <RecipeCard recipe={mockRecipe} />
      </BrowserRouter>
    );

    // 3. Verificăm dacă textele apar pe ecran
    expect(screen.getByText('Test Pizza')).toBeInTheDocument();
    expect(screen.getByText('Delicious cheesy pizza')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    
    // Verificăm dacă timpul e afișat (45m)
    expect(screen.getByText('45m')).toBeInTheDocument();
  });

});