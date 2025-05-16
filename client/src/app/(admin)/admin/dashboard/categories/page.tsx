"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import { getCookie } from "cookies-next";
import axios from "axios";
import { BACKEND_URL } from "@/lib/constants/backend";
import { toast } from "react-toastify";
import SearchBar from "@/components/admin/dashboard/events/SearchBar";
import { AddIcon, DeleteIcon, EditIcon, ViewIcon } from "@/components/admin/dashboard/events/AddIcon";
import CategoryModal from "@/components/admin/dashboard/categories/CategoryModal";
import DeleteConfirmModal from "@/components/admin/dashboard/categories/DeleteConfirmModal";

export type CategoryType = {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    createdAt: string;
    updatedAt: string;
};

const CategoriesAdmin = () => {
    const { theme } = useTheme();
    const { t, locale } = useTranslations();
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [currentCategory, setCurrentCategory] = useState<CategoryType | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryType | null>(null);

    const isRtl = locale === "ar";
    const isDark = theme === "dark";

    const initialFormData = {
        name: "",
        nameAr: "",
        description: "",
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKEND_URL}/categories`);
            if (response.status === 200) {
                setCategories(response.data.data);
            }
            setLoading(false);
        } catch (e) {
            setError("Failed to fetch categories");
            setLoading(false);
        }
    };

    const openModal = (type: string, category: CategoryType | null = null, e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();

        setModalType(type);
        setCurrentCategory(category);

        if (category && (type === "edit" || type === "view")) {
            setFormData({
                name: category.name || "",
                nameAr: category.nameAr || "",
                description: category.description || "",
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
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

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

            const categoryData = {
                name: formData.name,
                nameAr: formData.nameAr,
                description: formData.description,
            };

            if (modalType === "add") {
                const response = await axios.post(
                    `${BACKEND_URL}/categories`,
                    categoryData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessTokenAdmin}`,
                        },
                    }
                );

                if (response.status === 201) {
                    setShowModal(false);
                    toast.success(t("categories.addCategorySuccess"));
                    fetchCategories();
                } else {
                    toast.error(t("categories.addCategoryError"));
                }
            } else if (modalType === "edit") {
                const response = await axios.patch(
                    `${BACKEND_URL}/categories/${currentCategory?.id}`,
                    categoryData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessTokenAdmin}`,
                        },
                    }
                );

                if (response.status === 200) {
                    setShowModal(false);
                    toast.success(t("categories.updateCategorySuccess"));
                    fetchCategories();
                } else {
                    toast.error(t("categories.updateCategoryError"));
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

    const confirmDelete = (category: CategoryType, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setCategoryToDelete(category);
        setShowDeleteConfirm(true);
    };

    const cancelDelete = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setShowDeleteConfirm(false);
        setCategoryToDelete(null);
    };

    const handleDelete = async (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }

        if (!categoryToDelete) return;

        setLoading(true);
        try {
            const accessTokenAdmin = getCookie("accessTokenAdmin");
            const response = await axios.delete(
                `${BACKEND_URL}/categories/${categoryToDelete.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessTokenAdmin}`,
                    },
                }
            );

            if (response.status === 200) {
                setShowDeleteConfirm(false);
                setCategoryToDelete(null);
                toast.success(t("categories.deleteCategorySuccess"));
                fetchCategories();
            } else {
                toast.error(t("categories.deleteCategoryError"));
            }
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(
        (category) =>
            category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        {t("navigation.categories")}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                    >
                        {t("categories.subtitle")}
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
                                    <span className="ml-2">{t("categories.addCategory")}</span>
                                </motion.button>
                            </div>
                        </div>

                        {loading && (
                            <div className="flex justify-center items-center py-10">
                                <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-purple-600 animate-spin"></div>
                            </div>
                        )}

                        {!loading && filteredCategories.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className={`min-w-full divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                                    <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                                        <tr>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                                                {t("categories.table.category")}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                                                {t("categories.table.description")}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                                                {t("categories.table.createdAt")}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}>
                                                {t("categories.table.actions")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                                        {filteredCategories.map((category) => (
                                            <tr
                                                key={category.id}
                                                className={`${isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors cursor-pointer`}
                                                onClick={() => openModal("view", category)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-medium">{category.name}</div>
                                                        <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                            {category.nameAr}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="text-sm">{category.description}</div>
                                                    <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                        {category.description}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {formatDate(category.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex space-x-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => openModal("view", category, e)}
                                                            className={`p-1.5 rounded-full ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
                                                            title={t("categories.actions.view")}
                                                        >
                                                            <ViewIcon />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => openModal("edit", category, e)}
                                                            className={`p-1.5 rounded-full ${isDark ? "bg-gray-700 hover:bg-blue-700" : "bg-gray-100 hover:bg-blue-100"}`}
                                                            title={t("categories.actions.edit")}
                                                        >
                                                            <EditIcon />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => confirmDelete(category, e)}
                                                            className={`p-1.5 rounded-full ${isDark ? "bg-gray-700 hover:bg-red-700" : "bg-gray-100 hover:bg-red-100"}`}
                                                            title={t("categories.actions.delete")}
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

                        {!loading && filteredCategories.length === 0 && (
                            <div className="text-center py-10">
                                <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    {t("categories.noCategories")}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {showModal && (
                <CategoryModal
                    modalType={modalType}
                    formData={formData}
                    currentCategory={currentCategory}
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
                    categoryToDelete={categoryToDelete}
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

export default CategoriesAdmin;