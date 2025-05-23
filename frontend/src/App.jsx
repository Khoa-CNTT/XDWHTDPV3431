import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import AuthPage from "./components/AuthPage/AuthPage";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Create from "./pages/Create";
import DonateForm from "./pages/Donate";
import ProjectDetails from "./components/ProjectDetails/ProjectDetails";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import LayoutClient from "./components/layout";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Transparency from "./pages/Transparency";
import ResetPassword from './pages/ResetPassword';
import SearchResults from "./pages/SearchResults";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - loading:', loading);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute - redirecting to login');
    return <Navigate to="/login" />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  console.log('AdminRoute - isAuthenticated:', isAuthenticated);
  console.log('AdminRoute - loading:', loading);
  console.log('AdminRoute - user:', user);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated || user?.role !== 'admin') {
    console.log('AdminRoute - redirecting to home');
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
            <Route path="/projects/:projectId" element={<ProjectDetails />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/search" element={<SearchResults />} />
            
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
            <Route path="/donate/:projectId" element={
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
