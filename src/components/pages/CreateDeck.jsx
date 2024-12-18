// src/components/pages/CreateDeck.jsx

import React, { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const CreateDeck = () => {
  const { currentUser } = useAuth();
  const [deckName, setDeckName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const { id } = useParams(); // 'id' é deckId
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeck = async () => {
      if (id && currentUser) {
        const deckDoc = doc(db, 'users', currentUser.uid, 'decks', id);
        const deckData = await getDoc(deckDoc);
        if (deckData.exists()) {
          setDeckName(deckData.data().name);
          setDescription(deckData.data().description || '');
        } else {
          setError('Deck não encontrado.');
        }
      }
    };

    fetchDeck();
  }, [id, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Usuário não autenticado.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (id) {
        // Atualizar deck existente
        const deckDoc = doc(db, 'users', currentUser.uid, 'decks', id);
        await updateDoc(deckDoc, {
          name: deckName,
          description: description || '',
          updated_at: Timestamp.now(),
        });
      } else {
        // Criar novo deck
        const decksRef = collection(db, 'users', currentUser.uid, 'decks');
        const newDeckId = uuidv4();
        await setDoc(doc(decksRef, newDeckId), {
          name: deckName,
          description: description || '',
          tags: [], // Inicialmente sem tags
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
          cards_count: 0, // Inicialmente 0
          userId: currentUser.uid, // Necessário para as regras de segurança
        });

        // Atualizar o contador de decks no documento do usuário
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          decks_count: increment(1),
        });
      }
      navigate('/decks');
    } catch (error) {
      console.error('Erro ao criar/atualizar deck:', error);
      setError('Ocorreu um erro ao criar/atualizar o deck.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-deck-container">
      <h1>{id ? 'Editar Deck' : 'Criar Deck'}</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="deck-name">Nome do Deck:</label>
        <input
          type="text"
          id="deck-name"
          placeholder="Nome do Deck"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          required
        />

        <label htmlFor="deck-description">Descrição do Deck:</label>
        <textarea
          id="deck-description"
          placeholder="Descrição do Deck"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

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
    marginTop: '1rem',
    background: 'none',
    border: 'none',
    color: '#0f4c83',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};

export default CreateDeck;
