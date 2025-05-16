"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import axios from "axios";
import { BACKEND_URL } from "@/lib/constants/backend";
import { toast } from "react-toastify";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    MapPin,
    Search,
    ChevronDown,
    Filter,
    X,
    Building,
    Users,
    Globe,
    Flag,
    ChevronsLeft,
    ChevronsRight,
    ChevronLeft,
    ChevronRight,
    Map
} from "lucide-react";

interface VenueType {
    id: string;
    name: string;
    nameAr: string;
    address: string;
    city: string;
    country: string;
    capacity: number;
    createdAt: string;
    updatedAt: string;
    imageUrl?: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 12
        }
    }
};

const VenuesPage = () => {
    const searchParams = useSearchParams();
    const { theme } = useTheme();
    const { t, locale } = useTranslations();
    const [venues, setVenues] = useState<VenueType[]>([]);
    const [filteredVenues, setFilteredVenues] = useState<VenueType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [countries, setCountries] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [selectedCountry, setSelectedCountry] = useState(searchParams.get("country") || "");
    const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "");
    const [selectedCapacity, setSelectedCapacity] = useState(searchParams.get("capacity") || "");
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const venuesPerPage = 12;

    const isRtl = locale === "ar";
    const isDark = theme === "dark";

    useEffect(() => {
        const htmlEl = document.documentElement;
        if (isDark) {
            htmlEl.classList.add('dark');
        } else {
            htmlEl.classList.remove('dark');
        }
    }, [theme, isDark]);

    useEffect(() => {
        fetchVenues();
        const initialCountry = searchParams.get("country") || "";
        if (initialCountry) {
            setSelectedCountry(initialCountry);
            if (!activeFilters.includes("country")) {
                setActiveFilters(prev => [...prev, "country"]);
            }
        }

        const initialCity = searchParams.get("city") || "";
        if (initialCity) {
            setSelectedCity(initialCity);
            if (!activeFilters.includes("city")) {
                setActiveFilters(prev => [...prev, "city"]);
            }
        }

        const initialCapacity = searchParams.get("capacity") || "";
        if (initialCapacity) {
            setSelectedCapacity(initialCapacity);
            if (!activeFilters.includes("capacity")) {
                setActiveFilters(prev => [...prev, "capacity"]);
            }
        }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();

        if (searchTerm) params.set("q", searchTerm);
        if (selectedCountry) params.set("country", selectedCountry);
        if (selectedCity) params.set("city", selectedCity);
        if (selectedCapacity) params.set("capacity", selectedCapacity);

        const newUrl = `/venues${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState({}, '', newUrl);

        if (venues.length > 0) {
            const filtered = applyFilters(venues);
            setFilteredVenues(filtered);
            setTotalPages(Math.ceil(filtered.length / venuesPerPage));
        }
    }, [searchTerm, selectedCountry, selectedCity, selectedCapacity, currentPage, venues]);

    const fetchVenues = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKEND_URL}/venues`);

            if (response.status === 200) {
                let venueData: VenueType[];

                if (response.data.data) {
                    venueData = response.data.data;
                } else if (Array.isArray(response.data)) {
                    venueData = response.data;
                } else {
                    venueData = [];
                }

                const uniqueCountries = [...new Set(venueData.map(venue => venue.country))].filter(Boolean);
                setCountries(uniqueCountries);

                const uniqueCities = [...new Set(venueData.map(venue => venue.city))].filter(Boolean);
                setCities(uniqueCities);

                setVenues(venueData);
                const filtered = applyFilters(venueData);
                setFilteredVenues(filtered);
                setTotalPages(Math.ceil(filtered.length / venuesPerPage));
            }

            setLoading(false);
        } catch (e) {
            console.error("Error fetching venues:", e);
            setError("Failed to fetch venues");
            toast.error(t("venues.errorFetchingVenues"));
            setLoading(false);
        }
    };

    const applyFilters = (venuesList: VenueType[]) => {
        let result = [...venuesList];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(venue =>
                (venue.name && venue.name.toLowerCase().includes(term)) ||
                (venue.nameAr && venue.nameAr.toLowerCase().includes(term)) ||
                (venue.address && venue.address.toLowerCase().includes(term)) ||
                (venue.city && venue.city.toLowerCase().includes(term)) ||
                (venue.country && venue.country.toLowerCase().includes(term))
            );
        }

        if (selectedCountry) {
            result = result.filter(venue => venue.country === selectedCountry);
        }

        if (selectedCity) {
            result = result.filter(venue => venue.city === selectedCity);
        }

        if (selectedCapacity) {
            switch (selectedCapacity) {
                case "small":
                    result = result.filter(venue => venue.capacity < 100);
                    break;
                case "medium":
                    result = result.filter(venue => venue.capacity >= 100 && venue.capacity < 500);
                    break;
                case "large":
                    result = result.filter(venue => venue.capacity >= 500 && venue.capacity < 1000);
                    break;
                case "xl":
                    result = result.filter(venue => venue.capacity >= 1000);
                    break;
            }
        }
        return result;
    };

    const getCurrentPageVenues = () => {
        const startIdx = (currentPage - 1) * venuesPerPage;
        const endIdx = startIdx + venuesPerPage;
        return filteredVenues.slice(startIdx, endIdx);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedCountry("");
        setSelectedCity("");
        setSelectedCapacity("");
        setActiveFilters([]);
        setCurrentPage(1);
    };

    const removeFilter = (filterType: string) => {
        switch (filterType) {
            case "country":
                setSelectedCountry("");
                break;
            case "city":
                setSelectedCity("");
                break;
            case "capacity":
                setSelectedCapacity("");
                break;
            default:
                break;
        }
        setActiveFilters(prev => prev.filter(item => item !== filterType));
    };

    const addFilter = (filterType: string) => {
        if (!activeFilters.includes(filterType)) {
            setActiveFilters(prev => [...prev, filterType]);
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getCapacityLabel = (capacityOption: string) => {
        switch (capacityOption) {
            case "small": return t("venues.filters.capacitySmall");
            case "medium": return t("venues.filters.capacityMedium");
            case "large": return t("venues.filters.capacityLarge");
            case "xl": return t("venues.filters.capacityXL");
            default: return "";
        }
    };

    const getFilterLabel = (filterType: string) => {
        switch (filterType) {
            case "country":
                return selectedCountry;
            case "city":
                return selectedCity;
            case "capacity":
                return getCapacityLabel(selectedCapacity);
            default:
                return "";
        }
    };

    const toggleFilters = () => {
        setIsFiltersOpen(!isFiltersOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isRtl ? "rtl" : "ltr"}>
            <section className="bg-gradient-to-br from-indigo-700 to-blue-900 py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            {t("venues.pageTitle")}
                        </h1>
                        <p className="text-lg text-indigo-100 max-w-3xl mx-auto mb-8">
                            {t("venues.pageSubtitle")}
                        </p>

                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            onSubmit={handleSearch}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="relative flex rounded-lg overflow-hidden shadow-lg">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t("venues.searchPlaceholder")}
                                    className={`w-full py-4 ${isRtl ? 'pr-12' : 'pl-12'} px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-lg`}
                                />
                                <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} text-gray-400`}>
                                    <Search className="w-6 h-6" />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 flex items-center justify-center transition-colors"
                                >
                                    {t("venues.search")}
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                </div>
            </section>

            <section className="py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row lg:gap-8">
                        <div className="hidden lg:block lg:w-1/4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-fit">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    {t("venues.filters.title")}
                                </h3>
                                <button
                                    onClick={resetFilters}
                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    {t("venues.filters.resetAll")}
                                </button>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                    {t("venues.filters.countriesTitle")}
                                </h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    {countries.map((country) => (
                                        <div key={country} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`country-${country}`}
                                                name="country"
                                                value={country}
                                                checked={selectedCountry === country}
                                                onChange={() => {
                                                    setSelectedCountry(country);
                                                    addFilter("country");
                                                }}
                                                className="w-4 h-4 text-indigo-600 rounded-full border-gray-300 focus:ring-indigo-500"
                                            />
                                            <label
                                                htmlFor={`country-${country}`}
                                                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                            >
                                                {country}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                    {t("venues.filters.citiesTitle")}
                                </h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    {cities
                                        .filter(city => !selectedCountry || venues.some(v => v.city === city && v.country === selectedCountry))
                                        .map((city) => (
                                            <div key={city} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id={`city-${city}`}
                                                    name="city"
                                                    value={city}
                                                    checked={selectedCity === city}
                                                    onChange={() => {
                                                        setSelectedCity(city);
                                                        addFilter("city");
                                                    }}
                                                    className="w-4 h-4 text-indigo-600 rounded-full border-gray-300 focus:ring-indigo-500"
                                                />
                                                <label
                                                    htmlFor={`city-${city}`}
                                                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                                >
                                                    {city}
                                                </label>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                    {t("venues.filters.capacityTitle")}
                                </h4>
                                <div className="space-y-2">
                                    {["small", "medium", "large", "xl"].map((capacityOption) => (
                                        <div key={capacityOption} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`capacity-${capacityOption}`}
                                                name="capacity"
                                                value={capacityOption}
                                                checked={selectedCapacity === capacityOption}
                                                onChange={() => {
                                                    setSelectedCapacity(capacityOption);
                                                    addFilter("capacity");
                                                }}
                                                className="w-4 h-4 text-indigo-600 rounded-full border-gray-300 focus:ring-indigo-500"
                                            />
                                            <label
                                                htmlFor={`capacity-${capacityOption}`}
                                                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                            >
                                                {getCapacityLabel(capacityOption)}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-3/4">
                            <div className="lg:hidden mb-4">
                                <button
                                    onClick={toggleFilters}
                                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-4 text-gray-700 dark:text-gray-200"
                                >
                                    <Filter className="w-5 h-5" />
                                    {t("venues.filters.title")}
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isFiltersOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mt-2 p-4 overflow-hidden"
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                {t("venues.filters.title")}
                                            </h3>
                                            <button
                                                onClick={resetFilters}
                                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                {t("venues.filters.resetAll")}
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <details className="group">
                                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {t("venues.filters.countriesTitle")}
                                                    </h4>
                                                    <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                                                </summary>
                                                <div className="pt-2 pl-4 space-y-2 max-h-60 overflow-y-auto">
                                                    {countries.map((country) => (
                                                        <div key={country} className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                id={`mobile-country-${country}`}
                                                                name="country-mobile"
                                                                value={country}
                                                                checked={selectedCountry === country}
                                                                onChange={() => {
                                                                    setSelectedCountry(country);
                                                                    addFilter("country");
                                                                    setIsFiltersOpen(false);
                                                                }}
                                                                className="w-4 h-4 text-indigo-600 rounded-full border-gray-300 focus:ring-indigo-500"
                                                            />
                                                            <label
                                                                htmlFor={`mobile-country-${country}`}
                                                                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                                            >
                                                                {country}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>

                                            <details className="group">
                                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {t("venues.filters.citiesTitle")}
                                                    </h4>
                                                    <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                                                </summary>
                                                <div className="pt-2 pl-4 space-y-2 max-h-60 overflow-y-auto">
                                                    {cities
                                                        .filter(city => !selectedCountry || venues.some(v => v.city === city && v.country === selectedCountry))
                                                        .map((city) => (
                                                            <div key={city} className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    id={`mobile-city-${city}`}
                                                                    name="city-mobile"
                                                                    value={city}
                                                                    checked={selectedCity === city}
                                                                    onChange={() => {
                                                                        setSelectedCity(city);
                                                                        addFilter("city");
                                                                        setIsFiltersOpen(false);
                                                                    }}
                                                                    className="w-4 h-4 text-indigo-600 rounded-full border-gray-300 focus:ring-indigo-500"
                                                                />
                                                                <label
                                                                    htmlFor={`mobile-city-${city}`}
                                                                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                                                >
                                                                    {city}
                                                                </label>
                                                            </div>
                                                        ))}
                                                </div>
                                            </details>

                                            <details className="group">
                                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {t("venues.filters.capacityTitle")}
                                                    </h4>
                                                    <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                                                </summary>
                                                <div className="pt-2 pl-4 space-y-2">
                                                    {["small", "medium", "large", "xl"].map((capacityOption) => (
                                                        <div key={capacityOption} className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                id={`mobile-capacity-${capacityOption}`}
                                                                name="capacity-mobile"
                                                                value={capacityOption}
                                                                checked={selectedCapacity === capacityOption}
                                                                onChange={() => {
                                                                    setSelectedCapacity(capacityOption);
                                                                    addFilter("capacity");
                                                                    setIsFiltersOpen(false);
                                                                }}
                                                                className="w-4 h-4 text-indigo-600 rounded-full border-gray-300 focus:ring-indigo-500"
                                                            />
                                                            <label
                                                                htmlFor={`mobile-capacity-${capacityOption}`}
                                                                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                                            >
                                                                {getCapacityLabel(capacityOption)}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {activeFilters.length > 0 && (
                                <div className="mb-6 flex flex-wrap gap-2">
                                    {activeFilters.map(filter => (
                                        <div key={filter} className="flex items-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full text-sm">
                                            <span>{t(`venues.filters.${filter}`)}: {getFilterLabel(filter)}</span>
                                            <button
                                                onClick={() => removeFilter(filter)}
                                                className="ml-2 focus:outline-none hover:text-indigo-900 dark:hover:text-indigo-200"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={resetFilters}
                                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
                                    >
                                        {t("venues.filters.clearAll")}
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-6">
                                <p className="text-gray-700 dark:text-gray-300">
                                    {loading
                                        ? t("venues.loading")
                                        : t("venues.resultsCount", { count: String(filteredVenues.length) })}
                                </p>
                            </div>

                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col justify-center items-center py-32"
                                >
                                    <div className="w-16 h-16 relative">
                                        <div className="w-full h-full rounded-full border-4 border-indigo-600/30"></div>
                                        <div className="w-full h-full absolute top-0 left-0 rounded-full border-t-4 border-r-4 border-indigo-600 animate-spin"></div>
                                    </div>
                                    <p className="mt-4 text-gray-600 dark:text-gray-400">{t("venues.loading")}</p>
                                </motion.div>
                            )}

                            {!loading && filteredVenues.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center py-20 px-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                                        <MapPin className="h-8 w-8 text-indigo-500" />
                                    </div>
                                    <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">
                                        {t("venues.noVenuesFound")}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                                        {t("venues.tryDifferentSearch")}
                                    </p>
                                    <button
                                        onClick={resetFilters}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                                    >
                                        {t("venues.resetFilters")}
                                    </button>
                                </motion.div>
                            )}

                            {!loading && filteredVenues.length > 0 && (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    <AnimatePresence>
                                        {getCurrentPageVenues().map((venue) => (
                                            <motion.div
                                                key={venue.id}
                                                variants={itemVariants}
                                                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow h-full flex flex-col"
                                            >
                                                <div className="h-48 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center">
                                                    <Building className="h-16 w-16 text-indigo-400" />
                                                </div>

                                                <div className="p-6 flex-grow flex flex-col">
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                        {isRtl ? venue.nameAr : venue.name}
                                                    </h3>

                                                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 flex-grow">
                                                        <div className="flex items-start">
                                                            <MapPin className={`w-4 h-4 ${isRtl ? 'ml-1.5' : 'mr-1.5'} mt-0.5 text-indigo-500`} />
                                                            <span>{venue.address}</span>
                                                        </div>

                                                        <div className="flex items-center">
                                                            <Flag className={`w-4 h-4 ${isRtl ? 'ml-1.5' : 'mr-1.5'} text-indigo-500`} />
                                                            <span>{venue.city}</span>
                                                        </div>

                                                        <div className="flex items-center">
                                                            <Globe className={`w-4 h-4 ${isRtl ? 'ml-1.5' : 'mr-1.5'} text-indigo-500`} />
                                                            <span>{venue.country}</span>
                                                        </div>

                                                        <div className="flex items-center">
                                                            <Users className={`w-4 h-4 ${isRtl ? 'ml-1.5' : 'mr-1.5'} text-indigo-500`} />
                                                            <span>{t("venues.capacity")}: {venue.capacity}</span>
                                                        </div>
                                                    </div>

                                                    <Link href={`/venues/${venue.id}`} className="mt-4">
                                                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors flex justify-center items-center">
                                                            <Map className={`w-4 h-4 ${isRtl ? 'ml-1.5' : 'mr-1.5'}`} />
                                                            {t("venues.viewVenue")}
                                                        </button>
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}

                            {!loading && filteredVenues.length > 0 && totalPages > 1 && (
                                <div className="mt-10 flex justify-center">
                                    <nav className="flex items-center space-x-1 rtl:space-x-reverse">
                                        <button
                                            onClick={() => goToPage(1)}
                                            disabled={currentPage === 1}
                                            className={`px-2 py-2 rounded-md ${currentPage === 1
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/20"
                                                }`}
                                        >
                                            <ChevronsLeft className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-2 py-2 rounded-md ${currentPage === 1
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/20"
                                                }`}
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        <div className="hidden sm:flex items-center space-x-1 rtl:space-x-reverse">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(
                                                    page =>
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        Math.abs(page - currentPage) <= 1
                                                )
                                                .map((page, i, arr) => (
                                                    <React.Fragment key={page}>
                                                        {i > 0 && arr[i - 1] !== page - 1 && (
                                                            <span className="px-2 py-2 text-gray-500">...</span>
                                                        )}
                                                        <button
                                                            onClick={() => goToPage(page)}
                                                            className={`w-10 h-10 rounded-md ${currentPage === page
                                                                ? "bg-indigo-600 text-white"
                                                                : "text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/20"
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    </React.Fragment>
                                                ))}
                                        </div>
                                        <div className="sm:hidden text-sm text-gray-700 dark:text-gray-300">
                                            <span>{currentPage}</span>
                                            <span className="mx-1">/</span>
                                            <span>{totalPages}</span>
                                        </div>

                                        <button
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-2 py-2 rounded-md ${currentPage === totalPages
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/20"
                                                }`}
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() => goToPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className={`px-2 py-2 rounded-md ${currentPage === totalPages
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/20"
                                                }`}
                                        >
                                            <ChevronsRight className="w-5 h-5" />
                                        </button>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(243 244 246 / 1);
          border-radius: 8px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(31 41 55 / 1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgb(209 213 219 / 1);
          border-radius: 8px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgb(75 85 99 / 1);
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
        </div>
    );
};

export default VenuesPage;