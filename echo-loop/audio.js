(() => {
  let ctx, master, ambient, ambientGain;
  let started = false;
  let lastTimer = '01:30';
  let lastHealth = 100;

  function init() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return;
    }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);

    ambientGain = ctx.createGain();
    ambientGain.gain.value = 0.035;
    ambientGain.connect(master);
    ambient = ctx.createOscillator();
    ambient.type = 'sawtooth';
    ambient.frequency.value = 48;
    ambient.connect(ambientGain);
    ambient.start();
  }

  function tone(freq = 220, dur = 0.12, type = 'sine', vol = 0.15, endFreq = null) {
    if (!ctx || ctx.state !== 'running') return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (endFreq && endFreq > 0) o.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g);
    g.connect(master);
    o.start();
    o.stop(ctx.currentTime + dur);
  }

  function shot() {
    tone(130, 0.055, 'square', 0.25, 55);
    tone(850, 0.04, 'triangle', 0.08, 340);
  }

  function warp() {
    tone(105, 0.48, 'sine', 0.20, 620);
    setTimeout(() => tone(780, 0.32, 'sine', 0.10, 95), 95);
  }

  function damage() {
    tone(78, 0.11, 'sawtooth', 0.20, 42);
  }

  function reload() {
    tone(260, 0.045, 'square', 0.07, 180);
    setTimeout(() => tone(410, 0.06, 'square', 0.08, 240), 115);
  }

  function temporal() {
    tone(180, 0.30, 'sine', 0.12, 760);
  }

  document.querySelector('#playBtn')?.addEventListener('click', () => {
    init();
    started = true;
    tone(72, 0.7, 'sine', 0.10, 120);
  });

  document.querySelector('#resumeBtn')?.addEventListener('click', init);

  document.addEventListener('mousedown', (e) => {
    if (started && e.button === 0 && document.pointerLockElement) shot();
  });

  document.addEventListener('keydown', (e) => {
    if (!started || !document.pointerLockElement) return;
    if (e.code === 'KeyR') reload();
    if (e.code === 'KeyF') temporal();
  });

  const timer = document.querySelector('#timer');
  if (timer) {
    new MutationObserver(() => {
      const now = timer.textContent;
      if (started && lastTimer === '00:01' && now === '01:30') warp();
      lastTimer = now;
    }).observe(timer, { childList: true, characterData: true, subtree: true });
  }

  const health = document.querySelector('#health');
  if (health) {
    new MutationObserver(() => {
      const now = Number(health.textContent || 100);
      if (started && now < lastHealth) damage();
      lastHealth = now;
    }).observe(health, { childList: true, characterData: true, subtree: true });
  }
})();
