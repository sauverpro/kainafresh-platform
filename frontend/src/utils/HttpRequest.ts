import { toast } from "sonner";
import axios from "axios";

interface NotificationItem {
  type: "success" | "info" | "warning" | "error";
  message: string;
}

const axiosInstance = axios.create();
let notificationQueue: NotificationItem[] = [];

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    if (status === 401) {
      try {
        notificationQueue.push({ type: "error", message: data?.error });
        setTimeout(() => {
          showNotifications();
        }, 4000);
        await new Promise((resolve) => setTimeout(resolve, 8000));
        localStorage.clear();
        window.location.href = "/login";
      } catch (navError) {
        console.error("Navigation to login failed:", navError);
      }
    } else if (status === 500) {
      notificationQueue.push({ type: "error", message: data?.error });
      setTimeout(() => {
        showNotifications();
      }, 5000);
    } else if (status === 400) {
      notificationQueue.push({ type: "error", message: data?.error });
      setTimeout(() => {
        showNotifications();
      }, 5000);
    }

    return Promise.reject(error);
  }
);

function showNotifications() {
  if (notificationQueue?.length >= 1) {
    const uniqueErrorMessages = Array.from(
      new Set(notificationQueue.map((item) => item.message))
    );
    const firstErrorMessage = uniqueErrorMessages;
    toast.error( firstErrorMessage );
    notificationQueue = [];
  }
}

class HttpRequest {
  static async get(url: string, token?: string) {
    try {
      const res = await axiosInstance({
        method: "GET",
        url,
        headers: {
          authToken: `${token}`,
        },
      });
      return res.data;
    } catch (err: any) {
      return err;
    }
  }

  static async post(url: string, data: any, token?: string) {
    try {
      const res = await axiosInstance({
        method: "POST",
        url,
        headers: {
          authToken: `${token}`,
        },
        data,
      });

      return res.data;
    } catch (err: any) {
      console.log(err);
      return err;
    }
  }

  static async delete(url: string, token: string, data?: any) {
    try {
      const res = await axiosInstance({
        method: "DELETE",
        url,
        headers: {
          authToken: `${token}`,
        },
        data,
      });

      return res.data;
    } catch (err: any) {
      console.log(err.response);
      return err;
    }
  }

  static async update(url: string, data: any, token: string) {
    try {
      const res = await axiosInstance({
        method: "PATCH",
        url,
        headers: {
          authToken: `${token}`,
        },
        data,
      });

      return res.data;
    } catch (err: any) {
      return err;
    }
  }

  static async upload(url: string, data: any, token: string) {
    try {
      const res = await axiosInstance({
        method: "POST",
        url,
        data,
        headers: {
          "content-type": "multipart/form-data",
          authToken: `${token}`,
        },
      });

      return res.data;
    } catch (err: any) {
      return err;
    }
  }
}

export default HttpRequest;
