// src/components/pages/Register.jsx
import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import app from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const auth = getAuth(app);

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        console.error('Erro ao registrar:', error);
      });
  };

  return (
    <div>
      <h1>Registro</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Registrar</button>
      </form>
      <button onClick={() => navigate('/login')} style={styles.backButton}>
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

export default Register;
