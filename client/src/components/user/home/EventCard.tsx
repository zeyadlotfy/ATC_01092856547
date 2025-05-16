import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Star, Users, Tag } from "lucide-react";

// Enhanced TypeScript types
interface EventCardProps {
    event: {
        id: string;
        title: string;
        titleAr: string;
        description: string;
        descriptionAr: string;
        startDate: string;
        endDate: string;
        price: number;
        currency: string;
        imageUrl?: string;
        category?: {
            id: string;
            name: string;
            nameAr: string;
        };
        venue?: {
            id: string;
            name: string;
            nameAr: string;
            city?: string;
        };
        tags?: Array<{
            id: string;
            name: string;
            nameAr: string;
        }>;
    };
    isDark: boolean;
    isRtl: boolean;
    t: (key: string) => string;
}

const EventCard = ({ event, isDark, isRtl, t }: EventCardProps) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(isRtl ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getDuration = () => {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        const durationMs = end.getTime() - start.getTime();
        const durationHours = Math.round(durationMs / (1000 * 60 * 60));
        return durationHours > 0 ? durationHours : 1;
    };

    const getDaysUntil = () => {
        const today = new Date();
        const eventDate = new Date(event.startDate);
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntil = getDaysUntil();
    const isUpcoming = daysUntil > 0 && daysUntil <= 7;

    return (
        <motion.div
            className={`h-full rounded-xl overflow-hidden shadow-lg transition-all duration-500 w-full ${isDark
                ? "bg-gray-800 hover:shadow-purple-500/20"
                : "bg-white hover:shadow-purple-500/30"
                }`}
            whileHover={{
                y: -8,
                transition: { duration: 0.2 }
            }}
        >
            <div className="relative h-48 overflow-hidden">
                {event.imageUrl ? (
                    <Image
                        src={event.imageUrl}
                        alt={isRtl ? event.titleAr : event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transform hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                <div className="absolute top-4 right-4 bg-purple-600 text-white py-1 px-3 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">
                    {event.price === 0
                        ? t("event.free")
                        : `${event.price} ${event.currency}`
                    }
                </div>

                {isUpcoming && (
                    <div className={`absolute ${isRtl ? 'right-0' : 'left-0'} top-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-1 px-4 text-xs font-bold shadow-lg ${isRtl ? 'rounded-l-full' : 'rounded-r-full'} flex items-center`}>
                        <Star className="h-3 w-3 mr-1 fill-white text-white" />
                        {daysUntil === 0
                            ? t("event.today")
                            : daysUntil === 1
                                ? t("event.tomorrow")
                                : t(`event.daysAway.${daysUntil}`)}
                    </div>
                )}

                {event.category && (
                    <div className="absolute bottom-4 left-4 bg-indigo-600/80 backdrop-blur-sm text-white py-1 px-3 rounded-full text-sm font-medium flex items-center shadow-lg">
                        <Tag className="h-3 w-3 mr-1.5" />
                        {isRtl ? event.category.nameAr : event.category.name}
                    </div>
                )}
            </div>

            <div className="p-5">
                <Link href={`/events/${event.id}`} className="group">
                    <h3
                        className={`text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors duration-300 ${isDark ? "text-white" : "text-gray-800"
                            }`}
                    >
                        {isRtl ? event.titleAr : event.title}
                    </h3>
                </Link>

                <div className="space-y-3 mb-4">
                    <div className={`flex items-center text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-2">
                            <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span>{formatDate(event.startDate)}</span>
                    </div>

                    <div className={`flex items-center text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-2">
                            <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span>{formatTime(event.startDate)} • {getDuration()}h</span>
                    </div>

                    {event.venue && (
                        <div className={`flex items-center text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-2">
                                <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="truncate">
                                {isRtl ? event.venue.nameAr : event.venue.name}
                                {event.venue.city && `, ${event.venue.city}`}
                            </span>
                        </div>
                    )}
                </div>

                <p className={`text-sm mb-5 line-clamp-2 h-10 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {isRtl ? event.descriptionAr : event.description}
                </p>

                {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                        {event.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag.id}
                                className={`text-xs px-2 py-1 rounded-md ${isDark
                                    ? "bg-gray-700/70 text-gray-300 hover:bg-purple-900/40"
                                    : "bg-gray-100 text-gray-700 hover:bg-purple-100"
                                    } transition-colors duration-300 cursor-pointer`}
                            >
                                {isRtl ? tag.nameAr : tag.name}
                            </span>
                        ))}
                        {event.tags.length > 3 && (
                            <span
                                className={`text-xs px-2 py-1 rounded-md ${isDark
                                    ? "bg-gray-700 text-gray-300"
                                    : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                +{event.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                <Link href={`/events/${event.id}`} className="block w-full">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-lg text-center text-white group relative overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 group-hover:from-purple-700 group-hover:to-indigo-700"></span>

                        <span className="absolute inset-0 w-1/3 h-full transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></span>

                        <span className="relative flex items-center justify-center">
                            {t("event.viewDetails")}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className={`w-4 h-4 ${isRtl ? 'mr-1 group-hover:mr-2' : 'ml-1 group-hover:ml-2'} transition-all duration-300`}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d={isRtl ? "M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" : "M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"} />
                            </svg>
                        </span>
                    </motion.button>
                </Link>
            </div>
        </motion.div>
    );
};

export default EventCard;