import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function useRouteLoader() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevPathRef.current;

    // Get the section (admin/customer/driver) from the path
    const getCurrentSection = (path) => {
      const match = path.match(/^\/(admin|customer|driver)/);
      return match ? match[1] : 'public';
    };

    const currentSection = getCurrentSection(currentPath);
    const prevSection = getCurrentSection(prevPath);

    // Specific heavy routes that should always show loader
    const heavyRoutes = [
      '/admin/tracking',      // Live tracking with maps
      '/customer/shipments'   // Shipment tracking with maps
    ];

    const isHeavyRoute = heavyRoutes.some(route => currentPath.includes(route));

    // Show loader when:
    // 1. Navigating between different sections OR
    // 2. Navigating to a heavy route (maps, large data)
    const shouldShowLoader = currentSection !== prevSection || isHeavyRoute;

    if (shouldShowLoader) {
      setLoading(true);

      // Hide loader after animation completes
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1700);

      // Update previous path
      prevPathRef.current = currentPath;

      return () => clearTimeout(timer);
    } else {
      // Update previous path without showing loader
      prevPathRef.current = currentPath;
    }
  }, [location.pathname]);

  return loading;
}
