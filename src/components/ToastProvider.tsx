/**
 * ToastProvider — global in-app toast / snackbar system.
 *
 * Usage:
 *   1. Wrap app root with <ToastProvider />
 *   2. Call useToast() from any screen to show toasts
 *
 * Example:
 *   const { showToast } = useToast();
 *   showToast({ message: 'Saved!', type: 'success' });
 */
import React, {
  createContext, useContext, useState, useCallback, useRef, ReactNode,
} from 'react';
import {
  View, Text, StyleSheet, Animated, Platform, TouchableOpacity,
} from 'react-native';
import { nativeDriver } from '../utils/animation';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (opts: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  hideToast: () => {},
});

export const useToast = () => useContext(ToastContext);

const COLORS: Record<ToastType, { bg: string; text: string; border: string; icon: string }> = {
  success: { bg: '#ECFDF5', text: '#065F46', border: '#10B981', icon: '✅' },
  error:   { bg: '#FEF2F2', text: '#991B1B', border: '#EF4444', icon: '❌' },
  warning: { bg: '#FFFBEB', text: '#92400E', border: '#F59E0B', icon: '⚠️' },
  info:    { bg: '#EEF2FF', text: '#3730A3', border: '#4F46E5', icon: 'ℹ️' },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const c = COLORS[toast.type];

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: nativeDriver }),
      Animated.delay(toast.duration ?? 3000),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: nativeDriver }),
    ]).start(() => onDismiss());
  }, []);

  return (
    <Animated.View style={[styles.toast, { backgroundColor: c.bg, borderLeftColor: c.border, opacity }]}>
      <Text style={styles.toastIcon}>{c.icon}</Text>
      <Text style={[styles.toastMsg, { color: c.text }]} numberOfLines={2}>{toast.message}</Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={[styles.dismiss, { color: c.text }]}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

let _globalCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = `toast_${++_globalCounter}`;
    setToasts(prev => [...prev.slice(-3), { ...opts, id }]); // max 4 at once
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={() => hideToast(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const IS_WEB = Platform.OS === 'web';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: IS_WEB ? 24 : 80,
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
    pointerEvents: 'box-none',
  } as any,
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 6,
  },
  toastIcon: { fontSize: 16 },
  toastMsg: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  dismiss: { fontSize: 14, fontWeight: '700', padding: 2 },
});
