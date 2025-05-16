"use client";

import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";

import en from "@/translations/en";
import ar from "@/translations/ar";

export type Dictionary = {
  [key: string]: string | Dictionary;
};

export const getTranslation = (
  dictionary: Dictionary,
  key: string,
  params?: Record<string, string>
): string => {
  const keys = key.split(".");
  let value: any = dictionary;

  for (const k of keys) {
    if (value === undefined || value === null) return key;
    value = value[k];
  }

  if (typeof value !== "string") return key;

  if (params) {
    return Object.entries(params).reduce((text, [param, replacement]) => {
      return text.replace(new RegExp(`{{${param}}}`, "g"), replacement);
    }, value);
  }

  return value;
};

const dictionaries: { [key: string]: Dictionary } = {
  en,
  ar,
};

export function useTranslations() {
  const [locale, setLocale] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentLocale = getCookie("locale")?.toString() || "en";
    setLocale(currentLocale === "ar" ? "ar" : "en");
    setIsLoaded(true);
    console.log("useTranslations hook - Current locale:", currentLocale);
  }, []);

  const dictionary = dictionaries[locale] || dictionaries.en;

  const t = (key: string, params?: Record<string, string>): string => {
    if (!isLoaded) {
      return "";
    }
    return getTranslation(dictionary, key, params);
  };

  return { t, locale, isLoaded };
}