import React, { useState } from "react";
import axios from 'axios';
import './styles/CreateArea.css';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

function CreateArea() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    recipe: '',
    image: null
  });
  const [preview, setPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  function handleFileChange(e) {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      image: file
    });
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('recipe', formData.recipe);
    data.append('image', formData.image);

    try {
      const res = await axios.post('http://localhost:5000/addRecipe', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Success:', res.data);
      // Reset form after successful submission
      setFormData({
        name: '',
        description: '',
        recipe: '',
        image: null
      });
      setPreview('');
      alert('Recipe added successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Error adding recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-area">
      <h3>Share your own recipe</h3>
      <form onSubmit={handleSubmit}>
      <div className="form-group">
  <input 
    type="file" 
    id="image"
    name="image" 
    onChange={handleFileChange} 
    accept="image/*"
    required 
  />
  <label htmlFor="image" className="file-upload-label">
    <UploadIcon />
    <div className="file-upload-text">
      {formData.image ? 'Change image' : 'Click to upload image'}
      <br />
      <span>or drag and drop</span>
    </div>
  </label>
</div>
        
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name">Recipe Name</label>
          <input 
            type="text" 
            id="name"
            name="name" 
            placeholder="Enter recipe name" 
            value={formData.name}
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input 
            type="text" 
            id="description"
            name="description" 
            placeholder="Enter short description" 
            value={formData.description}
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="recipe">Recipe Instructions</label>
          <textarea 
            id="recipe"
            name="recipe" 
            placeholder="Enter detailed recipe instructions" 
            value={formData.recipe}
            onChange={handleChange} 
            rows="5"
            required 
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <span className="spinner"></span>
      Submitting...
    </>
  ) : 'Submit Recipe'}
</button>
      </form>
    </div>
  );
}

export default CreateArea;