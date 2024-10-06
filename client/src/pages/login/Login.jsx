import React, { useContext, useState } from 'react'
import { useNavigate } from "react-router-dom";
import {AuthContext} from "../../context/authContext.jsx"
import "./login.css"

export default function Login() {
    const [inputs, setInputs] = useState({
        username:"",
        password:"",
    });
    
    const navigate = useNavigate();
    const {login} = useContext(AuthContext);

    const handleChange = (e) => {
        setInputs((prev)=> ({...prev, [e.target.name]: e.target.value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(inputs);
            navigate("/create-post");
        } catch (error) {
            console.log(error);
        }
    };
  return (
    <div className='login-container'>
    <h1>Login</h1>
        <form className='login-form'>
            <input className='login-input' required type="text" placeholder='username' name="username" onChange={handleChange} />
            <input className='login-input' required type="password" placeholder='password' name="admin_password" onChange={handleChange} />
            <button className="login-button" onClick={handleSubmit}>Login</button>
        </form>
      
    </div>
  )
}
