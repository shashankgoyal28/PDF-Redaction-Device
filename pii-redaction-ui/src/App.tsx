import React from "react";
import { Routes, Route } from "react-router-dom";
import InputPage from "./pages/InputPage";
import ResultsPage from "./pages/ResultsPage"; // default import

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<InputPage />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  );
}
