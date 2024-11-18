import { useState, useEffect } from "react";

const KEY = "4347e75f";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(false);
  useEffect(
    function () {
      //   callBack?.();
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setLoader(true);
          setError(false);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok) {
            throw new Error("Something went wrong while fetching movies");
          }

          const data = await res.json();
          if (data.Response === "False") {
            throw new Error("No Movie Found");
          }
          setMovies(data.Search);
        } catch (err) {
          console.error(err);
          if (err.name !== "AbortError") {
            setError(err.message);
          }
          setMovies([]);
        } finally {
          setLoader(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError(false);
        return;
      }

      fetchMovies();

      return function () {
        controller.abort();
      };
    },

    [query]
  );
  return { movies, loader, error };
}
