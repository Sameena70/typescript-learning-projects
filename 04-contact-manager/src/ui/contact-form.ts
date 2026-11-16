/**
 * contact-form.ts
 *
 * Dedicated UI component managing contact modal, input elements, form submission, and error display.
 */

import { Contact, ContactFormData, ContactCategory, ContactStatus } from '../types.js';

export class ContactFormUI {
  private contactModal: HTMLDivElement | null;
  private modalTitle: HTMLHeadingElement | null;
  private contactForm: HTMLFormElement | null;
  private inputContactId: HTMLInputElement | null;
  private inputFullName: HTMLInputElement | null;
  private inputPhone: HTMLInputElement | null;
  private inputEmail: HTMLInputElement | null;
  private inputAge: HTMLInputElement | null;
  private inputCompany: HTMLInputElement | null;
  private inputJobTitle: HTMLInputElement | null;
  private inputAddress: HTMLInputElement | null;
  private selectCategory: HTMLSelectElement | null;
  private selectStatus: HTMLSelectElement | null;
  private checkFavourite: HTMLInputElement | null;
  private inputNotes: HTMLTextAreaElement | null;
  private inputTags: HTMLInputElement | null;
  private inputBirthday: HTMLInputElement | null;
  private inputReminderDate: HTMLInputElement | null;
  private formErrorsBanner: HTMLDivElement | null;

  constructor() {
    this.contactModal = document.getElementById('contactModal') as HTMLDivElement | null;
    this.modalTitle = document.getElementById('modalTitle') as HTMLHeadingElement | null;
    this.contactForm = document.getElementById('contactForm') as HTMLFormElement | null;
    this.inputContactId = document.getElementById('inputContactId') as HTMLInputElement | null;
    this.inputFullName = document.getElementById('inputFullName') as HTMLInputElement | null;
    this.inputPhone = document.getElementById('inputPhone') as HTMLInputElement | null;
    this.inputEmail = document.getElementById('inputEmail') as HTMLInputElement | null;
    this.inputAge = document.getElementById('inputAge') as HTMLInputElement | null;
    this.inputCompany = document.getElementById('inputCompany') as HTMLInputElement | null;
    this.inputJobTitle = document.getElementById('inputJobTitle') as HTMLInputElement | null;
    this.inputAddress = document.getElementById('inputAddress') as HTMLInputElement | null;
    this.selectCategory = document.getElementById('selectCategory') as HTMLSelectElement | null;
    this.selectStatus = document.getElementById('selectStatus') as HTMLSelectElement | null;
    this.checkFavourite = document.getElementById('checkFavourite') as HTMLInputElement | null;
    this.inputNotes = document.getElementById('inputNotes') as HTMLTextAreaElement | null;
    this.inputTags = document.getElementById('inputTags') as HTMLInputElement | null;
    this.inputBirthday = document.getElementById('inputBirthday') as HTMLInputElement | null;
    this.inputReminderDate = document.getElementById(
      'inputReminderDate'
    ) as HTMLInputElement | null;
    this.formErrorsBanner = document.getElementById('formErrorsBanner') as HTMLDivElement | null;
  }

  public openModal(isEditMode = false): void {
    if (this.contactModal) {
      this.contactModal.classList.add('active');
    }
    if (this.modalTitle) {
      this.modalTitle.textContent = isEditMode ? 'Edit Contact' : 'Add New Contact';
    }
    this.clearErrors();
  }

  public closeModal(): void {
    if (this.contactModal) {
      this.contactModal.classList.remove('active');
    }
    this.resetForm();
    this.clearErrors();
  }

  public resetForm(): void {
    if (this.contactForm) {
      this.contactForm.reset();
    }
    if (this.inputContactId) this.inputContactId.value = '';
    if (this.selectCategory) this.selectCategory.value = 'Friends';
    if (this.selectStatus) this.selectStatus.value = 'active';
    if (this.checkFavourite) this.checkFavourite.checked = false;
  }

  public populateForm(contact: Contact): void {
    if (this.inputContactId) this.inputContactId.value = contact.id;
    if (this.inputFullName) this.inputFullName.value = contact.fullName;
    if (this.inputPhone) this.inputPhone.value = contact.phoneNumber;
    if (this.inputEmail) this.inputEmail.value = contact.email || '';
    if (this.inputAge)
      this.inputAge.value = contact.age !== undefined ? contact.age.toString() : '';
    if (this.inputCompany) this.inputCompany.value = contact.company || '';
    if (this.inputJobTitle) this.inputJobTitle.value = contact.jobTitle || '';
    if (this.inputAddress) this.inputAddress.value = contact.address || '';
    if (this.selectCategory) this.selectCategory.value = contact.category;
    if (this.selectStatus) this.selectStatus.value = contact.status;
    if (this.checkFavourite) this.checkFavourite.checked = contact.isFavourite;
    if (this.inputNotes) this.inputNotes.value = contact.notes || '';
    if (this.inputTags) this.inputTags.value = contact.tags ? contact.tags.join(', ') : '';
    if (this.inputBirthday) this.inputBirthday.value = contact.birthday || '';
    if (this.inputReminderDate) this.inputReminderDate.value = contact.reminderDate || '';
  }

  public getFormData(): ContactFormData {
    return {
      fullName: this.inputFullName ? this.inputFullName.value : '',
      phoneNumber: this.inputPhone ? this.inputPhone.value : '',
      email: this.inputEmail ? this.inputEmail.value : '',
      age: this.inputAge ? this.inputAge.value : '',
      company: this.inputCompany ? this.inputCompany.value : '',
      jobTitle: this.inputJobTitle ? this.inputJobTitle.value : '',
      address: this.inputAddress ? this.inputAddress.value : '',
      category: (this.selectCategory ? this.selectCategory.value : 'Other') as ContactCategory,
      status: (this.selectStatus ? this.selectStatus.value : 'active') as ContactStatus,
      isFavourite: this.checkFavourite ? this.checkFavourite.checked : false,
      notes: this.inputNotes ? this.inputNotes.value : '',
      tags: this.inputTags ? this.inputTags.value : '',
      birthday: this.inputBirthday ? this.inputBirthday.value : '',
      reminderDate: this.inputReminderDate ? this.inputReminderDate.value : ''
    };
  }

  public clearErrors(): void {
    const errorSpans = document.querySelectorAll('.form-error-msg');
    errorSpans.forEach((span) => {
      span.textContent = '';
      (span as HTMLElement).style.display = 'none';
    });

    const inputs = document.querySelectorAll('.form-control.input-error');
    inputs.forEach((input) => input.classList.remove('input-error'));

    if (this.formErrorsBanner) {
      this.formErrorsBanner.style.display = 'none';
      this.formErrorsBanner.textContent = '';
    }
  }

  public showErrors(errors: Record<string, string | undefined>): void {
    this.clearErrors();

    if (errors.fullName) {
      const err = document.getElementById('errFullName');
      if (err) {
        err.textContent = errors.fullName;
        err.style.display = 'block';
      }
      this.inputFullName?.classList.add('input-error');
    }

    if (errors.phoneNumber) {
      const err = document.getElementById('errPhone');
      if (err) {
        err.textContent = errors.phoneNumber;
        err.style.display = 'block';
      }
      this.inputPhone?.classList.add('input-error');
    }

    if (errors.email) {
      const err = document.getElementById('errEmail');
      if (err) {
        err.textContent = errors.email;
        err.style.display = 'block';
      }
      this.inputEmail?.classList.add('input-error');
    }

    if (errors.age) {
      const err = document.getElementById('errAge');
      if (err) {
        err.textContent = errors.age;
        err.style.display = 'block';
      }
      this.inputAge?.classList.add('input-error');
    }

    if (errors.general && this.formErrorsBanner) {
      this.formErrorsBanner.textContent = errors.general;
      this.formErrorsBanner.style.display = 'block';
    }
  }
}
