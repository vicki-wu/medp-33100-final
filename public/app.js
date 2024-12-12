let memories = [];
let currentEditMemoryId = null;

// Navigation Handler
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const pageId = e.target.dataset.page;

    // Update active navigation
    document
      .querySelectorAll(".nav-links a")
      .forEach((l) => l.classList.remove("active"));
    e.target.classList.add("active");

    // Show corresponding page
    document
      .querySelectorAll(".page")
      .forEach((page) => page.classList.remove("active"));
    document.getElementById(`${pageId}-page`).classList.add("active");

    // Trigger specific page initialization
    if (pageId === "gallery") {
      fetchMemories();
    } else if (pageId === "timeline") {
      generateTimeline();
    }
  });
});

// Start Creating Button
document.getElementById("start-creating")?.addEventListener("click", () => {
  document.querySelector('a[data-page="create"]').click();
});

// Fetch all memories
async function fetchMemories() {
  try {
    const response = await fetch("/api/memories");
    memories = await response.json();
    displayMemories();
  } catch (error) {
    console.error("Error fetching memories:", error);
  }
}

// Generate Timeline
function generateTimeline() {
  const timelineContainer = document.getElementById("memory-timeline");
  timelineContainer.innerHTML = "";

  // Sort memories by date
  const sortedMemories = [...memories].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  sortedMemories.forEach((memory) => {
    const timelineItem = document.createElement("div");
    timelineItem.className = "timeline-item";

    const date = new Date(memory.date).toLocaleDateString();

    timelineItem.innerHTML = `
      <h3>${memory.title}</h3>
      <p><small>By ${memory.author} on ${date}</small></p>
      ${
        memory.mediaUrl
          ? `<img src="${memory.mediaUrl}" alt="${memory.title}">`
          : ""
      }
      <p>${memory.description}</p>
      ${memory.location ? `<p><small>📍 ${memory.location}</small></p>` : ""}
    `;

    timelineContainer.appendChild(timelineItem);
  });

  // Trigger reveal animation
  observeTimelineItems();
}

function observeTimelineItems() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".timeline-item").forEach((item) => {
    observer.observe(item);
  });
}

// Display memories (similar to previous version, with masonry grid adjustments)
function displayMemories(memoriesToDisplay = memories) {
  const container = document.getElementById("memories-container");
  container.innerHTML = "";

  memoriesToDisplay.forEach((memory) => {
    const memoryCard = document.createElement("div");
    memoryCard.className = "memory-card";

    const date = new Date(memory.date).toLocaleDateString();

    // Enhanced image display with validation
    const mediaHtml =
      memory.mediaUrl && isValidImageUrl(memory.mediaUrl)
        ? `<img src="${memory.mediaUrl}" alt="${memory.title}" onerror="this.style.display='none'">`
        : "";

    memoryCard.innerHTML = `
      ${mediaHtml}
      <h3>${memory.title}</h3>
      <p><small>By ${memory.author} on ${date}</small></p>
      <p>${memory.description}</p>
      ${memory.location ? `<p><small>📍 ${memory.location}</small></p>` : ""}
      <div class="tags">
        ${memory.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
      <div class="actions">
        <button onclick="deleteMemory('${memory._id}')">Delete</button>
        <button onclick="openEditModal('${memory._id}')">Edit</button>
      </div>
    `;

    container.appendChild(memoryCard);
  });
}

// Create memory
async function createMemory(event) {
  event.preventDefault();

  const mediaUrl = document.getElementById("mediaUrl").value;
  const isValidMedia = await validateMediaUrl(mediaUrl);

  if (mediaUrl && !isValidMedia) {
    alert("Invalid image URL. Please provide a valid image link.");
    return;
  }

  const formData = {
    title: document.getElementById("title").value,
    author: document.getElementById("author").value || "Anonymous",
    date: document.getElementById("date").value,
    description: document.getElementById("description").value,
    mediaUrl: document.getElementById("mediaUrl").value,
    location: document.getElementById("location").value,
    tags: document
      .getElementById("tags")
      .value.split(",")
      .map((tag) => tag.trim()),
  };

  try {
    const response = await fetch("/api/memories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      document.getElementById("create-memory-form").reset();
      fetchMemories();
    }
  } catch (error) {
    console.error("Error creating memory:", error);
  }
}

// Display memories
function displayMemories(memoriesToDisplay = memories) {
  const container = document.getElementById("memories-container");
  container.innerHTML = "";

  memoriesToDisplay.forEach((memory) => {
    const memoryCard = document.createElement("div");
    memoryCard.className = "memory-card";

    const date = new Date(memory.date).toLocaleDateString();

    memoryCard.innerHTML = `
            ${
              memory.mediaUrl
                ? `<img src="${memory.mediaUrl}" alt="${memory.title}">`
                : ""
            }
            <h3>${memory.title}</h3>
            <p><small>By ${memory.author} on ${date}</small></p>
            <p>${memory.description}</p>
            ${
              memory.location
                ? `<p><small>📍 ${memory.location}</small></p>`
                : ""
            }
            <div class="tags">
                ${memory.tags
                  .map((tag) => `<span class="tag">${tag}</span>`)
                  .join("")}
            </div>
            <div class="actions">
                <button onclick="deleteMemory('${memory._id}')">Delete</button>
                <button onclick="openEditModal('${memory._id}')">Edit</button>
            </div>
        `;

    container.appendChild(memoryCard);
  });
}

// Open Edit Modal
function openEditModal(id) {
  // Find the memory to edit
  const memoryToEdit = memories.find((memory) => memory._id === id);

  if (!memoryToEdit) {
    console.error("Memory not found");
    return;
  }

  // Populate edit modal with memory details
  currentEditMemoryId = id;
  document.getElementById("edit-title").value = memoryToEdit.title;
  document.getElementById("edit-author").value = memoryToEdit.author;
  document.getElementById("edit-date").value = memoryToEdit.date;
  document.getElementById("edit-description").value = memoryToEdit.description;
  document.getElementById("edit-mediaUrl").value = memoryToEdit.mediaUrl || "";
  document.getElementById("edit-location").value = memoryToEdit.location || "";
  document.getElementById("edit-tags").value = memoryToEdit.tags.join(", ");

  // Show the edit modal
  const editModal = document.getElementById("edit-memory-modal");
  editModal.style.display = "block";
}

// Close Edit Modal
function closeEditModal() {
  const editModal = document.getElementById("edit-memory-modal");
  editModal.style.display = "none";
  currentEditMemoryId = null;
}

// Update Memory
async function updateMemory(event) {
  event.preventDefault();

  if (!currentEditMemoryId) {
    console.error("No memory selected for editing");
    return;
  }

  const formData = {
    title: document.getElementById("edit-title").value,
    author: document.getElementById("edit-author").value || "Anonymous",
    date: document.getElementById("edit-date").value,
    description: document.getElementById("edit-description").value,
    mediaUrl: document.getElementById("edit-mediaUrl").value,
    location: document.getElementById("edit-location").value,
    tags: document
      .getElementById("edit-tags")
      .value.split(",")
      .map((tag) => tag.trim()),
  };

  try {
    const response = await fetch(`/api/memories/${currentEditMemoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      closeEditModal();
      fetchMemories();
    }
  } catch (error) {
    console.error("Error updating memory:", error);
  }
}

// Delete memory
async function deleteMemory(id) {
  if (!confirm("Are you sure you want to delete this memory?")) return;

  try {
    const response = await fetch(`/api/memories/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      fetchMemories();
    }
  } catch (error) {
    console.error("Error deleting memory:", error);
  }
}

// Search memories
document.getElementById("search").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();

  const filteredMemories = memories.filter((memory) => {
    // Search across multiple fields
    return (
      memory.title.toLowerCase().includes(searchTerm) ||
      memory.description.toLowerCase().includes(searchTerm) ||
      memory.author.toLowerCase().includes(searchTerm) ||
      (memory.location && memory.location.toLowerCase().includes(searchTerm)) ||
      memory.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
  });

  // Display filtered memories
  displayMemories(filteredMemories);
});

// Sorting functionality
document.getElementById("sort-select").addEventListener("change", (e) => {
  const sortValue = e.target.value;
  let sortedMemories = [...memories];

  if (sortValue === "newest") {
    sortedMemories.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortValue === "oldest") {
    sortedMemories.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  displayMemories(sortedMemories);
});

// Event listeners
document
  .getElementById("create-memory-form")
  .addEventListener("submit", createMemory);
document
  .getElementById("edit-memory-form")
  .addEventListener("submit", updateMemory);
document.addEventListener("DOMContentLoaded", fetchMemories);

function isValidImageUrl(url) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

function validateMediaUrl(url) {
  if (!url) return true; // Optional field

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
