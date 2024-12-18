// src/components/pages/CreateCard.jsx

import React, { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  increment,
  getDocs,
} from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const CreateCard = () => {
  const { currentUser } = useAuth();
  const [question, setQuestion] = useState(''); // Renomeado de 'front' para 'question'
  const [answer, setAnswer] = useState(''); // Renomeado de 'back' para 'answer'
  const [deckId, setDeckId] = useState('');
  const [decks, setDecks] = useState([]);
  const navigate = useNavigate();
  const { deckId: routeDeckId, id } = useParams(); // 'id' é cardId
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDecks = async () => {
      if (!currentUser) return;

      try {
        const decksRef = collection(db, 'users', currentUser.uid, 'decks');
        const decksSnapshot = await getDocs(decksRef);
        const decksData = decksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDecks(decksData);
      } catch (error) {
        console.error('Erro ao buscar decks:', error);
        setError('Ocorreu um erro ao buscar os decks.');
      }
    };

    const fetchCard = async () => {
      if (id && currentUser && routeDeckId) {
        try {
          const cardDoc = doc(
            db,
            'users',
            currentUser.uid,
            'decks',
            routeDeckId,
            'cards',
            id,
          );
          const cardData = await getDoc(cardDoc);
          if (cardData.exists()) {
            setQuestion(cardData.data().question);
            setAnswer(cardData.data().answer);
            setDeckId(routeDeckId);
          } else {
            setError('Card não encontrado.');
          }
        } catch (error) {
          console.error('Erro ao buscar card:', error);
          setError('Ocorreu um erro ao buscar o card.');
        }
      }
    };

    fetchDecks();
    if (id) {
      fetchCard();
    }
  }, [id, currentUser, routeDeckId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Usuário não autenticado.');
      return;
    }

    if (!deckId) {
      setError('Por favor, selecione um deck.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (id) {
        // Atualizar card existente
        const cardDoc = doc(
          db,
          'users',
          currentUser.uid,
          'decks',
          deckId,
          'cards',
          id,
        );
        await updateDoc(cardDoc, {
          question: question, // Renomeado para 'question'
          answer: answer, // Renomeado para 'answer'
          updated_at: Timestamp.now(),
        });
        alert('Card atualizado com sucesso!');
      } else {
        // Criar novo card associado ao deck
        const cardsRef = collection(
          db,
          'users',
          currentUser.uid,
          'decks',
          deckId,
          'cards',
        );
        const newCardId = uuidv4();
        await setDoc(doc(cardsRef, newCardId), {
          question: question, // Renomeado para 'question'
          answer: answer, // Renomeado para 'answer'
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
          review_count: 0,
          next_review: Timestamp.now(), // Inicialmente hoje
          interval: 1,
          ease_factor: 2.5,
          deckId: deckId, // Necessário para as regras de segurança
        });

        // Atualizar o contador de cards no deck
        const deckDoc = doc(db, 'users', currentUser.uid, 'decks', deckId);
        await updateDoc(deckDoc, {
          cards_count: increment(1),
        });
        alert('Card criado com sucesso!');
      }
      navigate('/decks');
    } catch (error) {
      console.error('Erro ao criar/atualizar card:', error);
      setError('Ocorreu um erro ao criar/atualizar o card.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-card-container">
      <h1>{id ? 'Editar Card' : 'Criar Card'}</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="deck-select">Selecione um Deck:</label>
          <select
            id="deck-select"
            onChange={(e) => setDeckId(e.target.value)}
            value={deckId}
            required
            className="input"
            disabled={id && deckId}
          >
            <option value="">-- Selecione um Deck --</option>
            {decks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="question">Frente do Card:</label>
          <textarea
            id="question"
            placeholder="Frente do Card"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="textarea"
          />
        </div>

        <div className="form-group">
          <label htmlFor="answer">Verso do Card:</label>
          <textarea
            id="answer"
            placeholder="Verso do Card"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
            className="textarea"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : id ? 'Atualizar' : 'Criar'}
        </button>
      </form>

      <button onClick={() => navigate('/decks')} style={styles.backButton}>
        Voltar
      </button>
    </div>
  );
};

const styles = {
  backButton: {
    marginTop: '1.5rem',
    color: '#007BFF',
    textDecoration: 'underline',
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'block',
    width: '100%',
    textAlign: 'center',
  },
};

export default CreateCard;
