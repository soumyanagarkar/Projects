import { useState , useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from "./components/Navbar";
import Body from "./components/Body";

function App() {
  let [darkMode,setDarkMode] = useState(localStorage.getItem("item")==="true");
  let [best,setBest] = useState(localStorage.getItem("best")||0);

  useEffect(()=>{localStorage.setItem("best",best)},[best]);//its makes changes when th changes in [best] are made (2nd parameter)

  function changeTheme()
  {
    setDarkMode((prev)=>!prev);
  }

  useEffect(()=>{localStorage.setItem("item",darkMode)},[darkMode]);

  return (
    <>
      <Navbar dabba={darkMode} changeTheme={changeTheme} best={best}/>
      <Body darkMode={darkMode} setBest={setBest} best={best}/>
      
    </>
  )
}

export default App

