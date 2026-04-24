import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL =
  import.meta.env.VITE_BASE_URL || "http://localhost:3000";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);
  const [showsLoading, setShowsLoading] = useState(true);
  const [favouriteMovies, setFavouriteMovies] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchIsAdmin = async () => {
    try {
      const { data } = await axios.get(`/api/admin/is-admin`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      setIsAdmin(data.isAdmin);
      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("You do not have permission to access this page.");
      }
    } catch (error) {
      console.error("Error fetching isAdmin status:", error);
      setIsAdmin(false);

      if (
        error.response?.status === 403 &&
        location.pathname.startsWith("/admin")
      ) {
        navigate("/");
        toast.error("You do not have permission to access this page.");
      }
    }
  };

  const fetchShows = async () => {
    setShowsLoading(true);
    try {
      const { data } = await axios.get("/api/show/all");
      if (data.success) {
        setShows(data.shows);
      } else {
        setShows([]);
        toast.error("Failed to fetch shows.");
      }
    } catch (error) {
      setShows([]);
      console.error("Error fetching shows:", error);
    } finally {
      setShowsLoading(false);
    }
  };

  const fetchFavouriteMovies = async () => {
    try {
      const { data } = await axios.get("/api/user/favourites", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setFavouriteMovies(data.movies);
      } else {
        toast.error("Failed to fetch favourite movies.");
      }
    } catch (error) {
      console.error("Error fetching favourite movies:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIsAdmin();
      fetchFavouriteMovies();
    }
  }, [user, location.pathname]);

  useEffect(() => {
    fetchShows();
  }, []);

  return (
    <AppContext.Provider
      value={{
        axios,
        fetchIsAdmin,
        user,
        getToken,
        navigate,
        isAdmin,
        shows,
        showsLoading,
        favouriteMovies,
        fetchFavouriteMovies,
        image_base_url,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
