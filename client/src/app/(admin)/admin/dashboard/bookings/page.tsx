"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import { getCookie } from "cookies-next";
import axios from "axios";
import { BACKEND_URL } from "@/lib/constants/backend";
import { toast } from "react-toastify";
import { ViewIcon, EditIcon, DeleteIcon } from "@/components/admin/dashboard/events/AddIcon";
import BookingModal from "@/components/admin/dashboard/bookings/BookingModal";
import SearchBar from "@/components/admin/dashboard/events/SearchBar";
import DeleteConfirmModal from "@/components/admin/dashboard/bookings/DeleteConfirmModal";

export type EventType = {
    id: string;
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    startDate: string;
    endDate: string;
    price: number;
    currency: string;
    ImageUrl: string | null;
    imageId: string | null;
    maxAttendees: number;
    isPublished: boolean;
    isHighlighted: boolean;
    createdAt: string;
    updatedAt: string;
    categoryId: string;
    venueId: string;
    tagIds: string[];
    venue?: {
        id: string;
        name: string;
        nameAr: string;
        address: string;
        city: string;
        country: string;
        capacity: number;
        createdAt: string;
        updatedAt: string;
    };
    category?: {
        id: string;
        name: string;
        nameAr: string;
        description: string;
        createdAt: string;
        updatedAt: string;
    };
};

export type BookingType = {
    id: string;
    userId: string;
    eventId: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    quantity: number;
    totalPrice: number;
    bookingDate: string;
    cancellationDate: string | null;
    feedback: string | null;
    rating: number | null;
    event: EventType;
    user?: {
        id: string;
        name: string;
        email: string;
    };
};

const BookingsAdmin = () => {
    const { theme } = useTheme();
    const { t, locale } = useTranslations();
    const [bookings, setBookings] = useState<BookingType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("view");
    const [currentBooking, setCurrentBooking] = useState<BookingType | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState<BookingType | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const isRtl = locale === "ar";
    const isDark = theme === "dark";

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const accessTokenAdmin = getCookie("accessTokenAdmin");
            const response = await axios.get(`${BACKEND_URL}/bookings`, {
                headers: {
                    Authorization: `Bearer ${accessTokenAdmin}`,
                },
            });

            if (response.status === 200) {
                setBookings(response.data.data || response.data);
            }
            setLoading(false);
        } catch (e) {
            setError("Failed to fetch bookings");
            setLoading(false);
        }
    };

    const openModal = (type: string, booking: BookingType | null = null, e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();

        setModalType(type);
        setCurrentBooking(booking);
        setShowModal(true);
    };

    const closeModal = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setShowModal(false);
    };

    const handleStatusChange = async (bookingId: string, newStatus: string) => {
        setLoading(true);
        try {
            const accessTokenAdmin = getCookie("accessTokenAdmin");
            const response = await axios.patch(
                `${BACKEND_URL}/bookings/${bookingId}`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${accessTokenAdmin}`,
                    },
                }
            );

            if (response.status === 200) {
                toast.success(t("bookings.statusUpdateSuccess"));
                fetchBookings();
                closeModal();
            } else {
                toast.error(t("bookings.statusUpdateError"));
            }
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (booking: BookingType, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setBookingToDelete(booking);
        setShowDeleteConfirm(true);
    };

    const cancelDelete = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setShowDeleteConfirm(false);
        setBookingToDelete(null);
    };

    const handleDelete = async (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }

        if (!bookingToDelete) return;

        setLoading(true);
        try {
            const accessTokenAdmin = getCookie("accessTokenAdmin");
            const response = await axios.delete(
                `${BACKEND_URL}/bookings/${bookingToDelete.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessTokenAdmin}`,
                    },
                }
            );

            if (response.status === 200) {
                setShowDeleteConfirm(false);
                setBookingToDelete(null);
                toast.success(t("bookings.deleteSuccess"));
                fetchBookings();
            } else {
                toast.error(t("bookings.deleteError"));
            }
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        if (statusFilter !== "all" && booking.status !== statusFilter) {
            return false;
        }

        return (
            booking.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.event?.titleAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.user?.name && booking.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (booking.user?.email && booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";

        const date = new Date(dateString);
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return "bg-green-100 text-green-800";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            case "CANCELLED":
                return "bg-red-100 text-red-800";
            case "COMPLETED":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className={`min-h-screen ${isRtl ? "rtl" : "ltr"} ${isDark ? "text-white" : "text-gray-800"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-10">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
                    >
                        {t("navigation.bookings")}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                    >
                        {t("bookings.subtitle")}
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className={`bg-opacity-80 shadow-lg rounded-xl overflow-hidden border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                        }`}
                >
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                            <div className="md:w-1/2 lg:w-2/5">
                                <SearchBar
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    isDark={isDark}
                                    t={t}
                                />
                            </div>

                            <div className="md:ml-auto flex space-x-2 items-center">
                                <label className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                    {t("bookings.filterByStatus")}:
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className={`rounded-md px-3 py-1.5 text-sm ${isDark
                                        ? "bg-gray-700 border-gray-600 text-white"
                                        : "bg-white border-gray-300 text-gray-700"
                                        } border focus:ring-purple-500 focus:border-purple-500`}
                                >
                                    <option value="all">{t("bookings.allStatuses")}</option>
                                    <option value="CONFIRMED">{t("bookings.statusBooking.confirmed")}</option>
                                    <option value="PENDING">{t("bookings.statusBooking.pending")}</option>
                                    <option value="CANCELLED">{t("bookings.statusBooking.cancelled")}</option>
                                    <option value="COMPLETED">{t("bookings.statusBooking.completed")}</option>
                                </select>
                            </div>
                        </div>

                        {loading && (
                            <div className="flex justify-center items-center py-10">
                                <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-purple-600 animate-spin"></div>
                            </div>
                        )}

                        {!loading && filteredBookings.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className={`min-w-full divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                                    <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                                        <tr>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                                                {t("bookings.table.booking")}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                                                {t("bookings.table.event")}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                                                {t("bookings.table.status")}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                                                {t("bookings.table.details")}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                                                {t("bookings.table.actions")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                                        {filteredBookings.map((booking) => (
                                            <tr
                                                key={booking.id}
                                                className={`${isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors cursor-pointer`}
                                                onClick={() => openModal("view", booking)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-medium truncate">
                                                            ID: {booking.id.substring(0, 8)}...
                                                        </div>
                                                        <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                            {formatDate(booking.bookingDate)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-medium">{booking.event.title}</div>
                                                        <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`} dir="rtl">
                                                            {booking.event.titleAr}
                                                        </div>
                                                        {booking.event.venue && (
                                                            <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} mt-1`}>
                                                                {booking.event.venue.name}, {booking.event.venue.city}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                                                        {t(`bookings.statusBooking.${booking.status.toLowerCase()}`)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm">
                                                        {t("bookings.quantity")}: <span className="font-medium">{booking.quantity}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        {t("bookings.total")}: <span className="font-medium">{booking.totalPrice} {booking.event.currency}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex space-x-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => openModal("view", booking, e)}
                                                            className={`p-1.5 rounded-full ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
                                                            title={t("bookings.actions.view")}
                                                        >
                                                            <ViewIcon />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => openModal("edit", booking, e)}
                                                            className={`p-1.5 rounded-full ${isDark ? "bg-gray-700 hover:bg-blue-700" : "bg-gray-100 hover:bg-blue-100"}`}
                                                            title={t("bookings.actions.edit")}
                                                        >
                                                            <EditIcon />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => confirmDelete(booking, e)}
                                                            className={`p-1.5 rounded-full ${isDark ? "bg-gray-700 hover:bg-red-700" : "bg-gray-100 hover:bg-red-100"}`}
                                                            title={t("bookings.actions.delete")}
                                                        >
                                                            <DeleteIcon />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!loading && filteredBookings.length === 0 && (
                            <div className="text-center py-10">
                                <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    {t("bookings.noBookings")}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {showModal && (
                <BookingModal
                    modalType={modalType}
                    currentBooking={currentBooking}
                    handleStatusChange={handleStatusChange}
                    closeModal={closeModal}
                    loading={loading}
                    isDark={isDark}
                    t={t}
                />
            )}

            {showDeleteConfirm && (
                <DeleteConfirmModal
                    bookingToDelete={bookingToDelete}
                    handleDelete={handleDelete}
                    cancelDelete={cancelDelete}
                    loading={loading}
                    isDark={isDark}
                    t={t}
                />
            )}
        </div>
    );
};

export default BookingsAdmin;