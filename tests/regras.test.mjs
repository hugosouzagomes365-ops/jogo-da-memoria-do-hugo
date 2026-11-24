import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const Regras = require('../docs/jogo/regras.js');
const ordemOriginal = (itens) => itens;

test('nível 1 monta seis pares e aceita sorteio injetado', () => {
  const estado = Regras.novoNivel(1, ordemOriginal);
  assert.equal(estado.cartas.length, 12);
  assert.equal(estado.cartas[0].id, estado.cartas[1].id);
});

test('nível 2 monta oito pares', () => {
  assert.equal(Regras.novoNivel(2, ordemOriginal).cartas.length, 16);
});

test('rejeita nível inexistente', () => {
  assert.throws(() => Regras.novoNivel(3), RangeError);
});

test('conta uma jogada apenas depois de virar duas cartas', () => {
  let estado = Regras.novoNivel(1, ordemOriginal);
  estado = Regras.virar(estado, 0, 100);
  assert.equal(estado.jogadas, 0);
  estado = Regras.virar(estado, 1, 300);
  assert.equal(estado.jogadas, 1);
  assert.equal(estado.encontradas.length, 2);
  assert.deepEqual(estado.viradas, []);
});

test('par errado fica visível e pode ser escondido', () => {
  let estado = Regras.novoNivel(1, ordemOriginal);
  estado = Regras.virar(estado, 0, 0);
  estado = Regras.virar(estado, 2, 100);
  assert.equal(estado.jogadas, 1);
  assert.equal(estado.viradas.length, 2);
  estado = Regras.esconderDiferentes(estado);
  assert.deepEqual(estado.viradas, []);
});

test('não permite virar carta repetida ou durante par aberto', () => {
  let estado = Regras.novoNivel(1, ordemOriginal);
  const inicial = estado;
  estado = Regras.virar(estado, 0, 0);
  assert.equal(Regras.virar(estado, 0, 1), estado);
  estado = Regras.virar(estado, 2, 2);
  assert.equal(Regras.virar(estado, 4, 3), estado);
  assert.equal(inicial.jogadas, 0);
});

test('pontuação reduz por jogadas e segundos e nunca fica negativa', () => {
  let estado = Regras.novoNivel(1, ordemOriginal);
  estado = Regras.virar(estado, 0, 0);
  estado = Regras.virar(estado, 2, 0);
  assert.equal(Regras.pontosNivel(estado, 5000), 975);
  assert.equal(Regras.pontosNivel({ ...estado, jogadas: 100 }, 2000000), 0);
});

test('vitória ocorre quando todos os pares são encontrados', () => {
  let estado = Regras.novoNivel(1, ordemOriginal);
  for (let i = 0; i < 12; i += 2) {
    estado = Regras.virar(estado, i, i * 100);
    estado = Regras.virar(estado, i + 1, i * 100 + 1);
  }
  assert.equal(estado.terminou, true);
  assert.equal(estado.encontradas.length, 12);
  assert.equal(Regras.virar(estado, 0, 999), estado);
});
