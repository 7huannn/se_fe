// views/notificationsView.js
/**
 * View layer cho notifications:
 * - Sử dụng instance toaster để hiển thị thông báo
 */
export function notifyEventCreated(toaster) {
    toaster.success("Event has been created");
  }
  
  export function notifyEventDeleted(toaster) {
    toaster.success("Event has been deleted");
  }
  
  export function notifyEventEdited(toaster) {
    toaster.success("Event has been edited");
  }