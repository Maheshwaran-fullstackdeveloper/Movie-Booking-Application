import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Loading() {
  const { nextUrl } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname.startsWith("/loading")) {
      if (nextUrl) {
        setTimeout(() => {
          navigate("/" + nextUrl);
        }, 8000);
      } else {
        navigate("/");
      }
    }
  }, [nextUrl, navigate]);

  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="animate-spin rounded-full h-14 w-14 border-t-primary border-2"></div>
    </div>
  );
}

export default Loading;
