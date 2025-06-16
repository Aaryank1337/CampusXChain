import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Homepage from "./pages/home";
function App(){
  return(
<BrowserRouter>
      <Routes>
        
         <Route path="/" element={<Homepage/>}></Route>
        </Routes>
    </BrowserRouter>
  );
}
export default App;