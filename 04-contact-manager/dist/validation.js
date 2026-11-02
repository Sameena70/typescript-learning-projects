/**
 * validation.ts
 *
 * Pure functions for validating contact form data, preventing duplicates,
 * and validating CSV rows prior to import.
 */
/**
 * Validates a standard phone number format.
 * Allows international codes (+), digits, spaces, hyphens, and parentheses.
 * Must contain at least 7 digits.
 */
export function isValidPhoneNumber(phone) {
    const trimmed = phone.trim();
    if (trimmed.length < 7) {
        return false;
    }
    // Regular expression: optional '+' followed by numbers, spaces, hyphens, or parentheses
    const phonePattern = /^\+?[\d\s\-()]{7,20}$/;
    return phonePattern.test(trimmed);
}
/**
 * Validates an email address format.
 */
export function isValidEmail(email) {
    const trimmed = email.trim();
    if (trimmed.length === 0) {
        return true; // Optional field, empty is acceptable
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(trimmed);
}
/**
 * Validates the contact form inputs.
 * Checks required fields, formats, and checks for duplicates.
 *
 * @param formData Raw data entered into the form
 * @param existingContacts Array of existing contacts to check against for duplicates
 * @param currentContactId Optional ID if editing an existing contact (to skip self in duplicate checks)
 */
export function validateContactForm(formData, existingContacts, currentContactId) {
    const errors = {};
    let isValid = true;
    // 1. Validate Full Name (Required, min 2 characters)
    const trimmedName = formData.fullName.trim();
    if (trimmedName.length === 0) {
        errors.fullName = "Full name is required.";
        isValid = false;
    }
    else if (trimmedName.length < 2) {
        errors.fullName = "Full name must be at least 2 characters.";
        isValid = false;
    }
    // 2. Validate Phone Number (Required, format check)
    const trimmedPhone = formData.phoneNumber.trim();
    if (trimmedPhone.length === 0) {
        errors.phoneNumber = "Phone number is required.";
        isValid = false;
    }
    else if (!isValidPhoneNumber(trimmedPhone)) {
        errors.phoneNumber = "Please enter a valid phone number (at least 7 digits).";
        isValid = false;
    }
    // 3. Validate Optional Email
    const trimmedEmail = formData.email.trim();
    if (trimmedEmail.length > 0 && !isValidEmail(trimmedEmail)) {
        errors.email = "Please enter a valid email address.";
        isValid = false;
    }
    // 4. Validate Optional Age
    const trimmedAge = formData.age.trim();
    if (trimmedAge.length > 0) {
        const parsedAge = Number(trimmedAge);
        if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 130 || !Number.isInteger(parsedAge)) {
            errors.age = "Age must be a valid whole number between 1 and 130.";
            isValid = false;
        }
    }
    // 5. Prevent Duplicate Contacts
    // Check if another contact already has the same phone number or email (if provided)
    const cleanPhone = trimmedPhone.replace(/[\s\-()]/g, "");
    const duplicateContact = existingContacts.find((c) => {
        // If editing, skip the contact itself
        if (currentContactId && c.id === currentContactId) {
            return false;
        }
        const cPhoneClean = c.phoneNumber.replace(/[\s\-()]/g, "");
        const isSamePhone = cPhoneClean.length > 0 && cPhoneClean === cleanPhone;
        const isSameEmail = trimmedEmail.length > 0 &&
            c.email !== undefined &&
            c.email.trim().toLowerCase() === trimmedEmail.toLowerCase();
        return isSamePhone || isSameEmail;
    });
    if (duplicateContact) {
        if (duplicateContact.phoneNumber.replace(/[\s\-()]/g, "") === cleanPhone) {
            errors.phoneNumber = "A contact with this phone number already exists.";
        }
        else {
            errors.email = "A contact with this email address already exists.";
        }
        isValid = false;
    }
    return { isValid, errors };
}
