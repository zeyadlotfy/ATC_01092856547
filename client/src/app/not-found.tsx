"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { XCircle, Home, RefreshCcw, ChevronRight } from 'lucide-react';
import Navbar from '@/components/user/layout/nav/NavBar';

export default function NotFound() {
    const { t, locale } = useTranslations();
    const { theme } = useTheme();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [count, setCount] = useState(4);
    const [showExplosion, setShowExplosion] = useState(false);
    const [portalActive, setPortalActive] = useState(false);
    const [glitchActive, setGlitchActive] = useState(false);

    const isRtl = locale === 'ar';
    const isDark = theme === 'dark';

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);

        const glitchInterval = setInterval(() => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 200);
        }, 3000);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearInterval(glitchInterval);
        };
    }, []);

    const triggerExplosion = () => {
        setShowExplosion(true);
        setTimeout(() => setShowExplosion(false), 1000);

        if (count === 0) {
            setPortalActive(true);
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            setCount(count - 1);
        }
    };

    return (<>     <Navbar />

        <div
            className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex flex-col items-center justify-center"
            dir={isRtl ? "rtl" : "ltr"}
        >
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="h-full w-full grid grid-cols-12 gap-4">
                        {Array(12).fill(0).map((_, i) => (
                            <motion.div
                                key={`v-${i}`}
                                className="h-full w-[1px] bg-purple-300"
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ duration: 1.5, delay: i * 0.1 }}
                            />
                        ))}
                    </div>
                    <div className="h-full w-full grid grid-rows-12 gap-4">
                        {Array(12).fill(0).map((_, i) => (
                            <motion.div
                                key={`h-${i}`}
                                className="h-[1px] w-full bg-purple-300"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 1.5, delay: i * 0.1 }}
                            />
                        ))}
                    </div>
                </div>

                {Array(15).fill(0).map((_, i) => (
                    <motion.div
                        key={`shape-${i}`}
                        className="absolute rounded-full opacity-20"
                        style={{
                            background: `rgba(${Math.floor(Math.random() * 100) + 155}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 200) + 55}, 0.3)`,
                            width: `${Math.random() * 100 + 50}px`,
                            height: `${Math.random() * 100 + 50}px`,
                            filter: 'blur(8px)',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            x: [0, Math.random() * 100 - 50, 0],
                            y: [0, Math.random() * 100 - 50, 0],
                            scale: [1, Math.random() * 0.5 + 1, 1],
                            rotate: [0, Math.random() * 360, 0],
                        }}
                        transition={{
                            duration: Math.random() * 20 + 10,
                            repeat: Infinity,
                            repeatType: 'reverse',
                        }}
                    />
                ))}
            </div>

            <motion.div
                className="pointer-events-none fixed w-64 h-64 rounded-full bg-purple-500/30 filter blur-xl"
                style={{
                    left: mousePosition.x - 128,
                    top: mousePosition.y - 128,
                    mixBlendMode: "screen",
                }}
                animate={{
                    left: mousePosition.x - 128,
                    top: mousePosition.y - 128,
                }}
                transition={{
                    type: "spring",
                    damping: 15,
                    stiffness: 150,
                    mass: 0.8,
                }}
            />

            <div className={`relative z-10 text-center ${glitchActive ? 'glitch-effect' : ''}`}>
                <motion.h1
                    className="text-[12rem] font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-500 to-indigo-400"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.8,
                        type: "spring",
                        stiffness: 100
                    }}
                >
                    404
                </motion.h1>

                <motion.div
                    className="relative mb-8 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {t('notFound.title')}
                    </h2>
                    <p className="text-purple-200 max-w-md mx-auto">
                        {t('notFound.description')}
                    </p>

                    <motion.div
                        className="w-32 h-1 bg-gradient-to-r from-purple-400 to-indigo-500 mx-auto mt-4"
                        initial={{ width: 0 }}
                        animate={{ width: 128 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    />
                </motion.div>

                <div className="flex flex-wrap justify-center gap-4 mt-8">
                    <Link href="/">
                        <motion.button
                            className="group px-6 py-3 bg-white text-purple-800 rounded-lg font-bold flex items-center space-x-2 rtl:space-x-reverse overflow-hidden relative"
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 0 30px rgba(168, 85, 247, 0.7)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="absolute inset-0 w-0 bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300 ease-out group-hover:w-full z-0"></span>
                            <Home className="relative z-10 group-hover:text-white transition-colors duration-200" size={18} />
                            <span className="relative z-10 group-hover:text-white transition-colors duration-200">
                                {t('notFound.backHome')}
                            </span>
                        </motion.button>
                    </Link>

                    <motion.button
                        className="group px-6 py-3 bg-purple-600 text-white border border-purple-400 rounded-lg font-bold flex items-center space-x-2 rtl:space-x-reverse"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={triggerExplosion}
                    >
                        <RefreshCcw className="animate-spin-slow" size={18} />
                        <span>
                            {count === 0
                                ? t('notFound.portalOpening')
                                : t('notFound.tryAgain', { count: String(count) })}
                        </span>
                        <motion.span
                            animate={{
                                x: [0, 5, 0],
                                opacity: [1, 0.6, 1]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop"
                            }}
                            className="inline-block ml-1"
                        >
                            <ChevronRight size={18} />
                        </motion.span>
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {showExplosion && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="text-[20rem] font-extrabold text-purple-500 flex items-center justify-center"
                            initial={{ scale: 1, rotate: 0 }}
                            animate={{
                                scale: [1, 1.2, 0],
                                rotate: [0, 20, -20, 0],
                                filter: ["blur(0px)", "blur(10px)"]
                            }}
                            transition={{ duration: 0.8 }}
                        >
                            404
                        </motion.div>

                        <div className="absolute inset-0 overflow-hidden">
                            {Array(30).fill(0).map((_, i) => (
                                <motion.div
                                    key={`particle-${i}`}
                                    className="absolute w-2 h-2 rounded-full bg-purple-400"
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                    }}
                                    initial={{ x: 0, y: 0 }}
                                    animate={{
                                        x: (Math.random() - 0.5) * window.innerWidth,
                                        y: (Math.random() - 0.5) * window.innerHeight,
                                        opacity: [1, 0],
                                        scale: [1, Math.random() * 3]
                                    }}
                                    transition={{ duration: Math.random() * 0.5 + 0.5 }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {portalActive && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
                        <motion.div
                            className="w-0 h-0 rounded-full bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500"
                            animate={{
                                width: ["0vh", "200vh"],
                                height: ["0vh", "200vh"],
                            }}
                            transition={{ duration: 1.5 }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
        .glitch-effect {
          animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
          transform-origin: center;
        }

        @keyframes glitch {
          0% {
            transform: translate(0);
            text-shadow: 0 0 0 transparent;
          }
          20% {
            transform: translate(-5px, 5px);
            text-shadow: -3px 0 rgba(255, 0, 255, 0.7);
          }
          40% {
            transform: translate(-5px, -5px);
            text-shadow: 3px 0 rgba(0, 255, 255, 0.7);
          }
          60% {
            transform: translate(5px, 5px);
            text-shadow: -3px 0 rgba(255, 0, 255, 0.7);
          }
          80% {
            transform: translate(5px, -5px);
            text-shadow: 3px 0 rgba(0, 255, 255, 0.7);
          }
          100% {
            transform: translate(0);
            text-shadow: 0 0 0 transparent;
          }
        }

        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    </>
    );
}