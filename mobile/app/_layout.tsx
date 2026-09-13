import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getToken } from '../utils/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGate() {
  const [checked, setChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    getToken().then((token) => {
      setHasToken(!!token);
      setChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!checked) return;

    const inLoginPage = segments[0] === 'login';

    if (!hasToken && !inLoginPage) {
      router.replace('/login');
    } else if (hasToken && inLoginPage) {
      router.replace('/(tabs)');
    }
  }, [checked, hasToken, segments]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGate />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}