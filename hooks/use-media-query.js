// use-media-query.js
import { useState, useEffect } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create listener function
    const listener = () => {
      setMatches(media.matches);
    };

    // Add listener
    media.addEventListener("change", listener);

    // Remove listener on cleanup
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
