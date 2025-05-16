/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import { getCookie } from "cookies-next";
import axios from "axios";
import { BACKEND_URL } from "@/lib/constants/backend";
import { toast } from "react-toastify";
import EventList from "@/components/admin/dashboard/events/EventList";
import EventModal from "@/components/admin/dashboard/events/EventModal";
import DeleteConfirmModal from "@/components/admin/dashboard/events/DeleteConfimModal";
import SearchBar from "@/components/admin/dashboard/events/SearchBar";
import { AddIcon } from "@/components/admin/dashboard/events/AddIcon";

interface EventListProps {
    filteredEvents: EventType[];
    handleActionClick: (e: React.MouseEvent, action: string, event: EventType) => void;
    isDark: boolean;
    t: (key: string, options?: any) => string;
}

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
    imageUrl: string | undefined;
    imageId: string | undefined;
    tagsIds: string[];
    maxAttendees: number;
    isPublished: boolean;
    isHighlighted: boolean;
    category: Category;
    venue: Venue;
    tags: Tag[];
    createdAt: string;
    updatedAt: string;
};

const EventsAdmin = () => {
    const { theme } = useTheme();
    const { t, locale } = useTranslations();
    const [events, setEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add"); // add, edit, delete, view
    const [currentEvent, setCurrentEvent] = useState<EventType | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<EventType | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);

    const isRtl = locale === "ar";
    const isDark = theme === "dark";

    const initialFormData = {
        title: "",
        titleAr: "",
        description: "",
        descriptionAr: "",
        startDate: new Date().toISOString().slice(0, 16), // Format: "YYYY-MM-DDThh:mm"
        endDate: new Date().toISOString().slice(0, 16), // Format: "YYYY-MM-DDThh:mm" 
        price: 0,
        currency: "USD",
        imageUrl: undefined as string | undefined,
        imageId: undefined as string | undefined,
        tagIds: [] as string[],
        maxAttendees: 100,
        isPublished: false,
        isHighlighted: false,
        categoryId: "",
        venueId: "",
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchEvents();
        fetchCategories();
        fetchVenues();
        fetchTags();
    }, [currentPage]);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKEND_URL}/events`);
            if (response.status === 200) {
                setEvents(response.data.events);
            }
            setLoading(false);
        } catch (e) {
            setError("Failed to fetch events");
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
        }
    };

    const fetchVenues = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/venues`);
            if (response.status === 200) {
                setVenues(response.data.data);
            }
        } catch (e) {
        }
    };

    const fetchTags = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/tags`);
            if (response.status === 200) {
                setTags(response.data.data);
            }
        } catch (e) {
        }
    };

    const openModal = (type: string, event: EventType | null = null, e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();

        setModalType(type);
        setCurrentEvent(event);

        if (event && (type === "edit" || type === "view")) {
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);

            const formatDateForInput = (date: Date) => {
                return date.toISOString().slice(0, 16); // Format: "YYYY-MM-DDThh:mm"
            };

            setFormData({
                title: event.title || "",
                titleAr: event.titleAr || "",
                description: event.description || "",
                descriptionAr: event.descriptionAr || "",
                startDate: formatDateForInput(startDate),
                endDate: formatDateForInput(endDate),
                price: event.price || 0,
                currency: event.currency || "USD",
                imageUrl: event.imageUrl,
                imageId: event.imageId,
                tagIds: event.tagsIds || [], // Changed from tagsIds to tagIds
                maxAttendees: event.maxAttendees || 100,
                isPublished: event.isPublished !== undefined ? event.isPublished : false,
                isHighlighted: event.isHighlighted !== undefined ? event.isHighlighted : false,
                categoryId: event.category?.id || "",
                venueId: event.venue?.id || "",
            });
        } else {
            setFormData(initialFormData);
        }

        setShowModal(true);
    };

    const closeModal = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setShowModal(false);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name === "tagIds" && type === "checkbox") { // Changed from tagsIds to tagIds
            const tagId = value;
            const newTagIds = [...formData.tagIds]; // Changed from tagsIds to tagIds

            if (checked) {
                if (!newTagIds.includes(tagId)) {
                    newTagIds.push(tagId);
                }
            } else {
                const index = newTagIds.indexOf(tagId);
                if (index !== -1) {
                    newTagIds.splice(index, 1);
                }
            }

            setFormData({
                ...formData,
                tagIds: newTagIds,
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === "checkbox" ? checked : value,
            });
        }
    };

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setLoading(true);

        try {
            const accessTokenAdmin = getCookie("accessTokenAdmin");

            const formatDateForAPI = (dateString: string) => {
                const date = new Date(dateString);
                return date.toISOString();
            };

            const eventData = {
                title: formData.title,
                titleAr: formData.titleAr,
                description: formData.description,
                descriptionAr: formData.descriptionAr,
                startDate: formatDateForAPI(formData.startDate),
                endDate: formatDateForAPI(formData.endDate),
                price: Number(formData.price),
                currency: formData.currency,
                maxAttendees: Number(formData.maxAttendees),
                isPublished: formData.isPublished,
                isHighlighted: formData.isHighlighted,
                categoryId: formData.categoryId,
                venueId: formData.venueId,
                tagIds: formData.tagIds,
            };

            if (modalType === "add") {
                const response = await axios.post(
                    `${BACKEND_URL}/events`,
                    eventData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessTokenAdmin}`,
                        },
                    }
                );
                if (response.status === 201) {
                    setShowModal(false);
                    toast.success(t("events.addEventSuccess"));
                    fetchEvents();
                } else {
                    toast.error(t("events.addEventError"));
                }
            } else if (modalType === "edit") {
                const response = await axios.put(
                    `${BACKEND_URL}/events/${currentEvent?.id}`,
                    eventData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessTokenAdmin}`,
                        },
                    }
                );
                if (response.status === 200) {
                    setShowModal(false);
                    toast.success(t("events.updateEventSuccess"));
                    fetchEvents();
                } else {
                    toast.error(t("events.updateEventError"));
                }
            }



            closeModal();
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (event: EventType, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setEventToDelete(event);
        setShowDeleteConfirm(true);
    };

    const cancelDelete = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setShowDeleteConfirm(false);
        setEventToDelete(null);
    };

    const handleDelete = async (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }

        if (!eventToDelete) return;

        setLoading(true);
        try {
            const accessTokenAdmin = getCookie("accessTokenAdmin");
            const response = await axios.delete(
                `${BACKEND_URL}/events/${eventToDelete.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessTokenAdmin}`,
                    },
                }
            );

            if (response.status == 204) {
                setShowDeleteConfirm(false);
                setEventToDelete(null);
                toast.success(t("events.deleteEventSuccess"));
                fetchEvents();
            } else {
                toast.error(t("events.deleteEventError"));
            }
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (eventId: string, imageFile: File) => {
        setLoading(true);
        try {
            const accessTokenAdmin = getCookie("accessTokenAdmin");

            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await axios.patch(
                `${BACKEND_URL}/events/image/${eventId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessTokenAdmin}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.status === 200) {
                toast.success(t("events.imageUploadSuccess"));
                fetchEvents();
            } else {
                toast.error(t("events.imageUploadError"));
            }
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(
        (event) =>
            event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.titleAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleActionClick = (e: React.MouseEvent, action: string, event: EventType) => {
        e.stopPropagation();
        if (action === "view") {
            openModal("view", event);
        } else if (action === "edit") {
            openModal("edit", event);
        } else if (action === "delete") {
            confirmDelete(event);
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
                        {t("navigation.events")}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                    >
                        {t("events.subtitle")}
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

                            <div className="md:ml-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openModal("add");
                                    }}
                                    className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                                >
                                    <AddIcon />
                                    <span className="ml-2">{t("events.addEvent")}</span>
                                </motion.button>
                            </div>
                        </div>

                        {loading && (
                            <div className="flex justify-center items-center py-10">
                                <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-purple-600 animate-spin"></div>
                            </div>
                        )}

                        {!loading && filteredEvents.length > 0 && (
                            <EventList
                                filteredEvents={filteredEvents}
                                handleActionClick={handleActionClick}
                                isDark={isDark}
                                t={t}
                            />
                        )}

                        {!loading && filteredEvents.length === 0 && (
                            <div className="text-center py-10">
                                <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    {t("events.noEvents")}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {showModal && (
                <EventModal
                    modalType={modalType}
                    formData={formData}
                    currentEvent={
                        currentEvent
                            ? {
                                ...currentEvent,
                                tagIds: currentEvent.tagsIds ?? [],
                            }
                            : null
                    }
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    handleImageUpload={handleImageUpload}
                    closeModal={closeModal}
                    loading={loading}
                    isDark={isDark}
                    t={t}
                    categories={categories}
                    venues={venues}
                    tags={tags}
                />
            )}

            {showDeleteConfirm && (
                <DeleteConfirmModal
                    eventToDelete={eventToDelete}
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

export default EventsAdmin;