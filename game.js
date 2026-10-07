(() => {
  const canvas = document.querySelector('#arena');
  const ctx = canvas.getContext('2d');
  const cabinet = document.querySelector('.cabinet');
  const selectionScreen = document.querySelector('#selection-screen');
  const screen = document.querySelector('#screen-card');
  const screenTitle = document.querySelector('#screen-title');
  const screenCopy = document.querySelector('#screen-copy');
  const startButton = document.querySelector('#start-button');
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
  const message = document.querySelector('#round-message');
  const W = 540;
  const H = 960;
  const FLOOR = 720;
  const ROUND_SECONDS = 99;
  const ROUND_COUNT = 3;
  const keys = new Set();
  const activePointers = new Map();

  function loadImage(src) {
    const image = new Image();
    image.src = src;
    return image;
  }

  const assets = {
    kley: loadImage('./assets/kley.png'),
    samuka: loadImage('./assets/samuka.png'),
    smkstage: loadImage('./assets/smkstage.png'),
    tilesetsmk: loadImage('./assets/tilesetsmk.png'),
    kleystage: loadImage('./assets/kleystage.png'),
    kleytileset: loadImage('./assets/kleytileset.png')
  };

  const characters = {
    kley: { name: 'KLEY', idle: [0, 1, 2, 3, 4], punch: [1, 2, 3], kick: [1, 2, 3], defend: [0, 1, 2, 3] },
    samuka: { name: 'SAMUKA', idle: [0, 1, 2, 3, 4], punch: [1, 2, 3], kick: [1, 2, 3], defend: [0, 1, 2, 3] }
  };

  // Kley selects the Samuka street stage, and Samuka selects the Kley highway stage, as specified.
  const stages = {
    kley: { image: 'smkstage', tiles: 'tilesetsmk', cropX: 565, label: 'CENTRO HISTÓRICO · GAROA LEVE', weather: 'rain' },
    samuka: { image: 'kleystage', tiles: 'kleytileset', cropX: 745, label: 'TABOÃO DA SERRA · VENTO QUENTE', weather: 'wind' }
  };

  const player = makeFighter(145, 1, 'kley', 'player');
  const rival = makeFighter(395, -1, 'samuka', 'rival');
  const sparks = [];
  const weatherParticles = Array.from({ length: 78 }, (_, i) => ({
    x: (i * 71 + 19) % W,
    y: (i * 113 + 31) % H,
    speed: 25 + (i % 7) * 9,
    size: 1 + (i % 3) * .6,
    phase: i * 1.71
  }));

  let selectedCharacter = 'kley';
  let assetsReady = false;
  let running = false;
  let paused = false;
  let muted = false;
  let phase = 'select';
  let roundNumber = 1;
  let roundWins = { player: 0, rival: 0 };
  let finished = false;
  let remaining = ROUND_SECONDS;
  let lastFrame = 0;
  let elapsed = 0;
  let phaseUntil = 0;
  let messageUntil = 0;
  let hitFlash = 0;
  let shake = 0;
  let audioContext = null;

  function makeFighter(x, facing, character, side) {
    return { x, facing, character, side, hp: 100, moving: 0, attack: null, attackTime: 0, cooldown: 0, hurt: 0, bob: 0, aiWait: .45, defending: false, blockTime: 0 };
  }

  function waitForImage(image) {
    if (image.complete) return Promise.resolve(image.naturalWidth > 0);
    return new Promise((resolve) => {
      image.addEventListener('load', () => resolve(true), { once: true });
      image.addEventListener('error', () => resolve(false), { once: true });
    });
  }

  function setMessage(text, duration = 900) {
    message.textContent = text;
    messageUntil = elapsed + duration;
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function chooseCharacter(character) {
    if (!characters[character]) return;
    selectedCharacter = character;
    const opponent = character === 'kley' ? 'samuka' : 'kley';
    player.character = character;
    rival.character = opponent;
    player.x = 145;
    rival.x = 395;
    player.facing = 1;
    rival.facing = -1;

    document.querySelectorAll('[data-character]').forEach((card) => {
      const selected = card.dataset.character === character;
      card.classList.toggle('selected', selected);
      card.setAttribute('aria-pressed', String(selected));
    });
    playerNameEl.textContent = characters[character].name;
    rivalNameEl.textContent = characters[opponent].name;
    playerPortrait.style.backgroundImage = `url('./assets/${character}.png')`;
    rivalPortrait.style.backgroundImage = `url('./assets/${opponent}.png')`;
    stageInfo.textContent = `PALCO: ${stages[character].label}`;
    updateHud();
  }

  function updateHud() {
    playerHealthEl.style.width = `${Math.max(0, player.hp)}%`;
    rivalHealthEl.style.width = `${Math.max(0, rival.hp)}%`;
    clockEl.textContent = `${Math.ceil(remaining)}`;
    roundLabelEl.textContent = roundNumber === 3 ? 'FINAL' : `ROUND ${roundNumber}`;
  }

  function showSelection() {
    running = false;
    paused = false;
    phase = 'select';
    cabinet.classList.remove('playing');
    cabinet.classList.add('selecting');
    selectionScreen.classList.remove('hidden');
    screen.classList.add('hidden');
    message.textContent = '';
    chooseCharacter(selectedCharacter);
  }

  function startMatch() {
    if (!assetsReady) return;
    keys.clear();
    running = true;
    paused = false;
    roundWins = { player: 0, rival: 0 };
    roundNumber = 1;
    elapsed = 0;
    finished = false;
    cabinet.classList.remove('selecting');
    cabinet.classList.add('playing');
    selectionScreen.classList.add('hidden');
    screen.classList.add('hidden');
    beginRound(1);
    ensureAudio();
  }

  function beginRound(number) {
    roundNumber = number;
    remaining = ROUND_SECONDS;
    player.hp = 100; player.x = 145; player.attack = null; player.attackTime = 0; player.cooldown = 0; player.hurt = 0; player.defending = false; player.moving = 0;
    rival.hp = 100; rival.x = 395; rival.attack = null; rival.attackTime = 0; rival.cooldown = 0; rival.hurt = 0; rival.defending = false; rival.blockTime = 0; rival.aiWait = .55; rival.moving = 0;
    player.facing = 1; rival.facing = -1;
    phase = 'intro';
    phaseUntil = elapsed + 2350;
    updateHud();
    announceRound(number);
  }

  function finishRound(winner) {
    if (phase !== 'fight') return;
    if (winner === 'player' || winner === 'rival') roundWins[winner]++;
    phase = 'break';
    phaseUntil = elapsed + 2100;
    player.attack = null; rival.attack = null;
    player.moving = 0; rival.moving = 0;
    player.defending = false; rival.defending = false;
    const winnerName = winner === 'player' ? characters[player.character].name : winner === 'rival' ? characters[rival.character].name : 'EMPATE';
    setMessage(winner === 'draw' ? 'ROUND EMPATADO' : `${winnerName} VENCE O ROUND`, 1850);
    playSfx('round');
    if (winner !== 'draw') speak(`${winnerName} wins the round!`);
  }

  function showEnd(winner) {
    finished = true;
    running = false;
    phase = 'end';
    cabinet.classList.remove('playing', 'selecting');
    const winnerName = winner === 'draw' ? '' : winner === 'player' ? characters[player.character].name : characters[rival.character].name;
    screenTitle.innerHTML = winner === 'draw' ? 'EMPATE!' : `<span>${winnerName}</span><br />VENCEU!`;
    screenCopy.textContent = winner === 'draw' ? 'A luta terminou empatada.' : `${roundWins.player} a ${roundWins.rival} nos rounds. Quer outra luta?`;
    startButton.innerHTML = 'ESCOLHER LUTADOR <span>↗</span>';
    screen.classList.remove('hidden');
    speak(winner === 'draw' ? 'Draw game!' : `${winnerName} wins!`);
  }

  function finalWinner() {
    if (roundWins.player === roundWins.rival) return 'draw';
    return roundWins.player > roundWins.rival ? 'player' : 'rival';
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
      hit: [155, 58, .14, 'triangle', .2],
      block: [520, 230, .13, 'square', .13],
      swing: [260, 115, .11, 'sawtooth', .065],
      round: [420, 680, .34, 'square', .1]
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
    line.lang = 'en-US';
    line.rate = .78;
    line.pitch = .56;
    line.volume = .95;
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
    const config = {
      punch: { duration: .31, damage: 8, reach: 116, activeAt: .12, cooldown: .35 },
      kick: { duration: .45, damage: 12, reach: 145, activeAt: .18, cooldown: .5 }
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
    defender.x = clamp(defender.x + attacker.facing * (blocked ? 2 : 12), 65, 475);
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
    if (!running || paused || finished) return;

    if (phase === 'intro') {
      if (elapsed >= phaseUntil) { phase = 'fight'; setMessage('FIGHT!', 720); speak('Fight!'); }
      return;
    }
    if (phase === 'break') {
      if (elapsed >= phaseUntil) {
        if (roundNumber >= ROUND_COUNT) showEnd(finalWinner());
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

    if (player.attack) {
      player.attackTime -= dt;
      landHit(player, rival);
      if (player.attackTime <= 0) player.attack = null;
    }
    if (rival.attack && phase === 'fight') {
      rival.attackTime -= dt;
      landHit(rival, player);
      if (rival.attackTime <= 0) rival.attack = null;
    }

    const direction = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0);
    player.moving = 0;
    if (!player.attack && !player.defending && direction) { player.moving = direction; player.x += direction * 215 * dt; }
    player.x = clamp(player.x, 65, 475);
    player.facing = player.x < rival.x ? 1 : -1;
    rival.facing = rival.x > player.x ? -1 : 1;

    const gap = Math.abs(rival.x - player.x);
    rival.aiWait -= dt;
    if (!rival.attack && !rival.defending && gap < 155 && player.attack && Math.random() < dt * 2.5) {
      rival.blockTime = .48;
      rival.defending = true;
    }
    if (!rival.attack && !rival.defending && rival.cooldown <= 0 && rival.aiWait <= 0) {
      rival.moving = 0;
      if (gap > 137) {
        rival.moving = -Math.sign(rival.x - player.x);
        rival.x += rival.moving * 126 * dt;
        if (gap < 190 && Math.random() < dt * .9) attack(rival, Math.random() < .66 ? 'punch' : 'kick');
      } else {
        attack(rival, Math.random() < .62 ? 'punch' : 'kick');
        rival.aiWait = .42 + Math.random() * .42;
      }
    }
    rival.x = clamp(rival.x, 65, 475);
    if (remaining <= 0) finishRound(player.hp === rival.hp ? 'draw' : player.hp > rival.hp ? 'player' : 'rival');
    updateHud();
  }

  function drawFallbackStage() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#7f91b2'); sky.addColorStop(.56, '#ffb366'); sky.addColorStop(1, '#66504c');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(31,31,43,.55)';
    for (let i = 0; i < 14; i++) ctx.fillRect(i * 42, 390 + (i % 4) * 22, 37, 300);
    ctx.fillStyle = '#55453e'; ctx.fillRect(0, 645, W, 315);
  }

  function drawStage() {
    const stage = stages[selectedCharacter];
    const image = assets[stage.image];
    if (!image.complete || !image.naturalWidth) { drawFallbackStage(); return; }
    const sourceHeight = image.naturalHeight;
    const sourceWidth = sourceHeight * (W / H);
    const x = clamp(stage.cropX, 0, image.naturalWidth - sourceWidth);
    ctx.drawImage(image, x, 0, sourceWidth, sourceHeight, 0, 0, W, H);
    // A warm vignette keeps the sprites legible while preserving each supplied stage image.
    const shade = ctx.createLinearGradient(0, 0, 0, H);
    shade.addColorStop(0, 'rgba(16,18,30,.08)'); shade.addColorStop(.62, 'rgba(30,20,20,.03)'); shade.addColorStop(1, 'rgba(14,11,12,.25)');
    ctx.fillStyle = shade; ctx.fillRect(0, 0, W, H);
  }

  function drawTile(image, cols, rows, col, row, x, y, width, height, flip = false) {
    if (!image.complete || !image.naturalWidth) return;
    const cellW = image.naturalWidth / cols;
    const cellH = image.naturalHeight / rows;
    ctx.save();
    if (flip) { ctx.translate(x + width, 0); ctx.scale(-1, 1); x = 0; }
    ctx.drawImage(image, col * cellW, row * cellH, cellW, cellH, x, y, width, height);
    ctx.restore();
  }

  function drawStageLife() {
    const stage = stages[selectedCharacter];
    const tiles = assets[stage.tiles];
    if (!tiles.complete || !tiles.naturalWidth) return;
    if (selectedCharacter === 'kley') {
      drawTile(tiles, 6, 4, 1, 0, 16, 596, 74, 102);
      drawTile(tiles, 6, 4, 3, 3, 429, 656, 95, 55, true);
    } else {
      drawTile(tiles, 6, 4, 1, 0, 425, 580, 76, 112, true);
      const carW = Math.min(850, tiles.naturalWidth);
      const carH = Math.max(1, tiles.naturalHeight - 744);
      ctx.drawImage(tiles, 0, 744, carW, carH, 4, 625, 208, 70);
    }
  }

  function drawWeather() {
    const weather = stages[selectedCharacter].weather;
    ctx.save();
    if (weather === 'rain') {
      ctx.strokeStyle = 'rgba(224,239,255,.28)'; ctx.lineWidth = 1.4;
      weatherParticles.forEach((drop, i) => {
        const x = (drop.x + elapsed * .035 + i * 7) % W;
        const y = (drop.y + elapsed * .22 * (drop.speed / 45)) % H;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 7, y + 17); ctx.stroke();
      });
      ctx.fillStyle = 'rgba(109,146,189,.075)'; ctx.fillRect(0, 0, W, H);
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
    const config = characters[fighter.character];
    let row = 0;
    let frames = config.idle;
    if (fighter.defending) { row = 3; frames = config.defend; }
    else if (fighter.attack) {
      row = fighter.attack.kind === 'kick' ? 2 : 1;
      frames = config[fighter.attack.kind];
    } else if (fighter.hurt > 0) { row = 3; frames = config.defend; }
    const progress = fighter.attack ? clamp((fighter.attack.duration - fighter.attackTime) / fighter.attack.duration, 0, .99) : 0;
    const frameIndex = fighter.attack ? Math.min(frames.length - 1, Math.floor(progress * frames.length)) : Math.floor(elapsed / 210) % frames.length;
    return { row, col: frames[frameIndex] };
  }

  function drawFighter(fighter) {
    const sheet = assets[fighter.character];
    if (!sheet.complete || !sheet.naturalWidth) return;
    const frame = spriteFrame(fighter);
    const cellW = sheet.naturalWidth / 5;
    const cellH = sheet.naturalHeight / 4;
    const bob = fighter.moving ? Math.sin(fighter.bob) * 3 : Math.sin(fighter.bob) * 1.1;
    const drawW = fighter.character === 'samuka' ? 238 : 230;
    const drawH = 278;

    ctx.save();
    ctx.globalAlpha = .32; ctx.fillStyle = '#241a17'; ctx.beginPath(); ctx.ellipse(fighter.x, FLOOR - 2, 59, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
    ctx.translate(fighter.x, FLOOR + bob);
    if (fighter.facing < 0) ctx.scale(-1, 1);
    if (fighter.hurt > 0) ctx.globalAlpha = .68 + Math.sin(fighter.hurt * 50) * .3;
    ctx.drawImage(sheet, frame.col * cellW, frame.row * cellH, cellW, cellH, -drawW / 2, -drawH, drawW, drawH);
    ctx.restore();

    ctx.save();
    ctx.textAlign = 'center'; ctx.font = '900 10px "Courier New", monospace';
    ctx.fillStyle = fighter.character === 'kley' ? '#fff0d4' : '#ffd296';
    ctx.strokeStyle = '#251918'; ctx.lineWidth = 3; ctx.strokeText(characters[fighter.character].name, fighter.x, FLOOR - drawH - 8);
    ctx.fillText(characters[fighter.character].name, fighter.x, FLOOR - drawH - 8);
    ctx.restore();
  }

  function drawSparks() {
    sparks.forEach((spark) => {
      ctx.save(); ctx.globalAlpha = clamp(spark.life * 4, 0, 1); ctx.fillStyle = spark.color;
      ctx.translate(spark.x, spark.y); ctx.rotate(elapsed * .006); ctx.fillRect(-spark.size / 2, -spark.size / 2, spark.size, spark.size * 1.8); ctx.restore();
    });
    if (hitFlash > 0) { ctx.fillStyle = `rgba(255,246,216,${hitFlash * 1.3})`; ctx.fillRect(0, 0, W, H); }
  }

  function render() {
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
    drawStage();
    drawStageLife();
    drawWeather();
    if (phase !== 'select') {
      drawFighter(player);
      drawFighter(rival);
    }
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

  document.querySelectorAll('[data-control]').forEach((button) => {
    const control = button.dataset.control;
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      activePointers.set(event.pointerId, { control, button });
      button.classList.add('is-pressed');
      setControl(control, true);
    });
    const release = (event) => {
      const pointer = activePointers.get(event.pointerId);
      if (!pointer) return;
      activePointers.delete(event.pointerId);
      button.classList.remove('is-pressed');
      if (![...activePointers.values()].some((item) => item.control === control)) setControl(control, false);
    };
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
  });

  document.querySelectorAll('[data-character]').forEach((card) => {
    card.addEventListener('click', () => chooseCharacter(card.dataset.character));
  });
  readyButton.addEventListener('click', startMatch);
  startButton.addEventListener('click', showSelection);
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
  window.addEventListener('keyup', (event) => {
    const control = keyMap[event.code];
    if (control) { event.preventDefault(); setControl(control, false); }
  });
  window.addEventListener('blur', () => { keys.clear(); activePointers.clear(); player.defending = false; document.querySelectorAll('.is-pressed').forEach((el) => el.classList.remove('is-pressed')); });

  chooseCharacter(selectedCharacter);
  cabinet.classList.add('selecting');
  Promise.all(Object.values(assets).map(waitForImage)).then((results) => {
    assetsReady = results.every(Boolean);
    readyButton.disabled = !assetsReady;
    assetStatus.textContent = assetsReady ? 'ARTE PRONTA · TOQUE PARA COMEÇAR' : 'ERRO AO CARREGAR ARQUIVOS DE ARTE';
    chooseCharacter(selectedCharacter);
  });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
  requestAnimationFrame(frame);
})();
