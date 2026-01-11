import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Pentru notificări frumoase

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';

// Componente
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pagini
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateRecipe from './pages/CreateRecipe';
import RecipeDetails from './pages/RecipeDetails';
import Favorites from './pages/Favorites';

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider trebuie să fie părintele tuturor ca să știm cine e logat */}
      <AuthProvider>
        {/* FavoritesProvider are nevoie de Auth, deci e copilul lui */}
        <FavoritesProvider>
          
          <ThemeProvider>
            {/* Toaster e pentru notificări pop-up */}
            <Toaster position="top-center" />
            
            <Routes>
              {/* Layout va aplica Navbar-ul pe toate paginile de mai jos */}
              <Route path="/" element={<Layout />}>
                
                {/* Rute Publice (accesibile oricui) */}
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="recipe/:id" element={<RecipeDetails />} />

                {/* Rute Protejate (accesibile doar dacă ești logat) */}
                <Route 
                  path="dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="create-recipe" 
                  element={
                    <ProtectedRoute>
                      <CreateRecipe />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="edit-recipe/:id" 
                  element={
                  <ProtectedRoute>
                    <CreateRecipe />
                  </ProtectedRoute>
                  } 
                />
                <Route 
                  path="favorites" 
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  } 
                />

              </Route>
            </Routes>
          </ThemeProvider>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;