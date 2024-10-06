import { useEffect, useState } from "react";
import "./postList.css"
import axios from 'axios';
import { Link } from "react-router-dom";

export default function PostList(props) {
  const [data, setData] = useState([]);

  if (props.name != "all"){    
    useEffect(()=>{
      axios.get(`${process.env.VITE_DATABASE_URL}/api/categories/${props.name}`)
      .then((response) => {
        console.log(props.name);
        
        setData(response.data);
      })
      .catch((error)=>{
        console.error('Error fetching data with axios:', error);
      });
    }, [props.name]);
  }else {
    useEffect(()=>{
      axios.get(`https://zonal-light-production.up.railway.app/api/posts`)
      .then((response) => {
        setData(response.data);   
      })
      .catch((error) => {
        console.error('Error fetching data with axios:', error);
      });
    }, []);
  }


  

  return (
    <div className='post-list-container'>
      <ul className='post-list'>
      {data.map((post)=>(
        <li key={post.id} className='post-list-item'>
            <div className="post-list-item-left">
                <Link to={`/categories/${post.category}`} className="link"> <span className='post-list-tag'>{post.category}</span></Link>
               <Link to={`/posts/${post.id}`} className="post-list-item-title link">{post.title}</Link> 
            </div>
            <span className='post-list-time'>{post.created_at}</span>
        </li>
      ))}
      </ul>
    </div>
  )
}
