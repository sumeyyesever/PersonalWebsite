import axios from "axios";
import {createContext, useEffect, useState} from "react"

export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    const login = async (inputs) => {
        const res = await axios.post(`${process.env.REACT_APP_DATABASE_URL}/api/login`, inputs, { withCredentials: true });
        setCurrentUser(res.data);
    };

    const logout = async (inputs) => {
        await axios.post(`${process.env.REACT_APP_DATABASE_URL}/api/logout`);
        setCurrentUser(null);
    };

    useEffect(()=>{
        localStorage.setItem("user", JSON.stringify(currentUser));
    }, [currentUser]);

    return (
        <AuthContext.Provider value={{currentUser, login, logout}}>
            {children}
        </AuthContext.Provider>
    );

};