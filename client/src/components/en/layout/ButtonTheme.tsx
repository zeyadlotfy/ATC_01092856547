"use client"

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react'

const ButtonTheme = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100/20 transition-all duration-300 hover:scale-110 group hover:cursor-pointer"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="h-5 w-5 text-white transition-all duration-500" />
            ) : (
                <Sun className="h-5 w-5 text-amber-300 transition-all duration-500 group-hover:animate-spin" />
            )}
        </button>
    )
}

export default ButtonTheme