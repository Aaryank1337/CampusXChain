import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Homepage from "./pages/home";
import CampusXChain from "./pages/camptoken";


function App() {
  return (
    
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />}></Route>
           <Route path="/camp" element={<CampusXChain/>}></Route>
        </Routes>
      </BrowserRouter>
    
  );
}
export default App;
