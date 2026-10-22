// =========================================================
// Mental wellness quiz (info.html)
// The answer key lives here instead of in the HTML, so the answers
// can't be read from the radio button values.
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const quizForm = document.getElementById("quizForm");
  if (!quizForm) return;

  const ANSWERS = {
    q1: { correct: "b", explain: "Persistent low mood or sadness lasting two weeks or more is one of the core signs of depression." },
    q2: { correct: "a", explain: "Meditation calms the body's stress response. Skipping sleep and bottling up feelings usually make stress worse." },
    q3: { correct: "b", explain: "Regular movement — even a 20-minute walk a few times a week — is linked to lower stress and better mood." },
    q4: { correct: "c", explain: "Multitasking splits your attention. Mindfulness is about focusing on one thing in the present moment." },
    q5: { correct: "b", explain: "If you feel overwhelmed or can't cope with daily life, reaching out early makes recovery easier." }
  };

  const BEST_KEY = "mwh-quiz-best";
  const total = Object.keys(ANSWERS).length;
  const submitBtn = document.getElementById("submitQuiz");
  const retryBtn = document.getElementById("retryQuiz");
  const resultsDiv = document.getElementById("quizResults");
  const progressBar = document.getElementById("quizProgress");
  const progressText = document.getElementById("quizProgressText");

  const answeredCount = () =>
    Object.keys(ANSWERS).filter((q) => quizForm.querySelector(`input[name="${q}"]:checked`)).length;

  const updateProgress = () => {
    const done = answeredCount();
    progressBar.style.width = `${(done / total) * 100}%`;
    progressBar.parentElement.setAttribute("aria-valuenow", done);
    progressText.textContent = `${done} of ${total} answered`;
  };

  const clearMarks = () => {
    quizForm.querySelectorAll(".form-check").forEach((el) => el.classList.remove("is-correct", "is-wrong"));
    quizForm.querySelectorAll(".quiz-explain").forEach((el) => el.remove());
  };

  quizForm.addEventListener("change", updateProgress);

  quizForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Ask for every question to be answered before marking
    const unanswered = Object.keys(ANSWERS).filter((q) => !quizForm.querySelector(`input[name="${q}"]:checked`));
    if (unanswered.length) {
      const numbers = unanswered.map((q) => q.slice(1));
      const list = numbers.length > 1 ? `${numbers.slice(0, -1).join(", ")} and ${numbers.at(-1)}` : numbers[0];
      resultsDiv.innerHTML = `<div class="alert alert-warning mb-0">Please answer question${numbers.length > 1 ? "s" : ""} ${list} first.</div>`;
      quizForm.querySelector(`input[name="${unanswered[0]}"]`).focus();
      return;
    }

    clearMarks();
    let score = 0;

    Object.entries(ANSWERS).forEach(([name, answer]) => {
      const selected = quizForm.querySelector(`input[name="${name}"]:checked`);
      const correctInput = quizForm.querySelector(`input[name="${name}"][value="${answer.correct}"]`);
      const isRight = selected.value === answer.correct;
      if (isRight) score++;

      correctInput.closest(".form-check").classList.add("is-correct");
      if (!isRight) selected.closest(".form-check").classList.add("is-wrong");

      const explain = document.createElement("p");
      explain.className = "quiz-explain";
      explain.innerHTML = `<strong>${isRight ? "✓ Correct." : "✗ Not quite."}</strong> ${answer.explain}`;
      correctInput.closest("fieldset").appendChild(explain);
    });

    const best = Math.max(score, MWH.store.get(BEST_KEY, 0));
    MWH.store.set(BEST_KEY, best);

    let message = "Keep exploring — every bit of learning helps.";
    if (score === total) message = "Excellent! You know your stuff.";
    else if (score >= 3) message = "Good job! Check the note under each question to fill the gaps.";

    resultsDiv.innerHTML = `
      <div class="mw-card">
        <p class="h4 mb-1">You scored ${score} / ${total}</p>
        <p class="mb-3 text-muted">${message} Your best score: ${best} / ${total}.</p>
        <div class="progress" role="progressbar" aria-label="Quiz score" aria-valuenow="${score}" aria-valuemin="0" aria-valuemax="${total}">
          <div class="progress-bar" style="width: ${(score / total) * 100}%"></div>
        </div>
      </div>`;

    quizForm.querySelectorAll("input").forEach((input) => (input.disabled = true));
    submitBtn.hidden = true;
    retryBtn.hidden = false;
    resultsDiv.focus();
  });

  retryBtn.addEventListener("click", () => {
    quizForm.querySelectorAll("input").forEach((input) => (input.disabled = false));
    quizForm.reset();
    clearMarks();
    resultsDiv.innerHTML = "";
    submitBtn.hidden = false;
    retryBtn.hidden = true;
    updateProgress();
    quizForm.querySelector("input").focus();
  });

  updateProgress();
});
