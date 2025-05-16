"use client";

import { useEffect, useState } from "react";
import { setCookie, getCookie } from "cookies-next";
import { useRouter } from "next/navigation";

const LanguageSwitcher = () => {
    const router = useRouter();
    const [lang, setLang] = useState("");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        const currentLocale = getCookie("locale")?.toString() || "en";
        setLang(currentLocale);
        setIsClient(true);
    }, []);

    const toggleLanguage = () => {
        if (!isClient) return;

        const newLang = lang === "en" ? "ar" : "en";

        setLang(newLang);

        setCookie("locale", newLang, {
            maxAge: 60 * 60 * 24 * 365,
            path: "/",
        });

        window.location.reload();
    };

    if (!isClient) {
        return null;
    }

    return (
        <div className="flex flex-col items-end">
            <button
                onClick={toggleLanguage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
                {lang === "en" ? "العربية" : "English"}
            </button>
            <div className="text-xs text-gray-400 mt-1">
                Current: {lang}
            </div>
        </div>
    );
};

export default LanguageSwitcher;