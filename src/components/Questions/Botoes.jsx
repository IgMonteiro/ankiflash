// src/components/Questions/Botoes.jsx

import React from 'react';
import '../../styles.css';

const Botoes = ({ handleAnswer }) => {
  return (
    <div className="container-botoes">
      <button
        className="btn btn-erro"
        onClick={() => handleAnswer('erro')} // Alterado para 'erro'
        data-identifier="forgot-btn"
      >
        Não lembrei
      </button>
      <button
        className="btn btn-meio"
        onClick={() => handleAnswer('meio')} // Alterado para 'meio'
        data-identifier="almost-forgot-btn"
      >
        Quase não lembrei
      </button>
      <button
        className="btn btn-acerto"
        onClick={() => handleAnswer('acerto')} // Alterado para 'acerto'
        data-identifier="acerto-btn"
      >
        Lembrei com facilidade
      </button>
    </div>
  );
};

export default Botoes;
