/**
 * main.ts
 *
 * Application Entry Point.
 * Initializes the state from localStorage and attaches DOM event handlers.
 */

import { initializeContactService } from './contact-service.js';
import { initContactManagerEvents, renderDashboard, renderContactList } from './contact-manager.js';

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // 1. Load contacts into state
  initializeContactService();

  // 2. Wire event listeners
  initContactManagerEvents();

  // 3. Initial UI rendering
  renderDashboard();
  renderContactList();
});
