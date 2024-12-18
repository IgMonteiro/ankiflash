// src/components/pages/ExportDeck.jsx

import React, { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import { saveAs } from 'file-saver';
import {
  initializeSqlJs,
  createApkgExporter,
} from '../../exporters/apkgExporter';

const ExportDeck = () => {
  const { currentUser } = useAuth();
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState('');
  const [deckName, setDeckName] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Inicializa o sql.js quando o componente monta
  useEffect(() => {
    const initSql = async () => {
      await initializeSqlJs();
    };
    initSql();
  }, []);

  // Carregar decks do usuário
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
      } catch (err) {
        console.error('Erro ao buscar decks:', err);
        setError('Erro ao buscar decks.');
      }
    };

    fetchDecks();
  }, [currentUser]);

  // Ao selecionar um deck, carregar seu nome e seus cards
  const handleDeckChange = async (e) => {
    const chosenDeck = e.target.value;
    setSelectedDeck(chosenDeck);
    setDeckName('');
    setCards([]);
    setError(null);

    if (!currentUser || !chosenDeck) return;

    try {
      setLoading(true);

      // Obter nome do deck
      const deckDocRef = doc(db, 'users', currentUser.uid, 'decks', chosenDeck);
      const deckSnap = await getDoc(deckDocRef);
      if (deckSnap.exists()) {
        const deckData = deckSnap.data();
        setDeckName(deckData.name || 'Deck Sem Nome');
      } else {
        setError('Deck não encontrado.');
        setLoading(false);
        return;
      }

      // Obter cards do deck
      const cardsRef = collection(
        db,
        'users',
        currentUser.uid,
        'decks',
        chosenDeck,
        'cards',
      );
      const q = query(cardsRef, where('deckId', '==', chosenDeck));
      const cardsSnap = await getDocs(q);
      const loadedCards = cardsSnap.docs.map((doc) => ({
        front: doc.data().question,
        back: doc.data().answer,
      }));

      setCards(loadedCards);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar deck e cards:', err);
      setError('Ocorreu um erro ao carregar as informações do deck.');
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!deckName) {
      alert('Por favor, selecione um deck.');
      return;
    }

    if (cards.length === 0) {
      alert('Este deck não possui cards para exportar.');
      return;
    }

    try {
      setLoading(true);

      const exporter = createApkgExporter(deckName);

      cards.forEach((card) => {
        exporter.addCard(card.front, card.back);
      });

      const zip = await exporter.save(); // zip é um ArrayBuffer

      // Converter ArrayBuffer em Uint8Array antes de criar o blob
      const zipArray = new Uint8Array(zip);
      const blob = new Blob([zipArray], { type: 'application/octet-stream' });
      saveAs(blob, `${deckName}.apkg`);

      alert('Deck exportado com sucesso!');
      setLoading(false);
    } catch (err) {
      console.error('Erro ao exportar deck:', err);
      alert(
        'Ocorreu um erro ao exportar o deck. Verifique o console para detalhes.',
      );
      setLoading(false);
    }
  };

  return (
    <div className="export-deck-container">
      <h1>Exportar Deck</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="select-deck">
        <label htmlFor="deck-select">Selecione um Deck para Exportar:</label>
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

      {loading && <p>Carregando dados do deck...</p>}

      {deckName && cards.length > 0 && !loading && (
        <div>
          <h2>Deck: {deckName}</h2>
          <p>Quantidade de cartões: {cards.length}</p>
          <button onClick={handleExport}>Exportar como APKG</button>
        </div>
      )}
    </div>
  );
};

export default ExportDeck;
