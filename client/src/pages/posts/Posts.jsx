import { useEffect, useState } from "react";
import Header from "../../components/header/Header"
import PostList from "../../components/post_list/PostList"
import "./posts.css"
import axios from "axios";
import { Link } from "react-router-dom";

export default function Posts() {

    const [tags, setTags] = useState([]);
    const [uniqueTags, setUniqueTags] = useState([]);

    useEffect(()=>{
        axios.get(`${import.meta.env.VITE_DATABASE_URL}/api/categories`)
        .then((response) => {
          setTags(response.data);   
        })
        .catch((error) => {
          console.error('Error fetching data with axios:', error);
        });
      }, []);

      useEffect(() => {
        function makeTagsUnique() {
            let tags_array = tags.map(tag => tag.category);
            let uniqueTags = [...new Set(tags_array)];
            return uniqueTags;
        }
        setUniqueTags(makeTagsUnique());
    }, [tags]);
     
      
  return (
    <>
        <Header />
        <div className="posts-page-container">
            <h1 className="posts-page-title">Blog</h1>
            <div className="posts-tags-container">
            {uniqueTags.map((tag, index) => (
                <Link to={`/categories/${tag}`} className="link"> 
                    <span key={index} className="single-tag">{tag}</span>
                </Link>
           
          ))}
                
            </div>
            <PostList name="all" />
        </div>
    </>
  )
}
