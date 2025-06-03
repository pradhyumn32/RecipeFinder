import React from "react";
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import './styles/Footer.css'; // 👈 Import the CSS styling
// import 'bootstrap/dist/css/bootstrap.min.css';
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
    <div className="Icons">
      <InstagramIcon className="icon"/>
      <FacebookIcon className="icon"/>
      <XIcon className="icon"/>
    </div>
    <p>© {year} Copyright: <a href="/">AskChef</a></p>
    </footer>
  );
}

export default Footer;
