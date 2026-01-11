import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useFavorites } from '../context/FavoritesContext';
import RecipeCard from '../components/RecipeCard';
import { Link } from 'react-router-dom';
import { FiHeart, FiLoader, FiArrowLeft } from 'react-icons/fi';

export default function Favorites() {
  const { favorites } = useFavorites(); 
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!favorites || favorites.length === 0) {
        setFavoriteRecipes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const recipePromises = favorites.map(id => getDoc(doc(db, 'recipes', id)));
        const recipeSnapshots = await Promise.all(recipePromises);

        const recipesData = recipeSnapshots
          .filter(snap => snap.exists())
          .map(snap => ({ id: snap.id, ...snap.data() }));

        setFavoriteRecipes(recipesData);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favorites]);

  // FIX: Am adăugat clasele de background și pe ecranul de Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center transition-colors duration-200">
        <FiLoader className="animate-spin text-orange-600 text-4xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8 border-b border-gray-200 dark:border-gray-700 pb-4 transition-colors">
          <FiHeart className="text-red-500 text-3xl fill-current" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Favorite Recipes</h1>
          <span className="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-bold transition-colors">
            {favoriteRecipes.length}
          </span>
        </div>

        {/* CONTENT */}
        {favoriteRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoriteRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-full mb-4 transition-colors">
              <FiHeart className="text-orange-300 text-4xl" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No favorites yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
              It looks like you haven't saved any recipes yet. Explore our collection and find something delicious!
            </p>
            
            <Link 
              to="/" 
              className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
            >
              <FiArrowLeft /> Back to Recipes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}