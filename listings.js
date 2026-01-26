
let bannedWords = [];

const form = document.getElementById("item-form");
const submitBtn = document.getElementById("form-submit");
const table = document.getElementById("item-table");
const searchInput = document.getElementById("searchbar");


fetch("./extras/badwords.json")
  .then(response => response.json())
  .then(data => {
    bannedWords = data.words || [];
  })
  .catch(err => console.error("Failed to load words:", err));

function containsBadWord(text) {
  return bannedWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(text);
  });
}

window.onload = function () {
  const savedItems = JSON.parse(localStorage.getItem("lostAndFoundItems")) || [];
  savedItems.forEach(item => addRowToTable(item));
};

window.formToggle = function() {
  // document.querySelector(".form-section").classList.toggle("hidden");
  const btn = document.getElementById("toggle");
  const isHidden = document.querySelector(".form-section").classList.toggle("hidden");
  btn.textContent = isHidden ? "Show Form" : "Hide Form";
};

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

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

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

function saveToLocalStorage(item) {
  const existingItems = JSON.parse(localStorage.getItem("lostAndFoundItems")) || [];
  existingItems.push(item);
  localStorage.setItem("lostAndFoundItems", JSON.stringify(existingItems));
}

function deleteItem(id) {
  let items = JSON.parse(localStorage.getItem("lostAndFoundItems")) || [];
  items = items.filter(item => item.id !== id);
  localStorage.setItem("lostAndFoundItems", JSON.stringify(items));
}

searchInput.addEventListener("keyup", function() {
  const filter = searchInput.value.toLowerCase();
  const rows = table.getElementsByTagName("tr");
  for (let i = 1; i < rows.length; i++) {
    const titleCell = rows[i].getElementsByTagName("td")[0];
    const descCell = rows[i].getElementsByTagName("td")[1];
    const locationCell = rows[i].getElementsByTagName("td")[3];

    if (titleCell && descCell && locationCell) {
      const titleText = titleCell.textContent || titleCell.innerText;
      const descText = descCell.textContent || descCell.innerText;
      const locationText = locationCell.textContent || locationCell.innerText;

      if (
        titleText.toLowerCase().indexOf(filter) > -1 || 
        descText.toLowerCase().indexOf(filter) > -1 || 
        locationText.toLowerCase().indexOf(filter) > -1
      ) {
        // If match found, show the row
        rows[i].style.display = "";
      } else {
        // If no match, hide the row
        rows[i].style.display = "none";
      }
    }
  }
});

