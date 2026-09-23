/**
 * OfflineBanner — network connectivity detector + warning strip.
 *
 * Shows a red banner when the device loses internet connectivity.
 * Automatically hides when connection is restored.
 *
 * Usage: Mount once near the root layout above the tab navigator.
 *
 *   <OfflineBanner />
 *   <Slot />
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';

function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setIsOnline(navigator.onLine);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    // On native, we do a lightweight HTTP HEAD probe every 15s
    let mounted = true;
    const probe = async () => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        await fetch('https://httpbin.org/get', { method: 'HEAD', signal: ctrl.signal });
        clearTimeout(t);
        if (mounted) setIsOnline(true);
      } catch {
        if (mounted) setIsOnline(false);
      }
    };
    probe();
    const interval = setInterval(probe, 15_000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return isOnline;
}

export function OfflineBanner() {
  const isOnline = useNetworkStatus();
  const slideY = useRef(new Animated.Value(-60)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 80 }).start();
    } else {
      Animated.timing(slideY, { toValue: -60, duration: 300, useNativeDriver: true })
        .start(() => setVisible(false));
    }
  }, [isOnline]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideY }] }]}>
      <Text style={styles.icon}>📡</Text>
      <View>
        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.sub}>Some features may be unavailable</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9998,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 52 : 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 10,
  },
  icon: { fontSize: 20 },
  title: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
  sub: { color: '#94A3B8', fontSize: 11, marginTop: 1 },
});
