"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations } from "@/hooks/useTranslations";
import axios from "axios";
import { BACKEND_URL } from "@/lib/constants/backend";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { getCookie } from "cookies-next";
import {
    Calendar,
    Clock,
    MapPin,
    Ticket,
    ChevronRight,
    Download,
    UserCheck,
    X,
    CheckCircle,
    AlertCircle,
    Filter,
    XCircle,
    Search,
    CalendarClock,
    Settings
} from "lucide-react";
import type { EventType } from "@/app/(user)/page";
import { useTicketDownload } from "@/components/user/my-bookings/Ticket";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
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

interface BookingType {
    id: string;
    userId: string;
    eventId: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    quantity: number;
    totalPrice: number;
    bookingDate: string;
    cancellationDate: string | null;
    feedback: string | null;
    rating: number | null;
    event?: EventType;
}

const MyBookingsPage = () => {
    const router = useRouter();
    const { theme } = useTheme();
    const { t, locale } = useTranslations();
    const [bookings, setBookings] = useState<BookingType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "CANCELLED">("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isDark = theme === "dark";
    const isRtl = locale === "ar";

    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return t("bookings.notAvailable");

            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return t("bookings.notAvailable");
            }

            return new Date(dateString)
        } catch (error) {
            console.error("Date formatting error:", error);
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
            console.error("Time formatting error:", error);
            return t("bookings.notAvailable");
        }
    };

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError(null);

            try {
                const accessToken = getCookie("accessToken");

                if (!accessToken) {
                    toast.error(t("bookings.notAuthenticated"));
                    router.push("/login");
                    return;
                }

                const response = await axios.get(`${BACKEND_URL}/bookings`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                if (response.status === 200) {
                    setBookings(response.data);
                }

                setLoading(false);
            } catch (e) {
                console.error("Error fetching bookings:", e);
                setError("Failed to fetch bookings");
                toast.error(t("bookings.errorFetching"));
                setLoading(false);
            }
        };

        fetchBookings();
    }, [router, t]);

    const filteredBookings = bookings.filter(booking => {
        if (statusFilter !== "ALL" && booking.status !== statusFilter) {
            return false;
        }

        if (searchTerm && booking.event) {
            const term = searchTerm.toLowerCase();
            const eventTitle = (booking.event.title || "").toLowerCase();
            const eventTitleAr = (booking.event.titleAr || "").toLowerCase();
            const venue = (booking.event.venue?.name || "").toLowerCase();

            return (
                eventTitle.includes(term) ||
                eventTitleAr.includes(term) ||
                venue.includes(term) ||
                booking.id.toLowerCase().includes(term)
            );
        }

        return true;
    });

    const openBookingDetails = (booking: BookingType) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const cancelBooking = async (bookingId: string) => {
        try {
            const accessToken = getCookie("accessToken");

            await axios.patch(
                `${BACKEND_URL}/bookings/${bookingId}/cancel`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            setBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking.id === bookingId
                        ? { ...booking, status: "CANCELLED" as const, cancellationDate: new Date().toISOString() }
                        : booking
                )
            );

            toast.success(t("bookings.cancelSuccess"));

            if (isModalOpen && selectedBooking?.id === bookingId) {
                setIsModalOpen(false);
            }

        } catch (error) {
            console.error("Error cancelling booking:", error);
            toast.error(t("bookings.cancelError"));
        }
    };
    const { generateTicketPDF } = useTicketDownload(t);


    const downloadTicket = async (bookingId: string) => {
        const booking = bookings.find(b => b.id === bookingId);

        if (!booking) {
            toast.error(t("bookings.bookingNotFound"));
            return;
        }

        try {

            await generateTicketPDF(
                { ...booking, event: booking.event ?? {} },
                locale,
                theme ?? "light"
            );
        } catch (error) {
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "CANCELLED":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return <CheckCircle className="h-4 w-4" />;
            case "PENDING":
                return <Clock className="h-4 w-4" />;
            case "CANCELLED":
                return <XCircle className="h-4 w-4" />;
            default:
                return null;
        }
    };

    // Clear filters
    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
    };

    const noBookingsAfterFilter = filteredBookings.length === 0 && searchTerm.length > 0;
    const noBookings = bookings.length === 0 && !loading;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isRtl ? "rtl" : "ltr"}>
            <div className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {t("bookings.myBookings")}
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {t("bookings.manageBookings")}
                            </p>
                        </div>

                        <div className="hidden md:block mt-4 md:mt-0">
                            <div className="relative text-gray-400 focus-within:text-gray-600">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t("bookings.search")}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="md:hidden mb-6">
                    <div className="mb-4">
                        <div className="relative text-gray-400 focus-within:text-gray-600">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t("bookings.search")}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center w-full justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <div className="flex items-center">
                            <Filter className="h-5 w-5 mr-2" />
                            <span>{t("bookings.filter")}</span>
                        </div>
                        <ChevronRight className={`h-5 w-5 transition-transform ${isFilterOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {isFilterOpen && (
                        <div className="mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                            <div className="space-y-2">
                                <div className="font-medium text-gray-900 dark:text-white mb-2">{t("bookings.status")}</div>
                                <div className="flex flex-wrap gap-2">
                                    {["ALL", "CONFIRMED", "PENDING", "CANCELLED"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status as any)}
                                            className={`px-3 py-1 text-sm rounded-full ${statusFilter === status
                                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 font-medium"
                                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                                }`}
                                        >
                                            {t(`bookings.statusOptions.${status.toLowerCase()}`)}
                                        </button>
                                    ))}
                                </div>

                                {(searchTerm || statusFilter !== "ALL") && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        {t("bookings.clearFilters")}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Desktop filters */}
                <div className="hidden md:flex items-center justify-between mb-6">
                    <div className="flex space-x-2 rtl:space-x-reverse">
                        {["ALL", "CONFIRMED", "PENDING", "CANCELLED"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status as any)}
                                className={`px-4 py-2 text-sm rounded-md ${statusFilter === status
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 font-medium"
                                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                            >
                                {t(`bookings.statusOptions.${status.toLowerCase()}`)}
                            </button>
                        ))}
                    </div>

                    {(searchTerm || statusFilter !== "ALL") && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                            <X className="h-4 w-4 mr-2" />
                            {t("bookings.clearFilters")}
                        </button>
                    )}
                </div>


                {noBookings && (
                    <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl shadow p-8">
                        <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-4 mb-4">
                            <CalendarClock className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                            {t("bookings.noBookingsYet")}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                            {t("bookings.noBookingsDesc")}
                        </p>
                        <Link href="/events">
                            <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                                {t("bookings.exploreEvents")}
                            </button>
                        </Link>
                    </div>
                )}

                {noBookingsAfterFilter && (
                    <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl shadow p-8">
                        <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-4 mb-4">
                            <Search className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                            {t("bookings.noResults")}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                            {t("bookings.tryDifferentSearch")}
                        </p>
                        <button
                            onClick={clearFilters}
                            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors"
                        >
                            {t("bookings.clearFilters")}
                        </button>
                    </div>
                )}

                {filteredBookings.length > 0 && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {filteredBookings.map((booking) => (
                            <motion.div
                                key={booking.id}
                                variants={itemVariants}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row">
                                    <div className="md:w-1/4 h-40 md:h-auto relative">
                                        {booking.event?.imageUrl &&
                                            !booking.event.imageUrl.includes("undefined") &&
                                            !booking.event.imageUrl.includes("null") ? (
                                            <div className="relative w-full h-full min-h-[160px]">
                                                <Image
                                                    src={booking.event.imageUrl}
                                                    alt={isRtl ? booking.event.titleAr : booking.event.title}
                                                    className="object-cover"
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 25vw"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full min-h-[160px] bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
                                                <Ticket className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 md:p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                                                {getStatusIcon(booking.status)}
                                                <span className="ml-1">{t(`bookings.statusOptions.${booking.status.toLowerCase()}`)}</span>
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {t("bookings.bookedOn")} {String(formatDate(booking.bookingDate))}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight line-clamp-1">
                                            {booking.event ? (isRtl ? booking.event.titleAr : booking.event.title) : t("bookings.unknownEvent")}
                                        </h3>

                                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                                            {booking.event && (
                                                <>
                                                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                                        <Calendar className="h-4 w-4 mr-1.5" />
                                                        {String(formatDate(booking.event.startDate))}
                                                    </div>

                                                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                                        <Clock className="h-4 w-4 mr-1.5" />
                                                        {formatTime(booking.event.startDate)}
                                                    </div>

                                                    {booking.event.venue && (
                                                        <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                                            <MapPin className="h-4 w-4 mr-1.5" />
                                                            {isRtl ? booking.event.venue.nameAr : booking.event.venue.name}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center">
                                            <div className="flex items-center text-gray-900 dark:text-white">
                                                <Ticket className="h-5 w-5 mr-1.5 text-purple-500" />
                                                <span className="font-medium">
                                                    {booking.quantity} {booking.quantity === 1 ? t("bookings.ticket") : t("bookings.tickets")}
                                                </span>
                                            </div>

                                            {booking.totalPrice > 0 && (
                                                <div className="ml-6 text-gray-900 dark:text-white font-medium">
                                                    {booking.totalPrice} {booking.event?.currency || "USD"}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-2 md:justify-end">
                                            <button
                                                onClick={() => openBookingDetails(booking)}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                {t("bookings.viewDetails")}
                                            </button>

                                            {booking.status === "CONFIRMED" && (
                                                <button
                                                    onClick={() => downloadTicket(booking.id)}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    {t("bookings.downloadTicket")}
                                                </button>
                                            )}

                                            {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                                                <button
                                                    onClick={() => cancelBooking(booking.id)}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40"
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    {t("bookings.cancel")}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        dir={isRtl ? "rtl" : "ltr"}
                    >
                        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                                aria-label={t("bookings.close")}
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-xl font-bold mb-1">
                                {t("bookings.bookingDetails")}
                            </h3>
                            <div className="flex items-center text-white/80 text-sm">
                                <span className="font-medium">{t("bookings.bookingId")}</span>: {selectedBooking.id}
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("bookings.status")}</div>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedBooking.status)}`}>
                                    {getStatusIcon(selectedBooking.status)}
                                    <span className="ml-1.5">{t(`bookings.statusOptions.${selectedBooking.status.toLowerCase()}`)}</span>
                                </div>
                            </div>

                            {selectedBooking.event && (
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                        {t("bookings.eventDetails")}
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                                        <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                                            {isRtl ? selectedBooking.event.titleAr : selectedBooking.event.title}
                                        </h5>

                                        <div className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                                            <div className="flex items-start">
                                                <Calendar className="h-4 w-4 mr-2 mt-0.5" />
                                                <div>
                                                    <div>{String(formatDate(selectedBooking.event.startDate))}</div>
                                                    {selectedBooking.event.startDate !== selectedBooking.event.endDate && (
                                                        <div>{t("bookings.to")} {String(formatDate(selectedBooking.event.endDate))}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-2" />
                                                <div>{formatTime(selectedBooking.event.startDate)}</div>
                                            </div>

                                            {selectedBooking.event.venue && (
                                                <div className="flex items-start">
                                                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                                                    <div>
                                                        <div>{isRtl ? selectedBooking.event.venue.nameAr : selectedBooking.event.venue.name}</div>
                                                        <div className="text-gray-500 dark:text-gray-400">
                                                            {selectedBooking.event.venue.address}
                                                            {selectedBooking.event.venue.city && `, ${selectedBooking.event.venue.city}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <Link href={`/events/${selectedBooking.event.id}`}>
                                            <button className="mt-4 text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center">
                                                {t("bookings.viewEventDetails")}
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                    {t("bookings.bookingInformation")}
                                </h4>
                                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">{t("bookings.tickets")}</span>
                                            <span className="text-gray-900 dark:text-white font-medium">
                                                {selectedBooking.quantity} {selectedBooking.quantity === 1 ? t("bookings.ticket") : t("bookings.tickets")}
                                            </span>
                                        </div>

                                        {selectedBooking.totalPrice > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-300">{t("bookings.totalAmount")}</span>
                                                <span className="text-gray-900 dark:text-white font-medium">
                                                    {selectedBooking.totalPrice} {selectedBooking.event?.currency || "USD"}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-300">{t("bookings.bookingDate")}</span>
                                            <span className="text-gray-900 dark:text-white">
                                                {String(formatDate(selectedBooking.bookingDate))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 justify-end">
                                {selectedBooking.status === "CONFIRMED" && (
                                    <button
                                        onClick={() => downloadTicket(selectedBooking.id)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        {t("bookings.downloadTicket")}
                                    </button>
                                )}

                                {(selectedBooking.status === "PENDING" || selectedBooking.status === "CONFIRMED") && (
                                    <button
                                        onClick={() => {
                                            cancelBooking(selectedBooking.id);
                                            setIsModalOpen(false);
                                        }}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        {t("bookings.cancel")}
                                    </button>
                                )}

                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    {t("bookings.close")}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;