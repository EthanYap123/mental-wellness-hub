// =========================================================
// Animated breathing exercise (tools.html)
// A small state machine: each pattern is a list of phases, and a
// one-second timer counts down through them for the chosen rounds.
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const circle = document.getElementById("breathCircle");
  if (!circle) return;

  const phaseText = document.getElementById("breathPhase");
  const countText = document.getElementById("breathCount");
  const announcer = document.getElementById("breathAnnouncer");
  const roundText = document.getElementById("breathRound");
  const patternSelect = document.getElementById("breathPattern");
  const roundsSelect = document.getElementById("breathRounds");
  const patternInfo = document.getElementById("breathInfo");
  const startBtn = document.getElementById("breathStart");
  const resetBtn = document.getElementById("breathReset");
  const sessionsText = document.getElementById("breathSessions");

  const PATTERNS = {
    box: {
      info: "Box breathing: equal counts in, hold, out, hold. Used to steady nerves before stressful moments.",
      phases: [
        { name: "Breathe in", state: "in", seconds: 4 },
        { name: "Hold", state: "hold-in", seconds: 4 },
        { name: "Breathe out", state: "out", seconds: 4 },
        { name: "Hold", state: "hold-out", seconds: 4 }
      ]
    },
    relax: {
      info: "4-7-8 breathing: a long hold and slow exhale that many people find helps them wind down for sleep.",
      phases: [
        { name: "Breathe in", state: "in", seconds: 4 },
        { name: "Hold", state: "hold-in", seconds: 7 },
        { name: "Breathe out", state: "out", seconds: 8 }
      ]
    },
    calm: {
      info: "Calm breathing: a simple rhythm where the exhale is longer than the inhale. Good for beginners.",
      phases: [
        { name: "Breathe in", state: "in", seconds: 4 },
        { name: "Breathe out", state: "out", seconds: 6 }
      ]
    }
  };

  const SESSIONS_KEY = "mwh-breath-sessions";

  let timer = null;
  let running = false;
  let phaseIndex = 0;
  let secondsLeft = 0;
  let round = 1;

  const pattern = () => PATTERNS[patternSelect.value];
  const totalRounds = () => Number(roundsSelect.value);

  const setCircle = (state, seconds) => {
    circle.style.transitionDuration = `${seconds}s`;
    circle.className = `breath-circle is-${state}`;
  };

  const showPhase = () => {
    const phase = pattern().phases[phaseIndex];
    phaseText.textContent = phase.name;
    countText.textContent = secondsLeft;
    roundText.textContent = `Round ${round} of ${totalRounds()}`;
    // Screen readers hear each new phase once, not every second
    announcer.textContent = `${phase.name} for ${phase.seconds} seconds`;
    setCircle(phase.state, phase.seconds);
  };

  const renderSessions = () => {
    const total = MWH.store.get(SESSIONS_KEY, 0);
    sessionsText.textContent = total === 1 ? "1 session completed" : `${total} sessions completed`;
  };

  const finish = () => {
    stop();
    MWH.store.set(SESSIONS_KEY, MWH.store.get(SESSIONS_KEY, 0) + 1);
    renderSessions();
    phaseText.textContent = "Well done";
    countText.textContent = "✓";
    roundText.textContent = "Notice how you feel right now.";
    announcer.textContent = "Exercise complete. Well done.";
    setCircle("out", 2);
    startBtn.textContent = "Start again";
    phaseIndex = 0;
    round = 1;
    secondsLeft = 0;
  };

  const tick = () => {
    secondsLeft--;
    if (secondsLeft > 0) {
      countText.textContent = secondsLeft;
      return;
    }

    phaseIndex++;
    if (phaseIndex >= pattern().phases.length) {
      phaseIndex = 0;
      round++;
      if (round > totalRounds()) {
        finish();
        return;
      }
    }
    secondsLeft = pattern().phases[phaseIndex].seconds;
    showPhase();
  };

  const start = () => {
    if (secondsLeft === 0) {
      phaseIndex = 0;
      round = 1;
      secondsLeft = pattern().phases[0].seconds;
    }
    running = true;
    showPhase();
    timer = setInterval(tick, 1000);
    startBtn.textContent = "Pause";
    startBtn.setAttribute("aria-pressed", "true");
    patternSelect.disabled = true;
    roundsSelect.disabled = true;
  };

  function stop() {
    clearInterval(timer);
    timer = null;
    running = false;
    startBtn.setAttribute("aria-pressed", "false");
    patternSelect.disabled = false;
    roundsSelect.disabled = false;
  }

  const pause = () => {
    stop();
    startBtn.textContent = "Resume";
    phaseText.textContent = "Paused";
    announcer.textContent = "Paused";
    circle.style.transitionDuration = "0.4s";
  };

  const reset = () => {
    stop();
    phaseIndex = 0;
    round = 1;
    secondsLeft = 0;
    phaseText.textContent = "Ready";
    countText.textContent = "";
    roundText.textContent = `${totalRounds()} rounds · about ${Math.round(cycleSeconds() * totalRounds() / 60 * 10) / 10} min`;
    announcer.textContent = "";
    startBtn.textContent = "Start";
    setCircle("out", 0.6);
  };

  const cycleSeconds = () => pattern().phases.reduce((sum, p) => sum + p.seconds, 0);

  startBtn.addEventListener("click", () => (running ? pause() : start()));
  resetBtn.addEventListener("click", reset);

  patternSelect.addEventListener("change", () => {
    patternInfo.textContent = pattern().info;
    reset();
  });
  roundsSelect.addEventListener("change", reset);

  // Pause automatically if the user switches tabs (timers drift in background tabs)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && running) pause();
  });

  patternInfo.textContent = pattern().info;
  renderSessions();
  reset();
});
