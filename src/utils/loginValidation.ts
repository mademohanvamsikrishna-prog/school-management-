/**
 * loginValidation.ts
 * Pure validation helper for the login form.
 * Returns the first error string found, or null if the form is valid.
 *
 * Keeping validation separate from the UI component makes it independently
 * testable without mounting a React component.
 */

export function validateLoginForm(email: string, password: string): string | null {
  if (!email.trim()) {
    return 'Please enter your email address.';
  }

  if (!email.includes('@')) {
    return 'Please enter a valid email address.';
  }

  if (!password.trim()) {
    return 'Please enter your password.';
  }

  if (password.length < 6) {
    return 'Password must contain at least 6 characters.';
  }

  return null;
}
