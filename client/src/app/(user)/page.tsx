"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import axios from "axios";
import { BACKEND_URL } from "@/lib/constants/backend";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import {
    Calendar, MapPin, Tag, Clock, Search,
    ChevronRight, ChevronLeft, ArrowRight, ArrowLeft
} from "lucide-react";

import EventCard from "@/components/user/home/EventCard";
import Hero from "@/components/user/home/Hero";

export type EventType = {
    organization: string;
    bookedSeats: number;
    id: string;
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    startDate: string;
    endDate: string;
    price: number;
    currency: string;
    imageUrl: string | undefined;
    imageId: string | undefined;
    tagsIds: string[];
    maxAttendees: number;
    isPublished: boolean;
    isHighlighted: boolean;
    category: {
        id: string;
        name: string;
        nameAr: string;
    };
    venue: {
        id: string;
        name: string;
        nameAr: string;
        address: string;
        city: string;
        country: string;
    };
    tags: {
        id: string;
        name: string;
        nameAr: string;
    }[];
    createdAt: string;
    updatedAt: string;
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100 }
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

const getCategoryIcon = (name: string): string => {
    const nameLC = name.toLowerCase();
    if (nameLC.includes("music")) return "🎵";
    if (nameLC.includes("art")) return "🎨";
    if (nameLC.includes("tech")) return "💻";
    if (nameLC.includes("food")) return "🍽️";
    if (nameLC.includes("sport")) return "⚽";
    if (nameLC.includes("business")) return "💼";
    if (nameLC.includes("health")) return "🧘";
    return "🎭";
};

const HomePage = () => {
    const { theme, setTheme } = useTheme();
    const { t, locale } = useTranslations();
    const [events, setEvents] = useState<EventType[]>([]);
    const [highlightedEvents, setHighlightedEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [venues, setVenues] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slideDirection, setSlideDirection] = useState(1);

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
        fetchEvents();
        fetchCategories();
        fetchVenues();
    }, [currentPage, searchTerm, selectedCategory]);

    useEffect(() => {
        if (highlightedEvents.length === 0) return;

        const timer = setInterval(() => {
            setSlideDirection(1);
            setCurrentSlide((prev) => (prev + 1) % highlightedEvents.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [highlightedEvents]);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKEND_URL}/events`);
            if (response.status === 200) {
                const allEvents = response.data.events;
                const publishedEvents = allEvents.filter((event: { isPublished: any; }) => event.isPublished);

                setHighlightedEvents(publishedEvents.filter((event: { isHighlighted: any; }) => event.isHighlighted));

                setEvents(publishedEvents);
            }
            setLoading(false);
        } catch (e) {
            setError("Failed to fetch events");
            toast.error(t("home.errorFetchingEvents"));
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
            toast.error(t("home.errorFetchingCategories"));
        }
    };

    const fetchVenues = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/venues`);
            if (response.status === 200) {
                setVenues(response.data.data);
            }
        } catch (e) {
            toast.error(t("home.errorFetchingVenues"));
        }
    };

    const filteredEvents = events.filter(
        (event) => {
            const matchesSearch =
                event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.titleAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.venue?.city?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory ? event.category?.id === selectedCategory : true;

            return matchesSearch && matchesCategory;
        }
    );

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        return date
    };

    const nextSlide = () => {
        setSlideDirection(1);
        setCurrentSlide((prev) => (prev + 1) % highlightedEvents.length);
    };

    const prevSlide = () => {
        setSlideDirection(-1);
        setCurrentSlide((prev) => (prev - 1 + highlightedEvents.length) % highlightedEvents.length);
    };

    const slideVariants = {
        hidden: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        visible: {
            x: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100, damping: 20 }
        },
        exit: (direction: number) => ({
            x: direction > 0 ? '-100%' : '100%',
            opacity: 0,
            transition: { duration: 0.3, ease: 'easeInOut' }
        })
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900" dir={isRtl ? "rtl" : "ltr"}>
            <Hero
                isDark={isDark}
                isRtl={isRtl}
                t={t}
                locale={locale}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />
            {highlightedEvents.length > 0 && (
                <section className="py-16 bg-white dark:bg-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="text-center mb-10"
                        >
                            <motion.h2
                                variants={fadeIn}
                                custom={0}
                                className="text-3xl font-bold text-gray-900 dark:text-white"
                            >
                                {t("home.featured.title")}
                            </motion.h2>
                            <motion.div
                                variants={fadeIn}
                                custom={1}
                                className="w-24 h-1 bg-purple-500 mx-auto mt-2 mb-4 rounded-full"
                            ></motion.div>
                            <motion.p
                                variants={fadeIn}
                                custom={2}
                                className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                            >
                                {t("home.featured.subtitle")}
                            </motion.p>
                        </motion.div>

                        {/* Featured Events Slider */}
                        <div className="relative">
                            <AnimatePresence custom={slideDirection}>
                                {highlightedEvents.map((event, index) => (
                                    index === currentSlide && (
                                        <motion.div
                                            key={event.id}
                                            custom={slideDirection}
                                            variants={slideVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl"
                                        >
                                            <div className="absolute inset-0">
                                                {event.imageUrl ? (
                                                    <Image
                                                        src={event.imageUrl}
                                                        alt={locale === 'ar' ? event.titleAr : event.title}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                        className="brightness-[0.7]"
                                                        sizes="(max-width: 768px) 100vw, 80vw"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-purple-700 to-indigo-800"></div>
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                                                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                                                    {locale === 'ar' ? event.titleAr : event.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-5 w-5 mr-2" />
                                                        <span>{String(formatEventDate(event.startDate))}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MapPin className="h-5 w-5 mr-2" />
                                                        <span>{locale === 'ar' ? event.venue.nameAr : event.venue.name}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Tag className="h-5 w-5 mr-2" />
                                                        <span>{locale === 'ar' ? event.category.nameAr : event.category.name}</span>
                                                    </div>
                                                </div>
                                                <Link href={`/events/${event.id}`}>
                                                    <div className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-full text-sm font-medium transition-colors duration-300">
                                                        {t("home.featured.viewDetails")}
                                                        {isRtl ? <ChevronLeft className="ml-1 h-4 w-4" /> : <ChevronRight className="ml-1 h-4 w-4" />}
                                                    </div>
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )
                                ))}
                            </AnimatePresence>

                            {/* Slider Navigation */}
                            <div className="flex justify-center mt-6 space-x-2 rtl:space-x-reverse">
                                {highlightedEvents.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSlideDirection(index > currentSlide ? 1 : -1);
                                            setCurrentSlide(index);
                                        }}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-purple-600 w-8' : 'bg-purple-300'}`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    ></button>
                                ))}
                            </div>

                            {/* Arrow Navigation */}
                            <button
                                onClick={prevSlide}
                                className="absolute top-1/2 left-4 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/60 transition-colors duration-300 flex items-center justify-center shadow-lg"
                                aria-label="Previous slide"
                            >
                                {isRtl ? <ChevronRight className="h-6 w-6 text-white" /> : <ChevronLeft className="h-6 w-6 text-white" />}
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute top-1/2 right-4 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/60 transition-colors duration-300 flex items-center justify-center shadow-lg"
                                aria-label="Next slide"
                            >
                                {isRtl ? <ChevronLeft className="h-6 w-6 text-white" /> : <ChevronRight className="h-6 w-6 text-white" />}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Categories Section - New */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <motion.h2
                            variants={fadeIn}
                            custom={0}
                            className="text-3xl font-bold text-gray-900 dark:text-white"
                        >
                            {t("home.categories.title")}
                        </motion.h2>
                        <motion.div
                            variants={fadeIn}
                            custom={1}
                            className="w-24 h-1 bg-purple-500 mx-auto mt-2 mb-4 rounded-full"
                        ></motion.div>
                        <motion.p
                            variants={fadeIn}
                            custom={2}
                            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                        >
                            {t("home.categories.subtitle")}
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                        {categories.length > 0 ? categories.slice(0, 6).map((category, index) => (
                            <motion.div
                                key={category.id}
                                variants={fadeIn}
                                custom={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05 }}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-purple-200 dark:hover:shadow-purple-900/30 border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-800"
                            >
                                <Link href={`/events?category=${category.id}`}>
                                    <div className="p-6 text-center">
                                        <div className="text-4xl mb-4">
                                            {getCategoryIcon(locale === 'ar' ? category.nameAr : category.name)}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                            {locale === 'ar' ? category.nameAr : category.name}
                                        </h3>
                                        <div className="mt-3 inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400">
                                            {t("home.categories.browse")}
                                            {isRtl ? <ChevronLeft className="ml-1 h-4 w-4" /> : <ChevronRight className="ml-1 h-4 w-4" />}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )) : (
                            // Show placeholder categories if none available
                            Array.from({ length: 6 }).map((_, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeIn}
                                    custom={index}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 border border-gray-100 dark:border-gray-700 opacity-70"
                                >
                                    <div className="p-6 text-center">
                                        <div className="text-4xl mb-4 text-gray-300 dark:text-gray-600">📂</div>
                                        <div className="h-6 w-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {categories.length > 6 && (
                        <motion.div
                            variants={fadeIn}
                            custom={6}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="mt-10 text-center"
                        >
                            <Link href="/events/categories">
                                <div className="inline-flex items-center px-6 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-full text-lg font-medium transition-colors duration-300">
                                    {t("home.categories.viewAll")}
                                    {isRtl ? <ArrowLeft className="ml-2 h-5 w-5" /> : <ArrowRight className="ml-2 h-5 w-5" />}
                                </div>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* All Events Section - Enhanced with Dynamic Layout */}
            <section className="py-16 bg-white dark:bg-gray-800 relative">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-48 right-0 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/20 rounded-full opacity-20 blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="mb-12 text-center"
                    >
                        <motion.h2
                            variants={{
                                hidden: { opacity: 0, y: -20 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                            }}
                            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
                        >
                            {t("home.events.title")}
                        </motion.h2>
                        <motion.div
                            variants={{
                                hidden: { width: 0 },
                                visible: { width: "6rem", transition: { duration: 0.8, delay: 0.2 } }
                            }}
                            className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto mt-2 mb-4 rounded-full"
                        ></motion.div>
                        <motion.p
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.3 } }
                            }}
                            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                        >
                            {t("home.events.subtitle")}
                        </motion.p>
                    </motion.div>

                    {/* Filters Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        {/* Search input */}
                        <div className="relative w-full sm:w-64 md:w-80">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t("home.search.placeholder")}
                                className="w-full py-2 px-4 pr-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                            <div className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </div>
                        </div>

                        {/* Category dropdown */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full sm:w-auto py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                            <option value="">{t("home.events.allCategories")}</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {isRtl ? cat.nameAr : cat.name}
                                </option>
                            ))}
                        </select>

                        {/* View toggle buttons */}
                        <div className="flex items-center gap-2 ml-auto">
                            <button
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all"
                                title={t("home.events.gridView")}
                                aria-label={t("home.events.gridView")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-700 dark:text-gray-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                                </svg>
                            </button>
                            <button
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all"
                                title={t("home.events.listView")}
                                aria-label={t("home.events.listView")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-700 dark:text-gray-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>

                    {/* Loading state */}
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
                            <p className="mt-4 text-gray-600 dark:text-gray-400">{t("home.events.loading")}</p>
                        </motion.div>
                    )}

                    {/* Empty state */}
                    {!loading && filteredEvents.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center py-20 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700"
                        >
                            <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                                <Calendar className="h-8 w-8 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">{t("home.noEventsFound")}</h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                                {t("home.tryDifferentSearch")}
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedCategory("");
                                }}
                                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                                {t("home.events.resetFilters")}
                            </button>
                        </motion.div>
                    )}

                    {/* Events grid with staggered animation */}
                    {!loading && filteredEvents.length > 0 && (
                        <motion.div
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.08
                                    }
                                }
                            }}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {filteredEvents.slice(0, 8).map((event) => (
                                <motion.div
                                    key={event.id}
                                    variants={{
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
                                    }}
                                    className="h-full"
                                >
                                    <EventCard
                                        event={event}
                                        isDark={isDark}
                                        isRtl={isRtl}
                                        t={t}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* View all button with enhanced animation */}
                    {filteredEvents.length > 8 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="mt-12 flex justify-center"
                        >
                            <Link href="/events">
                                <motion.button
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group px-8 py-3 rounded-full font-medium transition-all duration-300 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-xl"
                                >
                                    <span className="flex items-center">
                                        {t("home.events.viewAll")}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className={`w-4 h-4 ${isRtl ? 'mr-2 group-hover:mr-3' : 'ml-2 group-hover:ml-3'} transition-all duration-300`}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                        </svg>
                                    </span>
                                </motion.button>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Venues Highlight Section - New */}
            {venues.length > 0 && (
                <section className="py-16 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <motion.h2
                                variants={fadeIn}
                                custom={0}
                                className="text-3xl font-bold text-gray-900 dark:text-white"
                            >
                                {t("home.venues.title")}
                            </motion.h2>
                            <motion.div
                                variants={fadeIn}
                                custom={1}
                                className="w-24 h-1 bg-purple-500 mx-auto mt-2 mb-4 rounded-full"
                            ></motion.div>
                            <motion.p
                                variants={fadeIn}
                                custom={2}
                                className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                            >
                                {t("home.venues.subtitle")}
                            </motion.p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {venues.slice(0, 3).map((venue, index) => (
                                <motion.div
                                    key={venue.id}
                                    variants={fadeIn}
                                    custom={index}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    whileHover={{ y: -10 }}
                                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
                                >
                                    <div className="h-48 w-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
                                        <MapPin className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {locale === 'ar' ? venue.nameAr : venue.name}
                                        </h3>
                                        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            <span className="text-sm">{venue.address}</span>
                                        </div>
                                        <Link href={`/venues/${venue.id}`}>
                                            <div className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors duration-300">
                                                {t("home.venues.viewVenue")}
                                                {isRtl ? <ChevronLeft className="ml-1 h-4 w-4" /> : <ChevronRight className="ml-1 h-4 w-4" />}
                                            </div>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            variants={fadeIn}
                            custom={4}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="mt-10 text-center"
                        >
                            <Link href="/venues">
                                <div className="inline-flex items-center px-6 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-full text-lg font-medium transition-colors duration-300">
                                    {t("home.venues.viewAll")}
                                    {isRtl ? <ArrowLeft className="ml-2 h-5 w-5" /> : <ArrowRight className="ml-2 h-5 w-5" />}
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-br from-purple-700 to-indigo-800 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            {t("home.cta.title")}
                        </h2>
                        <p className="text-lg text-purple-100 mb-8 max-w-3xl mx-auto">
                            {t("home.cta.subtitle")}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
                            <Link href="/register">
                                <div className="px-8 py-4 bg-white hover:bg-gray-100 text-purple-700 font-bold rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105">
                                    {t("home.cta.registerNow")}
                                </div>
                            </Link>
                            <Link href="/contact">
                                <div className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105">
                                    {t("home.cta.contactUs")}
                                </div>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Add custom styles for animations */}
            <style jsx global>{`
        @keyframes blob {
          0% {
            transform: scale(1) translate(0px, 0px);
          }
          33% {
            transform: scale(1.1) translate(40px, -20px);
          }
          66% {
            transform: scale(0.9) translate(-20px, 40px);
          }
          100% {
            transform: scale(1) translate(0px, 0px);
          }
        }
        .animate-blob {
          animation: blob 20s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: -2s;
        }
        .animation-delay-4000 {
          animation-delay: -4s;
        }
        .animation-delay-6000 {
          animation-delay: -6s;
        }
      `}</style>
        </div>
    );
};

export default HomePage;