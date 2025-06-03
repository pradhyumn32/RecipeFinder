import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import CreateArea from "./CreateArea";
import Home from "./Home";
import RecipeDetail from "./RecipeDetail";
import './styles/Header.css'; 
// import logo from "./../logo.svg";

function Header() {
  return (
    <BrowserRouter forceRefresh = {true}>
    <header>
    <h1> <LocalDiningIcon/> AskChef</h1>
      <div className="linkComponents">
        <Link to = "/" style={{textDecoration : "none"}}>
          <h5 className="tab">Home</h5>
        </Link>
        <Link to = "/CreateArea" style={{textDecoration : "none"}}>
          <h5 className="tab">Add+</h5>
        </Link>
        <Link style={{textDecoration : "none"}}>
          <h5 className="tab">Browse</h5>
        </Link>
        <Link style={{textDecoration : "none"}}>
          <h5 className="tab">About Us</h5>
        </Link>
      </div>
    </header>
    <Routes>
    <Route exact path="/" element={<Home/>}/>
      <Route path="/CreateArea" element={<CreateArea/>}/>
      <Route path="/recipe/:id" element={<RecipeDetail />} />
    </Routes>
    </BrowserRouter>
  );
}

export default Header;
