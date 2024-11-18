import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocaleStorageState } from "./useLocaleStorageState";
import useKey from "./useKey";

const KEY = "4347e75f";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedid] = useState(null);
  const [watched, setWatched] = useLocaleStorageState([], "watched");
  const { movies, loader, error } = useMovies(query);

  function handleSelectedMovie(id) {
    setSelectedid((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedid(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function handledeleteWatched(id) {
    const alert = window.confirm("Confirm to delete?");
    if (alert) {
      setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
    }
  }

  // const query = "avengers";

  return (
    <>
      <Navbar>
        <Navlogo />
        <NavSearch query={query} setQuery={setQuery} />
        <NavSearchResult movies={movies} />
      </Navbar>

      <Main>
        <Box>
          {query === "" && !loader && <SearchForMovies />}{" "}
          {loader && <Loader />}
          {!loader && !error && query !== "" && movies.length > 0 && (
            <MovieList
              movies={movies}
              handleSelectedMovie={handleSelectedMovie}
            />
          )}{" "}
          {error && <Error message={error} />}{" "}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedid={selectedId}
              handleCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchSummary watched={watched} />
              <WatchMovieList
                watched={watched}
                handledeleteWatched={handledeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

// -------------
function Loader() {
  return <p className="loader">Loading...</p>;
}

function Error({ message }) {
  return <p className="error">{message}</p>;
}

function SearchForMovies() {
  return (
    <p
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "100px",
        fontSize: "24px",
      }}
    >
      Search for Movies
    </p>
  );
}

// ----------------------------------------------------------------
function Navbar({ children }) {
  return (
    <>
      <nav className="nav-bar">{children}</nav>
    </>
  );
}

function Navlogo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>Movies Now</h1>
    </div>
  );
}

function NavSearch({ query, setQuery }) {
  const inputElement = useRef(null);

  useKey("enter", function () {
    inputElement.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputElement}
    />
  );
}

function NavSearchResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

// -------------------------------------------------------------------------
function Main({ children }) {
  return (
    <main>
      <main className="main">{children}</main>
    </main>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, handleSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectedMovie={handleSelectedMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, handleSelectedMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => handleSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedid, handleCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [loader, setLoader] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);
  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedid);
  const watchedUserrating = watched.find(
    (movie) => movie.imdbID === selectedid
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Director: director,
    Genre: genre,
    Actors: actors,
  } = movie;

  const [averageRating, setAveragerating] = useState(0);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedid,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    // handleCloseMovie();
    setAveragerating(Number(imdbRating));
    setAveragerating((averageRating) => (averageRating + userRating) / 2);
  }

  // ----------------------------
  useKey("escape", handleCloseMovie);
  // ----------------------------

  useEffect(
    function () {
      async function getMovieDetails() {
        setLoader(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedid}`
        );
        const data = await res.json();
        setMovie(data);
        setLoader(false);
        // console.log(data);
      }
      getMovieDetails();
    },
    [selectedid]
  );

  // -------------------------------
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return () => (document.title = "Movies Now");
    },

    [title]
  );
  // -------------------------------

  return (
    <div className="details">
      {loader ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={handleCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDB Rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      Add to list
                    </button>
                  )}{" "}
                </>
              ) : (
                <p>
                  You have already rated this movie with <span>⭐️</span>{" "}
                  {watchedUserrating}
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>
              Starring{" "}
              <em>
                <b>{actors}</b>
              </em>
            </p>
            <p>
              Directed By{" "}
              <em>
                <b>{director}</b>
              </em>
            </p>
            <p>{averageRating}</p>
          </section>
        </>
      )}
    </div>
  );
}

// --------------------------------------------------------
/*
function WatchBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchSummary watched={watched} />
          <WatchMovieList watched={watched} />
        </>
      )}
    </div>
  );
}
  */

function WatchSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchMovieList({ watched, handledeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchMovie
          key={movie.imdbID}
          movie={movie}
          handledeleteWatched={handledeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchMovie({ movie, handledeleteWatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => handledeleteWatched(movie.imdbID)}
        >
          ❌
        </button>
      </div>
    </li>
  );
}
