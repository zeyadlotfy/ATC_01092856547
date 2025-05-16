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

      const refreshTokenAdmin = getCookie("refreshTokenAdmin");

      if (refreshTokenAdmin) {
        try {
          const refreshResponse = await axios.post(
            `${BACKEND_URL}/auth/refresh-token`,
            { refreshToken: refreshTokenAdmin }
          );

          if (refreshResponse.status === 200) {
            const { accessToken, refreshToken } = refreshResponse.data.tokens;

            setCookie("accessTokenAdmin", accessToken);
            setCookie("refreshTokenAdmin", refreshToken);

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

export const getLoggedInAdmin = async () => {
  const accessTokenAdmin = getCookie("accessTokenAdmin");
  const refreshTokenAdmin = getCookie("refreshTokenAdmin");

  if (!accessTokenAdmin && !refreshTokenAdmin) {
    return null;
  }

  try {
    const response = await api.get("/auth/profile", {
      headers: {
        Authorization: `Bearer ${accessTokenAdmin}`,
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
    const refreshTokenAdmin = getCookie("refreshTokenAdmin");
    if (refreshTokenAdmin) {
      try {
        await axios.post(`${BACKEND_URL}/auth/logout`, {
          refreshToken: refreshTokenAdmin,
        });
      } catch (error) {
        console.error("Failed to notify server about logout:", error);
      }
    }
  } finally {
    deleteCookie("accessTokenAdmin");
    deleteCookie("refreshTokenAdmin");
    window.location.href = "/admin/login";
  }
};
