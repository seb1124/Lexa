// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignLanguageApp from "./Components/SignLanguageApp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignLanguageApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;