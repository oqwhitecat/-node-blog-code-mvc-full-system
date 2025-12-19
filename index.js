const express = require('express')
const app = express();
const ejs = require('ejs');
const mongoose = require('mongoose');
const expressSession = require('express-session');
const flash = require('connect-flash');

// Controllers
const newPostController = require('./controllers/newPost');
const homeController = require('./controllers/home');
const storePostController = require('./controllers/storePost');
const getPostController = require('./controllers/getPost');
const validateMiddleware = require('./middleware/validationMiddleware');
const newUserController = require('./controllers/newUser');
const storeUserController = require('./controllers/storeUser');
const loginController = require('./controllers/login');
const loginUserController = require('./controllers/loginUser');
const logoutController = require('./controllers/logout');

// Add new feature 
const myPostController = require('./controllers/myPostController');
const editPostController = require('./controllers/editPostController');
const updatePostController = require('./controllers/updatePostController');
const deletePostController = require('./controllers/deletePostController');

// Middleware
const authMiddleware = require('./middleware/authMiddleware');
const redirectIfAuthenticatedMiddleware = require('./middleware/redirectIfAuthenticatedMiddleware');

// File Upload Package
const fileUpload = require('express-fileupload');
// Validation Middleware

// *******************************************************************
// [ปรับปรุง 1]: อ่าน Connection String จาก Environment Variable (MONGO_URI)
// *******************************************************************
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

// [เพิ่ม]: แสดงผลใน Console เมื่อเชื่อมต่อสำเร็จ/ล้มเหลว
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Mongoose connected successfully to MongoDB Atlas!');
});

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use('/posts/store', validateMiddleware);
app.use(expressSession({
    secret: 'nodejsblog',
    resave: true,
    saveUninitialized: true
}))
app.use(flash());

global.loggedIn = null;

app.use("*", (req, res, next) => {
    loggedIn = req.session.userId;
    next();
})

app.get('/', homeController);

// User Registration
app.get('/auth/register', redirectIfAuthenticatedMiddleware, newUserController);

app.get('/post/:id', getPostController)
// New Post
app.get('/posts/new', authMiddleware, newPostController);
// Login user
app.get('/auth/login', redirectIfAuthenticatedMiddleware, loginController)
// Logout user
app.get('/auth/logout', logoutController)
// View my own post
app.get('/posts/mypost', authMiddleware, myPostController);
// Edit post
app.get('/posts/edit/:id', authMiddleware, editPostController);

// Create data
app.post('/posts/store', authMiddleware, storePostController)
// Create user
app.post('/users/register', redirectIfAuthenticatedMiddleware, storeUserController)
// Login user
app.post('/users/login', redirectIfAuthenticatedMiddleware, loginUserController)
// Update Post 
app.post('/posts/update', authMiddleware, updatePostController)
// Delete Post 
app.get('/posts/delete/:id', authMiddleware, deletePostController)

app.use((req, res) => res.render('notfound'));

// *******************************************************************
// [ปรับปรุง 2]: ใช้ process.env.PORT โดยตรง และแสดง Port ที่รันจริงใน Log
// *******************************************************************
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`App listening on port ${port}`); // เปลี่ยน 4000 เป็นตัวแปร port
})