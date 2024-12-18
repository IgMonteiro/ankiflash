// src/components/Questions/BarraInferior.jsx

import React from 'react';
import '../../styles.css';
import MarcaAcertos from './MarcaAcertos';

export default function BarraInferior(props) {
  const { concluidas, arrConc } = props;
  const totalPerguntas = arrConc.length;

  const contemErro = arrConc.some((a) => a.states === 'erro');

  return (
    <footer className="footer">
      <div className="contador" data-identifier="flashcard-counter">
        {concluidas}/{totalPerguntas} CONCLUÍDOS
      </div>

      <div className="acertos">
        {arrConc.map((a, index) => (
          <MarcaAcertos key={index} states={a.states} />
        ))}
      </div>
      {concluidas === totalPerguntas && (
        <>
          <h1 className="feedback">
            {contemErro
              ? 'Uma pena não ter acertado tudo 🙁'
              : 'Parabéns por não errar nenhuma! 😊'}
          </h1>
          {concluidas === totalPerguntas &&
            (contemErro ? (
              <button
                className="btn-fail"
                onClick={() => window.location.reload()}
              >
                Tentar novamente!
              </button>
            ) : (
              <button
                className="btn-success"
                onClick={() => window.location.reload()}
              >
                Voltar à tela inicial 😊
              </button>
            ))}
        </>
      )}
    </footer>
  );
}
