import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { useTheme } from "next-themes";
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    ChevronRight,
    ChevronLeft,
    ExternalLink,
    Heart
} from "lucide-react";

const Footer = () => {
    const { t, locale } = useTranslations();
    const { theme } = useTheme();
    const isRtl = locale === "ar";
    const isDark = theme === "dark";
    const currentYear = new Date().getFullYear();

    const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

    const socialLinks = [
        { name: "Facebook", icon: Facebook, href: "#" },
        { name: "Twitter", icon: Twitter, href: "#" },
        { name: "Instagram", icon: Instagram, href: "#" },
        { name: "LinkedIn", icon: Linkedin, href: "#" },
    ];

    const quickLinks = [
        { name: t("footer.links.home"), href: "/" },
        { name: t("footer.links.events"), href: "/events" },
        { name: t("footer.links.venues"), href: "/venues" },
        { name: t("footer.links.contact"), href: "/contact" },
    ];

    const accountLinks = [
        { name: t("footer.links.login"), href: "/login" },
        { name: t("footer.links.register"), href: "/register" },
        { name: t("footer.links.profile"), href: "/profile" },
        { name: t("footer.links.bookings"), href: "/my-bookings" },
    ];

    const bottomLinks = [
        { name: t("footer.links.terms"), href: "/terms" },
        { name: t("footer.links.privacy"), href: "/privacy" },
        { name: t("footer.links.faq"), href: "/faq" },
    ];

    return (
        <footer
            className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300"
            dir={isRtl ? "rtl" : "ltr"}
        >
            <div className="pt-16 pb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-pink-900/10 opacity-30" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Logo & About */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-1 transform transition duration-500 hover:translate-y-1">
                            <div className="flex items-center mb-5">
                                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
                                    {isRtl ? 'بوكلى' : 'Bookly'}
                                </span>
                            </div>

                            <p className="mb-4 text-gray-400 text-sm leading-relaxed">
                                {t("footer.about")}
                            </p>

                            <div className="flex space-x-4 rtl:space-x-reverse mt-6">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        aria-label={social.name}
                                        className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 hover:bg-purple-600 transition-all duration-300 transform hover:scale-110 hover:rotate-3"
                                        onMouseEnter={() => setHoveredIcon(social.name)}
                                        onMouseLeave={() => setHoveredIcon(null)}
                                    >
                                        <social.icon
                                            size={18}
                                            className={`transition-all duration-300 ${hoveredIcon === social.name ? "text-white" : ""
                                                }`}
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="transform transition duration-500 hover:translate-y-1">
                            <h3 className="text-lg font-semibold mb-4 text-white relative inline-block">
                                {t("footer.quickLinks")}
                                <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-purple-400 to-pink-300"></span>
                            </h3>
                            <ul className="space-y-3">
                                {quickLinks.map((link) => (
                                    <li key={link.href} className="transform transition duration-300 hover:translate-x-1 rtl:hover:-translate-x-1">
                                        <Link
                                            href={link.href}
                                            className="inline-flex items-center hover:text-purple-400 transition-colors group"
                                        >
                                            {isRtl ? (
                                                <ChevronLeft className="h-4 w-4 ml-1 group-hover:animate-pulse" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 mr-1 group-hover:animate-pulse" />
                                            )}
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="transform transition duration-500 hover:translate-y-1">
                            <h3 className="text-lg font-semibold mb-4 text-white relative inline-block">
                                {t("footer.userAccount")}
                                <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-purple-400 to-pink-300"></span>
                            </h3>
                            <ul className="space-y-3">
                                {accountLinks.map((link) => (
                                    <li key={link.href} className="transform transition duration-300 hover:translate-x-1 rtl:hover:-translate-x-1">
                                        <Link
                                            href={link.href}
                                            className="inline-flex items-center hover:text-purple-400 transition-colors group"
                                        >
                                            {isRtl ? (
                                                <ChevronLeft className="h-4 w-4 ml-1 group-hover:animate-pulse" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 mr-1 group-hover:animate-pulse" />
                                            )}
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="transform transition duration-500 hover:translate-y-1">
                            <h3 className="text-lg font-semibold mb-4 text-white relative inline-block">
                                {t("footer.contact")}
                                <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-purple-400 to-pink-300"></span>
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start group">
                                    <Mail className={`h-5 w-5 mt-0.5 ${isRtl ? 'ml-3' : 'mr-3'} text-purple-500 transition-transform duration-300 group-hover:scale-110`} />
                                    <span className="group-hover:text-purple-400 transition-colors">info@bookly.com</span>
                                </li>

                                <li className="flex items-start group">
                                    <MapPin className={`h-5 w-5 mt-0.5 ${isRtl ? 'ml-3' : 'mr-3'} text-purple-500 transition-transform duration-300 group-hover:scale-110`} />
                                    <span className="group-hover:text-purple-400 transition-colors">{t("footer.address")}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800 py-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 to-pink-900/5 opacity-30" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div className="text-center md:text-left text-sm text-gray-400 mb-4 md:mb-0">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                                <span>© {currentYear} Bookly. {t("footer.copyright")}</span>
                                <span className="hidden sm:inline mx-2">•</span>
                                <span className="flex items-center justify-center sm:justify-start mt-2 sm:mt-0">
                                    Made with <Heart className="h-4 w-4 mx-1 text-red-500 animate-pulse" /> by{" "}
                                    <a
                                        href="https://zeyadlotfy.vercel.app"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-1 text-purple-400 hover:text-purple-300 inline-flex items-center"
                                    >
                                        Zeyad Lotfy
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-center md:justify-end space-x-6 rtl:space-x-reverse">
                            {bottomLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-gray-400 hover:text-white transition-colors hover:underline"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;