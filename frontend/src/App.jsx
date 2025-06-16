import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Homepage from "./pages/home";
import { BlockchainProvider } from "./context/BlockchainContext";

function App() {
  return (
    <BlockchainProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />}></Route>
        </Routes>
      </BrowserRouter>
    </BlockchainProvider>
  );
}
export default App;
