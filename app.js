const BASE_URL = "https://rithm-jeopardy.herokuapp.com/api";
const NUM_CATEGORIES = 6;
const NUM_CLUES_PER_CAT = 5;

let categories = [];

async function getCategoryIds() {
  const res = await axios.get(`${BASE_URL}/categories?count=100`);
  const random = _.sampleSize(res.data, NUM_CATEGORIES);
  return random.map(cat => cat.id);
}

async function getCategory(catId) {
  const res = await axios.get(`${BASE_URL}/category?id=${catId}`);
  const allClues = res.data.clues;
  const randomClues = _.sampleSize(allClues, NUM_CLUES_PER_CAT);
  return {
    title: res.data.title,
    clues: randomClues.map(c => ({
      question: c.question,
      answer: c.answer,
      showing: null
    }))
  };
}

async function setupGame() {
  const catIds = await getCategoryIds();
  categories = [];
  for (let id of catIds) {
    categories.push(await getCategory(id));
  }
  fillTable();
}

function fillTable() {
  const $table = document.getElementById("jeopardy");
  $table.innerHTML = "";

  // Create table header
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (let cat of categories) {
    const th = document.createElement("th");
    th.innerText = cat.title;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  $table.appendChild(thead);

  // Create table body
  const tbody = document.createElement("tbody");
  for (let clueIdx = 0; clueIdx < NUM_CLUES_PER_CAT; clueIdx++) {
    const row = document.createElement("tr");
    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
      const cell = document.createElement("td");
      cell.innerText = "Pick one";
      cell.setAttribute("id", `${catIdx}-${clueIdx}`);
      cell.addEventListener("click", handleClick);
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  }
  $table.appendChild(tbody);
}

function handleClick(evt) {
  const id = evt.target.id;
  const [catIdx, clueIdx] = id.split("-").map(Number);
  const clue = categories[catIdx].clues[clueIdx];

  if (clue.showing === null) {
    evt.target.innerText = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    evt.target.innerText = clue.answer;
    evt.target.classList.add("revealed");
    clue.showing = "answer";
  }
}

document.getElementById("restart").addEventListener("click", setupGame);

// Start game on load
setupGame();
