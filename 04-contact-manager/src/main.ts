/**
 * main.ts
 *
 * Application Entry Point.
 * Coordinates ContactService initialization, UI binding, and initial rendering.
 * Provides ContactManagerApp class supporting constructor Dependency Injection.
 */

import { ContactService, defaultContactService } from './contact-service.js';
import { initContactManagerEvents, renderDashboard, renderContactList } from './contact-manager.js';

export class ContactManagerApp {
  private service: ContactService;

  constructor(service: ContactService = defaultContactService) {
    this.service = service;
    this.init();
  }

  public init(): void {
    this.service.init();
    initContactManagerEvents();
    renderDashboard();
    renderContactList();
  }
}

// Bootstrap application on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new ContactManagerApp();
    });
  } else {
    new ContactManagerApp();
  }
}
