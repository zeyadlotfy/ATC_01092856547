"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import { getCookie } from "cookies-next";
import axios from "axios";
import { BACKEND_URL } from "@/lib/constants/backend";
import { toast } from "react-toastify";
import SearchBar from "@/components/admin/dashboard/venues/SearchBar";
import { AddIcon, DeleteIcon, EditIcon, ViewIcon } from "@/components/admin/dashboard/events/AddIcon";
import DeleteConfirmModal from "@/components/admin/dashboard/venues/DeleteConfirmModal";
import VenueModal from "@/components/admin/dashboard/venues/VenueModal";


export type VenueType = {
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

const VenuesAdmin = () => {
    const { theme } = useTheme();
    const { t, locale } = useTranslations();
    const [venues, setVenues] = useState<VenueType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [currentVenue, setCurrentVenue] = useState<VenueType | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [venueToDelete, setVenueToDelete] = useState<VenueType | null>(null);

    const isRtl = locale === "ar";
    const isDark = theme === "dark";

    const initialFormData = {
        name: "",
        nameAr: "",
        address: "",
        city: "",
        country: "",
        capacity: 100,
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKEND_URL}/venues`);
            if (response.status === 200) {
                setVenues(response.data.data);
            }
            setLoading(false);
        } catch (e) {
            setError("Failed to fetch venues");
            setLoading(false);
        }
    };

    const openModal = (type: string, venue: VenueType | null = null, e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();

        setModalType(type);
        setCurrentVenue(venue);

        if (venue && (type === "edit" || type === "view")) {
            setFormData({
                name: venue.name || "",
                nameAr: venue.nameAr || "",
                address: venue.address || "",
                city: venue.city || "",
                country: venue.country || "",
                capacity: venue.capacity || 100,
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
        const { name, value } = e.target;

        if (name === "capacity") {
            const numValue = parseInt(value);
            setFormData({
                ...formData,
                [name]: isNaN(numValue) ? 0 : numValue,
            });
            return;
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setLoading(true);

        try {
            const accessTokenAdmin = getCookie("accessTokenAdmin");

            const venueData = {
                name: formData.name,
                nameAr: formData.nameAr,
                address: formData.address,
                city: formData.city,
                country: formData.country,
                capacity: formData.capacity,
            };

            if (modalType === "add") {
                const response = await axios.post(
                    `${BACKEND_URL}/venues`,
                    venueData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessTokenAdmin}`,
                        },
                    }
                );

                if (response.status === 201) {
                    setShowModal(false);
                    toast.success(t("venues.addVenueSuccess"));
                    fetchVenues();
                } else {
                    toast.error(t("venues.addVenueError"));
                }
            } else if (modalType === "edit") {
                const response = await axios.patch(
                    `${BACKEND_URL}/venues/${currentVenue?.id}`,
                    venueData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessTokenAdmin}`,
                        },
                    }
                );

                if (response.status === 200) {
                    setShowModal(false);
                    toast.success(t("venues.updateVenueSuccess"));
                    fetchVenues();
                } else {
                    toast.error(t("venues.updateVenueError"));
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

    const confirmDelete = (venue: VenueType, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setVenueToDelete(venue);
        setShowDeleteConfirm(true);
    };

    const cancelDelete = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setShowDeleteConfirm(false);
        setVenueToDelete(null);
    };

    const handleDelete = async (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }

        if (!venueToDelete) return;

        setLoading(true);
        try {
            const accessTokenAdmin = getCookie("accessTokenAdmin");
            const response = await axios.delete(
                `${BACKEND_URL}/venues/${venueToDelete.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessTokenAdmin}`,
                    },
                }
            );

            if (response.status === 200) {
                setShowDeleteConfirm(false);
                setVenueToDelete(null);
                toast.success(t("venues.deleteVenueSuccess"));
                fetchVenues();
            } else {
                toast.error(t("venues.deleteVenueError"));
            }
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredVenues = venues.filter(
        (venue) =>
            venue.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            venue.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            venue.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            venue.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            venue.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
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
                        {t("navigation.venues")}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                    >
                        {t("venues.subtitle")}
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
                                    <span className="ml-2">{t("venues.addVenue")}</span>
                                </motion.button>
                            </div>
                        </div>

                        {loading && (
                            <div className="flex justify-center items-center py-10">
                                <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-purple-600 animate-spin"></div>
                            </div>
                        )}

                        {!loading && filteredVenues.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className={`min-w-full divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                                    <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                                        <tr>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                                                {t("venues.table.name")}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                                                {t("venues.table.location")}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                                                {t("venues.table.capacity")}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                                                {t("venues.table.actions")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                                        {filteredVenues.map((venue) => (
                                            <tr
                                                key={venue.id}
                                                className={`${isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors cursor-pointer`}
                                                onClick={() => openModal("view", venue)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-medium">{venue.name}</div>
                                                        <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`} dir="rtl">
                                                            {venue.nameAr}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm">
                                                        {venue.city}, {venue.country}
                                                    </div>
                                                    <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                        {venue.address}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {venue.capacity} {t("venues.capacityLabel")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex space-x-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => openModal("view", venue, e)}
                                                            className={`p-1.5 rounded-full ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
                                                            title={t("venues.actions.view")}
                                                        >
                                                            <ViewIcon />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => openModal("edit", venue, e)}
                                                            className={`p-1.5 rounded-full ${isDark ? "bg-gray-700 hover:bg-blue-700" : "bg-gray-100 hover:bg-blue-100"}`}
                                                            title={t("venues.actions.edit")}
                                                        >
                                                            <EditIcon />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => confirmDelete(venue, e)}
                                                            className={`p-1.5 rounded-full ${isDark ? "bg-gray-700 hover:bg-red-700" : "bg-gray-100 hover:bg-red-100"}`}
                                                            title={t("venues.actions.delete")}
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

                        {!loading && filteredVenues.length === 0 && (
                            <div className="text-center py-10">
                                <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    {t("venues.noVenues")}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {showModal && (
                <VenueModal
                    modalType={modalType}
                    formData={formData}
                    currentVenue={currentVenue}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    closeModal={closeModal}
                    loading={loading}
                    isDark={isDark}
                    t={t}
                />
            )}

            {showDeleteConfirm && (
                <DeleteConfirmModal
                    venueToDelete={venueToDelete}
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

export default VenuesAdmin;