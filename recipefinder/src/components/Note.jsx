import React from "react";
import { useNavigate } from "react-router-dom";
import './styles/Note.css';

function Note(props) {

  const navigate = useNavigate();

  function handleRecipe() {
    console.log("Recipe button clicked for:", props.id);
    navigate(`/recipe/${props.id}`, {
      state: {
        recipename: props.name,
        description: props.description,
        src: props.src,
        recipe : props.recipe, // Assuming you want to pass the recipe as well
        id: props.id, // Pass the ID for reference
      },
    });
  }

    

  return (
    <div className="note">
      <h1>{props.name}</h1>
      <img src={props.src} alt="..."/>
      <p>{props.description}</p>
      <button onClick={handleRecipe}>Recipe</button>
    </div>
  );
}

export default Note;
