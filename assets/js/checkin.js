// =========================================================
// Wellness check-in form (form.html)
// Validates the form, shows a personalised summary with suggestions,
// and keeps the last few check-ins on this device.
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("wellnessForm");
  if (!form) return;

  const HISTORY_KEY = "mwh-checkins";
  const MOOD_KEY = "mwh-moods";

  const nameInput = document.getElementById("name");
  const moodGroup = document.getElementById("moodGroup");
  const mindfulnessGroup = document.getElementById("mindfulnessGroup");
  const stressSlider = document.getElementById("stressLevel");
  const stressDisplay = document.getElementById("stressLevelValue");
  const sleepInput = document.getElementById("sleepHours");
  const favoritePractice = document.getElementById("favoritePractice");
  const comments = document.getElementById("comments");
  const commentsCounter = document.getElementById("commentsCounter");
  const logMood = document.getElementById("logMood");
  const formMessage = document.getElementById("formMessage");
  const results = document.getElementById("submissionResults");
  const historyList = document.getElementById("checkinHistory");
  const clearHistoryBtn = document.getElementById("clearCheckins");

  // === Stress slider: live label + colour ===
  const updateStress = () => {
    const value = Number(stressSlider.value);
    let label = "Low";
    stressDisplay.className = "fw-bold";
    if (value >= 7) {
      label = "High";
      stressDisplay.classList.add("text-danger");
    } else if (value >= 4) {
      label = "Moderate";
      stressDisplay.classList.add("text-warning-emphasis");
    } else {
      stressDisplay.classList.add("text-success");
    }
    stressDisplay.textContent = `${value} / 10 · ${label}`;
    stressSlider.setAttribute("aria-valuetext", `${value} out of 10, ${label}`);
  };

  stressSlider.addEventListener("input", updateStress);

  comments.addEventListener("input", () => {
    commentsCounter.textContent = `${comments.value.length} / 250 characters`;
  });

  // === Validation helpers ===
  const setFieldError = (input, show) => {
    input.classList.toggle("is-invalid", show);
    input.setAttribute("aria-invalid", String(show));
    return !show;
  };

  const setGroupError = (group, show) => {
    group.classList.toggle("is-invalid-group", show);
    group.querySelector(".invalid-feedback").classList.toggle("d-block", show);
    return !show;
  };

  const checkedValue = (name) => {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : "";
  };

  // Clear errors as soon as the user fixes a field
  nameInput.addEventListener("input", () => setFieldError(nameInput, false));
  favoritePractice.addEventListener("change", () => setFieldError(favoritePractice, false));
  sleepInput.addEventListener("input", () => setFieldError(sleepInput, false));
  moodGroup.addEventListener("change", () => setGroupError(moodGroup, false));
  mindfulnessGroup.addEventListener("change", () => setGroupError(mindfulnessGroup, false));

  // === Suggestions based on the answers ===
  const buildSuggestions = (data) => {
    const tips = [];
    if (data.stress >= 7 || data.mood <= 2) {
      tips.push('Things sound heavy right now. Talking helps — <a href="helplines.html">National mindline 1771</a> is free, anonymous and open 24 hours.');
      tips.push('Try a slow <a href="tools.html#breathing">4-7-8 breathing round</a> to settle your body first.');
    } else if (data.stress >= 4) {
      tips.push('A two-minute <a href="tools.html#breathing">box breathing</a> break can take the edge off moderate stress.');
    } else {
      tips.push("Your stress is low today. Notice what's working so you can come back to it.");
    }
    if (data.sleep !== null && data.sleep < 7) {
      tips.push(`You slept about ${data.sleep} hours. Most young adults need 7–9 — try winding down without screens 30 minutes earlier tonight.`);
    }
    if (data.mindfulness === "Rarely") {
      tips.push("Mindfulness doesn't have to be long. Start with one minute of noticing your breath each morning.");
    }
    tips.push('Write down three good things in your <a href="tools.html#journal">gratitude journal</a> before bed.');
    return tips;
  };

  // === Recent check-ins (stored locally) ===
  const renderHistory = () => {
    const history = MWH.store.get(HISTORY_KEY, []);
    if (!history.length) {
      historyList.innerHTML = '<li class="empty-state d-block">Your past check-ins will appear here.</li>';
      clearHistoryBtn.hidden = true;
      return;
    }
    clearHistoryBtn.hidden = false;
    historyList.innerHTML = history
      .slice()
      .reverse()
      .map((h) => `
        <li>
          <span class="history-emoji" aria-hidden="true">${MWH.MOODS[h.mood].emoji}</span>
          <div>
            <strong>${MWH.formatDate(h.date)}</strong>
            <span class="text-muted small d-block">Mood: ${MWH.MOODS[h.mood].label} · Stress ${h.stress}/10${h.sleep !== null ? ` · Sleep ${h.sleep}h` : ""}</span>
          </div>
        </li>`)
      .join("");
  };

  clearHistoryBtn.addEventListener("click", () => {
    if (!confirm("Clear your saved check-ins?")) return;
    MWH.store.remove(HISTORY_KEY);
    renderHistory();
  });

  // === Submit ===
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    formMessage.textContent = "";
    formMessage.className = "form-status mt-3";

    const sleepRaw = sleepInput.value.trim();
    const sleep = sleepRaw === "" ? null : Number(sleepRaw);

    const checks = [
      setFieldError(nameInput, nameInput.value.trim() === ""),
      setGroupError(moodGroup, checkedValue("mood") === ""),
      setGroupError(mindfulnessGroup, checkedValue("mindfulness") === ""),
      setFieldError(sleepInput, sleep !== null && (Number.isNaN(sleep) || sleep < 0 || sleep > 24)),
      setFieldError(favoritePractice, favoritePractice.value === "")
    ];

    if (checks.includes(false)) {
      formMessage.textContent = "Please fix the highlighted fields.";
      formMessage.classList.add("is-error");
      // Move focus to the first problem
      const firstInvalid = form.querySelector(".is-invalid, .is-invalid-group input");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const data = {
      date: MWH.dateKey(),
      name: nameInput.value.trim(),
      mood: Number(checkedValue("mood")),
      mindfulness: checkedValue("mindfulness"),
      stress: Number(stressSlider.value),
      sleep,
      practice: favoritePractice.value,
      comments: comments.value.trim()
    };

    // Keep the last 10 check-ins (without name or comments) for the history list
    const history = MWH.store.get(HISTORY_KEY, []);
    history.push({ date: data.date, mood: data.mood, stress: data.stress, sleep: data.sleep });
    MWH.store.set(HISTORY_KEY, history.slice(-10));

    // Optionally also log today's mood in the mood tracker
    if (logMood.checked) {
      const moods = MWH.store.get(MOOD_KEY, []).filter((m) => m.date !== data.date);
      moods.push({ date: data.date, mood: data.mood, note: "From check-in", savedAt: Date.now() });
      MWH.store.set(MOOD_KEY, moods);
    }

    const safe = MWH.escapeHTML;
    results.innerHTML = `
      <div class="mw-card">
        <h2 class="h3 mb-1">Thanks for checking in, ${safe(data.name)} ${MWH.MOODS[data.mood].emoji}</h2>
        <p class="text-muted">Here's a summary of today's answers and a few ideas that might help.</p>
        <div class="row g-4">
          <div class="col-md-5">
            <h3 class="h6 text-uppercase text-muted">Your answers</h3>
            <dl class="row mb-0 small">
              <dt class="col-5">Mood</dt><dd class="col-7">${MWH.MOODS[data.mood].label}</dd>
              <dt class="col-5">Stress</dt><dd class="col-7">${data.stress} / 10</dd>
              <dt class="col-5">Sleep</dt><dd class="col-7">${data.sleep !== null ? `${data.sleep} hours` : "Not given"}</dd>
              <dt class="col-5">Mindfulness</dt><dd class="col-7">${safe(data.mindfulness)}</dd>
              <dt class="col-5">Favourite practice</dt><dd class="col-7">${safe(data.practice)}</dd>
              <dt class="col-5">Reflections</dt><dd class="col-7">${data.comments ? safe(data.comments) : "None"}</dd>
            </dl>
          </div>
          <div class="col-md-7">
            <h3 class="h6 text-uppercase text-muted">Suggestions for you</h3>
            <ul class="mb-0">${buildSuggestions(data).map((tip) => `<li class="mb-2">${tip}</li>`).join("")}</ul>
          </div>
        </div>
      </div>`;

    formMessage.textContent = logMood.checked
      ? "Check-in complete — today's mood was also added to your tracker."
      : "Check-in complete.";
    formMessage.classList.add("is-success");

    form.reset();
    updateStress();
    commentsCounter.textContent = "0 / 250 characters";
    renderHistory();

    // Move focus to the summary so keyboard and screen-reader users land on it
    results.focus();
  });

  updateStress();
  renderHistory();
});
