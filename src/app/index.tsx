import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

type UserRole = 'student' | 'parent' | 'staff';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= 800;

  // =====================================================
  // FORM
  // =====================================================

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [role, setRole] = useState<UserRole>('student');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // =====================================================
  // ANIMATIONS
  // =====================================================

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  const brandAnim = useRef(new Animated.Value(0)).current;

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(70)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;

  const welcomeAnim = useRef(new Animated.Value(0)).current;
  const roleAnim = useRef(new Animated.Value(0)).current;
  const emailAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;
  const optionsAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  const buttonScale = useRef(new Animated.Value(1)).current;

  const errorShake = useRef(new Animated.Value(0)).current;

  const eyeScale = useRef(new Animated.Value(1)).current;

  const checkboxScale = useRef(new Animated.Value(1)).current;

  const successScale = useRef(new Animated.Value(0)).current;

  const bubble1 = useRef(new Animated.Value(0)).current;
  const bubble2 = useRef(new Animated.Value(0)).current;
  const bubble3 = useRef(new Animated.Value(0)).current;

  // =====================================================
  // PAGE ANIMATION
  // =====================================================

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.spring(brandAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }).start();
    }, 300);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),

        Animated.spring(cardSlide, {
          toValue: 0,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        }),

        Animated.spring(cardScale, {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        }),
      ]).start();
    }, 450);

    setTimeout(() => {
      Animated.spring(welcomeAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }).start();
    }, 700);

    setTimeout(() => {
      Animated.spring(roleAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }).start();
    }, 850);

    setTimeout(() => {
      Animated.spring(emailAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }).start();
    }, 1000);

    setTimeout(() => {
      Animated.spring(passwordAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }).start();
    }, 1150);

    setTimeout(() => {
      Animated.spring(optionsAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }).start();
    }, 1300);

    setTimeout(() => {
      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }).start();
    }, 1450);

    // Floating logo

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -8,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(logoFloat, {
          toValue: 8,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Background bubbles

    Animated.loop(
      Animated.sequence([
        Animated.timing(bubble1, {
          toValue: 40,
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(bubble1, {
          toValue: -40,
          duration: 3500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bubble2, {
          toValue: -40,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(bubble2, {
          toValue: 40,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bubble3, {
          toValue: 30,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(bubble3, {
          toValue: -30,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // =====================================================
  // ERROR SHAKE
  // =====================================================

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(errorShake, {
        toValue: -12,
        duration: 60,
        useNativeDriver: true,
      }),

      Animated.timing(errorShake, {
        toValue: 12,
        duration: 60,
        useNativeDriver: true,
      }),

      Animated.timing(errorShake, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),

      Animated.timing(errorShake, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),

      Animated.timing(errorShake, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async () => {
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

    setLoading(true);

    try {
      // Real backend authentication
      await login(email.trim().toLowerCase(), password);

      // Success animation
      Animated.spring(successScale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }).start();

      // Navigate based on the role returned from the backend.
      // role selector UI is kept for UX; actual routing uses backend role.
      setTimeout(() => {
        if (role === 'student') {
          router.replace('/students/dashboard');
        } else if (role === 'parent') {
          router.replace('/parents/dashboard');
        } else {
          router.replace('/teacher/dashboard');
        }
      }, 600);
    } catch (err: any) {
      // Map API errors to user-friendly messages
      const msg: string =
        err?.message ??
        'Login failed. Please check your credentials and try again.';

      if (err?.statusCode === 403) {
        setError('Your account has been disabled. Please contact the school administrator.');
      } else if (err?.statusCode === 0) {
        setError('Cannot reach the server. Please check your network connection.');
      } else {
        setError(msg);
      }
      shakeError();
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // BUTTON PRESS
  // =====================================================

  const pressLogin = () => {
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

    handleLogin();
  };

  // =====================================================
  // PASSWORD
  // =====================================================

  const togglePassword = () => {
    Animated.sequence([
      Animated.spring(eyeScale, {
        toValue: 0.7,
        friction: 4,
        useNativeDriver: true,
      }),

      Animated.spring(eyeScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    setShowPassword((value) => !value);
  };

  // =====================================================
  // REMEMBER
  // =====================================================

  const toggleRemember = () => {
    Animated.sequence([
      Animated.spring(checkboxScale, {
        toValue: 0.7,
        friction: 4,
        useNativeDriver: true,
      }),

      Animated.spring(checkboxScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    setRememberMe((value) => !value);
  };

  // =====================================================
  // SLIDE ANIMATION
  // =====================================================

  const slideUp = (animation: Animated.Value) => ({
    opacity: animation,

    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  });

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.background}>

        {/* BACKGROUND ANIMATION */}

        <Animated.View
          style={[
            styles.bubble1,
            {
              transform: [
                {
                  translateY: bubble1,
                },
              ],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.bubble2,
            {
              transform: [
                {
                  translateY: bubble2,
                },
              ],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.bubble3,
            {
              transform: [
                {
                  translateY: bubble3,
                },
              ],
            },
          ]}
        />

        {/* =================================================
            DESKTOP BRANDING
        ================================================= */}

        {isDesktop && (
          <View style={styles.brandSection}>

            <Animated.View
              style={[
                styles.brandContent,

                {
                  opacity: brandAnim,

                  transform: [
                    {
                      translateX:
                        brandAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-80, 0],
                        }),
                    },
                  ],
                },
              ]}
            >

              {/* LOGO */}

              <Animated.View
                style={[
                  styles.logoCircle,

                  {
                    opacity: logoOpacity,

                    transform: [
                      {
                        scale: logoScale,
                      },

                      {
                        translateY: logoFloat,
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.logo}>
                  🏫
                </Text>
              </Animated.View>

              {/* TITLE */}

              <Animated.Text
                style={[
                  styles.brandTitle,

                  {
                    opacity: brandAnim,
                  },
                ]}
              >
                Smart School
              </Animated.Text>

              <Animated.Text
                style={[
                  styles.brandTitle,

                  {
                    opacity: brandAnim,
                  },
                ]}
              >
                Management System
              </Animated.Text>

              {/* DESCRIPTION */}

              <Animated.Text
                style={[
                  styles.brandDescription,

                  {
                    opacity: brandAnim,
                  },
                ]}
              >
                One intelligent platform for
                students, parents and school staff.
              </Animated.Text>

              {/* FEATURES */}

              <View style={styles.features}>

                <AnimatedFeature
                  icon="✓"
                  text="Student Management"
                  delay={0}
                />

                <AnimatedFeature
                  icon="✓"
                  text="Attendance Tracking"
                  delay={150}
                />

                <AnimatedFeature
                  icon="✓"
                  text="Marks & Performance"
                  delay={300}
                />

                <AnimatedFeature
                  icon="✓"
                  text="School Administration"
                  delay={450}
                />

              </View>

            </Animated.View>

          </View>
        )}

        {/* =================================================
            LOGIN
        ================================================= */}

        <Animated.View
          style={[
            styles.loginSection,

            {
              opacity: cardOpacity,

              transform: [
                {
                  translateY: cardSlide,
                },

                {
                  scale: cardScale,
                },
              ],
            },
          ]}
        >

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.loginScroll,
              {
                minHeight: Math.max(height, 650),
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
                        {
                          scale: logoScale,
                        },

                        {
                          translateY: logoFloat,
                        },
                      ],
                    },
                  ]}
                >

                  <View style={styles.mobileLogoCircle}>

                    <Text style={styles.mobileLogo}>
                      🏫
                    </Text>

                  </View>

                  <Text style={styles.mobileBrand}>
                    Smart School
                  </Text>

                  <Text style={styles.mobileSubtitle}>
                    Management System
                  </Text>

                </Animated.View>
              )}

              {/* WELCOME */}

              <Animated.View
                style={slideUp(welcomeAnim)}
              >

                <Text style={styles.welcome}>
                  Welcome Back 👋
                </Text>

                <Text style={styles.description}>
                  Sign in to continue to your dashboard
                </Text>

              </Animated.View>

              {/* ROLE */}

              <Animated.View
                style={slideUp(roleAnim)}
              >

                <Text style={styles.roleLabel}>
                  Who are you?
                </Text>

                <View style={styles.roleContainer}>

                  <RoleButton
                    icon="🎓"
                    title="Student"
                    selected={role === 'student'}
                    onPress={() =>
                      setRole('student')
                    }
                  />

                  <RoleButton
                    icon="👨‍👩‍👧"
                    title="Parent"
                    selected={role === 'parent'}
                    onPress={() =>
                      setRole('parent')
                    }
                  />

                  <RoleButton
                    icon="👨‍🏫"
                    title="Teacher"
                    selected={role === 'staff'}
                    onPress={() =>
                      setRole('staff')
                    }
                  />

                </View>

              </Animated.View>

              {/* EMAIL */}

              <Animated.View
                style={slideUp(emailAnim)}
              >

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
                    ✉️
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

              </Animated.View>

              {/* PASSWORD */}

              <Animated.View
                style={slideUp(passwordAnim)}
              >

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
                    autoCorrect={false}
                    onFocus={() =>
                      setPasswordFocused(true)
                    }
                    onBlur={() =>
                      setPasswordFocused(false)
                    }
                  />

                  <Animated.View
                    style={{
                      transform: [
                        {
                          scale: eyeScale,
                        },
                      ],
                    }}
                  >

                    <Pressable
                      style={styles.eyeButton}
                      onPress={togglePassword}
                    >

                      <Text style={styles.eye}>
                        {showPassword
                          ? '🙈'
                          : '👁️'}
                      </Text>

                    </Pressable>

                  </Animated.View>

                </View>

              </Animated.View>

              {/* ERROR */}

              {error !== '' && (
                <Animated.View
                  style={[
                    styles.errorBox,

                    {
                      transform: [
                        {
                          translateX: errorShake,
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

              <Animated.View
                style={slideUp(optionsAnim)}
              >

                <View style={styles.optionsRow}>

                  <Pressable
                    style={styles.rememberContainer}
                    onPress={toggleRemember}
                  >

                    <Animated.View
                      style={[
                        styles.checkbox,

                        rememberMe &&
                          styles.checkboxActive,

                        {
                          transform: [
                            {
                              scale:
                                checkboxScale,
                            },
                          ],
                        },
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

                    </Animated.View>

                    <Text style={styles.rememberText}>
                      Remember me
                    </Text>

                  </Pressable>

                  <Pressable>

                    <Text style={styles.forgot}>
                      Forgot Password?
                    </Text>

                  </Pressable>

                </View>

              </Animated.View>

              {/* LOGIN BUTTON */}

              <Animated.View
                style={[
                  slideUp(buttonAnim),

                  {
                    transform: [
                      {
                        translateY:
                          buttonAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                          }),
                      },

                      {
                        scale: buttonScale,
                      },
                    ],
                  },
                ]}
              >

                <Pressable
                  style={[
                    styles.loginButton,

                    loading &&
                      styles.loadingButton,
                  ]}
                  onPress={pressLogin}
                  disabled={loading}
                >

                  {loading ? (
                    <View style={styles.loadingContainer}>

                      <ActivityIndicator
                        color="#ffffff"
                        size="small"
                      />

                      <Text style={styles.loadingText}>
                        Signing in...
                      </Text>

                    </View>
                  ) : (
                    <Text style={styles.loginButtonText}>
                      LOGIN AS{' '}
                      {role === 'student'
                        ? 'STUDENT'
                        : role === 'parent'
                        ? 'PARENT'
                        : 'TEACHER'}{' '}
                      →
                    </Text>
                  )}

                </Pressable>

              </Animated.View>

              {/* SUCCESS */}

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.successCircle,

                  {
                    transform: [
                      {
                        scale: successScale,
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

              <Text style={styles.footer}>
                🔐 Secure School Login
              </Text>

              <Text style={styles.version}>
                Smart School Management • v1.0
              </Text>

            </View>

          </ScrollView>

        </Animated.View>

      </View>
    </KeyboardAvoidingView>
  );
}

// =====================================================
// ROLE BUTTON
// =====================================================

function RoleButton({
  icon,
  title,
  selected,
  onPress,
}: {
  icon: string;
  title: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(
    new Animated.Value(1)
  ).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [
          {
            scale,
          },
        ],
      }}
    >

      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[
          styles.roleButton,

          selected &&
            styles.roleSelected,
        ]}
      >

        <Text
          style={[
            styles.roleIcon,

            selected &&
              styles.roleIconSelected,
          ]}
        >
          {icon}
        </Text>

        <Text
          style={[
            styles.roleTitle,

            selected &&
              styles.roleTitleSelected,
          ]}
        >
          {title}
        </Text>

        {selected && (
          <View style={styles.selectedCheck}>

            <Text style={styles.selectedCheckText}>
              ✓
            </Text>

          </View>
        )}

      </Pressable>

    </Animated.View>
  );
}

// =====================================================
// FEATURE ANIMATION
// =====================================================

function AnimatedFeature({
  icon,
  text,
  delay,
}: {
  icon: string;
  text: string;
  delay: number;
}) {
  const opacity = useRef(
    new Animated.Value(0)
  ).current;

  const translateX = useRef(
    new Animated.Value(-40)
  ).current;

  const scale = useRef(
    new Animated.Value(0.8)
  ).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.spring(translateX, {
          toValue: 0,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),

        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    }, 900 + delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureRow,

        {
          opacity,

          transform: [
            {
              translateX,
            },

            {
              scale,
            },
          ],
        },
      ]}
    >

      <View style={styles.featureIcon}>

        <Text style={styles.featureCheck}>
          {icon}
        </Text>

      </View>

      <Text style={styles.featureText}>
        {text}
      </Text>

    </Animated.View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

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

    backgroundColor:
      'rgba(37,99,235,0.07)',

    right: -170,
    top: -130,
  },

  bubble2: {
    position: 'absolute',

    width: 280,
    height: 280,

    borderRadius: 140,

    backgroundColor:
      'rgba(15,76,129,0.06)',

    left: -140,
    bottom: -120,
  },

  bubble3: {
    position: 'absolute',

    width: 170,
    height: 170,

    borderRadius: 85,

    backgroundColor:
      'rgba(37,99,235,0.04)',

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

    shadowOffset: {
      width: 0,
      height: 8,
    },

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

    shadowOffset: {
      width: 0,
      height: 10,
    },

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

    shadowOffset: {
      width: 0,
      height: 4,
    },

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

    shadowOffset: {
      width: 0,
      height: 3,
    },

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

    shadowOffset: {
      width: 0,
      height: 5,
    },

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

    shadowOffset: {
      width: 0,
      height: 4,
    },

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