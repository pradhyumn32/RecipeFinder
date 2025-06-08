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
  const [uploadProgress, setUploadProgress] = useState(0);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  function handleFileChange(e) {
    const file = e.target.files[0];
    
    // Validate file type and size
    if (!file.type.match('image.*')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }

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
    
    if (!formData.image) {
      alert('Please select an image for your recipe');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('recipe', formData.recipe);
    data.append('image', formData.image);

    try {
      const res = await axios.post(
  'https://recipefinder-af8u.onrender.com/addRecipe', 
  data, 
  {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    withCredentials: true, // 👈 REQUIRED for cookie to be sent
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      setUploadProgress(percentCompleted);
    }
  }
);

      
      console.log('Success:', res.data);
      // Reset form after successful submission
      setFormData({
        name: '',
        description: '',
        recipe: '',
        image: null
      });
      setPreview('');
      setUploadProgress(0);
      alert('Recipe added successfully!');
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      alert(`Error adding recipe: ${err.response?.data?.message || err.message}`);
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
            style={{ display: 'none' }}
          />
          <label htmlFor="image" className="file-upload-label">
            <UploadIcon />
            <div className="file-upload-text">
              {formData.image ? formData.image.name : 'Click to upload image'}
              <br />
              <span>Supports: JPEG, PNG (Max 5MB)</span>
            </div>
          </label>
        </div>
        
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
            <p className="file-info">
              {formData.image?.name} • {(formData.image?.size / 1024 / 1024).toFixed(2)}MB
            </p>
          </div>
        )}

        {isSubmitting && uploadProgress > 0 && (
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
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

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={isSubmitting ? 'submitting' : ''}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Uploading... {uploadProgress}%
            </>
          ) : 'Submit Recipe'}
        </button>
      </form>
    </div>
  );
}

export default CreateArea;
