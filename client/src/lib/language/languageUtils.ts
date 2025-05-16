/* eslint-disable @typescript-eslint/no-unused-vars */

import { setCookie, getCookie } from "cookies-next";

export const locales = ["en", "ar"];

export type Dictionary = {
  [key: string]: string | Dictionary;
};

export const getCurrentLocale = (): string => {
  if (typeof window === "undefined") {
    return "en";
  }

  const locale = getCookie("locale")?.toString() || "en";

  if (!locales.includes(locale)) {
    return "en";
  }

  return locale;
};

export const changeLocale = (newLocale: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  if (!locales.includes(newLocale)) {
    newLocale = "en";
  }

  setCookie("locale", newLocale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
};

export const getTranslation = (
  dictionary: Dictionary,
  key: string,
  params?: Record<string, string>
): string => {
  if (!dictionary) {
    console.error("Translation dictionary is undefined");
    return key;
  }

  const keys = key.split(".");
  let value: any = dictionary;

  for (const k of keys) {
    if (value === undefined || value === null) {
      return key;
    }
    value = value[k];
  }

  if (typeof value !== "string") {
    return key;
  }

  if (params) {
    return Object.entries(params).reduce((text, [param, replacement]) => {
      return text.replace(new RegExp(`{{${param}}}`, "g"), replacement);
    }, value);
  }

  return value;
};
