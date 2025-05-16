"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import axios from "axios";
import { BACKEND_URL } from "@/lib/constants/backend";
import { toast } from "react-toastify";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    Calendar,
    MapPin,
    Search,
    ChevronDown,
    Filter,
    X,
    List,
    ChevronsLeft,
    ChevronsRight,
    ChevronLeft,
    ChevronRight,
    Grid
} from "lucide-react";
import Image from "next/image";
import EventCard from "@/components/user/home/EventCard";
import type { EventType } from "@/app/(user)/page";
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
const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.6,
            ease: "easeOut"
        }
    })
};
const EventsPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { theme } = useTheme();
    const { t, locale } = useTranslations();

    const [events, setEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [venues, setVenues] = useState<any[]>([]);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
    const [selectedVenue, setSelectedVenue] = useState(searchParams.get("venue") || "");
    const [selectedPriceRange, setSelectedPriceRange] = useState(searchParams.get("price") || "");
    const [selectedDate, setSelectedDate] = useState(searchParams.get("date") || "");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const eventsPerPage = 12;

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
        const initialCategory = searchParams.get("category") || "";
        if (initialCategory) {
            setSelectedCategory(initialCategory);
            if (!activeFilters.includes("category")) {
                setActiveFilters(prev => [...prev, "category"]);
            }
        }

        const initialVenue = searchParams.get("venue") || "";
        if (initialVenue) {
            setSelectedVenue(initialVenue);
            if (!activeFilters.includes("venue")) {
                setActiveFilters(prev => [...prev, "venue"]);
            }
        }

        const initialPrice = searchParams.get("price") || "";
        if (initialPrice) {
            setSelectedPriceRange(initialPrice);
            if (!activeFilters.includes("price")) {
                setActiveFilters(prev => [...prev, "price"]);
            }
        }

        const initialDate = searchParams.get("date") || "";
        if (initialDate) {
            setSelectedDate(initialDate);
            if (!activeFilters.includes("date")) {
                setActiveFilters(prev => [...prev, "date"]);
            }
        }
        fetchEvents();
        fetchCategories();
        fetchVenues();
    }, [searchParams]);

    useEffect(() => {
        const params = new URLSearchParams();

        if (searchTerm) params.set("q", searchTerm);
        if (selectedCategory) params.set("category", selectedCategory);
        if (selectedVenue) params.set("venue", selectedVenue);
        if (selectedPriceRange) params.set("price", selectedPriceRange);
        if (selectedDate) params.set("date", selectedDate);

        const newUrl = `/events${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState({}, '', newUrl);

        if (events.length > 0) {
            const filteredEvents = applyFilters(events);

            setTotalPages(Math.ceil(filteredEvents.length / eventsPerPage));

            const startIdx = (currentPage - 1) * eventsPerPage;
            const endIdx = startIdx + eventsPerPage;
            const currentEvents = filteredEvents.slice(startIdx, endIdx);

            setEvents(currentEvents);
        } else {
            fetchEvents();
        }
    }, [searchTerm, selectedCategory, selectedVenue, selectedPriceRange, selectedDate, currentPage]);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKEND_URL}/events`);

            if (response.status === 200) {
                let allEvents = [];

                if (response.data.events) {
                    allEvents = response.data.events;
                } else if (Array.isArray(response.data)) {
                    allEvents = response.data;
                } else if (response.data.data) {
                    allEvents = response.data.data;
                }

                const publishedEvents = allEvents.filter((event: { isPublished: boolean; }) => event.isPublished !== false);
                const filteredEvents = applyFilters(publishedEvents);
                setEvents(filteredEvents);
                setTotalPages(Math.ceil(filteredEvents.length / eventsPerPage));
            }
            setLoading(false);
        } catch (e) {
            console.error("Error fetching events:", e);
            setError("Failed to fetch events");
            toast.error(t("events.errorFetchingEvents"));
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/categories`);
            if (response.status === 200) {
                setCategories(response.data.data);
            }
        } catch (e) {
            toast.error(t("events.errorFetchingCategories"));
        }
    };

    const fetchVenues = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/venues`);
            if (response.status === 200) {
                setVenues(response.data.data);
            }
        } catch (e) {
            toast.error(t("events.errorFetchingVenues"));
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setSelectedVenue("");
        setSelectedPriceRange("");
        setSelectedDate("");
        setActiveFilters([]);
        setCurrentPage(1);
    };

    const removeFilter = (filterType: string) => {
        switch (filterType) {
            case "category":
                setSelectedCategory("");
                break;
            case "venue":
                setSelectedVenue("");
                break;
            case "price":
                setSelectedPriceRange("");
                break;
            case "date":
                setSelectedDate("");
                break;
            default:
                break;
        }
        setActiveFilters(prev => prev.filter(item => item !== filterType));
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        return date;
    };

    const getFilterLabel = (filterType: string) => {
        switch (filterType) {
            case "category":
                const category = categories.find(cat => cat.id === selectedCategory);
                return category ? (isRtl ? category.nameAr : category.name) : "";
            case "venue":
                const venue = venues.find(v => v.id === selectedVenue);
                return venue ? (isRtl ? venue.nameAr : venue.name) : "";
            case "price":
                switch (selectedPriceRange) {
                    case "free": return t("events.filters.free");
                    case "under100": return t("events.filters.under100");
                    case "100to500": return t("events.filters.100to500");
                    case "over500": return t("events.filters.over500");
                    default: return "";
                }
            case "date":
                switch (selectedDate) {
                    case "today": return t("events.filters.today");
                    case "tomorrow": return t("events.filters.tomorrow");
                    case "thisWeek": return t("events.filters.thisWeek");
                    case "thisMonth": return t("events.filters.thisMonth");
                    default: return "";
                }
            default:
                return "";
        }
    };
    const toggleFilters = () => {
        setIsFiltersOpen(!isFiltersOpen);
    };

    const addFilter = (filterType: string) => {
        if (!activeFilters.includes(filterType)) {
            setActiveFilters(prev => [...prev, filterType]);
        }
    };
    const applyFilters = (events: EventType[]) => {
        let result = [...events];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(event =>
                (event.title && event.title.toLowerCase().includes(term)) ||
                (event.titleAr && event.titleAr.toLowerCase().includes(term)) ||
                (event.description && event.description.toLowerCase().includes(term)) ||
                (event.descriptionAr && event.descriptionAr.toLowerCase().includes(term)) ||
                (event.venue && event.venue.name && event.venue.name.toLowerCase().includes(term)) ||
                (event.venue && event.venue.nameAr && event.venue.nameAr.toLowerCase().includes(term)) ||
                (event.category && event.category.name && event.category.name.toLowerCase().includes(term)) ||
                (event.category && event.category.nameAr && event.category.nameAr.toLowerCase().includes(term))
            );
        }

        if (selectedCategory) {
            result = result.filter(event => event.category && event.category.id === selectedCategory);
        }

        if (selectedVenue) {
            result = result.filter(event => event.venue && event.venue.id === selectedVenue);
        }

        if (selectedPriceRange) {
            switch (selectedPriceRange) {
                case "free":
                    result = result.filter(event => event.price === 0);
                    break;
                case "under100":
                    result = result.filter(event => event.price > 0 && event.price < 100);
                    break;
                case "100to500":
                    result = result.filter(event => event.price >= 100 && event.price <= 500);
                    break;
                case "over500":
                    result = result.filter(event => event.price > 500);
                    break;
            }
        }

        if (selectedDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);

            const nextMonth = new Date(today);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            switch (selectedDate) {
                case "today":
                    result = result.filter(event => {
                        const eventDate = new Date(event.startDate);
                        eventDate.setHours(0, 0, 0, 0);
                        return eventDate.getTime() === today.getTime();
                    });
                    break;
                case "tomorrow":
                    result = result.filter(event => {
                        const eventDate = new Date(event.startDate);
                        eventDate.setHours(0, 0, 0, 0);
                        return eventDate.getTime() === tomorrow.getTime();
                    });
                    break;
                case "thisWeek":
                    result = result.filter(event => {
                        const eventDate = new Date(event.startDate);
                        return eventDate >= today && eventDate < nextWeek;
                    });
                    break;
                case "thisMonth":
                    result = result.filter(event => {
                        const eventDate = new Date(event.startDate);
                        return eventDate >= today && eventDate < nextMonth;
                    });
                    break;
            }
        }

        return result;
    };

    const getCurrentPageEvents = () => {
        const filteredEvents = applyFilters(events);

        const startIdx = (currentPage - 1) * eventsPerPage;
        const endIdx = startIdx + eventsPerPage;

        return filteredEvents.slice(startIdx, endIdx);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isRtl ? "rtl" : "ltr"}>
            <section className="bg-gradient-to-br from-purple-700 to-indigo-900 py-16 md:py-24 relative overflow-hidden">
                {/* Background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>

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
                            {t("events.pageTitle")}
                        </h1>
                        <p className="text-lg text-purple-100 max-w-3xl mx-auto mb-8">
                            {t("events.pageSubtitle")}
                        </p>

                        {/* Search Form */}
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
                                    placeholder={t("events.searchPlaceholder")}
                                    className={`w-full py-4 ${isRtl ? 'pr-12' : 'pl-12'} px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-lg`}
                                />
                                <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} text-gray-400`}>
                                    <Search className="w-6 h-6" />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 flex items-center justify-center transition-colors"
                                >
                                    {t("events.search")}
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                </div>
            </section>

            {/* Main content */}
            <section className="py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row lg:gap-8">
                        {/* Filters Panel - Desktop */}
                        <div className="hidden lg:block lg:w-1/4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-fit">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    {t("events.filters.title")}
                                </h3>
                                <button
                                    onClick={resetFilters}
                                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    {t("events.filters.resetAll")}
                                </button>
                            </div>

                            {/* Categories Filter */}
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                    {t("events.filters.categoriesTitle")}
                                </h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    {categories.map((category) => (
                                        <div key={category.id} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`category-${category.id}`}
                                                name="category"
                                                value={category.id}
                                                checked={selectedCategory === category.id}
                                                onChange={() => {
                                                    setSelectedCategory(category.id);
                                                    addFilter("category");
                                                }}
                                                className="w-4 h-4 text-purple-600 rounded-full border-gray-300 focus:ring-purple-500"
                                            />
                                            <label
                                                htmlFor={`category-${category.id}`}
                                                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                            >
                                                {isRtl ? category.nameAr : category.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Venues Filter */}
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                    {t("events.filters.venuesTitle")}
                                </h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    {venues.map((venue) => (
                                        <div key={venue.id} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`venue-${venue.id}`}
                                                name="venue"
                                                value={venue.id}
                                                checked={selectedVenue === venue.id}
                                                onChange={() => {
                                                    setSelectedVenue(venue.id);
                                                    addFilter("venue");
                                                }}
                                                className="w-4 h-4 text-purple-600 rounded-full border-gray-300 focus:ring-purple-500"
                                            />
                                            <label
                                                htmlFor={`venue-${venue.id}`}
                                                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                            >
                                                {isRtl ? venue.nameAr : venue.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                    {t("events.filters.priceTitle")}
                                </h4>
                                <div className="space-y-2">
                                    {["free", "under100", "100to500", "over500"].map((priceOption) => (
                                        <div key={priceOption} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`price-${priceOption}`}
                                                name="price"
                                                value={priceOption}
                                                checked={selectedPriceRange === priceOption}
                                                onChange={() => {
                                                    setSelectedPriceRange(priceOption);
                                                    addFilter("price");
                                                }}
                                                className="w-4 h-4 text-purple-600 rounded-full border-gray-300 focus:ring-purple-500"
                                            />
                                            <label
                                                htmlFor={`price-${priceOption}`}
                                                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                            >
                                                {t(`events.filters.${priceOption}`)}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Date Filter */}
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                    {t("events.filters.dateTitle")}
                                </h4>
                                <div className="space-y-2">
                                    {["today", "tomorrow", "thisWeek", "thisMonth"].map((dateOption) => (
                                        <div key={dateOption} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`date-${dateOption}`}
                                                name="date"
                                                value={dateOption}
                                                checked={selectedDate === dateOption}
                                                onChange={() => {
                                                    setSelectedDate(dateOption);
                                                    addFilter("date");
                                                }}
                                                className="w-4 h-4 text-purple-600 rounded-full border-gray-300 focus:ring-purple-500"
                                            />
                                            <label
                                                htmlFor={`date-${dateOption}`}
                                                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                            >
                                                {t(`events.filters.${dateOption}`)}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Events Content */}
                        <div className="lg:w-3/4">
                            {/* Mobile Filters Button */}
                            <div className="lg:hidden mb-4">
                                <button
                                    onClick={toggleFilters}
                                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-4 text-gray-700 dark:text-gray-200"
                                >
                                    <Filter className="w-5 h-5" />
                                    {t("events.filters.title")}
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Mobile Filters Panel */}
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
                                                {t("events.filters.title")}
                                            </h3>
                                            <button
                                                onClick={resetFilters}
                                                className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                {t("events.filters.resetAll")}
                                            </button>
                                        </div>

                                        {/* Mobile Filter Accordion */}
                                        <div className="space-y-4">
                                            {/* Categories */}
                                            <details className="group">
                                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {t("events.filters.categoriesTitle")}
                                                    </h4>
                                                    <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                                                </summary>
                                                <div className="pt-2 pl-4 space-y-2 max-h-60 overflow-y-auto">
                                                    {categories.map((category) => (
                                                        <div key={category.id} className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                id={`mobile-category-${category.id}`}
                                                                name="category-mobile"
                                                                value={category.id}
                                                                checked={selectedCategory === category.id}
                                                                onChange={() => {
                                                                    setSelectedCategory(category.id);
                                                                    addFilter("category");
                                                                    setIsFiltersOpen(false); // Close mobile filter after selection
                                                                }}
                                                                className="w-4 h-4 text-purple-600 rounded-full border-gray-300 focus:ring-purple-500"
                                                            />
                                                            <label
                                                                htmlFor={`mobile-category-${category.id}`}
                                                                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                                            >
                                                                {isRtl ? category.nameAr : category.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>

                                            {/* Venues */}
                                            <details className="group">
                                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {t("events.filters.venuesTitle")}
                                                    </h4>
                                                    <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                                                </summary>
                                                <div className="pt-2 pl-4 space-y-2 max-h-60 overflow-y-auto">
                                                    {venues.map((venue) => (
                                                        <div key={venue.id} className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                id={`mobile-venue-${venue.id}`}
                                                                name="venue-mobile"
                                                                value={venue.id}
                                                                checked={selectedVenue === venue.id}
                                                                onChange={() => {
                                                                    setSelectedVenue(venue.id);
                                                                    addFilter("venue");
                                                                    setIsFiltersOpen(false); // Close mobile filter after selection
                                                                }}
                                                                className="w-4 h-4 text-purple-600 rounded-full border-gray-300 focus:ring-purple-500"
                                                            />
                                                            <label
                                                                htmlFor={`mobile-venue-${venue.id}`}
                                                                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                                            >
                                                                {isRtl ? venue.nameAr : venue.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>

                                            {/* Price Range */}
                                            <details className="group">
                                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {t("events.filters.priceTitle")}
                                                    </h4>
                                                    <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                                                </summary>
                                                <div className="pt-2 pl-4 space-y-2">
                                                    {["free", "under100", "100to500", "over500"].map((priceOption) => (
                                                        <div key={priceOption} className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                id={`mobile-price-${priceOption}`}
                                                                name="price-mobile"
                                                                value={priceOption}
                                                                checked={selectedPriceRange === priceOption}
                                                                onChange={() => {
                                                                    setSelectedPriceRange(priceOption);
                                                                    addFilter("price");
                                                                    setIsFiltersOpen(false); // Close mobile filter after selection
                                                                }}
                                                                className="w-4 h-4 text-purple-600 rounded-full border-gray-300 focus:ring-purple-500"
                                                            />
                                                            <label
                                                                htmlFor={`mobile-price-${priceOption}`}
                                                                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                                            >
                                                                {t(`events.filters.${priceOption}`)}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>

                                            {/* Date Filter */}
                                            <details className="group">
                                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {t("events.filters.dateTitle")}
                                                    </h4>
                                                    <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                                                </summary>
                                                <div className="pt-2 pl-4 space-y-2">
                                                    {["today", "tomorrow", "thisWeek", "thisMonth"].map((dateOption) => (
                                                        <div key={dateOption} className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                id={`mobile-date-${dateOption}`}
                                                                name="date-mobile"
                                                                value={dateOption}
                                                                checked={selectedDate === dateOption}
                                                                onChange={() => {
                                                                    setSelectedDate(dateOption);
                                                                    addFilter("date");
                                                                    setIsFiltersOpen(false); // Close mobile filter after selection
                                                                }}
                                                                className="w-4 h-4 text-purple-600 rounded-full border-gray-300 focus:ring-purple-500"
                                                            />
                                                            <label
                                                                htmlFor={`mobile-date-${dateOption}`}
                                                                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                                            >
                                                                {t(`events.filters.${dateOption}`)}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Active Filters */}
                            {activeFilters.length > 0 && (
                                <div className="mb-6 flex flex-wrap gap-2">
                                    {activeFilters.map(filter => (
                                        <div key={filter} className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-sm">
                                            <span>{t(`events.filters.${filter}`)}: {getFilterLabel(filter)}</span>
                                            <button
                                                onClick={() => removeFilter(filter)}
                                                className="ml-2 focus:outline-none hover:text-purple-900 dark:hover:text-purple-200"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={resetFilters}
                                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
                                    >
                                        {t("events.filters.clearAll")}
                                    </button>
                                </div>
                            )}

                            {/* Results Count and View Toggle */}
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-gray-700 dark:text-gray-300">
                                    {loading
                                        ? t("events.loading")
                                        : t("events.resultsCount", { count: events.length.toString(), total: (totalPages * eventsPerPage).toString() })}
                                </p>

                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-md ${viewMode === "grid"
                                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                                            : "text-gray-600 dark:text-gray-400"
                                            }`}
                                        aria-label="Grid view"
                                    >
                                        <Grid className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-md ${viewMode === "list"
                                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                                            : "text-gray-600 dark:text-gray-400"
                                            }`}
                                        aria-label="List view"
                                    >
                                        <List className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col justify-center items-center py-32"
                                >
                                    <div className="w-16 h-16 relative">
                                        <div className="w-full h-full rounded-full border-4 border-purple-600/30"></div>
                                        <div className="w-full h-full absolute top-0 left-0 rounded-full border-t-4 border-r-4 border-purple-600 animate-spin"></div>
                                    </div>
                                    <p className="mt-4 text-gray-600 dark:text-gray-400">{t("events.loading")}</p>
                                </motion.div>
                            )}

                            {/* No Results */}
                            {!loading && events.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center py-20 px-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                                        <Calendar className="h-8 w-8 text-purple-500" />
                                    </div>
                                    <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">
                                        {t("events.noEventsFound")}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                                        {t("events.tryDifferentSearch")}
                                    </p>
                                    <button
                                        onClick={resetFilters}
                                        className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                    >
                                        {t("events.resetFilters")}
                                    </button>
                                </motion.div>
                            )}

                            {/* Events Grid */}
                            {!loading && events.length > 0 && viewMode === "grid" && (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    <AnimatePresence>
                                        {getCurrentPageEvents().map((event) => (
                                            <motion.div
                                                key={event.id}
                                                variants={itemVariants}
                                                className="h-full"
                                            >
                                                <EventCard
                                                    event={{
                                                        ...event,
                                                        imageUrl: event.imageUrl &&
                                                            typeof event.imageUrl === 'string' &&
                                                            !event.imageUrl.includes("undefined") &&
                                                            !event.imageUrl.includes("null") ?
                                                            event.imageUrl : undefined
                                                    }}
                                                    isDark={isDark}
                                                    isRtl={isRtl}
                                                    t={t}
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}

                            {/* Events List */}
                            {!loading && events.length > 0 && viewMode === "list" && (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-4"
                                >
                                    {getCurrentPageEvents().map((event) => (
                                        <motion.div
                                            key={event.id}
                                            variants={itemVariants}
                                            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex flex-col sm:flex-row">
                                                <div className="sm:w-1/4 h-40 sm:h-auto relative">
                                                    {event.imageUrl &&
                                                        typeof event.imageUrl === 'string' &&
                                                        !event.imageUrl.includes("undefined") &&
                                                        !event.imageUrl.includes("null") ? (
                                                        <div className="relative w-full h-full min-h-[160px]">
                                                            <Image
                                                                src={event.imageUrl}
                                                                alt={isRtl ? event.titleAr : event.title}
                                                                fill
                                                                className="object-cover"
                                                                onError={(e) => {
                                                                    // Set a default if image fails to load
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';

                                                                    // Add a placeholder icon to parent
                                                                    const parent = target.parentElement;
                                                                    if (parent) {
                                                                        parent.classList.add('bg-gradient-to-br', 'from-purple-500/30', 'to-indigo-500/30', 'flex', 'items-center', 'justify-center');

                                                                        const icon = document.createElement('div');
                                                                        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
                                                                        parent.appendChild(icon);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full min-h-[160px] bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
                                                            <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-5 sm:w-3/4">
                                                    <Link href={`/events/${event.id}`}>
                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                                            {isRtl ? event.titleAr : event.title}
                                                        </h3>
                                                    </Link>

                                                    <div className="flex flex-wrap gap-4 mt-2 mb-3">
                                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                            <Calendar className={`w-4 h-4 ${isRtl ? 'ml-1' : 'mr-1'} text-purple-500`} />
                                                            <span>
                                                                {format(
                                                                    formatEventDate(event.startDate),
                                                                    "PPP",
                                                                )}
                                                            </span>
                                                        </div>

                                                        {event.venue && (
                                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                                <MapPin className={`w-4 h-4 ${isRtl ? 'ml-1' : 'mr-1'} text-purple-500`} />
                                                                <span>
                                                                    {isRtl ? event.venue.nameAr : event.venue.name}
                                                                    {event.venue.city && `, ${event.venue.city}`}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                                                        {isRtl ? event.descriptionAr : event.description}
                                                    </p>

                                                    <div className="flex items-center justify-between">
                                                        <div className="text-purple-600 dark:text-purple-400 font-medium">
                                                            {event.price === 0
                                                                ? t("event.free")
                                                                : `${event.price} ${event.currency}`}
                                                        </div>

                                                        <Link href={`/events/${event.id}`}>
                                                            <div className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline">
                                                                {t("events.viewDetails")}
                                                                {isRtl ? <ChevronLeft className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
                                                            </div>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}

                            {/* Pagination */}
                            {!loading && events.length > 0 && totalPages > 1 && (
                                <div className="mt-10 flex justify-center">
                                    <nav className="flex items-center space-x-1 rtl:space-x-reverse">
                                        <button
                                            onClick={() => goToPage(1)}
                                            disabled={currentPage === 1}
                                            className={`px-2 py-2 rounded-md ${currentPage === 1
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                                                }`}
                                        >
                                            <ChevronsLeft className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-2 py-2 rounded-md ${currentPage === 1
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                                                }`}
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        {/* Page Numbers */}
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
                                                                ? "bg-purple-600 text-white"
                                                                : "text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    </React.Fragment>
                                                ))}
                                        </div>

                                        {/* Mobile Pagination */}
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
                                                : "text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                                                }`}
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() => goToPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className={`px-2 py-2 rounded-md ${currentPage === totalPages
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/20"
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

            {/* Custom styles */}
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

export default EventsPage;