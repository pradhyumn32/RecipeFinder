// src/Home.jsx
import React, { useState, useEffect, useContext } from "react";
import Note from "./Note";
import './styles/Home.css';
import { AuthContext } from "./../AuthContext";

function Home() {
  const [backend, setBackend] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch("https://recipefinder-af8u.onrender.com/getRecipe");
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        console.log(data);
        setBackend(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecipes();
  }, []);

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Recipe Collection</h1>
        <p>Discover delicious recipes to try</p>
        {user && <p className="welcome-user">Welcome back, {user.username}!</p>}
      </div>
      
      {isLoading ? (
        <div className="loading">Loading recipes...</div>
      ) : (
        <div className="notes-grid">
          {backend.length === 0 ? (
            <p>No recipes found</p>
          ) : (
            backend.map(({id, name, image, description, recipe}) => (
              <Note 
                key={id} 
                id={id} 
                name={name} 
                src={image ? `https://recipefinder-af8u.onrender.com${image}` : null} 
                description={description} 
                recipe={recipe}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
