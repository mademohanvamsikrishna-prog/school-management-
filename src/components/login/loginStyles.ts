/**
 * loginStyles.ts
 * Stylesheet extracted from the LoginScreen component.
 * Import this in index.tsx and any login sub-components that need shared styles.
 */
import { StyleSheet } from 'react-native';

export const loginStyles = StyleSheet.create({

  container: {
    flex: 1,
  },

  background: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f4f7fb',
    overflow: 'hidden',
  },

  // ===================================================
  // BUBBLES
  // ===================================================

  bubble1: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(37,99,235,0.07)',
    right: -170,
    top: -130,
  },

  bubble2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(15,76,129,0.06)',
    left: -140,
    bottom: -120,
  },

  bubble3: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(37,99,235,0.04)',
    right: '35%',
    top: '10%',
  },

  // ===================================================
  // BRAND
  // ===================================================

  brandSection: {
    flex: 1,
    backgroundColor: '#0f4c81',
    justifyContent: 'center',
    paddingHorizontal: 55,
    overflow: 'hidden',
  },

  brandContent: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },

  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  logo: {
    fontSize: 46,
  },

  brandTitle: {
    color: '#ffffff',
    fontSize: 37,
    fontWeight: '900',
    letterSpacing: -1,
  },

  brandDescription: {
    color: '#dbeafe',
    fontSize: 17,
    lineHeight: 26,
    marginTop: 20,
    maxWidth: 500,
  },

  // ===================================================
  // FEATURES
  // ===================================================

  features: {
    marginTop: 36,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },

  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  featureCheck: {
    color: '#0f4c81',
    fontSize: 17,
    fontWeight: '900',
  },

  featureText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  // ===================================================
  // LOGIN
  // ===================================================

  loginSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },

  loginScroll: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 25,
  },

  loginCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 38,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 9,
  },

  // ===================================================
  // MOBILE LOGO
  // ===================================================

  mobileLogoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  mobileLogoCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#eaf2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  mobileLogo: {
    fontSize: 38,
  },

  mobileBrand: {
    color: '#0f4c81',
    fontSize: 23,
    fontWeight: '900',
  },

  mobileSubtitle: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },

  // ===================================================
  // WELCOME
  // ===================================================

  welcome: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  description: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 7,
    marginBottom: 23,
  },

  // ===================================================
  // ROLE
  // ===================================================

  roleLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },

  roleContainer: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 23,
  },

  roleButton: {
    minHeight: 86,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 15,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  roleSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.15,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  roleIcon: {
    fontSize: 27,
    opacity: 0.55,
  },

  roleIconSelected: {
    opacity: 1,
  },

  roleTitle: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },

  roleTitleSelected: {
    color: '#2563eb',
    fontWeight: '900',
  },

  selectedCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedCheckText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },

  // ===================================================
  // INPUT
  // ===================================================

  label: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
  },

  inputContainer: {
    height: 55,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#f9fafb',
    marginBottom: 18,
  },

  inputFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff',
    shadowColor: '#2563eb',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  inputIcon: {
    fontSize: 17,
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: '100%',
    color: '#111827',
    fontSize: 14,
  },

  eyeButton: {
    padding: 6,
  },

  eye: {
    fontSize: 17,
  },

  // ===================================================
  // ERROR
  // ===================================================

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 11,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },

  errorCircle: {
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  errorIcon: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  errorText: {
    flex: 1,
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '600',
  },

  // ===================================================
  // WAKING UP HINT (cold-start banner)
  // ===================================================

  wakingUpBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 11,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  wakingUpText: {
    flex: 1,
    color: '#92400e',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },


  // ===================================================
  // OPTIONS
  // ===================================================

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#9ca3af',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },

  checkboxActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  checkboxTick: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  rememberText: {
    color: '#4b5563',
    fontSize: 12,
  },

  forgot: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '800',
  },

  // ===================================================
  // BUTTON
  // ===================================================

  loginButton: {
    height: 55,
    borderRadius: 13,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.28,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },

  loadingButton: {
    opacity: 0.82,
  },

  loginButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  loadingText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 9,
  },

  // ===================================================
  // SUCCESS
  // ===================================================

  successCircle: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  successText: {
    color: '#ffffff',
    fontSize: 29,
    fontWeight: '900',
  },

  // ===================================================
  // FOOTER
  // ===================================================

  footer: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    marginTop: 22,
  },

  version: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 5,
  },
});
