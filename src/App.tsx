import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RecipeForm from './pages/RecipeForm';
import RecipeList from './pages/RecipeList';
import NavigationBar from './components/NavigationBar';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import FavoritesHome from './pages/FavoritesHome';
import RecipeDetail from './pages/RecipeDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ paddingBottom: '4.5rem' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/add" element={
              <ProtectedRoute>
                <RecipeForm />
              </ProtectedRoute>
            } />
            <Route path="/recipes" element={
              <ProtectedRoute>
                <RecipeList />
              </ProtectedRoute>
            } />
            <Route path="/recipes/:id" element={
              <ProtectedRoute>
                <RecipeDetail />
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <FavoritesHome />
              </ProtectedRoute>
            } />
            <Route path="/edit/:id" element={
              <ProtectedRoute>
                <RecipeForm />
              </ProtectedRoute>
            } />
          </Routes>
          <NavigationBar />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
