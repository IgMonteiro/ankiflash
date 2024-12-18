// src/exporters/apkgExporter.js

import Exporter from './Exporter';
import Template from '../templates/template';
import initSqlJs from 'sql.js';
import JSZip from 'jszip';

let SQL = null;

/**
 * Função assíncrona para inicializar o sql.js
 */
export async function initializeSqlJs() {
  try {
    SQL = await initSqlJs({
      locateFile: (file) => '/sql-wasm.wasm', // arquivo wasm local na pasta public
    });
    console.log('sql.js carregado com sucesso');
  } catch (error) {
    console.error('Erro ao carregar o sql.js:', error);
  }
}

/**
 * Função para criar o Exporter
 * @param {string} deckName - Nome do deck a ser exportado
 * @param {string} templateName - Nome do template a ser usado (opcional)
 * @returns {Exporter} - Instância do Exporter
 */
export function createApkgExporter(deckName, templateName = 'Basic') {
  if (!SQL) {
    throw new Error('sql.js não foi inicializado');
  }
  return new Exporter(deckName, {
    template: Template(templateName),
    sql: SQL,
  });
}
