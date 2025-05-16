"use client";

import { useTranslations } from "@/hooks/useTranslations";

export default function Home() {
    const { t, locale, isLoaded } = useTranslations();

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse">Loading translations...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className={`text-4xl font-bold mb-6 ${locale === "ar" ? "font-plex-arabic" : ""}`}>
                    {t("home.title")}
                </h1>

                <p className="text-lg mb-8">
                    {t("home.description")}
                </p>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-2xl mb-4">
                        {t("home.greeting", { name: "User" })}
                    </h2>

                    <nav className="mt-6">
                        <ul className="flex flex-col md:flex-row gap-4">
                            <li>
                                <a href="#" className="text-blue-400 hover:underline">
                                    {t("navigation.home")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-blue-400 hover:underline">
                                    {t("navigation.about")}
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-blue-400 hover:underline">
                                    {t("navigation.contact")}
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>


            </div>
        </main>
    );
}