// --------------------------
// GLOBAL VARIABLES
// --------------------------
let bannedWords = [];

const form = document.getElementById("item-form");
const submitBtn = document.getElementById("form-submit");
const table = document.getElementById("item-table");
const searchInput = document.getElementById("search-input");

// --------------------------
// LOAD BAD WORDS ON STARTUP
// --------------------------
fetch("./extras/badwords.json")
  .then(response => response.json())
  .then(data => {
    bannedWords = data.words || [];
  })
  .catch(err => console.error("Failed to load bad words:", err));

// --------------------------
// CHECK FOR BAD WORDS
// --------------------------
function containsBadWord(text) {
  return bannedWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(text);
  });
}

// --------------------------
// LOAD SAVED ITEMS ON START
// --------------------------
window.onload = function () {
  const savedItems = JSON.parse(localStorage.getItem("lostAndFoundItems")) || [];
  savedItems.forEach(item => addRowToTable(item));
};

// --------------------------
// SEARCH FUNCTIONALITY (added)
// --------------------------
searchInput.addEventListener("input", function () {
  const query = searchInput.value.toLowerCase();
  const rows = table.querySelectorAll("tr");

  rows.forEach((row, index) => {
    if (index === 0) return; // skip header
    const rowText = row.textContent.toLowerCase();
    row.style.display = rowText.includes(query) ? "" : "none";
  });
});

// --------------------------
// SUBMIT FORM
// --------------------------
submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const title = document.getElementById("item-title").value.trim();
  const desc = document.getElementById("item-desc").value.trim();
  const fileInput = document.getElementById("item-pic");
  const location = document.getElementById("item-location").value.trim();
  const type = document.getElementById("item-type").value;

  if (!title || !desc || !location) {
    alert("Please fill out all required fields.");
    return;
  }

  if (containsBadWord(title) || containsBadWord(desc) || containsBadWord(location)) {
    alert("Your listing contains inappropriate words and cannot be submitted.");
    return;
  }

  let imageData = "";
  if (fileInput.files && fileInput.files[0]) {
    imageData = await toBase64(fileInput.files[0]);
  }

  const newItem = { 
    id: Date.now(),
    title, 
    desc, 
    imageData, 
    location, 
    type 
  };

  addRowToTable(newItem);
  saveToLocalStorage(newItem);
  form.reset();
});

// --------------------------
// CONVERT IMAGE TO BASE64
// --------------------------
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// --------------------------
// ADD ROW TO TABLE
// --------------------------
function addRowToTable(item) {
  const newRow = table.insertRow(-1);
  newRow.dataset.id = item.id;

  const titleCell = newRow.insertCell(0);
  const descCell = newRow.insertCell(1);
  const picCell = newRow.insertCell(2);
  const locationCell = newRow.insertCell(3);
  const typeCell = newRow.insertCell(4);

  titleCell.textContent = item.title;
  descCell.textContent = item.desc;
  locationCell.textContent = item.location;
  typeCell.textContent = item.type;

  if (item.imageData) {
    const img = document.createElement("img");
    img.src = item.imageData;
    img.className = "preview";
    picCell.appendChild(img);
  } else {
    picCell.textContent = "No image";
  }

  newRow.addEventListener("click", function (e) {
    e.stopPropagation();
    if (sessionStorage.getItem("isAdmin") === "true") {
      const confirmDelete = confirm("Delete this item from Lost & Found?");
      if (!confirmDelete) return;

      deleteItem(item.id);
      newRow.remove();
    }
  });
}

// --------------------------
// SAVE TO LOCAL STORAGE
// --------------------------
function saveToLocalStorage(item) {
  const existingItems = JSON.parse(localStorage.getItem("lostAndFoundItems")) || [];
  existingItems.push(item);
  localStorage.setItem("lostAndFoundItems", JSON.stringify(existingItems));
}

// --------------------------
// DELETE FROM LOCAL STORAGE
// --------------------------
function deleteItem(id) {
  let items = JSON.parse(localStorage.getItem("lostAndFoundItems")) || [];
  items = items.filter(item => item.id !== id);
  localStorage.setItem("lostAndFoundItems", JSON.stringify(items));
}

// JEMMA JUNE NOVEMBER 2025
