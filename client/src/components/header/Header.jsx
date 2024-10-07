import { Link } from "react-router-dom"
import "./header.css"
import { useContext } from "react"
import { AuthContext } from "../../context/authContext"

export default function Header() {
  const {currentUser, logout} = useContext(AuthContext);

  return (
    <div className="header-container">
      <ul className='nav-links'>
      <Link to={"/"} className="link"><li className="nav-link">Home</li></Link>
        <div>·</div>
        <Link to={"/posts"} className="link"><li className="nav-link">Posts</li></Link>   
        <div>·</div>
        <Link to={"/create-post"} className="link"> <li className="nav-link">Contact</li> </Link> 
        {/* <Link to={"/register"} className="link"> <li className="nav-link">Register</li> </Link>  */}
        {currentUser && (
          <>
          <div>·</div>
          <li onClick={logout} className="nav-link">Logout</li>
          </>
        )}
        
      </ul>
    </div>
  )
}
