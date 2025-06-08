// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./../AuthContext";
import Header from "./Header";
import Footer from "./Footer";
import Home from "./Home";
import CreateArea from "./CreateArea";
import RecipeDetail from "./RecipeDetail";
import Login from "./Login";
import Register from "./Register";
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import ProtectedRoute from "./ProtectedRoute";
import OAuthCallback from "./OAuthCallback";
import ManageRecipes from "./ManageRecipes";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Header />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              {/* <Route path="/create" element={<CreateArea />} /> */}
              <Route 
  path="/create" 
  element={
    <ProtectedRoute>
      <CreateArea />
    </ProtectedRoute>
  } 
/>
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/oauth-success" element={<OAuthCallback />} />
              <Route path="/manage-recipes" element={<ManageRecipes />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
