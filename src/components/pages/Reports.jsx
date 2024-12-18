// src/components/pages/Reports.jsx

import React, { useEffect, useState, useRef } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const stateColors = {
  erro: {
    background: 'rgba(255, 99, 132, 0.6)',
    border: 'rgba(255, 99, 132, 1)',
  },
  meio: {
    background: 'rgba(255, 206, 86, 0.6)',
    border: 'rgba(255, 206, 86, 1)',
  },
  acerto: {
    background: 'rgba(75, 192, 192, 0.6)',
    border: 'rgba(75, 192, 192, 1)',
  },
};

const Reports = () => {
  const { currentUser } = useAuth();
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reportRef = useRef();

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

  const handleGenerateReport = async () => {
    if (!selectedDeck || !startDate || !endDate) {
      setError('Por favor, selecione um deck e um intervalo de datas.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const startTimestamp = Timestamp.fromDate(start);
      const endTimestamp = Timestamp.fromDate(end);

      // Buscar todos os cards do deck selecionado
      const cardsRef = collection(
        db,
        'users',
        currentUser.uid,
        'decks',
        selectedDeck,
        'cards',
      );
      const cardsSnapshot = await getDocs(cardsRef);
      const allCards = cardsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filtrar cards criados no período
      const cardsCreatedInPeriod = allCards.filter(
        (card) =>
          card.created_at &&
          card.created_at.toDate() >= start &&
          card.created_at.toDate() <= end,
      );

      // Filtrar cards revisados no período
      const cardsReviewedInPeriod = allCards.filter(
        (card) =>
          card.reviewedAt &&
          card.reviewedAt.toDate() >= start &&
          card.reviewedAt.toDate() <= end,
      );

      // Contagem de revisões realizadas (cada card revisado no período conta como 1)
      const totalReviews = cardsReviewedInPeriod.length;

      // Distribuição dos estados (acerto, meio, erro)
      const reviewStateCounts = { erro: 0, meio: 0, acerto: 0 };
      cardsReviewedInPeriod.forEach((card) => {
        if (card.lastReviewState) {
          const state = card.lastReviewState.toLowerCase();
          if (reviewStateCounts[state] !== undefined) {
            reviewStateCounts[state] += 1;
          }
        }
      });

      // Cálculo da taxa de sucesso
      const successfulReviews = cardsReviewedInPeriod.filter(
        (c) =>
          c.lastReviewState && c.lastReviewState.toLowerCase() === 'acerto',
      ).length;
      const successRate =
        totalReviews > 0
          ? ((successfulReviews / totalReviews) * 100).toFixed(2)
          : '0.00';

      // Dados para o gráfico de tendência: "Cards Criados" e "Cards Revisados"
      const trendDataMap = {};
      cardsCreatedInPeriod.forEach((card) => {
        const dateStr = card.created_at.toDate().toISOString().split('T')[0];
        if (!trendDataMap[dateStr]) {
          trendDataMap[dateStr] = { created: 0, reviewed: 0 };
        }
        trendDataMap[dateStr].created += 1;
      });
      cardsReviewedInPeriod.forEach((card) => {
        const dateStr = card.reviewedAt.toDate().toISOString().split('T')[0];
        if (!trendDataMap[dateStr]) {
          trendDataMap[dateStr] = { created: 0, reviewed: 0 };
        }
        trendDataMap[dateStr].reviewed += 1;
      });

      // Obter sessões no período
      const sessionsRef = collection(
        db,
        'users',
        currentUser.uid,
        'studySessions',
      );
      const sessionsQuery = query(
        sessionsRef,
        where('deckId', '==', selectedDeck),
        where('endTime', '>=', startTimestamp),
        where('endTime', '<=', endTimestamp),
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = sessionsSnapshot.docs.map((doc) => doc.data());

      const sessionsCount = sessions.length;

      let avgFinalScore = 0;
      let avgDuration = 0;
      let avgSessionSuccessRate = 0;

      if (sessionsCount > 0) {
        const totalFinalScore = sessions.reduce(
          (sum, s) => sum + (s.finalScore || 0),
          0,
        );
        const totalDuration = sessions.reduce(
          (sum, s) => sum + (s.duration || 0),
          0,
        );
        const totalSessionSuccess = sessions.reduce(
          (sum, s) => sum + (s.successRate || 0),
          0,
        );

        avgFinalScore = (totalFinalScore / sessionsCount).toFixed(2);
        avgDuration = (totalDuration / sessionsCount).toFixed(2);
        avgSessionSuccessRate = (totalSessionSuccess / sessionsCount).toFixed(
          2,
        );
      }

      const sessionsTrendMap = {};
      sessions.forEach((session) => {
        if (session.endTime) {
          const endDateStr = session.endTime
            .toDate()
            .toISOString()
            .split('T')[0];
          if (!sessionsTrendMap[endDateStr]) {
            sessionsTrendMap[endDateStr] = 0;
          }
          sessionsTrendMap[endDateStr] += 1;
        }
      });

      const allDatesSet = new Set([
        ...Object.keys(trendDataMap),
        ...Object.keys(sessionsTrendMap),
      ]);
      const sortedAllDates = Array.from(allDatesSet).sort();
      const createdCounts = sortedAllDates.map((d) =>
        trendDataMap[d] ? trendDataMap[d].created : 0,
      );
      const reviewedCounts = sortedAllDates.map((d) =>
        trendDataMap[d] ? trendDataMap[d].reviewed : 0,
      );
      const sessionsCompletedCounts = sortedAllDates.map(
        (d) => sessionsTrendMap[d] || 0,
      );

      const reviewStateDistribution = { ...reviewStateCounts };

      setReport({
        deckName:
          decks.find((deck) => deck.id === selectedDeck)?.name ||
          'Desconhecido',
        createdCount: cardsCreatedInPeriod.length,
        reviewedCount: totalReviews,
        startDate: start.toLocaleDateString(),
        endDate: end.toLocaleDateString(),
        allCards,
        cardsCreatedInPeriod,
        trendData: {
          dates: sortedAllDates,
          createdCounts,
          reviewedCounts,
          sessionsCompletedCounts,
        },
        reviewStateDistribution,
        successRate,
        sessionsCount,
        avgFinalScore,
        avgDuration,
        avgSessionSuccessRate,
      });
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      setError('Erro ao gerar relatório.');
    }

    setLoading(false);
  };

  const handleExportPDF = () => {
    const input = reportRef.current;
    if (!input) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();

    html2canvas(input, { scale: 2, useCORS: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - 20;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save('relatorio.pdf');
      })
      .catch((error) => {
        console.error('Erro ao gerar o PDF:', error);
        setError('Erro ao gerar o PDF.');
      });
  };

  const handleExportCSV = () => {
    if (!report) return;

    const csvRows = [
      [
        'Deck',
        'Período',
        'Cards Criados',
        'Revisões Realizadas',
        'Taxa de Sucesso (%)',
        'Sessões no Período',
        'Média FinalScore (Sessões)',
        'Média Duração (Sessões)',
        'Média SuccessRate (Sessões)',
      ],
      [
        report.deckName,
        `${report.startDate} - ${report.endDate}`,
        report.createdCount,
        report.reviewedCount,
        report.successRate,
        report.sessionsCount,
        report.avgFinalScore,
        report.avgDuration,
        report.avgSessionSuccessRate,
      ],
    ];

    const csvContent = csvRows.map((row) => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'relatorio.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="deck-container">
      <h1>Relatórios</h1>
      <div className="report-controls">
        <div className="control-group">
          <label htmlFor="deck-select">Selecione um Deck:</label>
          <select
            id="deck-select"
            value={selectedDeck}
            onChange={(e) => setSelectedDeck(e.target.value)}
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

        <div className="control-group">
          <label htmlFor="start-date">Data Inicial:</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input"
          />
        </div>

        <div className="control-group">
          <label htmlFor="end-date">Data Final:</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input"
          />
        </div>

        <button
          className="button"
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? 'Gerando...' : 'Gerar Relatório'}
        </button>

        {error && <p className="error-message">{error}</p>}
      </div>

      {report && (
        <div className="report" ref={reportRef}>
          <h2>Relatório do Deck: {report.deckName}</h2>
          <p>
            Período: {report.startDate} - {report.endDate}
          </p>
          <p>
            <strong>Cards Criados:</strong> {report.createdCount}
          </p>
          <p>
            <strong>Cards Revisados:</strong> {report.reviewedCount}
          </p>
          <p>
            <strong>Taxa de Sucesso nas Revisões:</strong> {report.successRate}%
          </p>

          {report.trendData && report.trendData.dates.length > 0 && (
            <div className="trend-chart chart-container">
              <h3>Tendência de Criação, Revisão e Sessões de Estudo</h3>
              <Line
                data={{
                  labels: report.trendData.dates,
                  datasets: [
                    {
                      label: 'Cards Criados',
                      data: report.trendData.createdCounts,
                      borderColor: 'rgba(75, 192, 192, 1)',
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      fill: true,
                    },
                    {
                      label: 'Cards revisados',
                      data: report.trendData.reviewedCounts,
                      borderColor: 'rgba(153, 102, 255, 1)',
                      backgroundColor: 'rgba(153, 102, 255, 0.2)',
                      fill: true,
                    },
                    {
                      label: 'Sessões Completadas',
                      data: report.trendData.sessionsCompletedCounts,
                      borderColor: 'rgba(255, 159, 64, 1)',
                      backgroundColor: 'rgba(255, 159, 64, 0.2)',
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  interaction: { mode: 'index', intersect: false },
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: false },
                  },
                  scales: {
                    x: { title: { display: true, text: 'Data' } },
                    y: {
                      title: { display: true, text: 'Quantidade' },
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          )}

          {report.reviewedCount > 0 && (
            <div className="review-state-chart chart-container">
              <h3>Respostas da Última Revisão</h3>
              <Pie
                data={{
                  labels: Object.keys(report.reviewStateDistribution).map(
                    (state) => state.charAt(0).toUpperCase() + state.slice(1),
                  ),
                  datasets: [
                    {
                      data: Object.values(report.reviewStateDistribution),
                      backgroundColor: Object.keys(
                        report.reviewStateDistribution,
                      ).map(
                        (state) =>
                          stateColors[state]?.background ||
                          'rgba(201, 203, 207, 0.6)',
                      ),
                      borderColor: Object.keys(
                        report.reviewStateDistribution,
                      ).map(
                        (state) =>
                          stateColors[state]?.border ||
                          'rgba(201, 203, 207, 1)',
                      ),
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: false },
                  },
                }}
              />
            </div>
          )}

          {report.sessionsCount > 0 && (
            <div className="session-metrics">
              <h3>Métricas de Sessões de Estudo</h3>
              <p>
                <strong>Sessões Completas no Período:</strong>{' '}
                {report.sessionsCount}
              </p>
              <p>
                <strong>Média FinalScore (Sessões):</strong>{' '}
                {report.avgFinalScore}
              </p>
              <p>
                <strong>Média Duração (Sessões):</strong> {report.avgDuration}
              </p>
              <p>
                <strong>Média SuccessRate (Sessões):</strong>{' '}
                {report.avgSessionSuccessRate}%
              </p>
            </div>
          )}

          <div className="export-buttons">
            <button className="button" onClick={handleExportPDF}>
              Exportar como PDF
            </button>
            <button className="button" onClick={handleExportCSV}>
              Exportar como CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
