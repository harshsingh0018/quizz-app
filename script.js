(() => {
  const quiz = {
    // Edit questions here
    questions: [
      {
        question: "Which HTML element is used to create a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<hreflink>"],
        correctIndex: 1
      },
      {
        question: "What does CSS stand for?",
        options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Syntax", "Color Style System"],
        correctIndex: 1
      },
      {
        question: "Which JavaScript method is used to add an element to the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctIndex: 0
      },
      {
        question: "In JavaScript, which keyword is used to declare a constant?",
        options: ["var", "let", "const", "static"],
        correctIndex: 2
      },
      {
        question: "DOM stands for:",
        options: ["Document Object Model", "Data Output Machine", "Dynamic Object Method", "Document Operating Module"],
        correctIndex: 0
      }
    ]
  };

  const $ = (sel) => document.querySelector(sel);

  const viewQuiz = $("#view-quiz");
  const viewResult = $("#view-result");

  const questionEl = $("#question");
  const optionsEl = $("#options");
  const nextBtn = $("#nextBtn");
  const restartBtn = $("#restartBtn");
  const hintEl = $("#hint");

  const progressBadge = $("#progress-badge");
  const scoreMini = $("#score-mini");

  const resultScore = $("#resultScore");
  const resultSummary = $("#resultSummary");
  const correctCount = $("#correctCount");
  const wrongCount = $("#wrongCount");
  const accuracyEl = $("#accuracy");

  let currentIndex = 0;
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let locked = false; // prevents multiple selections

  const state = {
    selectedIndex: null
  };

  function formatQuestionNumber(i) {
    return `Question ${i + 1} / ${quiz.questions.length}`;
  }

  function renderOptions(options) {
    optionsEl.innerHTML = "";

    // DOM manipulation via createElement
    options.forEach((optText, idx) => {
      const optionBtn = document.createElement("button");
      optionBtn.type = "button";
      optionBtn.className = "option";
      optionBtn.setAttribute("role", "listitem");
      optionBtn.setAttribute("aria-checked", "false");
      optionBtn.dataset.index = String(idx);

      const letter = String.fromCharCode(65 + idx); // A, B, C...

      optionBtn.innerHTML = `
        <div class="option__row">
          <div class="option__letter" aria-hidden="true">${letter}</div>
          <div class="option__text">${escapeHTML(optText)}</div>
        </div>
      `;

      optionBtn.addEventListener("click", () => handlePick(idx));
      optionsEl.appendChild(optionBtn);
    });
  }

  function escapeHTML(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setHint(text, tone) {
    hintEl.textContent = text;
    hintEl.style.color = tone === "good" ? "var(--good)" : tone === "bad" ? "var(--bad)" : "var(--muted)";
  }

  function renderQuestion() {
    locked = false;
    state.selectedIndex = null;
    nextBtn.textContent = currentIndex === quiz.questions.length - 1 ? "Finish" : "Next";
    nextBtn.disabled = true;

    hintEl.textContent = "";
    hintEl.style.color = "var(--muted)";

    const q = quiz.questions[currentIndex];
    questionEl.textContent = q.question;

    progressBadge.textContent = formatQuestionNumber(currentIndex);
    scoreMini.textContent = `Score: ${score}`;

    renderOptions(q.options);
  }

  function markOption(idx, { correctIndex }) {
    const btns = Array.from(optionsEl.querySelectorAll(".option"));
    btns.forEach((b) => {
      const bi = Number(b.dataset.index);
      const isPicked = bi === idx;
      const isCorrect = bi === correctIndex;

      if (isPicked) {
        b.setAttribute("aria-checked", "true");
      }

      if (isCorrect) {
        b.classList.add("option--correct");
      }
      if (isPicked && !isCorrect) {
        b.classList.add("option--wrong");
      }

      // Disable after pick
      b.disabled = true;
      b.style.cursor = "not-allowed";
    });
  }

  function handlePick(pickedIndex) {
    if (locked) return;
    locked = true;

    const q = quiz.questions[currentIndex];
    state.selectedIndex = pickedIndex;

    const isCorrect = pickedIndex === q.correctIndex;

    if (isCorrect) {
      score += 1;
      correct += 1;
      setHint("Correct! +1 score", "good");
    } else {
      wrong += 1;
      setHint("Wrong answer. Try next one!", "bad");
    }

    markOption(pickedIndex, { correctIndex: q.correctIndex });

    scoreMini.textContent = `Score: ${score}`;
    nextBtn.disabled = false;
  }

  function showResult() {
    viewQuiz.hidden = true;
    viewResult.hidden = false;

    const total = quiz.questions.length;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;

    resultScore.textContent = `${score} / ${total}`;
    correctCount.textContent = String(correct);
    wrongCount.textContent = String(wrong);
    accuracyEl.textContent = `${accuracy}%`;

    if (accuracy >= 80) {
      resultSummary.textContent = "Excellent work—you're on fire!";
    } else if (accuracy >= 50) {
      resultSummary.textContent = "Good job! A bit more practice and you'll be great.";
    } else {
      resultSummary.textContent = "Nice try—review the topics and run it back.";
    }

    // Animate result content by toggling a class via DOM
    viewResult.classList.remove("view--result");
    // (CSS already animates .view; we keep minimal extra behavior)
  }

  function goNext() {
    // allow advancing only after an answer is selected (locked === true)
    if (!locked || state.selectedIndex === null) return;

    if (currentIndex >= quiz.questions.length - 1) {
      showResult();
      return;
    }

    currentIndex += 1;
    renderQuestion();
  }

  function restart() {
    currentIndex = 0;
    score = 0;
    correct = 0;
    wrong = 0;
    locked = false;
    state.selectedIndex = null;

    viewResult.hidden = true;
    viewQuiz.hidden = false;

    renderQuestion();
  }

  // Events
  nextBtn.addEventListener("click", () => {
    // After a selection, goNext becomes available.
    goNext();
  });

  restartBtn.addEventListener("click", restart);

  // Start
  restart();
})();

