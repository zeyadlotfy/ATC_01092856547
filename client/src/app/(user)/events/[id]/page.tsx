"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations } from "@/hooks/useTranslations";
import axios from "axios";
import { BACKEND_URL } from "@/lib/constants/backend";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import {
    Calendar,
    Clock,
    MapPin,
    Tag,
    ArrowLeft,
    Users,
    Ticket,
    Share2,
    Heart,
    CreditCard,
    CalendarClock,
    ChevronLeft,
    ChevronRight,
    Plus,
    Minus,
    ChevronDown,
    Star,
    MessageCircle,
    X,
} from "lucide-react";
import type { EventType } from "@/app/(user)/page";
import { getCookie } from "cookies-next";

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6 }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

interface BookingFormData {
    fullName: string;
    email: string;
    phone: string;
    tickets: number;
    attendees: string[];
    notes: string;
}

const EventDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const { theme } = useTheme();
    const { t, locale } = useTranslations();

    const [event, setEvent] = useState<EventType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "location" | "reviews">("details");
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ticketCount, setTicketCount] = useState(1);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const [bookingForm, setBookingForm] = useState<BookingFormData>({
        fullName: "",
        email: "",
        phone: "",
        tickets: 1,
        attendees: [""],
        notes: ""
    });

    const [bookingStatus, setBookingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const isDark = theme === "dark";
    const isRtl = locale === "ar";
    const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return t("bookings.notAvailable");

            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return t("bookings.notAvailable");
            }

            return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return t("bookings.notAvailable");
        }
    };

    const formatTime = (dateString: string) => {
        try {
            if (!dateString) return t("bookings.notAvailable");

            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return t("bookings.notAvailable");
            }

            return format(date, "h:mm a");
        } catch (error) {
            return t("bookings.notAvailable");
        }
    };

    const formatEventDate = (dateString: string) => {
        try {
            if (!dateString) return t("event.notAvailable");

            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return t("event.notAvailable");
            }

            return new Date(dateString)
        } catch (error) {
            console.error("Date formatting error:", error);
            return t("event.notAvailable");
        }
    };

    const getEventDuration = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = differenceInDays(end, start);
        return days > 0 ? `${days + 1} ${t("event.days")}` : t("event.oneDay");
    };


    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const fetchEventDetails = async () => {
            setLoading(true);
            setError(null);
            setNotFound(false);

            try {
                const response = await axios.get(`${BACKEND_URL}/events/${eventId}`);

                if (response.status === 200) {
                    let eventData = response.data;

                    if (eventData.data) {
                        eventData = eventData.data;
                    }

                    setEvent(eventData);
                }

                setLoading(false);
                setInitialLoad(false);
            } catch (e: any) {

                if (e.response && e.response.status === 404) {
                    setNotFound(true);
                    toast.error(t("event.notFoundError"));
                } else {
                    setError("Failed to fetch event details");
                    toast.error(t("event.errorFetchingDetails"));
                }

                setLoading(false);
                setInitialLoad(false);
            }
        };

        if (eventId) {
            fetchEventDetails();
        }
    }, [eventId, t]);

    useEffect(() => {
        const checkFavoriteStatus = () => {
            const favorites = JSON.parse(localStorage.getItem('favoriteEvents') || '[]');
            setIsFavorite(favorites.includes(eventId));
        };

        checkFavoriteStatus();
    }, [eventId]);

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (ticketCount < 1) {
            toast.error(t("event.minimumOneTicket"));
            return;
        }

        setBookingStatus("loading");

        try {
            const bookingData = {
                eventId,
                tickets: ticketCount,
            };
            const accessToken = getCookie("accessToken");

            const response = await axios.post(`${BACKEND_URL}/bookings`, bookingData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });

            if (response.status === 200 || response.status === 201) {
                setBookingStatus("success");
                toast.success(t("event.bookingSuccess"));
                setTicketCount(1);

                setTimeout(() => {
                    setIsModalOpen(false);
                    setBookingStatus("idle");
                }, 2000);
            }
        } catch (error) {
            console.error("Booking error:", error);
            setBookingStatus("error");
            toast.error(t("event.bookingError"));
            setBookingStatus("idle");
        }
    };

    useEffect(() => {
        if (ticketCount > bookingForm.attendees.length) {
            setBookingForm(prev => ({
                ...prev,
                attendees: [...prev.attendees, ...Array(ticketCount - prev.attendees.length).fill("")]
            }));
        } else if (ticketCount < bookingForm.attendees.length) {
            setBookingForm(prev => ({
                ...prev,
                attendees: prev.attendees.slice(0, ticketCount)
            }));
        }
    }, [ticketCount]);

    const handleTicketChange = (change: number) => {
        const newCount = Math.max(1, ticketCount + change);
        setTicketCount(newCount);
        setBookingForm(prev => ({
            ...prev,
            tickets: newCount
        }));
    };

    const handleAttendeeChange = (index: number, value: string) => {
        const updatedAttendees = [...bookingForm.attendees];
        updatedAttendees[index] = value;
        setBookingForm(prev => ({
            ...prev,
            attendees: updatedAttendees
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBookingForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleShare = () => {
        setIsShareMenuOpen(!isShareMenuOpen);
    };

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('favoriteEvents') || '[]');

        if (isFavorite) {
            const updatedFavorites = favorites.filter((id: string) => id !== eventId);
            localStorage.setItem('favoriteEvents', JSON.stringify(updatedFavorites));
            setIsFavorite(false);
            toast.success(t("event.removedFromFavorites"));
        } else {
            favorites.push(eventId);
            localStorage.setItem('favoriteEvents', JSON.stringify(favorites));
            setIsFavorite(true);
            toast.success(t("event.addedToFavorites"));
        }
    };

    const shareEvent = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'copy') => {
        const eventUrl = `${window.location.origin}/events/${eventId}`;
        const eventTitle = event ? (isRtl ? event.titleAr : event.title) : '';

        switch (platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(eventTitle)}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(eventTitle + ' ' + eventUrl)}`, '_blank');
                break;
            case 'email':
                window.open(`mailto:?subject=${encodeURIComponent(eventTitle)}&body=${encodeURIComponent(eventUrl)}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(eventUrl)
                    .then(() => toast.success(t("event.linkCopied")))
                    .catch(() => toast.error(t("event.copyFailed")));
                break;
        }

        setIsShareMenuOpen(false);
    };

    const renderLoadingSkeleton = () => (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isRtl ? "rtl" : "ltr"}>
            <div className="relative w-full h-[50vh] md:h-[60vh] bg-gray-200 dark:bg-gray-800 animate-pulse">
                <div className="absolute bottom-0 inset-x-0 z-20 p-6 md:p-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded-full mb-4"></div>
                        <div className="h-12 w-3/4 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
                        <div className="flex flex-wrap gap-6">
                            <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                            <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                            <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-8 md:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-10">
                        <div className="lg:w-2/3">
                            <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex space-x-8 rtl:space-x-reverse">
                                    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                                    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                                    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-md mb-4"></div>
                                    <div className="space-y-3">
                                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-md mb-4"></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/3">
                            <div className="bg-white dark:bg-gray-800 rounded-xl h-80 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderError = () => (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center" dir={isRtl ? "rtl" : "ltr"}>
            <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-red-500 text-2xl">!</span>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    {notFound ? t("event.notFound") : t("event.errorLoading")}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {notFound
                        ? t("event.notFoundDesc")
                        : t("event.errorDesc")}
                </p>
                <Link href="/events">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                        {t("event.backToEvents")}
                    </button>
                </Link>
            </div>
        </div>
    );

    if (event === null && loading && initialLoad) {
        return renderLoadingSkeleton();
    }

    if (error) {
        return renderError();
    }

    if (!event) {
        return renderError();
    }

    const eventPassed = new Date(event.endDate) < new Date();

    const bookingAvailable = !eventPassed && event.isPublished;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isRtl ? "rtl" : "ltr"}>
            <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
                <div className="absolute inset-0 bg-gray-900/60 z-10"></div>

                {event.imageUrl && typeof event.imageUrl === 'string' &&
                    !event.imageUrl.includes("undefined") &&
                    !event.imageUrl.includes("null") ? (
                    <Image
                        src={event.imageUrl}
                        alt={isRtl ? event.titleAr : event.title}
                        className="object-cover"
                        priority
                        fill
                        quality={90}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-800"></div>
                )}

                <div className="absolute top-6 left-6 z-20">
                    <Link href="/events">
                        <button className="flex items-center space-x-2 rtl:space-x-reverse rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 transition">
                            <ArrowLeft size={20} />
                            <span>{t("event.backToEvents")}</span>
                        </button>
                    </Link>
                </div>

                <div className="absolute bottom-0 inset-x-0 z-20 p-6 md:p-10 bg-gradient-to-t from-gray-900/90 via-gray-900/60 to-transparent">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center mb-4 px-3 py-1 rounded-full bg-purple-500/80 backdrop-blur-sm text-white text-sm">
                                {event.category ? (isRtl ? event.category.nameAr : event.category.name) : t("event.uncategorized")}
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-4xl">
                                {isRtl ? event.titleAr : event.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-gray-100">
                                <div className="flex items-center">
                                    <Calendar className={`${isRtl ? 'ml-2' : 'mr-2'} w-5 h-5 text-purple-300`} />
                                    <span>
                                        {String(formatDate(event.startDate))}
                                        {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <Clock className={`${isRtl ? 'ml-2' : 'mr-2'} w-5 h-5 text-purple-300`} />
                                    <span>
                                        {formatTime(event.startDate)}
                                    </span>
                                </div>

                                {event.venue && (
                                    <div className="flex items-center">
                                        <MapPin className={`${isRtl ? 'ml-2' : 'mr-2'} w-5 h-5 text-purple-300`} />
                                        <span>
                                            {isRtl ? event.venue.nameAr : event.venue.name}
                                            {event.venue.city && `, ${event.venue.city}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-8 md:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-10">
                        <div className="lg:w-2/3">
                            <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
                                <nav className="flex space-x-8 rtl:space-x-reverse overflow-x-auto" aria-label="Tabs">
                                    <button
                                        onClick={() => setActiveTab("details")}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === "details"
                                            ? "border-purple-500 text-purple-600 dark:text-purple-400"
                                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                            }`}
                                    >
                                        {t("event.detailsTab")}
                                    </button>

                                    <button
                                        onClick={() => setActiveTab("location")}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === "location"
                                            ? "border-purple-500 text-purple-600 dark:text-purple-400"
                                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                            }`}
                                    >
                                        {t("event.locationTab")}
                                    </button>

                                    <button
                                        onClick={() => setActiveTab("reviews")}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === "reviews"
                                            ? "border-purple-500 text-purple-600 dark:text-purple-400"
                                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                            }`}
                                    >
                                        {t("event.reviewsTab")}
                                    </button>
                                </nav>
                            </div>

                            <div className="mb-10">
                                {activeTab === "details" && (
                                    <motion.div
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <motion.div variants={fadeIn} className="mb-8">
                                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                                {t("event.about")}
                                            </h2>
                                            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                                                <p className="whitespace-pre-line">
                                                    {isRtl ? event.descriptionAr : event.description}
                                                </p>
                                            </div>
                                        </motion.div>

                                        <motion.div variants={fadeIn} className="mb-8">
                                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                                                {t("event.keyDetails")}
                                            </h3>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 flex items-start">
                                                    <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 mr-4">
                                                        <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                                            {t("event.dateAndTime")}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                                            {String(formatDate(event.startDate))}
                                                            {event.startDate !== event.endDate && (
                                                                <>
                                                                    <br />
                                                                    {t("event.to")} {formatDate(event.endDate)}
                                                                </>
                                                            )}
                                                            <br />
                                                            {formatTime(event.startDate)}
                                                            {/* Show duration if multi-day event */}
                                                            {event.startDate !== event.endDate && (
                                                                <>
                                                                    <br />
                                                                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full px-2 py-0.5 mt-1 inline-block">
                                                                        {getEventDuration(event.startDate, event.endDate)}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 flex items-start">
                                                    <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 mr-4">
                                                        <Ticket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                                            {t("event.ticketPrice")}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                                            {event.price === 0
                                                                ? t("event.free")
                                                                : `${event.price} ${event.currency || "USD"}`}
                                                        </p>
                                                    </div>
                                                </div>

                                                {event.venue && (
                                                    <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 flex items-start">
                                                        <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 mr-4">
                                                            <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                                                {t("event.location")}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                {isRtl ? event.venue.nameAr : event.venue.name}
                                                                {event.venue.address && <br />}
                                                                {event.venue.address}
                                                                {event.venue.city && <br />}
                                                                {event.venue.city}{event.venue.country && `, ${event.venue.country}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 flex items-start">
                                                    <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 mr-4">
                                                        <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                                            {t("event.capacity")}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                                            {event.maxAttendees ? `${event.maxAttendees} ${t("event.attendees")}` : t("event.unlimited")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Event tags */}
                                        {event.tags && event.tags.length > 0 && (
                                            <motion.div variants={fadeIn} className="mb-8">
                                                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                                                    {t("event.tags")}
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {event.tags.map(tag => (
                                                        <span
                                                            key={tag.id}
                                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                        >
                                                            <Tag className="w-3 h-3 mr-1" />
                                                            {isRtl ? tag.nameAr : tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === "location" && (
                                    <motion.div
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {event.venue ? (
                                            <>
                                                <motion.div variants={fadeIn} className="mb-6">
                                                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                                        {t("event.venueDetails")}
                                                    </h2>
                                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                                            {isRtl ? event.venue.nameAr : event.venue.name}
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                                                            {event.venue.address}
                                                            {event.venue.city && <br />}
                                                            {event.venue.city}{event.venue.country && `, ${event.venue.country}`}
                                                        </p>

                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                                                `${event.venue.name} ${event.venue.address} ${event.venue.city} ${event.venue.country}`
                                                            )}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline"
                                                        >
                                                            {t("event.getDirections")}
                                                            {isRtl ? <ChevronLeft className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
                                                        </a>
                                                    </div>
                                                </motion.div>

                                                <motion.div variants={fadeIn} className="rounded-lg overflow-hidden aspect-[16/9] bg-gray-200 dark:bg-gray-700">
                                                    <iframe
                                                        title="Event Location"
                                                        width="100%"
                                                        height="100%"
                                                        frameBorder="0"
                                                        scrolling="no"
                                                        marginHeight={0}
                                                        marginWidth={0}
                                                        src={`https://maps.google.com/maps?q=${encodeURIComponent(
                                                            `${event.venue.name} ${event.venue.address} ${event.venue.city} ${event.venue.country}`
                                                        )}&z=15&output=embed`}
                                                        className="filter grayscale-[0.5] dark:grayscale-[0.7] dark:contrast-125 dark:brightness-75"
                                                    ></iframe>
                                                </motion.div>
                                            </>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                                    <MapPin className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">
                                                    {t("event.noVenueInfo")}
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    {t("event.noVenueDesc")}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === "reviews" && (
                                    <motion.div
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <motion.div variants={fadeIn} className="mb-8">
                                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                                {t("event.reviews")} & {t("event.ratings")}
                                            </h2>

                                            <div className="text-center py-12">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                                    <MessageCircle className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">
                                                    {t("event.noReviewsYet")}
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                                    {t("event.beTheFirst")}
                                                </p>

                                                <button
                                                    onClick={() => toast.info(t("event.reviewFeatureComingSoon"))}
                                                    className="inline-flex items-center px-4 py-2 border border-purple-600 rounded-lg text-purple-600 dark:text-purple-400 dark:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                                >
                                                    <Star className="w-4 h-4 mr-2" />
                                                    {t("event.writeReview")}
                                                </button>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <div className="lg:w-1/3">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg sticky top-6">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {eventPassed ? t("event.eventEnded") : t("event.ticketInfo")}
                                        </h3>
                                        <span className={`text-xl font-bold ${event.price === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                            {event.price === 0 ? t("event.free") : `${event.price} ${event.currency || "USD"}`}
                                        </span>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-start">
                                            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 mr-3" />
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {String(formatDate(event.startDate))}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatTime(event.startDate)}
                                                </p>
                                                {event.startDate !== event.endDate && (
                                                    <div className="mt-1 inline-flex items-center text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full px-2 py-0.5">
                                                        {getEventDuration(event.startDate, event.endDate)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {event.venue && (
                                            <div className="flex items-start">
                                                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 mr-3" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                        {isRtl ? event.venue.nameAr : event.venue.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {event.venue.city}{event.venue.country && `, ${event.venue.country}`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {bookingAvailable ? (
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors"
                                                disabled={eventPassed}
                                            >
                                                <Ticket className="w-5 h-5 mr-2" />
                                                {t("event.bookNow")}
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full py-3 px-4 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium rounded-lg flex items-center justify-center cursor-not-allowed"
                                            >
                                                <CalendarClock className="w-5 h-5 mr-2" />
                                                {t("event.eventEnded")}
                                            </button>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                onClick={toggleFavorite}
                                                className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center ${isFavorite
                                                    ? 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                                                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    } transition-colors`}
                                                aria-label={isFavorite ? t("event.removeFromFavorites") : t("event.addToFavorites")}
                                            >
                                                <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-pink-600 dark:fill-pink-400' : ''}`} />
                                                {isFavorite ? t("event.saved") : t("event.save")}
                                            </button>

                                            <div className="relative">
                                                <button
                                                    onClick={handleShare}
                                                    className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    aria-label={t("event.share")}
                                                >
                                                    <Share2 className="w-5 h-5 mr-2" />
                                                    {t("event.share")}
                                                </button>

                                                {isShareMenuOpen && (
                                                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10 z-10">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => shareEvent('facebook')}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            >
                                                                Facebook
                                                            </button>
                                                            <button
                                                                onClick={() => shareEvent('twitter')}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            >
                                                                Twitter
                                                            </button>
                                                            <button
                                                                onClick={() => shareEvent('whatsapp')}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            >
                                                                WhatsApp
                                                            </button>
                                                            <button
                                                                onClick={() => shareEvent('email')}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            >
                                                                Email
                                                            </button>
                                                            <button
                                                                onClick={() => shareEvent('copy')}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            >
                                                                {t("event.copyLink")}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                                        {t("event.organizedBy")}
                                    </h4>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mr-3">
                                            <span className="text-purple-600 dark:text-purple-400 font-medium">
                                                {(event.organization || "A").charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {event.organization || t("event.organizerName")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden"
                        dir={isRtl ? "rtl" : "ltr"}
                    >
                        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                                aria-label={t("event.close")}
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-xl font-bold mb-1">
                                {t("event.bookTickets")}
                            </h3>
                            <div className="flex items-center text-white/90 text-sm">
                                <Calendar className={`${isRtl ? 'ml-1.5' : 'mr-1.5'} w-4 h-4`} />
                                {String(formatDate(event.startDate))}
                                <span className="mx-2">•</span>
                                <Clock className={`${isRtl ? 'ml-1.5' : 'mr-1.5'} w-4 h-4`} />
                                {formatTime(event.startDate)}
                            </div>
                        </div>

                        <div className="p-6">
                            {bookingStatus === "success" ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                        {t("event.bookingSuccessful")}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                                        {t("event.ticketsReserved")}
                                    </p>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                    >
                                        {t("event.close")}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleBookingSubmit} className="space-y-6">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {isRtl ? event.titleAr : event.title}
                                    </h4>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            {t("event.howManyTickets")}
                                        </label>
                                        <div className="flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => handleTicketChange(-1)}
                                                className="h-10 w-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                disabled={ticketCount <= 1}
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>

                                            <div className="h-10 px-6 flex items-center justify-center border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium text-lg">
                                                {ticketCount}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleTicketChange(1)}
                                                className="h-10 w-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-r-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {event.maxAttendees && (
                                            <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                                                {t("event.availableSeats", { count: String(event.maxAttendees - (event.bookedSeats || 0)) })}
                                            </p>
                                        )}
                                    </div>

                                    {event.price > 0 && (
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mt-6">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {ticketCount} {ticketCount === 1 ? t("event.ticket") : t("event.tickets")} × {event.price} {event.currency}
                                                </span>
                                                <span className="text-gray-900 dark:text-white">
                                                    {(event.price * ticketCount).toFixed(2)} {event.currency}
                                                </span>
                                            </div>
                                            <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <span className="text-gray-900 dark:text-white">{t("event.total")}</span>
                                                <span className="text-gray-900 dark:text-white font-bold">
                                                    {(event.price * ticketCount).toFixed(2)} {event.currency}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={bookingStatus === "loading"}
                                            className={`w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center justify-center ${bookingStatus === "loading" ? "opacity-70 cursor-not-allowed" : ""
                                                }`}
                                        >
                                            {bookingStatus === "loading" ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    {t("event.processing")}
                                                </>
                                            ) : (
                                                <>
                                                    <Ticket className="w-5 h-5 mr-2" />
                                                    {event.price === 0
                                                        ? t("event.getTickets")
                                                        : t("event.reserveTickets", { count: String(ticketCount) })}
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="w-full mt-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                                        >
                                            {t("event.cancel")}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
export default EventDetailPage;

