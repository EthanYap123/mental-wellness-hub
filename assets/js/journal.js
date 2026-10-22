// =========================================================
// Gratitude journal (tools.html)
// Entries are saved in localStorage as:
//   [{ id: 1729580000000, date: "2026-10-22", items: ["...", "..."] }]
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("journalForm");
  if (!form) return;

  const STORAGE_KEY = "mwh-journal";
  const inputs = form.querySelectorAll(".journal-input");
  const status = document.getElementById("journalStatus");
  const list = document.getElementById("journalList");
  const search = document.getElementById("journalSearch");
  const promptBtn = document.getElementById("journalPrompt");
  const exportBtn = document.getElementById("journalExport");
  const summary = document.getElementById("journalSummary");

  const PROMPTS = [
    "Someone who made today a little easier…",
    "A small thing that made you smile…",
    "Something your body let you do today…",
    "A place where you feel calm…",
    "A skill you're glad you have…",
    "A meal or drink you enjoyed…",
    "Something you learned recently…",
    "A song that lifted your mood…",
    "A friend you can count on…",
    "A challenge that helped you grow…"
  ];

  const loadEntries = () => MWH.store.get(STORAGE_KEY, []);
  const saveEntries = (entries) => MWH.store.set(STORAGE_KEY, entries);

  const render = () => {
    const entries = loadEntries().sort((a, b) => b.id - a.id);
    const query = search.value.trim().toLowerCase();
    const shown = query
      ? entries.filter((e) => e.items.some((item) => item.toLowerCase().includes(query)))
      : entries;

    const streak = MWH.streak(entries.map((e) => e.date));
    const things = entries.reduce((sum, e) => sum + e.items.length, 0);
    summary.textContent = entries.length
      ? `${things} ${things === 1 ? "thing" : "things"} noted across ${entries.length} ${entries.length === 1 ? "entry" : "entries"} · ${streak}-day streak`
      : "Your entries stay on this device.";
    exportBtn.disabled = entries.length === 0;

    if (!shown.length) {
      list.innerHTML = `<p class="empty-state mb-0">${query ? "No entries match your search." : "No entries yet. Start with just one thing you're grateful for."}</p>`;
      return;
    }

    list.innerHTML = shown.map((e) => `
      <article class="journal-entry">
        <div class="d-flex justify-content-between align-items-center gap-2">
          <h3 class="h6 mb-0">${MWH.formatDate(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h3>
          <button type="button" class="btn-link-danger" data-delete="${e.id}" aria-label="Delete entry from ${MWH.formatDate(e.date, { day: "numeric", month: "long" })}">Delete</button>
        </div>
        <ul>${e.items.map((item) => `<li>${MWH.escapeHTML(item)}</li>`).join("")}</ul>
      </article>`).join("");
  };

  // === Save a new entry ===
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const items = Array.from(inputs).map((input) => input.value.trim()).filter(Boolean);

    if (!items.length) {
      inputs[0].classList.add("is-invalid");
      inputs[0].focus();
      status.className = "form-status is-error";
      status.textContent = "Write at least one thing you're grateful for.";
      return;
    }

    const entries = loadEntries();
    entries.push({ id: Date.now(), date: MWH.dateKey(), items });
    if (!saveEntries(entries)) {
      status.className = "form-status is-error";
      status.textContent = "Couldn't save — your browser may be blocking storage.";
      return;
    }

    form.reset();
    inputs[0].classList.remove("is-invalid");
    status.className = "form-status is-success";
    status.textContent = "Saved to your journal. 🌱";
    search.value = "";
    render();
  });

  inputs[0].addEventListener("input", () => inputs[0].classList.remove("is-invalid"));

  // === Fill the empty boxes' placeholders with fresh prompts ===
  promptBtn.addEventListener("click", () => {
    const shuffled = [...PROMPTS].sort(() => Math.random() - 0.5);
    inputs.forEach((input, i) => {
      input.placeholder = shuffled[i];
    });
    const firstEmpty = Array.from(inputs).find((input) => !input.value) || inputs[0];
    firstEmpty.focus();
  });

  search.addEventListener("input", render);

  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-delete]");
    if (!btn) return;
    if (!confirm("Delete this journal entry?")) return;
    saveEntries(loadEntries().filter((entry) => entry.id !== Number(btn.dataset.delete)));
    status.className = "form-status";
    status.textContent = "Entry deleted.";
    render();
  });

  // === Download all entries as a plain-text file ===
  exportBtn.addEventListener("click", () => {
    const entries = loadEntries().sort((a, b) => a.id - b.id);
    const text = entries
      .map((e) => `${MWH.formatDate(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}\n${e.items.map((item) => `  - ${item}`).join("\n")}`)
      .join("\n\n");

    const blob = new Blob([`My Gratitude Journal\n\n${text}\n`], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `gratitude-journal-${MWH.dateKey()}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  });

  render();
});
