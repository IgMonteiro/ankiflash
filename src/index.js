// src/index.js

'use strict';

// Importação dos módulos necessários
import { initializeSqlJs, createApkgExporter } from './exporters/apkgExporter'; // Importa de apkgExporter.js

// Inicializa o sql.js e exporta a função após a inicialização
export async function initExporter() {
  await initializeSqlJs();
  return { createApkgExporter };
}
