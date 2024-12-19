document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("entryModal");
  const introScreen = document.getElementById("introScreen");
  const entriesSection = document.getElementById("entriesSection");
  const getStartedBtn = document.getElementById("getStartedBtn");
  const homeLink = document.getElementById("homeLink");
  const newEntryLink = document.getElementById("newEntryLink");
  const entriesLink = document.getElementById("entriesLink");
  const closeBtn = document.getElementsByClassName("close")[0];
  const diaryForm = document.getElementById("diaryForm");
  const entriesList = document.getElementById("entriesList");
  const searchInput = document.getElementById("searchInput");
  const moodFilter = document.getElementById("moodFilter");
  const sortSelect = document.getElementById("sortSelect");

  // Create view modal
  const viewModal = document.createElement("div");
  viewModal.className = "view-modal";
  viewModal.innerHTML = `
    <div class="view-modal-content">
      <span class="close">&times;</span>
      <div id="viewModalContent"></div>
    </div>
  `;
  document.body.appendChild(viewModal);

  const viewModalClose = viewModal.querySelector(".close");
  viewModalClose.onclick = () => (viewModal.style.display = "none");

  // Function to truncate text
  function truncateText(text, limit) {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
  }

  // Function to update entry content with truncation
  function updateEntryContent() {
    const entries = document.querySelectorAll(".diary-entry");
    const CHARACTER_LIMIT = 150;

    entries.forEach((entry) => {
      const contentP = entry.querySelector(".entry-content p");
      if (contentP) {
        const fullText = contentP.textContent;
        contentP.textContent = truncateText(fullText, CHARACTER_LIMIT);
        contentP.setAttribute("data-full-text", fullText);
      }
    });
  }

  // Navigation Functions
  function showIntro() {
    introScreen.style.display = "flex";
    entriesSection.style.display = "none";
    modal.style.display = "none";
    setActiveLink("homeLink");
  }

  function showEntries() {
    introScreen.style.display = "none";
    entriesSection.style.display = "block";
    modal.style.display = "none";
    setActiveLink("entriesLink");
  }

  function showNewEntry() {
    modal.style.display = "block";
    setActiveLink("newEntryLink");
  }

  function setActiveLink(activeId) {
    const links = document.querySelectorAll(".nav-link");
    links.forEach((link) => link.classList.remove("active"));
    document.getElementById(activeId)?.classList.add("active");
  }

  // Event Listeners for Navigation
  homeLink.onclick = showIntro;
  newEntryLink.onclick = showNewEntry;
  entriesLink.onclick = showEntries;
  getStartedBtn.onclick = showEntries;

  // Modal Controls
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
    if (event.target == viewModal) {
      viewModal.style.display = "none";
    }
  };

  // New Entry Submission
  const handleNewEntrySubmission = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        title: document.getElementById("title").value,
        date: document.getElementById("date").value,
        description: document.getElementById("description").value,
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

  // Filter and Search Functionality
  function getMoodFromEmoji(emoji) {
    const moodMap = {
      "😊": "happy",
      "😢": "sad",
      "🎉": "excited",
      "😴": "tired",
    };
    return moodMap[emoji.trim()] || "";
  }

  function filterEntries() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedMood = moodFilter.value.toLowerCase();
    const entries = document.querySelectorAll(".diary-entry");

    entries.forEach((entry) => {
      const title =
        entry.querySelector(".entry-title")?.textContent.toLowerCase() || "";
      const content =
        entry.querySelector(".entry-content p")?.textContent.toLowerCase() ||
        "";
      const moodEmoji = entry.querySelector(".entry-mood")?.textContent || "";

      const matchesSearch =
        searchTerm === "" ||
        title.includes(searchTerm) ||
        content.includes(searchTerm);
      const matchesMood = selectedMood === "" || moodEmoji === selectedMood;

      entry.style.display = matchesSearch && matchesMood ? "block" : "none";
    });
  }

  // Sort Functionality
  function sortEntries() {
    const entries = Array.from(document.querySelectorAll(".diary-entry"));
    const container = document.getElementById("entriesList");
    const sortOrder = sortSelect.value;

    entries.sort((a, b) => {
      const dateA = new Date(
        a.querySelector(".entry-date").textContent.replace(/[📅\s]/g, "")
      );
      const dateB = new Date(
        b.querySelector(".entry-date").textContent.replace(/[📅\s]/g, "")
      );

      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    entries.forEach((entry) => container.appendChild(entry));
  }

  // View Entry
  function handleViewEntry(entry) {
    const title = entry.querySelector(".entry-title").textContent;
    const date = entry.querySelector(".entry-date").textContent;
    const content =
      entry.querySelector(".entry-content p").getAttribute("data-full-text") ||
      entry.querySelector(".entry-content p").textContent;
    const mood = entry.querySelector(".entry-mood").textContent;

    const viewModalContent = document.getElementById("viewModalContent");
    viewModalContent.innerHTML = `
      <h2>${title}</h2>
      <div style="margin: 1rem 0;">
        <span style="margin-right: 1rem;">${mood}</span>
        <span>${date}</span>
      </div>
      <p style="line-height: 1.6;">${content}</p>
    `;

    viewModal.style.display = "block";
  }

  // Event Listeners for Filtering and Sorting
  searchInput.addEventListener("input", filterEntries);
  moodFilter.addEventListener("change", filterEntries);
  sortSelect.addEventListener("change", () => {
    sortEntries();
    filterEntries();
  });

  // Initialize filtering on page load
  filterEntries();
  updateEntryContent();

  // When clicking "New Entry", reset the form and set it back to create mode
  newEntryLink.onclick = function () {
    diaryForm.reset();
    modal.style.display = "block";
    diaryForm.onsubmit = handleNewEntrySubmission;
  };

  // Handle Entry Actions (View, Edit, Delete)
  entriesList.addEventListener("click", async (e) => {
    const entry = e.target.closest(".diary-entry");
    if (!entry) return;

    if (e.target.closest(".view-btn")) {
      handleViewEntry(entry);
    } else if (e.target.closest(".delete-btn")) {
      const id = entry.dataset.id;

      if (confirm("Are you sure you want to delete this entry?")) {
        try {
          const response = await fetch(`/memories/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            entry.remove();
            filterEntries();
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Failed to delete entry. Please try again.");
        }
      }
    } else if (e.target.closest(".edit-btn")) {
      const id = entry.dataset.id;

      // Populate the form with existing data
      document.getElementById("title").value =
        entry.querySelector(".entry-title").textContent;
      document.getElementById("description").value =
        entry
          .querySelector(".entry-content p")
          .getAttribute("data-full-text") ||
        entry.querySelector(".entry-content p").textContent;
      document.getElementById("date").value = formatDateForInput(
        entry.querySelector(".entry-date").textContent
      );

      // Set the correct mood
      const moodEmoji = entry.querySelector(".entry-mood").textContent;
      const mood = getMoodFromEmoji(moodEmoji);
      const moodInput = document.querySelector(
        `input[name="mood"][value="${mood}"]`
      );
      if (moodInput) moodInput.checked = true; // Check the mood input

      modal.style.display = "block"; // Show modal

      // Replace the form submission handler with update logic
      diaryForm.onsubmit = async (e) => {
        e.preventDefault();

        try {
          const formData = {
            title: document.getElementById("title").value,
            date: document.getElementById("date").value,
            description: document.getElementById("description").value,
            mood: document.querySelector('input[name="mood"]:checked')?.value,
          };

          const response = await fetch(`/memories/${id}`, {
            method: "PUT", // Update method
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Close the modal after successful update
          modal.style.display = "none";

          await loadEntries();
          showEntries();
        } catch (error) {
          console.error("Error:", error);
        }
      };
    }
  });

  // Helper function to format date for input field
  function formatDateForInput(dateString) {
    const date = new Date(dateString.replace(/[📅\s]/g, ""));
    return date.toISOString().split("T")[0];
  }

  // Function to load entries from server
  async function loadEntries() {
    try {
      const response = await fetch("/memories");
      const entries = await response.json();
      // Update the entries list with new data
      // Implementation depends on your server response format
    } catch (error) {
      console.error("Error loading entries:", error);
    }
  }
});
