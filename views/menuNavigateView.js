// views/menuNavigateView.js

import {
  goToAcc,
  goToTeams,
  goToChatBox,
  goToEvents,
  goToTasks,
  goToStats
} from "../controllers/menu-navigate.js";

export function initMenuNavigateView() {
  document.addEventListener("DOMContentLoaded", () => {
    document
      .getElementById("btn-acc")
      .addEventListener("click", goToAcc);

    document
      .getElementById("btn-teams")
      .addEventListener("click", goToTeams);

    document
      .getElementById("btn-chatbox")
      .addEventListener("click", goToChatBox);

    document
      .getElementById("btn-events")
      .addEventListener("click", goToEvents);

    document
      .getElementById("btn-tasks")
      .addEventListener("click", goToTasks);

    document
      .getElementById("btn-stats")
      .addEventListener("click", goToStats);
  });
}
