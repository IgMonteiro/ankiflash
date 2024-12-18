# Anki Flash

**Anki Flash** é um aplicativo web para estudo por meio de flashcards, inspirado no popular aplicativo [Anki](https://apps.ankiweb.net/). Desenvolvido em [React](https://reactjs.org/) com o [Vite](https://vitejs.dev/), o Anki Flash torna o processo de criar, gerenciar e revisar flashcards simples e intuitivo. O projeto inclui funcionalidades como autenticação, criação de decks e cards, revisões espaçadas, relatórios de desempenho, e exportação de decks para o formato `.apkg` compatível com o Anki padrão.

## Índice

1. [Recursos Principais](#recursos-principais)
2. [Tecnologias e Bibliotecas Utilizadas](#tecnologias-e-bibliotecas-utilizadas)
3. [Pré-Requisitos](#pré-requisitos)
4. [Instalação](#instalação)
5. [Configuração do Firebase](#configuração-do-firebase)
6. [Comandos Disponíveis](#comandos-disponíveis)
7. [Uso do Aplicativo](#uso-do-aplicativo)
8. [Exportação de Decks para Anki](#exportação-de-decks-para-anki)
9. [Geração de Relatórios](#geração-de-relatórios)
10. [Contribuindo com o Projeto](#contribuindo-com-o-projeto)
11. [Licença](#licença)

---

## Recursos Principais

- **Criação de Decks**: Crie decks personalizados para organizar seus flashcards.
- **Criação e Edição de Cards**: Adicione frente e verso de cada card de forma simples.
- **Revisões Espaçadas**: Aplique o método de repetição espaçada para maximizar a retenção.
- **Autenticação com Firebase**: Faça login e gerencie seus dados de forma segura.
- **Exportação para `.apkg`**: Exporte seus decks para o formato `.apkg` compatível com o Anki padrão.
- **Relatórios e Gráficos**: Gere relatórios de desempenho, visualize gráficos de progresso e estatísticas de estudo.
- **Responsividade**: A interface é projetada para se adaptar a diferentes tamanhos de tela.

---

## Tecnologias e Bibliotecas Utilizadas

- **Front-End**:
  - [React](https://reactjs.org/): Biblioteca JavaScript para construção de interfaces.
  - [Vite](https://vitejs.dev/): Ferramenta de build e desenvolvimento rápido para front-end.
  - [Firebase SDK](https://firebase.google.com/): Autenticação, Firestore (banco de dados), e hospedagem.
  - [UUID](https://github.com/uuidjs/uuid): Geração de IDs únicos para cards e decks.
  - [React Router](https://reactrouter.com/): Navegação entre páginas no aplicativo.
  - [Chart.js](https://www.chartjs.org/) + [React Chart.js 2](https://react-chartjs-2.js.org/): Geração de gráficos interativos nos relatórios.
  - [html2canvas](https://github.com/niklasvh/html2canvas): Captura de tela em canvas, utilizada para geração de PDFs.
  - [jsPDF](https://github.com/parallax/jsPDF): Geração de PDFs a partir do DOM.
  
- **Exportação de Decks**:
  - [anki-apkg-export](https://github.com/ewnd9/anki-apkg-export): Biblioteca utilizada para gerar arquivos `.apkg` compatíveis com o Anki.

---

## Pré-Requisitos

- **Node.js** (versão 14 ou superior): [Instale o Node.js](https://nodejs.org/)
- **npm** (geralmente instalado junto com o Node.js)
- **Conta no Firebase**: Para autenticação e Firestore.

---

## Instalação

1. **Clone o repositório**:

```bash
git clone https://github.com/seu-usuario/anki-flash.git
```

2. **Instale as dependências**:

```bash
cd anki-flash
npm install
```

---

## Configuração do Firebase

1. Crie um novo projeto no [Firebase Console](https://console.firebase.google.com/).
2. Habilite o Firestore e a Autenticação por Email/Senha.
3. Gere as credenciais do seu app Web no Firebase.
4. Crie um arquivo `firebaseConfig.js` na pasta `src/` (ou use o existente) com as configurações obtidas do Firebase:

```javascript
// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
export default app;
```

---

## Comandos Disponíveis

- **Iniciar o servidor de desenvolvimento**:
  
```bash
npm run dev
```
ou

```bash
vite
```

Este comando iniciará o aplicativo no modo de desenvolvimento. Abra [http://localhost:5173](http://localhost:5173) para visualizar no navegador.

- **Build de produção**:
  
```bash
npm run build
```

Gera os arquivos otimizados para produção na pasta `dist/`.

- **Visualizar a versão de produção localmente**:
  
```bash
npm run preview
```

Permite visualizar o que foi gerado pelo `build`.

---

## Uso do Aplicativo

1. **Cadastro e Login**: Crie uma conta ou faça login com suas credenciais cadastradas. O app utiliza o Firebase Auth para gerenciamento seguro de usuários.
2. **Criar Decks**: Navegue até a página de criação de decks e adicione um novo deck com nome e descrição.
3. **Criar Cards**: Dentro de um deck, crie novos cards definindo frente (question) e verso (answer).
4. **Revisar Cards**: Use o modo de revisão para aplicar o método de repetição espaçada (cards são agendados para revisão de acordo com seu desempenho).
5. **Relatórios e Gráficos**: Acesse a página de relatórios para gerar estatísticas sobre seu desempenho, total de revisões, e progresso. Utilize gráficos interativos via Chart.js.

---

## Exportação de Decks para Anki (Ainda não funcional)

1. **Exportar**: Acesse a página de exportação e selecione o deck desejado. O app utilizará a biblioteca `anki-apkg-export` para gerar um arquivo `.apkg`.
2. **Importar no Anki**: Abra o aplicativo Anki (desktop), vá em `File > Import`, e selecione o arquivo `.apkg` gerado. Agora seus decks criados no Anki Flash estarão disponíveis no Anki padrão.

---

## Geração de Relatórios

- **Chart.js e React Chart.js 2**: A página de relatórios usa o Chart.js, integrado ao React Chart.js 2, para renderizar gráficos de linha, pizza e outros tipos de visualização.
- **PDFs**: Utilize `jsPDF` e `html2canvas` para exportar seus relatórios como PDFs, salvando localmente para referência futura.

---

**Aproveite o Anki Flash e bons estudos!**
