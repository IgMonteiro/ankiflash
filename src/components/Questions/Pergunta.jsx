// src/components/Questions/Pergunta.jsx
/*Este componente gerencia o estado de um único flashcard, 
alternando entre diferentes visualizações: fechado, aberto (mostrando a pergunta), 
mostrando a resposta com botões de resposta e exibindo o estado final.*/

import React, { useState } from 'react';
import setaPlay from '../../assets/img/seta_play.png';
import setaVirar from '../../assets/img/seta_virar.png';
import Botoes from './Botoes';
import MarcaAcertos from './MarcaAcertos';
import '../../styles.css';

export default function Pergunta(props) {
  const { perguntacard, numero, addRespondidos, states, isMarked } = props;
  const [cliquei, setCliquei] = useState(0);

  function clicarPergunta() {
    // Se o card já foi marcado, não permite mais cliques
    if (isMarked) return;
    const novoClique = (cliquei + 1) % 4;
    setCliquei(novoClique);
  }

  if (cliquei === 0) {
    return (
      <div
        className={`card-fechada ${states ? 'respondido' : ''}`}
        onClick={clicarPergunta}
        data-identifier="flashcard"
      >
        <p data-identifier="flashcard-index-item">Pergunta {numero}</p>
        <img src={setaPlay} alt="Play" data-identifier="flashcard-show-btn" />
      </div>
    );
  } else if (cliquei === 1) {
    return (
      <div className="card-aberta">
        <p data-identifier="flashcard-question">{perguntacard.front}</p>
        <img
          src={setaVirar}
          alt="Virar"
          onClick={clicarPergunta}
          data-identifier="flashcard-turn-btn"
        />
      </div>
    );
  } else if (cliquei === 2) {
    return (
      <div className="card-resposta">
        <p data-identifier="flashcard-answer">{perguntacard.back}</p>
        <div>
          <Botoes idCard={perguntacard.id} addRespondidos={addRespondidos} />
        </div>
      </div>
    );
  } else if (cliquei === 3) {
    return (
      <div className={`card-respondida ${states}`}>
        <p>Pergunta {numero}</p>
        <MarcaAcertos states={states} />
      </div>
    );
  }
}
