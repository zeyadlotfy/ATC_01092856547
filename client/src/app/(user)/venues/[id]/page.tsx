"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations } from "@/hooks/useTranslations";
import axios from "axios";
import { BACKEND_URL } from "@/lib/constants/backend";
import { toast } from "react-toastify";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    MapPin,
    Users,
    Globe,
    Flag,
    ExternalLink,
    Calendar,
    Map,
    Building,
    Share2,
    Clipboard,
    Check
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
    latitude?: number;
    longitude?: number;
}

interface EventType {
    id: string;
    title: string;
    titleAr: string;
    startDate: string;
    endDate: string;
    imageUrl?: string;
    venue?: {
        id: string;
        name: string;
        nameAr: string;
    };
}

const SingleVenuePage = () => {
    const params = useParams();
    const venueId = params.id as string;
    const { theme } = useTheme();
    const { t, locale } = useTranslations();
    const [venue, setVenue] = useState<VenueType | null>(null);
    const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

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
        fetchVenueDetails();
    }, [venueId]);

    const fetchVenueDetails = async () => {
        setLoading(true);
        setError(null);
        setNotFound(false);

        try {
            const response = await axios.get(`${BACKEND_URL}/venues/${venueId}`);

            if (response.status === 200) {
                let venueData = response.data;

                // Check if the venue data is nested inside a data property
                if (venueData.data) {
                    venueData = venueData.data;
                }

                setVenue(venueData);
                fetchVenueEvents(venueData.id);
            }
        } catch (e: any) {
            console.error("Error fetching venue details:", e);

            if (e.response && e.response.status === 404) {
                setNotFound(true);
            } else {
                setError("Failed to fetch venue details");
                toast.error(t("venues.errorFetchingVenues"));
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchVenueEvents = async (venueId: string) => {
        try {
            // Fetch events related to this venue
            const response = await axios.get(`${BACKEND_URL}/events?venueId=${venueId}`);

            if (response.status === 200) {
                let eventsData = response.data;

                // Check if the events data is nested inside a data property
                if (eventsData.data) {
                    eventsData = eventsData.data;
                }

                // Sort events by start date
                const sortedEvents = eventsData.sort((a: EventType, b: EventType) =>
                    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                );

                // Filter for upcoming events (today or future)
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const upcoming = sortedEvents.filter((event: EventType) =>
                    new Date(event.startDate) >= today
                );

                setUpcomingEvents(upcoming);
            }
        } catch (error) {
            console.error("Error fetching venue events:", error);
        }
    };

    const handleGetDirections = () => {
        if (venue?.latitude && venue?.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`, '_blank');
        } else if (venue?.address) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address + ', ' + venue.city + ', ' + venue.country)}`, '_blank');
        }
    };

    const handleShareVenue = () => {
        if (navigator.share) {
            navigator.share({
                title: isRtl && venue?.nameAr ? venue.nameAr : venue?.name || '',
                url: window.location.href
            }).catch(err => {
                console.error('Error sharing:', err);
            });
        } else {
            copyToClipboard();
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopySuccess(true);
            toast.success(t("event.linkCopied"));

            setTimeout(() => {
                setCopySuccess(false);
            }, 2000);
        }).catch(() => {
            toast.error(t("event.copyFailed"));
        });
    };

    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return t("event.notAvailable");

            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return t("event.notAvailable");
            }

            return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return t("event.notAvailable");
        }
    };

    const renderLoadingSkeleton = () => (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
            <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 animate-pulse"></div>
                    <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-md mb-8 animate-pulse"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 animate-pulse"></div>
                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-3 animate-pulse"></div>
                            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-md mb-3 animate-pulse"></div>
                            <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                        </div>
                        <div>
                            <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 animate-pulse"></div>
                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-3 animate-pulse"></div>
                            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-md mb-3 animate-pulse"></div>
                            <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                        </div>
                    </div>

                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return renderLoadingSkeleton();
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
                <div className="text-center max-w-lg">
                    <div className="flex justify-center mb-8">
                        <Building className="h-24 w-24 text-indigo-500/50" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {t("venues.notFound")}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        {t("venues.notFoundDesc")}
                    </p>
                    <Link href="/venues">
                        <button className="inline-flex items-center px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                            <ArrowLeft className={`w-5 h-5 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                            {t("venues.backToVenues")}
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
                <div className="text-center max-w-lg">
                    <div className="flex justify-center mb-8">
                        <Building className="h-24 w-24 text-red-500/50" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {t("venues.errorLoading")}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        {t("venues.errorDesc")}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={fetchVenueDetails}
                            className="inline-flex items-center px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            {t("common.tryAgainLater")}
                        </button>
                        <Link href="/venues">
                            <button className="inline-flex items-center px-5 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors">
                                {t("venues.backToVenues")}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isRtl ? "rtl" : "ltr"}>
            {/* Hero Section with Venue Image or Placeholder */}
            <section className="relative bg-gradient-to-br from-indigo-700 to-blue-900 h-72 md:h-80 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
                </div>

                {/* Back button */}
                <div className="absolute top-6 left-6 z-20">
                    <Link href="/venues">
                        <button className="flex items-center space-x-2 rtl:space-x-reverse rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 transition">
                            <ArrowLeft size={20} />
                            <span>{t("venues.backToVenues")}</span>
                        </button>
                    </Link>
                </div>

                {/* Central venue icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Building className="h-24 w-24 text-white/70" />
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
                >
                    {/* Venue title and actions */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {isRtl && venue?.nameAr ? venue.nameAr : venue?.name}
                            </h1>
                            <p className="text-indigo-600 dark:text-indigo-400 flex items-center">
                                <MapPin className={`w-5 h-5 ${isRtl ? 'ml-1.5' : 'mr-1.5'}`} />
                                {venue?.city}, {venue?.country}
                            </p>
                        </div>

                        <div className="flex space-x-2 rtl:space-x-reverse mt-4 md:mt-0">
                            <button
                                onClick={handleShareVenue}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                {copySuccess ? <Check className="h-4 w-4 mr-1.5" /> : <Share2 className="h-4 w-4 mr-1.5" />}
                                {copySuccess ? t("event.linkCopied") : t("event.share")}
                            </button>
                            <button
                                onClick={handleGetDirections}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                            >
                                <Map className="h-4 w-4 mr-1.5" />
                                {t("event.getDirections")}
                            </button>
                        </div>
                    </div>

                    {/* Venue details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Left column - address and details */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                {t("venues.details")}
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <MapPin className={`w-5 h-5 ${isRtl ? 'ml-2' : 'mr-2'} mt-0.5 text-indigo-500`} />
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{t("venues.address")}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{venue?.address || t("venues.notAvailable")}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Flag className={`w-5 h-5 ${isRtl ? 'ml-2' : 'mr-2'} mt-0.5 text-indigo-500`} />
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{t("venues.city")}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{venue?.city || t("venues.notAvailable")}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Globe className={`w-5 h-5 ${isRtl ? 'ml-2' : 'mr-2'} mt-0.5 text-indigo-500`} />
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{t("venues.country")}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{venue?.country || t("venues.notAvailable")}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Users className={`w-5 h-5 ${isRtl ? 'ml-2' : 'mr-2'} mt-0.5 text-indigo-500`} />
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{t("venues.capacity")}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {venue?.capacity ? `${venue.capacity} ${t("venues.capacityLabel")}` : t("venues.notAvailable")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right column - upcoming events at this venue */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                {t("venues.upcomingEvents")}
                            </h2>
                            {upcomingEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingEvents.slice(0, 3).map(event => (
                                        <Link href={`/events/${event.id}`} key={event.id}>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                                                    {isRtl && event.titleAr ? event.titleAr : event.title}
                                                </h3>
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <Calendar className={`w-4 h-4 ${isRtl ? 'ml-1.5' : 'mr-1.5'} text-indigo-500`} />
                                                    <span>{formatDate(event.startDate)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}

                                    {upcomingEvents.length > 3 && (
                                        <Link href={`/events?venue=${venue?.id}`}>
                                            <button className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 py-2">
                                                {t("venues.viewAllEvents", { count: upcomingEvents.length.toString() })}
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                    <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {t("venues.noUpcomingEvents")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Map Link */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <button
                            onClick={handleGetDirections}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center"
                        >
                            <Map className={`w-5 h-5 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                            {t("event.getDirections")}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SingleVenuePage;