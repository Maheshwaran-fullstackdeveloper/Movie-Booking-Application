import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import SeatLayout from "./pages/SeatLayout";
import MyBookings from "./pages/MyBookings";
import Favourite from "./pages/Favourite";
import Footer from "./components/Footer";
import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import AddShows from "./pages/admin/AddShows";
import ListBookings from "./pages/admin/ListBookings";
import ListShows from "./pages/admin/ListShows";
import Loading from "./components/Loading";
import { useAppContext } from "./context/AppContext";
import { SignIn } from "@clerk/clerk-react";

function App() {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");
  const { user, isAdmin } = useAppContext();
  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/loading/:nextUrl" element={<Loading />} />
        <Route path="/favorite" element={<Favourite />} />
        <Route
          path="/admin/*"
          element={
            user && isAdmin ? (
              <Layout />
            ) : user ? (
              <div className="min-h-screen flex justify-center items-center">
                <p>Redirecting...</p>
              </div>
            ) : (
              <div className="min-h-screen flex justify-center items-center">
                <SignIn fallbackRedirectUrl={"/admin"} />
              </div>
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="add-shows" element={<AddShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
          <Route path="list-shows" element={<ListShows />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
