// 1. Sửa views/calendarView.js để support async
// Thay thế function renderCalendar:
// views/month-calendarView.js - Updated to work with async API
import { generateMonthCalendarDays, today, isTheSameDay } from "../models/date.js";
import { isEventAllDay, eventStartsBefore } from "../models/event.js";
import { renderEventListItem } from "./event-listView.js";

// Template elements và mapping class tuần
const calendarTemplateElement = document.querySelector("[data-template='month-calendar']");
const calendarDayTemplateElement = document.querySelector("[data-template='month-calendar-day']");
const calendarWeekClasses = { 4: "four-week", 5: "five-week", 6: "six-week" };

/**
 * Render toàn bộ month calendar với async support
 */
export async function renderMonthCalendar(parent, selectedDate, eventStore) {
  // Clone template
  const content = calendarTemplateElement.content.cloneNode(true);
  const calendarEl = content.querySelector("[data-month-calendar]");
  const dayListEl = calendarEl.querySelector("[data-month-calendar-day-list]");

  // Tính tuần, thêm class tương ứng
  const days = generateMonthCalendarDays(selectedDate);
  const weeks = days.length / 7;
  calendarEl.classList.add(calendarWeekClasses[weeks]);

  // Create all day elements với async events
  const dayPromises = days.map(async (day) => {
    try {
      const events = await eventStore.getEventsByDate(day);
      sortCalendarDayEvents(events);
      return createCalendarDay(day, events);
    } catch (error) {
      console.error("Error loading events for day:", day, error);
      return createCalendarDay(day, []); // Fallback với empty events
    }
  });

  // Wait for all days to be created
  const dayElements = await Promise.all(dayPromises);
  
  // Append all day elements
  dayElements.forEach(dayEl => {
    dayListEl.appendChild(dayEl);
  });

  // Clear parent and append new calendar
  parent.replaceChildren();
  parent.appendChild(calendarEl);
}

/**
 * Tạo một ngày trong month calendar
 */
function createCalendarDay(calendarDay, events) {
  const content = calendarDayTemplateElement.content.cloneNode(true);
  const dayEl = content.querySelector("[data-month-calendar-day]");
  const labelEl = content.querySelector("[data-month-calendar-day-label]");
  const wrapperEl = dayEl.querySelector("[data-month-calendar-event-list-wrapper]");

  // 1) Highlight ngày hôm nay
  if (isTheSameDay(today(), calendarDay)) {
    dayEl.classList.add("month-calendar__day--highlight");
  }

  // 2) Click vào số ngày: chuyển sang view "day"
  labelEl.textContent = calendarDay.getDate();
  labelEl.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("date-change", {
      detail: { date: calendarDay },
      bubbles: true
    }));
    document.dispatchEvent(new CustomEvent("view-change", {
      detail: { view: "day" },
      bubbles: true
    }));
  });

  // 3) Click vào vùng sự kiện (wrapper) → dispatch event-create-request
  wrapperEl.addEventListener("click", e => {
    if (e.target.closest("[data-event]")) return;
    document.dispatchEvent(new CustomEvent("event-create-request", {
      detail: {
        date: calendarDay,
        startTime: 600, // 10:00 AM
        endTime: 660    // 11:00 AM
      },
      bubbles: true
    }));
  });

  // 4) Render từng event
  events.forEach(ev => renderEventListItem(wrapperEl, ev));

  return dayEl;
}

/**
 * Sắp xếp events (all-day lên trước, sau đó theo giờ bắt đầu)
 */
function sortCalendarDayEvents(events) {
  events.sort((a, b) => {
    if (isEventAllDay(a)) return -1;
    if (isEventAllDay(b)) return 1;
    return eventStartsBefore(a, b) ? -1 : 1;
  });
}
export async function renderCalendar(container, view, date, eventStore, deviceType) {
  if (view === "month") {
    await renderMonthCalendar(container, date, eventStore);
  } else if (view === "week") {
    await renderWeekCalendar(container, date, eventStore, false, deviceType);
  } else {
    // compact week view  
    await renderWeekCalendar(container, date, eventStore, true, deviceType);
  }
}

// 2. Sửa views/week-calendarView.js để support async
// Thay thế function renderWeekCalendar:
export async function renderWeekCalendar(parent, selectedDate, eventStore, isSingleDay, deviceType) {
  const content = calendarTemplateElement.content.cloneNode(true);
  const calendarEl = content.querySelector("[data-week-calendar]");
  const daysOfWeekEl = calendarEl.querySelector("[data-week-calendar-day-of-week-list]");
  const allDayListEl = calendarEl.querySelector("[data-week-calendar-all-day-list]");
  const columnsEl = calendarEl.querySelector("[data-week-calendar-columns]");

  const weekDays = isSingleDay ? [selectedDate] : generateWeekDays(selectedDate);
  
  // Process each day with async events
  for (const day of weekDays) {
    try {
      const events = await eventStore.getEventsByDate(day);
      const allDay = events.filter(e => isEventAllDay(e));
      const nonAllDay = events.filter(e => !isEventAllDay(e));
      sortEventsByTime(nonAllDay);

      renderDayOfWeek(daysOfWeekEl, selectedDate, day, deviceType);

      if (deviceType === "desktop" || (deviceType === "mobile" && isTheSameDay(day, selectedDate))) {
        renderAllDayList(allDayListEl, allDay);
        renderWeekColumn(columnsEl, day, nonAllDay);
      }
    } catch (error) {
      console.error("Error loading events for day:", day, error);
      // Continue with empty events for this day
      renderDayOfWeek(daysOfWeekEl, selectedDate, day, deviceType);
      if (deviceType === "desktop" || (deviceType === "mobile" && isTheSameDay(day, selectedDate))) {
        renderAllDayList(allDayListEl, []);
        renderWeekColumn(columnsEl, day, []);
      }
    }
  }

  if (isSingleDay) {
    calendarEl.classList.add("week-calendar--day");
  }
  
  parent.replaceChildren();
  parent.appendChild(calendarEl);

  // adjust dynamic events
  calendarEl.querySelectorAll("[data-event-dynamic]").forEach(el => {
    adjustDynamicEventMaxLines(el);
  });
}

// // 3. Thêm error handling cho login form
// // Sửa views/loginView.js:
// // Trong event listener của signInForm:
// signInForm.addEventListener('submit', async e => {
//   e.preventDefault();
//   const email = document.getElementById('loginEmail').value.trim();
//   const password = document.getElementById('loginPassword').value;
  
//   // Show loading state
//   const submitBtn = signInForm.querySelector('button[type="submit"]');
//   const originalText = submitBtn.textContent;
//   submitBtn.textContent = 'Signing in...';
//   submitBtn.disabled = true;
  
//   try {
//     if (!isValidEmail(email)) throw new Error('Invalid email address');
//     const result = await login({ email, password });
    
//     if (result.success) {
//       alert('Login successful!');
//       window.location.href = 'index.html';
//     }
//   } catch (err) {
//     alert(err.message);
//   } finally {
//     // Reset button state
//     submitBtn.textContent = originalText;
//     submitBtn.disabled = false;
//   }
// });

// // 4. Import cần thiết trong các file controller
// // Thêm vào đầu controllers/index.js:
// import { authService } from "../services/authService.js";

// // 5. CORS setup - Cần thêm vào backend main.py:
// app.add_middleware(
//     CORSMiddleware,
//     allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5500"],
//     allow_credentials=True,
//     allow_methods=["*"],
//     allow_headers=["*"],
// )

// // 6. Quick fix cho event form validation
// // Sửa controllers/event-form-dialog.js function handleFormSubmit:
// function handleFormSubmit() {
//   const formData = getFormData();
  
//   // Basic validation
//   if (!formData.title.trim()) {
//     toaster.error("Event title is required");
//     return;
//   }

//   if (!formData.date) {
//     toaster.error("Event date is required");
//     return;
//   }

//   if (parseInt(formData.startTime) >= parseInt(formData.endTime)) {
//     toaster.error("End time must be after start time");
//     return;
//   }

//   // Create event object
//   const eventData = {
//     id: currentMode === "create" ? generateEventId() : parseInt(formData.id),
//     title: formData.title.trim(),
//     date: new Date(formData.date),
//     startTime: parseInt(formData.startTime),
//     endTime: parseInt(formData.endTime),
//     color: formData.color || "#2563eb",
//     description: formData.description || "",
//     event_type: "general",
//     location: "",
//     priority: "normal"
//   };

//   // Dispatch appropriate event
//   const eventType = currentMode === "create" ? "event-create" : "event-edit";
//   document.dispatchEvent(new CustomEvent(eventType, {
//     detail: { event: eventData },
//     bubbles: true
//   }));

//   toaster.success(`Event ${currentMode === "create" ? "created" : "updated"} successfully!`);
//   dialog.close();
// }

// // 7. Update environment config
// // Tạo file config.js:
// export const config = {
//   API_BASE_URL: process.env.NODE_ENV === 'production' 
//     ? 'https://your-backend-url.com' 
//     : 'http://localhost:8000',
  
//   // Other config values
//   APP_NAME: 'Schedigo',
//   VERSION: '1.0.0'
// };