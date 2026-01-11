import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]); // Aici ținem lista de ID-uri
  const { currentUser } = useAuth();

  // Ascultăm schimbările din baza de date în timp real
  useEffect(() => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setFavorites(docSnap.data().favorites || []);
        } else {
          // Dacă utilizatorul nu are document creat în baza de date, îl creăm
          setDoc(doc(db, 'users', currentUser.uid), { favorites: [] });
        }
      });

      return unsubscribe;
    } else {
      setFavorites([]);
    }
  }, [currentUser]);

  // Funcție pentru a adăuga la favorite
  async function addToFavorites(recipeId) {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      favorites: arrayUnion(recipeId)
    });
  }

  // Funcție pentru a șterge de la favorite
  async function removeFromFavorites(recipeId) {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      favorites: arrayRemove(recipeId)
    });
  }

  // Verificăm dacă o rețetă e deja favorită (pentru a colora inimioara)
  function isFavorite(recipeId) {
    return favorites.includes(recipeId);
  }

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}