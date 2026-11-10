/**
 * validation.ts
 *
 * Centralised validation functions for contact forms and imports.
 */
/**
 * Validates phone numbers with international prefix and at least 7 digits.
 */
export function isValidPhoneNumber(phone) {
    const trimmed = phone.trim();
    if (trimmed.length < 7) {
        return false;
    }
    const phonePattern = /^\+?[\d\s\-()]{7,25}$/;
    return phonePattern.test(trimmed);
}
/**
 * Validates email addresses.
 */
export function isValidEmail(email) {
    const trimmed = email.trim();
    if (trimmed.length === 0) {
        return true; // Optional field
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(trimmed);
}
/**
 * Checks for duplicate contacts based on phone number or email.
 */
export function findDuplicateContact(phone, email, existingContacts, excludeContactId) {
    const cleanPhone = phone.replace(/[\s\-()]/g, "").toLowerCase();
    const cleanEmail = (email || "").trim().toLowerCase();
    return existingContacts.find((c) => {
        if (excludeContactId && c.id === excludeContactId) {
            return false;
        }
        const cPhoneClean = c.phoneNumber.replace(/[\s\-()]/g, "").toLowerCase();
        const phoneMatches = cPhoneClean.length > 0 && cPhoneClean === cleanPhone;
        const cEmailClean = (c.email || "").trim().toLowerCase();
        const emailMatches = cleanEmail.length > 0 && cEmailClean.length > 0 && cEmailClean === cleanEmail;
        return phoneMatches || emailMatches;
    });
}
/**
 * Validates the full contact form data.
 */
export function validateContactForm(formData, existingContacts, currentContactId) {
    const errors = {};
    let isValid = true;
    // 1. Full Name
    const trimmedName = formData.fullName.trim();
    if (trimmedName.length === 0) {
        errors.fullName = "Full name is required.";
        isValid = false;
    }
    else if (trimmedName.length < 2) {
        errors.fullName = "Full name must be at least 2 characters.";
        isValid = false;
    }
    // 2. Phone Number
    const trimmedPhone = formData.phoneNumber.trim();
    if (trimmedPhone.length === 0) {
        errors.phoneNumber = "Phone number is required.";
        isValid = false;
    }
    else if (!isValidPhoneNumber(trimmedPhone)) {
        errors.phoneNumber = "Please enter a valid phone number (at least 7 digits).";
        isValid = false;
    }
    // 3. Email
    const trimmedEmail = formData.email.trim();
    if (trimmedEmail.length > 0 && !isValidEmail(trimmedEmail)) {
        errors.email = "Please enter a valid email address.";
        isValid = false;
    }
    // 4. Age
    const trimmedAge = formData.age.trim();
    if (trimmedAge.length > 0) {
        const parsedAge = Number(trimmedAge);
        if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 130 || !Number.isInteger(parsedAge)) {
            errors.age = "Age must be a valid whole number between 1 and 130.";
            isValid = false;
        }
    }
    // 5. Duplicates
    if (isValid) {
        const duplicate = findDuplicateContact(trimmedPhone, trimmedEmail, existingContacts, currentContactId);
        if (duplicate) {
            const cleanPhone = trimmedPhone.replace(/[\s\-()]/g, "").toLowerCase();
            const duplicatePhone = duplicate.phoneNumber.replace(/[\s\-()]/g, "").toLowerCase();
            if (duplicatePhone === cleanPhone) {
                errors.phoneNumber = `Phone number already exists for contact "${duplicate.fullName}".`;
            }
            else {
                errors.email = `Email address already exists for contact "${duplicate.fullName}".`;
            }
            isValid = false;
        }
    }
    return { isValid, errors };
}
