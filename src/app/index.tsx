import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { getRoleRoute } from '../config/routes';
import { validateLoginForm } from '../utils/loginValidation';
import { RoleButton } from '../components/login/RoleButton';
import { AnimatedFeature } from '../components/login/AnimatedFeature';
import { LoginBackground } from '../components/login/LoginBackground';
import { loginStyles as styles } from '../components/login/loginStyles';
import { ApiError } from '../services/types';

type UserRole = 'student' | 'parent' | 'staff';

export default function LoginScreen() {
  const router = useRouter();
  const { login, user } = useAuth();
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= 800;

  // =====================================================
  // FORM
  // =====================================================

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [role, setRole]               = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]   = useState(false);
  const [emailFocused, setEmailFocused]     = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  // =====================================================
  // ANIMATIONS
  // =====================================================

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.4)).current;
  const logoFloat   = useRef(new Animated.Value(0)).current;

  const brandAnim = useRef(new Animated.Value(0)).current;

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide   = useRef(new Animated.Value(70)).current;
  const cardScale   = useRef(new Animated.Value(0.92)).current;

  const welcomeAnim  = useRef(new Animated.Value(0)).current;
  const roleAnim     = useRef(new Animated.Value(0)).current;
  const emailAnim    = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;
  const optionsAnim  = useRef(new Animated.Value(0)).current;
  const buttonAnim   = useRef(new Animated.Value(0)).current;

  const buttonScale = useRef(new Animated.Value(1)).current;
  const errorShake  = useRef(new Animated.Value(0)).current;
  const eyeScale    = useRef(new Animated.Value(1)).current;
  const checkboxScale = useRef(new Animated.Value(1)).current;
  const successScale  = useRef(new Animated.Value(0)).current;

  const bubble1 = useRef(new Animated.Value(0)).current;
  const bubble2 = useRef(new Animated.Value(0)).current;
  const bubble3 = useRef(new Animated.Value(0)).current;

  // =====================================================
  // PAGE ANIMATION
  // =====================================================

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
    ]).start();

    const delays: [Animated.Value, number][] = [
      [brandAnim,    300],
      [cardOpacity,  450],
      [welcomeAnim,  700],
      [roleAnim,     850],
      [emailAnim,   1000],
      [passwordAnim,1150],
      [optionsAnim, 1300],
      [buttonAnim,  1450],
    ];

    delays.forEach(([anim, delay]) => {
      setTimeout(() => {
        Animated.spring(anim, { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }).start();
      }, delay);
    });

    // Card slide/scale in
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(cardSlide, { toValue: 0, friction: 7, tension: 55, useNativeDriver: true }),
        Animated.spring(cardScale, { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }),
      ]).start();
    }, 450);

    // Floating logo loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, { toValue: -8, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(logoFloat, { toValue:  8, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Bubble loops
    const bubbleLoop = (anim: Animated.Value, dur: number, dist: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue:  dist, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: -dist, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();

    bubbleLoop(bubble1, 3500, 40);
    bubbleLoop(bubble2, 4000, 40);
    bubbleLoop(bubble3, 3000, 30);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================================
  // ERROR SHAKE
  // =====================================================

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(errorShake, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue:  12, duration: 60, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue:  -8, duration: 60, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue:   8, duration: 60, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue:   0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async () => {
    setError('');

    // Pure validation — no UI coupling
    const validationError = validateLoginForm(email, password);
    if (validationError) {
      setError(validationError);
      shakeError();
      return;
    }

    setLoading(true);

    try {
      // login() returns the AuthUser synchronously (no state-read race condition).
      const returnedUser = await login(email.trim().toLowerCase(), password);

      // Success animation
      Animated.spring(successScale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }).start();

      // Navigate based on the role returned directly from login().
      // We do NOT read user?.role from React state here because
      // setState is async and the value may still be null at this point.
      const route = getRoleRoute(returnedUser.role);

      if (route) {
        // Short delay only for the success animation to be visible, not for state.
        setTimeout(() => {
          router.replace(route as never);
        }, 600);
      } else {
        setError(
          `Unrecognised account role "${returnedUser.role}". Please contact your administrator.`
        );
        shakeError();
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr?.statusCode === 403) {
        setError('Your account has been disabled. Please contact the school administrator.');
      } else if (apiErr?.statusCode === 0) {
        setError('Cannot reach the server. Please check your network connection.');
      } else {
        setError(apiErr?.message ?? 'Login failed. Please check your credentials and try again.');
      }
      shakeError();
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // BUTTON / EYE / REMEMBER PRESS
  // =====================================================

  const pressLogin = () => {
    Animated.sequence([
      Animated.spring(buttonScale, { toValue: 0.94, friction: 5, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1,    friction: 5, useNativeDriver: true }),
    ]).start();
    handleLogin();
  };

  const togglePassword = () => {
    Animated.sequence([
      Animated.spring(eyeScale, { toValue: 0.7, friction: 4, useNativeDriver: true }),
      Animated.spring(eyeScale, { toValue: 1,   friction: 4, useNativeDriver: true }),
    ]).start();
    setShowPassword(v => !v);
  };

  const toggleRemember = () => {
    Animated.sequence([
      Animated.spring(checkboxScale, { toValue: 0.7, friction: 4, useNativeDriver: true }),
      Animated.spring(checkboxScale, { toValue: 1,   friction: 4, useNativeDriver: true }),
    ]).start();
    setRememberMe(v => !v);
  };

  // =====================================================
  // SLIDE ANIMATION HELPER
  // =====================================================

  const slideUp = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.background}>

        {/* BACKGROUND BUBBLES */}
        <LoginBackground bubble1={bubble1} bubble2={bubble2} bubble3={bubble3} />

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
                      translateX: brandAnim.interpolate({
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
                    transform: [{ scale: logoScale }, { translateY: logoFloat }],
                  },
                ]}
              >
                <Text style={styles.logo}>🏫</Text>
              </Animated.View>

              {/* TITLE */}
              <Animated.Text style={[styles.brandTitle, { opacity: brandAnim }]}>
                Smart School
              </Animated.Text>
              <Animated.Text style={[styles.brandTitle, { opacity: brandAnim }]}>
                Management System
              </Animated.Text>

              {/* DESCRIPTION */}
              <Animated.Text style={[styles.brandDescription, { opacity: brandAnim }]}>
                One intelligent platform for students, parents and school staff.
              </Animated.Text>

              {/* FEATURES */}
              <View style={styles.features}>
                <AnimatedFeature icon="✓" text="Student Management"   delay={0}   />
                <AnimatedFeature icon="✓" text="Attendance Tracking"  delay={150} />
                <AnimatedFeature icon="✓" text="Marks & Performance"  delay={300} />
                <AnimatedFeature icon="✓" text="School Administration" delay={450} />
              </View>
            </Animated.View>
          </View>
        )}

        {/* =================================================
            LOGIN CARD
        ================================================= */}

        <Animated.View
          style={[
            styles.loginSection,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardSlide }, { scale: cardScale }],
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.loginScroll,
              { minHeight: Math.max(height, 650) },
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
                      transform: [{ scale: logoScale }, { translateY: logoFloat }],
                    },
                  ]}
                >
                  <View style={styles.mobileLogoCircle}>
                    <Text style={styles.mobileLogo}>🏫</Text>
                  </View>
                  <Text style={styles.mobileBrand}>Smart School</Text>
                  <Text style={styles.mobileSubtitle}>Management System</Text>
                </Animated.View>
              )}

              {/* WELCOME */}
              <Animated.View style={slideUp(welcomeAnim)}>
                <Text style={styles.welcome}>Welcome Back 👋</Text>
                <Text style={styles.description}>
                  Sign in to continue to your dashboard
                </Text>
              </Animated.View>

              {/* ROLE SELECTOR — visual UX hint only; routing uses backend role */}
              <Animated.View style={slideUp(roleAnim)}>
                <Text style={styles.roleLabel}>Who are you?</Text>
                <View style={styles.roleContainer}>
                  <RoleButton icon="🎓" title="Student" selected={role === 'student'} onPress={() => setRole('student')} />
                  <RoleButton icon="👨‍👩‍👧" title="Parent"  selected={role === 'parent'}  onPress={() => setRole('parent')}  />
                  <RoleButton icon="👨‍🏫" title="Teacher" selected={role === 'staff'}   onPress={() => setRole('staff')}   />
                </View>
              </Animated.View>

              {/* EMAIL */}
              <Animated.View style={slideUp(emailAnim)}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputContainer, emailFocused && styles.inputFocused]}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={text => { setEmail(text); setError(''); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </Animated.View>

              {/* PASSWORD */}
              <Animated.View style={slideUp(passwordAnim)}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputContainer, passwordFocused && styles.inputFocused]}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={text => { setPassword(text); setError(''); }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <Animated.View style={{ transform: [{ scale: eyeScale }] }}>
                    <Pressable style={styles.eyeButton} onPress={togglePassword}>
                      <Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>
                    </Pressable>
                  </Animated.View>
                </View>
              </Animated.View>

              {/* ERROR */}
              {error !== '' && (
                <Animated.View
                  style={[styles.errorBox, { transform: [{ translateX: errorShake }] }]}
                >
                  <View style={styles.errorCircle}>
                    <Text style={styles.errorIcon}>!</Text>
                  </View>
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              )}

              {/* OPTIONS */}
              <Animated.View style={slideUp(optionsAnim)}>
                <View style={styles.optionsRow}>
                  <Pressable style={styles.rememberContainer} onPress={toggleRemember}>
                    <Animated.View
                      style={[
                        styles.checkbox,
                        rememberMe && styles.checkboxActive,
                        { transform: [{ scale: checkboxScale }] },
                      ]}
                    >
                      {rememberMe && <Text style={styles.checkboxTick}>✓</Text>}
                    </Animated.View>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </Pressable>
                  <Pressable>
                    <Text style={styles.forgot}>Forgot Password?</Text>
                  </Pressable>
                </View>
              </Animated.View>

              {/* LOGIN BUTTON */}
              <Animated.View
                style={[
                  slideUp(buttonAnim),
                  {
                    transform: [
                      { translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
                      { scale: buttonScale },
                    ],
                  },
                ]}
              >
                <Pressable
                  style={[styles.loginButton, loading && styles.loadingButton]}
                  onPress={pressLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text style={styles.loadingText}>Signing in...</Text>
                    </View>
                  ) : (
                    <Text style={styles.loginButtonText}>
                      LOGIN AS{' '}
                      {role === 'student' ? 'STUDENT' : role === 'parent' ? 'PARENT' : 'TEACHER'}{' '}
                      →
                    </Text>
                  )}
                </Pressable>
              </Animated.View>

              {/* SUCCESS */}
              <Animated.View
                pointerEvents="none"
                style={[styles.successCircle, { transform: [{ scale: successScale }] }]}
              >
                <Text style={styles.successText}>✓</Text>
              </Animated.View>

              {/* FOOTER */}
              <Text style={styles.footer}>🔐 Secure School Login</Text>
              <Text style={styles.version}>Smart School Management • v1.0</Text>

            </View>
          </ScrollView>
        </Animated.View>

      </View>
    </KeyboardAvoidingView>
  );
}