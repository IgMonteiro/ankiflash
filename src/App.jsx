// src/App.jsx
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/pages/Home';
import Decks from './components/pages/Decks';
import CreateDeck from './components/pages/CreateDeck';
import EditDeck from './components/pages/EditDeck';
import CreateCard from './components/pages/CreateCard';
import Reports from './components/pages/Reports';
import ReviewCardsPage from './components/pages/ReviewCardsPage';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import NotFound from './components/pages/NotFound';
import ExportDeck from './components/pages/ExportDeck';

// Componente para Rotas Protegidas
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

// Componente para Rotas Públicas (Login e Register)
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/" />;
};

// Componente de Rotas
const AppRoutes = () => {
  const { currentUser } = useAuth();

  return (
    <Router>
      {/* Renderiza o Navbar apenas se o usuário estiver autenticado */}
      {currentUser && <Navbar />}
      <Routes>
        {/* Rotas Públicas */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Rotas Protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks"
          element={
            <ProtectedRoute>
              <Decks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-deck"
          element={
            <ProtectedRoute>
              <CreateDeck />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-deck/:id"
          element={
            <ProtectedRoute>
              <EditDeck />
            </ProtectedRoute>
          }
        />
        {/* Ajuste nas rotas de criação e edição de cards */}
        <Route
          path="/create-card/:deckId?"
          element={
            <ProtectedRoute>
              <CreateCard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-card/:deckId/:id"
          element={
            <ProtectedRoute>
              <CreateCard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review-cards"
          element={
            <ProtectedRoute>
              <ReviewCardsPage />
            </ProtectedRoute>
          }
        />
        {/* Rota para ExportDeck */}
        <Route
          path="/export-deck"
          element={
            <ProtectedRoute>
              <ExportDeck />
            </ProtectedRoute>
          }
        />

        {/* Rota 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

// Componente Principal do Aplicativo
const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
