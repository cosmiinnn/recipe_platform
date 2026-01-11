import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import { Link } from 'react-router-dom';
import { FiPlusSquare, FiLoader, FiBookOpen } from 'react-icons/fi';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRecipes = async () => {
      try {
        const q = query(
          collection(db, 'recipes'),
          where("userId", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const recipesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        recipesData.sort((a, b) => b.createdAt - a.createdAt);

        setMyRecipes(recipesData);
      } catch (error) {
        console.error("Error fetching my recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchMyRecipes();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <FiLoader className="animate-spin text-orange-600 text-4xl" />
      </div>
    );
  }

  return (
    // Dark: bg-gray-900
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* HEADER & STATS */}
        {/* Dark: bg-gray-800 border-gray-700 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Chef Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your shared recipes</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="block text-2xl font-bold text-orange-600 dark:text-orange-500">{myRecipes.length}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Recipes Created</span>
            </div>
            
            <Link 
              to="/create-recipe" 
              className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition shadow-md"
            >
              <FiPlusSquare /> Create New
            </Link>
          </div>
        </div>

        {/* CONTENT GRID */}
        {myRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          /* Empty State */
          // Dark: bg-gray-800 border-gray-700
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            
            {/* Icon Circle: Dark uses transparent blue */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4 transition-colors">
              <FiBookOpen className="text-blue-400 dark:text-blue-300 text-4xl" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">You haven't posted any recipes yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
              Share your culinary skills with the world! Click the button below to add your first dish.
            </p>
            
            <Link 
              to="/create-recipe" 
              // Button: Light uses orange-100 | Dark uses orange-900 with transparency
              className="flex items-center gap-2 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-6 py-3 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition font-medium"
            >
              <FiPlusSquare /> Start Creating
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}