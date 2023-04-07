import { useEffect, useState } from "react";
import "./App.css";
import GifConversion from "./pages/GifConversion";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import TrimVideo from "./pages/TrimVideo";
import AddText from "./pages/AddText";

function App() {
 
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<GifConversion />} />
        <Route path="/trim" element={<TrimVideo />} />
        <Route path="/text" element={<AddText />} />
      </Routes>
    </>
  );
}

export default App;
