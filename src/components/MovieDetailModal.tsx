import React, { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck, Star, Trash2, X } from 'lucide-react';
import { User } from 'firebase/auth';
import {
  Movie,
  UserRatingEntry,
  WatchlistEntry,
  WatchlistStatus,
} from '../types/cinema';
import { MoviePosterArt } from './MoviePosterArt';

interface MovieDetailModalProps {
  movie: Movie;
  user: User | null;
  watchlistEntry?: WatchlistEntry;
  movieRatings: UserRatingEntry[];
  userRating?: UserRatingEntry;
  onClose: () => void;
  onRequireSignIn: () => void;
  onSaveWatchlist: (
    movie: Movie,
    status: WatchlistStatus,
    notes: string
  ) => Promise<void>;
  onRemoveWatchlist: (movie: Movie) => Promise<void>;
  onSubmitRating: (
    movie: Movie,
    score: number,
    review: string
  ) => Promise<void>;
  onDeleteRating: (movie: Movie) => Promise<void>;
}

const WATCHLIST_STATUS_OPTIONS: { value: WatchlistStatus; label: string }[] = [
  { value: 'plan_to_watch', label: 'Plan to Watch' },
  { value: 'watching', label: 'Watching' },
  { value: 'watched', label: 'Watched' },
];

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  user,
  watchlistEntry,
  movieRatings,
  userRating,
  onClose,
  onRequireSignIn,
  onSaveWatchlist,
  onRemoveWatchlist,
  onSubmitRating,
  onDeleteRating,
}) => {
  const [status, setStatus] = useState<WatchlistStatus>(
    watchlistEntry?.status ?? 'plan_to_watch'
  );
  const [notes, setNotes] = useState<string>(watchlistEntry?.notes ?? '');
  const [watchlistSaving, setWatchlistSaving] = useState(false);

  const [hoverStar, setHoverStar] = useState<number>(0);
  const [score, setScore] = useState<number>(userRating?.score ?? 0);
  const [review, setReview] = useState<string>(userRating?.review ?? '');
  const [ratingSaving, setRatingSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setStatus(watchlistEntry?.status ?? 'plan_to_watch');
    setNotes(watchlistEntry?.notes ?? '');
  }, [watchlistEntry, movie.id]);

  useEffect(() => {
    setScore(userRating?.score ?? 0);
    setReview(userRating?.review ?? '');
  }, [userRating, movie.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const communityAverage =
    movieRatings.length > 0
      ? movieRatings.reduce((acc, r) => acc + r.score, 0) / movieRatings.length
      : null;

  const handleSaveWatchlistClick = async () => {
    if (!user) {
      onRequireSignIn();
      return;
    }
    setErrorMsg(null);
    setFeedbackMsg(null);
    setWatchlistSaving(true);
    try {
      await onSaveWatchlist(movie, status, notes);
      setFeedbackMsg(
        watchlistEntry ? 'Watchlist entry updated.' : 'Added to your watchlist.'
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to save watchlist update.'
      );
    } finally {
      setWatchlistSaving(false);
    }
  };

  const handleRemoveWatchlistClick = async () => {
    if (!user) return;
    setErrorMsg(null);
    setFeedbackMsg(null);
    setWatchlistSaving(true);
    try {
      await onRemoveWatchlist(movie);
      setNotes('');
      setStatus('plan_to_watch');
      setFeedbackMsg('Removed from your watchlist.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to remove watchlist item.'
      );
    } finally {
      setWatchlistSaving(false);
    }
  };

  const handleSubmitRatingForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireSignIn();
      return;
    }
    if (score < 1 || score > 5) {
      setErrorMsg('Please select a star rating between 1 and 5.');
      return;
    }
    setErrorMsg(null);
    setFeedbackMsg(null);
    setRatingSaving(true);
    try {
      await onSubmitRating(movie, score, review);
      setFeedbackMsg(userRating ? 'Your rating was updated.' : 'Rating published.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to submit rating.'
      );
    } finally {
      setRatingSaving(false);
    }
  };

  const handleDeleteRatingClick = async () => {
    if (!user || !userRating) return;
    setErrorMsg(null);
    setFeedbackMsg(null);
    setRatingSaving(true);
    try {
      await onDeleteRating(movie);
      setScore(0);
      setReview('');
      setFeedbackMsg('Your rating was removed.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to delete rating.'
      );
    } finally {
      setRatingSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-movie-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#0D0D12] border border-white/15 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close film details"
          className="sticky top-4 float-right mr-4 mt-4 z-20 inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#17171E] border border-white/15 text-zinc-200 hover:text-[#F2B705] hover:border-[#F2B705]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
          {/* Left Column: Poster + Watchlist Controls */}
          <div className="lg:col-span-4 space-y-5">
            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden border border-white/10">
              <MoviePosterArt movie={movie} />
            </div>

            {/* Watchlist Panel */}
            <div className="p-4 rounded-xl bg-[#13131A] border border-white/10 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">
                  Personal Watchlist
                </span>
                {watchlistEntry && (
                  <span className="text-xs font-medium text-[#F2B705]">Saved</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Watchlist status">
                {WATCHLIST_STATUS_OPTIONS.map((opt) => {
                  const active = status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      className={`px-2 py-2 rounded-lg text-[11px] font-medium border transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-[#F2B705]/15 border-[#F2B705] text-[#F2B705]'
                          : 'bg-[#191922] border-white/10 text-zinc-300 hover:text-zinc-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <label className="block space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Personal Viewing Notes</span>
                  <span className="font-mono tabular-nums">{notes.length}/500</span>
                </div>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Who to watch with, favorite scenes, reminders..."
                  className="w-full px-3 py-2 bg-[#0B0B10] border border-white/10 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#F2B705] resize-none"
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={watchlistSaving}
                  onClick={handleSaveWatchlistClick}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#F2B705] text-[#070709] text-xs font-semibold hover:bg-[#f7c52b] disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {watchlistEntry ? (
                    <>
                      <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
                      <span>{watchlistSaving ? 'Saving...' : 'Update Watchlist'}</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" aria-hidden="true" />
                      <span>
                        {user
                          ? watchlistSaving
                            ? 'Saving...'
                            : 'Add to Watchlist'
                          : 'Sign In to Save'}
                      </span>
                    </>
                  )}
                </button>

                {watchlistEntry && (
                  <button
                    type="button"
                    disabled={watchlistSaving}
                    onClick={handleRemoveWatchlistClick}
                    aria-label="Remove from watchlist"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#191922] border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-400/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Metadata + Ratings Studio */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-3 pr-8">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="text-[#F2B705] font-medium">{movie.industry}</span>
                <span aria-hidden="true">·</span>
                <span>{movie.language}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{movie.year}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{movie.runtimeMinutes} min</span>
              </div>

              <h2
                id="modal-movie-title"
                className="font-display text-3xl sm:text-4xl font-semibold text-zinc-50 leading-tight text-balance"
              >
                {movie.title}
              </h2>

              <p className="text-sm text-zinc-300 leading-relaxed">{movie.synopsis}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/10 text-xs">
                <div>
                  <span className="block text-zinc-500 mb-1">Director</span>
                  <span className="text-zinc-100 font-medium">{movie.director}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 mb-1">Principal Cast</span>
                  <span className="text-zinc-200">{movie.cast.join(', ')}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 mb-1">Genres</span>
                  <span className="text-zinc-200">{movie.genres.join(' · ')}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 pt-1">{movie.acclaimNote}</p>
            </div>

            {/* Dual Rating Strip */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#13131A] border border-white/10">
              <div>
                <span className="block text-xs text-zinc-400 mb-1">Curated Critic Score</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-semibold text-zinc-50 tabular-nums">
                    {movie.editorialScore.toFixed(1)}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">/ 5.0</span>
                </div>
              </div>

              <div className="border-l border-white/10 pl-4">
                <span className="block text-xs text-zinc-400 mb-1">Community Rating</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-semibold text-[#F2B705] tabular-nums">
                    {communityAverage !== null ? communityAverage.toFixed(1) : '—'}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono tabular-nums">
                    {movieRatings.length > 0
                      ? `/ 5.0 (${movieRatings.length} ${
                          movieRatings.length === 1 ? 'rating' : 'ratings'
                        })`
                      : 'No member ratings yet'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Feedback Alerts */}
            {feedbackMsg && (
              <div
                role="status"
                className="px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300"
              >
                {feedbackMsg}
              </div>
            )}
            {errorMsg && (
              <div
                role="alert"
                className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300"
              >
                {errorMsg}
              </div>
            )}

            {/* Submit / Edit Your Rating */}
            <form
              onSubmit={handleSubmitRatingForm}
              className="p-5 rounded-xl bg-[#13131A] border border-white/10 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    {userRating ? 'Update Your Rating' : 'Rate This Film'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {user
                      ? `Publishing as ${user.displayName || 'Cinema Member'}`
                      : 'Sign in with Google to publish your star rating and review.'}
                  </p>
                </div>

                {/* 1-5 Star Selector */}
                <div
                  className="flex items-center gap-1"
                  role="radiogroup"
                  aria-label="Star rating"
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverStar || score) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={score === star}
                        aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
                        onMouseEnter={() => setHoverStar(star)}
                        onMouseLeave={() => setHoverStar(0)}
                        onClick={() => setScore(star)}
                        className="p-1.5 rounded-md hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            active
                              ? 'text-[#F2B705] fill-[#F2B705]'
                              : 'text-zinc-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Short Review (optional)</span>
                  <span className="font-mono tabular-nums">{review.length}/600</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={600}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share what stood out — direction, score, performances, or pacing..."
                  className="w-full px-3.5 py-2.5 bg-[#0B0B10] border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#F2B705] resize-none"
                />
              </label>

              <div className="flex items-center justify-between gap-3">
                {userRating ? (
                  <button
                    type="button"
                    disabled={ratingSaving}
                    onClick={handleDeleteRatingClick}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Delete Rating</span>
                  </button>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  disabled={ratingSaving}
                  className="px-5 py-2.5 rounded-lg bg-[#F2B705] text-[#070709] text-xs font-semibold hover:bg-[#f7c52b] disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {user
                    ? ratingSaving
                      ? 'Saving...'
                      : userRating
                        ? 'Save Changes'
                        : 'Publish Rating'
                    : 'Sign In to Rate'}
                </button>
              </div>
            </form>

            {/* Community Reviews Feed */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-200">
                Member Reviews ({movieRatings.length})
              </h3>
              {movieRatings.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 border-t border-white/10">
                  No member reviews yet. Be the first to rate {movie.title}.
                </p>
              ) : (
                <div className="divide-y divide-white/10 border-t border-white/10">
                  {movieRatings.map((item) => (
                    <div key={item.id} className="py-3.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium text-zinc-100">
                            {item.authorName}
                          </span>
                          {item.updatedAt && (
                            <>
                              <span className="text-zinc-600" aria-hidden="true">
                                ·
                              </span>
                              <span className="text-zinc-500 font-mono tabular-nums">
                                {item.updatedAt.toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-mono text-[#F2B705] tabular-nums">
                          <Star className="w-3.5 h-3.5 fill-[#F2B705]" aria-hidden="true" />
                          <span>{item.score}.0</span>
                        </div>
                      </div>
                      {item.review && (
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {item.review}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
