// src/components/Questions/Perguntas.jsx

import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles.css';
import Botoes from './Botoes';

const Perguntas = ({ deckId, concluiQuestao, setArrConc, arrConc }) => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      if (!currentUser || !deckId) return;

      try {
        // Atualização do caminho da coleção para incluir 'decks/{deckId}/cards'
        const cardsRef = collection(
          db,
          'users',
          currentUser.uid,
          'decks',
          deckId,
          'cards',
        );
        const q = query(cardsRef);
        const querySnapshot = await getDocs(q);
        const cardsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCards(cardsList);

        // Log dos cartões carregados para depuração
        console.log('Cartões carregados:', cardsList);
      } catch (error) {
        console.error('Erro ao buscar cards:', error);
        alert('Ocorreu um erro ao buscar os cards.');
      }
    };

    fetchCards();
  }, [currentUser, deckId]);

  const handleCardClick = () => {
    setShowAnswer(true);
  };

  const handleAnswer = async (result) => {
    const card = cards[currentCardIndex];

    // Atualizar o estado do card no Firestore com o caminho correto
    const cardRef = doc(
      db,
      'users',
      currentUser.uid,
      'decks',
      deckId,
      'cards',
      card.id,
    );
    await updateDoc(cardRef, {
      lastReviewState: result,
      reviewedAt: Timestamp.now(),
    });

    // Atualizar o array de conclusões com objetos contendo 'states'
    setArrConc([...arrConc, { states: result }]);

    // Atualizar o índice do cartão
    setCurrentCardIndex((prevIndex) => prevIndex + 1);
    setShowAnswer(false);
    concluiQuestao();
  };

  if (cards.length === 0) {
    return <p className="no-cards-message">Não há cartões neste deck.</p>;
  }

  if (currentCardIndex >= cards.length) {
    return <p className="no-cards-message">Você concluiu todas as revisões!</p>;
  }

  const currentCard = cards[currentCardIndex];

  // Verificar se currentCard existe e possui as propriedades necessárias
  if (!currentCard || (!currentCard.question && !currentCard.answer)) {
    return <p>Carregando cartão...</p>;
  }

  // Log do cartão atual para depuração
  console.log('Cartão atual:', currentCard);

  return (
    <div className="card-container">
      <div
        className={`card ${showAnswer ? 'card-resposta' : 'card-pergunta'}`}
        onClick={!showAnswer ? handleCardClick : null}
      >
        <p>{showAnswer ? currentCard.answer : currentCard.question}</p>
      </div>
      {showAnswer && <Botoes handleAnswer={handleAnswer} />}
    </div>
  );
};

export default Perguntas;
