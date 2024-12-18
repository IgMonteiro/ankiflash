// src/components/pages/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="deck-container">
      <h1>404 - Página Não Encontrada</h1>
      <p>A página que você está procurando não existe.</p>
      <button className="button" onClick={() => navigate('/')}>
        Voltar para Home
      </button>
    </div>
  );
};

export default NotFound;
