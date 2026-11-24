(function (raiz, fabrica) {
  const api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.Regras = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const OBJETOS = [
    { id: 'caneca', face: '☕', nome: 'Caneca' },
    { id: 'livro', face: '📚', nome: 'Livro' },
    { id: 'chave', face: '🔑', nome: 'Chave' },
    { id: 'bola', face: '⚽', nome: 'Bola' },
    { id: 'planta', face: '🪴', nome: 'Planta' },
    { id: 'relogio', face: '⏰', nome: 'Relógio' },
    { id: 'mochila', face: '🎒', nome: 'Mochila' },
    { id: 'oculos', face: '👓', nome: 'Óculos' },
    { id: 'guarda-chuva', face: '🌂', nome: 'Guarda-chuva' },
    { id: 'lampada', face: '💡', nome: 'Lâmpada' },
    { id: 'tesoura', face: '✂️', nome: 'Tesoura' },
    { id: 'presente', face: '🎁', nome: 'Presente' },
    { id: 'fone', face: '🎧', nome: 'Fone' },
    { id: 'chapeu', face: '👒', nome: 'Chapéu' }
  ];

  function novoNivel(nivel, sortear = (itens) => itens) {
    if (nivel !== 1 && nivel !== 2) throw new RangeError('O nível deve ser 1 ou 2.');
    const pares = OBJETOS.slice(0, nivel === 1 ? 6 : 8);
    const cartas = pares.flatMap((item) => [
      { id: item.id, face: item.face, nome: item.nome },
      { id: item.id, face: item.face, nome: item.nome }
    ]);
    return { nivel, cartas: sortear(cartas.slice()), viradas: [], encontradas: [], jogadas: 0, inicio: null, terminou: false };
  }

  function virar(estado, indice, agora) {
    if (estado.terminou || estado.viradas.length >= 2 || !Number.isInteger(indice) || indice < 0 || indice >= estado.cartas.length ||
        estado.viradas.includes(indice) || estado.encontradas.includes(indice)) return estado;
    const viradas = [...estado.viradas, indice];
    const inicio = estado.inicio === null ? agora : estado.inicio;
    if (viradas.length < 2) return { ...estado, inicio, viradas };
    const jogadas = estado.jogadas + 1;
    const combinou = estado.cartas[viradas[0]].id === estado.cartas[viradas[1]].id;
    const encontradas = combinou ? [...estado.encontradas, ...viradas] : estado.encontradas;
    const terminou = encontradas.length === estado.cartas.length;
    return { ...estado, inicio, jogadas, encontradas, viradas: combinou || terminou ? [] : viradas, terminou };
  }

  function esconderDiferentes(estado) {
    if (estado.viradas.length !== 2 || estado.cartas[estado.viradas[0]].id === estado.cartas[estado.viradas[1]].id) return estado;
    return { ...estado, viradas: [] };
  }

  function pontosNivel(estado, agora) {
    const segundos = estado.inicio === null ? 0 : Math.floor(Math.max(0, agora - estado.inicio) / 1000);
    return Math.max(0, 1000 - 15 * estado.jogadas - 2 * segundos);
  }

  return { OBJETOS, novoNivel, virar, esconderDiferentes, pontosNivel };
});
