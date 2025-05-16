import React from "react";
import { VenueType } from "@/app/(admin)/admin/dashboard/venues/page";

interface VenueModalProps {
    modalType: string;
    formData: {
        name: string;
        nameAr: string;
        address: string;
        city: string;
        country: string;
        capacity: number;
    };
    currentVenue: VenueType | null;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    closeModal: (e?: React.MouseEvent) => void;
    loading: boolean;
    isDark: boolean;
    t: (key: string, options?: any) => string;
}

const VenueModal: React.FC<VenueModalProps> = ({
    modalType,
    formData,
    currentVenue,
    handleInputChange,
    handleSubmit,
    closeModal,
    loading,
    isDark,
    t,
}) => {
    const isViewOnly = modalType === "view";

    const modalTitle = {
        add: t("venues.addVenue"),
        edit: t("venues.editVenue"),
        view: t("venues.viewVenue"),
    }[modalType];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    // Common countries list for dropdown
    const countries = [
        "Egypt", "Saudi Arabia", "UAE", "Kuwait", "Qatar", "Bahrain", "Oman",
        "Jordan", "Lebanon", "Morocco", "Tunisia", "Algeria", "Iraq", "Sudan",
        "Palestine", "Yemen", "Syria", "Libya", "Other"
    ];

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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" htmlFor="name">
                                        {t("venues.name")}
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={isViewOnly}
                                        className={`w-full px-3 py-2 rounded-lg ${isDark
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-gray-50 border-gray-300 text-gray-900'
                                            } border focus:ring-purple-500 focus:border-purple-500`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1" htmlFor="nameAr">
                                        {t("venues.nameAr")}
                                    </label>
                                    <input
                                        type="text"
                                        id="nameAr"
                                        name="nameAr"
                                        value={formData.nameAr}
                                        onChange={handleInputChange}
                                        disabled={isViewOnly}
                                        dir="rtl"
                                        className={`w-full px-3 py-2 rounded-lg ${isDark
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-gray-50 border-gray-300 text-gray-900'
                                            } border focus:ring-purple-500 focus:border-purple-500`}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="address">
                                    {t("venues.address")}
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={isViewOnly}
                                    className={`w-full px-3 py-2 rounded-lg ${isDark
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-gray-50 border-gray-300 text-gray-900'
                                        } border focus:ring-purple-500 focus:border-purple-500`}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" htmlFor="city">
                                        {t("venues.city")}
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        disabled={isViewOnly}
                                        className={`w-full px-3 py-2 rounded-lg ${isDark
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-gray-50 border-gray-300 text-gray-900'
                                            } border focus:ring-purple-500 focus:border-purple-500`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1" htmlFor="country">
                                        {t("venues.country")}
                                    </label>
                                    {isViewOnly ? (
                                        <input
                                            type="text"
                                            id="country"
                                            value={formData.country}
                                            disabled
                                            className={`w-full px-3 py-2 rounded-lg ${isDark
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-gray-50 border-gray-300 text-gray-900'
                                                } border`}
                                        />
                                    ) : (
                                        <select
                                            id="country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 rounded-lg ${isDark
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-gray-50 border-gray-300 text-gray-900'
                                                } border focus:ring-purple-500 focus:border-purple-500`}
                                            required
                                        >
                                            <option value="" disabled>{t("venues.selectCountry")}</option>
                                            {countries.map((country) => (
                                                <option key={country} value={country}>
                                                    {country}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="capacity">
                                    {t("venues.capacity")}
                                </label>
                                <input
                                    type="number"
                                    id="capacity"
                                    name="capacity"
                                    min="1"
                                    max="100000"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                    disabled={isViewOnly}
                                    className={`w-full px-3 py-2 rounded-lg ${isDark
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-gray-50 border-gray-300 text-gray-900'
                                        } border focus:ring-purple-500 focus:border-purple-500`}
                                    required
                                />
                            </div>

                            {isViewOnly && currentVenue && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            {t("venues.createdAt")}
                                        </label>
                                        <div className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            {formatDate(currentVenue.createdAt)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            {t("venues.updatedAt")}
                                        </label>
                                        <div className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            {formatDate(currentVenue.updatedAt)}
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                {t("common.cancel")}
                            </button>

                            {!isViewOnly && (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 flex items-center"
                                >
                                    {loading && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {modalType === "add" ? t("venues.form.create") : t("venues.form.update")}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VenueModal;