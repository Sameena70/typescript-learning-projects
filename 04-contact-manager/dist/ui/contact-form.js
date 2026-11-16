/**
 * contact-form.ts
 *
 * Dedicated UI component managing contact modal, input elements, form submission, and error display.
 */
export class ContactFormUI {
    constructor() {
        this.contactModal = document.getElementById('contactModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.contactForm = document.getElementById('contactForm');
        this.inputContactId = document.getElementById('inputContactId');
        this.inputFullName = document.getElementById('inputFullName');
        this.inputPhone = document.getElementById('inputPhone');
        this.inputEmail = document.getElementById('inputEmail');
        this.inputAge = document.getElementById('inputAge');
        this.inputCompany = document.getElementById('inputCompany');
        this.inputJobTitle = document.getElementById('inputJobTitle');
        this.inputAddress = document.getElementById('inputAddress');
        this.selectCategory = document.getElementById('selectCategory');
        this.selectStatus = document.getElementById('selectStatus');
        this.checkFavourite = document.getElementById('checkFavourite');
        this.inputNotes = document.getElementById('inputNotes');
        this.inputTags = document.getElementById('inputTags');
        this.inputBirthday = document.getElementById('inputBirthday');
        this.inputReminderDate = document.getElementById('inputReminderDate');
        this.formErrorsBanner = document.getElementById('formErrorsBanner');
    }
    openModal(isEditMode = false) {
        if (this.contactModal) {
            this.contactModal.classList.add('active');
        }
        if (this.modalTitle) {
            this.modalTitle.textContent = isEditMode ? 'Edit Contact' : 'Add New Contact';
        }
        this.clearErrors();
    }
    closeModal() {
        if (this.contactModal) {
            this.contactModal.classList.remove('active');
        }
        this.resetForm();
        this.clearErrors();
    }
    resetForm() {
        if (this.contactForm) {
            this.contactForm.reset();
        }
        if (this.inputContactId)
            this.inputContactId.value = '';
        if (this.selectCategory)
            this.selectCategory.value = 'Friends';
        if (this.selectStatus)
            this.selectStatus.value = 'active';
        if (this.checkFavourite)
            this.checkFavourite.checked = false;
    }
    populateForm(contact) {
        if (this.inputContactId)
            this.inputContactId.value = contact.id;
        if (this.inputFullName)
            this.inputFullName.value = contact.fullName;
        if (this.inputPhone)
            this.inputPhone.value = contact.phoneNumber;
        if (this.inputEmail)
            this.inputEmail.value = contact.email || '';
        if (this.inputAge)
            this.inputAge.value = contact.age !== undefined ? contact.age.toString() : '';
        if (this.inputCompany)
            this.inputCompany.value = contact.company || '';
        if (this.inputJobTitle)
            this.inputJobTitle.value = contact.jobTitle || '';
        if (this.inputAddress)
            this.inputAddress.value = contact.address || '';
        if (this.selectCategory)
            this.selectCategory.value = contact.category;
        if (this.selectStatus)
            this.selectStatus.value = contact.status;
        if (this.checkFavourite)
            this.checkFavourite.checked = contact.isFavourite;
        if (this.inputNotes)
            this.inputNotes.value = contact.notes || '';
        if (this.inputTags)
            this.inputTags.value = contact.tags ? contact.tags.join(', ') : '';
        if (this.inputBirthday)
            this.inputBirthday.value = contact.birthday || '';
        if (this.inputReminderDate)
            this.inputReminderDate.value = contact.reminderDate || '';
    }
    getFormData() {
        return {
            fullName: this.inputFullName ? this.inputFullName.value : '',
            phoneNumber: this.inputPhone ? this.inputPhone.value : '',
            email: this.inputEmail ? this.inputEmail.value : '',
            age: this.inputAge ? this.inputAge.value : '',
            company: this.inputCompany ? this.inputCompany.value : '',
            jobTitle: this.inputJobTitle ? this.inputJobTitle.value : '',
            address: this.inputAddress ? this.inputAddress.value : '',
            category: (this.selectCategory ? this.selectCategory.value : 'Other'),
            status: (this.selectStatus ? this.selectStatus.value : 'active'),
            isFavourite: this.checkFavourite ? this.checkFavourite.checked : false,
            notes: this.inputNotes ? this.inputNotes.value : '',
            tags: this.inputTags ? this.inputTags.value : '',
            birthday: this.inputBirthday ? this.inputBirthday.value : '',
            reminderDate: this.inputReminderDate ? this.inputReminderDate.value : ''
        };
    }
    clearErrors() {
        const errorSpans = document.querySelectorAll('.form-error-msg');
        errorSpans.forEach((span) => {
            span.textContent = '';
            span.style.display = 'none';
        });
        const inputs = document.querySelectorAll('.form-control.input-error');
        inputs.forEach((input) => input.classList.remove('input-error'));
        if (this.formErrorsBanner) {
            this.formErrorsBanner.style.display = 'none';
            this.formErrorsBanner.textContent = '';
        }
    }
    showErrors(errors) {
        var _a, _b, _c, _d;
        this.clearErrors();
        if (errors.fullName) {
            const err = document.getElementById('errFullName');
            if (err) {
                err.textContent = errors.fullName;
                err.style.display = 'block';
            }
            (_a = this.inputFullName) === null || _a === void 0 ? void 0 : _a.classList.add('input-error');
        }
        if (errors.phoneNumber) {
            const err = document.getElementById('errPhone');
            if (err) {
                err.textContent = errors.phoneNumber;
                err.style.display = 'block';
            }
            (_b = this.inputPhone) === null || _b === void 0 ? void 0 : _b.classList.add('input-error');
        }
        if (errors.email) {
            const err = document.getElementById('errEmail');
            if (err) {
                err.textContent = errors.email;
                err.style.display = 'block';
            }
            (_c = this.inputEmail) === null || _c === void 0 ? void 0 : _c.classList.add('input-error');
        }
        if (errors.age) {
            const err = document.getElementById('errAge');
            if (err) {
                err.textContent = errors.age;
                err.style.display = 'block';
            }
            (_d = this.inputAge) === null || _d === void 0 ? void 0 : _d.classList.add('input-error');
        }
        if (errors.general && this.formErrorsBanner) {
            this.formErrorsBanner.textContent = errors.general;
            this.formErrorsBanner.style.display = 'block';
        }
    }
}
