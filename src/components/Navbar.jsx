// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import app from '../firebaseConfig';

const auth = getAuth(app);

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('Erro ao sair:', error);
      });
  };

  return (
    <nav style={styles.nav}>
      <h1 style={styles.logo}>AnkiFlash</h1>
      <ul style={styles.navLinks}>
        <li>
          <Link to="/" style={styles.link}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/decks" style={styles.link}>
            Decks
          </Link>
        </li>
        <li>
          <Link to="/create-card" style={styles.link}>
            Criar Card
          </Link>
        </li>
        <li>
          <Link to="/reports" style={styles.link}>
            Relatórios
          </Link>
        </li>
        {/* Botão "Estude" */}
        <li>
          <Link to="/review-cards" style={styles.link}>
            Estude
          </Link>
        </li>
        {/* Novo link para "Exportar Deck" */}
        <li>
          <Link to="/export-deck" style={styles.link}>
            Exportar Deck
          </Link>
        </li>
        <li>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Sair
          </button>
        </li>
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#0f4c83',
    color: '#fff',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  navLinks: {
    listStyle: 'none',
    display: 'flex',
    gap: '1rem',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1rem',
  },
  logoutButton: {
    backgroundColor: '#fff',
    color: '#0f4c83',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontSize: '1rem',
    borderRadius: '5px',
  },
};

export default Navbar;
