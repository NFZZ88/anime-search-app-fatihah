import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../utils/hooks";
import { setQuery, setPage, fetchSearchResults } from "../store/searchSlice";
import { useDebounce } from "../utils/debounce";
import { Link } from "react-router-dom";
import "./FaatihahFlipCard.css";

export default function SearchPage() {
  const dispatch = useAppDispatch();
  const { query, page, results, totalPages, loading, error } =
    useAppSelector((s) => s.search);

  const [input, setInput] = useState(query);
  const debounced = useDebounce(input, 300);

  // Store detailed info (episodes/status) for each anime--note on hold fatihah to review
  const [detailsMap, setDetailsMap] = useState<Record<number,
    { episodes: number | null; status: string | null }>>({});

  // Load initial data
  useEffect(() => { dispatch(fetchSearchResults({ query: "", page: 1 }));}, [dispatch]);

  // Handle search input
  useEffect(() => {
    const trimmed = debounced.trim();
    dispatch(setQuery(trimmed));
    dispatch(setPage(1));
    dispatch(fetchSearchResults({ query: trimmed, page: 1 }));
  }, [debounced, dispatch]);

  // Fetch when page changes
  useEffect(() => {dispatch(fetchSearchResults({ query, page }));}, [page, query, dispatch]);

  // Fetch detailed episodes/status safely
  useEffect(() => {
    const missingIds = results
      .filter((anime) => !detailsMap[anime.mal_id])
      .map((anime) => anime.mal_id);

    if (missingIds.length === 0) return;

    const controllers: Record<number, AbortController> = {};
    const fetchDetails = async () => {
      try {
        const promises = missingIds.map(async (id) => {
          const controller = new AbortController();
          controllers[id] = controller;
          const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`, {
            signal: controller.signal,
          });
          const json = await res.json();
          return {
            id,
            episodes: json.data.episodes,
            status: json.data.status,
          };
        });

        {/**there issue to fetch the details hence put I put on hold */}
        const details = await Promise.all(promises);
        setDetailsMap((prev) => {
          const updated = { ...prev };
          details.forEach((d) => {
            updated[d.id] = { episodes: d.episodes, status: d.status };
          });
          return updated;
        });
      } catch (err) {
        if ((err as any).name === "AbortError") return;
        console.error("Failed to fetch details:", err);
      }
    };

    fetchDetails();

    return () => {
      Object.values(controllers).forEach((c) => c.abort());
    };
  }, [results, detailsMap]);

  // Pagination
  function onNext() {
    if (page < totalPages) dispatch(setPage(page + 1));
  }

  function onPrev() {
    if (page > 1) dispatch(setPage(page - 1));
  }

  // Helper: safe image
  function getImage(anime: any) {
    return (
      anime.images?.jpg?.image_url ||
      anime.images?.webp?.image_url ||
      anime.image_url ||
      "https://via.placeholder.com/200x300?text=No+Image"
    );
  }

  return (
    <div className="container">
      <h1>Anime Browser</h1>

      {/* Search bar */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search anime..."
        style={{ width: "50%", padding: 8, marginBottom: 12 }}
      />

      {error && <p className="error-text">{error}</p>}

      {/* Loading skeleton */}
      {loading && (
        <div className="results-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="results-grid">
          {results.map((anime) => {
            const details = detailsMap[anime.mal_id];
            return (
              <div key={anime.mal_id} className="flip-card">
                <Link to={`/detail/${anime.mal_id}`} className="card-link">
                  <div className="flip-card-inner">
                    {/* Front */}
                    <div className="flip-card-front">
                      <img
                        className="card-image"
                        src={getImage(anime)}
                        alt={anime.title}
                      />
                      <h3 className="anime-title">{anime.title}</h3>
                    </div>

                    {/* Back */}
                    <div className="flip-card-back">
                      <p>Title: {anime.title ?? "N/A"}</p>
                      <p>Voted Score: {anime.score ?? "N/A"}</p>
                      <p>Episodes: {details?.episodes ?? "?"}</p>
                      <p>Status: {details?.status ?? "N/A"}</p>
                      <p>Click to view details synopsis</p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* If value empty state */}
      {!loading && results.length === 0 && query.trim() !== "" && (
        <p className="empty-text">No result found...</p>
      )}

      {/* Pagination */}
      <div style={{ marginTop: 12 }}>
        <button onClick={onPrev} disabled={page <= 1}>
          Prev
        </button>
        <span style={{ margin: "0 8px" }}>
          {page}/{totalPages}
        </span>
        <button onClick={onNext} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
