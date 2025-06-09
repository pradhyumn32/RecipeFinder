const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

// Load environment variables from .env file
require('dotenv').config();

mongoose.connect('mongodb+srv://pradhyumnagrawal32:7240899561@cluster0.qu89wqe.mongodb.net/RecipeFinder', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB is Connected'))
.catch(err => console.log('Mongo error', err));

const app = express();
const frontendUrl = process.env.FRONTEND_URL;
const backendUrl = process.env.BACKEND_URL;
                                    
// Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(bodyParser.json());
app.use(cookieParser());

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// User Schema with Google OAuth fields
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  googleId: { type: String, unique: true, sparse: true },
  avatar: String,
  lastLogin: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Recipe Schema (unchanged)
const recipeSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: String,
    description: String,
    recipe: String,
    image: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Counter = mongoose.model('Counter', new mongoose.Schema({
    name: String,
    count: Number
}));

const Recipe = mongoose.model("Recipies", recipeSchema);

// Auto-increment middleware (unchanged)
recipeSchema.pre('save', async function(next) {
    if (!this.isNew) return next();
    try {
        const counter = await Counter.findOneAndUpdate(
            { name: 'recipeId' },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );
        this.id = counter.count;
        next();
    } catch (err) {
        next(err);
    }
});

const JWT_SECRET = process.env.JWT_SECRET;

// Helper functions
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
};

// Authentication middleware (updated for both session and JWT)
const authMiddleware = async (req, res, next) => {
  // Check for JWT token first
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id);
      return next();
    } catch (err) {
      // Token is invalid, continue to check session
    }
  }

  // Check for passport session
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ message: 'Authentication required' });
};

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${backendUrl}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check for existing user by googleId
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      // Check if email already exists (for users who might have registered normally first)
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Merge accounts by adding googleId
        user.googleId = profile.id;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          username: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id
        });
      }
    }
    
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Google OAuth Routes
app.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: true
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${frontendUrl}/login`,
    session: true
  }),
  (req, res) => {
    // Generate JWT token for the authenticated user
    const token = generateToken(req.user._id);
    
    // Redirect to frontend with token as query parameter
    res.redirect(`${frontendUrl}/oauth/callback?token=${token}`);
  }
);

// File upload setup (unchanged)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static('uploads'));

// Routes (unchanged except for adding authMiddleware where needed)
app.get("/getRecipe", async (req, res) => {
    try {
        const allRecipes = await Recipe.find({});
        res.json(allRecipes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching recipes", error });
    }
});

app.post('/addRecipe', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, recipe } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user._id;

    const newRecipe = new Recipe({ 
      name, 
      description, 
      recipe, 
      image,
      user: userId
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(500).json({ message: "Error saving recipe", error });
  }
});

app.get('/myRecipes', authMiddleware, async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user._id });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recipes", error });
  }
});

app.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        googleId: user.googleId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});

// User Registration (updated to handle both normal and OAuth users)
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.password) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      // User exists but has no password (OAuth user), allow them to set a password
      existingUser.username = username;
      existingUser.password = await hashPassword(password);
      await existingUser.save();
      
      const token = generateToken(existingUser._id);
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      
      return res.status(200).json({ 
        message: 'Password set successfully',
        user: { id: existingUser._id, username: existingUser.username, email: existingUser.email }
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password: await hashPassword(password)
    });

    await user.save();

    const token = generateToken(user._id);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    res.status(201).json({ 
      message: 'User registered successfully',
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
});

// User Login (unchanged)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    res.json({ 
      message: 'Logged in successfully',
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
});

// Auth status check
app.get('/auth/status', authMiddleware, (req, res) => {
  res.json({ 
    isAuthenticated: true,
    user: { id: req.user._id, username: req.user.username, email: req.user.email }
  });
});

// Add this with your other routes
app.post('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data (without sensitive info)
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        googleId: user.googleId
      }
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout (updated to handle both session and JWT)
app.post('/logout', (req, res) => {
  req.logout(); // For passport session
  res.clearCookie('token'); // For JWT
  res.clearCookie('connect.sid'); // For session
  res.json({ message: 'Logged out successfully' });
});

// Get all recipes for the current user (already exists in your code)
app.get('/myRecipes', authMiddleware, async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user._id });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recipes", error });
  }
});

// Update a recipe
app.put('/recipes/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, recipe } = req.body;
    const recipeId = req.params.id;
    
    // Verify the recipe belongs to the user
    const existingRecipe = await Recipe.findOne({ _id: recipeId, user: req.user._id });
    if (!existingRecipe) {
      return res.status(404).json({ message: "Recipe not found or not authorized" });
    }
    
    const updateData = {
      name,
      description,
      recipe,
      updatedAt: new Date()
    };
    
    // Handle image update if a new file was uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
      
      // Delete old image if it exists
      if (existingRecipe.image) {
        const oldImagePath = path.join(__dirname, existingRecipe.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    const updatedRecipe = await Recipe.findByIdAndUpdate(recipeId, updateData, { new: true });
    res.json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ message: "Error updating recipe", error });
  }
});

// Delete a recipe
app.delete('/recipes/:id', authMiddleware, async (req, res) => {
  try {
    const recipeId = req.params.id;
    
    // Verify the recipe belongs to the user
    const recipe = await Recipe.findOne({ _id: recipeId, user: req.user._id });
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found or not authorized" });
    }
    
    // Delete associated image if it exists
    if (recipe.image) {
      const imagePath = path.join(__dirname, recipe.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Recipe.deleteOne({ _id: recipeId });
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting recipe", error });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});
app.set('trust proxy', 1); // If behind a proxy like Render
app.listen(5000, () => {
    console.log("Server has started on Port 5000");
});
