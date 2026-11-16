/**
 * contact-list.ts
 *
 * Dedicated UI component managing contact table rows, cards, empty states, and action buttons.
 */
import { escapeHTML } from './contact-details.js';
export class ContactListUI {
    constructor() {
        this.contactsTableBody = document.getElementById('contactsTableBody');
        this.contactsCardsContainer = document.getElementById('contactsCardsContainer');
        this.emptyStateContainer = document.getElementById('emptyStateContainer');
        this.noResultsContainer = document.getElementById('noResultsContainer');
        this.displayedCountText = document.getElementById('displayedCountText');
    }
    render(contacts, totalUnfiltered, handlers) {
        if (this.displayedCountText) {
            this.displayedCountText.textContent = `${contacts.length} of ${totalUnfiltered}`;
        }
        if (totalUnfiltered === 0) {
            if (this.emptyStateContainer)
                this.emptyStateContainer.style.display = 'block';
            if (this.noResultsContainer)
                this.noResultsContainer.style.display = 'none';
            if (this.contactsTableBody)
                this.contactsTableBody.innerHTML = '';
            if (this.contactsCardsContainer)
                this.contactsCardsContainer.innerHTML = '';
            return;
        }
        if (this.emptyStateContainer)
            this.emptyStateContainer.style.display = 'none';
        if (contacts.length === 0) {
            if (this.noResultsContainer)
                this.noResultsContainer.style.display = 'block';
            if (this.contactsTableBody)
                this.contactsTableBody.innerHTML = '';
            if (this.contactsCardsContainer)
                this.contactsCardsContainer.innerHTML = '';
            return;
        }
        if (this.noResultsContainer)
            this.noResultsContainer.style.display = 'none';
        this.renderTable(contacts, handlers);
        this.renderCards(contacts, handlers);
    }
    renderTable(contacts, handlers) {
        if (!this.contactsTableBody)
            return;
        this.contactsTableBody.innerHTML = '';
        contacts.forEach((contact) => {
            var _a, _b, _c, _d, _e, _f;
            const tr = document.createElement('tr');
            tr.className = `contact-row ${contact.status === 'inactive' ? 'row-inactive' : ''}`;
            const favIcon = contact.isFavourite ? '★' : '☆';
            const favClass = contact.isFavourite ? 'fav-active' : 'fav-inactive';
            const tagsHtml = contact.tags && contact.tags.length > 0
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
            (_a = tr.querySelector('.btn-fav')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => handlers.onToggleFavourite(contact.id));
            (_b = tr.querySelector('.btn-status-toggle')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => handlers.onToggleStatus(contact.id));
            (_c = tr.querySelector('.btn-view')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => handlers.onView(contact.id));
            (_d = tr.querySelector('.btn-edit')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => handlers.onEdit(contact.id));
            (_e = tr.querySelector('.btn-delete')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => handlers.onDelete(contact.id));
            (_f = this.contactsTableBody) === null || _f === void 0 ? void 0 : _f.appendChild(tr);
        });
    }
    renderCards(contacts, handlers) {
        if (!this.contactsCardsContainer)
            return;
        this.contactsCardsContainer.innerHTML = '';
        contacts.forEach((contact) => {
            var _a, _b, _c, _d, _e, _f;
            const card = document.createElement('div');
            card.className = `contact-card ${contact.status === 'inactive' ? 'card-inactive' : ''}`;
            const favIcon = contact.isFavourite ? '★' : '☆';
            const favClass = contact.isFavourite ? 'fav-active' : 'fav-inactive';
            const tagsHtml = contact.tags && contact.tags.length > 0
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
            (_a = card
                .querySelector('.btn-fav')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => handlers.onToggleFavourite(contact.id));
            (_b = card
                .querySelector('.btn-status-toggle')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => handlers.onToggleStatus(contact.id));
            (_c = card.querySelector('.btn-view')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => handlers.onView(contact.id));
            (_d = card.querySelector('.btn-edit')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => handlers.onEdit(contact.id));
            (_e = card
                .querySelector('.btn-delete')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => handlers.onDelete(contact.id));
            (_f = this.contactsCardsContainer) === null || _f === void 0 ? void 0 : _f.appendChild(card);
        });
    }
}
