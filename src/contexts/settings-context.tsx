'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SettingsContextType {
    darkMode: boolean;
    fontSize: string;
    language: string;
    setDarkMode: (enabled: boolean) => void;
    setFontSize: (size: string) => void;
    setLanguage: (lang: string) => void;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
    darkMode: false,
    fontSize: 'medium',
    language: 'en-GB',
    setDarkMode: () => { },
    setFontSize: () => { },
    setLanguage: () => { },
    loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [darkMode, setDarkModeState] = useState(false);
    const [fontSize, setFontSizeState] = useState('medium');
    const [language, setLanguageState] = useState('en-GB');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setDarkModeState(userData.darkMode || false);
                        setFontSizeState(userData.fontSize || 'medium');
                        setLanguageState(userData.language || 'en-GB');
                    }
                } catch (error) {
                    console.error('Error loading user settings:', error);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Apply theme to document
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Apply font size to document
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--font-size-multiplier',
            fontSize === 'small' ? '0.875' :
                fontSize === 'large' ? '1.125' :
                    fontSize === 'extra-large' ? '1.25' : '1'
        );
    }, [fontSize]);

    const setDarkMode = async (enabled: boolean) => {
        setDarkModeState(enabled);
        const user = auth.currentUser;
        if (user) {
            try {
                await updateDoc(doc(db, 'users', user.uid), {
                    darkMode: enabled,
                    updatedAt: new Date()
                });
            } catch (error) {
                console.error('Error updating dark mode setting:', error);
            }
        }
    };

    const setFontSize = async (size: string) => {
        setFontSizeState(size);
        const user = auth.currentUser;
        if (user) {
            try {
                await updateDoc(doc(db, 'users', user.uid), {
                    fontSize: size,
                    updatedAt: new Date()
                });
            } catch (error) {
                console.error('Error updating font size setting:', error);
            }
        }
    };

    const setLanguage = async (lang: string) => {
        setLanguageState(lang);
        const user = auth.currentUser;
        if (user) {
            try {
                await updateDoc(doc(db, 'users', user.uid), {
                    language: lang,
                    updatedAt: new Date()
                });
            } catch (error) {
                console.error('Error updating language setting:', error);
            }
        }
    };

    const value = {
        darkMode,
        fontSize,
        language,
        setDarkMode,
        setFontSize,
        setLanguage,
        loading,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
} 