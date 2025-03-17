document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#medicineForm");
  if (!form) {
    console.error("Form with ID 'medicineForm' not found!");
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const activeIngredient = document.getElementById("ingredient").value.trim();
    const strength = document.getElementById("strength").value.trim();
    const formValue = document.getElementById("form").value.trim();
    const submitButton = document.querySelector("form button[type='submit']");

    const activeIngredientRegex = /^[a-zA-Z\s]+$/;
    const strengthRegex = /^\d+$/;

    const isActiveIngredientValid = activeIngredient && activeIngredientRegex.test(activeIngredient);
    const isStrengthValid =
      strength && strengthRegex.test(strength) && parseInt(strength) >= 0 && parseInt(strength) <= 1000;
    const isFormValid = formValue !== "" && isValidForm(formValue);

    if (!isActiveIngredientValid || !isStrengthValid || !isFormValid) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill all fields correctly before submitting.",
      });
      submitButton.disabled = true;
      return;
    }

    submitButton.disabled = true;
    Swal.fire({
      title: "Loading...",
      text: "Fetching medicine information",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const availableTreatmentsContainer = document.querySelector(".available-treatments");
      availableTreatmentsContainer.innerHTML = "<h4>Available Treatments</h4><span>Searching...</span>";

      const UrlBase = "https://0574-35-227-12-205.ngrok-free.app";
      const response = await fetch(`${UrlBase}/get_best_medicine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          active_ingredient: activeIngredient,
          strength: parseInt(strength),
          form: formValue,
        }),
      });

      if (!response.ok) throw new Error("Response was not ok");

      const data = await response.json();
      const availableTreatments = data["Available_medicines"] || [];

      window.medicineData = { availableTreatments };

      availableTreatmentsContainer.innerHTML = "<h4>Available Treatments</h4>";
      if (availableTreatments.length === 0) {
        availableTreatmentsContainer.innerHTML += "<span>No Results Found</span>";
      } else {
        availableTreatments.forEach((treatment, index) => {
          const treatmentDiv = document.createElement("div");
          treatmentDiv.setAttribute("onclick", `openModal('treatment${index}')`);
          const spanEl = document.createElement("span");
          spanEl.innerHTML = `
            <strong>${treatment["Trade Name"] || `Treatment ${index + 1}`}</strong>
            <span>Strength: ${treatment["Strength"] || "N/A"}</span>
            <span>Priority: ${treatment["Priority"] !== undefined ? treatment["Priority"] : "N/A"}</span>
          `;
          const imgEl = document.createElement("img");
          imgEl.setAttribute("src", "./Images/click-icon.svg");
          imgEl.setAttribute("width", "29");
          imgEl.setAttribute("height", "29");
          imgEl.setAttribute("alt", "Click Icon");
          treatmentDiv.appendChild(spanEl);
          treatmentDiv.appendChild(imgEl);
          availableTreatmentsContainer.appendChild(treatmentDiv);
        });
      }

      Swal.close();
      submitButton.disabled = false;
      document.querySelector(".Home").style.display = "none";
      document.querySelector("body").classList.remove("home");
      document.querySelector(".Sec").style.display = "block";
      setTimeout(() => document.querySelector(".main-section").classList.add("submitted"), 10);
    } catch (error) {
      console.error("Error:", error);
      const availableTreatmentsContainer = document.querySelector(".available-treatments");
      availableTreatmentsContainer.innerHTML = "<h4>Available Treatments</h4><span>No Results Found</span>";
      window.medicineData = null;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch medicine information. Please try again.",
      });
      submitButton.disabled = false;
    }
  });

  const formInput = document.getElementById("form");
  if (!formInput) {
    console.error("Input with ID 'form' not found!");
    return;
  }

  const searchContainer = document.createElement("div");
  searchContainer.className = "search-container";
  formInput.parentNode.appendChild(searchContainer);

  const dropdown = document.createElement("div");
  dropdown.className = "form-dropdown";
  searchContainer.appendChild(dropdown);

  document.addEventListener("click", (event) => {
    if (!searchContainer.contains(event.target)) {
      dropdown.style.display = "none";
    }
  });

  formInput.addEventListener("input", function () {
    const searchTerm = this.value.trim().toLowerCase();
    if (searchTerm === "") {
      dropdown.style.display = "none";
      return;
    }

    const filteredData = {};
    Object.keys(medicineFormData).forEach((category) => {
      const filteredItems = medicineFormData[category].filter((item) =>
        item.toLowerCase().includes(searchTerm)
      );
      if (filteredItems.length > 0) {
        filteredData[category] = filteredItems;
      }
    });

    if (Object.keys(filteredData).length === 0) {
      dropdown.innerHTML = '<div class="no-results">No matching forms found</div>';
      dropdown.style.display = "block";
    } else {
      populateDropdown(dropdown, filteredData);
      dropdown.style.display = "block";
    }
  });

  const activeIngredientField = document.getElementById("ingredient");
  const strengthField = document.getElementById("strength");
  const formField = document.getElementById("form");
  const submitButton = document.querySelector("form button[type='submit']");

  const activeIngredientRegex = /^[a-zA-Z\s]+$/;
  const strengthRegex = /^\d+$/;

  activeIngredientField.addEventListener("input", function () {
    const value = this.value.trim();
    const errorMsg = document.createElement("span");
    errorMsg.className = "error-msg";
    const existingError = this.nextElementSibling;
    if (existingError && existingError.className === "error-msg") {
      existingError.remove();
    }
    if (!value) {
      errorMsg.textContent = "Active Ingredient is required.";
      this.insertAdjacentElement("afterend", errorMsg);
      submitButton.disabled = true;
    } else if (!activeIngredientRegex.test(value)) {
      errorMsg.textContent = "Invalid input. Use letters only.";
      this.insertAdjacentElement("afterend", errorMsg);
      submitButton.disabled = true;
    } else {
      submitButton.disabled = checkFormValidity();
    }
  });

  strengthField.addEventListener("input", function () {
    const value = this.value.trim();
    const errorMsg = document.createElement("span");
    errorMsg.className = "error-msg";
    const existingError = this.nextElementSibling;
    if (existingError && existingError.className === "error-msg") {
      existingError.remove();
    }
    if (!value) {
      errorMsg.textContent = "Strength is required.";
      this.insertAdjacentElement("afterend", errorMsg);
      submitButton.disabled = true;
    } else if (!strengthRegex.test(value)) {
      errorMsg.textContent = "Invalid input. Use numbers only.";
      this.insertAdjacentElement("afterend", errorMsg);
      submitButton.disabled = true;
    } else if (parseInt(value) > 1000) {
      errorMsg.textContent = "Strength must be between 0 and 1000.";
      this.insertAdjacentElement("afterend", errorMsg);
      submitButton.disabled = true;
    } else {
      submitButton.disabled = checkFormValidity();
    }
  });

  formField.addEventListener("input", function () {
    const value = this.value.trim();
    const errorMsg = document.createElement("span");
    errorMsg.className = "error-msg";
    const existingError = this.nextElementSibling;
    if (existingError && existingError.className === "error-msg" && existingError !== searchContainer) {
      existingError.remove();
    }
    if (!value) {
      errorMsg.textContent = "Pharmaceutical Form is required.";
      this.insertAdjacentElement("afterend", errorMsg);
      submitButton.disabled = true;
    } else if (!isValidForm(value)) {
      errorMsg.textContent = "Please select a valid form from the list.";
      this.insertAdjacentElement("afterend", errorMsg);
      submitButton.disabled = true;
    } else {
      submitButton.disabled = checkFormValidity();
    }
  });

  function checkFormValidity() {
    const activeIngredient = activeIngredientField.value.trim();
    const strength = strengthField.value.trim();
    const form = formField.value.trim();
    const isActiveIngredientValid = activeIngredient && activeIngredientRegex.test(activeIngredient);
    const isStrengthValid =
      strength && strengthRegex.test(strength) && parseInt(strength) >= 0 && parseInt(strength) <= 1000;
    const isFormValid = form !== "" && isValidForm(form);
    return !(isActiveIngredientValid && isStrengthValid && isFormValid);
  }

  submitButton.disabled = checkFormValidity();
});

function openModal(id) {
  const modal = document.getElementById("detailsModal");
  modal.style.display = "flex";

  if (!window.medicineData || !window.medicineData.availableTreatments) {
    console.error("No medicine data available");
    clearModalFields();
    return;
  }

  const selectedIndex = parseInt(id.replace("treatment", ""));
  const selectedMedicine = window.medicineData.availableTreatments[selectedIndex];

  if (!selectedMedicine) {
    console.error("No medicine found for ID:", id);
    clearModalFields();
    return;
  }

  const fields = [
    { elementId: "tradeName", keys: ["Trade Name"] },
    { elementId: "modalActiveIngredient", keys: ["Active Ingredient"] },
    { elementId: "modalStrength", keys: ["Strength"] },
    { elementId: "pharmaceuticalForm", keys: ["Pharmaceutical Form"] },
    { elementId: "Indication", keys: ["Indication"] },
    { elementId: "price", keys: ["Price (EGP)"] },
    { elementId: "priority", keys: ["Priority"] },
  ];

  fields.forEach((mapping) => {
    const inputElement = document.getElementById(mapping.elementId);
    if (inputElement) {
      let valueFound = false;
      for (let key of mapping.keys) {
        if (selectedMedicine.hasOwnProperty(key)) {
          let value = selectedMedicine[key];
          if (value === null || value === undefined || value === "") {
            value = "N/A";
          } else {
            value = String(value);
          }
          inputElement.value = value;
          valueFound = true;
          break;
        }
      }
      if (!valueFound) {
        inputElement.value = "N/A";
      }
    }
  });
}

function clearModalFields() {
  const fields = [
    "tradeName",
    "modalActiveIngredient",
    "modalStrength",
    "pharmaceuticalForm",
    "Indication",
    "price",
    "priority",
  ];
  fields.forEach((id) => {
    const inputElement = document.getElementById(id);
    if (inputElement) {
      inputElement.value = "";
    }
  });
}

function closeModal() {
  document.getElementById("detailsModal").style.display = "none";
}

function navigate() {
  document.querySelector(".Home").style.display = "none";
  document.querySelector("body").classList.remove("home");
  document.querySelector(".Sec").style.display = "block";
}

window.onclick = function (event) {
  const modal = document.getElementById("detailsModal");
  if (event.target === modal) {
    closeModal();
  }
};

const medicineFormData = {
  "Injections & Infusions": [
    "Injection",
    "Emulsion for injection/infusion",
    "Emulsion for infusion",
    "Powder for concentrate for solution for infusion",
    "Powder for solution for infusion",
    "Powder for injection",
    "Powder and solvent for solution for injection",
    "Concentrate for solution for infusion",
    "Powder and solvent for suspension for injection in pre-filled syringe",
    "Powder and Solvent for prolonged-release suspension for injection",
    "Prolonged-release suspension for injection",
    "Intravenous infusion",
  ],
  Capsules: [
    "Capsule, hard",
    "Capsule",
    "Gastro-resistant capsule, hard",
    "Prolonged-release capsule",
    "Modified-release capsule, hard",
    "Prolonged-release capsule",
    "Delayed-release capsule",
  ],
  "Oral Forms": [
    "Granules",
    "Caplet",
    "Syrup",
    "Oral suspension",
    "Oral drops, solution",
    "Powder for oral suspension",
    "Powder for oral solution",
    "Medicated chewing-gum",
    "Lozenge",
  ],
  Tablets: [
    "Film-Coated tablet",
    "Prolonged-release tablet",
    "Sublingual tablet",
    "Effervescent tablet",
    "Soluble tablet",
    "Orodispersible tablet",
    "Coated tablet",
    "Chewable tablet",
    "Chewable/dispersible tablet",
    "Extended-release tablet",
    "Gastro-resistant tablet",
    "Prolonged-release film-coated tablet",
    "Tablet, orally disintegrating",
    "Dispersible tablet",
    "Scored tablet",
    "Enteric-coated tablet",
  ],
  Solutions: [
    "Inhalation solution",
    "Solution",
    "Solution for injection",
    "Solution for injection/infusion",
    "Solution for infusion",
    "Oral solution",
    "Nasal spray, solution",
    "Solution for injection in cartridge",
    "Solution for injection in pre-filled pen",
    "Solution for infusion and oral solution",
  ],
  "Topical Forms": ["Gel", "Cream", "Ointment", "Cutaneous patch", "Transdermal patch"],
  "Nasal & Inhalation": ["Inhalation vapour, liquid", "Nasal spray"],
  "Other Forms": [
    "Implant",
    "Spray",
    "Drops",
    "Suppository",
    "Concentrate for solution for haemodialysis",
    "Concentrate for peritoneal for haemodialysis",
  ],
};

function isValidForm(formValue) {
  const allForms = Object.values(medicineFormData).flat();
  return allForms.includes(formValue);
}

function populateDropdown(dropdown, data) {
  dropdown.innerHTML = "";

  if (Object.keys(data).length === 0) {
    const noResults = document.createElement("div");
    noResults.className = "no-results";
    noResults.textContent = "No matching forms found";
    dropdown.appendChild(noResults);
    return;
  }

  Object.keys(data).forEach((category) => {
    const categoryGroup = document.createElement("div");
    categoryGroup.className = "category-group";
    const categoryHeader = document.createElement("div");
    categoryHeader.className = "category-header";
    categoryHeader.textContent = category;
    categoryGroup.appendChild(categoryHeader);

    data[category].forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = "dropdown-item";
      itemElement.textContent = item;
      itemElement.addEventListener("click", function () {
        const formInput = document.getElementById("form");
        formInput.value = this.textContent;
        dropdown.style.display = "none";
        formInput.dispatchEvent(new Event("input"));
      });
      categoryGroup.appendChild(itemElement);
    });

    dropdown.appendChild(categoryGroup);
  });
}