import React from "react";
import io from "socket.io-client";
import { Routes, Route } from "react-router-dom";
import LobbyPage from "./components/LobbyPage.js";
import CodeBlockPage from "./components/CodeBlockPage.js";

export const socket = io("https://coding-app-3bsu.onrender.com"); // Connect to backend server

function App() {
  return (
    <Routes>
      <Route path="/" element={<LobbyPage />} />
      <Route path="/codeblock/:id" element={<CodeBlockPage />} />
    </Routes>
  );
}

export default App;
