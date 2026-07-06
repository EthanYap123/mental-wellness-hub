document.addEventListener("DOMContentLoaded", () => {
  // === Card Hover Effects with Bootstrap shadows ===
  function setupCardHoverEffects() {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
      // Store original shadow and border classes (if any)
      const originalShadowClass = card.classList.contains('shadow-lg') ? 'shadow-lg' :
                                  card.classList.contains('shadow-sm') ? 'shadow-sm' :
                                  card.classList.contains('shadow') ? 'shadow' : '';
      const originalBorderClass = card.classList.contains('border') ? 'border' : '';

      // Mouse enter - add hover effect with Bootstrap classes
      card.addEventListener('mouseenter', () => {
        if (originalShadowClass) card.classList.remove(originalShadowClass);
        if (originalBorderClass) card.classList.remove(originalBorderClass);
        card.classList.add('shadow-lg', 'border', 'border-success');
        card.style.transform = 'translateY(-5px)';
        card.style.transition = 'all 0.3s ease';
      });

      // Mouse leave - revert to original classes and styles
      card.addEventListener('mouseleave', () => {
        card.classList.remove('shadow-lg', 'border', 'border-success');
        if (originalShadowClass) card.classList.add(originalShadowClass);
        if (originalBorderClass) card.classList.add(originalBorderClass);
        card.style.transform = '';
        card.style.transition = '';
      });

      // Optional touch support
      card.addEventListener('touchstart', () => {
        if (originalShadowClass) card.classList.remove(originalShadowClass);
        if (originalBorderClass) card.classList.remove(originalBorderClass);
        card.classList.add('shadow-lg', 'border', 'border-success');
        card.style.transform = 'translateY(-5px)';
      }, { passive: true });

      card.addEventListener('touchend', () => {
        card.classList.remove('shadow-lg', 'border', 'border-success');
        if (originalShadowClass) card.classList.add(originalShadowClass);
        if (originalBorderClass) card.classList.add(originalBorderClass);
        card.style.transform = '';
      });
    });
  }
  setupCardHoverEffects();

  // === Form Handling ===
  const form = document.getElementById("wellnessForm");

  // Form fields
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const mindfulnessRadios = document.getElementsByName("mindfulness");
  const stressSlider = document.getElementById("stressLevel");
  const favoritePractice = document.getElementById("favoritePractice");
  const comments = document.getElementById("comments");

  // Feedback elements
  const feedbackMap = {
    name: document.getElementById("nameFeedback"),
    email: document.getElementById("emailFeedback"),
    mindfulness: document.getElementById("mindfulnessFeedback"),
    practice: document.getElementById("practiceFeedback")
  };

  const commentsCounter = document.getElementById("commentsCounter");
  const stressDisplay = document.getElementById("stressLevelValue");
  const formMessage = document.getElementById("formMessage");
  const submissionResults = document.getElementById("submissionResults");

  // Update stress display with color
  const updateStressLevelColor = (value) => {
    stressDisplay.classList.remove("text-success", "text-warning", "text-danger");

    if (value >= 1 && value <= 3) {
      stressDisplay.classList.add("text-success");
    } else if (value >= 4 && value <= 6) {
      stressDisplay.classList.add("text-warning");
    } else if (value >= 7 && value <= 10) {
      stressDisplay.classList.add("text-danger");
    }

    stressDisplay.textContent = `Current value: ${value}`;
  };

  // Live updates on slider
  stressSlider.addEventListener("input", () => {
    updateStressLevelColor(Number(stressSlider.value));
  });

  // Initialize stress level color on page load
  updateStressLevelColor(Number(stressSlider.value));

  // Update character counter for comments
  comments.addEventListener("input", () => {
    commentsCounter.textContent = `${comments.value.length} / 250 characters`;
  });

  // Show or hide feedback
  const showFeedback = (field, show) => {
    if (feedbackMap[field]) {
      feedbackMap[field].style.display = show ? "block" : "none";
    }
  };

  // Mark inputs invalid or valid and show feedback
  const setInvalid = (input, field, condition) => {
    if (condition) {
      input?.classList.add("is-invalid");
      showFeedback(field, true);
      return false;
    } else {
      input?.classList.remove("is-invalid");
      showFeedback(field, false);
      return true;
    }
  };

  // Hide mindfulness feedback on radio change
  mindfulnessRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      showFeedback("mindfulness", false);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    // Reset feedback and message
    Object.values(feedbackMap).forEach(f => f.style.display = "none");
    [nameInput, emailInput, favoritePractice].forEach(input =>
      input.classList.remove("is-invalid")
    );
    formMessage.textContent = "";
    formMessage.classList.remove("text-success", "text-danger");

    // Validate fields
    valid &= setInvalid(nameInput, "name", nameInput.value.trim() === "");
    valid &= setInvalid(emailInput, "email", !(emailInput.value.includes("@") && emailInput.value.includes(".")));

    const mindfulnessSelected = Array.from(mindfulnessRadios).some(radio => radio.checked);
    if (!mindfulnessSelected) {
      showFeedback("mindfulness", true);
      valid = false;
    }

    valid &= setInvalid(favoritePractice, "practice", favoritePractice.value === "");

    if (!valid) {
      // Focus management: move focus to first invalid element
      const firstInvalidInput = document.querySelector(".is-invalid");
      const mindfulnessFeedbackVisible = feedbackMap.mindfulness.style.display === "block";

      if (firstInvalidInput) {
        firstInvalidInput.focus();
      } else if (mindfulnessFeedbackVisible) {
        const firstMindfulnessRadio = document.querySelector('input[name="mindfulness"]');
        if (firstMindfulnessRadio) firstMindfulnessRadio.focus();
      }

      formMessage.textContent = "Please fill in all required fields correctly.";
      formMessage.classList.add("text-danger");
      return;
    }

    // If valid, show success message
    formMessage.textContent = "Thank you! Your form has been submitted.";
    formMessage.classList.add("text-success");

    // Display submitted data
    submissionResults.innerHTML = `
      <h3>Your Submitted Responses:</h3>
      <ul class="list-group text-success">
        <li class="list-group-item list-group-item-success"><strong>Name:</strong> ${nameInput.value.trim()}</li>
        <li class="list-group-item list-group-item-success"><strong>Email:</strong> ${emailInput.value.trim()}</li>
        <li class="list-group-item list-group-item-success"><strong>Mindfulness Frequency:</strong> ${Array.from(mindfulnessRadios).find(r => r.checked).value}</li>
        <li class="list-group-item list-group-item-success"><strong>Stress Level:</strong> ${stressSlider.value}</li>
        <li class="list-group-item list-group-item-success"><strong>Favorite Practice:</strong> ${favoritePractice.value}</li>
        <li class="list-group-item list-group-item-success"><strong>Comments:</strong> ${comments.value.trim() || "None"}</li>
      </ul>
      <p class="mt-3">You can continue reading more on the <a href="info.html">Informational Page</a>.</p>
    `;

    form.reset();
    updateStressLevelColor(Number(stressSlider.value));
    commentsCounter.textContent = "0 / 250 characters";

    // Focus results for accessibility
    submissionResults.focus();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const quizForm = document.getElementById('quizForm');
  const submitBtn = document.getElementById('submitQuiz');
  const resultsDiv = document.getElementById('quizResults');

  // Create a container div for the Try Again button to align right
  const tryAgainContainer = document.createElement('div');
  tryAgainContainer.className = 'd-flex justify-content-end mt-3';

  // Create Try Again button but don't show it initially
  const tryAgainBtn = document.createElement('button');
  tryAgainBtn.type = 'button';
  tryAgainBtn.className = 'btn btn-primary';
  tryAgainBtn.textContent = 'Try Again';
  tryAgainBtn.style.display = 'none';

  // Append Try Again button inside container, then insert container after resultsDiv
  tryAgainContainer.appendChild(tryAgainBtn);
  resultsDiv.after(tryAgainContainer);

  submitBtn.addEventListener('click', () => {
    const totalQuestions = 5;
    let score = 0;

    // Clear previous feedback styling
    const allLabels = quizForm.querySelectorAll('label');
    allLabels.forEach(label => {
      label.classList.remove('text-success', 'text-danger');
    });

    for (let i = 1; i <= totalQuestions; i++) {
      const selected = quizForm.querySelector(`input[name="q${i}"]:checked`);
      if (selected) {
        const label = quizForm.querySelector(`label[for="${selected.id}"]`);
        if (selected.value === 'correct') {
          score++;
          label.classList.add('text-success');
        } else {
          label.classList.add('text-danger');

          // Highlight correct answer label green
          const correctInput = quizForm.querySelector(`input[name="q${i}"][value="correct"]`);
          if (correctInput) {
            const correctLabel = quizForm.querySelector(`label[for="${correctInput.id}"]`);
            if (correctLabel) {
              correctLabel.classList.add('text-success');
            }
          }
        }
      } else {
        // No answer selected - highlight correct answer label green only
        const correctInput = quizForm.querySelector(`input[name="q${i}"][value="correct"]`);
        if (correctInput) {
          const correctLabel = quizForm.querySelector(`label[for="${correctInput.id}"]`);
          if (correctLabel) {
            correctLabel.classList.add('text-success');
          }
        }
      }
    }

    // Show score and message
    let message = '';
    if (score === totalQuestions) {
      message = 'Excellent! You know your stuff!';
    } else if (score >= 3) {
      message = 'Good job! Keep learning.';
    } else {
      message = 'Keep practicing mindfulness and mental wellness!';
    }

    resultsDiv.innerHTML = `
      <div class="alert alert-info" role="alert">
        You scored <strong>${score}</strong> out of <strong>${totalQuestions}</strong>. ${message}
      </div>
    `;

    submitBtn.disabled = true;
    tryAgainBtn.style.display = 'inline-block';
  });

  tryAgainBtn.addEventListener('click', () => {
    // Clear all selections
    quizForm.reset();

    // Remove text coloring
    const allLabels = quizForm.querySelectorAll('label');
    allLabels.forEach(label => {
      label.classList.remove('text-success', 'text-danger');
    });

    // Clear results and hide Try Again button
    resultsDiv.innerHTML = '';
    tryAgainBtn.style.display = 'none';

    // Re-enable Submit button
    submitBtn.disabled = false;
  });
});
