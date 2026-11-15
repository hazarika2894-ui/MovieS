export type CinemaIndustry = 'Hollywood' | 'Bollywood' | 'South Cinema';

export type CinemaLanguage =
  | 'English'
  | 'Hindi'
  | 'Tamil'
  | 'Telugu'
  | 'Malayalam'
  | 'Kannada';

export type WatchlistStatus = 'plan_to_watch' | 'watching' | 'watched';

export type PosterMotif =
  | 'eclipse'
  | 'monolith'
  | 'archway'
  | 'waves'
  | 'horizon'
  | 'spiral'
  | 'prism'
  | 'peaks'
  | 'lantern'
  | 'orbit'
  | 'columns'
  | 'compass';

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  industry: CinemaIndustry;
  language: CinemaLanguage;
  year: number;
  runtimeMinutes: number;
  director: string;
  cast: string[];
  genres: string[];
  editorialScore: number; // Out of 5.0
  synopsis: string;
  acclaimNote: string;
  palette: {
    bg: string;
    accent: string;
    secondary: string;
  };
  motif: PosterMotif;
}

export interface WatchlistEntry {
  userId: string;
  movieId: string;
  status: WatchlistStatus;
  notes: string;
  addedAt: Date | null;
  updatedAt: Date | null;
}

export interface UserRatingEntry {
  id: string;
  userId: string;
  authorName: string;
  movieId: string;
  score: number;
  review: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type EraFilter = 'all' | '2020s' | '2010s' | '2000s' | 'classic';
export type RuntimeFilter = 'all' | 'short' | 'medium' | 'epic';
export type SortOption = 'top_rated' | 'newest' | 'community' | 'shortest' | 'title';

export interface SearchFilterState {
  query: string;
  industry: 'All' | CinemaIndustry;
  language: 'All' | CinemaLanguage;
  genres: string[];
  era: EraFilter;
  minRating: number;
  runtime: RuntimeFilter;
  sortBy: SortOption;
}
