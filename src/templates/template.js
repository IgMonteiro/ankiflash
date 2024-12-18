// src/templates/template.js

// Template para Anki Padrão Basic
const Template = (templateData) => {
  return {
    // Definição básica do template
    name: templateData?.name || 'Default Template', // Nome do template, com fallback
    templates: [
      {
        name: 'Card 1',
        front: '{{Front}}', // Definição do conteúdo da frente do card
        back: '{{Back}}', // Definição do conteúdo do verso do card
      },
    ],
  };
};

export default Template;
