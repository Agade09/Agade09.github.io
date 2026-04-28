(function () {
  const modeSelect = document.getElementById('mode');
  const boxControls = document.getElementById('box_controls');
  const resonanceControls = document.getElementById('resonance_controls');
  const boxSecondsInput = document.getElementById('box_seconds');
  const resonanceGender = document.getElementById('resonance_gender');
  const resonanceHeight = document.getElementById('resonance_height');
  const resonanceInfo = document.getElementById('resonance_info');
  const startBtn = document.getElementById('start_btn');
  const phaseLabel = document.getElementById('phase_label');
  const countdown = document.getElementById('countdown');
  const totalTimeEl = document.getElementById('total_time');

  let audioCtx = null;
  let running = false;
  let phaseTimer = null;
  let countdownTimer = null;
  let totalTimer = null;
  let startTimeMs = 0;

  function formatElapsed(ms) {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  }

  function updateTotalTime() {
    totalTimeEl.textContent = `Total: ${formatElapsed(Date.now() - startTimeMs)}`;
  }

  // Hasuo et al. 2024 — estimated resonance frequency (breaths per minute)
  // Men:   RF = 17.90 - 0.07 * height(cm)
  // Women: RF = 15.88 - 0.06 * height(cm)
  function resonanceSecondsPerSide() {
    const h = parseFloat(resonanceHeight.value);
    if (!isFinite(h) || h <= 0) return 5;
    const bpm = resonanceGender.value === 'female'
      ? 15.88 - 0.06 * h
      : 17.90 - 0.07 * h;
    if (bpm <= 0) return 5;
    return (60 / bpm) / 2;
  }

  function updateResonanceInfo() {
    const s = resonanceSecondsPerSide();
    const bpm = 60 / (s * 2);
    resonanceInfo.textContent =
      `\u2248 ${bpm.toFixed(2)} breaths/min \u2014 ${s.toFixed(2)} s inhale / ${s.toFixed(2)} s exhale`;
  }

  function syncControls() {
    const isBox = modeSelect.value === 'box';
    boxControls.style.display = isBox ? 'block' : 'none';
    resonanceControls.style.display = isBox ? 'none' : 'block';
    if (!isBox) updateResonanceInfo();
  }

  modeSelect.addEventListener('change', () => {
    syncControls();
    if (running) stop();
  });
  resonanceGender.addEventListener('change', () => {
    updateResonanceInfo();
    if (running) stop();
  });
  resonanceHeight.addEventListener('input', () => {
    updateResonanceInfo();
    if (running) stop();
  });

  startBtn.addEventListener('click', () => {
    if (running) stop(); else start();
  });

  function beep(freq, durationMs) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.02);
  }

  function getPhases() {
    if (modeSelect.value === 'resonance') {
      const s = resonanceSecondsPerSide();
      return [
        { name: 'Inhale', seconds: s, freq: 880 },
        { name: 'Exhale', seconds: s, freq: 440 },
      ];
    }
    const s = Math.max(1, parseInt(boxSecondsInput.value, 10) || 10);
    return [
      { name: 'Inhale', seconds: s, freq: 880 },
      { name: 'Hold',   seconds: s, freq: 660 },
      { name: 'Exhale', seconds: s, freq: 440 },
      { name: 'Hold',   seconds: s, freq: 660 },
    ];
  }

  function start() {
    const phases = getPhases();
    running = true;
    startBtn.textContent = 'Stop';
    startTimeMs = Date.now();
    updateTotalTime();
    clearInterval(totalTimer);
    totalTimer = setInterval(updateTotalTime, 1000);
    let i = 0;

    function runPhase() {
      const p = phases[i % phases.length];
      beep(p.freq, 150);
      phaseLabel.textContent = p.name;
      let remaining = Math.max(1, Math.round(p.seconds));
      countdown.textContent = remaining;
      clearInterval(countdownTimer);
      countdownTimer = setInterval(() => {
        remaining -= 1;
        countdown.textContent = remaining > 0 ? remaining : '';
      }, 1000);
      phaseTimer = setTimeout(() => {
        i += 1;
        runPhase();
      }, p.seconds * 1000);
    }
    runPhase();
  }

  function stop() {
    running = false;
    startBtn.textContent = 'Start';
    clearTimeout(phaseTimer);
    clearInterval(countdownTimer);
    clearInterval(totalTimer);
    phaseLabel.textContent = 'Press Start';
    countdown.textContent = '';
  }

  syncControls();
})();
