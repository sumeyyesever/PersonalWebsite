import "./category.css"
import Header from "../../components/header/Header"
import PostList from "../../components/post_list/PostList";
import { useParams } from "react-router-dom";

export default function Category() {
    const {name} = useParams();    
  return (
    <>
        <Header />
        <div className="category-page-container">
            <h1 className="category-title">Posts tagged "{name}"</h1>
            <PostList name={name} />
        </div>
    </>
  )
}
