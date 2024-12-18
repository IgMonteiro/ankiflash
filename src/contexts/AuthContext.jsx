// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import app from '../firebaseConfig'; // Certifique-se de que este caminho está correto

const AuthContext = createContext();

// Hook para acessar o contexto de autenticação
export function useAuth() {
  return useContext(AuthContext);
}

// Provedor de autenticação
export function AuthProvider({ children }) {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener para mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // Cria o documento do usuário se não existir
          await setDoc(userDocRef, {
            email: user.email,
            username: user.displayName || 'Sem Nome',
            profile_picture: user.photoURL || '',
            bio: '',
            created_at: Timestamp.now(),
            last_login: Timestamp.now(),
            decks_count: 0,
          });
        } else {
          // Atualiza o campo last_login se o documento já existir
          await setDoc(
            userDocRef,
            {
              last_login: Timestamp.now(),
            },
            { merge: true },
          );
        }

        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });

    // Limpa o listener ao desmontar o componente
    return unsubscribe;
  }, [auth, db]);

  const value = {
    currentUser,
    // Adicione outros valores e métodos de autenticação aqui, se necessário
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
