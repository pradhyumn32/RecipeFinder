const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

mongoose.connect('mongodb+srv://pradhyumnagrawal32:7240899561@cluster0.qu89wqe.mongodb.net/RecipeFinder'||'mongodb://localhost:27017/RecipeFinder', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB is Connected'))
.catch(err => console.log('Mongo error', err));

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Modified schema to include auto-incremented ID
const recipeSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: String,
    description: String,
    recipe: String,
    image: String
});

// Create counter collection for auto-increment
const counterSchema = new mongoose.Schema({
    name: String,
    count: Number
});
const Counter = mongoose.model('Counter', counterSchema);

const Recipe = mongoose.model("Recipies", recipeSchema);

// Auto-increment middleware
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

// File upload setup
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

// Routes
app.get("/getRecipe", async (req, res) => {
    try {
        const allRecipes = await Recipe.find({});
        res.json(allRecipes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching recipes", error });
    }
});

app.post('/addRecipe', upload.single('image'), async (req, res) => {
    const { name, description, recipe } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    
    try {
        const newRecipe = new Recipe({ name, description, recipe, image });
        await newRecipe.save();
        res.status(201).json(newRecipe);
    } catch (error) {
        res.status(500).json({ message: "Error saving recipe", error });
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(5000, () => {
    console.log("Server has started on Port 5000");
});
