/**
 * contact-manager.ts
 *
 * Coordinates UI controllers (form, details, list) and event handlers.
 * Preserves complete backward compatibility with the existing functions:
 * renderDashboard, renderContactList, showToast, initContactManagerEvents, etc.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getAllContacts, getFilteredContacts, getContactById, addContact, updateContact, deleteContact, toggleFavouriteStatus, toggleContactStatus, clearAllContacts, exportContactsToCSV, importContactsFromCSV, addImportedContacts } from './contact-service.js';
import { calculateContactStatistics } from './statistics.js';
import { ContactImportExport } from './import-export.js';
// ========================================================
// 1. Application UI State
// ========================================================
let activeFilterOptions = {
    searchQuery: '',
    category: 'all',
    status: 'all',
    favouritesOnly: false,
    sortField: 'createdAt',
    sortOrder: 'desc'
};
let currentEditingId = null;
let currentDeletingId = null;
// ========================================================
// 2. DOM Elements Selection with Type Assertions
// ========================================================
// Dashboard Stats Counters
const statTotal = document.getElementById('statTotal');
const statActive = document.getElementById('statActive');
const statInactive = document.getElementById('statInactive');
const statFavourites = document.getElementById('statFavourites');
const statRecentlyAdded = document.getElementById('statRecentlyAdded');
// Category Pills
const categoryPillList = document.getElementById('categoryPillList');
// Search & Filter Controls
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const statusFilter = document.getElementById('statusFilter');
const favouritesFilterBtn = document.getElementById('favouritesFilterBtn');
const sortFieldSelect = document.getElementById('sortFieldSelect');
const sortOrderBtn = document.getElementById('sortOrderBtn');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
// Contact List & Empty States
const contactsTableBody = document.getElementById('contactsTableBody');
const contactsCardsContainer = document.getElementById('contactsCardsContainer');
const emptyStateContainer = document.getElementById('emptyStateContainer');
const noResultsContainer = document.getElementById('noResultsContainer');
const displayedCountText = document.getElementById('displayedCountText');
// Modals
const contactModal = document.getElementById('contactModal');
const modalTitle = document.getElementById('modalTitle');
const contactForm = document.getElementById('contactForm');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveContactBtn = document.getElementById('saveContactBtn');
const openAddContactBtn = document.getElementById('openAddContactBtn');
const emptyAddContactBtn = document.getElementById('emptyAddContactBtn');
// Contact Form Inputs
const inputContactId = document.getElementById('inputContactId');
const inputFullName = document.getElementById('inputFullName');
const inputPhone = document.getElementById('inputPhone');
const inputEmail = document.getElementById('inputEmail');
const inputAge = document.getElementById('inputAge');
const inputCompany = document.getElementById('inputCompany');
const inputJobTitle = document.getElementById('inputJobTitle');
const inputAddress = document.getElementById('inputAddress');
const selectCategory = document.getElementById('selectCategory');
const selectStatus = document.getElementById('selectStatus');
const checkFavourite = document.getElementById('checkFavourite');
const inputNotes = document.getElementById('inputNotes');
const inputTags = document.getElementById('inputTags');
const inputBirthday = document.getElementById('inputBirthday');
const inputReminder = document.getElementById('inputReminder');
// Form Validation Error Labels
const errFullName = document.getElementById('errFullName');
const errPhone = document.getElementById('errPhone');
const errEmail = document.getElementById('errEmail');
const errAge = document.getElementById('errAge');
// Details View Modal
const detailsModal = document.getElementById('detailsModal');
const closeDetailsBtn = document.getElementById('closeDetailsBtn');
const detailsBody = document.getElementById('detailsBody');
// Delete Confirm Modal
const deleteModal = document.getElementById('deleteModal');
const deleteContactName = document.getElementById('deleteContactName');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
// Clear All Confirm Modal
const clearAllBtn = document.getElementById('clearAllBtn');
const clearAllModal = document.getElementById('clearAllModal');
const cancelClearAllBtn = document.getElementById('cancelClearAllBtn');
const confirmClearAllBtn = document.getElementById('confirmClearAllBtn');
// Import / Export Buttons
const exportCsvBtn = document.getElementById('exportCsvBtn');
const csvFileInput = document.getElementById('csvFileInput');
const importCsvBtn = document.getElementById('importCsvBtn');
// Toast Container
const toastContainer = document.getElementById('toastContainer');
// ========================================================
// 3. UI Toast Notification System
// ========================================================
export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconSvg = type === 'success'
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
        : type === 'error'
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${escapeHtml(message)}</div>
  `;
    toastContainer === null || toastContainer === void 0 ? void 0 : toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('toast-show'), 10);
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
// ========================================================
// 4. Rendering Functions
// ========================================================
export function renderDashboard() {
    const allContacts = getAllContacts();
    const stats = calculateContactStatistics(allContacts);
    if (statTotal)
        statTotal.textContent = stats.total.toString();
    if (statActive)
        statActive.textContent = stats.active.toString();
    if (statInactive)
        statInactive.textContent = stats.inactive.toString();
    if (statFavourites)
        statFavourites.textContent = stats.favourites.toString();
    if (statRecentlyAdded)
        statRecentlyAdded.textContent = stats.recentlyAdded.toString();
    const categories = [
        'Work',
        'Clients',
        'Business',
        'Family',
        'Friends',
        'Other'
    ];
    if (categoryPillList) {
        categoryPillList.innerHTML = categories
            .map((cat) => {
            const count = stats.categoryCounts[cat] || 0;
            const isSelected = activeFilterOptions.category === cat;
            return `
          <button type="button" class="category-pill ${isSelected ? 'active' : ''}" data-category="${cat}">
            <span class="cat-pill-name">${cat}</span>
            <span class="cat-pill-count">${count}</span>
          </button>
        `;
        })
            .join('');
    }
}
export function getCategoryBadge(category) {
    const badgeMap = {
        Family: 'badge-family',
        Friends: 'badge-friends',
        Work: 'badge-work',
        Clients: 'badge-clients',
        Business: 'badge-business',
        Other: 'badge-other'
    };
    return `<span class="badge ${badgeMap[category]}">${category}</span>`;
}
export function getStatusBadge(status) {
    return status === 'active'
        ? `<span class="badge badge-active"><span class="status-dot dot-active"></span>Active</span>`
        : `<span class="badge badge-inactive"><span class="status-dot dot-inactive"></span>Inactive</span>`;
}
export function renderContactList() {
    const allContacts = getAllContacts();
    const filtered = getFilteredContacts(activeFilterOptions);
    if (displayedCountText) {
        displayedCountText.textContent = `${filtered.length} of ${allContacts.length} contacts displayed`;
    }
    if (allContacts.length === 0) {
        if (emptyStateContainer)
            emptyStateContainer.style.display = 'block';
        if (noResultsContainer)
            noResultsContainer.style.display = 'none';
        if (contactsTableBody)
            contactsTableBody.innerHTML = '';
        if (contactsCardsContainer)
            contactsCardsContainer.innerHTML = '';
        return;
    }
    if (emptyStateContainer)
        emptyStateContainer.style.display = 'none';
    if (filtered.length === 0) {
        if (noResultsContainer)
            noResultsContainer.style.display = 'block';
        if (contactsTableBody)
            contactsTableBody.innerHTML = '';
        if (contactsCardsContainer)
            contactsCardsContainer.innerHTML = '';
        return;
    }
    if (noResultsContainer)
        noResultsContainer.style.display = 'none';
    if (contactsTableBody) {
        contactsTableBody.innerHTML = filtered
            .map((c) => {
            const favClass = c.isFavourite ? 'fav-active' : 'fav-inactive';
            const favTitle = c.isFavourite ? 'Remove from favourites' : 'Add to favourites';
            return `
          <tr data-id="${c.id}">
            <td class="col-fav">
              <button class="action-icon-btn btn-fav ${favClass}" data-action="toggle-fav" data-id="${c.id}" title="${favTitle}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="${c.isFavourite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            </td>
            <td class="col-name">
              <div class="contact-name-cell">
                <div class="avatar-initials">${escapeHtml(getInitials(c.fullName))}</div>
                <div>
                  <button class="contact-name-link" data-action="view-details" data-id="${c.id}">
                    ${escapeHtml(c.fullName)}
                  </button>
                  ${c.jobTitle ? `<div class="sub-text">${escapeHtml(c.jobTitle)}</div>` : ''}
                </div>
              </div>
            </td>
            <td class="col-phone">
              <a href="tel:${escapeHtml(c.phoneNumber)}" class="contact-link">
                ${escapeHtml(c.phoneNumber)}
              </a>
            </td>
            <td class="col-email">
              ${c.email
                ? `<a href="mailto:${escapeHtml(c.email)}" class="contact-link">${escapeHtml(c.email)}</a>`
                : `<span class="text-muted">-</span>`}
            </td>
            <td class="col-company">
              ${c.company ? escapeHtml(c.company) : `<span class="text-muted">-</span>`}
            </td>
            <td class="col-category">
              ${getCategoryBadge(c.category)}
            </td>
            <td class="col-status">
              <button class="status-toggle-btn" data-action="toggle-status" data-id="${c.id}" title="Click to toggle status">
                ${getStatusBadge(c.status)}
              </button>
            </td>
            <td class="col-actions">
              <div class="table-actions">
                <button class="action-btn" data-action="view-details" data-id="${c.id}" title="View Details">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button class="action-btn" data-action="edit" data-id="${c.id}" title="Edit Contact">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="action-btn text-danger" data-action="delete" data-id="${c.id}" title="Delete Contact">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        `;
        })
            .join('');
    }
    if (contactsCardsContainer) {
        contactsCardsContainer.innerHTML = filtered
            .map((c) => {
            var _a, _b, _c, _d;
            const isFav = c.isFavourite;
            const favTitle = isFav ? 'Remove from favorites' : 'Add to favorites';
            // Avatar: If avatarUrl is present use it, otherwise fall back to clean avatar graphic
            const avatarContent = c.avatarUrl
                ? `<img src="${escapeHtml(c.avatarUrl)}" alt="${escapeHtml(c.fullName)}" class="card-avatar-img">`
                : `<span>${escapeHtml(getInitials(c.fullName))}</span>`;
            return `
          <div class="contact-card-reference" data-id="${c.id}">
            <!-- Top Right Star Button -->
            <button class="card-fav-btn ${isFav ? 'is-fav' : ''}" data-action="toggle-fav" data-id="${c.id}" title="${favTitle}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>

            <!-- Circular Avatar -->
            <div class="card-avatar-wrap" data-action="view-details" data-id="${c.id}">
              ${avatarContent}
            </div>

            <!-- Name -->
            <div class="card-contact-name" data-action="view-details" data-id="${c.id}">
              ${escapeHtml(c.fullName)}
            </div>

            <!-- Job Title / Company -->
            <div class="card-job-title">
              ${escapeHtml((_a = c.jobTitle) !== null && _a !== void 0 ? _a : (c.company ? c.company : 'Contact'))}
            </div>

            <!-- Email Link -->
            <a href="mailto:${escapeHtml((_b = c.email) !== null && _b !== void 0 ? _b : '')}" class="card-email-link" title="${escapeHtml((_c = c.email) !== null && _c !== void 0 ? _c : '')}">
              ${escapeHtml((_d = c.email) !== null && _d !== void 0 ? _d : c.phoneNumber)}
            </a>

            <!-- Quick Action Buttons -->
            <div class="card-quick-actions">
              <button class="quick-action-btn" data-action="view-details" data-id="${c.id}">View</button>
              <button class="quick-action-btn" data-action="edit" data-id="${c.id}">Edit</button>
              <button class="quick-action-btn btn-delete" data-action="delete" data-id="${c.id}">Delete</button>
            </div>
          </div>
        `;
        })
            .join('');
    }
}
export function getInitials(name) {
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
// ========================================================
// 5. Modal Controllers
// ========================================================
function resetForm() {
    if (contactForm)
        contactForm.reset();
    if (inputContactId)
        inputContactId.value = '';
    currentEditingId = null;
    if (errFullName)
        errFullName.textContent = '';
    if (errPhone)
        errPhone.textContent = '';
    if (errEmail)
        errEmail.textContent = '';
    if (errAge)
        errAge.textContent = '';
    inputFullName === null || inputFullName === void 0 ? void 0 : inputFullName.classList.remove('input-error');
    inputPhone === null || inputPhone === void 0 ? void 0 : inputPhone.classList.remove('input-error');
    inputEmail === null || inputEmail === void 0 ? void 0 : inputEmail.classList.remove('input-error');
    inputAge === null || inputAge === void 0 ? void 0 : inputAge.classList.remove('input-error');
}
export function openAddContactModal() {
    resetForm();
    if (modalTitle)
        modalTitle.textContent = 'Add New Contact';
    if (saveContactBtn)
        saveContactBtn.textContent = 'Save Contact';
    contactModal === null || contactModal === void 0 ? void 0 : contactModal.classList.add('modal-open');
    inputFullName === null || inputFullName === void 0 ? void 0 : inputFullName.focus();
}
export function openEditContactModal(id) {
    var _a, _b, _c, _d, _e, _f, _g;
    const contact = getContactById(id);
    if (!contact) {
        showToast('Contact not found.', 'error');
        return;
    }
    resetForm();
    currentEditingId = contact.id;
    if (modalTitle)
        modalTitle.textContent = 'Edit Contact';
    if (saveContactBtn)
        saveContactBtn.textContent = 'Save Changes';
    if (inputContactId)
        inputContactId.value = contact.id;
    if (inputFullName)
        inputFullName.value = contact.fullName;
    if (inputPhone)
        inputPhone.value = contact.phoneNumber;
    if (inputEmail)
        inputEmail.value = (_a = contact.email) !== null && _a !== void 0 ? _a : '';
    if (inputAge)
        inputAge.value = contact.age !== undefined ? contact.age.toString() : '';
    if (inputCompany)
        inputCompany.value = (_b = contact.company) !== null && _b !== void 0 ? _b : '';
    if (inputJobTitle)
        inputJobTitle.value = (_c = contact.jobTitle) !== null && _c !== void 0 ? _c : '';
    if (inputAddress)
        inputAddress.value = (_d = contact.address) !== null && _d !== void 0 ? _d : '';
    if (selectCategory)
        selectCategory.value = contact.category;
    if (selectStatus)
        selectStatus.value = contact.status;
    if (checkFavourite)
        checkFavourite.checked = contact.isFavourite;
    if (inputNotes)
        inputNotes.value = (_e = contact.notes) !== null && _e !== void 0 ? _e : '';
    if (inputTags)
        inputTags.value = contact.tags ? contact.tags.join(', ') : '';
    if (inputBirthday)
        inputBirthday.value = (_f = contact.birthday) !== null && _f !== void 0 ? _f : '';
    if (inputReminder)
        inputReminder.value = (_g = contact.reminderDate) !== null && _g !== void 0 ? _g : '';
    contactModal === null || contactModal === void 0 ? void 0 : contactModal.classList.add('modal-open');
    inputFullName === null || inputFullName === void 0 ? void 0 : inputFullName.focus();
}
export function closeContactModal() {
    contactModal === null || contactModal === void 0 ? void 0 : contactModal.classList.remove('modal-open');
    resetForm();
}
export function openDetailsModal(id) {
    var _a;
    const contact = getContactById(id);
    if (!contact) {
        showToast('Contact not found.', 'error');
        return;
    }
    const createdDate = new Date(contact.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const updatedDate = contact.updatedAt
        ? new Date(contact.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : null;
    if (detailsBody) {
        detailsBody.innerHTML = `
      <div class="details-header-card">
        <div class="avatar-large">${escapeHtml(getInitials(contact.fullName))}</div>
        <div>
          <h3 class="details-name">${escapeHtml(contact.fullName)}</h3>
          <p class="details-job">${escapeHtml((_a = contact.jobTitle) !== null && _a !== void 0 ? _a : 'No job title specified')} ${contact.company ? `• <strong>${escapeHtml(contact.company)}</strong>` : ''}</p>
          <div class="details-tags">
            ${getCategoryBadge(contact.category)}
            ${getStatusBadge(contact.status)}
            ${contact.isFavourite
            ? `<span class="badge badge-fav"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Favourite</span>`
            : ''}
          </div>
        </div>
      </div>

      <div class="details-info-grid">
        <div class="info-block">
          <span class="info-label">Phone Number</span>
          <a href="tel:${escapeHtml(contact.phoneNumber)}" class="info-value link-highlight">
            ${escapeHtml(contact.phoneNumber)}
          </a>
        </div>

        <div class="info-block">
          <span class="info-label">Email Address</span>
          ${contact.email
            ? `<a href="mailto:${escapeHtml(contact.email)}" class="info-value link-highlight">${escapeHtml(contact.email)}</a>`
            : `<span class="info-value text-muted">Not provided</span>`}
        </div>

        <div class="info-block">
          <span class="info-label">Age</span>
          <span class="info-value">${contact.age !== undefined ? `${contact.age} years` : 'Not provided'}</span>
        </div>

        <div class="info-block">
          <span class="info-label">Physical Address</span>
          <span class="info-value">${contact.address ? escapeHtml(contact.address) : 'Not provided'}</span>
        </div>

        ${contact.tags && contact.tags.length > 0
            ? `
          <div class="info-block col-span-2">
            <span class="info-label">Tags / Groups</span>
            <div class="info-tags" style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;">
              ${contact.tags.map((t) => `<span class="badge" style="background: rgba(59,130,246,0.1); color: #3b82f6; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
        `
            : ''}

        ${contact.birthday
            ? `
          <div class="info-block">
            <span class="info-label">Birthday 🎂</span>
            <span class="info-value">${escapeHtml(contact.birthday)}</span>
          </div>
        `
            : ''}

        ${contact.reminderDate
            ? `
          <div class="info-block">
            <span class="info-label">Follow-up Reminder ⏰</span>
            <span class="info-value" style="color: #f59e0b; font-weight: 600;">${escapeHtml(contact.reminderDate)}</span>
          </div>
        `
            : ''}

        <div class="info-block col-span-2">
          <span class="info-label">Notes</span>
          <div class="info-notes">${contact.notes ? escapeHtml(contact.notes) : 'No notes recorded for this contact.'}</div>
        </div>

        <div class="info-block">
          <span class="info-label">Date Added</span>
          <span class="info-meta">${createdDate}</span>
        </div>

        ${updatedDate
            ? `
          <div class="info-block">
            <span class="info-label">Last Updated</span>
            <span class="info-meta">${updatedDate}</span>
          </div>
        `
            : ''}
      </div>

      <div class="details-footer-actions">
        <button class="btn btn-primary" id="detailsEditBtn" data-id="${contact.id}">Edit Contact</button>
        <button class="btn btn-outline" id="detailsToggleFavBtn" data-id="${contact.id}">
          ${contact.isFavourite ? 'Unmark Favourite' : 'Mark Favourite'}
        </button>
        <button class="btn btn-danger-outline" id="detailsDeleteBtn" data-id="${contact.id}">Delete</button>
      </div>
    `;
        const editBtn = document.getElementById('detailsEditBtn');
        const toggleFavBtn = document.getElementById('detailsToggleFavBtn');
        const delBtn = document.getElementById('detailsDeleteBtn');
        editBtn === null || editBtn === void 0 ? void 0 : editBtn.addEventListener('click', () => {
            closeDetailsModal();
            openEditContactModal(contact.id);
        });
        toggleFavBtn === null || toggleFavBtn === void 0 ? void 0 : toggleFavBtn.addEventListener('click', () => {
            toggleFavouriteStatus(contact.id);
            renderDashboard();
            renderContactList();
            openDetailsModal(contact.id);
            showToast(`Updated favourite status for ${contact.fullName}`, 'info');
        });
        delBtn === null || delBtn === void 0 ? void 0 : delBtn.addEventListener('click', () => {
            closeDetailsModal();
            openDeleteModal(contact.id);
        });
    }
    detailsModal === null || detailsModal === void 0 ? void 0 : detailsModal.classList.add('modal-open');
}
export function closeDetailsModal() {
    detailsModal === null || detailsModal === void 0 ? void 0 : detailsModal.classList.remove('modal-open');
}
export function openDeleteModal(id) {
    const contact = getContactById(id);
    if (!contact) {
        showToast('Contact not found.', 'error');
        return;
    }
    currentDeletingId = id;
    if (deleteContactName)
        deleteContactName.textContent = contact.fullName;
    deleteModal === null || deleteModal === void 0 ? void 0 : deleteModal.classList.add('modal-open');
}
export function closeDeleteModal() {
    deleteModal === null || deleteModal === void 0 ? void 0 : deleteModal.classList.remove('modal-open');
    currentDeletingId = null;
}
export function openClearAllModal() {
    clearAllModal === null || clearAllModal === void 0 ? void 0 : clearAllModal.classList.add('modal-open');
}
export function closeClearAllModal() {
    clearAllModal === null || clearAllModal === void 0 ? void 0 : clearAllModal.classList.remove('modal-open');
}
// ========================================================
// 6. Form Submission & Event Handlers
// ========================================================
function handleContactFormSubmit(e) {
    var _a, _b;
    e.preventDefault();
    const formData = {
        fullName: inputFullName ? inputFullName.value : '',
        phoneNumber: inputPhone ? inputPhone.value : '',
        email: inputEmail ? inputEmail.value : '',
        age: inputAge ? inputAge.value : '',
        company: inputCompany ? inputCompany.value : '',
        jobTitle: inputJobTitle ? inputJobTitle.value : '',
        address: inputAddress ? inputAddress.value : '',
        category: (selectCategory ? selectCategory.value : 'Other'),
        status: (selectStatus ? selectStatus.value : 'active'),
        isFavourite: checkFavourite ? checkFavourite.checked : false,
        notes: inputNotes ? inputNotes.value : '',
        tags: inputTags ? inputTags.value : '',
        birthday: inputBirthday ? inputBirthday.value : '',
        reminderDate: inputReminder ? inputReminder.value : ''
    };
    if (currentEditingId) {
        const result = updateContact(currentEditingId, formData);
        if (!result.success) {
            displayFormErrors(result.validation.errors);
            return;
        }
        showToast(`Contact "${(_a = result.contact) === null || _a === void 0 ? void 0 : _a.fullName}" updated successfully!`, 'success');
    }
    else {
        const result = addContact(formData);
        if (!result.success) {
            displayFormErrors(result.validation.errors);
            return;
        }
        showToast(`Contact "${(_b = result.contact) === null || _b === void 0 ? void 0 : _b.fullName}" created successfully!`, 'success');
    }
    closeContactModal();
    renderDashboard();
    renderContactList();
}
function displayFormErrors(errors) {
    var _a, _b, _c, _d;
    if (errFullName)
        errFullName.textContent = (_a = errors.fullName) !== null && _a !== void 0 ? _a : '';
    inputFullName === null || inputFullName === void 0 ? void 0 : inputFullName.classList.toggle('input-error', !!errors.fullName);
    if (errPhone)
        errPhone.textContent = (_b = errors.phoneNumber) !== null && _b !== void 0 ? _b : '';
    inputPhone === null || inputPhone === void 0 ? void 0 : inputPhone.classList.toggle('input-error', !!errors.phoneNumber);
    if (errEmail)
        errEmail.textContent = (_c = errors.email) !== null && _c !== void 0 ? _c : '';
    inputEmail === null || inputEmail === void 0 ? void 0 : inputEmail.classList.toggle('input-error', !!errors.email);
    if (errAge)
        errAge.textContent = (_d = errors.age) !== null && _d !== void 0 ? _d : '';
    inputAge === null || inputAge === void 0 ? void 0 : inputAge.classList.toggle('input-error', !!errors.age);
    if (errors.general) {
        showToast(errors.general, 'error');
    }
}
function handleListAction(e) {
    const target = e.target;
    const actionBtn = target.closest('[data-action]');
    if (!actionBtn)
        return;
    const action = actionBtn.getAttribute('data-action');
    const id = actionBtn.getAttribute('data-id');
    if (!id)
        return;
    if (action === 'toggle-fav') {
        const isFav = toggleFavouriteStatus(id);
        renderDashboard();
        renderContactList();
        showToast(isFav ? 'Marked as favourite ⭐' : 'Removed from favourites', 'info');
    }
    else if (action === 'toggle-status') {
        const newStatus = toggleContactStatus(id);
        renderDashboard();
        renderContactList();
        showToast(`Contact status set to ${newStatus}`, 'info');
    }
    else if (action === 'view-details') {
        openDetailsModal(id);
    }
    else if (action === 'edit') {
        openEditContactModal(id);
    }
    else if (action === 'delete') {
        openDeleteModal(id);
    }
}
// ========================================================
// 7. Event Listeners Initialization
// ========================================================
export function initContactManagerEvents() {
    openAddContactBtn === null || openAddContactBtn === void 0 ? void 0 : openAddContactBtn.addEventListener('click', openAddContactModal);
    emptyAddContactBtn === null || emptyAddContactBtn === void 0 ? void 0 : emptyAddContactBtn.addEventListener('click', openAddContactModal);
    cancelModalBtn === null || cancelModalBtn === void 0 ? void 0 : cancelModalBtn.addEventListener('click', closeContactModal);
    closeModalBtn === null || closeModalBtn === void 0 ? void 0 : closeModalBtn.addEventListener('click', closeContactModal);
    closeDetailsBtn === null || closeDetailsBtn === void 0 ? void 0 : closeDetailsBtn.addEventListener('click', closeDetailsModal);
    cancelDeleteBtn === null || cancelDeleteBtn === void 0 ? void 0 : cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    cancelClearAllBtn === null || cancelClearAllBtn === void 0 ? void 0 : cancelClearAllBtn.addEventListener('click', closeClearAllModal);
    contactForm === null || contactForm === void 0 ? void 0 : contactForm.addEventListener('submit', handleContactFormSubmit);
    contactsTableBody === null || contactsTableBody === void 0 ? void 0 : contactsTableBody.addEventListener('click', handleListAction);
    contactsCardsContainer === null || contactsCardsContainer === void 0 ? void 0 : contactsCardsContainer.addEventListener('click', handleListAction);
    searchInput === null || searchInput === void 0 ? void 0 : searchInput.addEventListener('input', () => {
        activeFilterOptions.searchQuery = searchInput.value;
        renderContactList();
    });
    categoryFilter === null || categoryFilter === void 0 ? void 0 : categoryFilter.addEventListener('change', () => {
        activeFilterOptions.category = categoryFilter.value;
        renderDashboard();
        renderContactList();
    });
    statusFilter === null || statusFilter === void 0 ? void 0 : statusFilter.addEventListener('change', () => {
        activeFilterOptions.status = statusFilter.value;
        renderContactList();
    });
    favouritesFilterBtn === null || favouritesFilterBtn === void 0 ? void 0 : favouritesFilterBtn.addEventListener('click', () => {
        activeFilterOptions.favouritesOnly = !activeFilterOptions.favouritesOnly;
        favouritesFilterBtn.classList.toggle('active', activeFilterOptions.favouritesOnly);
        renderContactList();
    });
    sortFieldSelect === null || sortFieldSelect === void 0 ? void 0 : sortFieldSelect.addEventListener('change', () => {
        activeFilterOptions.sortField = sortFieldSelect.value;
        renderContactList();
    });
    sortOrderBtn === null || sortOrderBtn === void 0 ? void 0 : sortOrderBtn.addEventListener('click', () => {
        const isAsc = activeFilterOptions.sortOrder === 'asc';
        activeFilterOptions.sortOrder = isAsc ? 'desc' : 'asc';
        sortOrderBtn.setAttribute('data-order', activeFilterOptions.sortOrder);
        sortOrderBtn.title = isAsc
            ? 'Order: Descending (Z-A / Newest)'
            : 'Order: Ascending (A-Z / Oldest)';
        sortOrderBtn.innerHTML = isAsc
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14m-7-7l7 7 7-7"/></svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5m-7 7l7-7 7 7"/></svg>`;
        renderContactList();
    });
    resetFiltersBtn === null || resetFiltersBtn === void 0 ? void 0 : resetFiltersBtn.addEventListener('click', () => {
        activeFilterOptions = {
            searchQuery: '',
            category: 'all',
            status: 'all',
            favouritesOnly: false,
            sortField: 'createdAt',
            sortOrder: 'desc'
        };
        if (searchInput)
            searchInput.value = '';
        if (categoryFilter)
            categoryFilter.value = 'all';
        if (statusFilter)
            statusFilter.value = 'all';
        favouritesFilterBtn === null || favouritesFilterBtn === void 0 ? void 0 : favouritesFilterBtn.classList.remove('active');
        if (sortFieldSelect)
            sortFieldSelect.value = 'createdAt';
        sortOrderBtn === null || sortOrderBtn === void 0 ? void 0 : sortOrderBtn.setAttribute('data-order', 'desc');
        renderDashboard();
        renderContactList();
        showToast('Filters reset to default.', 'info');
    });
    categoryPillList === null || categoryPillList === void 0 ? void 0 : categoryPillList.addEventListener('click', (e) => {
        var _a;
        const target = e.target;
        const pill = target.closest('.category-pill');
        if (!pill)
            return;
        const clickedCat = (_a = pill.getAttribute('data-category')) !== null && _a !== void 0 ? _a : 'all';
        if (activeFilterOptions.category === clickedCat) {
            activeFilterOptions.category = 'all';
            if (categoryFilter)
                categoryFilter.value = 'all';
        }
        else {
            activeFilterOptions.category = clickedCat;
            if (categoryFilter)
                categoryFilter.value = clickedCat;
        }
        renderDashboard();
        renderContactList();
    });
    confirmDeleteBtn === null || confirmDeleteBtn === void 0 ? void 0 : confirmDeleteBtn.addEventListener('click', () => {
        if (currentDeletingId) {
            const deleted = deleteContact(currentDeletingId);
            closeDeleteModal();
            if (deleted) {
                renderDashboard();
                renderContactList();
                showToast('Contact deleted successfully.', 'warning');
            }
        }
    });
    clearAllBtn === null || clearAllBtn === void 0 ? void 0 : clearAllBtn.addEventListener('click', openClearAllModal);
    confirmClearAllBtn === null || confirmClearAllBtn === void 0 ? void 0 : confirmClearAllBtn.addEventListener('click', () => {
        clearAllContacts();
        closeClearAllModal();
        renderDashboard();
        renderContactList();
        showToast('All contacts have been removed.', 'warning');
    });
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    exportJsonBtn === null || exportJsonBtn === void 0 ? void 0 : exportJsonBtn.addEventListener('click', () => {
        const all = getAllContacts();
        if (all.length === 0) {
            showToast('No contacts to export.', 'warning');
            return;
        }
        try {
            ContactImportExport.exportToJSON(all);
            showToast('Contacts exported to JSON successfully!', 'success');
        }
        catch (err) {
            if (err instanceof Error) {
                showToast(err.message, 'error');
            }
        }
    });
    const jsonFileInput = document.getElementById('jsonFileInput');
    const importJsonBtn = document.getElementById('importJsonBtn');
    importJsonBtn === null || importJsonBtn === void 0 ? void 0 : importJsonBtn.addEventListener('click', () => {
        if (jsonFileInput) {
            jsonFileInput.value = '';
            jsonFileInput.click();
        }
    });
    jsonFileInput === null || jsonFileInput === void 0 ? void 0 : jsonFileInput.addEventListener('change', () => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const file = (_a = jsonFileInput.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        try {
            const all = getAllContacts();
            const { validContacts, summary } = yield ContactImportExport.parseAndValidateJSON(file, all);
            if (summary.success) {
                addImportedContacts(validContacts);
                renderDashboard();
                renderContactList();
                showToast(`Imported ${summary.importedCount} contacts (${summary.skippedCount} skipped/duplicates).`, 'success');
            }
            else {
                showToast(`Import failed: ${summary.errors[0] || 'No valid contacts found.'}`, 'error');
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Error reading JSON file.';
            showToast(msg, 'error');
        }
    }));
    exportCsvBtn === null || exportCsvBtn === void 0 ? void 0 : exportCsvBtn.addEventListener('click', () => {
        const csvData = exportContactsToCSV();
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', url);
        downloadAnchor.setAttribute('download', `contacts-backup-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        URL.revokeObjectURL(url);
        showToast('Contacts exported to CSV successfully!', 'success');
    });
    importCsvBtn === null || importCsvBtn === void 0 ? void 0 : importCsvBtn.addEventListener('click', () => {
        if (csvFileInput) {
            csvFileInput.value = '';
            csvFileInput.click();
        }
    });
    csvFileInput === null || csvFileInput === void 0 ? void 0 : csvFileInput.addEventListener('change', () => {
        var _a;
        const file = (_a = csvFileInput.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            var _a;
            const text = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
            if (!text) {
                showToast('Unable to read CSV file content.', 'error');
                return;
            }
            const result = importContactsFromCSV(text);
            if (result.success) {
                renderDashboard();
                renderContactList();
                showToast(`Imported ${result.importedCount} contacts (${result.skippedCount} skipped).`, 'success');
            }
            else {
                showToast(`Import failed: ${result.errors[0] || 'Unknown format error'}`, 'error');
            }
        };
        reader.onerror = () => {
            showToast('Error reading the selected file.', 'error');
        };
        reader.readAsText(file);
    });
    [contactModal, detailsModal, deleteModal, clearAllModal].forEach((modal) => {
        modal === null || modal === void 0 ? void 0 : modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('modal-open');
            }
        });
    });
    // --- View Switching (Sidebar Navigation) ---
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const contactsViewSection = document.getElementById('contactsViewSection');
    const groupsViewSection = document.getElementById('groupsViewSection');
    const importExportViewSection = document.getElementById('importExportViewSection');
    const settingsViewSection = document.getElementById('settingsViewSection');
    const pageTitleText = document.getElementById('pageTitleText');
    const pageSubtitleText = document.getElementById('pageSubtitleText');
    const groupsCardsContainer = document.getElementById('groupsCardsContainer');
    function renderGroupsView() {
        if (!groupsCardsContainer)
            return;
        const all = getAllContacts();
        const categories = [
            'Work',
            'Clients',
            'Business',
            'Family',
            'Friends',
            'Other'
        ];
        const icons = {
            Work: '💼',
            Clients: '👥',
            Business: '🏢',
            Family: '🏡',
            Friends: '🎉',
            Other: '📁'
        };
        groupsCardsContainer.innerHTML = categories
            .map((cat) => {
            const count = all.filter((c) => c.category === cat).length;
            return `
          <div class="group-stat-card" data-category="${cat}">
            <div class="group-icon-circle badge-${cat.toLowerCase()}">
              ${icons[cat]}
            </div>
            <div class="group-stat-info">
              <h4>${cat}</h4>
              <p>${count} ${count === 1 ? 'contact' : 'contacts'}</p>
            </div>
          </div>
        `;
        })
            .join('');
    }
    groupsCardsContainer === null || groupsCardsContainer === void 0 ? void 0 : groupsCardsContainer.addEventListener('click', (e) => {
        const target = e.target;
        const card = target.closest('.group-stat-card');
        if (!card)
            return;
        const cat = card.getAttribute('data-category');
        if (cat && categoryFilter) {
            categoryFilter.value = cat;
            activeFilterOptions.category = cat;
            switchView('contacts');
            renderDashboard();
            renderContactList();
        }
    });
    function switchView(viewName) {
        navItems.forEach((btn) => {
            if (btn.getAttribute('data-view') === viewName) {
                btn.classList.add('active');
            }
            else {
                btn.classList.remove('active');
            }
        });
        if (contactsViewSection)
            contactsViewSection.style.display = 'none';
        if (groupsViewSection)
            groupsViewSection.style.display = 'none';
        if (importExportViewSection)
            importExportViewSection.style.display = 'none';
        if (settingsViewSection)
            settingsViewSection.style.display = 'none';
        if (viewName === 'contacts') {
            if (contactsViewSection)
                contactsViewSection.style.display = 'flex';
            if (pageTitleText)
                pageTitleText.textContent = 'Contacts';
            if (pageSubtitleText)
                pageSubtitleText.textContent = 'Manage your contacts efficiently';
            activeFilterOptions.favouritesOnly = false;
            renderContactList();
        }
        else if (viewName === 'favorites') {
            if (contactsViewSection)
                contactsViewSection.style.display = 'flex';
            if (pageTitleText)
                pageTitleText.textContent = 'Favorites';
            if (pageSubtitleText)
                pageSubtitleText.textContent = 'Quick access to your starred contacts';
            activeFilterOptions.favouritesOnly = true;
            renderContactList();
        }
        else if (viewName === 'groups') {
            if (groupsViewSection)
                groupsViewSection.style.display = 'block';
            if (pageTitleText)
                pageTitleText.textContent = 'Groups';
            if (pageSubtitleText)
                pageSubtitleText.textContent = 'Segment contacts by categories and teams';
            renderGroupsView();
        }
        else if (viewName === 'import-export') {
            if (importExportViewSection)
                importExportViewSection.style.display = 'block';
            if (pageTitleText)
                pageTitleText.textContent = 'Import / Export';
            if (pageSubtitleText)
                pageSubtitleText.textContent = 'Backup, export or restore your contacts directory';
        }
        else if (viewName === 'settings') {
            if (settingsViewSection)
                settingsViewSection.style.display = 'block';
            if (pageTitleText)
                pageTitleText.textContent = 'Settings';
            if (pageSubtitleText)
                pageSubtitleText.textContent = 'Application preferences and system management';
        }
    }
    navItems.forEach((btn) => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            if (view)
                switchView(view);
        });
    });
    // --- Grid View vs List View Toggle ---
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const contactsCardsLayout = document.getElementById('contactsCardsContainer');
    const contactsTableLayout = document.getElementById('contactsTableContainer');
    gridViewBtn === null || gridViewBtn === void 0 ? void 0 : gridViewBtn.addEventListener('click', () => {
        gridViewBtn.classList.add('active');
        listViewBtn === null || listViewBtn === void 0 ? void 0 : listViewBtn.classList.remove('active');
        if (contactsCardsLayout)
            contactsCardsLayout.style.display = 'grid';
        if (contactsTableLayout)
            contactsTableLayout.style.display = 'none';
    });
    listViewBtn === null || listViewBtn === void 0 ? void 0 : listViewBtn.addEventListener('click', () => {
        listViewBtn.classList.add('active');
        gridViewBtn === null || gridViewBtn === void 0 ? void 0 : gridViewBtn.classList.remove('active');
        if (contactsCardsLayout)
            contactsCardsLayout.style.display = 'none';
        if (contactsTableLayout)
            contactsTableLayout.style.display = 'block';
    });
    // --- In-App Help Modal ---
    const helpModal = document.getElementById('helpModal');
    const openHelpModalBtn = document.getElementById('openHelpModalBtn');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    const gotItHelpBtn = document.getElementById('gotItHelpBtn');
    openHelpModalBtn === null || openHelpModalBtn === void 0 ? void 0 : openHelpModalBtn.addEventListener('click', () => {
        helpModal === null || helpModal === void 0 ? void 0 : helpModal.classList.add('modal-open');
    });
    closeHelpBtn === null || closeHelpBtn === void 0 ? void 0 : closeHelpBtn.addEventListener('click', () => {
        helpModal === null || helpModal === void 0 ? void 0 : helpModal.classList.remove('modal-open');
    });
    gotItHelpBtn === null || gotItHelpBtn === void 0 ? void 0 : gotItHelpBtn.addEventListener('click', () => {
        helpModal === null || helpModal === void 0 ? void 0 : helpModal.classList.remove('modal-open');
    });
    helpModal === null || helpModal === void 0 ? void 0 : helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.classList.remove('modal-open');
        }
    });
}
