/**
 * contact-list.ts
 *
 * Dedicated UI component managing contact table rows, cards, empty states, and action buttons.
 */

import { Contact } from '../types.js';
import { escapeHTML } from './contact-details.js';

export class ContactListUI {
  private contactsTableBody: HTMLTableSectionElement | null;
  private contactsCardsContainer: HTMLDivElement | null;
  private emptyStateContainer: HTMLDivElement | null;
  private noResultsContainer: HTMLDivElement | null;
  private displayedCountText: HTMLSpanElement | null;

  constructor() {
    this.contactsTableBody = document.getElementById(
      'contactsTableBody'
    ) as HTMLTableSectionElement | null;
    this.contactsCardsContainer = document.getElementById(
      'contactsCardsContainer'
    ) as HTMLDivElement | null;
    this.emptyStateContainer = document.getElementById(
      'emptyStateContainer'
    ) as HTMLDivElement | null;
    this.noResultsContainer = document.getElementById(
      'noResultsContainer'
    ) as HTMLDivElement | null;
    this.displayedCountText = document.getElementById(
      'displayedCountText'
    ) as HTMLSpanElement | null;
  }

  public render(
    contacts: Contact[],
    totalUnfiltered: number,
    handlers: {
      onToggleFavourite: (id: string) => void;
      onToggleStatus: (id: string) => void;
      onView: (id: string) => void;
      onEdit: (id: string) => void;
      onDelete: (id: string) => void;
    }
  ): void {
    if (this.displayedCountText) {
      this.displayedCountText.textContent = `${contacts.length} of ${totalUnfiltered}`;
    }

    if (totalUnfiltered === 0) {
      if (this.emptyStateContainer) this.emptyStateContainer.style.display = 'block';
      if (this.noResultsContainer) this.noResultsContainer.style.display = 'none';
      if (this.contactsTableBody) this.contactsTableBody.innerHTML = '';
      if (this.contactsCardsContainer) this.contactsCardsContainer.innerHTML = '';
      return;
    }

    if (this.emptyStateContainer) this.emptyStateContainer.style.display = 'none';

    if (contacts.length === 0) {
      if (this.noResultsContainer) this.noResultsContainer.style.display = 'block';
      if (this.contactsTableBody) this.contactsTableBody.innerHTML = '';
      if (this.contactsCardsContainer) this.contactsCardsContainer.innerHTML = '';
      return;
    }

    if (this.noResultsContainer) this.noResultsContainer.style.display = 'none';

    this.renderTable(contacts, handlers);
    this.renderCards(contacts, handlers);
  }

  private renderTable(
    contacts: Contact[],
    handlers: {
      onToggleFavourite: (id: string) => void;
      onToggleStatus: (id: string) => void;
      onView: (id: string) => void;
      onEdit: (id: string) => void;
      onDelete: (id: string) => void;
    }
  ): void {
    if (!this.contactsTableBody) return;
    this.contactsTableBody.innerHTML = '';

    contacts.forEach((contact) => {
      const tr = document.createElement('tr');
      tr.className = `contact-row ${contact.status === 'inactive' ? 'row-inactive' : ''}`;

      const favIcon = contact.isFavourite ? '★' : '☆';
      const favClass = contact.isFavourite ? 'fav-active' : 'fav-inactive';

      const tagsHtml =
        contact.tags && contact.tags.length > 0
          ? contact.tags
              .map((t) => `<span class="badge badge-tag">${escapeHTML(t)}</span>`)
              .join(' ')
          : '<span class="text-muted">-</span>';

      tr.innerHTML = `
        <td class="col-fav">
          <button class="btn-icon btn-fav ${favClass}" data-id="${contact.id}" title="Toggle Favourite">
            ${favIcon}
          </button>
        </td>
        <td class="col-name">
          <div class="name-container">
            <span class="contact-name font-medium">${escapeHTML(contact.fullName)}</span>
            ${contact.jobTitle ? `<span class="contact-title text-muted text-xs">${escapeHTML(contact.jobTitle)}</span>` : ''}
          </div>
        </td>
        <td class="col-phone font-mono text-sm">${escapeHTML(contact.phoneNumber)}</td>
        <td class="col-email text-sm">${contact.email ? `<a href="mailto:${escapeHTML(contact.email)}">${escapeHTML(contact.email)}</a>` : '<span class="text-muted">-</span>'}</td>
        <td class="col-company text-sm">${escapeHTML(contact.company || '-')}</td>
        <td class="col-category">
          <span class="badge badge-cat badge-${contact.category.toLowerCase()}">${escapeHTML(contact.category)}</span>
        </td>
        <td class="col-tags">${tagsHtml}</td>
        <td class="col-status">
          <button class="badge badge-${contact.status} btn-status-toggle" data-id="${contact.id}" title="Click to toggle status">
            ${contact.status}
          </button>
        </td>
        <td class="col-actions">
          <div class="action-buttons">
            <button class="btn btn-xs btn-outline btn-view" data-id="${contact.id}" title="View Details">👁️</button>
            <button class="btn btn-xs btn-outline btn-edit" data-id="${contact.id}" title="Edit Contact">✏️</button>
            <button class="btn btn-xs btn-outline btn-delete" data-id="${contact.id}" title="Delete Contact">🗑️</button>
          </div>
        </td>
      `;

      tr.querySelector('.btn-fav')?.addEventListener('click', () =>
        handlers.onToggleFavourite(contact.id)
      );
      tr.querySelector('.btn-status-toggle')?.addEventListener('click', () =>
        handlers.onToggleStatus(contact.id)
      );
      tr.querySelector('.btn-view')?.addEventListener('click', () => handlers.onView(contact.id));
      tr.querySelector('.btn-edit')?.addEventListener('click', () => handlers.onEdit(contact.id));
      tr.querySelector('.btn-delete')?.addEventListener('click', () =>
        handlers.onDelete(contact.id)
      );

      this.contactsTableBody?.appendChild(tr);
    });
  }

  private renderCards(
    contacts: Contact[],
    handlers: {
      onToggleFavourite: (id: string) => void;
      onToggleStatus: (id: string) => void;
      onView: (id: string) => void;
      onEdit: (id: string) => void;
      onDelete: (id: string) => void;
    }
  ): void {
    if (!this.contactsCardsContainer) return;
    this.contactsCardsContainer.innerHTML = '';

    contacts.forEach((contact) => {
      const card = document.createElement('div');
      card.className = `contact-card ${contact.status === 'inactive' ? 'card-inactive' : ''}`;

      const favIcon = contact.isFavourite ? '★' : '☆';
      const favClass = contact.isFavourite ? 'fav-active' : 'fav-inactive';

      const tagsHtml =
        contact.tags && contact.tags.length > 0
          ? contact.tags
              .map((t) => `<span class="badge badge-tag">${escapeHTML(t)}</span>`)
              .join(' ')
          : '';

      card.innerHTML = `
        <div class="card-header">
          <div class="card-title-group">
            <h4 class="card-name">${escapeHTML(contact.fullName)}</h4>
            ${contact.jobTitle ? `<p class="card-title text-muted text-xs">${escapeHTML(contact.jobTitle)}</p>` : ''}
          </div>
          <button class="btn-icon btn-fav ${favClass}" data-id="${contact.id}" title="Toggle Favourite">
            ${favIcon}
          </button>
        </div>

        <div class="card-body">
          <div class="card-detail"><span class="icon">📞</span> ${escapeHTML(contact.phoneNumber)}</div>
          ${contact.email ? `<div class="card-detail"><span class="icon">✉️</span> <a href="mailto:${escapeHTML(contact.email)}">${escapeHTML(contact.email)}</a></div>` : ''}
          ${contact.company ? `<div class="card-detail"><span class="icon">🏢</span> ${escapeHTML(contact.company)}</div>` : ''}
          ${contact.reminderDate ? `<div class="card-detail reminder-flag"><span class="icon">⏰</span> Follow-up: ${escapeHTML(contact.reminderDate)}</div>` : ''}
          
          <div class="card-badges">
            <span class="badge badge-cat badge-${contact.category.toLowerCase()}">${escapeHTML(contact.category)}</span>
            <button class="badge badge-${contact.status} btn-status-toggle" data-id="${contact.id}">
              ${contact.status}
            </button>
          </div>

          ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ''}
        </div>

        <div class="card-footer">
          <button class="btn btn-sm btn-outline btn-view" data-id="${contact.id}">View</button>
          <button class="btn btn-sm btn-outline btn-edit" data-id="${contact.id}">Edit</button>
          <button class="btn btn-sm btn-outline btn-delete" data-id="${contact.id}">Delete</button>
        </div>
      `;

      card
        .querySelector('.btn-fav')
        ?.addEventListener('click', () => handlers.onToggleFavourite(contact.id));
      card
        .querySelector('.btn-status-toggle')
        ?.addEventListener('click', () => handlers.onToggleStatus(contact.id));
      card.querySelector('.btn-view')?.addEventListener('click', () => handlers.onView(contact.id));
      card.querySelector('.btn-edit')?.addEventListener('click', () => handlers.onEdit(contact.id));
      card
        .querySelector('.btn-delete')
        ?.addEventListener('click', () => handlers.onDelete(contact.id));

      this.contactsCardsContainer?.appendChild(card);
    });
  }
}
