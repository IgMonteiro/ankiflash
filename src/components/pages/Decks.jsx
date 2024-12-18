// src/components/pages/Decks.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';

const Decks = () => {
  const { currentUser } = useAuth();
  const [decks, setDecks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecks = async () => {
      if (!currentUser) return;

      const decksRef = collection(db, 'users', currentUser.uid, 'decks');
      const decksSnapshot = await getDocs(decksRef);
      const decksList = decksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDecks(decksList);
    };

    fetchDecks();
  }, [currentUser]);

  const handleDelete = async (deckId) => {
    if (!currentUser) return;

    // Confirmar exclusão
    const confirmDelete = window.confirm(
      'Tem certeza que deseja excluir este deck?',
    );
    if (!confirmDelete) return;

    try {
      // Deletar deck
      await deleteDoc(doc(db, 'users', currentUser.uid, 'decks', deckId));

      // Opcional: Deletar todos os cards associados a este deck
      const cardsRef = collection(db, 'users', currentUser.uid, 'cards');
      const q = query(cardsRef, where('deckId', '==', deckId));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map((cardDoc) =>
        deleteDoc(cardDoc.ref),
      );
      await Promise.all(deletePromises);

      // Atualizar o estado local
      setDecks(decks.filter((deck) => deck.id !== deckId));
      alert('Deck excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir deck:', error);
      alert('Ocorreu um erro ao excluir o deck.');
    }
  };

  const handleEditCards = (deckId) => {
    navigate(`/edit-deck/${deckId}`);
  };

  return (
    <div className="deck-container">
      <h1>Seus Decks</h1>
      <button
        className="btn-create-deck"
        onClick={() => navigate('/create-deck')}
      >
        Criar Novo Deck
      </button>
      <ul className="deck-list">
        {decks.map((deck) => (
          <li key={deck.id} className="deck-item">
            <span className="deck-name">{deck.name}</span>
            <div className="deck-actions">
              <button
                className="btn-edit-cards"
                onClick={() => handleEditCards(deck.id)}
              >
                Editar Cartões
              </button>
              <button
                className="btn-delete-deck"
                onClick={() => handleDelete(deck.id)}
              >
                Excluir Deck
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Decks;
