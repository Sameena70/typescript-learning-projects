/**
 * contact-details.ts
 *
 * Dedicated UI component managing contact details viewing modal and activity logging.
 */
export function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
export class ContactDetailsUI {
    constructor() {
        var _a;
        this.currentContact = null;
        this.viewModal = document.getElementById('viewModal');
        this.viewModalTitle = document.getElementById('viewModalTitle');
        this.viewDetailsBody = document.getElementById('viewDetailsBody');
        this.closeViewModalBtn = document.getElementById('closeViewModalBtn');
        (_a = this.closeViewModalBtn) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => this.closeModal());
    }
    openModal(contact, onAddActivity) {
        this.currentContact = contact;
        if (this.viewModal) {
            this.viewModal.classList.add('active');
        }
        if (this.viewModalTitle) {
            this.viewModalTitle.textContent = contact.fullName;
        }
        this.renderDetails(contact, onAddActivity);
    }
    closeModal() {
        if (this.viewModal) {
            this.viewModal.classList.remove('active');
        }
        this.currentContact = null;
    }
    renderDetails(contact, onAddActivity) {
        if (!this.viewDetailsBody)
            return;
        const tagsHtml = contact.tags && contact.tags.length > 0
            ? contact.tags.map((t) => `<span class="badge badge-tag">${escapeHTML(t)}</span>`).join(' ')
            : '<span class="text-muted">None</span>';
        const activitiesHtml = contact.activities && contact.activities.length > 0
            ? contact.activities
                .map((act) => {
                const icon = act.type === 'call'
                    ? '📞'
                    : act.type === 'email'
                        ? '✉️'
                        : act.type === 'meeting'
                            ? '🤝'
                            : '📝';
                return `
                <div class="activity-item">
                  <div class="activity-header">
                    <span class="activity-icon">${icon}</span>
                    <strong class="activity-type">${escapeHTML(act.type.toUpperCase())}</strong>
                    <span class="activity-date text-muted">${new Date(act.date).toLocaleDateString()}</span>
                  </div>
                  <div class="activity-notes">${escapeHTML(act.notes)}</div>
                </div>
              `;
            })
                .join('')
            : '<p class="text-muted">No interactions recorded yet.</p>';
        this.viewDetailsBody.innerHTML = `
      <div class="view-details-grid">
        <div class="detail-row">
          <span class="detail-label">Phone:</span>
          <span class="detail-value"><strong>${escapeHTML(contact.phoneNumber)}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${contact.email ? `<a href="mailto:${escapeHTML(contact.email)}">${escapeHTML(contact.email)}</a>` : '<span class="text-muted">N/A</span>'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Category:</span>
          <span class="detail-value"><span class="badge badge-cat badge-${contact.category.toLowerCase()}">${escapeHTML(contact.category)}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value"><span class="badge badge-${contact.status}">${escapeHTML(contact.status)}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Company:</span>
          <span class="detail-value">${escapeHTML(contact.company || 'N/A')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Job Title:</span>
          <span class="detail-value">${escapeHTML(contact.jobTitle || 'N/A')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Age:</span>
          <span class="detail-value">${contact.age !== undefined ? contact.age : '<span class="text-muted">N/A</span>'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Address:</span>
          <span class="detail-value">${escapeHTML(contact.address || 'N/A')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Birthday:</span>
          <span class="detail-value">${escapeHTML(contact.birthday || 'N/A')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Follow-up Reminder:</span>
          <span class="detail-value">${contact.reminderDate ? `<span class="reminder-flag">⏰ ${escapeHTML(contact.reminderDate)}</span>` : '<span class="text-muted">None</span>'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tags:</span>
          <span class="detail-value">${tagsHtml}</span>
        </div>
        <div class="detail-row full-width">
          <span class="detail-label">Notes:</span>
          <div class="detail-notes">${escapeHTML(contact.notes || 'No notes.')}</div>
        </div>
      </div>

      <hr class="modal-divider">

      <div class="activities-section">
        <div class="section-title-row">
          <h4>Interaction History</h4>
        </div>

        <form id="addActivityForm" class="add-activity-form">
          <div class="form-row">
            <div class="form-group flex-1">
              <label for="activityTypeSelect">Type</label>
              <select id="activityTypeSelect" class="form-control" required>
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="note">Note</option>
              </select>
            </div>
            <div class="form-group flex-1">
              <label for="activityDateInput">Date</label>
              <input type="date" id="activityDateInput" class="form-control" value="${new Date().toISOString().substring(0, 10)}" required>
            </div>
          </div>
          <div class="form-group">
            <label for="activityNotesInput">Interaction Notes</label>
            <input type="text" id="activityNotesInput" class="form-control" placeholder="Brief summary of interaction..." required>
          </div>
          <button type="submit" class="btn btn-secondary btn-sm">+ Log Activity</button>
        </form>

        <div class="activities-timeline">
          ${activitiesHtml}
        </div>
      </div>
    `;
        const activityForm = this.viewDetailsBody.querySelector('#addActivityForm');
        activityForm === null || activityForm === void 0 ? void 0 : activityForm.addEventListener('submit', (e) => {
            var _a, _b, _c;
            e.preventDefault();
            const typeSelect = (_a = this.viewDetailsBody) === null || _a === void 0 ? void 0 : _a.querySelector('#activityTypeSelect');
            const dateInput = (_b = this.viewDetailsBody) === null || _b === void 0 ? void 0 : _b.querySelector('#activityDateInput');
            const notesInput = (_c = this.viewDetailsBody) === null || _c === void 0 ? void 0 : _c.querySelector('#activityNotesInput');
            if (typeSelect && dateInput && notesInput && notesInput.value.trim().length > 0) {
                onAddActivity(contact.id, {
                    type: typeSelect.value,
                    date: dateInput.value,
                    notes: notesInput.value.trim()
                });
            }
        });
    }
}
