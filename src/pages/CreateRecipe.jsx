import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';
import { FiUpload, FiPlus, FiTrash2, FiClock, FiActivity, FiX } from 'react-icons/fi';

export default function CreateRecipe() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // --- Form State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [category, setCategory] = useState('Breakfast');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [ingredients, setIngredients] = useState(['']); 
  const [steps, setSteps] = useState(['']); 

  // Image State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  // --- 1. Load Data if Editing OR Reset if Creating ---
  useEffect(() => {
    if (id) {
      // --- MOD EDITARE ---
      setIsEditMode(true);
      const fetchRecipeToEdit = async () => {
        try {
          const docRef = doc(db, 'recipes', id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            if (data.userId !== currentUser.uid) {
              toast.error("You are not authorized to edit this recipe.");
              navigate('/');
              return;
            }

            // Populăm datele existente
            setTitle(data.title);
            setDescription(data.description);
            setPrepTime(data.prepTime);
            setDifficulty(data.difficulty);
            setCategory(data.category);
            setIsVegetarian(data.isVegetarian);
            setIngredients(data.ingredients);
            setSteps(data.steps);
            setExistingImageUrl(data.imageUrl);
            setImagePreview(data.imageUrl);
          } else {
            toast.error("Recipe not found.");
            navigate('/');
          }
        } catch (error) {
          console.error("Error fetching recipe:", error);
          toast.error("Error loading recipe data.");
        }
      };
      fetchRecipeToEdit();
    } else {
      // --- MOD CREARE (RESET) ---
      setIsEditMode(false);
      setTitle('');
      setDescription('');
      setPrepTime('');
      setDifficulty('Medium');
      setCategory('Breakfast');
      setIsVegetarian(false);
      setIngredients(['']);
      setSteps(['']);
      setImageFile(null);
      setImagePreview(null);
      setExistingImageUrl(null);
    }
  }, [id, currentUser, navigate]);

  // --- Handlers ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) return toast.error("Image size must be less than 2MB");
    if (!file.type.startsWith('image/')) return toast.error("Please upload a valid image file");

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = (e) => {
    e.preventDefault(); 
    setImageFile(null);      
    setImagePreview(null);   
    setExistingImageUrl(null); 
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };
  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));

  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };
  const addStep = () => setSteps([...steps, '']);
  const removeStep = (index) => setSteps(steps.filter((_, i) => i !== index));

  // --- Submit Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !prepTime) {
      return toast.error("Please fill in all required fields.");
    }
    if (ingredients.some(i => i.trim() === '')) {
      return toast.error("Please fill in all ingredients or remove empty ones.");
    }
    if (steps.some(s => s.trim() === '')) {
      return toast.error("Please fill in all preparation steps.");
    }
    if (!imageFile && !existingImageUrl) {
      return toast.error("Please upload a recipe image.");
    }

    try {
      setLoading(true);
      let finalImageUrl = existingImageUrl;

      if (imageFile) {
        const storageRef = ref(storage, `recipes/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      const recipeData = {
        title: title.trim(),
        titleLower: title.trim().toLowerCase(),
        description: description.trim(),
        prepTime: parseInt(prepTime),
        difficulty,
        category,
        isVegetarian,
        ingredients: ingredients.map(i => i.trim()),
        steps: steps.map(s => s.trim()),
        imageUrl: finalImageUrl,
        ...(isEditMode ? {} : {
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email,
            createdAt: serverTimestamp(),
            likes: 0,
            likedBy: []
        })
      };

      if (isEditMode) {
        await updateDoc(doc(db, 'recipes', id), recipeData);
        toast.success("Recipe updated successfully!");
        navigate(`/recipe/${id}`);
      } else {
        await addDoc(collection(db, 'recipes'), recipeData);
        toast.success("Recipe published successfully!");
        navigate('/');
      }

    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error("Failed to save recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX: Am adăugat acest wrapper exterior care setează fundalul paginii
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Dark: text-white */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          {isEditMode ? 'Edit Recipe' : 'Create New Recipe'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* IMAGE UPLOAD SECTION */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Recipe Image</label>
            <div className="flex items-center justify-center w-full">
              
              {imagePreview ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden group">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button 
                      onClick={handleRemoveImage}
                      className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-600 transition transform hover:scale-105"
                    >
                      <FiX size={20} /> Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition relative overflow-hidden">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-10 h-10 text-gray-400 dark:text-gray-300 mb-3" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-300"><span className="font-semibold">Click to upload</span></p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or WEBP (MAX. 2MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}

            </div>
          </div>

          {/* BASIC INFO */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipe Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400" 
                placeholder="e.g., Homemade Margherita Pizza" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea 
                rows="3" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400" 
                placeholder="Tell us a bit about this dish..." 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prep Time (mins)</label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-3 text-gray-400 dark:text-gray-300" />
                  <input 
                    type="number" 
                    value={prepTime} 
                    onChange={(e) => setPrepTime(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400" 
                    placeholder="30" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                <div className="relative">
                  <FiActivity className="absolute left-3 top-3 text-gray-400 dark:text-gray-300" />
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Dessert</option>
                  <option>Snack</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <input 
                 type="checkbox" 
                 id="vegetarian" 
                 checked={isVegetarian} 
                 onChange={(e) => setIsVegetarian(e.target.checked)} 
                 className="w-4 h-4 text-orange-600 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500 dark:bg-gray-700" 
               />
               <label htmlFor="vegetarian" className="text-gray-700 dark:text-gray-300">This recipe is Vegetarian</label>
            </div>
          </div>

          {/* INGREDIENTS */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Ingredients</h2>
              <button type="button" onClick={addIngredient} className="text-orange-600 text-sm font-medium hover:text-orange-700 flex items-center gap-1"><FiPlus /> Add Ingredient</button>
            </div>
            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2">
                  <input 
                    type="text" 
                    value={ing} 
                    onChange={(e) => handleIngredientChange(index, e.target.value)} 
                    placeholder={`Ingredient ${index + 1}`} 
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400" 
                  />
                  {ingredients.length > 1 && <button type="button" onClick={() => removeIngredient(index)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><FiTrash2 /></button>}
                </div>
              ))}
            </div>
          </div>

          {/* STEPS */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Preparation Steps</h2>
              <button type="button" onClick={addStep} className="text-orange-600 text-sm font-medium hover:text-orange-700 flex items-center gap-1"><FiPlus /> Add Step</button>
            </div>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-full flex items-center justify-center font-bold text-sm mt-1">{index + 1}</span>
                  <textarea 
                    rows="2" 
                    value={step} 
                    onChange={(e) => handleStepChange(index, e.target.value)} 
                    placeholder={`Step ${index + 1} instructions...`} 
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:placeholder-gray-400" 
                  />
                  {steps.length > 1 && <button type="button" onClick={() => removeStep(index)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg self-start mt-1"><FiTrash2 /></button>}
                </div>
              ))}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button type="submit" disabled={loading} className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg transition transform hover:-translate-y-1 ${loading ? 'bg-orange-400 cursor-wait' : 'bg-orange-600 hover:bg-orange-700 hover:shadow-xl'}`}>
            {loading ? (isEditMode ? 'Updating Recipe...' : 'Publishing Recipe...') : (isEditMode ? 'Update Recipe' : 'Publish Recipe')}
          </button>

        </form>
      </div>
    </div>
  );
}