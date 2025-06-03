import React, { useState, useEffect } from "react";
import Note from "./Note";
import './styles/Home.css';

function Home() {
  const [backend, setBackend] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/getRecipe", {
      mode: 'no-cors',
    })
      .then(response => response.json())
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
                src={image} 
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