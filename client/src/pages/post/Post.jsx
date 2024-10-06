import "./post.css"
import Header from '../../components/header/Header'
import { Link, useNavigate, useParams } from "react-router-dom"
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import DOMPurify from "dompurify";

export default function Post() {
  const {id} = useParams();
  const [post, setPost] = useState({});

  const {currentUser} = useContext(AuthContext);

  const navigate = useNavigate();
  
  useEffect(()=>{
    const fetchPost = async () => {
      axios.get(`${process.env.VITE_DATABASE_URL}/api/posts/${id}`)
      .then((response) => {
        setPost(response.data[0]);  
      })
      .catch((error) => {
        console.error('Error fetching data with axios:', error);
      });

    };
    fetchPost();

  }, [id]);

  const handleDelete = async () => {
    try {
      console.log(id); 
      await axios.delete(`${process.env.VITE_DATABASE_URL}/api/posts/${id}`, { withCredentials: true });
      navigate("/");
    } catch (error) {
      console.error('Error deleting data with axios:', error);
    }
  };

  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent;
  }

  return (
    <>
        <Header />
        <div className='post-container'>
        {post.img &&  <img className="post-img" src={`/upload/${post.img}`} />}
        {currentUser && (
          <div className="edit-buttons">
          <Link to={`/create-post?edit=2`} state={post} >
            <button className="update-button">Update</button>
          </Link>
              
              <button className="delete-button" onClick={handleDelete}>Delete</button>
            </div>
        )}
            <h1 className='post-title'>{post.title}</h1>
            <span className='post-time'>{String(post.created_at).split("T")[0]}</span>
            <p dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.body), 
            }} className='post-paragraph'></p>
          </div>
    </>
    
  )
}
{}