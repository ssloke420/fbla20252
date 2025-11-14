      const form = document.getElementById("item-form");
      const submitBtn = document.getElementById("form-submit");
      const table = document.getElementById("item-table");

      // Load saved data from localStorage when the page loads
      window.onload = function() {
        const savedItems = JSON.parse(localStorage.getItem("lostAndFoundItems")) || [];
        savedItems.forEach(item => addRowToTable(item));
      };

      // Handle form submission
      submitBtn.addEventListener("click", async (e) => {
        e.preventDefault(); // Prevent page reload
        const title = document.getElementById("item-title").value.trim();
        const desc = document.getElementById("item-desc").value.trim();
        const fileInput = document.getElementById("item-pic");
        const location = document.getElementById("item-location").value.trim();
        const type = document.getElementById("item-type").value;

        if (!title || !desc || !location) {
          alert("Please fill out all required fields.");
          return;
        }

        let imageData = "";
        if (fileInput.files && fileInput.files[0]) {
          imageData = await toBase64(fileInput.files[0]);
        }

        const newItem = { title, desc, imageData, location, type };

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
      }

      function saveToLocalStorage(item) {
        const existingItems = JSON.parse(localStorage.getItem("lostAndFoundItems")) || [];
        item.id = Date.now();
        existingItems.push(item);
        localStorage.setItem("lostAndFoundItems", JSON.stringify(existingItems));
      }
