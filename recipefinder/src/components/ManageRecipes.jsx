import React from "react";
import { useState, useEffect } from 'react';
import { useAuth } from './../AuthContext';
import { useNavigate } from 'react-router-dom';
import './styles/ManageRecipes.css';

const ManageRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRecipe, setEditingRecipe] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        const response = await fetch('https://recipefinder-af8u.onrender.com/myRecipes', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        
        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserRecipes();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
  };

  const handleDelete = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
      const response = await fetch(`https://recipefinder-af8u.onrender.com/recipes/${recipeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }
      
      setRecipes(recipes.filter(recipe => recipe._id !== recipeId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch(`https://recipefinder-af8u.onrender.com/recipes/${editingRecipe._id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }
      
      const updatedRecipe = await response.json();
      setRecipes(recipes.map(recipe => 
        recipe._id === updatedRecipe._id ? updatedRecipe : recipe
      ));
      setEditingRecipe(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading your recipes...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="manage-recipes">
      <h1>Manage Your Recipes</h1>
      
      {editingRecipe ? (
        <div className="edit-form-container">
          <h2>Edit Recipe</h2>
          <form onSubmit={handleSave} className="edit-form">
            <div className="form-group">
              <label>Name:</label>
              <input 
                type="text" 
                name="name" 
                defaultValue={editingRecipe.name} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Description:</label>
              <textarea 
                name="description" 
                defaultValue={editingRecipe.description} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Instructions:</label>
              <textarea 
                name="recipe" 
                defaultValue={editingRecipe.recipe} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Current Image:</label>
              {editingRecipe.image && (
                <img 
                  src={editingRecipe.image} 
                  alt={editingRecipe.name} 
                  className="current-image"
                />
              )}
              <input type="file" name="image" accept="image/*" />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setEditingRecipe(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="recipe-list">
          {recipes.length === 0 ? (
            <p className="no-recipes">You haven't added any recipes yet.</p>
          ) : (
            <ul>
              {recipes.map(recipe => (
                <li key={recipe._id} className="recipe-item">
                  <div className="recipe-info">
                    <h3>{recipe.name}</h3>
                    {recipe.image && (
                      <img 
                        src={recipe.image} 
                        alt={recipe.name} 
                        className="recipe-thumbnail"
                      />
                    )}
                    <p>{recipe.description}</p>
                  </div>
                  <div className="recipe-actions">
                    <button 
                      onClick={() => handleEdit(recipe)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(recipe._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageRecipes;
