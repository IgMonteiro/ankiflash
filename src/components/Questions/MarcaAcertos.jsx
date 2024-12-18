// src/components/Questions/MarcaAcertos.jsx

import React from 'react';
import iconErro from '../../assets/img/icone_erro.png';
import iconMeio from '../../assets/img/icone_quase.png';
import iconAcerto from '../../assets/img/icone_certo.png';
import '../../styles.css';

export default function MarcaAcertos(props) {
  const { states } = props;

  if (states === 'erro') {
    return <img src={iconErro} alt="Erro" className="marca-acerto" />;
  } else if (states === 'meio') {
    return <img src={iconMeio} alt="Quase" className="marca-acerto" />;
  } else if (states === 'acerto') {
    return <img src={iconAcerto} alt="Acerto" className="marca-acerto" />;
  } else {
    return null;
  }
}
