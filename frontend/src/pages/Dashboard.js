import React, { useState } from 'react';
import axios from 'axios';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import InputField from '../components/InputField';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/animation/loading.json';
import logo from '../assets/images/logo1.png';
// import generateRecipeIllustration from '../assets/images/generate-recipe.png';

const Dashboard = () => {
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loadingRecommend, setLoadingRecommend] = useState(false);

  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await signOut(auth);
      alert('Logged out successfully!');
    } catch (error) {
      alert('Failed to log out');
    } finally {
      setLoadingLogout(false);
    }
  };

  const handleRecommend = async () => {
    setLoadingRecommend(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You need to be logged in to get recommendations');
        setLoadingRecommend(false);
        return;
      }
      const token = await user.getIdToken();
      const response = await axios.post(
        'http://localhost:5000/recommend',
        {
          ingredients,
          userId: user.uid,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        setRecipes(response.data.recommendations);
      } else {
        alert('Failed to get recommendations');
      }
    } catch (error) {
      alert('Failed to get recommendations');
    } finally {
      setLoadingRecommend(false);
    }
  };

  const handleClear = () => {
    setIngredients('');
    setRecipes([]);
  };

  const handleSaveRecipe = async (recipe) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('You need to be logged in to save recipes');
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();
      await axios.post(
        'http://localhost:3000/save-recipe',
        {
          recipe,
          uid: user.uid,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert('Recipe saved successfully!');
    } catch (error) {
      alert('Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRecipe = (recipeId) => {
    setRecipes((prevRecipes) =>
      prevRecipes.filter((recipe) => recipe.recipeId !== recipeId),
    );
  };

  const parseIngredients = (ingredientGroups) => {
    const regex = /IngredientGroup\(ingredients=\[(.*?)\], purpose='(.*?)'\)/g;
    const matches = [...ingredientGroups.matchAll(regex)];
    return matches.map((match) => ({
      ingredients: match[1]
        .split(',')
        .map((ingredient) => ingredient.trim().replace(/'/g, '')),
      purpose: match[2],
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <nav className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="w-10 h-10" />
          <h2 className="text-3xl font-bold text-[#c34a36]">NusanTasty</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/saved-recipes" className="text-blue-500">
            Saved Recipes
          </Link>
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <Button onClick={handleLogout} disabled={loadingLogout}>
            {loadingLogout ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </nav>

      <div className="mb-4">
        <div className="flex space-x-2 items-center">
          <InputField
            type="text"
            placeholder="Enter ingredients separated by commas (e.g., tomato, onion, garlic). Use English."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="flex-grow"
          />
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleRecommend}
              disabled={loadingRecommend}
              className="bg-[#c34a36]"
            >
              {loadingRecommend ? 'Generating...' : 'Generate Recipes'}
            </Button>
          </div>

          <Button
            onClick={handleClear}
            disabled={loading}
            className="bg-[#c34a36]"
          >
            Clear
          </Button>
        </div>
      </div>
      {/* Animasi loading di bawah input field dan tombol */}
      {loadingRecommend && (
        <div className="flex justify-center mb-4">
          <Lottie animationData={loadingAnimation} className="w-24 h-24" />
        </div>
      )}

      {/* Tampilkan animasi teks jika tidak ada resep dan tidak sedang loading */}
      {recipes.length === 0 && !loading && (
        <div className="text-center mt-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text animate-pulse text-center">
            Discover Your Next Favorite Recipe!
          </h2>
          <p className="text-lg text-gray-500 font-bold animate-pulse">
            Add some ingredients to get started.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <div key={recipe.recipeId} className="bg-white p-4 rounded shadow-md">
            <h3 className="text-xl font-semibold mb-2">{recipe.Title}</h3>
            <img
              src={recipe.Image}
              alt={recipe.Title}
              className="w-full h-48 object-cover mb-2 rounded"
            />
            <p>
              <strong>Category:</strong> {recipe.Category}
            </p>
            <p>
              <strong>Description:</strong> {recipe.Description}
            </p>
            <div className="mb-2">
              <strong>Ingredients:</strong>
              {parseIngredients(recipe['Ingredient Groups']).map(
                (group, index) => (
                  <div key={index} className="mb-2">
                    <p className="font-semibold">{group.purpose}:</p>
                    <ul className="list-disc list-inside">
                      {group.ingredients.map((ingredient, idx) => (
                        <li key={idx}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                ),
              )}
            </div>
            <p>
              <strong>Instructions:</strong> {recipe.Instructions}
            </p>
            <p>
              <strong>Ratings:</strong> {recipe.Ratings}
            </p>
            <p>
              <strong>Total Time:</strong> {recipe.TotalTime} minutes
            </p>
            <p>
              <strong>Yields:</strong> {recipe.Yields}
            </p>
            <Button
              onClick={() => handleSaveRecipe(recipe)}
              disabled={loading}
              className="mt-2 w-full"
            >
              {loading ? 'Saving...' : 'Save Recipe'}
            </Button>
            <Button
              onClick={() => handleRemoveRecipe(recipe.recipeId)}
              className="mt-2 w-full bg-red-500"
            >
              Remove Recipe
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
