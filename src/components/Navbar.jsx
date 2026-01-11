import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Import icons for visual appeal
import { FiMenu, FiX, FiPlusSquare, FiHeart, FiLogOut, FiUser, FiMoon, FiSun } from 'react-icons/fi';

import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Logout function
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
      navigate('/login'); // Redirect to login after logout
    } catch (error) {
      toast.error('Failed to log out.');
    }
  };

  return (
    // Dark: bg-gray-900
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link to="/" className="text-2xl font-bold text-orange-600 flex items-center gap-2">
            🍊 ZestyChef
          </Link>

          {/* DESKTOP MENU (Hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-6">

            {/* THEME TOGGLE BUTTON */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition"
              title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>

            {/* Explore Link - Dark: text-gray-300 */}
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition">
              Explore
            </Link>

            {/* Show these links only if user is LOGGED IN */}
            {currentUser ? (
              <>
                <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition">
                  My Recipes
                </Link>
                <Link to="/favorites" className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition flex items-center gap-1">
                  <FiHeart /> Favorites
                </Link>
                <Link 
                  to="/create-recipe" 
                  className="bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <FiPlusSquare /> Add Recipe
                </Link>
                
                {/* Separator vertical - Dark: border-gray-700 */}
                <div className="flex items-center gap-2 ml-4 border-l pl-4 border-gray-300 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden lg:block">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
                    title="Logout"
                  >
                    <FiLogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              /* Show these links if user is NOT logged in */
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-orange-600 font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition shadow-md">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON - Dark: text-gray-300 */}
          <div className="md:hidden flex items-center gap-4">
             {/* Adăugăm Theme Toggle și pe mobil, lângă hamburger */}
             <button 
              onClick={toggleTheme} 
              className="text-gray-600 dark:text-gray-300 hover:text-orange-600"
            >
              {theme === 'light' ? <FiMoon size={24} /> : <FiSun size={24} />}
            </button>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 dark:text-gray-300 hover:text-orange-600">
              {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU (Dropdown) */}
        {isMenuOpen && (
          // Dark: bg-gray-900 border-gray-700
          <div className="md:hidden bg-gray-50 dark:bg-gray-900 pb-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex flex-col space-y-3 p-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-700 dark:text-gray-300 hover:text-orange-600">Explore</Link>
              
              {currentUser ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-gray-700 dark:text-gray-300 hover:text-orange-600">My Recipes</Link>
                  <Link to="/favorites" onClick={() => setIsMenuOpen(false)} className="text-gray-700 dark:text-gray-300 hover:text-orange-600">Favorites</Link>
                  <Link to="/create-recipe" onClick={() => setIsMenuOpen(false)} className="text-orange-600 font-medium">Add Recipe</Link>
                  
                  {/* Dark: border-gray-700 */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Logged in as: {currentUser.email}</p>
                    <button onClick={handleLogout} className="text-red-500 hover:text-red-400 flex items-center gap-2">
                      <FiLogOut /> Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-center border border-orange-600 text-orange-600 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-800 transition">Login</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block text-center bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}