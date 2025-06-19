// Cập nhật controllers/group-calendar/index.js - Thêm search controller

// controllers/group-calendar/index.js (Updated)

// Import existing controllers
import { initUrlSync } from "../../models/url.js";
import { initEventStore } from "../event-store.js";
import { initResponsiveController } from "../responsive.js";
import { initViewSelectController } from "../view-select.js";
import { initNavController } from "../nav.js";
import { initMiniCalendars } from "../mini-calendar.js";
import { initMobileSidebarController } from "../mobile-sidebar.js";
import { initHamburger } from "../hamburger.js";
import { initNotificationsController } from "../notifications.js";
import { initGroupCalendarController } from "./group-calendar-controller.js";
import { initSidebarToggleView } from "../../views/sidebar-toggleView.js";
import { initEventCreateController } from "../event-create-button.js";
import { initEventDeleteController } from "../event-delete-dialog.js";
import { initEventDetailsController } from "../event-details-dialog.js";
import { initEventFormController } from "../event-form-dialog.js";
import { initGroupCalendarSidebar } from "./group-calendar-sidebar.js";
import { initGroupCalendarNavigation } from "./navigation-controller.js";
import { initEventSearchController } from "../event-search.js"; // Import search controller
import { initReminderController } from "../reminderController.js";
// Initialize URL sync and Event Store
initUrlSync();
const eventStore = initEventStore();

// Initialize UI controllers
initResponsiveController();
initViewSelectController();
initNavController();
initMiniCalendars();
initMobileSidebarController();
initHamburger();
initSidebarToggleView();
initNotificationsController();
// Initialize navigation controller
initGroupCalendarNavigation();

// Initialize event-related controllers
initEventCreateController();
initEventDeleteController();
initEventDetailsController();
initEventFormController();
initReminderController();
// Initialize search controller - NEW
const searchController = initEventSearchController('search-input');

// Initialize Group Calendar specific controllers
initGroupCalendarSidebar();
initGroupCalendarController(eventStore);

// Setup search for group calendar context
document.addEventListener('team-select', (event) => {
  if (event.detail.team) {
    searchController.setSearchType('team', event.detail.team.id);
  } else {
    searchController.setSearchType('personal');
  }
});