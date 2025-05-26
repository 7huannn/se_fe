// 1. Sửa views/calendarView.js để support async
// Thay thế function renderCalendar:
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

// 3. Thêm error handling cho login form
// Sửa views/loginView.js:
// Trong event listener của signInForm:
signInForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  // Show loading state
  const submitBtn = signInForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Signing in...';
  submitBtn.disabled = true;
  
  try {
    if (!isValidEmail(email)) throw new Error('Invalid email address');
    const result = await login({ email, password });
    
    if (result.success) {
      alert('Login successful!');
      window.location.href = 'index.html';
    }
  } catch (err) {
    alert(err.message);
  } finally {
    // Reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// 4. Import cần thiết trong các file controller
// Thêm vào đầu controllers/index.js:
import { authService } from "../services/authService.js";

// 5. CORS setup - Cần thêm vào backend main.py:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

// 6. Quick fix cho event form validation
// Sửa controllers/event-form-dialog.js function handleFormSubmit:
function handleFormSubmit() {
  const formData = getFormData();
  
  // Basic validation
  if (!formData.title.trim()) {
    toaster.error("Event title is required");
    return;
  }

  if (!formData.date) {
    toaster.error("Event date is required");
    return;
  }

  if (parseInt(formData.startTime) >= parseInt(formData.endTime)) {
    toaster.error("End time must be after start time");
    return;
  }

  // Create event object
  const eventData = {
    id: currentMode === "create" ? generateEventId() : parseInt(formData.id),
    title: formData.title.trim(),
    date: new Date(formData.date),
    startTime: parseInt(formData.startTime),
    endTime: parseInt(formData.endTime),
    color: formData.color || "#2563eb",
    description: formData.description || "",
    event_type: "general",
    location: "",
    priority: "normal"
  };

  // Dispatch appropriate event
  const eventType = currentMode === "create" ? "event-create" : "event-edit";
  document.dispatchEvent(new CustomEvent(eventType, {
    detail: { event: eventData },
    bubbles: true
  }));

  toaster.success(`Event ${currentMode === "create" ? "created" : "updated"} successfully!`);
  dialog.close();
}

// 7. Update environment config
// Tạo file config.js:
export const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.com' 
    : 'http://localhost:8000',
  
  // Other config values
  APP_NAME: 'Schedigo',
  VERSION: '1.0.0'
};