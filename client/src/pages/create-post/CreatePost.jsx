import "./createPost.css";
import Header from "../../components/header/Header";
import Login from "../login/Login"
import { useContext, useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill"; // Import React Quill
import "react-quill/dist/quill.snow.css"; // Import React Quill styles
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

export default function CreatePost() {
  const state = useLocation().state;
  const [value, setValue] = useState(state?.body || ""); // Body content
  const [title, setTitle] = useState(state?.title || ""); // Title
  const [tag, setTag] = useState(state?.category || ""); // Tag
  const [file, setFile] = useState(null);

  const navigate =  useNavigate();

  const {currentUser} = useContext(AuthContext);

    const upload = async () => {
      try {
        const fileFormData = new FormData();
        fileFormData.append("file", file);
        const res = await axios.post("http://localhost:5000/api/upload", fileFormData);
        return res.data;
      } catch (err) {
        console.log(err);
      }
    };


  const handleQuillChange = (content) => {
    setValue(content); // Update value with Quill's content
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const imgURL = await upload();
  
    const formData = { title, body: value, tag, img: file ? imgURL : "", };
  
    try {
      if (state) {
        // If state exists, it's an update operation
        const response = await axios.put(`http://localhost:5000/api/posts/${state.id}`, formData, { withCredentials: true });
        alert('Post updated successfully!');
        navigate("/");
        
      } else {
        // Otherwise, it's a create operation
        await axios.post(`${process.env.VITE_DATABASE_URL}/api/posts`, formData, { withCredentials: true });
        alert('Post added successfully!');
        navigate("/");
      }
  
      // Reset the form
      setTitle('');
      setValue('');
      setTag('');
    } catch (error) {
      if (error.response) {
        // The server responded with a status code outside of the range [2xx]
        console.error('Error response:', error.response.data);
        alert(`Error: ${error.response.data.error || 'An error occurred'}`);
      } else if (error.request) {
        // The request was made, but no response was received
        console.error('Error request:', error.request);
        alert('No response received from the server');
      } else {
        // Something happened while setting up the request
        console.error('Error message:', error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };
  return (
    <>
    <Header />
    {currentUser 
     ? 
         <div className="create-post-container">
        <form className="create-post-form" onSubmit={handleSubmit}>
          <input
            className="create-post-title-input"
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
          />

          {/* Replace textarea with React Quill */}
          <ReactQuill
            className="create-post-body-input"
            value={value}
            onChange={handleQuillChange} // Use the new handler
            placeholder="Write your post content here..."
            theme="snow" // You can change the theme if desired
            required
          />

          <input
            className="create-post-tags-input"
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            name="tag"
            placeholder="Tag"
          />

          <input 
            style = {{display: "none"}}
            type="file" 
            id="file"
            name="img"
            onChange={(e)=>setFile(e.target.files[0])}
          />
          <label className="file-label"  htmlFor="file">Upload Image</label>
          <button className="create-post-submit" type="submit">Submit Post</button>
        </form>
      </div>
      : <Login />
    }
    </>
  );
}
