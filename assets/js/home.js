// =========================================================
// Home page "Today" card (index.html)
// Reads what the toolkit has saved and shows a quick summary.
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const card = document.getElementById("todayCard");
  if (!card) return;

  const greeting = document.getElementById("todayGreeting");
  const moodEl = document.getElementById("todayMood");
  const streakEl = document.getElementById("todayStreak");
  const journalEl = document.getElementById("todayJournal");
  const breathEl = document.getElementById("todayBreath");
  const cta = document.getElementById("todayCta");

  const hour = new Date().getHours();
  greeting.textContent = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const moods = MWH.store.get("mwh-moods", []);
  const today = moods.find((m) => m.date === MWH.dateKey());

  if (today) {
    moodEl.textContent = `${MWH.MOODS[today.mood].emoji} ${MWH.MOODS[today.mood].label}`;
    cta.textContent = "See your mood trends";
  } else {
    moodEl.textContent = "Not yet";
  }

  const streak = MWH.streak(moods.map((m) => m.date));
  streakEl.textContent = streak === 1 ? "1 day" : `${streak} days`;
  journalEl.textContent = MWH.store.get("mwh-journal", []).length;
  breathEl.textContent = MWH.store.get("mwh-breath-sessions", 0);
});
