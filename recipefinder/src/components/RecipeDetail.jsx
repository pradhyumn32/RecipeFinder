import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import "./styles/RecipeDetail.css";

function RecipeDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { recipename, description, src, recipe } = location.state || {};

  if (!recipename) {
    return (
      <div className="recipe-detail">
        <p>Recipe not found or data missing.</p>
      </div>
    );
  }

  return (
    <div className="recipe-detail">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back to Recipes
      </button>
      
      <h1>{recipename}</h1>
      <img src={src} alt={recipename} />
      <p><strong>Description:</strong> {description}</p>
      
      <div className="recipe-content">
        <h2>Recipe Instructions</h2>
        <p>{recipe}</p>
      </div>
    </div>
  );
}

export default RecipeDetail;