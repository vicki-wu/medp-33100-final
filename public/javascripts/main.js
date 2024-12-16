document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("entryModal");
  const newEntryBtn = document.getElementById("newEntryBtn");
  const closeBtn = document.getElementsByClassName("close")[0];
  const diaryForm = document.getElementById("diaryForm");
  const entriesList = document.getElementById("entriesList");
  const searchInput = document.getElementById("searchInput");
  const moodFilter = document.getElementById("moodFilter");
  const sortSelect = document.getElementById("sortSelect");

  // Modal Controls
  newEntryBtn.onclick = function () {
    modal.style.display = "block";
  };

  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // Image Preview
  document.getElementById("mediaUrl").addEventListener("input", function (e) {
    const preview = document.getElementById("imagePreview");
    const url = e.target.value;

    if (url) {
      preview.innerHTML = `<img src="${url}" alt="Preview" style="max-width: 200px; margin-top: 10px;">`;
    } else {
      preview.innerHTML = "";
    }
  });

  // New Entry Submission
  const handleNewEntrySubmission = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        title: document.getElementById("title").value,
        date: document.getElementById("date").value,
        description: document.getElementById("description").value,
        mediaUrl: document.getElementById("mediaUrl").value,
        mood: document.querySelector('input[name="mood"]:checked')?.value,
      };

      const response = await fetch("/memories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        window.location.reload();
      } else {
        throw new Error("Failed to save entry");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save entry. Please try again.");
    }
  };

  diaryForm.onsubmit = handleNewEntrySubmission;

  // When clicking "New Entry", reset the form and set it back to create mode
  newEntryBtn.onclick = function () {
    diaryForm.reset();
    document.getElementById("imagePreview").innerHTML = "";
    modal.style.display = "block";
    // Reset to the original new entry handler
    diaryForm.onsubmit = handleNewEntrySubmission;
  };

  // Filter and Search Functionality
  function filterEntries() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedMood = moodFilter.value;
    const entries = document.querySelectorAll(".diary-entry");

    entries.forEach((entry) => {
      const title = entry
        .querySelector(".entry-title")
        .textContent.toLowerCase();
      const content = entry
        .querySelector(".entry-content")
        .textContent.toLowerCase();
      const mood = entry.querySelector(".entry-mood").textContent;

      const matchesSearch =
        title.includes(searchTerm) || content.includes(searchTerm);
      const matchesMood = !selectedMood || mood === selectedMood;

      entry.style.display = matchesSearch && matchesMood ? "block" : "none";
    });
  }

  searchInput.addEventListener("input", filterEntries);
  moodFilter.addEventListener("change", filterEntries);

  // Sort Functionality
  sortSelect.addEventListener("change", (e) => {
    const entries = Array.from(document.querySelectorAll(".diary-entry"));
    const container = document.getElementById("entriesList");

    entries.sort((a, b) => {
      const dateA = new Date(a.querySelector(".entry-date").textContent);
      const dateB = new Date(b.querySelector(".entry-date").textContent);

      return e.target.value === "newest" ? dateB - dateA : dateA - dateB;
    });

    container.innerHTML = "";
    entries.forEach((entry) => container.appendChild(entry));
  });

  // Delete Entry
  entriesList.addEventListener("click", async (e) => {
    if (e.target.closest(".delete-btn")) {
      const entry = e.target.closest(".diary-entry");
      const id = entry.dataset.id;

      if (confirm("Are you sure you want to delete this entry?")) {
        try {
          const response = await fetch(`/memories/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            entry.remove();
            updateEntryCount();
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    }
  });

  // Edit Entry
  entriesList.addEventListener("click", async (e) => {
    if (e.target.closest(".edit-btn")) {
      const entry = e.target.closest(".diary-entry");
      const id = entry.dataset.id;

      // Populate the form with existing data
      document.getElementById("title").value =
        entry.querySelector(".entry-title").textContent;
      document.getElementById("description").value =
        entry.querySelector(".entry-content p").textContent;
      document.getElementById("date").value = formatDateForInput(
        entry.querySelector(".entry-date").textContent
      );
      document.getElementById("mediaUrl").value =
        entry.querySelector(".entry-image img")?.src || "";

      // Show the modal
      modal.style.display = "block";

      // Replace the form submission handler with update logic
      diaryForm.onsubmit = async (e) => {
        e.preventDefault();

        try {
          const formData = {
            title: document.getElementById("title").value,
            date: document.getElementById("date").value,
            description: document.getElementById("description").value,
            mediaUrl: document.getElementById("mediaUrl").value,
            mood: document.querySelector('input[name="mood"]:checked')?.value,
          };

          const response = await fetch(`/memories/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          window.location.reload();
        } catch (error) {
          console.error("Error:", error);
          alert("Failed to update entry. Please try again.");
        }
      };
    }
  });

  // Helper function to format date
  function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  }

  function updateEntryCount() {
    const count = document.querySelectorAll(".diary-entry").length;
    document.getElementById("entryCount").textContent = count;
  }
});
