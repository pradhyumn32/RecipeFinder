import React, { useState, useEffect } from "react";
import Note from "./Note";
import './styles/Home.css';

function Home() {
  const [backend, setBackend] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  fetch("https://recipefinder-af8u.onrender.com/getRecipe")
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      setBackend(data);
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    });
}, []);

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Recipe Collection</h1>
        <p>Discover delicious recipes to try</p>
      </div>
      
      {isLoading ? (
        <div className="loading">Loading recipes...</div>
      ) : (
        <div className="notes-grid">
          {(typeof backend === 'undefined' || backend.length === 0) ? (
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
