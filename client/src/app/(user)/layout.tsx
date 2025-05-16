"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { Geist, Geist_Mono } from "next/font/google";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/providers/themeProvider";
import { ToastContainer } from "react-toastify";
import LanguageSwitcher from "@/components/en/layout/nav/LanguageSwitcher";
import ButtonTheme from "@/components/en/layout/ButtonTheme";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// Font for Arabic
const plexArabic = IBM_Plex_Sans_Arabic({
    variable: "--font-plex-arabic",
    subsets: ["arabic"],
    weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [currentLocale, setCurrentLocale] = useState("en");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const locale = getCookie("locale")?.toString() || "en";
        setCurrentLocale(locale);
        setMounted(true);
    }, []);

    const dir = currentLocale === "ar" ? "rtl" : "ltr";

    const fontClass = currentLocale === "ar"
        ? plexArabic.variable
        : `${geistSans.variable} ${geistMono.variable}`;

    if (!mounted) {
        return (
            <html lang="en" dir="ltr">
                <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-pulse">Loading...</div>
                    </div>
                </body>
            </html>
        );
    }

    return (
        <html lang={currentLocale} dir={dir}>
            <body className={`${fontClass} antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    <ToastContainer
                        position="top-right"
                        theme="dark"
                        rtl={currentLocale === "ar"}
                    />
                    <div className="flex justify-between p-4">
                        <ButtonTheme />
                        <LanguageSwitcher />
                    </div>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}