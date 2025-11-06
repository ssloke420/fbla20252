// Admin Login Code
let isAdmin = false;

let submit = function() {
    let entered = document.getElementsByName("psw")[0].value;
    if (entered === "rhhs@2025") {
        sessionStorage.setItem("isAdmin", "true");
        document.getElementById("verify").innerHTML = "Login successful!";
    } else {
        document.getElementById("verify").innerHTML = "Incorrect Password";
    }
};

test = function () {
    
         if (sessionStorage.getItem("isAdmin", "true")) {
            document.getElementById("test").innerHTML = "is admin"
        };
};


      const form = document.getElementById("item-form");
      const submitBtn = document.getElementById("form-submit");
      const table = document.getElementById("item-table");

      // Load saved data from localStorage when the page loads
      window.onload = function() {
        const savedItems = JSON.parse(localStorage.getItem("lostAndFoundItems")) || [];
        savedItems.forEach(item => addRowToTable(item));
      };

      // Handle form submission
      submitBtn.addEventListener("click", async () => {
        const title = document.getElementById("item-title").value.trim();
        const desc = document.getElementById("item-desc").value.trim();
        const fileInput = document.getElementById("item-pic");
        const location = document.getElementById("item-location").value.trim();

        if (!title || !desc || !location) {
          alert("Please fill out all required fields.");
          return;
        }

        let imageData = "";
        if (fileInput.files && fileInput.files[0]) {
          imageData = await toBase64(fileInput.files[0]);
        }

        const newItem = { title, desc, imageData, location };

        addRowToTable(newItem);
        saveToLocalStorage(newItem);

        form.reset(); // Clear form fields
      });

      // Convert uploaded file to Base64 string
      function toBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      }

      // Add new row to table
      function addRowToTable(item) {
        const newRow = table.insertRow(-1);
        const titleCell = newRow.insertCell(0);
        const descCell = newRow.insertCell(1);
        const picCell = newRow.insertCell(2);
        const locationCell = newRow.insertCell(3);

        titleCell.textContent = item.title;
        descCell.textContent = item.desc;
        locationCell.textContent = item.location;

        if (item.imageData) {
          const img = document.createElement("img");
          img.src = item.imageData;
          img.className = "preview";
          picCell.appendChild(img);
        } else {
          picCell.textContent = "No image";
        }
      }

      // Save new item to localStorage
      function saveToLocalStorage(item) {
        const existingItems = JSON.parse(localStorage.getItem("lostAndFoundItems")) || [];
        existingItems.push(item);
        localStorage.setItem("lostAndFoundItems", JSON.stringify(existingItems));
      }
