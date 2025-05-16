import { BACKEND_URL } from "@/lib/constants/backend";
import axios from "axios";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

const api = axios.create({
  baseURL: BACKEND_URL,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getCookie("refreshToken");

      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${BACKEND_URL}/auth/refresh-token`,
            { refreshToken: refreshToken }
          );

          if (refreshResponse.status === 200) {
            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.tokens;

            setCookie("accessToken", accessToken);
            setCookie("refreshToken", newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            return axios(originalRequest);
          }
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          await logout();
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const getLoggedInUser = async () => {
  const accessToken = getCookie("accessToken");
  const refreshToken = getCookie("refreshToken");

  if (!accessToken && !refreshToken) {
    return null;
  }

  try {
    const response = await api.get("/auth/profile", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      await logout();
    }

    return null;
  }
};

export const logout = async () => {
  try {
    const refreshToken = getCookie("refreshToken");
    if (refreshToken) {
      try {
        await axios.post(`${BACKEND_URL}/auth/logout`, {
          refreshToken: refreshToken,
        });
      } catch (error) {
        console.error("Failed to notify server about logout:", error);
      }
    }
  } finally {
    deleteCookie("accessToken");
    deleteCookie("refreshToken");
    window.location.href = "/login";
  }
};