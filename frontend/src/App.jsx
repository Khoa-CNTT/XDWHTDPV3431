import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { auth } from "./firebase";
import AuthPage from "./components/AuthPage/AuthPage";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Create from "./pages/Create";
import Guide from "./pages/Guide/Guide";
import ProjectDetails from "./components/ProjectDetails/ProjectDetails";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/create" element={<Create />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
