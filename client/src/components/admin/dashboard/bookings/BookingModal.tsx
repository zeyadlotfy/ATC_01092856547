import React from "react";
import { BookingType } from "@/app/(admin)/admin/dashboard/bookings/page";

interface BookingModalProps {
    modalType: string;
    currentBooking: BookingType | null;
    handleStatusChange: (bookingId: string, newStatus: string) => Promise<void>;
    closeModal: (e?: React.MouseEvent) => void;
    loading: boolean;
    isDark: boolean;
    t: (key: string, options?: any) => string;
}

const BookingModal: React.FC<BookingModalProps> = ({
    modalType,
    currentBooking,
    handleStatusChange,
    closeModal,
    loading,
    isDark,
    t,
}) => {
    const isViewOnly = modalType === "view";
    const [newStatus, setNewStatus] = React.useState(currentBooking?.status || "");

    React.useEffect(() => {
        if (currentBooking) {
            setNewStatus(currentBooking.status);
        }
    }, [currentBooking]);

    const modalTitle = {
        view: t("bookings.viewBooking"),
        edit: t("bookings.editBooking"),
    }[modalType];

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentBooking) return;
        await handleStatusChange(currentBooking.id, newStatus);
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

    if (!currentBooking) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    aria-hidden="true"
                    onClick={closeModal}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal content */}
                <div
                    className={`inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-2xl shadow-xl sm:align-middle`}
                    style={{
                        position: 'relative',
                        zIndex: 10
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-semibold leading-6" id="modal-title">
                            {modalTitle}
                        </h3>
                        <button
                            onClick={closeModal}
                            className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {/* Booking Info */}
                            <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                                <h4 className="text-lg font-medium mb-3">{t("bookings.bookingInfo")}</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-opacity-70">
                                            {t("bookings.bookingId")}
                                        </label>
                                        <div className="text-sm font-mono">{currentBooking.id}</div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-opacity-70">
                                            {t("bookings.status")}
                                        </label>
                                        {isViewOnly ? (
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(currentBooking.status)}`}>
                                                {t(`bookings.statusBooking.${currentBooking.status.toLowerCase()}`)}
                                            </span>
                                        ) : (
                                            <select
                                                value={newStatus}
                                                onChange={(e) => setNewStatus(e.target.value)}
                                                className={`w-full px-3 py-2 rounded-lg ${isDark
                                                    ? "bg-gray-800 border-gray-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-900"
                                                    } border focus:ring-purple-500 focus:border-purple-500`}
                                            >
                                                <option value="PENDING">{t("bookings.statusBooking.pending")}</option>
                                                <option value="CONFIRMED">{t("bookings.statusBooking.confirmed")}</option>
                                                <option value="CANCELLED">{t("bookings.statusBooking.cancelled")}</option>
                                                <option value="COMPLETED">{t("bookings.statusBooking.completed")}</option>
                                            </select>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-opacity-70">
                                            {t("bookings.quantity")}
                                        </label>
                                        <div className="text-sm">{currentBooking.quantity}</div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-opacity-70">
                                            {t("bookings.totalPrice")}
                                        </label>
                                        <div className="text-sm font-medium">
                                            {currentBooking.totalPrice} {currentBooking.event.currency}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-opacity-70">
                                            {t("bookings.bookingDate")}
                                        </label>
                                        <div className="text-sm">{formatDate(currentBooking.bookingDate)}</div>
                                    </div>

                                    {currentBooking.cancellationDate && (
                                        <div>
                                            <label className="block text-xs font-medium mb-1 text-opacity-70">
                                                {t("bookings.cancellationDate")}
                                            </label>
                                            <div className="text-sm">{formatDate(currentBooking.cancellationDate)}</div>
                                        </div>
                                    )}
                                </div>

                                {currentBooking.feedback && (
                                    <div className="mt-4">
                                        <label className="block text-xs font-medium mb-1 text-opacity-70">
                                            {t("bookings.feedback")}
                                        </label>
                                        <div className={`p-3 rounded ${isDark ? "bg-gray-800" : "bg-white"} text-sm`}>
                                            {currentBooking.feedback}
                                        </div>

                                        {currentBooking.rating && (
                                            <div className="mt-2 flex items-center">
                                                <span className="text-xs font-medium mr-2">{t("bookings.rating")}:</span>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg
                                                            key={i}
                                                            className={`w-4 h-4 ${i < currentBooking.rating!
                                                                ? "text-yellow-400"
                                                                : isDark
                                                                    ? "text-gray-600"
                                                                    : "text-gray-300"
                                                                }`}
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                        </svg>
                                                    ))}
                                                    <span className="ml-2 font-medium">{currentBooking.rating} / 5</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Event Info */}
                            <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                                <h4 className="text-lg font-medium mb-3">{t("bookings.eventInfo")}</h4>

                                <div className="mb-3">
                                    <div className="flex flex-wrap items-center mb-2">
                                        <h5 className="text-base font-medium mr-2">{currentBooking.event.title}</h5>
                                        <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"} dir-rtl`}>
                                            ({currentBooking.event.titleAr})
                                        </span>
                                    </div>
                                    <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"} mb-2 line-clamp-2`}>
                                        {currentBooking.event.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-opacity-70">
                                            {t("events.startDate")}
                                        </label>
                                        <div className="text-sm">
                                            {formatDate(currentBooking.event.startDate)}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-opacity-70">
                                            {t("events.endDate")}
                                        </label>
                                        <div className="text-sm">
                                            {formatDate(currentBooking.event.endDate)}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-opacity-70">
                                            {t("venues.name")}
                                        </label>
                                        <div className="text-sm">
                                            {currentBooking.event.venue?.name}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-opacity-70">
                                            {t("events.price")}
                                        </label>
                                        <div className="text-sm">
                                            {currentBooking.event.price} {currentBooking.event.currency}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
                            <button
                                type="button"
                                onClick={closeModal}
                                className={`px-4 py-2 rounded-lg ${isDark
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                    } transition-colors duration-200`}
                            >
                                {t("common.close")}
                            </button>

                            {!isViewOnly && (
                                <button
                                    type="submit"
                                    disabled={loading || newStatus === currentBooking.status}
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 flex items-center"
                                >
                                    {loading && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {t("bookings.updateStatus")}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;