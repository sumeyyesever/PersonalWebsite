import express from "express";
import pg from "pg";
import cors from "cors";
import bcrypt from "bcrypt";
import multer from "multer";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";
import 'dotenv/config'


const app = express();

//middlewares
app.use(cors({
  origin: "https://kaleidoscopic-marigold-d06ee3.netlify.app",  // Replace with your client URL
  credentials: true                 // Allow credentials (cookies)
}));
app.use(cookieParser());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

//environment variables
const dbName = process.env.DATABASE_NAME;
const dbPassword = process.env.DATABASE_PASSWORD;


//db connaction
const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
db.connect();

//file uploading with multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), function (req, res) {
  const file = req.file;
  res.status(200).json(file.filename);
});


//register function
async function registerAdmin(username, plainPassword) {
  try {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

 
    const result = await db.query(
      "INSERT INTO admin (username, password) VALUES ($1, $2) RETURNING *",
      [username, hashedPassword]
    );

    console.log("Admin user created successfully:", {
      username: result.rows[0].username
    });
  } catch (error) {
    console.error("Error registering admin:", error);
  }
}

//get all posts
app.get("/api/posts", async (req,res)=>{
    try {
        const response = await db.query("SELECT * FROM posts ORDER BY created_at DESC");
        res.json(response.rows)
    } catch (error) {
        console.error('Error fetching data', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

//get single post
app.get("/api/posts/:id", async (req,res) => {
    const { id } = req.params;
    try {
        const response = await db.query("SELECT * FROM posts WHERE id = $1", [id]);        
        res.json(response.rows)
    } catch (error) {
        console.error('Error fetching data', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

//get posts specific to tag
app.get("/api/categories/:name", async (req,res)=>{
    const {name} = req.params;    
    try {
        const response = await db.query("SELECT * FROM posts WHERE category = $1 ORDER BY created_at DESC", [name]);
        res.json(response.rows);
    } catch (error) {
        console.error('Error fetching data', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

//get all tags for posts page
app.get("/api/categories", async (req, res)=>{
    try {
        const response = await db.query("SELECT category FROM posts");
        res.json(response.rows);
    } catch (error) {
        console.error('Error fetching data', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

//add post to db
app.post('/api/posts', async (req, res) => {

  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated");

  jwt.verify(token, "jwtkeykey", async (err, userInfo)=>{
    if (err) return res.status(403).json("Token is not valid");

    const { title, body, tag, img} = req.body;
    
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }
  
    try {
      const result = await db.query(
        'INSERT INTO posts (title, body, category, img, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [title, body, tag, img, userInfo.id]
      );
      console.log("Post added");
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding post:', error);
      res.status(500).json({ error: 'Failed to add post' });
    }

  });
      
  });


//delete post
app.delete("/api/posts/:id", async (req,res)=>{
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkeykey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const {id} = req.params;
    try {
        const response = await db.query("DELETE FROM posts WHERE id = $1", [id])
        console.log(response.rows);
        
        return res.status(200).json({ message: "Post deleted" });
    } catch (error) {
        console.error("Failed deleting post" + error);
        res.status(500).json({ error: 'Database query failed' });
        
    }})
});

//update post
app.put("/api/posts/:id", async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, jwtKey, async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const { id } = req.params;
    const { title, body, tag } = req.body; 
  
    try {

      const response = await db.query(
        "UPDATE posts SET title = $1, body = $2, category = $3 WHERE id = $4 RETURNING *",
        [title, body, tag, id]
      );
      
      if (response.rows.length === 0) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      return res.status(200).json({ message: "Post updated", post: response.rows[0] });
    } catch (error) {
      console.error("Failed updating post: " + error);
      res.status(500).json({ error: 'Database query failed' });
    }
  });
});


//login 
app.post("/api/login", async (req, res) => {
  const { username, admin_password } = req.body;
  try {
      const response = await db.query("SELECT * FROM admin WHERE username = $1", [username]);
      if (response.rows.length === 0) {
          console.log('User not found');
          return res.status(404).json({ message: "User not found" });
      }
      
      const user = response.rows[0];
      const isPasswordCorrect = await bcrypt.compare(admin_password, user.password);
      
      if (!isPasswordCorrect) {
          console.log('Incorrect password');
          return res.status(401).json({ message: "Incorrect password or username" });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_KEY || 'jwtkeykey', { expiresIn: '1h' });
      console.log('Generated token:', token);  // Log generated JWT token

      const { password, ...other } = user;
      
      return res.cookie("access_token", token, {
          httpOnly: true,
          sameSite: 'None',
          secure: true,
          maxAge: 3600000
      })
      .status(200)
      .json(other);
      
  } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: "Internal server error" });
  }
});


//logout
app.post("/api/logout", async (req, res)=>{
    res.clearCookie("access_token", {
        sameSite: "none",
        secure: true
    }).status(200).json("User has been logged out")
    
});

/* // Register route
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const id = 2;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const result = await db.query(
      'INSERT INTO admin (id, username, password) VALUES ($1, $2, $3)',
      [id, username, hashedPassword]
    );

    if (result.rows.length > 0) {
      res.status(201).json({ message: 'User registered successfully' });
    } else {
      res.status(500).json({ error: 'Failed to register user' });
    }
  } catch (err) {
    console.error('Error during user registration:', err);
    res.status(500).json({ error: 'Server error' });
  }
}); */

const deleteUser = async (id) => {
  try {
   
    const result = await db.query('DELETE FROM admin WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount > 0) {
      return { success: true, message: `User deleted successfully` };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (err) {
    console.error('Error deleting user:', err);
    return { success: false, error: 'Server error' };
  }
};


    

app.listen(5000, ()=>{
    console.log("server started on port 5000");
});