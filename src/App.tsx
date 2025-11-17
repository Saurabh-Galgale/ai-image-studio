import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ImageStudioPage from "../src/components/ImageStudioPage";
import History1 from "./components/HistoryPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/studio"
        element={
          <ProtectedRoute>
            <ImageStudioPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History1 />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
