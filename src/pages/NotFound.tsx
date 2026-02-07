import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MoveLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center px-4">
      <div className="space-y-6 max-w-md w-full">
        {/* Large 404 Text */}
        <h1 className="text-9xl font-extrabold text-gray-900 tracking-tighter">
          404
        </h1>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Page not found
          </h2>
          <p className="text-lg text-gray-600">
            Sorry, we couldn't find the page you're looking for. It might have been removed, renamed, or doesn't exist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild variant="default" size="lg" className="w-full sm:w-auto gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2">
            <Link to=".." relative="path">
              <MoveLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer Text */}
      <p className="mt-12 text-sm text-gray-500">
        Error Code: 404 | Path: {location.pathname}
      </p>
    </div>
  );
};

export default NotFound;
