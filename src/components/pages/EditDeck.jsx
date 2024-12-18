// src/components/pages/EditDeck.jsx
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';

const EditDeck = () => {
  const { id } = useParams(); // deckId
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCards = async () => {
      if (!currentUser || !id) return;

      try {
        // Caminho correto para os cards dentro do deck
        const cardsRef = collection(
          db,
          'users',
          currentUser.uid,
          'decks',
          id,
          'cards',
        );
        const q = query(cardsRef, where('deckId', '==', id));
        const querySnapshot = await getDocs(q);
        const cardsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCards(cardsList);
      } catch (error) {
        console.error('Erro ao buscar cards:', error);
        alert('Ocorreu um erro ao buscar os cards.');
      }
    };

    fetchCards();
  }, [currentUser, id]);

  const handleChange = (cardId, field, value) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId
          ? { ...card, [field]: value } // Atualiza 'question' e 'answer'
          : card,
      ),
    );
  };

  const handleSave = async () => {
    try {
      const updatePromises = cards.map((card) => {
        const cardDoc = doc(
          db,
          'users',
          currentUser.uid,
          'decks',
          id,
          'cards',
          card.id,
        );
        return updateDoc(cardDoc, {
          question: card.question,
          answer: card.answer,
          updated_at: Timestamp.now(),
        });
      });

      await Promise.all(updatePromises);
      alert('Cards atualizados com sucesso!');
      navigate('/decks');
    } catch (error) {
      console.error('Erro ao atualizar cards:', error);
      alert('Ocorreu um erro ao atualizar os cards.');
    }
  };

  const handleDeleteCard = async (cardId) => {
    const confirmDelete = window.confirm(
      'Tem certeza que deseja excluir este cartão?',
    );
    if (!confirmDelete) return;

    try {
      // Deletar card com o caminho correto
      await deleteDoc(
        doc(db, 'users', currentUser.uid, 'decks', id, 'cards', cardId),
      );

      // Se futuramente implementar 'noteId', descomente e ajuste conforme necessário
      /*
      const cardDoc = await getDoc(doc(db, 'users', currentUser.uid, 'decks', id, 'cards', cardId));
      if (cardDoc.exists()) {
        const noteId = cardDoc.data().noteId;
        await deleteDoc(doc(db, 'notes', noteId));
      }
      */

      // Atualizar o estado local removendo o card deletado
      setCards(cards.filter((card) => card.id !== cardId));
      alert('Card excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir card:', error);
      alert('Ocorreu um erro ao excluir o card.');
    }
  };

  return (
    <div className="edit-deck-container">
      <h1>Editar Cards do Deck</h1>
      <button className="btn-back" onClick={() => navigate('/decks')}>
        Voltar
      </button>
      <div className="cards-list">
        {cards.map((card) => (
          <div key={card.id} className="card-item">
            <div className="card-fields">
              <label>Frente:</label>
              <input
                type="text"
                value={card.question} // Corrigido de card.fields.Front para card.question
                onChange={(e) =>
                  handleChange(card.id, 'question', e.target.value)
                }
              />
            </div>
            <div className="card-fields">
              <label>Verso:</label>
              <input
                type="text"
                value={card.answer} // Corrigido de card.fields.Back para card.answer
                onChange={(e) =>
                  handleChange(card.id, 'answer', e.target.value)
                }
              />
            </div>
            <button
              className="btn-delete-card"
              onClick={() => handleDeleteCard(card.id)}
            >
              Excluir Card
            </button>
          </div>
        ))}
      </div>
      <button className="btn-save" onClick={handleSave}>
        Salvar Alterações
      </button>
    </div>
  );
};

export default EditDeck;
