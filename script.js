let questions = [];
let currentCategory = "";
let scorePerQuestion = {};

function normalizeAnswer(answer) {
  return answer
    .toLowerCase()
    .split(",")
    .map(item => item.trim())
    .filter(item => item !== "")
    .sort()
    .join(",");
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function loadCategory(mainCategory, subCategory) {
  if (!subCategory) {
    document.getElementById("quizContainer").innerHTML = "Silakan pilih subkategori.";
    return;
  }

  currentCategory = mainCategory;
  scorePerQuestion = {};
  questions = [];

  const scriptId = "questionScript";
  const oldScript = document.getElementById(scriptId);
  if (oldScript) oldScript.remove();

  window.loadedQuestions = [];

  const script = document.createElement("script");
  script.id = scriptId;
  script.src = `questions/${mainCategory}/${subCategory}.js`;

  script.onload = () => {
    if (Array.isArray(window.loadedQuestions) && window.loadedQuestions.length > 0) {
      questions = window.loadedQuestions.map((q, i) => ({ ...q, id: `q${i}` }));

      // ✅ CEK apakah user ingin soal diacak
      const shuffleCheckbox = document.getElementById("shuffleCheckbox");
      const shouldShuffle = shuffleCheckbox ? shuffleCheckbox.checked : true;

      if (shouldShuffle) {
        shuffle(questions);
      }

      renderQuestions();
    } else {
      document.getElementById("quizContainer").innerHTML = "<p>Soal tidak ditemukan atau kosong.</p>";
    }
  };

  document.head.appendChild(script);
  document.getElementById("quizContainer").innerHTML = "Memuat soal...";
  document.getElementById("totalScore").innerText = "Total Skor: 0 / 0 (0%)";
}

function renderQuestions() {
  const container = document.getElementById("quizContainer");
  container.innerHTML = "";

  questions.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question";
    div.id = q.id;

    let html = "";

    if (currentCategory === "KataKerja") {
      html += `<p>V1: ${q.v1}</p>
               <label>V2: <input type="text" id="v2-${index}"></label>
               <label>V3: <input type="text" id="v3-${index}"></label>
               <label>Arti: <input type="text" id="arti-${index}"></label>`;
    } else if (currentCategory === "CEFR") {
      html += `<p>Apa arti kata <strong>"${q.word}"</strong>?</p>
               <label><input type="text" id="arti-${index}" placeholder="Tulis artinya"></label>`;
    } else if (currentCategory === "ReferenceFromEF") {
      html += `<p>Apa arti kata <strong>"${q.word}"</strong>?</p>
               <label><input type="text" id="arti-${index}" placeholder="Tulis artinya"></label>`;
    } else if (currentCategory === "KataKerjaBantu") {
      html += `<p><strong>${q.word}</strong></p>
               <label><input type="text" id="arti-${index}" placeholder="Tulis artinya"></label>`;
    } else if (currentCategory === "KataSifat") {
      html += `<p>Apa arti kata <strong>"${q.word}"</strong>?</p>
               <label><input type="text" id="arti-${index}" placeholder="Tulis artinya"></label>`;
    } else if (currentCategory === "KataHubung") {
      html += `<p>Apa arti dari <strong>"${q.arti}"</strong>?</p>`;
      q.options.forEach(opt => {
        html += `<label><input type="radio" name="opt-${index}" value="${opt}"> ${opt}</label><br>`;
      });
    } else if (currentCategory === "Tenses") {
      html += `<p>${q.question}</p>
           <label>(+) <input type="text" id="pos-${index}" placeholder="positif"></label><br>
           <label>(-) <input type="text" id="neg-${index}" placeholder="negatif"></label><br>
           <label>(?) <input type="text" id="int-${index}" placeholder="interogatif"></label>`;
    } else if (currentCategory === "TimeExpressions") {
      html += `<p><strong>${q.word}</strong></p>
               <label><input type="text" id="arti-${index}" placeholder="Tulis artinya"></label>`;
    } else if (currentCategory === "OrdinalNumber") {
  html += `<p>Soal: ${q.Soal}</p>
           <label>Penulisan Singkat: <input type="text" id="PenulisanSingkat-${index}"></label>
           <label>Penulisan Panjang/Ordinal: <input type="text" id="PenulisanPanjang-${index}"></label>
           <div id="feedback-${index}"></div>`;
    } else if (currentCategory === "TimeBrEAmE") {
  html += `<p>Soal: ${q.Soal}</p>
           <label>British: <input type="text" id="British-${index}"></label>
           <label>American: <input type="text" id="American-${index}"></label>
           <div id="feedback-${index}"></div>`;
    } 

    html += `<br><button onclick="checkAnswer(${index})">Cek Jawaban</button>
             <div class="feedback" id="feedback-${index}"></div>`;

    div.innerHTML = html;
    container.appendChild(div);

    // ✅ Tambahan: Tekan ENTER = cek jawaban
    const inputs = div.querySelectorAll("input[type='text']");
    inputs.forEach(inp => {
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault(); // mencegah form submit/pindah baris
          checkAnswer(index);
        }
      });
    });
  });
}

function checkAnswer(index) {
  const q = questions[index];
  let correct = false;
  let feedback = "";

  if (currentCategory === "KataKerja") {
    const v2 = document.getElementById(`v2-${index}`).value.trim().toLowerCase();
    const v3 = document.getElementById(`v3-${index}`).value.trim().toLowerCase();
    const arti = document.getElementById(`arti-${index}`).value.trim().toLowerCase();

    if (v2 === q.v2.toLowerCase() && v3 === q.v3.toLowerCase() && arti === q.arti.toLowerCase()) {
      correct = true;
    }

    feedback = correct
      ? `<span class="correct">Benar!</span>`
      : `<span class="wrong">Salah! V2: ${q.v2}, V3: ${q.v3}, Arti: ${q.arti}</span>`;
  } else if (currentCategory === "KataKerjaBantu") {
  const userInput = document.getElementById(`arti-${index}`).value;
  const userSet = normalizeAnswer(userInput);
  const correctSet = normalizeAnswer(q.arti);

  correct = userSet === correctSet;

  feedback = correct
    ? `<span class="correct">Benar!</span>`
    : `<span class="wrong">Salah! Jawaban benar: ${q.arti}</span>`;
  } else if (currentCategory === "CEFR") {
    const arti = document.getElementById(`arti-${index}`).value.trim().toLowerCase();
    correct = arti === q.arti.toLowerCase();

    feedback = correct
      ? `<span class="correct">Benar!</span>`
      : `<span class="wrong">Salah! Arti yang benar: ${q.arti}</span>`;
  } else if (currentCategory === "ReferenceFromEF") {
    const arti = document.getElementById(`arti-${index}`).value.trim().toLowerCase();
    correct = arti === q.arti.toLowerCase();

    feedback = correct
      ? `<span class="correct">Benar!</span>`
      : `<span class="wrong">Salah! Arti yang benar: ${q.arti}</span>`;
  } else if (currentCategory === "KataSifat") {
    const arti = document.getElementById(`arti-${index}`).value.trim().toLowerCase();
    correct = arti === q.arti.toLowerCase();

    feedback = correct
      ? `<span class="correct">Benar!</span>`
      : `<span class="wrong">Salah! Arti yang benar: ${q.arti}</span>`;
  } else if (currentCategory === "KataHubung") {
    const selected = document.querySelector(`input[name="opt-${index}"]:checked`);
    if (!selected) {
      feedback = `<span class="wrong">Pilih salah satu jawaban!</span>`;
    } else {
      correct = selected.value === q.correct;
      feedback = correct
        ? `<span class="correct">Benar!</span>`
        : `<span class="wrong">Salah! Jawaban yang benar: ${q.correct}</span>`;
    }
  } else if (currentCategory === "Tenses") {
    const pos = document.getElementById(`pos-${index}`).value.trim().toLowerCase();
    const neg = document.getElementById(`neg-${index}`).value.trim().toLowerCase();
    const int = document.getElementById(`int-${index}`).value.trim().toLowerCase();

    if (pos === q.answer.positive.toLowerCase() &&
        neg === q.answer.negative.toLowerCase() &&
        int === q.answer.interrogative.toLowerCase()) {
      correct = true;
    }

    feedback = correct
      ? `<span class="correct">Benar!</span>`
      : `<span class="wrong">Salah! Jawaban benar:<br>
        (+) ${q.answer.positive}<br>
        (-) ${q.answer.negative}<br>
        (?) ${q.answer.interrogative}</span>`;
    } else if (currentCategory === "TimeExpressions") {
  const userInput = document.getElementById(`arti-${index}`).value;
  const userSet = normalizeAnswer(userInput);
  const correctSet = normalizeAnswer(q.arti);

  correct = userSet === correctSet;

  feedback = correct
    ? `<span class="correct">Benar!</span>`
    : `<span class="wrong">Salah! Jawaban benar: ${q.arti}</span>`;
  } else if (currentCategory === "OrdinalNumber") {
  const PenulisanSingkat = document.getElementById(`PenulisanSingkat-${index}`).value.trim().toLowerCase();
  const PenulisanPanjang = document.getElementById(`PenulisanPanjang-${index}`).value.trim().toLowerCase();

  if (
    PenulisanSingkat === q.PenulisanSingkat.toLowerCase() &&
    PenulisanPanjang === q.PenulisanPanjang.toLowerCase()
  ) {
    correct = true;
  }

  feedback = correct
    ? `<span class="correct">Benar!</span>`
    : `<span class="wrong">Salah! Penulisan Singkat: ${q.PenulisanSingkat}, Penulisan Panjang/Ordinal: ${q.PenulisanPanjang}</span>`;
} else if (currentCategory === "TimeBrEAmE") {
  const British = document.getElementById(`British-${index}`).value.trim().toLowerCase();
  const American = document.getElementById(`American-${index}`).value.trim().toLowerCase();

  if (
    British === q.British.toLowerCase() &&
    American === q.American.toLowerCase()
  ) {
    correct = true;
  }

  feedback = correct
    ? `<span class="correct">Benar!</span>`
    : `<span class="wrong">Salah! British: ${q.British}, American: ${q.American}</span>`;
}

  if (!(index in scorePerQuestion)) {
    scorePerQuestion[index] = correct ? 1 : 0;
  }

  document.getElementById(`feedback-${index}`).innerHTML = feedback;
  updateTotalScore();
}

function updateTotalScore() {
  const total = questions.length;
  const score = Object.values(scorePerQuestion).reduce((a, b) => a + b, 0);
  const percent = total > 0 ? ((score / total) * 100).toFixed(2) : "0";
  document.getElementById("totalScore").innerText = `Total Skor: ${score} / ${total} (${percent}%)`;
}
