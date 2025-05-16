import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EventType } from "@/app/(admin)/admin/dashboard/events/page";

// Icons
const ViewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

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

interface Event {
    id: string | number;
    title: string;
    imageUrl?: string;
    price?: number;
    currency?: string;
    startDate: string;
    endDate: string;
    category?: { name: string };
    venue?: { name: string };
    isPublished: boolean;
    isHighlighted?: boolean;
}



interface EventListProps {
    filteredEvents: EventType[];
    handleActionClick: (e: React.MouseEvent, action: string, event: EventType) => void;
    isDark: boolean;
    t: (key: string, options?: any) => string;
}
const EventList: React.FC<EventListProps> = ({ filteredEvents, handleActionClick, isDark, t }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            {t("events.table.event")}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            {t("events.table.date")}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            {t("events.table.category")}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            {t("events.table.venue")}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            {t("events.table.status")}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            {t("events.table.actions")}
                        </th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                    <AnimatePresence>
                        {filteredEvents.map((event, index) => (
                            <motion.tr
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {event.imageUrl ? (
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    src={event.imageUrl}
                                                    alt={event.title}
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                                                    {event.title?.[0] || "E"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium">
                                                {event.title}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {event.price} {event.currency}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div>{formatDate(event.startDate)}</div>
                                    <div className="text-gray-500 dark:text-gray-400">{formatDate(event.endDate)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`}
                                    >
                                        {event.category?.name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {event.venue?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex flex-col space-y-1">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.isPublished
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                }`}
                                        >
                                            {event.isPublished ? t("events.status.published") : t("events.status.draft")}
                                        </span>
                                        {event.isHighlighted && (
                                            <span
                                                className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                            >
                                                {t("events.status.highlighted")}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => handleActionClick(e, "view", event)}
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
                                            onClick={(e) => handleActionClick(e, "edit", event)}
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
                                            onClick={(e) => handleActionClick(e, "delete", event)}
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
    );
};

export default EventList;