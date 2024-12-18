// src/components/pages/ReviewCardsPage.jsx

import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import Perguntas from '../Questions/Perguntas';
import BarraInferior from '../Questions/BarraInferior';
import '../../styles.css';

const ReviewCardsPage = () => {
  const { currentUser } = useAuth();
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState('');
  const [concluidas, setConcluidas] = useState(0);
  const [arrConc, setArrConc] = useState([]);
  const [totalCards, setTotalCards] = useState(0);

  // Estados relacionados à sessão de estudo
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  useEffect(() => {
    const fetchDecks = async () => {
      if (!currentUser) return;

      try {
        const decksRef = collection(db, 'users', currentUser.uid, 'decks');
        const decksSnapshot = await getDocs(decksRef);
        const decksList = decksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDecks(decksList);
      } catch (error) {
        console.error('Erro ao buscar decks:', error);
        alert('Ocorreu um erro ao buscar os decks.');
      }
    };

    fetchDecks();
  }, [currentUser]);

  const handleDeckChange = async (e) => {
    const chosenDeck = e.target.value;
    setSelectedDeck(chosenDeck);
    setConcluidas(0);
    setArrConc([]);
    setCurrentSessionId(null);
    setSessionStartTime(null);

    if (currentUser && chosenDeck) {
      // Após selecionar o deck, obter o total de cards do deck
      try {
        const cardsRef = collection(
          db,
          'users',
          currentUser.uid,
          'decks',
          chosenDeck,
          'cards',
        );
        const cardsSnapshot = await getDocs(cardsRef);
        setTotalCards(cardsSnapshot.size);
      } catch (error) {
        console.error('Erro ao buscar cards do deck:', error);
      }
    } else {
      setTotalCards(0);
    }
  };

  const concluiQuestao = async () => {
    // Ao concluir um card, incrementamos concluidas
    setConcluidas((prev) => {
      const newVal = prev + 1;

      // Se esta é a primeira questão concluída, iniciar sessão
      if (newVal === 1 && !currentSessionId && selectedDeck && currentUser) {
        startStudySession(currentUser.uid, selectedDeck);
      }

      // Se concluiu todos os cards do deck, finalizar sessão
      if (
        totalCards > 0 &&
        newVal === totalCards &&
        currentSessionId &&
        currentUser
      ) {
        endStudySession(currentUser.uid, currentSessionId);
      }

      return newVal;
    });
  };

  // Função para iniciar uma sessão de estudo
  const startStudySession = async (userId, deckId) => {
    try {
      const sessionsRef = collection(db, 'users', userId, 'studySessions');
      const newSessionRef = doc(sessionsRef); // gera um ID automático

      const sessionData = {
        deckId: deckId,
        startTime: Timestamp.now(),
        cardsReviewed: 0, // atualize se quiser acompanhar no meio da sessão
      };

      await setDoc(newSessionRef, sessionData);
      setCurrentSessionId(newSessionRef.id);
      setSessionStartTime(Date.now());
      console.log('Sessão iniciada com ID:', newSessionRef.id);
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
    }
  };

  // Função para finalizar a sessão
  const endStudySession = async (userId, sessionId) => {
    try {
      const sessionDocRef = doc(
        db,
        'users',
        userId,
        'studySessions',
        sessionId,
      );

      // Calcular métricas fictícias para finalScore, duration, successRate
      const now = Date.now();
      const diffMs = now - sessionStartTime;
      const durationMin = Math.round(diffMs / 60000); // duração em minutos
      const finalScore = 100; // Exemplo fixo
      const successRate = 100; // Exemplo fixo

      await updateDoc(sessionDocRef, {
        endTime: Timestamp.now(),
        finalScore: finalScore,
        duration: durationMin,
        successRate: successRate,
      });
      console.log('Sessão finalizada com ID:', sessionId);

      // Limpar estados da sessão
      setCurrentSessionId(null);
      setSessionStartTime(null);
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
    }
  };

  return (
    <div className="review-page">
      <h1>Revisar Cartões</h1>
      {!selectedDeck ? (
        <div className="deck-selection">
          <label htmlFor="deck-select">Selecione um Deck para Estudar:</label>
          <select
            id="deck-select"
            value={selectedDeck}
            onChange={handleDeckChange}
            className="input"
          >
            <option value="">-- Selecione um Deck --</option>
            {decks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <Perguntas
          deckId={selectedDeck}
          concluiQuestao={concluiQuestao}
          setArrConc={setArrConc}
          arrConc={arrConc}
        />
      )}
      {selectedDeck && (
        <BarraInferior concluidas={concluidas} arrConc={arrConc} />
      )}
    </div>
  );
};

export default ReviewCardsPage;
