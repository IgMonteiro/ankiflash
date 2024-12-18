// src/exporters/Exporter.js

import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid'; // Para geração de UUIDs

export default class Exporter {
  constructor(deckName, { template, sql }) {
    this.deckName = deckName;
    this.template = template;
    this.sql = sql;
    this.cards = [];
    this.models = [];
    this.noteId = 1;
    this.cardId = 1;
    this.deckId = 2; // Usar um ID numérico único para o deck (diferente do deck padrão que geralmente é 1)
  }

  addModel(model) {
    this.models.push(model);
  }

  addCard(front, back) {
    this.cards.push({ front, back });
  }

  async save() {
    try {
      const db = new this.sql.Database();

      this.createTables(db);
      this.insertData(db);

      const data = db.export();
      const buffer = new Uint8Array(data);

      const zip = new JSZip();
      zip.file('collection.anki2', buffer);

      const content = await zip.generateAsync({ type: 'arraybuffer' });
      return content;
    } catch (error) {
      console.error('Erro ao salvar o APKG:', error);
      throw error;
    }
  }

  createTables(db) {
    // Cria as tabelas necessárias no formato do Anki
    db.run(`
      CREATE TABLE col (
        id              integer primary key,
        crt             integer,
        mod             integer,
        scm             integer,
        ver             integer,
        dty             integer,
        usn             integer,
        ls              integer,
        conf            text,
        models          text,
        decks           text,
        dconf           text,
        tags            text
      );
    `);

    db.run(`
      CREATE TABLE notes (
        id              integer primary key,
        guid            text not null,
        mid             integer not null,
        mod             integer not null,
        usn             integer not null,
        tags            text not null,
        flds            text not null,
        sfld            integer not null,
        csum            integer not null,
        flags           integer not null,
        data            text not null
      );
    `);

    db.run(`
      CREATE TABLE cards (
        id              integer primary key,
        nid             integer not null,
        did             integer not null,
        ord             integer not null,
        mod             integer not null,
        usn             integer not null,
        type            integer not null,
        queue           integer not null,
        due             integer not null,
        ivl             integer not null,
        factor          integer not null,
        reps            integer not null,
        lapses          integer not null,
        left            integer not null,
        odue            integer not null,
        odid            integer not null,
        flags           integer not null,
        data            text not null
      );
    `);
  }

  insertData(db) {
    const now = Math.floor(Date.now() / 1000);

    // Definir um conf padrão para evitar erros de Anki
    const confJson = JSON.stringify({
      currentSchema: 40,
      nextPos: 1,
      lastPos: 0,
      revCount: 0,
      newCount: 0,
      timeToday: 0,
      lrnToday: 0,
      revToday: 0,
      timeLimit: 0,
      lastDay: 0,
      nextDay: 0,
      lastUpdate: 0,
      nextUpdate: 0,
      lastStudy: 0,
      revBlocked: false,
      newBlocked: false,
      currentDeckId: this.deckId, // Atualizado para deckId numérico
      currentModelId: 1, // Adicionado campo currentModelId
      mod: now, // Adicionado campo mod
    });

    // Definir um dconf padrão para o deck com os campos 'id', 'mod', 'new', 'rev', 'lapse' adicionados
    const dconfJson = JSON.stringify({
      [this.deckId]: {
        // deckId como chave
        id: this.deckId, // Adicionado campo 'id'
        mod: now, // Adicionado campo 'mod'
        new: {
          // Adicionado campo 'new'
          perDay: 20, // Número de novos cartões por dia
          fuzz: 0.05, // Fator de aleatoriedade
          separate: false, // Separar novos e revisão
          order: 1, // Ordem de apresentação dos novos cartões
          bury: false, // Enterrar novos cartões após revisão
        },
        rev: {
          // Adicionado campo 'rev'
          perDay: 100, // Número de cartões de revisão por dia
          fuzz: 0.05, // Fator de aleatoriedade
          separate: false, // Separar revisões
          order: 1, // Ordem de apresentação das revisões
          bury: false, // Enterrar revisões após apresentação
        },
        lapse: {
          // Adicionado campo 'lapse'
          leechFails: 8, // Número de falhas para marcar um cartão como leech
          leechAction: 1, // Ação a ser tomada quando um cartão se torna leech (1: suspender)
          minInt: 1, // Intervalo mínimo após um lapso
          mult: 0, // Multiplicador para o intervalo após um lapso (0: redefine para minInt)
          delays: [10, 1440, 86400], // Delays para lapsos
        },
      },
    });

    // Definir os decks
    const decksJson = JSON.stringify(this.getDecks());

    // Definir os modelos
    const modelsJson = JSON.stringify(this.getModels());

    console.log('Models JSON:', modelsJson);
    console.log('Decks JSON:', decksJson);
    console.log('Conf JSON:', confJson);
    console.log('Dconf JSON:', dconfJson);

    const colData = {
      id: 1,
      crt: now,
      mod: now, // Adicionado campo 'mod' no colData
      scm: now,
      ver: 11,
      dty: 0,
      usn: 0,
      ls: 0,
      conf: confJson,
      models: modelsJson,
      decks: decksJson,
      dconf: dconfJson,
      tags: JSON.stringify({}),
    };

    console.log('colData:', colData);

    const colStmt = db.prepare(`
      INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    colStmt.run([
      colData.id,
      colData.crt,
      colData.mod,
      colData.scm,
      colData.ver,
      colData.dty,
      colData.usn,
      colData.ls,
      colData.conf,
      colData.models,
      colData.decks,
      colData.dconf,
      colData.tags,
    ]);

    const noteStmt = db.prepare(`
      INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const cardStmt = db.prepare(`
      INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.cards.forEach((card) => {
      const noteId = this.noteId++;
      const cardId = this.cardId++;
      const guid = this.generateGuid();

      noteStmt.run([
        noteId,
        guid,
        1, // mid
        now, // mod
        0, // usn
        '', // tags
        `${card.front}\u001F${card.back}`, // flds
        card.front, // sfld
        this.checksum(card.front), // csum
        0, // flags
        '', // data
      ]);

      cardStmt.run([
        cardId,
        noteId,
        this.deckId, // did:2
        0, // ord
        now, // mod
        0, // usn
        0, // type
        0, // queue
        0, // due
        0, // ivl
        0, // factor
        0, // reps
        0, // lapses
        0, // left
        0, // odue
        0, // odid
        0, // flags
        '', // data
      ]);
    });
  }

  getModels() {
    const now = Math.floor(Date.now() / 1000);
    return {
      1: {
        vers: [],
        name: 'Basic Model',
        tags: [],
        did: this.deckId, // Referenciar o deck corretamente
        usn: 0,
        req: [[0, 'all', [0, 1]]],
        flds: [
          {
            name: 'Front',
            ord: 0,
            sticky: false,
            rtl: false,
            font: 'Arial',
            size: 20,
            description: '',
            plainText: false,
            collapsed: false,
            excludeFromSearch: false,
            id: 2323801605438783780,
            tag: null,
            preventDeletion: false,
          },
          {
            name: 'Back',
            ord: 1,
            sticky: false,
            rtl: false,
            font: 'Arial',
            size: 20,
            description: '',
            plainText: false,
            collapsed: false,
            excludeFromSearch: false,
            id: -5665546453123341833,
            tag: null,
            preventDeletion: false,
          },
        ],
        sticky: false,
        sortf: 0,
        tmpls: [
          {
            name: 'Card 1',
            ord: 0,
            qfmt: '{{Front}}',
            afmt: '{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}',
          },
        ],
        mod: now,
        id: 1,
        latexPre: '',
        latexPost: '',
        type: 0,
        css: '.card { font-family: arial; font-size: 20px; text-align: center; color: black; background: white; }',
        rtl: false, // Adicionado campo 'rtl'
      },
      // Adicione mais modelos conforme necessário, garantindo que cada um inclua "rtl": false
    };
  }

  getDecks() {
    const now = Math.floor(Date.now() / 1000);
    return {
      [this.deckId]: {
        // deckId como chave
        id: this.deckId, // Campo 'id' obrigatório
        name: this.deckName, // Campo 'name' obrigatório
        mtime_secs: now, // Timestamp da última modificação
        usn: 0,
        common: JSON.stringify({
          new: 20,
          rev: 100,
          lapse: 8,
          bury: false,
          separateNewRev: false,
          newSortOrder: 0,
          buryRev: false, // Adicionado para completar configurações comuns
          separateRev: false, // Adicionado para completar configurações comuns
          newSortOrder: 0, // Repetido, pode remover duplicatas
          // Outros parâmetros comuns podem ser adicionados aqui
        }),
        kind: JSON.stringify({
          name: 'Basic',
          type: 0,
          // Outros parâmetros do tipo de deck podem ser adicionados aqui
        }),
      },
      // Adicione mais decks conforme necessário
    };
  }

  generateGuid() {
    return uuidv4();
  }

  checksum(str) {
    const utf8str = unescape(encodeURIComponent(str));
    let sum = 0;
    for (let i = 0; i < utf8str.length; i++) {
      sum = (sum * 31 + utf8str.charCodeAt(i)) % 4294967296;
    }
    return sum;
  }
}
