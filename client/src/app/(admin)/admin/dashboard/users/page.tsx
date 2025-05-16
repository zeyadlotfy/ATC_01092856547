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

// Icons
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const ViewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const AddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    language: string;
    profileImageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
};

const UsersAdmin = () => {
    const { theme } = useTheme();
    const { t, locale } = useTranslations();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add"); // add, edit, delete, view
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        role: "USER",
        isActive: true,
        language: "en",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const isRtl = locale === "ar";
    const isDark = theme === "dark";

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const accessTokenAdmin = getCookie("accessTokenAdmin");
            const response = await axios.get(
                `${BACKEND_URL}/users`,
                {
                    headers: {
                        Authorization: `Bearer ${accessTokenAdmin}`,
                    },
                }
            );
            if (response.status === 200) {
                setUsers(response.data.users);
            }
            setLoading(false);
        } catch (e) {
            setError("Failed to fetch users");
            setLoading(false);
        }
    };

    const openModal = (type: string, user: User | null = null, e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();

        setModalType(type);
        setCurrentUser(user);

        if (user && (type === "edit" || type === "view")) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                role: user.role || "USER",
                isActive: user.isActive !== undefined ? user.isActive : true,
                language: user.language || "en",
            });
        } else {
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                role: "USER",
                isActive: true,
                language: "en",
            });
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);

        try {
            const accessTokenAdmin = getCookie("accessTokenAdmin");

            if (modalType === "add") {
                const response = await axios.post(`${BACKEND_URL}/users`, {
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    role: formData.role,
                    isActive: formData.isActive,
                    language: "en",
                    password: formData.email,
                }, {
                    headers: {
                        Authorization: `Bearer ${accessTokenAdmin}`,
                    },
                });
                if (response.status == 201) {
                    setShowModal(false);
                    toast.success(t("users.addUserSuccess"))

                    fetchUsers();
                } else {
                    toast.error(t("users.addUserError"))
                }
            } else if (modalType === "edit") {
                const response = await axios.patch(`${BACKEND_URL}/users/${currentUser?.id}`, {
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    role: formData.role,
                    isActive: formData.isActive,
                }
                    , {
                        headers: {
                            Authorization: `Bearer ${accessTokenAdmin}`,
                        },
                    });
                if (response.status == 200) {
                    setShowModal(false);
                    toast.success(t("users.updateUserSuccess"))
                    fetchUsers();
                } else {
                    toast.error(t("users.updateUserError"))
                }
            }
            else if (modalType === "delete") {
                const response = await axios.delete(`${BACKEND_URL}/users/${currentUser?.id}`, {
                    headers: {
                        Authorization: `Bearer ${accessTokenAdmin}`,
                    },
                });
                if (response.status == 200) {
                    setShowModal(false);
                    toast.success(t("users.deleteUserSuccess"))
                    fetchUsers();
                } else {
                    toast.error(t("users.deleteUserError"))
                }
            }
            closeModal();
            fetchUsers();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (user: User, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const cancelDelete = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setShowDeleteConfirm(false);
        setUserToDelete(null);
    };

    const handleDelete = async (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }

        if (!userToDelete) return;

        setLoading(true);
        try {
            const accessTokenAdmin = getCookie("accessTokenAdmin");
            const response = await fetch(
                `${BACKEND_URL}/users/${userToDelete.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessTokenAdmin}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete user");
            }

            setShowDeleteConfirm(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleActionClick = (e: React.MouseEvent, action: string, user: User) => {
        e.stopPropagation();
        if (action === "view") {
            openModal("view", user);
        } else if (action === "edit") {
            openModal("edit", user);
        } else if (action === "delete") {
            confirmDelete(user);
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
                        {t("navigation.users")}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                    >
                        {t("users.subtitle")}
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
                            <div className="relative flex-1 max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon />
                                </div>
                                <input
                                    type="text"
                                    placeholder={t("users.search")}
                                    className={`pl-10 pr-4 py-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark
                                        ? "bg-gray-700 text-white placeholder-gray-400 border-gray-600"
                                        : "bg-gray-100 text-gray-800 placeholder-gray-500 border-gray-300"
                                        }`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        onClick={() => setSearchTerm("")}
                                    >
                                        <CloseIcon />
                                    </button>
                                )}
                            </div>

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
                                <span className="ml-2">{t("users.addUser")}</span>
                            </motion.button>
                        </div>

                        {loading && (
                            <div className="flex justify-center items-center py-10">
                                <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-purple-600 animate-spin"></div>
                            </div>
                        )}
                        {!loading && filteredUsers.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                {t("users.table.user")}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                {t("users.table.email")}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                {t("users.table.role")}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                {t("users.table.status")}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                {t("users.table.actions")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                                        <AnimatePresence>
                                            {filteredUsers.map((user, index) => (
                                                <motion.tr
                                                    key={user.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                    className={isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                {user.profileImageUrl ? (
                                                                    <img
                                                                        className="h-10 w-10 rounded-full object-cover"
                                                                        src={user.profileImageUrl}
                                                                        alt={`${user.firstName} ${user.lastName}`}
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                                                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium">
                                                                    {user.firstName} {user.lastName}
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {t(`users.language.${user.language}`)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "ADMIN"
                                                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                }`}
                                                        >
                                                            {t(`users.roles.${user.role.toLowerCase()}`)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                                }`}
                                                        >
                                                            {user.isActive ? t("users.status.active") : t("users.status.inactive")}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={(e) => handleActionClick(e, "view", user)}
                                                                className={`p-1 rounded-full ${isDark
                                                                    ? "bg-gray-700 text-blue-400 hover:bg-gray-600"
                                                                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                                                    }`}
                                                            >
                                                                <ViewIcon />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={(e) => handleActionClick(e, "edit", user)}
                                                                className={`p-1 rounded-full ${isDark
                                                                    ? "bg-gray-700 text-amber-400 hover:bg-gray-600"
                                                                    : "bg-amber-100 text-amber-600 hover:bg-amber-200"
                                                                    }`}
                                                            >
                                                                <EditIcon />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={(e) => handleActionClick(e, "delete", user)}
                                                                className={`p-1 rounded-full ${isDark
                                                                    ? "bg-gray-700 text-red-400 hover:bg-gray-600"
                                                                    : "bg-red-100 text-red-600 hover:bg-red-200"
                                                                    }`}
                                                            >
                                                                <DeleteIcon />
                                                            </motion.button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={closeModal}
                    ></div>

                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                        &#8203;
                    </span>

                    <div
                        className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${isDark ? "bg-gray-800" : "bg-white"}`}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                        {modalType === "add"
                                            ? t("users.modal.addTitle")
                                            : modalType === "edit"
                                                ? t("users.modal.editTitle")
                                                : modalType === "view"
                                                    ? t("users.modal.viewTitle")
                                                    : t("users.modal.deleteTitle")}
                                    </h3>
                                    <div className="mt-6">
                                        {modalType !== "view" ? (
                                            <form onSubmit={handleSubmit}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                                                            {t("users.form.firstName")}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="firstName"
                                                            name="firstName"
                                                            className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark
                                                                ? "bg-gray-700 text-white border-gray-600"
                                                                : "bg-gray-100 text-gray-800 border-gray-300"
                                                                }`}
                                                            value={formData.firstName}
                                                            onChange={handleInputChange}
                                                            required
                                                            disabled={modalType === "view"}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                                                            {t("users.form.lastName")}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="lastName"
                                                            name="lastName"
                                                            className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark
                                                                ? "bg-gray-700 text-white border-gray-600"
                                                                : "bg-gray-100 text-gray-800 border-gray-300"
                                                                }`}
                                                            value={formData.lastName}
                                                            onChange={handleInputChange}
                                                            required
                                                            disabled={modalType === "view"}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                                                        {t("users.form.email")}
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark
                                                            ? "bg-gray-700 text-white border-gray-600"
                                                            : "bg-gray-100 text-gray-800 border-gray-300"
                                                            }`}
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        required
                                                        disabled={modalType === "view"}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <div>
                                                        <label htmlFor="role" className="block text-sm font-medium mb-1">
                                                            {t("users.form.role")}
                                                        </label>
                                                        <select
                                                            id="role"
                                                            name="role"
                                                            className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark
                                                                ? "bg-gray-700 text-white border-gray-600"
                                                                : "bg-gray-100 text-gray-800 border-gray-300"
                                                                }`}
                                                            value={formData.role}
                                                            onChange={handleInputChange}
                                                            disabled={modalType === "view"}
                                                        >
                                                            <option value="USER">{t("users.roles.user")}</option>
                                                            <option value="ADMIN">{t("users.roles.admin")}</option>
                                                        </select>
                                                    </div>

                                                </div>
                                                <div className="mt-4 flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="isActive"
                                                        name="isActive"
                                                        checked={formData.isActive}
                                                        onChange={handleInputChange}
                                                        disabled={modalType === "view"}
                                                        className={`h-4 w-4 rounded focus:ring-2 focus:ring-purple-500 ${isDark
                                                            ? "bg-gray-700 text-purple-600 border-gray-600"
                                                            : "bg-gray-100 text-purple-600 border-gray-300"
                                                            }`}
                                                    />
                                                    <label htmlFor="isActive" className="ml-2 block text-sm">
                                                        {t("users.form.active")}
                                                    </label>
                                                </div>

                                                <div className="mt-6 sm:flex sm:flex-row-reverse">
                                                    {modalType !== "view" && (
                                                        <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-base font-medium text-white hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm ${loading ? "opacity-50 cursor-not-allowed" : ""
                                                                }`}
                                                        >
                                                            {loading ? (
                                                                <span className="flex items-center">
                                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    {t("common.processing")}
                                                                </span>
                                                            ) : modalType === "add" ? (
                                                                t("users.form.add")
                                                            ) : (
                                                                t("users.form.update")
                                                            )}
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm ${isDark
                                                            ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                                            }`}
                                                        onClick={closeModal}
                                                    >
                                                        {modalType === "view" ? t("common.close") : t("common.cancel")}
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            // View mode
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("users.form.firstName")}</h4>
                                                        <p className="mt-1">{currentUser?.firstName}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("users.form.lastName")}</h4>
                                                        <p className="mt-1">{currentUser?.lastName}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("users.form.email")}</h4>
                                                    <p className="mt-1">{currentUser?.email}</p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("users.form.role")}</h4>
                                                        <p className="mt-1">
                                                            <span
                                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${currentUser?.role === "ADMIN"
                                                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                    }`}
                                                            >
                                                                {t(`users.roles.${currentUser?.role.toLowerCase()}`)}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("users.form.language")}</h4>
                                                        <p className="mt-1">{t(`users.language.${currentUser?.language}`)}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("users.form.status")}</h4>
                                                    <p className="mt-1">
                                                        <span
                                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${currentUser?.isActive
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                                }`}
                                                        >
                                                            {currentUser?.isActive ? t("users.status.active") : t("users.status.inactive")}
                                                        </span>
                                                    </p>
                                                </div>

                                                {currentUser?.createdAt && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("users.form.createdAt")}</h4>
                                                        <p className="mt-1">{new Date(currentUser.createdAt).toLocaleString()}</p>
                                                    </div>
                                                )}

                                                <div className="mt-6 sm:flex sm:flex-row-reverse">
                                                    <button
                                                        type="button"
                                                        className={`w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm ${isDark
                                                            ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                                            }`}
                                                        onClick={closeModal}
                                                    >
                                                        {t("common.close")}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={cancelDelete}
                    ></div>
                    <div
                        className={`relative z-10 inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${isDark ? "bg-gray-800" : "bg-white"}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div
                                    className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${isDark ? "bg-red-900" : "bg-red-100"
                                        }`}
                                >
                                    <svg
                                        className="h-6 w-6 text-red-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg leading-6 font-medium">{t("users.delete.title")}</h3>
                                    <div className="mt-2">
                                        <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                                            {t("users.delete.confirmation", {
                                                name: `${userToDelete?.firstName} ${userToDelete?.lastName}`,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${loading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t("common.processing")}
                                    </span>
                                ) : (
                                    t("users.delete.confirm")
                                )}
                            </button>
                            <button
                                type="button"
                                className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${isDark
                                    ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                onClick={cancelDelete}
                            >
                                {t("common.cancel")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersAdmin;