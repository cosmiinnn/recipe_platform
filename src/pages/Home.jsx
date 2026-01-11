import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import RecipeCard from '../components/RecipeCard';
import { FiSearch, FiLoader, FiFilter, FiX, FiCheck, FiArrowDown } from 'react-icons/fi';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE-URI PENTRU FILTRE MULTIPLE ---
  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  // --- STATE NOU PENTRU PAGINARE ---
  const [visibleCount, setVisibleCount] = useState(6);
  const RECIPES_PER_PAGE = 6;

  // Fetch Recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const recipesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecipes(recipesData);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // --- RESETARE PAGINARE LA FILTRARE ---
  useEffect(() => {
    setVisibleCount(RECIPES_PER_PAGE);
  }, [searchTerm, selectedCategories, selectedDifficulties, sortOption]);

  // --- LOGICA DE TOGGLE ---
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedDifficulties([]);
    setSearchTerm('');
    setVisibleCount(RECIPES_PER_PAGE);
  };

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    } else {
      setSelectedCategories(prev => [...prev, category]);
    }
  };

  const handleDifficultyToggle = (difficulty) => {
    if (selectedDifficulties.includes(difficulty)) {
      setSelectedDifficulties(prev => prev.filter(d => d !== difficulty));
    } else {
      setSelectedDifficulties(prev => [...prev, difficulty]);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + RECIPES_PER_PAGE);
  };

  // --- LOGICA COMBINATĂ ---
  // 1. Filtrăm și Sortăm TOATE rețetele (Variabila redenumită)
  const filteredAndSortedRecipes = recipes
    .filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(recipe.category);
      const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(recipe.difficulty);

      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      if (sortOption === 'newest') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      if (sortOption === 'oldest') return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      if (sortOption === 'most-liked') return (b.likes || 0) - (a.likes || 0);
      return 0;
    });

  // 2. PAGINAREA VIZUALĂ (Slicing)
  const visibleRecipes = filteredAndSortedRecipes.slice(0, visibleCount);
  
  const hasMoreRecipes = visibleCount < filteredAndSortedRecipes.length;

  const categoriesList = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'];
  const difficultiesList = ['Easy', 'Medium', 'Hard'];
  const isAllSelected = selectedCategories.length === 0 && selectedDifficulties.length === 0 && searchTerm === '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-200">
      
      {/* HERO SECTION */}
      <div className="bg-orange-600 text-white py-16 px-4 mb-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">Find your next favorite meal</h1>
          <p className="text-orange-100 text-lg">Discover tasty recipes from our community</p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl" />
            <input 
              type="text" 
              placeholder="Search by recipe name or ingredient..."
              className="w-full pl-12 pr-4 py-4 rounded-full text-gray-800 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-900 shadow-lg placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTERS & SORT BAR */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        
        <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
          
          {/* ZONA DE FILTRE (Grupate) */}
          <div className="flex flex-wrap gap-3 justify-center items-center">
            
            <button
              onClick={handleResetFilters}
              className={`px-5 py-2 rounded-full text-sm font-bold transition border shadow-sm
                ${isAllSelected
                  ? 'bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-gray-900 dark:border-white ring-2 ring-gray-300 dark:ring-gray-600' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'}`}
            >
              All
            </button>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categoriesList.map((cat) => {
                const isActive = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryToggle(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition border flex items-center gap-1.5
                      ${isActive 
                        ? 'bg-orange-100 text-orange-700 border-orange-300 shadow-sm dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700' 
                        : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'}`}
                  >
                    {isActive && <FiCheck size={14} />}
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>

            <div className="flex flex-wrap gap-2 justify-center">
              {difficultiesList.map((diff) => {
                const isActive = selectedDifficulties.includes(diff);
                let activeClass = 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700';
                if (diff === 'Medium') activeClass = 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700';
                if (diff === 'Hard') activeClass = 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700';

                return (
                  <button
                    key={diff}
                    onClick={() => handleDifficultyToggle(diff)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition border flex items-center gap-1.5
                      ${isActive 
                        ? `${activeClass} shadow-sm` 
                        : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'}`}
                  >
                    {isActive && <FiCheck size={14} />}
                    {diff}
                  </button>
                );
              })}
            </div>

          </div>

          {/* SORT DROPDOWN */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm whitespace-nowrap min-w-[200px]">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <FiFilter />
              <span className="text-sm font-medium">Sort by:</span>
            </div>
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-transparent text-gray-800 dark:text-white text-sm font-semibold outline-none cursor-pointer flex-1 text-center appearance-none"
              style={{ textAlignLast: 'center' }}
            >
              <option value="newest" className="dark:bg-gray-800">Newest First</option>
              <option value="oldest" className="dark:bg-gray-800">Oldest First</option>
              <option value="most-liked" className="dark:bg-gray-800">Most Popular</option>
            </select>
          </div>

        </div>
      </div>

      {/* RECIPES GRID */}
      <div className="max-w-6xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FiLoader className="animate-spin text-orange-600 text-4xl" />
          </div>
        ) : filteredAndSortedRecipes.length > 0 ? ( // <--- AICI ERA PROBLEMA (Am corectat)
          <>
            {/* LISTA DE REȚETE VIZIBILE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>

            {/* BUTONUL LOAD MORE */}
            {hasMoreRecipes && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={handleLoadMore}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition transform hover:-translate-y-1"
                >
                  <FiArrowDown /> Load More Recipes
                </button>
              </div>
            )}
            
            {!hasMoreRecipes && visibleRecipes.length > 6 && (
              <div className="text-center mt-12 text-gray-400 dark:text-gray-500 text-sm">
                You've reached the end of the list. 🍳
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4 transition-colors">
              <FiSearch className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No recipes found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
              We couldn't find any recipes matching your current filters. Try removing some filters to see more results.
            </p>
            <button 
              onClick={handleResetFilters}
              className="text-orange-600 font-medium hover:text-orange-700 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}