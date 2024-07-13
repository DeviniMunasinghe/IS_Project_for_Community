// Require necessary modules
require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const pool = require('./db_config');  // Ensure the path is correct
const bcrypt = require('bcrypt'); // For hashing passwords
const path = require('path'); // For working with file paths
const cookieParser = require('cookie-parser');
const multer = require('multer'); // For handling file uploads

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'uploads')); // Destination folder for uploads
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // File renaming to avoid duplicates
    }
});

const upload = multer({ storage: storage });





// Route handler for the root URL
app.get('/', (req, res) => {
    res.redirect('/admin_signup'); // Redirect to the admin signup page
});

// Route handler for admin signup page - GET request
app.get('/admin_signup', (req, res) => {
    res.render('admin_signup', { message: '' }); // Render admin_signup.ejs with an empty message
});

// Route handler for admin signup form submission - POST request
app.post('/admin_signup', async (req, res) => {
    const { username, password, confirm_password } = req.body;

    // Check if passwords match
    if (password !== confirm_password) {
        return res.render('admin_signup', { message: 'Passwords do not match' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into the database
        const query = 'INSERT INTO user_admin (username, password) VALUES (?, ?)';
        pool.query(query, [username, hashedPassword], (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                return res.status(500).send('Error executing query');
            }
            console.log('User added successfully');
            res.send('User added successfully'); // Send success message
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send('Error hashing password');
    }
});







// Route handler for admin login page - GET request
app.get('/admin_login', (req, res) => {
    res.render('admin_login', { message: '' }); // Render admin_login.ejs with an empty message
});

// Route handler for admin login form submission - POST request
app.post('/admin_login', (req, res) => {
    const { username, password } = req.body;

    // Query the database for the user
    const query = 'SELECT * FROM user_admin WHERE username = ?';
    pool.query(query, [username], async (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).send('Error executing query');
        }

        if (results.length === 0) {
            return res.render('admin_login', { message: 'Invalid username or password' });
        }

        const user = results[0];

        // Compare the password with the hashed password in the database
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render('admin_login', { message: 'Invalid username or password' });
        }

        // Password is correct, redirect or perform further actions
        res.send('Login successful');
    });
});





// Route handler for upload_new_item page - GET request
// Route handler for upload_new_item page - GET request
app.get('/upload_new_item', (req, res) => {
    res.render('upload_new_item', { message: '' }); // Render upload_new_item.ejs with an empty message
});


// Route handler for handling item upload - POST request
app.post('/upload_new_item', upload.single('item_image'), (req, res) => {
    const { item_title, price_with_ice_cream, price_without_ice_cream } = req.body;
    const item_image = req.file.filename; // Uploaded file name

    // Insert the item into the database
    const query = 'INSERT INTO item (item_image, item_title, price_with_ice_cream, price_without_ice_cream) VALUES (?, ?, ?, ?)';
    pool.query(query, [item_image, item_title, price_with_ice_cream, price_without_ice_cream], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).send('Error executing query');
        }
        console.log('Item added successfully');
        res.send('Item added successfully'); // Send success message
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
