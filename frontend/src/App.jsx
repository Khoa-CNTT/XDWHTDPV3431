import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import AuthPage from "./components/AuthPage/AuthPage";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Create from "./pages/Create";
import Guide from "./pages/Guide/Guide";
import DonateForm from "./pages/Donate";
import ProjectDetails from "./components/ProjectDetails/ProjectDetails";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import LayoutClient from "./components/layout";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<LayoutClient />}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/projects/:projectId" element={<ProjectDetails />} />
            
            {/* Protected Routes */}
            <Route path="/create" element={
              <ProtectedRoute>
                <Create />
              </ProtectedRoute>
            } />
            <Route path="/donate" element={
              <ProtectedRoute>
                <DonateForm />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Admin Route */}
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
          
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
