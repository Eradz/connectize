import React from "react";
import { Route, Routes } from "react-router-dom";

function App() {
  console.log("App component is rendering");
  return (
    <div style={{padding: '20px'}}>
      <h1>App Component Working</h1>
      <Routes>
        <Route path="/" element={<div><h2>Home Route</h2><p>This is the home page</p></div>} />
        <Route path="*" element={<div><h2>404</h2><p>Page not found</p></div>} />
      </Routes>
    </div>
  );
}

export default App;
