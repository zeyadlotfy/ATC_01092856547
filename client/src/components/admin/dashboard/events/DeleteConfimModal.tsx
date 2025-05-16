import React from "react";

export interface Event {
    title: string;
}

interface DeleteConfirmModalProps {
    eventToDelete: Event | null;
    handleDelete: (e?: React.MouseEvent) => Promise<void>;
    cancelDelete: (e?: React.MouseEvent) => void;
    loading: boolean;
    isDark: boolean;
    t: (key: string, options?: any) => string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    eventToDelete,
    handleDelete,
    cancelDelete,
    loading,
    isDark,
    t,
}) => {
    if (!eventToDelete) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    aria-hidden="true"
                    onClick={cancelDelete}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal content */}
                <div
                    className={`inline-block overflow-hidden text-left align-bottom transition-all transform rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                        }`}
                    style={{
                        position: 'relative',
                        zIndex: 10
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 mx-auto rounded-full sm:mx-0 sm:h-10 sm:w-10 ${isDark ? "bg-red-900" : "bg-red-100"
                                }`}>
                                <svg
                                    className={`w-6 h-6 ${isDark ? "text-red-300" : "text-red-600"}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
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
                                <h3
                                    className="text-lg font-medium leading-6"
                                    id="modal-title"
                                >
                                    {t("events.delete.title")}
                                </h3>
                                <div className="mt-2">
                                    <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                                        {t("events.delete.confirmation", {
                                            name: eventToDelete.title
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${isDark ? "border-t border-gray-700" : "bg-gray-50"}`}>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className={`inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    {t("common.processing")}
                                </span>
                            ) : (
                                t("events.delete.confirm")
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={cancelDelete}
                            className={`inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${isDark
                                ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {t("common.cancel")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;