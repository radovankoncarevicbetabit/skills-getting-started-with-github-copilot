document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Fetch and display activities
  async function loadActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Display each activity
      Object.entries(activities).forEach(([name, details]) => {
        // Create activity card
        const card = document.createElement("div");
        card.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        card.innerHTML = `
          <h4>${name}</h4>
          <p><strong>Description:</strong> ${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Available Spots:</strong> ${spotsLeft} of ${details.max_participants}</p>
          <div class="participants-section">
            <h5>Current Participants:</h5>
            ${details.participants.length > 0 
              ? `<ul class="participants-list">
                  ${details.participants.map(email => `<li>${email}</li>`).join('')}
                </ul>
                <p class="participants-count">${details.participants.length} participant${details.participants.length !== 1 ? 's' : ''} enrolled</p>`
              : '<p class="participants-count">No participants yet. Be the first to sign up!</p>'
            }
          </div>
        `;

        activitiesList.appendChild(card);

        // Add to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading activities:", error);
      activitiesList.innerHTML = '<p class="error">Failed to load activities.</p>';
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Reload activities to show updated participants
        await loadActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Load activities on page load
  loadActivities();
});
