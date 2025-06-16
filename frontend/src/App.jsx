import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Homepage from "./pages/home";
import CampusXChain from "./pages/camptoken";

import Auth from "./pages/Auth";

function App() {
  return (
    
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />}></Route>
           <Route path="/camp" element={<CampusXChain/>}></Route>
          <Route path="/auth" element={<Auth/>}></Route>
        </Routes>
      </BrowserRouter>
    
  );
}
export default App;
