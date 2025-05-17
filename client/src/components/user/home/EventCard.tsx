import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Clock, Star, Users, Tag } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const maxRotation = 5;
        const rotY = maxRotation * ((x - centerX) / centerX);
        const rotX = -maxRotation * ((y - centerY) / centerY);

        setRotateX(rotX);
        setRotateY(rotY);
        setMousePosition({ x, y });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setRotateX(0);
        setRotateY(0);
    };

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

    const cardVariants = {
        initial: {
            boxShadow: isDark
                ? "0px 4px 20px rgba(0, 0, 0, 0.2)"
                : "0px 4px 20px rgba(0, 0, 0, 0.1)",
            scale: 1
        },
        hover: {
            boxShadow: isDark
                ? "0px 20px 40px rgba(123, 104, 238, 0.3)"
                : "0px 20px 40px rgba(123, 104, 238, 0.2)",
            scale: 1.02,
            y: -8
        }
    };

    const imageVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.12, transition: { duration: 0.7 } }
    };

    const glowVariants = {
        initial: { opacity: 0 },
        hover: { opacity: 0.7, transition: { duration: 0.3 } }
    };

    const detailsVariants = {
        initial: { y: 10, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { duration: 0.5 } }
    };

    const buttonVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.05 },
        tap: { scale: 0.95 }
    };

    return (
        <motion.div
            ref={cardRef}
            className={`h-full rounded-xl overflow-hidden shadow-lg transition-all duration-300 w-full perspective-1000 ${isDark
                ? "bg-gray-800"
                : "bg-white"
                }`}
            style={{
                transformStyle: "preserve-3d",
                transform: isHovered ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : "perspective(1000px) rotateX(0) rotateY(0)",
                transition: "transform 0.3s ease-out"
            }}
            variants={cardVariants}
            initial="initial"
            whileHover="hover"
            animate={isHovered ? "hover" : "initial"}
            onMouseEnter={() => setIsHovered(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                className="absolute pointer-events-none w-full h-full rounded-xl"
                style={{
                    background: isHovered
                        ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${isDark ? "rgba(147, 112, 219, 0.4)" : "rgba(147, 112, 219, 0.2)"
                        } 0%, transparent 50%)`
                        : "none",
                    mixBlendMode: "screen"
                }}
                variants={glowVariants}
            />

            <div className="relative h-48 overflow-hidden">
                <motion.div
                    className="w-full h-full"
                    variants={imageVariants}
                >
                    {event.imageUrl ? (
                        <Image
                            src={event.imageUrl}
                            alt={isRtl ? event.titleAr : event.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: isHovered ? 360 : 0 }}
                                transition={{ duration: 5, ease: "linear", repeat: Infinity }}
                            >
                                <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                            </motion.div>
                        </div>
                    )}
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                <motion.div
                    className="absolute top-4 right-4 bg-purple-600 text-white py-1 px-3 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, transition: { delay: 0.1 } }}
                >
                    {event.price === 0
                        ? t("event.free")
                        : `${event.price} ${event.currency}`
                    }
                </motion.div>

                {isUpcoming && (
                    <motion.div
                        className={`absolute ${isRtl ? 'right-0' : 'left-0'} top-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-1 px-4 text-xs font-bold shadow-lg ${isRtl ? 'rounded-l-full' : 'rounded-r-full'} flex items-center`}
                        initial={{ x: isRtl ? 20 : -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1, transition: { delay: 0.2 } }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                        >
                            <Star className="h-3 w-3 mr-1 fill-white text-white" />
                        </motion.div>
                        {daysUntil === 0
                            ? t("event.today")
                            : daysUntil === 1
                                ? t("event.tomorrow")
                                : t(`event.daysAway.${daysUntil}`)}
                    </motion.div>
                )}

                {event.category && (
                    <motion.div
                        className="absolute bottom-4 left-4 bg-indigo-600/80 backdrop-blur-sm text-white py-1 px-3 rounded-full text-sm font-medium flex items-center shadow-lg"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
                    >
                        <motion.div
                            animate={isHovered ? { rotate: [0, 45, 0] } : {}}
                            transition={{ duration: 0.5 }}
                        >
                            <Tag className="h-3 w-3 mr-1.5" />
                        </motion.div>
                        {isRtl ? event.category.nameAr : event.category.name}
                    </motion.div>
                )}

                {isHovered && (
                    <div className="absolute inset-0 pointer-events-none">
                        <AnimatePresence>
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 rounded-full bg-white/60"
                                    initial={{
                                        x: Math.random() * 100 + "%",
                                        y: Math.random() * 100 + "%",
                                        scale: 0,
                                        opacity: 0
                                    }}
                                    animate={{
                                        y: [null, Math.random() * 100 + "%"],
                                        scale: [0, Math.random() + 0.5],
                                        opacity: [0, 0.7, 0]
                                    }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{
                                        duration: 1 + Math.random() * 2,
                                        repeat: Infinity,
                                        repeatType: "loop"
                                    }}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <motion.div
                className="p-5"
                variants={detailsVariants}
                initial="initial"
                animate="animate"
                style={{ transformStyle: "preserve-3d" }}
            >
                <Link href={`/events/${event.id}`} className="group">
                    <motion.h3
                        className={`text-xl font-bold mb-2 transition-colors duration-300 ${isDark ? "text-white" : "text-gray-800"}`}
                        whileHover={{ color: "#9333ea", x: 2 }}
                        style={{ transform: "translateZ(20px)" }}
                    >
                        {isRtl ? event.titleAr : event.title}
                    </motion.h3>
                </Link>

                <div className="space-y-3 mb-4">
                    <motion.div
                        className={`flex items-center text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                        whileHover={{ x: 3 }}
                        style={{ transform: "translateZ(15px)" }}
                    >
                        <motion.div
                            className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-2"
                            whileHover={{ rotate: 15 }}
                        >
                            <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        </motion.div>
                        <span>{formatDate(event.startDate)}</span>
                    </motion.div>

                    <motion.div
                        className={`flex items-center text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                        whileHover={{ x: 3 }}
                        style={{ transform: "translateZ(15px)" }}
                    >
                        <motion.div
                            className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-2"
                            whileHover={{ rotate: 15 }}
                        >
                            <motion.div
                                animate={isHovered ? { rotate: 360 } : {}}
                                transition={{ duration: 5, ease: "linear", repeat: Infinity }}
                            >
                                <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            </motion.div>
                        </motion.div>
                        <span>{formatTime(event.startDate)} • {getDuration()}h</span>
                    </motion.div>

                    {event.venue && (
                        <motion.div
                            className={`flex items-center text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                            whileHover={{ x: 3 }}
                            style={{ transform: "translateZ(15px)" }}
                        >
                            <motion.div
                                className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-2"
                                whileHover={{ rotate: 15 }}
                            >
                                <motion.div
                                    animate={isHovered ? { y: [0, -2, 0] } : {}}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                </motion.div>
                            </motion.div>
                            <span className="truncate">
                                {isRtl ? event.venue.nameAr : event.venue.name}
                                {event.venue.city && `, ${event.venue.city}`}
                            </span>
                        </motion.div>
                    )}
                </div>

                <motion.p
                    className={`text-sm mb-5 line-clamp-2 h-10 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    style={{ transform: "translateZ(10px)" }}
                >
                    {isRtl ? event.descriptionAr : event.description}
                </motion.p>

                {event.tags && event.tags.length > 0 && (
                    <motion.div
                        className="flex flex-wrap gap-2 mb-5"
                        style={{ transform: "translateZ(10px)" }}
                    >
                        {event.tags.slice(0, 3).map((tag, index) => (
                            <motion.span
                                key={tag.id}
                                className={`text-xs px-2 py-1 rounded-md ${isDark
                                    ? "bg-gray-700/70 text-gray-300 hover:bg-purple-900/40"
                                    : "bg-gray-100 text-gray-700 hover:bg-purple-100"
                                    }`}
                                whileHover={{ scale: 1.1, backgroundColor: isDark ? "rgba(126, 34, 206, 0.3)" : "rgba(233, 213, 255, 1)" }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0, transition: { delay: 0.1 * index } }}
                            >
                                {isRtl ? tag.nameAr : tag.name}
                            </motion.span>
                        ))}
                        {event.tags.length > 3 && (
                            <motion.span
                                className={`text-xs px-2 py-1 rounded-md ${isDark
                                    ? "bg-gray-700 text-gray-300"
                                    : "bg-gray-100 text-gray-700"
                                    }`}
                                whileHover={{ scale: 1.1 }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                            >
                                +{event.tags.length - 3}
                            </motion.span>
                        )}
                    </motion.div>
                )}

                <Link href={`/events/${event.id}`} className="block w-full">
                    <motion.button
                        variants={buttonVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        className="w-full py-3 rounded-lg text-center text-white group relative overflow-hidden"
                        style={{ transform: "translateZ(30px)" }}
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 group-hover:from-purple-700 group-hover:to-indigo-700"></span>

                        {/* Animated pulse effect */}
                        <motion.span
                            className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-white/20 to-purple-500/0"
                            animate={{
                                x: ["-100%", "200%"],
                            }}
                            transition={{
                                repeat: Infinity,
                                repeatDelay: 1,
                                duration: 1.5,
                                ease: "easeInOut"
                            }}
                        />

                        <span className="relative flex items-center justify-center">
                            {t("event.viewDetails")}
                            <motion.svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className={`w-4 h-4 ${isRtl ? 'mr-1' : 'ml-1'} transition-all duration-300`}
                                animate={{
                                    x: isHovered ? (isRtl ? -3 : 3) : 0,
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 10 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d={isRtl ? "M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" : "M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"} />
                            </motion.svg>
                        </span>
                    </motion.button>
                </Link>
            </motion.div>
        </motion.div>
    );
};

export default EventCard;