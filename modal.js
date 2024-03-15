function createModal(callback) {
  const modal = document.createElement("div");
  modal.className = "sortModal";
  modal.style.display = "none"; // Hide by default

  const modalContent = document.createElement("div");
  modalContent.className = "sortModalContent";

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "auto auto"; // Two columns

  const label1 = document.createElement("label");
  label1.textContent = "Type:";
  grid.appendChild(label1);
  const select1 = document.createElement("select");
  ["ID", "Name"].forEach((option) => select1.add(new Option(option)));
  grid.appendChild(select1);

  const label2 = document.createElement("label");
  label2.textContent = "Sort:";
  grid.appendChild(label2);
  const select2 = document.createElement("select");
  ["Ascending", "Descending"].forEach((option) => select2.add(new Option(option)));
  grid.appendChild(select2);

  modalContent.appendChild(grid);

  const applyButton = document.createElement("button");
  applyButton.textContent = "Apply";
  applyButton.addEventListener("click", () => {
    modal.style.display = "none"; // Hide modal
    callback(select1.value, select2.value); // Call the callback with the selected options
  });
  modalContent.appendChild(applyButton);

  modal.appendChild(modalContent);

  // Close the modal if clicked outside
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  return modal;
}

// Function to add a modal to an icon
function addModalToIcon(icon, callback) {
  const modal = createModal(callback);
  document.body.appendChild(modal);

  icon.addEventListener("click", () => {
    modal.style.display = "block"; // Show modal
  });
}

export { createModal, addModalToIcon };
