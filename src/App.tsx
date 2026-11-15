import React, { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { X } from 'lucide-react';
import { auth, googleProvider } from './firebase';
import { CURATED_MOVIES } from './data/movies';
import {
  addOrUpdateWatchlistItem,
  deleteUserRating,
  removeWatchlistItem,
  submitUserRating,
  subscribeToAllRatings,
  subscribeToWatchlist,
} from './services/cinemaFirestore';
import {
  CinemaIndustry,
  Movie,
  SearchFilterState,
  UserRatingEntry,
  WatchlistEntry,
  WatchlistStatus,
} from './types/cinema';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FilterPanel } from './components/FilterPanel';
import { ActiveView, Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { MovieCard } from './components/MovieCard';
import { MovieDetailModal } from './components/MovieDetailModal';
import { WatchlistView } from './components/WatchlistView';
import featuredFestivalPosterImg from './assets/images/featured_festival_poster_1794753997774.jpg';

const DEFAULT_FILTERS: SearchFilterState = {
  query: '',
  industry: 'All',
  language: 'All',
  genres: [],
  era: 'all',
  minRating: 0,
  runtime: 'all',
  sortBy: 'top_rated',
};

function ReelHouseApp() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const [activeView, setActiveView] = useState<ActiveView>('catalog');
  const [filters, setFilters] = useState<SearchFilterState>(DEFAULT_FILTERS);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const [watchlistMap, setWatchlistMap] = useState<Record<string, WatchlistEntry>>({});
  const [allRatings, setAllRatings] = useState<UserRatingEntry[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const catalogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (!firebaseUser) {
        setWatchlistMap({});
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAllRatings((ratings) => {
      setAllRatings(ratings);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;
    const unsubscribe = subscribeToWatchlist(user.uid, (items) => {
      setWatchlistMap(items);
    });
    return () => unsubscribe();
  }, [authReady, user]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const ratingsByMovie = useMemo(() => {
    const map: Record<string, UserRatingEntry[]> = {};
    for (const r of allRatings) {
      if (!map[r.movieId]) {
        map[r.movieId] = [];
      }
      map[r.movieId].push(r);
    }
    return map;
  }, [allRatings]);

  const getMovieStats = (movie: Movie) => {
    const list = ratingsByMovie[movie.id] ?? [];
    const avg =
      list.length > 0
        ? list.reduce((acc, item) => acc + item.score, 0) / list.length
        : null;
    const blended = avg !== null ? (movie.editorialScore + avg) / 2 : movie.editorialScore;
    const userRating = user ? list.find((r) => r.userId === user.uid) : undefined;
    return { list, avg, blended, userRating };
  };

  const filteredMovies = useMemo(() => {
    const q = filters.query.trim().toLowerCase();

    const list = CURATED_MOVIES.filter((movie) => {
      if (filters.industry !== 'All' && movie.industry !== filters.industry) {
        return false;
      }
      if (filters.language !== 'All' && movie.language !== filters.language) {
        return false;
      }
      if (
        filters.genres.length > 0 &&
        !filters.genres.every((g) => movie.genres.includes(g))
      ) {
        return false;
      }
      if (filters.era === '2020s' && movie.year < 2020) return false;
      if (filters.era === '2010s' && (movie.year < 2010 || movie.year > 2019)) {
        return false;
      }
      if (filters.era === '2000s' && (movie.year < 2000 || movie.year > 2009)) {
        return false;
      }
      if (filters.era === 'classic' && movie.year >= 2000) return false;

      if (filters.runtime === 'short' && movie.runtimeMinutes >= 130) return false;
      if (
        filters.runtime === 'medium' &&
        (movie.runtimeMinutes < 130 || movie.runtimeMinutes > 165)
      ) {
        return false;
      }
      if (filters.runtime === 'epic' && movie.runtimeMinutes <= 165) return false;

      const { blended } = getMovieStats(movie);
      if (filters.minRating > 0 && blended < filters.minRating) return false;

      if (q) {
        const haystack = [
          movie.title,
          movie.director,
          movie.language,
          movie.industry,
          movie.synopsis,
          ...movie.cast,
          ...movie.genres,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      const statsA = getMovieStats(a);
      const statsB = getMovieStats(b);

      switch (filters.sortBy) {
        case 'newest':
          return b.year - a.year;
        case 'community': {
          const avgA = statsA.avg ?? a.editorialScore;
          const avgB = statsB.avg ?? b.editorialScore;
          if (avgB !== avgA) return avgB - avgA;
          return statsB.list.length - statsA.list.length;
        }
        case 'shortest':
          return a.runtimeMinutes - b.runtimeMinutes;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'top_rated':
        default:
          return statsB.blended - statsA.blended;
      }
    });
  }, [filters, ratingsByMovie, user]);

  const handleSignIn = async () => {
    setAuthBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setAuthPromptOpen(false);
      setNotice('Signed in. Your watchlist and ratings now sync automatically.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Sign-in could not be completed.';
      setNotice(message);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setAuthBusy(true);
    try {
      await signOut(auth);
      setNotice('Signed out of ReelHouse.');
    } finally {
      setAuthBusy(false);
    }
  };

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectCatalog = (industry: 'All' | CinemaIndustry) => {
    setActiveView('catalog');
    setFilters((prev) => ({ ...prev, industry }));
    if (industry !== 'All') {
      window.setTimeout(scrollToCatalog, 50);
    }
  };

  const handleToggleWatchlistQuick = async (movie: Movie) => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    const existing = watchlistMap[movie.id];
    if (existing) {
      await removeWatchlistItem(user.uid, movie.id);
      setNotice(`Removed "${movie.title}" from your watchlist.`);
    } else {
      await addOrUpdateWatchlistItem({
        userId: user.uid,
        movieId: movie.id,
        status: 'plan_to_watch',
        notes: '',
        exists: false,
      });
      setNotice(`Added "${movie.title}" to your watchlist.`);
    }
  };

  const handleSaveWatchlistDetail = async (
    movie: Movie,
    status: WatchlistStatus,
    notes: string
  ) => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    await addOrUpdateWatchlistItem({
      userId: user.uid,
      movieId: movie.id,
      status,
      notes,
      exists: Boolean(watchlistMap[movie.id]),
    });
  };

  const handleRemoveWatchlist = async (movie: Movie) => {
    if (!user) return;
    await removeWatchlistItem(user.uid, movie.id);
  };

  const handleSubmitRating = async (
    movie: Movie,
    score: number,
    review: string
  ) => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    const existing = (ratingsByMovie[movie.id] ?? []).find(
      (r) => r.userId === user.uid
    );
    await submitUserRating({
      userId: user.uid,
      authorName: user.displayName || 'Cinema Member',
      movieId: movie.id,
      score,
      review,
      exists: Boolean(existing),
    });
  };

  const handleDeleteRating = async (movie: Movie) => {
    if (!user) return;
    await deleteUserRating(user.uid, movie.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Header
        activeView={activeView}
        activeIndustry={filters.industry}
        user={user}
        authLoading={!authReady || authBusy}
        onSelectCatalog={handleSelectCatalog}
        onSelectWatchlist={() => setActiveView('watchlist')}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 mx-auto w-full max-w-[1360px] px-4 sm:px-8 pb-16">
        {activeView === 'catalog' ? (
          <div className="space-y-10">
            <HeroSection
              totalFilms={CURATED_MOVIES.length}
              watchlistCount={Object.keys(watchlistMap).length}
              ratingsCount={allRatings.length}
              onExploreCatalog={scrollToCatalog}
              onOpenWatchlist={() => setActiveView('watchlist')}
              onSelectIndustry={(industry) => {
                setFilters((prev) => ({ ...prev, industry }));
                window.setTimeout(scrollToCatalog, 50);
              }}
            />

            <div ref={catalogRef} className="scroll-mt-20 space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-[#F2B705]">
                    Film Directory
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-50">
                    {filters.industry === 'All'
                      ? 'Complete Curated Catalog'
                      : `${filters.industry} Selections`}
                  </h2>
                </div>
                <p className="text-xs text-zinc-400">
                  Select any poster to read synopses, publish ratings, or manage watchlist status.
                </p>
              </div>

              <FilterPanel
                filters={filters}
                resultCount={filteredMovies.length}
                totalCount={CURATED_MOVIES.length}
                onChange={setFilters}
                onReset={() => setFilters(DEFAULT_FILTERS)}
              />

              {filteredMovies.length === 0 ? (
                <div className="py-16 px-6 text-center border border-white/10 rounded-2xl bg-[#0D0D12] space-y-4">
                  <h3 className="font-display text-2xl font-semibold text-zinc-100">
                    No matching films found
                  </h3>
                  <p className="text-sm text-zinc-400 max-w-md mx-auto">
                    Try clearing one of your genre, language, or runtime filters to broaden your search across the archive.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="px-5 py-2.5 rounded-xl bg-[#F2B705] text-[#070709] text-xs font-semibold hover:bg-[#f7c52b] transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {filteredMovies.map((movie) => {
                    const { list, avg, userRating } = getMovieStats(movie);
                    return (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        watchlistEntry={watchlistMap[movie.id]}
                        communityAverage={avg}
                        communityCount={list.length}
                        userScore={userRating?.score ?? null}
                        onOpenDetail={setSelectedMovie}
                        onToggleWatchlist={handleToggleWatchlistQuick}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <WatchlistView
            user={user}
            movies={CURATED_MOVIES}
            watchlistMap={watchlistMap}
            ratingsByMovie={ratingsByMovie}
            onSignIn={handleSignIn}
            onBrowseCatalog={() => setActiveView('catalog')}
            onOpenDetail={setSelectedMovie}
            onUpdateStatus={handleSaveWatchlistDetail}
            onRemoveWatchlist={handleRemoveWatchlist}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-white/10 bg-[#070709]">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <span>ReelHouse — World Cinema Archive</span>
          <span>Hollywood · Bollywood · South Cinema</span>
        </div>
      </footer>

      {/* Film Detail Modal */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          user={user}
          watchlistEntry={watchlistMap[selectedMovie.id]}
          movieRatings={ratingsByMovie[selectedMovie.id] ?? []}
          userRating={
            user
              ? (ratingsByMovie[selectedMovie.id] ?? []).find(
                  (r) => r.userId === user.uid
                )
              : undefined
          }
          onClose={() => setSelectedMovie(null)}
          onRequireSignIn={() => setAuthPromptOpen(true)}
          onSaveWatchlist={handleSaveWatchlistDetail}
          onRemoveWatchlist={handleRemoveWatchlist}
          onSubmitRating={handleSubmitRating}
          onDeleteRating={handleDeleteRating}
        />
      )}

      {/* Intentional Auth Prompt Modal (only shown when guest tries to save/rate) */}
      {authPromptOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-prompt-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setAuthPromptOpen(false)}
        >
          <div
            className="relative w-full max-w-xl grid grid-cols-1 sm:grid-cols-12 overflow-hidden rounded-2xl bg-[#0E0E13] border border-white/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hidden sm:block sm:col-span-5 relative bg-[#14141A]">
              <img
                src={featuredFestivalPosterImg}
                alt="Filmmaker silhouette looking across twilight coast"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            </div>

            <div className="sm:col-span-7 p-6 sm:p-7 flex flex-col justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#F2B705]">
                    Member Access
                  </span>
                  <button
                    type="button"
                    onClick={() => setAuthPromptOpen(false)}
                    aria-label="Close sign in dialog"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h2
                  id="auth-prompt-title"
                  className="font-display text-2xl font-semibold text-zinc-50 text-balance"
                >
                  Save watchlists & rate films
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Sign in with your Google account to persist your personal watchlist, viewing progress, and star ratings across sessions.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={authBusy}
                  onClick={handleSignIn}
                  className="w-full h-11 rounded-xl bg-[#F2B705] text-[#070709] text-sm font-semibold hover:bg-[#f7c52b] disabled:opacity-50 transition-colors"
                >
                  {authBusy ? 'Signing in...' : 'Continue with Google'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthPromptOpen(false)}
                  className="w-full h-10 rounded-xl bg-transparent border border-white/10 text-xs font-medium text-zinc-300 hover:border-white/25 transition-colors"
                >
                  Keep Browsing as Guest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Action Feedback Toast */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-xl bg-[#15151C] border border-[#F2B705]/40 text-xs text-zinc-100 shadow-xl"
        >
          {notice}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ReelHouseApp />
    </ErrorBoundary>
  );
}
