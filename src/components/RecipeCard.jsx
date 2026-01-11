import { Link } from 'react-router-dom';
import { FiClock, FiHeart, FiActivity, FiThumbsUp } from 'react-icons/fi';
import { useFavorites } from '../context/FavoritesContext';

export default function RecipeCard({ recipe }) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const isFav = isFavorite(recipe.id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    if (isFav) {
      removeFromFavorites(recipe.id);
    } else {
      addToFavorites(recipe.id);
    }
  };

  return (
    // CONTENITOR PRINCIPAL:
    // Light: bg-white | Dark: bg-gray-800
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 flex flex-col h-full relative group border border-transparent dark:border-gray-700">
      
      <Link to={`/recipe/${recipe.id}`} className="flex-1 flex flex-col">
        
        {/* IMAGINE */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          {/* BADGE CATEGORIE: */}
          {/* Light: bg-white/90 | Dark: bg-gray-900/90 */}
          <span className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-orange-600 dark:text-orange-500 uppercase tracking-wider shadow-sm">
            {recipe.category}
          </span>
        </div>

        {/* CONȚINUT TEXT */}
        <div className="p-4 flex flex-col flex-1">
          {/* TITLU: */}
          {/* Light: text-gray-800 | Dark: text-gray-100 */}
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-1" title={recipe.title}>
            {recipe.title}
          </h3>
          
          {/* DESCRIERE: */}
          {/* Light: text-gray-600 | Dark: text-gray-400 */}
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
            {recipe.description}
          </p>

          {/* INFO FOOTER (Time, Likes, Difficulty) */}
          {/* Border-top pentru separare vizuală */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1" title="Prep time">
                <FiClock className="text-orange-500" />
                <span>{recipe.prepTime}m</span>
              </div>
              <div className="flex items-center gap-1" title="Likes">
                 <FiThumbsUp className="text-blue-500 dark:text-blue-400" />
                 <span>{recipe.likes || 0}</span>
              </div>
            </div>
            
            {/* BADGE DIFICULTATE: */}
            {/* Light: bg-gray-100 | Dark: bg-gray-700 */}
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium dark:text-gray-300">
              <FiActivity className="text-gray-400 dark:text-gray-400" />
              <span>{recipe.difficulty}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* BUTON FAVORITE: */}
      {/* Light: bg-white/80 | Dark: bg-gray-900/80 */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-700 transition"
      >
        <FiHeart 
          size={20} 
          className={`${isFav ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'} transition-colors`} 
        />
      </button>
    </div>
  );
}