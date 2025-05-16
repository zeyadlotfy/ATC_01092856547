"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { Geist, Geist_Mono } from "next/font/google";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import '../../../globals.css';

import { ThemeProvider } from "@/components/providers/themeProvider";
import { ToastContainer } from "react-toastify";
import PurpleDarkLoading from "@/components/en/layout/loading";
import AdminNavbar from "@/components/admin/dashboard/nav/Navbar";

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
        setMounted(true);
        setCurrentLocale(locale);
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
                        <PurpleDarkLoading />
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
                        position={currentLocale === "ar" ? "top-left" : "top-right"}
                        theme="dark"
                        rtl={currentLocale === "ar"}
                    />
                    <div className="flex">
                        <AdminNavbar />
                        <div className={`flex-1 lg:ml-64 ${currentLocale === "ar" ? "lg:mr-64 lg:ml-0" : ""} min-h-screen p-6`}>
                            {children}
                        </div>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}