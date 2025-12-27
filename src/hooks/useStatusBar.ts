import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export const useStatusBar = (isDark: boolean = true) => {
  useEffect(() => {
    const configureStatusBar = async () => {
      // Only run on native platforms
      if (!Capacitor.isNativePlatform()) return;

      try {
        if (isDark) {
          // Dark theme: light status bar text, dark background
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#0a0a1a' });
        } else {
          // Light theme: dark status bar text, light background
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
        }
        
        // Don't overlay WebView for proper safe area handling
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (error) {
        console.log('StatusBar plugin not available:', error);
      }
    };

    configureStatusBar();
  }, [isDark]);
};
