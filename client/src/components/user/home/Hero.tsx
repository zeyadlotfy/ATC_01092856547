import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

interface HeroProps {
    isDark: boolean;
    isRtl: boolean;
    t: (key: string) => string;
    locale: string;
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
}

const Hero = ({ isDark, isRtl, t, locale, searchTerm = "", onSearchChange }: HeroProps) => {
    const [search, setSearch] = useState(searchTerm);
    const [animate, setAnimate] = useState(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        if (onSearchChange) {
            onSearchChange(e.target.value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearchChange) {
            onSearchChange(search);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimate(true);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const featuredItems = [
        {
            title: locale === 'ar' ? "مهرجان موسيقى" : "Music Festival",
            date: locale === 'ar' ? "١٥ يونيو" : "Jun 15",
            location: locale === 'ar' ? "الاستاد الكبير" : "Grand Stadium",
            image: "/images/event1.jpg"
        },
        {
            title: locale === 'ar' ? "معرض فني" : "Art Exhibition",
            date: locale === 'ar' ? "٢٣ يوليو" : "Jul 23",
            location: locale === 'ar' ? "المعرض الحديث" : "Modern Gallery",
            image: "/images/event2.jpg"
        },
        {
            title: locale === 'ar' ? "مؤتمر تقني" : "Tech Conference",
            date: locale === 'ar' ? "١٠ أغسطس" : "Aug 10",
            location: locale === 'ar' ? "مركز المؤتمرات" : "Convention Center",
            image: "/images/event3.jpg"
        }
    ];

    type TranslationKeys =
        | "appName"
        | "title1"
        | "title2"
        | "subtitle"
        | "searchPlaceholder"
        | "exploreEvents"
        | "browseCategories"
        | "eventsHosted"
        | "venues"
        | "satisfaction"
        | "trending"
        | "featuredEvent"
        | "summerFestival"
        | "dateRange";

    type Translations = {
        en: Record<TranslationKeys, string>;
        ar: Record<TranslationKeys, string>;
    };

    const translations: Translations = {
        en: {
            appName: "Bookly",
            title1: "Discover & Book",
            title2: "Amazing Events",
            subtitle: "Explore thousands of events around you. From concerts and art exhibits to workshops and conferences.",
            searchPlaceholder: "Search for events, venues or categories...",
            exploreEvents: "Explore Events",
            browseCategories: "Browse Categories",
            eventsHosted: "Events Hosted",
            venues: "Venues",
            satisfaction: "Satisfaction",
            trending: "TRENDING",
            featuredEvent: "FEATURED EVENT",
            summerFestival: "Summer Music Festival",
            dateRange: "Aug 15-17, 2025"
        },
        ar: {
            appName: "بوكلى",
            title1: "اكتشف واحجز",
            title2: "فعاليات مذهلة",
            subtitle: "استكشف آلاف الفعاليات من حولك. من الحفلات الموسيقية والمعارض الفنية إلى ورش العمل والمؤتمرات.",
            searchPlaceholder: "ابحث عن فعاليات، أماكن، أو تصنيفات...",
            exploreEvents: "استكشف الفعاليات",
            browseCategories: "تصفح التصنيفات",
            eventsHosted: "فعاليات مستضافة",
            satisfaction: "نسبة الرضا",
            trending: "رائج",
            featuredEvent: "فعالية مميزة",
            summerFestival: "مهرجان الصيف الموسيقي",
            dateRange: "١٥-١٧ أغسطس، ٢٠٢٥",
            venues: ""
        }
    };

    const getText = (key: string) => {
        try {
            const translated = t(key);
            if (translated === key || !translated) {
                const parts = key.split('.');
                if (parts.length === 2 && parts[0] === 'hero') {
                    const currentLang = locale === 'ar' ? 'ar' : 'en';
                    return translations[currentLang][parts[1] as TranslationKeys] || key;
                }
                return key;
            }
            return translated;
        } catch (e) {
            const parts = key.split('.');
            if (parts.length === 2 && parts[0] === 'hero') {
                const currentLang = locale === 'ar' ? 'ar' : 'en';
                return translations[currentLang][parts[1] as TranslationKeys] || key;
            }
            return key;
        }
    };

    return (
        <section className={`relative overflow-hidden ${isDark
            ? "bg-gradient-to-br from-gray-900 via-gray-900 to-violet-950"
            : "bg-gradient-to-br from-purple-50 via-white to-indigo-50"}`}
        >
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-600 opacity-10 dark:opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-indigo-600 opacity-10 dark:opacity-20 blur-3xl animate-blob animation-delay-4000"></div>
                <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full bg-pink-600 opacity-10 dark:opacity-20 blur-3xl animate-blob"></div>
                <div className="absolute top-1/2 left-2/3 w-40 h-40 rounded-full bg-emerald-500 opacity-5 dark:opacity-10 blur-2xl animate-pulse"></div>
                <div className="absolute bottom-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500 opacity-5 dark:opacity-10 blur-2xl animate-pulse animation-delay-4000"></div>
            </div>

            <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative z-10">
                <div className="flex flex-col md:flex-row items-center">
                    <div className={`w-full md:w-1/2 md:pr-8 ${isRtl ? "md:order-2 md:pl-8 md:pr-0" : "md:order-1"}`}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="inline-flex items-center mb-6 py-1 px-3 rounded-full bg-purple-100 dark:bg-purple-900/30"
                            >
                                <span className="text-lg font-semibold text-purple-700 dark:text-purple-300 mr-2">
                                    {isRtl ? 'بوكلى' : 'Bookly'}
                                </span>
                                <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    BETA
                                </span>
                            </motion.div>
                            <motion.h1
                                className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight ${isRtl ? "text-right" : "text-left"}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <span className="inline bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                                    {getText("hero.title1")}
                                </span>
                                <br />
                                <span className={isDark ? "text-white" : "text-gray-800"}>
                                    {getText("hero.title2")}
                                </span>
                            </motion.h1>

                            <motion.p
                                className={`text-lg sm:text-xl mb-8 max-w-xl ${isDark ? "text-gray-300" : "text-gray-700"} ${isRtl ? "text-right" : "text-left"}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            >
                                {getText("hero.subtitle")}
                            </motion.p>

                            <motion.form
                                className="mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.7 }}
                                onSubmit={handleSubmit}
                            >
                                <div className="relative flex items-center">
                                    <Search
                                        className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500`}
                                    />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={handleSearchChange}
                                        placeholder={getText("hero.searchPlaceholder")}
                                        className={`w-full py-4 ${isRtl ? 'pr-12 pl-5' : 'pl-12 pr-5'} rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition shadow-md hover:shadow-lg text-base backdrop-blur-sm ${isRtl ? "text-right" : "text-left"}`}
                                    />
                                    <button
                                        type="submit"
                                        className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white p-1.5 transition-colors duration-300`}
                                    >
                                        {isRtl ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
                                    </button>
                                </div>
                            </motion.form>

                            <motion.div
                                className={`flex flex-wrap gap-4 ${isRtl ? "justify-end" : "justify-start"}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.9 }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.5)" }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link
                                        href="/events"
                                        className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <Calendar className={`${isRtl ? 'ml-3' : 'mr-3'} h-5 w-5`} />
                                        {getText("hero.exploreEvents")}
                                    </Link>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link
                                        href="/events"
                                        className={`inline-flex items-center px-8 py-4 rounded-xl font-medium text-lg shadow-md hover:shadow-lg transition-all duration-300 ${isDark
                                            ? "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                                            : "bg-white text-gray-800 hover:bg-gray-50 border border-gray-200"
                                            }`}
                                    >
                                        <MapPin className={`${isRtl ? 'ml-3' : 'mr-3'} h-5 w-5`} />
                                        {getText("hero.browseCategories")}
                                    </Link>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                className={`mt-10 flex items-center gap-6 ${isRtl ? "justify-end" : "justify-start"}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 1.1 }}
                            >
                                <div className={`text-center ${isRtl ? "order-3" : ""}`}>
                                    <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>5000+</p>
                                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{getText("hero.eventsHosted")}</p>
                                </div>
                                <div className={`h-10 w-px ${isDark ? "bg-gray-700" : "bg-gray-200"} ${isRtl ? "order-2" : ""}`}></div>
                                <div className={`text-center ${isRtl ? "order-1" : ""}`}>
                                    <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>250+</p>
                                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{getText("hero.venues")}</p>
                                </div>
                                <div className={`h-10 w-px ${isDark ? "bg-gray-700" : "bg-gray-200"} ${isRtl ? "order-0" : ""}`}></div>
                                <div className={`text-center ${isRtl ? "order-0" : ""}`}>
                                    <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>98%</p>
                                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{getText("hero.satisfaction")}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    <div className={`w-full md:w-1/2 mt-12 md:mt-0 ${isRtl ? "md:order-1" : "md:order-2"}`}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="relative h-[500px]"
                        >
                            {/* Floating cards */}
                            {featuredItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{
                                        opacity: 0,
                                        y: 50 + index * 20,
                                        x: index % 2 === 0 ? -20 : 20,
                                        rotate: index % 2 === 0 ? -5 : 5
                                    }}
                                    animate={{
                                        opacity: animate ? 1 : 0,
                                        y: animate ? (index - 1) * 30 : 50 + index * 20,
                                        x: animate ? (index % 2 === 0 ? 10 : -10) : (index % 2 === 0 ? -20 : 20),
                                        rotate: animate ? (index % 2 === 0 ? -3 : 3) : (index % 2 === 0 ? -5 : 5)
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        delay: 0.5 + index * 0.2,
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 20
                                    }}
                                    className={`absolute left-0 right-0 mx-auto w-[90%] ${index === 0 ? 'top-20' :
                                        index === 1 ? 'top-[120px]' :
                                            'top-[220px]'
                                        } z-${30 - index * 10}`}
                                >
                                    <div className={`p-1 rounded-2xl ${index === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                        index === 1 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                            'bg-gradient-to-r from-emerald-500 to-teal-500'
                                        }`}>
                                        <div className={`p-5 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-16 h-16 rounded-xl overflow-hidden ${isRtl ? 'ml-4 order-1' : 'mr-4 order-0'} relative`}>
                                                    {/* <Image
                                                        src={`https://www.eventsindustryforum.co.uk/images/articles/about_the_eif.jpg`}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover"
                                                    /> */}
                                                </div>
                                                <div className={isRtl ? "text-right" : ""}>
                                                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                        {item.title}
                                                    </h3>
                                                    <div className={`flex items-center mt-1 ${isRtl ? "justify-end" : ""}`}>
                                                        <Calendar className={`w-4 h-4 text-purple-500 ${isRtl ? 'ml-1' : 'mr-1'}`} />
                                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            {item.date}
                                                        </span>
                                                        <span className={`mx-2 w-1 h-1 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></span>
                                                        <MapPin className={`w-4 h-4 text-purple-500 ${isRtl ? 'ml-1' : 'mr-1'}`} />
                                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            {item.location}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Main image */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="absolute bottom-0 inset-x-0 mx-auto w-[80%] max-w-md z-40"
                            >
                                <div className={`relative p-2 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-2xl ${isDark ? 'opacity-90' : 'opacity-100'}`}>
                                    <div className="relative w-full h-[300px] rounded-2xl overflow-hidden">
                                        <Image
                                            src="https://eclipse.global/wp-content/uploads/2018/11/So-Sri-Lanka-CS-2.jpg"
                                            alt="Featured event"
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                                        {/* Text overlay */}
                                        <div className={`absolute bottom-0 left-0 right-0 p-5 ${isRtl ? "text-right" : "text-left"}`}>
                                            <p className="text-sm font-bold text-purple-300 mb-1">{getText("hero.featuredEvent")}</p>
                                            <h3 className="text-xl font-bold text-white mb-1">{getText("hero.summerFestival")}</h3>
                                            <div className={`flex items-center ${isRtl ? "justify-end" : ""}`}>
                                                <Calendar className={`w-4 h-4 text-gray-300 ${isRtl ? "ml-2" : "mr-2"}`} />
                                                <span className="text-sm text-gray-300">{getText("hero.dateRange")}</span>
                                            </div>
                                        </div>

                                        {/* Badge */}
                                        <div className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} bg-purple-100 text-purple-800 text-xs font-bold rounded-full px-3 py-1 flex items-center gap-1`}>
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            {getText("hero.trending")}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    className={`w-full h-auto ${isDark ? "text-gray-900 fill-gray-800" : "text-white fill-gray-50"}`}
                    viewBox="0 0 1440 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 80C840 80 960 70 1080 70C1200 70 1320 80 1380 85L1440 90V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0V120Z"
                        fill="currentColor"
                    />
                </svg>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: scale(1) translate(0px, 0px); }
                    33% { transform: scale(1.1) translate(20px, -10px); }
                    66% { transform: scale(0.9) translate(-20px, 10px); }
                    100% { transform: scale(1) translate(0px, 0px); }
                }
                .animate-blob {
                    animation: blob 20s infinite alternate;
                }
                .animation-delay-2000 {
                    animation-delay: -2s;
                }
                .animation-delay-4000 {
                    animation-delay: -4s;
                }
                .bg-grid-pattern {
                    background-image: 
                        linear-gradient(to right, rgba(128, 90, 213, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(128, 90, 213, 0.1) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </section>
    );
};

export default Hero;