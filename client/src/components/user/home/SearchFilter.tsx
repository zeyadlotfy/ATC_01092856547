import { motion } from "framer-motion";
import { SearchIcon } from "lucide-react";

type Category = {
    id: string | number;
    name: string;
};

interface SearchFilterProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    selectedCategory: string;
    setSelectedCategory: (value: string) => void;
    categories: Category[];
    isDark: boolean;
    t: (key: string) => string;
}

const SearchFilter = ({
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    isDark,
    t
}: SearchFilterProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`p-6 rounded-xl shadow-lg ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white"
                }`}
        >
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                    <div className={`flex items-center px-4 py-3 rounded-lg ${isDark ? "bg-gray-700 border border-gray-600" : "bg-gray-100"
                        }`}>
                        <SearchIcon
                            className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t("search.placeholder")}
                            className={`ml-2 w-full bg-transparent border-none focus:ring-0 focus:outline-none ${isDark ? "text-white placeholder-gray-400" : "text-gray-800 placeholder-gray-500"
                                }`}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className={`p-1 rounded-full ${isDark ? "hover:bg-gray-600" : "hover:bg-gray-200"
                                    }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={isDark ? "text-gray-400" : "text-gray-500"}
                                >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Filter */}
                <div className="w-full md:w-56">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-gray-100 border-gray-200 text-gray-800"
                            }`}
                    >
                        <option value="">{t("search.allCategories")}</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Search Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                >
                    {t("search.searchEvents")}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default SearchFilter;