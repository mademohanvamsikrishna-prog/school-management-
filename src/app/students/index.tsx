import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 800;

  // -----------------------------
  // FORM STATE
  // -----------------------------

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // ANIMATION VALUES
  // -----------------------------

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandSlide = useRef(new Animated.Value(50)).current;

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(80)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(30)).current;

  const buttonScale = useRef(new Animated.Value(1)).current;

  const errorShake = useRef(new Animated.Value(0)).current;

  const successScale = useRef(new Animated.Value(0)).current;

  // -----------------------------
  // STARTUP ANIMATION
  // -----------------------------

  useEffect(() => {
    // Initial positions
    logoOpacity.setValue(0);
    logoScale.setValue(0.4);

    brandOpacity.setValue(0);
    brandSlide.setValue(50);

    cardOpacity.setValue(0);
    cardSlide.setValue(80);
    cardScale.setValue(0.9);

    formOpacity.setValue(0);
    formSlide.setValue(30);

    // LOGO
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    // BRAND TEXT
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),

        Animated.spring(brandSlide, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // LOGIN CARD
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),

        Animated.spring(cardSlide, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),

        Animated.spring(cardScale, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, 700);

    // FORM
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),

        Animated.spring(formSlide, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000);

    // CONTINUOUS LOGO FLOAT
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -8,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(logoFloat, {
          toValue: 8,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // -----------------------------
  // ERROR SHAKE
  // -----------------------------

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(errorShake, {
        toValue: -10,
        duration: 70,
        useNativeDriver: true,
      }),

      Animated.timing(errorShake, {
        toValue: 10,
        duration: 70,
        useNativeDriver: true,
      }),

      Animated.timing(errorShake, {
        toValue: -8,
        duration: 70,
        useNativeDriver: true,
      }),

      Animated.timing(errorShake, {
        toValue: 8,
        duration: 70,
        useNativeDriver: true,
      }),

      Animated.timing(errorShake, {
        toValue: 0,
        duration: 70,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // -----------------------------
  // LOGIN
  // -----------------------------

  const handleLogin = () => {
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      shakeError();
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      shakeError();
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      shakeError();
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      shakeError();
      return;
    }

    // Button press
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.94,
        friction: 5,
        useNativeDriver: true,
      }),

      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);

    // Fake login delay
    setTimeout(() => {
      setLoading(false);

      // Success animation
      Animated.spring(successScale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        router.replace('/dashboard');
      }, 500);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.background}>

        {/* =====================================
            DESKTOP LEFT SIDE
        ===================================== */}

        {isDesktop && (
          <View style={styles.brandSection}>

            <View style={styles.brandContent}>

              {/* LOGO */}

              <Animated.View
                style={[
                  styles.logoCircle,
                  {
                    opacity: logoOpacity,
                    transform: [
                      { scale: logoScale },
                      { translateY: logoFloat },
                    ],
                  },
                ]}
              >
                <Text style={styles.logo}>
                  🏫
                </Text>
              </Animated.View>

              {/* BRAND TEXT */}

              <Animated.View
                style={{
                  opacity: brandOpacity,
                  transform: [
                    { translateY: brandSlide },
                  ],
                }}
              >

                <Text style={styles.brandTitle}>
                  Smart School
                </Text>

                <Text style={styles.brandTitle}>
                  Management System
                </Text>

                <Text style={styles.brandDescription}>
                  A simple and powerful platform to manage
                  students, attendance, marks and school
                  activities from one place.
                </Text>

                {/* FEATURES */}

                <View style={styles.features}>

                  <Feature
                    icon="✓"
                    text="Student Management"
                  />

                  <Feature
                    icon="✓"
                    text="Attendance Tracking"
                  />

                  <Feature
                    icon="✓"
                    text="Marks & Performance"
                  />

                  <Feature
                    icon="✓"
                    text="School Administration"
                  />

                </View>

              </Animated.View>

            </View>

          </View>
        )}

        {/* =====================================
            LOGIN AREA
        ===================================== */}

        <Animated.View
          style={[
            styles.loginSection,
            {
              opacity: cardOpacity,
              transform: [
                { translateY: cardSlide },
                { scale: cardScale },
              ],
            },
          ]}
        >

          <View style={styles.loginCard}>

            {/* MOBILE LOGO */}

            {!isDesktop && (
              <Animated.View
                style={[
                  styles.mobileLogoContainer,
                  {
                    opacity: logoOpacity,
                    transform: [
                      { scale: logoScale },
                      { translateY: logoFloat },
                    ],
                  },
                ]}
              >
                <View style={styles.mobileLogoCircle}>
                  <Text style={styles.logo}>
                    🏫
                  </Text>
                </View>

                <Text style={styles.mobileBrand}>
                  Smart School
                </Text>

              </Animated.View>
            )}

            {/* LOGIN HEADER */}

            <Animated.View
              style={{
                opacity: formOpacity,
                transform: [
                  { translateY: formSlide },
                ],
              }}
            >

              <View style={styles.headerRow}>

                <View>
                  <Text style={styles.welcome}>
                    Welcome Back
                  </Text>

                  <Text style={styles.wave}>
                    👋
                  </Text>
                </View>

              </View>

              <Text style={styles.loginDescription}>
                Sign in to continue to your dashboard
              </Text>

              {/* EMAIL */}

              <Text style={styles.label}>
                Email Address
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  emailFocused &&
                    styles.inputFocused,
                ]}
              >

                <Text style={styles.inputIcon}>
                  ✉
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() =>
                    setEmailFocused(true)
                  }
                  onBlur={() =>
                    setEmailFocused(false)
                  }
                />

              </View>

              {/* PASSWORD */}

              <Text style={styles.label}>
                Password
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  passwordFocused &&
                    styles.inputFocused,
                ]}
              >

                <Text style={styles.inputIcon}>
                  🔒
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() =>
                    setPasswordFocused(true)
                  }
                  onBlur={() =>
                    setPasswordFocused(false)
                  }
                />

                <Pressable
                  onPress={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  style={styles.eyeButton}
                >
                  <Text style={styles.eye}>
                    {showPassword
                      ? '🙈'
                      : '👁️'}
                  </Text>
                </Pressable>

              </View>

              {/* ERROR */}

              {error !== '' && (
                <Animated.View
                  style={[
                    styles.errorBox,
                    {
                      transform: [
                        {
                          translateX:
                            errorShake,
                        },
                      ],
                    },
                  ]}
                >

                  <View style={styles.errorCircle}>
                    <Text style={styles.errorIcon}>
                      !
                    </Text>
                  </View>

                  <Text style={styles.errorText}>
                    {error}
                  </Text>

                </Animated.View>
              )}

              {/* OPTIONS */}

              <View style={styles.optionsRow}>

                <Pressable
                  style={styles.rememberContainer}
                  onPress={() =>
                    setRememberMe(
                      !rememberMe
                    )
                  }
                >

                  <View
                    style={[
                      styles.checkbox,
                      rememberMe &&
                        styles.checkboxActive,
                    ]}
                  >
                    {rememberMe && (
                      <Text
                        style={
                          styles.checkboxTick
                        }
                      >
                        ✓
                      </Text>
                    )}
                  </View>

                  <Text style={styles.rememberText}>
                    Remember me
                  </Text>

                </Pressable>

                <Pressable>
                  <Text style={styles.forgotText}>
                    Forgot Password?
                  </Text>
                </Pressable>

              </View>

              {/* LOGIN BUTTON */}

              <Animated.View
                style={{
                  transform: [
                    { scale: buttonScale },
                  ],
                }}
              >

                <Pressable
                  style={[
                    styles.loginButton,
                    loading &&
                      styles.loginButtonLoading,
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                >

                  {loading ? (
                    <View
                      style={
                        styles.loadingContainer
                      }
                    >

                      <ActivityIndicator
                        size="small"
                        color="#ffffff"
                      />

                      <Text
                        style={
                          styles.loadingText
                        }
                      >
                        Signing in...
                      </Text>

                    </View>
                  ) : (
                    <Text
                      style={
                        styles.loginButtonText
                      }
                    >
                      LOGIN →
                    </Text>
                  )}

                </Pressable>

              </Animated.View>

              {/* SUCCESS */}

              <Animated.View
                style={[
                  styles.successCircle,
                  {
                    transform: [
                      {
                        scale:
                          successScale,
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.successText}>
                  ✓
                </Text>
              </Animated.View>

              {/* FOOTER */}

              <Text style={styles.footerText}>
                🔐 Secure School Management
              </Text>

              <Text style={styles.versionText}>
                Version 1.0
              </Text>

            </Animated.View>

          </View>

        </Animated.View>

      </View>
    </KeyboardAvoidingView>
  );
}

/* ==========================================
   FEATURE COMPONENT
========================================== */

function Feature({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <View style={styles.featureRow}>

      <View style={styles.featureIcon}>
        <Text style={styles.featureCheck}>
          {icon}
        </Text>
      </View>

      <Text style={styles.featureText}>
        {text}
      </Text>

    </View>
  );
}

/* ==========================================
   STYLES
========================================== */

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  background: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f3f6fb',
  },

  /* ===============================
     BRAND SECTION
  =============================== */

  brandSection: {
    flex: 1,
    backgroundColor: '#0f4c81',
    justifyContent: 'center',
    paddingHorizontal: 60,
  },

  brandContent: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },

  logoCircle: {
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },

  logo: {
    fontSize: 45,
  },

  brandTitle: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },

  brandDescription: {
    color: '#dbeafe',
    fontSize: 17,
    lineHeight: 27,
    marginTop: 22,
    maxWidth: 480,
  },

  features: {
    marginTop: 38,
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
    fontWeight: '800',
  },

  featureText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  /* ===============================
     LOGIN SECTION
  =============================== */

  loginSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  loginCard: {
    width: '100%',
    maxWidth: 470,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 42,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },
  },

  /* ===============================
     MOBILE LOGO
  =============================== */

  mobileLogoContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },

  mobileLogoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eaf2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  mobileBrand: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0f4c81',
  },

  /* ===============================
     HEADER
  =============================== */

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  welcome: {
    fontSize: 31,
    fontWeight: '800',
    color: '#111827',
  },

  wave: {
    position: 'absolute',
    left: 210,
    top: 2,
    fontSize: 27,
  },

  loginDescription: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 9,
    marginBottom: 30,
  },

  /* ===============================
     INPUT
  =============================== */

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },

  inputContainer: {
    height: 56,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  inputFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff',
    shadowColor: '#2563eb',
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 2,
  },

  inputIcon: {
    fontSize: 18,
    marginRight: 11,
  },

  input: {
    flex: 1,
    height: '100%',
    color: '#111827',
    fontSize: 15,
  },

  eyeButton: {
    padding: 7,
  },

  eye: {
    fontSize: 18,
  },

  /* ===============================
     ERROR
  =============================== */

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 18,
  },

  errorCircle: {
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  errorIcon: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  errorText: {
    flex: 1,
    color: '#b91c1c',
    fontSize: 13,
  },

  /* ===============================
     OPTIONS
  =============================== */

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
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
    marginRight: 8,
  },

  checkboxActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },

  checkboxTick: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  rememberText: {
    color: '#4b5563',
    fontSize: 14,
  },

  forgotText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ===============================
     BUTTON
  =============================== */

  loginButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  loginButtonLoading: {
    opacity: 0.8,
  },

  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  loadingText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 10,
  },

  /* ===============================
     SUCCESS
  =============================== */

  successCircle: {
    position: 'absolute',
    bottom: 55,
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },

  successText: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: '800',
  },

  /* ===============================
     FOOTER
  =============================== */

  footerText: {
    textAlign: 'center',
    marginTop: 27,
    color: '#6b7280',
    fontSize: 13,
  },

  versionText: {
    textAlign: 'center',
    marginTop: 5,
    color: '#9ca3af',
    fontSize: 12,
  },

});