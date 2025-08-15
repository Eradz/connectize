import React from "react";

function AppTest() {
  console.log("AppTest component is rendering");
  return (
    <div style={{padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh'}}>
      <h1 style={{color: 'green'}}>🎉 Success! React is working!</h1>
      <p>If you can see this, the app is mounting properly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}

export default AppTest;
