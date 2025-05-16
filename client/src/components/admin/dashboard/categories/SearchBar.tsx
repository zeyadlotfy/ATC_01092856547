import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    isDark: boolean;
    t: (key: string) => string;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm, isDark, t }) => {
    const { locale } = useTranslations();
    const isRtl = locale === "ar";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative flex-grow max-w-md ${isRtl ? "ml-0 mr-auto" : "ml-auto mr-0"}`}
        >
            <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center pl-3 pointer-events-none">
                    <svg
                        className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`block w-full p-2 pl-10 text-sm rounded-lg ${isDark
                            ? "bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-purple-500 focus:border-purple-500"
                            : "bg-gray-50 border border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                        }`}
                    placeholder={t("categories.search")}
                    aria-label={t("categories.search")}
                />
                {searchTerm && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setSearchTerm("")}
                        aria-label="Clear search"
                    >
                        <svg
                            className={`w-4 h-4 ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default SearchBar;