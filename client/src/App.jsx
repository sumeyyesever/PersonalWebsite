import Category from "./pages/category/Category";
import CreatePost from "./pages/create-post/CreatePost"
import Home from "./pages/home/Home"
import Post from "./pages/post/Post"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Posts from "./pages/posts/Posts";
import Register from "./pages/register/Register";

function App() {

 return (
    <Router>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts/:id" element={<Post />} />      
            <Route path="/categories/:name" element={<Category />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/create-post" element={<CreatePost />} /> 
            <Route path="/register" element={<Register />} />
        </Routes>
    </Router>
 )
}

export default App
