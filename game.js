(() => {
  const canvas = document.querySelector('#arena');
  const ctx = canvas.getContext('2d');
  const cabinet = document.querySelector('.cabinet');
  const mainScreen = document.querySelector('#main-screen');
  const selectionScreen = document.querySelector('#selection-screen');
  const tutorial = document.querySelector('#tutorial-card');
  const screen = document.querySelector('#screen-card');
  const screenTitle = document.querySelector('#screen-title');
  const screenCopy = document.querySelector('#screen-copy');
  const endEyebrow = document.querySelector('#end-eyebrow');
  const continueButton = document.querySelector('#continue-button');
  const readyButton = document.querySelector('#ready-button');
  const assetStatus = document.querySelector('#asset-status');
  const stageInfo = document.querySelector('#stage-info');
  const clockEl = document.querySelector('#clock');
  const roundLabelEl = document.querySelector('#round-label');
  const playerHealthEl = document.querySelector('#player-health');
  const rivalHealthEl = document.querySelector('#rival-health');
  const playerNameEl = document.querySelector('#player-name');
  const rivalNameEl = document.querySelector('#rival-name');
  const playerPortrait = document.querySelector('#player-portrait');
  const rivalPortrait = document.querySelector('#rival-portrait');
  const rosterGrid = document.querySelector('#character-options');
  const message = document.querySelector('#round-message');
  const W = 540;
  const H = 960;
  const ARENA_WIDTH = 1700;
  const NPC_WORLD_POSITIONS = [140, 420, 700, 980, 1260, 1540];
  const FLOOR = 720;
  const ROUND_SECONDS = 99;
  const ROUND_COUNT = 3;
  const ROSTER = window.UNIDOS_ROSTER?.characters || [];
  const selectable = ROSTER.filter((fighter) => fighter.selectable && !fighter.isBoss);
  const byId = new Map(ROSTER.map((fighter) => [fighter.id, fighter]));
  const labels = {
    augustao: 'AUGUSTÃO', boss: 'O CHEFÃO', calvo: 'CALVO', cheng: 'CHENG', cunha: 'CUNHA',
    danilo: 'DANILO', flavinha: 'FLAVINHA', kley: 'KLEY', leo: 'LEO', maicon: 'MAICON',
    moraes: 'MORAES', raphael: 'RAPHAEL', samuka: 'SAMUKA', vitao: 'VITÃO', wagnao: 'WAGNÃO'
  };
  const names = new Map(ROSTER.map((fighter) => [fighter.id, labels[fighter.id] || fighter.name.toUpperCase()]));
  const NPC_LAYOUTS = {
    augustao: { npc_character: { cols: 4, rows: 4, actorRows: [0, 1, 2], height: 108, groundY: 625 } },
    calvo: { npc_character: { cols: 4, rows: 3, actorRows: [0, 1] } },
    cheng: { npc_character: { cols: 3, rows: 6, actorRows: [0, 1, 2, 3, 4, 5] } },
    cunha: {
      cleanPlate: 'parallax2',
      parallax3: {
        cols: 5, rows: 4, frameMs: 520, height: 112, maxWidth: 96,
        actors: [
          { x: 110, row: 0, groundY: 710, height: 96 }, { x: 340, row: 1, groundY: 662, height: 110 },
          { x: 585, row: 2, groundY: 650, height: 108 }, { x: 820, row: 3, groundY: 660, height: 110 },
          { x: 1060, row: 0, groundY: 681, height: 112 }, { x: 1300, row: 1, groundY: 694, height: 106 },
          { x: 1535, row: 2, groundY: 682, height: 110 }, { x: 1680, row: 3, groundY: 700, height: 98 }
        ]
      }
    },
    danilo: { npc_character: { cols: 3, rows: 5, actorRows: [0, 1, 2, 3, 4] } },
    kley: { parallax3: { cols: 4, rows: 4, actorRows: [0, 1, 2, 3] } },
    leo: {
      cleanPlate: 'parallax2',
      parallax3: {
        cols: 8, rows: 4, frameCols: [2, 3, 4, 5], frameMs: 500, height: 108, maxWidth: 84,
        actors: [
          { x: 160, row: 0, groundY: 626 }, { x: 370, row: 1, groundY: 626 },
          { x: 580, row: 2, groundY: 626 }, { x: 790, row: 0, groundY: 626 },
          { x: 1000, row: 1, groundY: 626 }, { x: 1210, row: 2, groundY: 626 },
          { x: 1420, row: 0, groundY: 626 }, { x: 1630, row: 1, groundY: 626 }
        ]
      }
    },
    maicon: { npc_character: { cols: 3, rows: 6, actorRows: [0, 1, 2, 3, 4, 5] } },
    // Moraes' sheet is a mixed board of people and pit props, not a regular animation grid.
    moraes: {},
    raphael: { npc_character: { cols: 3, rows: 6, actorRows: [0, 1, 2, 3, 4, 5], height: 108, groundY: 625 } },
    samuka: {
      parallax3: {
        cols: 6, rows: 4, frameMs: 500, height: 108, maxWidth: 96,
        actors: [
          { x: 140, row: 0, groundY: 648 }, { x: 430, row: 1, groundY: 650 },
          { x: 720, row: 2, groundY: 646 }, { x: 1010, row: 0, groundY: 650 },
          { x: 1300, row: 1, groundY: 648 }, { x: 1590, row: 2, groundY: 650 },
          { x: 850, row: 3, groundY: 708, height: 52, maxWidth: 86 }
        ]
      }
    },
    vitao: {
      parallax3: {
        cols: 6, rows: 3, height: 44, maxWidth: 60, frameMs: 220,
        actors: [
          { x: 190, row: 0, col: 0, groundY: 478, height: 40 }, { x: 480, row: 1, col: 1, groundY: 365, height: 44 },
          { x: 780, row: 0, col: 2, groundY: 465, height: 40 }, { x: 1080, row: 1, col: 4, groundY: 350, height: 44 },
          { x: 1380, row: 0, col: 4, groundY: 482, height: 40 }, { x: 1640, row: 1, col: 5, groundY: 380, height: 44 }
        ]
      }
    },
    wagnao: { parallax3: { cols: 4, rows: 4, actorRows: [0, 1, 2, 3], frameCols: [0, 1, 2] } }
  };
  const keys = new Set();
  const activePointers = new Map();
  const imageCache = new Map();
  const atlasBoundsCache = new WeakMap();
  const sparks = [];
  const weatherParticles = Array.from({ length: 90 }, (_, i) => ({
    x: (i * 71 + 19) % W, y: (i * 113 + 31) % H, speed: 25 + (i % 7) * 9,
    size: 1 + (i % 3) * .6, phase: i * 1.71
  }));

  let selectedCharacter = byId.has('kley') ? 'kley' : selectable[0]?.id;
  let campaignRoute = [];
  let campaignIndex = 0;
  let currentStageId = selectedCharacter;
  let assetsReady = false;
  let running = false;
  let paused = false;
  let muted = false;
  let phase = 'home';
  let roundNumber = 1;
  let roundWins = { player: 0, rival: 0 };
  let finishOutcome = 'draw';
  let remaining = ROUND_SECONDS;
  let lastFrame = 0;
  let elapsed = 0;
  let cameraX = (ARENA_WIDTH - W) / 2;
  let phaseUntil = 0;
  let messageUntil = 0;
  let hitFlash = 0;
  let shake = 0;
  let audioContext = null;
  let loadToken = 0;
  let selectionToken = 0;

  function assetUrl(path) { return path ? `./assets/${path}` : ''; }
  function fighterName(id) { return names.get(id) || id.toUpperCase(); }
  function getFighter(id) { return byId.get(id); }
  function getStage(id) { return getFighter(id); }

  function imageFor(path) {
    if (!path) return null;
    const src = assetUrl(path);
    if (imageCache.has(src)) return imageCache.get(src);
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
    imageCache.set(src, image);
    return image;
  }

  function imageReady(image) {
    if (!image) return Promise.resolve(false);
    if (image.complete) return Promise.resolve(image.naturalWidth > 0);
    return new Promise((resolve) => {
      image.addEventListener('load', () => resolve(true), { once: true });
      image.addEventListener('error', () => resolve(false), { once: true });
    });
  }

  function assetPathsForFighter(fighter) {
    if (!fighter) return [];
    const assets = fighter.assets;
    return [assets.sprite, assets.portrait, assets.stage, ...assets.parallax, ...assets.npcs].filter(Boolean);
  }

  async function preloadFighters(...fighters) {
    const paths = [...new Set(fighters.flatMap(assetPathsForFighter))];
    const results = await Promise.all(paths.map((path) => imageReady(imageFor(path))));
    return results.every(Boolean);
  }

  function setPortrait(target, fighter) {
    target.replaceChildren();
    const image = imageFor(fighter?.assets.portrait);
    if (!image) return;
    const portrait = document.createElement('img');
    portrait.alt = fighterName(fighter.id);
    portrait.src = image.src;
    target.append(portrait);
  }

  function makeFighter(x, facing, character, side) {
    const isBoss = Boolean(getFighter(character)?.isBoss);
    const maxHp = isBoss ? 145 : 100;
    return { x, facing, character, side, maxHp, hp: maxHp, moving: 0, attack: null, attackTime: 0, cooldown: 0, hurt: 0, bob: 0, aiWait: .45, defending: false, blockTime: 0 };
  }

  const player = makeFighter(725, 1, selectedCharacter, 'player');
  const rival = makeFighter(975, -1, selectable.find((fighter) => fighter.id !== selectedCharacter)?.id || selectedCharacter, 'rival');

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function updateCamera(dt = 1, snap = false) {
    const target = clamp((player.x + rival.x) / 2 - W / 2, 0, ARENA_WIDTH - W);
    cameraX = snap ? target : cameraX + (target - cameraX) * Math.min(1, dt * 5);
  }

  function setMessage(text, duration = 900) {
    message.textContent = text;
    messageUntil = elapsed + duration;
  }

  function updateHud() {
    playerHealthEl.style.width = `${clamp(player.hp / player.maxHp * 100, 0, 100)}%`;
    rivalHealthEl.style.width = `${clamp(rival.hp / rival.maxHp * 100, 0, 100)}%`;
    clockEl.textContent = `${Math.ceil(remaining)}`;
    roundLabelEl.textContent = `LUTA ${campaignIndex + 1}/7`;
  }

  function stageCaption(id) {
    return id === 'boss' ? 'PALCO FINAL · ARENA DO CHEFÃO' : `PALCO DE ${fighterName(id)}`;
  }

  async function chooseCharacter(id) {
    const fighter = getFighter(id);
    if (!fighter) return;
    if (!fighter.selectable || fighter.isBoss) {
      document.querySelector('#select-subheading').textContent = 'O CHEFÃO SÓ ENTRA NO TORNEIO NA LUTA 7';
      return;
    }

    selectedCharacter = id;
    currentStageId = id;
    player.character = id;
    player.maxHp = 100;
    player.hp = 100;
    document.querySelectorAll('[data-character]').forEach((card) => {
      const selected = card.dataset.character === id;
      card.classList.toggle('selected', selected);
      card.setAttribute('aria-selected', String(selected));
    });
    document.querySelector('#select-subheading').textContent = `${selectable.length} LUTADORES · CHEFÃO RESERVADO PARA A LUTA 7`;
    document.querySelector('#selected-name').textContent = fighterName(id);
    document.querySelector('#selected-tag').textContent = 'INTEGRANTE DO GRUPO · PALCO PRÓPRIO';
    document.querySelector('#selected-bio').textContent = 'Cada confronto revela mais um capítulo do torneio.';
    document.querySelector('#selected-portrait').src = assetUrl(fighter.assets.portrait);
    document.querySelector('#selected-portrait').alt = `Retrato de ${fighterName(id)}`;
    stageInfo.textContent = stageCaption(id);
    setPortrait(playerPortrait, fighter);
    playerNameEl.textContent = fighterName(id);
    rivalNameEl.textContent = 'RIVAL';

    const token = ++selectionToken;
    readyButton.disabled = true;
    assetStatus.textContent = 'CARREGANDO RETRATO, LUTADOR E PALCO…';
    const ok = await preloadFighters(fighter);
    if (token !== selectionToken) return;
    assetsReady = ok;
    assetStatus.textContent = ok ? 'ARTE PRONTA · 6 RIVAIS E O CHEFÃO NO TORNEIO' : 'ALGUMAS ARTES NÃO CARREGARAM · A DEMO PODE CONTINUAR';
    readyButton.disabled = !fighter.assets.sprite;
  }

  function buildRoster() {
    rosterGrid.replaceChildren();
    const rosterForDisplay = [...selectable, ...ROSTER.filter((fighter) => fighter.isBoss)];
    document.querySelector('#roster-count').textContent = `${selectable.length} LUTADORES · 1 CHEFÃO`;
    rosterForDisplay.forEach((fighter) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `character-card${fighter.isBoss ? ' locked' : ''}`;
      card.dataset.character = fighter.id;
      card.setAttribute('role', 'option');
      card.setAttribute('aria-selected', String(fighter.id === selectedCharacter));
      card.setAttribute('aria-label', fighter.isBoss ? 'Chefão, disponível na luta sete' : `Escolher ${fighterName(fighter.id)}`);
      if (fighter.isBoss) card.setAttribute('aria-disabled', 'true');
      const portrait = document.createElement('img');
      portrait.alt = '';
      portrait.loading = 'lazy';
      portrait.decoding = 'async';
      portrait.src = assetUrl(fighter.assets.portrait);
      const name = document.createElement('strong');
      name.textContent = fighterName(fighter.id);
      card.append(portrait, name);
      rosterGrid.append(card);
    });
  }

  function showHome() {
    running = false;
    paused = false;
    phase = 'home';
    cabinet.classList.remove('playing', 'selecting');
    cabinet.classList.add('home');
    mainScreen.classList.remove('hidden');
    selectionScreen.classList.add('hidden');
    tutorial.classList.add('hidden');
    screen.classList.add('hidden');
    message.textContent = '';
    currentStageId = selectedCharacter;
  }

  function showSelection() {
    running = false;
    paused = false;
    phase = 'select';
    cabinet.classList.remove('home', 'playing');
    cabinet.classList.add('selecting');
    mainScreen.classList.add('hidden');
    selectionScreen.classList.remove('hidden');
    tutorial.classList.add('hidden');
    screen.classList.add('hidden');
    message.textContent = '';
    chooseCharacter(selectedCharacter);
  }

  function shuffledOpponents() {
    const choices = selectable.filter((fighter) => fighter.id !== selectedCharacter).map((fighter) => fighter.id);
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    while (choices.length < 6) choices.push(...selectable.filter((fighter) => fighter.id !== selectedCharacter).map((fighter) => fighter.id));
    return [...choices.slice(0, 6), 'boss'];
  }

  function startTournament() {
    if (!getFighter(selectedCharacter)) return;
    keys.clear();
    campaignRoute = shuffledOpponents();
    campaignIndex = 0;
    roundWins = { player: 0, rival: 0 };
    finishOutcome = 'draw';
    enterFight(0);
    ensureAudio();
  }

  async function enterFight(index) {
    const token = ++loadToken;
    keys.clear();
    campaignIndex = index;
    roundWins = { player: 0, rival: 0 };
    const opponent = getFighter(campaignRoute[index]);
    if (!opponent) return showHome();
    player.character = selectedCharacter;
    rival.character = opponent.id;
    player.maxHp = 100;
    rival.maxHp = opponent.isBoss ? 145 : 100;
    currentStageId = opponent.id;
    playerNameEl.textContent = fighterName(player.character);
    rivalNameEl.textContent = fighterName(rival.character);
    setPortrait(playerPortrait, getFighter(player.character));
    setPortrait(rivalPortrait, opponent);
    selectionScreen.classList.add('hidden');
    mainScreen.classList.add('hidden');
    screen.classList.add('hidden');
    cabinet.classList.remove('home', 'selecting');
    cabinet.classList.add('playing');
    running = false;
    paused = false;
    phase = 'loading';
    setMessage(opponent.isBoss ? 'O CHEFÃO SE APROXIMA' : 'PREPARE-SE', 50000);
    playerHealthEl.style.width = '100%';
    rivalHealthEl.style.width = '100%';
    roundLabelEl.textContent = `LUTA ${index + 1}/7`;

    const ok = await preloadFighters(getFighter(player.character), opponent);
    if (token !== loadToken) return;
    assetsReady = ok;
    elapsed = 0;
    beginRound(1);
  }

  function beginRound(number) {
    roundNumber = number;
    remaining = ROUND_SECONDS;
    player.hp = player.maxHp;
    player.x = 725; player.attack = null; player.attackTime = 0; player.cooldown = 0; player.hurt = 0; player.defending = false; player.moving = 0; player.blockTime = 0;
    rival.hp = rival.maxHp;
    rival.x = 975; rival.attack = null; rival.attackTime = 0; rival.cooldown = 0; rival.hurt = 0; rival.defending = false; rival.blockTime = 0; rival.aiWait = .65; rival.moving = 0;
    updateCamera(1, true);
    player.facing = 1; rival.facing = -1;
    phase = 'intro';
    running = true;
    phaseUntil = elapsed + 2300;
    updateHud();
    announceRound(number);
  }

  function finishRound(winner) {
    if (phase !== 'fight') return;
    if (winner === 'player' || winner === 'rival') roundWins[winner]++;
    phase = 'break';
    phaseUntil = elapsed + 1900;
    player.attack = null; rival.attack = null;
    player.moving = 0; rival.moving = 0;
    player.defending = false; rival.defending = false;
    const winnerName = winner === 'player' ? fighterName(player.character) : winner === 'rival' ? fighterName(rival.character) : 'EMPATE';
    setMessage(winner === 'draw' ? 'ROUND EMPATADO' : `${winnerName} VENCE O ROUND`, 1650);
    playSfx('round');
    if (winner !== 'draw') speak(`${winnerName} wins the round!`);
  }

  function finalWinner() {
    if (roundWins.player === roundWins.rival) return 'draw';
    return roundWins.player > roundWins.rival ? 'player' : 'rival';
  }

  function showEnd(winner) {
    finishOutcome = winner;
    running = false;
    paused = false;
    phase = 'end';
    cabinet.classList.remove('playing', 'selecting', 'home');
    const opponent = getFighter(rival.character);
    if (winner === 'player' && campaignIndex === 6) {
      endEyebrow.textContent = 'CAMPEÃO DO TORNEIO';
      screenTitle.textContent = 'VOCÊ VENCEU!';
      screenCopy.textContent = `${fighterName(player.character)} derrotou o chefão e conquistou o grupo.`;
      continueButton.innerHTML = 'MENU PRINCIPAL <span>↗</span>';
    } else if (winner === 'player') {
      endEyebrow.textContent = `LUTA ${campaignIndex + 1}/7 CONCLUÍDA`;
      screenTitle.innerHTML = `<span>${fighterName(opponent.id)}</span><br />DERROTADO!`;
      screenCopy.textContent = `${roundWins.player} rounds a ${roundWins.rival}. O próximo desafiante está esperando.`;
      continueButton.innerHTML = campaignIndex === 5 ? 'ENCARAR O CHEFÃO <span>↗</span>' : 'PRÓXIMO DESAFIO <span>↗</span>';
    } else {
      endEyebrow.textContent = 'FIM DE LINHA · TENTE DE NOVO';
      screenTitle.textContent = winner === 'draw' ? 'EMPATE!' : 'DERROTA!';
      screenCopy.textContent = winner === 'draw' ? 'A rivalidade continua. Recomece o torneio.' : `${fighterName(opponent.id)} levou a melhor. Recomece a campanha e tente chegar ao chefão.`;
      continueButton.innerHTML = 'RECOMEÇAR TORNEIO <span>↗</span>';
    }
    screen.classList.remove('hidden');
    speak(winner === 'player' ? 'You win!' : winner === 'draw' ? 'Draw game!' : 'You lose!');
  }

  function onContinue() {
    screen.classList.add('hidden');
    if (finishOutcome === 'player' && campaignIndex < 6) enterFight(campaignIndex + 1);
    else if (finishOutcome !== 'player') startTournament();
    else showHome();
  }

  function ensureAudio() {
    if (muted) return null;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioContext) audioContext = new AudioCtor();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    return audioContext;
  }

  function playSfx(kind) {
    const audio = ensureAudio();
    if (!audio) return;
    const now = audio.currentTime;
    const settings = {
      hit: [155, 58, .14, 'triangle', .2], block: [520, 230, .13, 'square', .13],
      swing: [260, 115, .11, 'sawtooth', .065], round: [420, 680, .34, 'square', .1]
    }[kind];
    if (!settings) return;
    const [start, end, duration, type, volume] = settings;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(start, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(35, end), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.start(now); oscillator.stop(now + duration);
  }

  function speak(text) {
    if (muted || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
    window.speechSynthesis.cancel();
    const line = new SpeechSynthesisUtterance(text);
    line.lang = 'en-US'; line.rate = .78; line.pitch = .56; line.volume = .95;
    window.speechSynthesis.speak(line);
  }

  function announceRound(number) {
    const line = number === 3 ? 'Final round!' : `Round ${number === 1 ? 'one' : 'two'}!`;
    setMessage(line.toUpperCase(), 1900);
    playSfx('round');
    speak(line);
  }

  function attack(fighter, kind) {
    if (!running || phase !== 'fight' || paused || fighter.hp <= 0 || fighter.cooldown > 0 || fighter.defending) return;
    const boss = Boolean(getFighter(fighter.character)?.isBoss);
    const config = {
      punch: { duration: .31, damage: boss ? 11 : 8, reach: 116, activeAt: .12, cooldown: boss ? .29 : .35 },
      kick: { duration: .45, damage: boss ? 16 : 12, reach: 145, activeAt: .18, cooldown: boss ? .41 : .5 }
    }[kind];
    if (!config) return;
    fighter.attack = { ...config, kind, hit: false };
    fighter.attackTime = config.duration;
    fighter.cooldown = config.cooldown;
    fighter.moving = 0;
    playSfx('swing');
  }

  function addHitSparks(x, y, blocked) {
    const palette = blocked ? ['#fff6cb', '#4db9ff', '#fff'] : ['#ffe47c', '#ff623b', '#fff4df'];
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16 + Math.random() * .18;
      const speed = 65 + Math.random() * 190;
      sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .22 + Math.random() * .2, size: 2 + Math.random() * 5, color: palette[i % palette.length] });
    }
  }

  function landHit(attacker, defender) {
    if (phase !== 'fight' || !attacker.attack || attacker.attack.hit) return;
    const move = attacker.attack;
    const age = move.duration - attacker.attackTime;
    if (age < move.activeAt || Math.abs(defender.x - attacker.x) > move.reach + 10) return;
    if (Math.sign(defender.x - attacker.x) !== attacker.facing) return;
    move.hit = true;
    const blocked = defender.defending;
    const damage = blocked ? Math.max(1, Math.ceil(move.damage * .17)) : move.damage;
    defender.hp = Math.max(0, defender.hp - damage);
    defender.hurt = .27;
    hitFlash = blocked ? .05 : .12;
    shake = blocked ? 1.5 : 5;
    defender.x = clamp(defender.x + attacker.facing * (blocked ? 2 : 12), 65, ARENA_WIDTH - 65);
    addHitSparks(defender.x, FLOOR - 145, blocked);
    playSfx(blocked ? 'block' : 'hit');
    updateHud();
    if (defender.hp <= 0) finishRound(attacker.side);
  }

  function update(dt) {
    elapsed += dt * 1000;
    if (messageUntil && elapsed > messageUntil) { message.textContent = ''; messageUntil = 0; }
    hitFlash = Math.max(0, hitFlash - dt);
    shake = Math.max(0, shake - dt * 30);
    sparks.forEach((spark) => { spark.life -= dt; spark.x += spark.vx * dt; spark.y += spark.vy * dt; spark.vy += 260 * dt; });
    for (let i = sparks.length - 1; i >= 0; i--) if (sparks[i].life <= 0) sparks.splice(i, 1);
    if (!running || paused || phase === 'loading' || phase === 'home' || phase === 'select' || phase === 'end') return;

    if (phase === 'intro') {
      if (elapsed >= phaseUntil) { phase = 'fight'; setMessage('FIGHT!', 720); speak('Fight!'); }
      return;
    }
    if (phase === 'break') {
      if (elapsed >= phaseUntil) {
        if (roundWins.player >= 2 || roundWins.rival >= 2 || roundNumber >= ROUND_COUNT) showEnd(finalWinner());
        else beginRound(roundNumber + 1);
      }
      return;
    }
    if (phase !== 'fight') return;

    remaining = Math.max(0, remaining - dt);
    player.cooldown = Math.max(0, player.cooldown - dt);
    rival.cooldown = Math.max(0, rival.cooldown - dt);
    player.hurt = Math.max(0, player.hurt - dt);
    rival.hurt = Math.max(0, rival.hurt - dt);
    player.defending = keys.has('defend');
    rival.blockTime = Math.max(0, rival.blockTime - dt);
    rival.defending = rival.blockTime > 0;
    player.bob += dt * (player.moving ? 12 : 4);
    rival.bob += dt * (rival.moving ? 11 : 4.5);

    if (player.attack) { player.attackTime -= dt; landHit(player, rival); if (player.attackTime <= 0) player.attack = null; }
    if (rival.attack && phase === 'fight') { rival.attackTime -= dt; landHit(rival, player); if (rival.attackTime <= 0) rival.attack = null; }

    const direction = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0);
    player.moving = 0;
    if (!player.attack && !player.defending && direction) { player.moving = direction; player.x += direction * 215 * dt; }
    player.x = clamp(player.x, 65, ARENA_WIDTH - 65);
    player.facing = player.x < rival.x ? 1 : -1;
    rival.facing = rival.x > player.x ? -1 : 1;

    const gap = Math.abs(rival.x - player.x);
    const boss = Boolean(getFighter(rival.character)?.isBoss);
    rival.aiWait -= dt;
    if (!rival.attack && !rival.defending && gap < 155 && player.attack && Math.random() < dt * (boss ? 3.8 : 2.5)) {
      rival.blockTime = boss ? .58 : .48;
      rival.defending = true;
    }
    if (!rival.attack && !rival.defending && rival.cooldown <= 0 && rival.aiWait <= 0) {
      rival.moving = 0;
      if (gap > 137) {
        rival.moving = -Math.sign(rival.x - player.x);
        rival.x += rival.moving * (boss ? 154 : 126) * dt;
        if (gap < 190 && Math.random() < dt * (boss ? 1.4 : .9)) attack(rival, Math.random() < .66 ? 'punch' : 'kick');
      } else {
        attack(rival, Math.random() < (boss ? .72 : .62) ? 'punch' : 'kick');
        rival.aiWait = (boss ? .3 : .42) + Math.random() * (boss ? .34 : .42);
      }
    }
    rival.x = clamp(rival.x, 65, ARENA_WIDTH - 65);
    updateCamera(dt);
    if (remaining <= 0) finishRound(player.hp === rival.hp ? 'draw' : player.hp > rival.hp ? 'player' : 'rival');
    updateHud();
  }

  function drawFallbackStage() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#7689ab'); sky.addColorStop(.48, '#ff9e56'); sky.addColorStop(1, '#493e3d');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(31,31,43,.58)';
    for (let i = 0; i < 14; i++) ctx.fillRect(i * 42, 390 + (i % 4) * 22, 37, 300);
    ctx.fillStyle = '#55453e'; ctx.fillRect(0, 645, W, 315);
  }

  function drawStage() {
    const fighter = getStage(currentStageId) || getStage(selectedCharacter);
    const base = imageFor(fighter?.assets.stage);
    if (!base?.complete || !base.naturalWidth) { drawFallbackStage(); return; }
    drawStageImage(base);
  }

  function shadeStage() {
    const shade = ctx.createLinearGradient(0, 0, 0, H);
    shade.addColorStop(0, 'rgba(16,18,30,.18)'); shade.addColorStop(.58, 'rgba(30,20,20,.02)'); shade.addColorStop(1, 'rgba(14,11,12,.22)');
    ctx.fillStyle = shade; ctx.fillRect(0, 0, W, H);
  }

  function drawStageImage(image) {
    // Keep every stage layer on the same scrolling crop as the panorama.
    const scale = Math.max(W / image.naturalWidth, H / image.naturalHeight);
    const sourceWidth = W / scale;
    const sourceHeight = H / scale;
    const maxX = Math.max(0, image.naturalWidth - sourceWidth);
    const maxY = Math.max(0, image.naturalHeight - sourceHeight);
    const cameraProgress = cameraX / (ARENA_WIDTH - W);
    const sourceX = clamp(maxX * cameraProgress, 0, maxX);
    const sourceY = maxY / 2;
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, W, H);
  }

  function atlasCellBounds(image, cols, rows) {
    const cached = atlasBoundsCache.get(image);
    if (cached?.cols === cols && cached?.rows === rows) return cached.bounds;
    const fullCells = Array.from({ length: cols * rows }, (_, index) => ({
      x: Math.round((index % cols) * image.naturalWidth / cols),
      y: Math.round(Math.floor(index / cols) * image.naturalHeight / rows),
      width: Math.round(((index % cols) + 1) * image.naturalWidth / cols) - Math.round((index % cols) * image.naturalWidth / cols),
      height: Math.round((Math.floor(index / cols) + 1) * image.naturalHeight / rows) - Math.round(Math.floor(index / cols) * image.naturalHeight / rows)
    }));
    try {
      const sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = image.naturalWidth;
      sheetCanvas.height = image.naturalHeight;
      const sheetCtx = sheetCanvas.getContext('2d', { willReadFrequently: true });
      sheetCtx.drawImage(image, 0, 0);
      const pixels = sheetCtx.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;
      const bounds = fullCells.map((cell) => {
        const step = 2;
        const sampleWidth = Math.ceil(cell.width / step);
        const sampleHeight = Math.ceil(cell.height / step);
        const sampleCount = sampleWidth * sampleHeight;
        const visited = new Uint8Array(sampleCount);
        const stack = new Uint32Array(sampleCount);
        let largest = null;
        for (let sample = 0; sample < sampleCount; sample++) {
          if (visited[sample]) continue;
          const sx = sample % sampleWidth;
          const sy = Math.floor(sample / sampleWidth);
          const px = cell.x + sx * step;
          const py = cell.y + sy * step;
          if (pixels[(py * image.naturalWidth + px) * 4 + 3] < 96) { visited[sample] = 1; continue; }
          let size = 0, minX = sx, maxX = sx, minY = sy, maxY = sy;
          let stackSize = 0;
          stack[stackSize++] = sample;
          visited[sample] = 1;
          while (stackSize) {
            const current = stack[--stackSize];
            const x = current % sampleWidth;
            const y = Math.floor(current / sampleWidth);
            size++;
            minX = Math.min(minX, x); maxX = Math.max(maxX, x);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            for (let ny = Math.max(0, y - 1); ny <= Math.min(sampleHeight - 1, y + 1); ny++) {
              for (let nx = Math.max(0, x - 1); nx <= Math.min(sampleWidth - 1, x + 1); nx++) {
                const neighbor = ny * sampleWidth + nx;
                if (visited[neighbor]) continue;
                const alphaX = cell.x + nx * step;
                const alphaY = cell.y + ny * step;
                if (pixels[(alphaY * image.naturalWidth + alphaX) * 4 + 3] < 96) { visited[neighbor] = 1; continue; }
                visited[neighbor] = 1;
                stack[stackSize++] = neighbor;
              }
            }
          }
          if (!largest || size > largest.size) largest = { size, minX, maxX, minY, maxY };
        }
        if (!largest || largest.size < 8) return { ...cell, width: 0, height: 0 };
        const pad = 6;
        const left = Math.max(cell.x, cell.x + largest.minX * step - pad);
        const top = Math.max(cell.y, cell.y + largest.minY * step - pad);
        const right = Math.min(cell.x + cell.width, cell.x + (largest.maxX + 1) * step + pad);
        const bottom = Math.min(cell.y + cell.height, cell.y + (largest.maxY + 1) * step + pad);
        return { x: left, y: top, width: right - left, height: bottom - top };
      });
      atlasBoundsCache.set(image, { cols, rows, bounds });
      return bounds;
    } catch {
      atlasBoundsCache.set(image, { cols, rows, bounds: fullCells });
      return fullCells;
    }
  }

  function drawCrowdSheet(descriptor, layout) {
    const image = imageFor(descriptor.src);
    if (!image?.complete || !image.naturalWidth) return;
    const { cols, rows, actorRows = [], frameCols, height = 106, groundY = H * .64, maxWidth = 94 } = layout;
    const bounds = atlasCellBounds(image, cols, rows);
    const actors = layout.actors || (layout.worldPositions || NPC_WORLD_POSITIONS).map((x, index) => ({ x, row: actorRows[index % actorRows.length] }));
    [...actors].sort((a, b) => (a.groundY ?? groundY) - (b.groundY ?? groundY)).forEach((actor, index) => {
      const row = actor.row ?? actorRows[index % actorRows.length];
      const sequence = actor.frameCols || frameCols || Array.from({ length: cols }, (_, col) => col);
      const frame = Math.floor(elapsed / (actor.frameMs || layout.frameMs || 500) + (actor.phase ?? index * 1.65));
      const col = actor.col ?? sequence[frame % sequence.length];
      const crop = bounds[row * cols + col];
      if (!crop || crop.width < 1 || crop.height < 1) return;
      const actorHeight = actor.height ?? height;
      const actorWidth = actor.maxWidth ?? maxWidth;
      const scale = Math.min(actorHeight / crop.height, actorWidth / crop.width);
      const drawW = crop.width * scale;
      const drawH = crop.height * scale;
      const walk = elapsed * .00115 + (actor.phase ?? index * 1.9 + rows * .7);
      const x = actor.x - cameraX + Math.sin(walk) * (actor.drift ?? 3);
      if (x < -drawW || x > W + drawW) return;
      const bob = Math.abs(Math.sin(walk * 1.7)) * (actor.bob ?? 1.2);
      ctx.save();
      ctx.globalAlpha = actor.alpha ?? .98;
      ctx.translate(x, (actor.groundY ?? groundY) - drawH + bob);
      if (actor.flip) ctx.scale(-1, 1);
      ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, -drawW / 2, 0, drawW, drawH);
      ctx.restore();
    });
  }

  function drawStageLife() {
    const fighter = getStage(currentStageId);
    if (!fighter) return;
    const layout = NPC_LAYOUTS[currentStageId] || {};
    let cleanPlateApplied = !layout.cleanPlate;
    if (layout.cleanPlate) {
      const cleanPlate = (fighter.assets.parallaxInfo || []).find((layer) => layer.name === layout.cleanPlate);
      const cleanImage = cleanPlate && imageFor(cleanPlate.src);
      const baseImage = imageFor(fighter.assets.stage);
      if (cleanImage?.complete && baseImage?.complete && cleanImage.naturalWidth === baseImage.naturalWidth && cleanImage.naturalHeight === baseImage.naturalHeight) {
        drawStageImage(cleanImage);
        cleanPlateApplied = true;
      }
    }
    // These stage images already contain a crowd. Don't stack a second copy if its clean layer failed to load.
    if (!cleanPlateApplied) return;
    const characterSheet = (fighter.assets.npcsInfo || []).find((sheet) => sheet.name === 'npc_character');
    if (characterSheet && layout.npc_character) drawCrowdSheet(characterSheet, layout.npc_character);
    const crowdAtlas = (fighter.assets.parallaxInfo || []).find((layer) => layer.name === 'parallax3');
    if (crowdAtlas && layout.parallax3) drawCrowdSheet(crowdAtlas, layout.parallax3);
  }

  function drawWeather() {
    const stormy = currentStageId === 'boss' || ['augustao', 'moraes', 'samuka'].includes(currentStageId);
    ctx.save();
    if (stormy) {
      ctx.strokeStyle = 'rgba(224,239,255,.25)'; ctx.lineWidth = 1.3;
      weatherParticles.forEach((drop, i) => {
        const x = (drop.x + elapsed * .035 + i * 7) % W;
        const y = (drop.y + elapsed * .22 * (drop.speed / 45)) % H;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 7, y + 17); ctx.stroke();
      });
      ctx.fillStyle = currentStageId === 'boss' ? 'rgba(40,24,44,.19)' : 'rgba(109,146,189,.06)';
      ctx.fillRect(0, 0, W, H);
    } else {
      weatherParticles.slice(0, 44).forEach((dust, i) => {
        const x = (dust.x + elapsed * .018 * (dust.speed / 45) + Math.sin(elapsed * .001 + dust.phase) * 12) % W;
        const y = (dust.y + Math.cos(elapsed * .0012 + dust.phase) * 22 + H) % H;
        ctx.globalAlpha = .13 + (i % 4) * .035;
        ctx.fillStyle = i % 3 ? '#ffe0a3' : '#fff4d7';
        ctx.beginPath(); ctx.ellipse(x, y, dust.size * 1.4, dust.size * .65, .4, 0, Math.PI * 2); ctx.fill();
      });
    }
    ctx.restore();
  }

  function spriteFrame(fighter) {
    let frames = [0, 1, 2, 3, 4];
    let row = 0;
    if (fighter.defending) { row = 3; frames = [0, 1, 2, 3]; }
    else if (fighter.attack) { row = fighter.attack.kind === 'kick' ? 2 : 1; frames = [1, 2, 3]; }
    else if (fighter.hurt > 0) { row = 3; frames = [0, 1, 2, 3]; }
    const progress = fighter.attack ? clamp((fighter.attack.duration - fighter.attackTime) / fighter.attack.duration, 0, .99) : 0;
    const frameIndex = fighter.attack ? Math.min(frames.length - 1, Math.floor(progress * frames.length)) : Math.floor(elapsed / 210) % frames.length;
    return { row, col: frames[frameIndex] };
  }

  function drawFighter(fighter) {
    const sheet = imageFor(getFighter(fighter.character)?.assets.sprite);
    if (!sheet?.complete || !sheet.naturalWidth) return;
    const frame = spriteFrame(fighter);
    const crop = atlasCellBounds(sheet, 5, 4)[frame.row * 5 + frame.col];
    if (!crop || crop.width < 1 || crop.height < 1) return;
    const bob = fighter.moving ? Math.sin(fighter.bob) * 3 : Math.sin(fighter.bob) * 1.1;
    const isBoss = Boolean(getFighter(fighter.character)?.isBoss);
    const drawH = isBoss ? 310 : 278;
    const drawW = isBoss ? 300 : 270;
    const scale = Math.min(drawH / crop.height, drawW / crop.width);
    const spriteW = crop.width * scale;
    const spriteH = crop.height * scale;
    const screenX = fighter.x - cameraX;
    ctx.save(); ctx.globalAlpha = .32; ctx.fillStyle = '#241a17'; ctx.beginPath(); ctx.ellipse(screenX, FLOOR - 2, 59, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
    ctx.translate(screenX, FLOOR + bob);
    if (fighter.facing < 0) ctx.scale(-1, 1);
    if (fighter.hurt > 0) ctx.globalAlpha = .82 + Math.sin(fighter.hurt * 50) * .1;
    ctx.drawImage(sheet, crop.x, crop.y, crop.width, crop.height, -spriteW / 2, -spriteH, spriteW, spriteH);
    ctx.restore();

  }

  function drawSparks() {
    sparks.forEach((spark) => {
      ctx.save(); ctx.globalAlpha = clamp(spark.life * 4, 0, 1); ctx.fillStyle = spark.color;
      ctx.translate(spark.x - cameraX, spark.y); ctx.rotate(elapsed * .006); ctx.fillRect(-spark.size / 2, -spark.size / 2, spark.size, spark.size * 1.8); ctx.restore();
    });
    if (hitFlash > 0) { ctx.fillStyle = `rgba(255,246,216,${hitFlash * 1.3})`; ctx.fillRect(0, 0, W, H); }
  }

  function render() {
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
    drawStage();
    drawStageLife();
    shadeStage();
    drawWeather();
    if (phase === 'fight' || phase === 'intro' || phase === 'break' || phase === 'loading') { drawFighter(player); drawFighter(rival); }
    drawSparks();
    ctx.restore();
  }

  function frame(now) {
    const dt = Math.min(.04, (now - (lastFrame || now)) / 1000);
    lastFrame = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  function setControl(control, isDown) {
    if (isDown) {
      keys.add(control);
      if (control === 'defend') { player.defending = true; player.moving = 0; }
      else if (control === 'punch' || control === 'kick') attack(player, control);
    } else {
      keys.delete(control);
      if (control === 'defend') player.defending = false;
    }
  }

  document.querySelectorAll('.action-button[data-control]').forEach((button) => {
    const control = button.dataset.control;
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault(); button.setPointerCapture(event.pointerId);
      activePointers.set(event.pointerId, { control, button }); button.classList.add('is-pressed'); setControl(control, true);
    });
    const release = (event) => {
      const pointer = activePointers.get(event.pointerId);
      if (!pointer) return;
      activePointers.delete(event.pointerId); button.classList.remove('is-pressed');
      if (![...activePointers.values()].some((item) => item.control === control)) setControl(control, false);
    };
    button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
  });

  const joystick = document.querySelector('#joystick');
  const joystickKnob = document.querySelector('#joystick-knob');
  let joystickPointer = null;
  let analogDirection = null;
  function setAnalogDirection(direction) {
    if (direction === analogDirection) return;
    if (analogDirection) setControl(analogDirection, false);
    analogDirection = direction;
    if (analogDirection) setControl(analogDirection, true);
  }
  function moveJoystick(event) {
    if (joystickPointer !== event.pointerId) return;
    const rect = joystick.getBoundingClientRect();
    const maxTravel = rect.width * .28;
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const length = Math.hypot(dx, dy);
    const scale = length > maxTravel ? maxTravel / length : 1;
    const x = dx * scale;
    const y = dy * scale;
    joystickKnob.style.setProperty('--stick-x', `${x}px`);
    joystickKnob.style.setProperty('--stick-y', `${y}px`);
    const deadZone = rect.width * .13;
    setAnalogDirection(Math.abs(dx) < deadZone ? null : dx < 0 ? 'left' : 'right');
  }
  function releaseJoystick(event) {
    if (joystickPointer !== event.pointerId) return;
    joystickPointer = null;
    joystick.classList.remove('is-pressed');
    joystickKnob.style.setProperty('--stick-x', '0px');
    joystickKnob.style.setProperty('--stick-y', '0px');
    setAnalogDirection(null);
  }
  joystick.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    if (joystickPointer !== null) return;
    joystickPointer = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    joystick.classList.add('is-pressed');
    moveJoystick(event);
  });
  joystick.addEventListener('pointermove', moveJoystick);
  joystick.addEventListener('pointerup', releaseJoystick);
  joystick.addEventListener('pointercancel', releaseJoystick);
  joystick.addEventListener('lostpointercapture', releaseJoystick);

  rosterGrid.addEventListener('click', (event) => {
    const card = event.target.closest('[data-character]');
    if (card) chooseCharacter(card.dataset.character);
  });
  document.querySelector('#play-button').addEventListener('click', showSelection);
  document.querySelector('#back-home').addEventListener('click', showHome);
  readyButton.addEventListener('click', startTournament);
  continueButton.addEventListener('click', onContinue);
  document.querySelector('#end-menu-button').addEventListener('click', showHome);
  document.querySelector('#howto-button').addEventListener('click', () => tutorial.classList.remove('hidden'));
  document.querySelector('#tutorial-close').addEventListener('click', () => tutorial.classList.add('hidden'));
  document.querySelector('#tutorial-play').addEventListener('click', showSelection);

  document.querySelector('#pause-button').addEventListener('click', () => {
    if (!running || phase === 'select' || phase === 'end') return;
    paused = !paused;
    if (paused) setMessage('PAUSADO', 50000);
    else { message.textContent = ''; messageUntil = 0; lastFrame = performance.now(); }
  });
  document.querySelector('#sound-button').addEventListener('click', (event) => {
    muted = !muted;
    event.currentTarget.textContent = muted ? '♪̸' : '♫';
    event.currentTarget.setAttribute('aria-label', muted ? 'Ativar som' : 'Desativar som');
    if (muted && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    if (!muted) ensureAudio();
  });

  const keyMap = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Digit1: 'punch', KeyJ: 'punch', Digit2: 'kick', KeyK: 'kick', Digit3: 'defend', KeyL: 'defend' };
  window.addEventListener('keydown', (event) => {
    const control = keyMap[event.code];
    if (control) { event.preventDefault(); if (!keys.has(control)) setControl(control, true); }
    if (event.code === 'Escape' || event.code === 'KeyP') {
      if (running && phase !== 'select' && phase !== 'end') {
        paused = !paused;
        if (paused) setMessage('PAUSADO', 50000);
        else { message.textContent = ''; messageUntil = 0; lastFrame = performance.now(); }
      }
    }
  });
  window.addEventListener('keyup', (event) => { const control = keyMap[event.code]; if (control) { event.preventDefault(); setControl(control, false); } });
  window.addEventListener('blur', () => {
    keys.clear(); activePointers.clear(); analogDirection = null; joystickPointer = null;
    joystick.classList.remove('is-pressed'); joystickKnob.style.setProperty('--stick-x', '0px'); joystickKnob.style.setProperty('--stick-y', '0px');
    player.defending = false; document.querySelectorAll('.is-pressed').forEach((el) => el.classList.remove('is-pressed'));
  });

  buildRoster();
  setPortrait(playerPortrait, getFighter(selectedCharacter));
  document.querySelector('#roster-count').textContent = `${selectable.length} LUTADORES · 1 CHEFÃO`;
  showHome();
  if (ROSTER.length) {
    const homeStage = getFighter(selectedCharacter);
    if (homeStage) preloadFighters(homeStage).catch(() => {});
  } else {
    document.querySelector('#roster-count').textContent = 'ARQUIVO DE PERSONAGENS NÃO ENCONTRADO';
    document.querySelector('#play-button').disabled = true;
  }

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
  requestAnimationFrame(frame);
})();
