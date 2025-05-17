"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { Geist, Geist_Mono } from "next/font/google";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/providers/themeProvider";
import { ToastContainer } from "react-toastify";
import Navbar from "@/components/user/layout/nav/NavBar";
import Footer from "@/components/user/home/Footer";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

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
                    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
                        <div className="flex flex-col items-center">
                            {/* Pulsing circles animation */}
                            <div className="flex space-x-2 mb-4">
                                <div className="w-4 h-4 rounded-full bg-purple-600 animate-[pulse_1.5s_ease-in-out_0s_infinite]"></div>
                                <div className="w-4 h-4 rounded-full bg-purple-500 animate-[pulse_1.5s_ease-in-out_0.2s_infinite]"></div>
                                <div className="w-4 h-4 rounded-full bg-purple-400 animate-[pulse_1.5s_ease-in-out_0.4s_infinite]"></div>
                            </div>
                            
                            {/* Logo/brand placeholder - can be replaced with your actual logo */}
                            <div className="relative w-16 h-16 mb-3">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 animate-spin-slow"></div>
                                <div className="absolute inset-1 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">B</div>
                                </div>
                            </div>
                            
                            {/* Loading text with shimmer effect */}
                            <div className="text-gray-800 dark:text-gray-200 font-medium relative overflow-hidden">
                                <span className="relative z-10">Loading Bookly</span>
                                <div className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-purple-400/20 to-transparent shimmer"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Custom animation styles */}
                    <style jsx global>{`
                        @keyframes shimmer {
                            0% {
                                transform: translateX(-100%);
                            }
                            100% {
                                transform: translateX(100%);
                            }
                        }
                        
                        .shimmer {
                            animation: shimmer 2s infinite;
                        }
                        
                        @keyframes spin-slow {
                            0% {
                                transform: rotate(0deg);
                            }
                            100% {
                                transform: rotate(360deg);
                            }
                        }
                        
                        .animate-spin-slow {
                            animation: spin-slow 3s linear infinite;
                        }
                    `}</style>
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
                    <Navbar />
                    {children}
                    <Footer />
                </ThemeProvider>
            </body>
        </html>
    );
}