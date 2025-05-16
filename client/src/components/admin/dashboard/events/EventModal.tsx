"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import Image from "next/image";

type Tag = {
    id: string;
    name: string;
    nameAr: string;
};

type Category = {
    id: string;
    name: string;
    nameAr: string;
};

type Venue = {
    id: string;
    name: string;
    nameAr: string;
    address: string;
    city: string;
    country: string;
};

type Event = {
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
    tagIds: string[]; // Changed from tagsIds to tagIds
    maxAttendees: number;
    isPublished: boolean;
    isHighlighted: boolean;
    category: Category;
    venue: Venue;
    tags: Tag[];
    createdAt: string;
    updatedAt: string;
};

type FormData = {
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
    tagIds: string[]; // Changed from tagsIds to tagIds
    maxAttendees: number;
    isPublished: boolean;
    isHighlighted: boolean;
    categoryId: string;
    venueId: string;
};

interface EventModalProps {
    modalType: string;
    formData: FormData;
    currentEvent: Event | null;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleImageUpload: (eventId: string, imageFile: File) => Promise<void>; // Add this line
    closeModal: (e?: React.MouseEvent) => void;
    loading: boolean;
    isDark: boolean;
    t: (key: string) => string;
    categories: Category[];
    venues: Venue[];
    tags: Tag[];
}

const EventModal: React.FC<EventModalProps> = ({
    modalType,
    formData,
    currentEvent,
    handleInputChange,
    handleSubmit,
    handleImageUpload, // Add this
    closeModal,
    loading,
    isDark,
    t,
    categories,
    venues,
    tags,
}) => {
    const { locale } = useTranslations();
    const isRtl = locale === "ar";
    const [activeTab, setActiveTab] = useState("general");
    const [imagePreview, setImagePreview] = useState<string | null>(formData.imageUrl || null);
    const [imageFile, setImageFile] = useState<File | null>(null); // Add this
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Add this

    useEffect(() => {
        if (currentEvent?.imageUrl) {
            setPreviewUrl(currentEvent.imageUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [currentEvent]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
        }
    };

    const handleImageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentEvent?.id || !imageFile) return;

        await handleImageUpload(currentEvent.id, imageFile);
    };

    const isViewOnly = modalType === "view";

    const modalTitle = {
        add: t("events.addEvent"),
        edit: t("events.editEvent"),
        view: t("events.viewEvent"),
    }[modalType];

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
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className={`inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-2xl shadow-xl sm:align-middle`}
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

                        {/* Tabs */}
                        {!isViewOnly && (
                            <div className={`mb-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <nav className="flex -mb-px" aria-label="Tabs">
                                    <button
                                        className={`${activeTab === 'general'
                                            ? `${isDark ? 'text-purple-400 border-purple-400' : 'text-purple-600 border-purple-600'}`
                                            : `${isDark ? 'text-gray-400 border-transparent' : 'text-gray-500 border-transparent'}`
                                            } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
                                        onClick={() => setActiveTab('general')}
                                    >
                                        {t("events.tabGeneral")}
                                    </button>
                                    <button
                                        className={`${activeTab === 'details'
                                            ? `${isDark ? 'text-purple-400 border-purple-400' : 'text-purple-600 border-purple-600'}`
                                            : `${isDark ? 'text-gray-400 border-transparent' : 'text-gray-500 border-transparent'}`
                                            } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
                                        onClick={() => setActiveTab('details')}
                                    >
                                        {t("events.tabDetails")}
                                    </button>
                                    <button
                                        className={`${activeTab === 'metadata'
                                            ? `${isDark ? 'text-purple-400 border-purple-400' : 'text-purple-600 border-purple-600'}`
                                            : `${isDark ? 'text-gray-400 border-transparent' : 'text-gray-500 border-transparent'}`
                                            } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
                                        onClick={() => setActiveTab('metadata')}
                                    >
                                        {t("events.tabMetadata")}
                                    </button>
                                    {!isViewOnly && (
                                        <button
                                            className={`${activeTab === 'image'
                                                ? `${isDark ? 'text-purple-400 border-purple-400' : 'text-purple-600 border-purple-600'}`
                                                : `${isDark ? 'text-gray-400 border-transparent' : 'text-gray-500 border-transparent'}`
                                                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
                                            onClick={() => setActiveTab('image')}
                                        >
                                            {t("events.tabImage")}
                                        </button>
                                    )}
                                </nav>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* General Tab */}
                            {(activeTab === 'general' || isViewOnly) && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1" htmlFor="title">
                                                {t("events.title")}
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={formData.title}
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
                                            <label className="block text-sm font-medium mb-1" htmlFor="titleAr">
                                                {t("events.titleAr")}
                                            </label>
                                            <input
                                                type="text"
                                                id="titleAr"
                                                name="titleAr"
                                                value={formData.titleAr}
                                                onChange={handleInputChange}
                                                disabled={isViewOnly}
                                                className={`w-full px-3 py-2 rounded-lg ${isDark
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                                                    } border focus:ring-purple-500 focus:border-purple-500`}
                                                dir="rtl"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1" htmlFor="description">
                                                {t("events.description")}
                                            </label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                disabled={isViewOnly}
                                                rows={4}
                                                className={`w-full px-3 py-2 rounded-lg ${isDark
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                                                    } border focus:ring-purple-500 focus:border-purple-500`}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1" htmlFor="descriptionAr">
                                                {t("events.descriptionAr")}
                                            </label>
                                            <textarea
                                                id="descriptionAr"
                                                name="descriptionAr"
                                                value={formData.descriptionAr}
                                                onChange={handleInputChange}
                                                disabled={isViewOnly}
                                                rows={4}
                                                className={`w-full px-3 py-2 rounded-lg ${isDark
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                                                    } border focus:ring-purple-500 focus:border-purple-500`}
                                                dir="rtl"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1" htmlFor="startDate">
                                                {t("events.startDate")}
                                            </label>
                                            <input
                                                type="datetime-local" // Changed from date to datetime-local
                                                id="startDate"
                                                name="startDate"
                                                value={formData.startDate}
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
                                            <label className="block text-sm font-medium mb-1" htmlFor="endDate">
                                                {t("events.endDate")}
                                            </label>
                                            <input
                                                type="datetime-local"
                                                id="endDate"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleInputChange}
                                                disabled={isViewOnly}
                                                className={`w-full px-3 py-2 rounded-lg ${isDark
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                                                    } border focus:ring-purple-500 focus:border-purple-500`}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Details Tab */}
                            {(activeTab === 'details' || isViewOnly) && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1" htmlFor="categoryId">
                                                {t("events.category")}
                                            </label>
                                            <select
                                                id="categoryId"
                                                name="categoryId"
                                                value={formData.categoryId}
                                                onChange={handleInputChange}
                                                disabled={isViewOnly}
                                                className={`w-full px-3 py-2 rounded-lg ${isDark
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                                                    } border focus:ring-purple-500 focus:border-purple-500`}
                                                required
                                            >
                                                <option value="">{t("events.selectCategory")}</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {isRtl ? category.nameAr : category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1" htmlFor="venueId">
                                                {t("events.venue")}
                                            </label>
                                            <select
                                                id="venueId"
                                                name="venueId"
                                                value={formData.venueId}
                                                onChange={handleInputChange}
                                                disabled={isViewOnly}
                                                className={`w-full px-3 py-2 rounded-lg ${isDark
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                                                    } border focus:ring-purple-500 focus:border-purple-500`}
                                                required
                                            >
                                                <option value="">{t("events.selectVenue")}</option>
                                                {venues.map((venue) => (
                                                    <option key={venue.id} value={venue.id}>
                                                        {isRtl ? venue.nameAr : venue.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t("events.tags")}</label>
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} max-h-40 overflow-y-auto`}>
                                            {tags.map((tag) => (
                                                <div key={tag.id} className="flex items-center mb-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`tag-${tag.id}`}
                                                        name="tagIds" // Changed from tagsIds to tagIds
                                                        value={tag.id}
                                                        checked={formData.tagIds.includes(tag.id)} // Changed from tagsIds to tagIds
                                                        onChange={handleInputChange}
                                                        disabled={isViewOnly}
                                                        className={`w-4 h-4 ${isDark
                                                            ? 'bg-gray-700 border-gray-600 focus:ring-purple-600'
                                                            : 'bg-gray-100 border-gray-300 focus:ring-purple-500'
                                                            } rounded border focus:ring-2`}
                                                    />
                                                    <label
                                                        htmlFor={`tag-${tag.id}`}
                                                        className="ms-2 text-sm font-medium"
                                                    >
                                                        {isRtl ? tag.nameAr : tag.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1" htmlFor="price">
                                                {t("events.price")}
                                            </label>
                                            <div className="flex">
                                                <input
                                                    type="number"
                                                    id="price"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleInputChange}
                                                    disabled={isViewOnly}
                                                    min="0"
                                                    step="0.01"
                                                    className={`flex-grow rounded-l-lg ${isDark
                                                        ? 'bg-gray-700 border-gray-600 text-white'
                                                        : 'bg-gray-50 border-gray-300 text-gray-900'
                                                        } border focus:ring-purple-500 focus:border-purple-500 px-3 py-2`}
                                                />
                                                <select
                                                    id="currency"
                                                    name="currency"
                                                    value={formData.currency}
                                                    onChange={handleInputChange}
                                                    disabled={isViewOnly}
                                                    className={`rounded-r-lg ${isDark
                                                        ? 'bg-gray-700 border-gray-600 text-white'
                                                        : 'bg-gray-50 border-gray-300 text-gray-900'
                                                        } border focus:ring-purple-500 focus:border-purple-500 px-3 py-2`}
                                                >
                                                    <option value="USD">USD</option>
                                                    <option value="EUR">EUR</option>
                                                    <option value="GBP">GBP</option>
                                                    <option value="SAR">SAR</option>
                                                    <option value="AED">AED</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1" htmlFor="maxAttendees">
                                                {t("events.maxAttendees")}
                                            </label>
                                            <input
                                                type="number"
                                                id="maxAttendees"
                                                name="maxAttendees"
                                                value={formData.maxAttendees}
                                                onChange={handleInputChange}
                                                disabled={isViewOnly}
                                                min="1"
                                                className={`w-full px-3 py-2 rounded-lg ${isDark
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-gray-50 border-gray-300 text-gray-900'
                                                    } border focus:ring-purple-500 focus:border-purple-500`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Metadata Tab */}
                            {(activeTab === 'metadata' || isViewOnly) && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center">
                                            <input
                                                id="isPublished"
                                                name="isPublished"
                                                type="checkbox"
                                                checked={formData.isPublished}
                                                onChange={handleInputChange}
                                                disabled={isViewOnly}
                                                className={`h-4 w-4 rounded ${isDark
                                                    ? 'text-purple-600 bg-gray-700 border-gray-600'
                                                    : 'text-purple-600 bg-gray-100 border-gray-300'
                                                    } focus:ring-purple-500`}
                                            />
                                            <label htmlFor="isPublished" className="ml-2 block text-sm">
                                                {t("events.isPublished")}
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                id="isHighlighted"
                                                name="isHighlighted"
                                                type="checkbox"
                                                checked={formData.isHighlighted}
                                                onChange={handleInputChange}
                                                disabled={isViewOnly}
                                                className={`h-4 w-4 rounded ${isDark
                                                    ? 'text-purple-600 bg-gray-700 border-gray-600'
                                                    : 'text-purple-600 bg-gray-100 border-gray-300'
                                                    } focus:ring-purple-500`}
                                            />
                                            <label htmlFor="isHighlighted" className="ml-2 block text-sm">
                                                {t("events.isHighlighted")}
                                            </label>
                                        </div>
                                    </div>

                                    {/* You can add additional metadata fields here if needed */}
                                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                                        <h4 className="text-sm font-medium mb-2">{t("events.metadataInfo")}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {t("events.metadataDescription")}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Image Tab */}
                            {activeTab === 'image' && !isViewOnly && modalType === "edit" && currentEvent && (
                                <div className="space-y-4">
                                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                        {previewUrl ? (
                                            <div className="space-y-4">
                                                <img
                                                    src={previewUrl}
                                                    alt="Event image preview"
                                                    className="max-w-full h-64 mx-auto object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImageFile(null);
                                                        setPreviewUrl(null);
                                                    }}
                                                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                                                >
                                                    {t("events.removeImage")}
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <svg
                                                    className={`w-12 h-12 mx-auto ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    ></path>
                                                </svg>
                                                <label className="block mt-2">
                                                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} cursor-pointer hover:text-purple-500`}>
                                                        {t("events.clickToUpload")}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleImageFileChange}
                                                    />
                                                </label>
                                            </>
                                        )}
                                    </div>

                                    {imageFile && (
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleImageSubmit}
                                                disabled={loading}
                                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 flex items-center"
                                            >
                                                {loading && (
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                )}
                                                {t("events.uploadImage")}
                                            </button>
                                        </div>
                                    )}

                                    <div className="text-sm text-gray-500 mt-2">
                                        {t("events.imageRequirements")}
                                    </div>
                                </div>
                            )}

                            {/* Also add a section to display the image in view mode */}
                            {isViewOnly && currentEvent?.imageUrl && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">{t("events.eventImage")}</label>
                                    <img
                                        src={currentEvent.imageUrl}
                                        alt={currentEvent.title}
                                        className="max-w-full h-64 object-cover rounded-lg"
                                    />
                                </div>
                            )}

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
                                        {modalType === "add" ? t("events.addEvent") : t("events.updateEvent")}
                                    </button>
                                )}
                            </div>
                        </form>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EventModal;