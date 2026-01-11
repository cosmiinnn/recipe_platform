import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage'; 
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { toast } from 'react-hot-toast';

// Icons
import { FiClock, FiActivity, FiUser, FiCalendar, FiHeart, FiTrash2, FiEdit, FiThumbsUp } from 'react-icons/fi';

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Check if this recipe is already in favorites
  const isFav = isFavorite(id);

  // FETCH RECIPE DATA
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const docRef = doc(db, 'recipes', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRecipe({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error("Recipe not found!");
          navigate('/');
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
        toast.error("Error loading recipe details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate]);

  // 4. SETAREA INIȚIALĂ A LIKE-URILOR
  useEffect(() => {
    if (recipe) {
      setLikeCount(recipe.likes || 0);
      if (currentUser && (recipe.likedBy || []).includes(currentUser.uid)) {
        setIsLiked(true);
      }
    }
  }, [recipe, currentUser]);

  // Handle Like
  const handleLike = async () => {
    if (!currentUser) return toast.error("Please log in to like recipes.");
    if (likeLoading) return; 

    setLikeLoading(true);
    const recipeRef = doc(db, 'recipes', id);

    try {
      if (isLiked) {
        // UNLIKE
        await updateDoc(recipeRef, {
          likes: increment(-1),
          likedBy: arrayRemove(currentUser.uid)
        });
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        // LIKE
        await updateDoc(recipeRef, {
          likes: increment(1),
          likedBy: arrayUnion(currentUser.uid)
        });
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error updating like:", error);
      toast.error("Failed to update like.");
    } finally {
      setLikeLoading(false);
    }
  };

  // Handle Favorite Toggle
  const handleFavorite = () => {
    if (!currentUser) return toast.error("Please log in to save favorites.");
    
    if (isFav) {
      removeFromFavorites(id);
      toast.success("Removed from favorites.");
    } else {
      addToFavorites(id);
      toast.success("Added to favorites!");
    }
  };

  // Handle Delete Recipe
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) return;

    try {
      if (recipe.imageUrl) {
        const imageRef = ref(storage, recipe.imageUrl);
        
        await deleteObject(imageRef).catch((error) => {
           console.warn("Image not found in storage, skipping image deletion:", error);
        });
      }

      await deleteDoc(doc(db, 'recipes', id));
      
      toast.success("Recipe deleted successfully.");
      navigate('/');
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe.");
    }
  };

  if (loading) return <div className="text-center py-20 dark:text-white">Loading recipe...</div>;
  if (!recipe) return null;

  return (
    // Wrapper pentru fundalul întregii pagini
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* HEADER SECTION */}
        {/* Dark: bg-gray-800 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 transition-colors">
          <div className="relative h-64 md:h-96">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
              <div className="flex justify-between items-end">
                <div>
                  <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wide mb-3 inline-block">
                    {recipe.category}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 shadow-sm">
                    {recipe.title}
                  </h1>
                  
                  <div className="flex items-center text-gray-300 text-sm gap-4">
                    <span className="flex items-center gap-1">
                      <FiUser /> By {recipe.userName || 'Unknown Chef'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar /> {recipe.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 items-center">
                    
                  {/* LIKE BUTTON */}
                  <button 
                    onClick={handleLike}
                    disabled={likeLoading}
                    // Light: bg-white text-gray-600 | Dark: bg-gray-700 text-white
                    className={`flex items-center gap-2 px-4 py-3 rounded-full font-bold transition shadow-lg
                      ${isLiked 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    <FiThumbsUp className={isLiked ? 'fill-current' : ''} size={20} />
                    <span>{likeCount}</span>
                  </button>

                  {/* Edit & Delete Buttons */}
                  {currentUser && currentUser.uid === recipe.userId && (
                    <>
                      <button 
                        onClick={() => navigate(`/edit-recipe/${id}`)}
                        className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-blue-600 transition"
                        title="Edit Recipe"
                      >
                        <FiEdit size={24} />
                      </button>

                      <button 
                        onClick={handleDelete}
                        className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition"
                        title="Delete Recipe"
                      >
                        <FiTrash2 size={24} />
                      </button>
                    </>
                  )}
                  
                  {/* Favorite Button */}
                  <button 
                    onClick={handleFavorite}
                    // Light: bg-white | Dark: bg-gray-700 text-gray-200
                    className="p-3 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-full text-orange-600 hover:scale-110 transition shadow-lg"
                    title="Add to Favorites"
                  >
                    <FiHeart size={24} className={isFav ? "fill-red-500 text-red-500" : ""} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* INFO BAR */}
          {/* Light: bg-gray-50 | Dark: bg-gray-800/50 border-gray-700 */}
          <div className="grid grid-cols-3 border-b border-gray-100 dark:border-gray-700 divide-x divide-gray-100 dark:divide-gray-700 py-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-col items-center justify-center p-2">
              <FiClock className="text-orange-500 text-xl mb-1" />
              <span className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">Prep Time</span>
              <span className="font-bold text-gray-800 dark:text-white">{recipe.prepTime} mins</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <FiActivity className="text-orange-500 text-xl mb-1" />
              <span className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">Difficulty</span>
              <span className="font-bold text-gray-800 dark:text-white">{recipe.difficulty}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
               <span className={`text-2xl font-bold ${recipe.isVegetarian ? 'text-green-500' : 'text-gray-400 dark:text-gray-600'}`}>
                 {recipe.isVegetarian ? 'Yes' : 'No'}
               </span>
               <span className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium">Vegetarian</span>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-8">
            {/* Description Box */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">About this dish</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">"{recipe.description}"</p>
            </div>

            {/* Ingredients List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Ingredients</h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="w-2 h-2 mt-2 bg-orange-500 rounded-full flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN (Steps) */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Preparation Steps</h3>
              <div className="space-y-6">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    {/* Circle: Adjusted orange for dark mode contrast */}
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="pt-2">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}