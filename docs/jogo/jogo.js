(async function () {
  'use strict';
  const config = window.JOGO_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  document.title = config.nome || 'Jogo da memória';
  $('titulo').textContent = config.nome || 'Jogo da memória';
  if (config.cor) {
    document.documentElement.style.setProperty('--cor', config.cor);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', config.cor);
  }
  PlacarUI.montar($('painel-placar'));
  const progresso = await Placar.iniciar();
  $('melhor').textContent = progresso.melhor;
  Placar.aoMudar((p) => { $('melhor').textContent = p.melhor; });

  let estado = null;
  let nivel = 1;
  let pontosAcumulados = 0;
  let temporizador = null;
  let finalizando = false;
  function mostrar(tela) {
    ['tela-inicio', 'tela-jogo', 'tela-fim'].forEach((id) => { $(id).hidden = id !== tela; });
  }
  function desenhar() {
    $('grade-cartas').replaceChildren();
    estado.cartas.forEach((carta, indice) => {
      const aberta = estado.viradas.includes(indice) || estado.encontradas.includes(indice);
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = `carta${aberta ? ' aberta' : ''}${estado.encontradas.includes(indice) ? ' encontrada' : ''}`;
      botao.textContent = aberta ? carta.face : '?';
      botao.setAttribute('aria-label', aberta ? carta.nome : `Carta ${indice + 1}, virada para baixo`);
      botao.disabled = aberta || estado.viradas.length === 2;
      botao.addEventListener('click', () => escolher(indice));
      $('grade-cartas').append(botao);
    });
    $('rotulo-nivel').textContent = `Nível ${nivel} · ${nivel === 1 ? 6 : 8} pares`;
    $('jogadas').textContent = estado.jogadas;
    $('pontos-nivel').textContent = Regras.pontosNivel(estado, performance.now());
  }
  function comecar() {
    nivel = 1;
    pontosAcumulados = 0;
    iniciarNivel();
  }
  function iniciarNivel() {
    estado = Regras.novoNivel(nivel, (cartas) => cartas.sort(() => Math.random() - 0.5));
    finalizando = false;
    mostrar('tela-jogo');
    desenhar();
  }
  function escolher(indice) {
    if (finalizando) return;
    estado = Regras.virar(estado, indice, performance.now());
    desenhar();
    if (estado.viradas.length === 2 && estado.cartas[estado.viradas[0]].id !== estado.cartas[estado.viradas[1]].id) {
      temporizador = setTimeout(() => { estado = Regras.esconderDiferentes(estado); desenhar(); }, 750);
    } else if (estado.terminou) {
      finalizando = true;
      const pontos = Regras.pontosNivel(estado, performance.now());
      pontosAcumulados += pontos;
      if (nivel === 1) {
        $('aviso-nivel').textContent = `Nível 1 concluído: ${pontos} pontos. Prepare-se para o nível 2!`;
        $('aviso-nivel').hidden = false;
        setTimeout(() => { $('aviso-nivel').hidden = true; nivel = 2; iniciarNivel(); }, 1100);
      } else terminar();
    }
  }
  async function terminar() {
    $('resultado').textContent = pontosAcumulados;
    $('situacao-salvamento').textContent = 'Salvando...';
    mostrar('tela-fim');
    try {
      await Placar.registrarPartida(pontosAcumulados, { nivel: 2 });
      $('situacao-salvamento').textContent = 'Pontuação salva neste aparelho.';
    } catch (erro) { $('situacao-salvamento').textContent = `Não deu para salvar: ${erro.message}`; }
  }
  $('botao-jogar').addEventListener('click', comecar);
  $('botao-de-novo').addEventListener('click', () => { clearTimeout(temporizador); comecar(); });
  mostrar('tela-inicio');
})();
