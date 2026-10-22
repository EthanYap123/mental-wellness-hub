// =========================================================
// Daily mood tracker (tools.html)
// One entry per day, saved in localStorage as:
//   [{ date: "2026-10-22", mood: 4, note: "...", savedAt: 1729580000000 }]
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("moodForm");
  if (!form) return;

  const STORAGE_KEY = "mwh-moods";
  const noteInput = document.getElementById("moodNote");
  const noteCounter = document.getElementById("moodNoteCounter");
  const status = document.getElementById("moodStatus");
  const picker = document.getElementById("moodPicker");
  const chart = document.getElementById("moodChart");
  const historyList = document.getElementById("moodHistory");
  const clearBtn = document.getElementById("clearMoods");
  const statStreak = document.getElementById("moodStreak");
  const statAverage = document.getElementById("moodAverage");
  const statCount = document.getElementById("moodCount");

  const loadEntries = () => MWH.store.get(STORAGE_KEY, []);
  const saveEntries = (entries) => MWH.store.set(STORAGE_KEY, entries);

  // === Pre-fill the form if today already has an entry ===
  const fillToday = () => {
    const today = loadEntries().find((e) => e.date === MWH.dateKey());
    if (!today) return;
    const radio = form.querySelector(`input[name="mood"][value="${today.mood}"]`);
    if (radio) radio.checked = true;
    noteInput.value = today.note || "";
    noteCounter.textContent = `${noteInput.value.length} / 140`;
    form.querySelector("button[type='submit']").textContent = "Update today's mood";
  };

  // === 7-day bar chart ===
  const renderChart = (entries) => {
    const byDate = Object.fromEntries(entries.map((e) => [e.date, e]));
    const items = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const key = MWH.dateKey(day);
      const entry = byDate[key];
      const dayName = i === 0 ? "Today" : MWH.formatDate(key, { weekday: "short" });
      const height = entry ? entry.mood * 20 : 4;
      const label = entry
        ? `${MWH.formatDate(key, { weekday: "long" })}: ${MWH.MOODS[entry.mood].label}`
        : `${MWH.formatDate(key, { weekday: "long" })}: no entry`;

      items.push(`
        <li aria-label="${label}">
          <span class="bar-emoji" aria-hidden="true">${entry ? MWH.MOODS[entry.mood].emoji : ""}</span>
          <span class="mood-bar" data-mood="${entry ? entry.mood : ""}" style="height: ${height}%"></span>
          <span aria-hidden="true">${dayName}</span>
        </li>`);
    }

    chart.innerHTML = items.join("");
  };

  // === Summary numbers ===
  const renderStats = (entries) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const recent = entries.filter((e) => e.date >= MWH.dateKey(weekAgo));

    statStreak.textContent = MWH.streak(entries.map((e) => e.date));
    statCount.textContent = entries.length;

    if (recent.length) {
      const avg = recent.reduce((sum, e) => sum + e.mood, 0) / recent.length;
      statAverage.textContent = `${MWH.MOODS[Math.round(avg)].emoji} ${avg.toFixed(1)}`;
    } else {
      statAverage.textContent = "–";
    }
  };

  // === History list (newest first) ===
  const renderHistory = (entries) => {
    if (!entries.length) {
      historyList.innerHTML = `<li class="empty-state d-block">No moods logged yet. Your first entry will show up here.</li>`;
      clearBtn.hidden = true;
      return;
    }

    clearBtn.hidden = false;
    historyList.innerHTML = [...entries]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30)
      .map((e) => `
        <li>
          <span class="history-emoji" aria-hidden="true">${MWH.MOODS[e.mood].emoji}</span>
          <div class="flex-grow-1">
            <strong>${MWH.MOODS[e.mood].label}</strong>
            <span class="text-muted small"> · ${MWH.formatDate(e.date)}</span>
            ${e.note ? `<p class="mb-0 small">${MWH.escapeHTML(e.note)}</p>` : ""}
          </div>
          <button type="button" class="btn-link-danger" data-delete="${e.date}"
            aria-label="Delete mood for ${MWH.formatDate(e.date, { weekday: "long", day: "numeric", month: "long" })}">Delete</button>
        </li>`)
      .join("");
  };

  const renderAll = () => {
    const entries = loadEntries();
    renderChart(entries);
    renderStats(entries);
    renderHistory(entries);
  };

  // === Events ===
  noteInput.addEventListener("input", () => {
    noteCounter.textContent = `${noteInput.value.length} / 140`;
  });

  picker.addEventListener("change", () => {
    picker.classList.remove("is-invalid-group");
    status.textContent = "";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const selected = form.querySelector("input[name='mood']:checked");

    if (!selected) {
      picker.classList.add("is-invalid-group");
      status.className = "form-status is-error";
      status.textContent = "Pick the face that best matches how you feel.";
      picker.querySelector("input").focus();
      return;
    }

    const today = MWH.dateKey();
    const entries = loadEntries().filter((entry) => entry.date !== today);
    entries.push({
      date: today,
      mood: Number(selected.value),
      note: noteInput.value.trim(),
      savedAt: Date.now()
    });

    if (!saveEntries(entries)) {
      status.className = "form-status is-error";
      status.textContent = "Couldn't save — your browser may be blocking storage.";
      return;
    }

    status.className = "form-status is-success";
    status.textContent = `Saved ${MWH.MOODS[selected.value].emoji} — thanks for checking in today.`;
    form.querySelector("button[type='submit']").textContent = "Update today's mood";
    renderAll();
  });

  historyList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-delete]");
    if (!btn) return;
    const date = btn.dataset.delete;
    saveEntries(loadEntries().filter((entry) => entry.date !== date));

    if (date === MWH.dateKey()) {
      form.reset();
      noteCounter.textContent = "0 / 140";
      form.querySelector("button[type='submit']").textContent = "Save today's mood";
    }
    renderAll();
    status.className = "form-status";
    status.textContent = "Entry deleted.";
  });

  clearBtn.addEventListener("click", () => {
    if (!confirm("Delete all mood entries? This can't be undone.")) return;
    MWH.store.remove(STORAGE_KEY);
    form.reset();
    noteCounter.textContent = "0 / 140";
    form.querySelector("button[type='submit']").textContent = "Save today's mood";
    status.className = "form-status";
    status.textContent = "All mood entries cleared.";
    renderAll();
  });

  fillToday();
  renderAll();
});
