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
import { initGroupCalendarController } from "./group-calendar-controller.js";
import { initSidebarToggleView } from "../../views/sidebar-toggleView.js";
import { initEventCreateController } from "../event-create-button.js";
import { initEventDeleteController } from "../event-delete-dialog.js";
import { initEventDetailsController } from "../event-details-dialog.js";
import { initEventFormController } from "../event-form-dialog.js";
import { initGroupCalendarSidebar } from "./group-calendar-sidebar.js";
import { initGroupCalendarNavigation } from "./navigation-controller.js"; // Import the new navigation controller

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

// Initialize navigation controller
initGroupCalendarNavigation(); // Initialize the new navigation controller

// Initialize event-related controllers
initEventCreateController();
initEventDeleteController();
initEventDetailsController();
initEventFormController();

// Initialize Group Calendar specific controllers
initGroupCalendarSidebar();
initGroupCalendarController(eventStore);