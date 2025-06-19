// Cập nhật controllers/index.js - Thêm search controller

// controllers/index.js

// 1. Model: URL‐sync và Event Store
import { initUrlSync }     from "../models/url.js";
import { initEventStore }  from "./event-store.js";

initUrlSync();                       // a) lắng nghe view-change / date-change
const eventStore = initEventStore(); // b) lắng localStorage và emit events-change

// 2. Controllers / Views init
import { initResponsiveController }    from "./responsive.js";
import { initViewSelectController }    from "./view-select.js";
import { initNavController }           from "./nav.js";
import { initMiniCalendars }           from "./mini-calendar.js";
import { initMobileSidebarController } from "./mobile-sidebar.js";
import { initHamburger }               from "./hamburger.js";
import { initNotificationsController } from "./notifications.js";
import { initSidebarToggleView }   from "../views/sidebar-toggleView.js"; // nếu bạn vẫn dùng view init
import { initMenuNavigateView }     from "../views/menuNavigateView.js";
import { initEventCreateController }   from "./event-create-button.js";
import { initEventDeleteController }   from "./event-delete-dialog.js";
import { initEventDetailsController }  from "./event-details-dialog.js";
import { initEventFormController }     from "./event-form-dialog.js";
import { initAccountController } from "./acc.js";
import { initCalendar }                from "./calendar.js";
import { initEventSearchController } from "./event-search.js"; // Import search controller
import { initReminderController }     from "./reminderController.js";
// a) UI‐wide controllers
initResponsiveController();    
initViewSelectController();  
initNavController();          
initMiniCalendars();          
initMobileSidebarController();
initHamburger();
initNotificationsController();
initSidebarToggleView();    // hoặc initSidebarToggleController() nếu bạn có controller cho sidebar
initMenuNavigateView();
initAccountController();
initReminderController();
// b) Form & dialog controllers
initEventCreateController();
initEventDeleteController();
initEventDetailsController();
initEventFormController();

// c) Search controller - NEW
initEventSearchController('search-input');

// 3. Vẽ Calendar
initCalendar(eventStore);