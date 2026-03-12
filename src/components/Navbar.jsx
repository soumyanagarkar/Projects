import "./Navbar.css";
import { IoMdSunny } from "react-icons/io";
import { FaMoon } from "react-icons/fa";
import { useEffect, useState } from "react";
import { IoIosSpeedometer } from "react-icons/io";

function Navbar(props)
{
    
    return  <div className={props.dabba? "dark-navbar" : "navbar"}>
                <h1><IoIosSpeedometer />SpeedoTest</h1>
                <div className="nav-right">
                    <p className="best-text" >Best WPM : <span className="best-score">{props.best}</span></p>
                    <button className="theme-toggle" onClick={props.changeTheme}>{props.dabba? <IoMdSunny /> : <FaMoon /> }</button>
                </div>
            </div>
}

export default Navbar;