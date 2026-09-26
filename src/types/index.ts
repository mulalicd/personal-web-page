/**
 * Shared TypeScript types (Commander E-1: all shared types live here).
 *
 * This file must stay framework-free (no React, no Vite-only syntax):
 * the Supabase Edge Function `chat-assistant` imports the profile content
 * that uses these types, and it runs on Deno.
 */

/** A single labelled figure, e.g. { value: "€815K", label: "Revenue" }. */
export interface Metric {
  value: string;
  label: string;
}

/** Visual accent used by metric bars and award cards. */
export type AccentColor = "primary" | "accent" | "purple" | "amber";

/** Headline metric shown as an animated 3D bar. */
export interface HeadlineMetric extends Metric {
  /** Bar height, 0–100. Purely visual; the number shown is `value`. */
  barPercentage: number;
  color: AccentColor;
}

/** Career era used by the hero "Executive Presence" orbits (Director decision 2026-09-26). */
export type CareerEraId = "finance" | "industry" | "education";

export interface CareerEra {
  id: CareerEraId;
  name: string;
  period: string;
  color: AccentColor;
}

/** Identifier of an icon rendered by the UI layer (kept as a string so this module stays React-free). */
export type ExperienceIcon = "building" | "trending" | "briefcase" | "landmark" | "heart";

export interface ExperienceEntry {
  title: string;
  organization: string;
  location: string;
  period: string;
  icon: ExperienceIcon;
  era: CareerEraId;
  achievements: string[];
  metrics: Metric[];
  technologies?: string[];
  current?: boolean;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  period: string;
}

/** Trophy rarity tier (Director decision 2026-09-26, Sprint 03). */
export type TrophyRarity = "legendary" | "epic" | "rare";

/** An award or headline achievement shown in the Trophy Room. */
export interface Trophy {
  rarity: TrophyRarity;
  /** Emoji on the trophy face. */
  icon: string;
  /** Big figure or short name on the face, e.g. "673%". */
  headline: string;
  title: string;
  period: string;
  /** Back of the card: where and how it was achieved. */
  source: string;
  detail: string;
}

/** Something Davor created and runs (shown as a founder badge). */
export interface Venture {
  name: string;
  role: string;
  tagline: string;
  description: string;
  url: string;
}

export interface GalleryEntry {
  /** Key of the image asset, resolved to a URL by the UI layer. */
  imageKey: "awardCeremony" | "awardSpeech";
  alt: string;
  caption: string;
  detail: string;
}

export interface CredentialEntry {
  name: string;
  detail: string;
}

export interface LanguageEntry {
  language: string;
  level: string;
  /** Highlighted in the UI (native / professional-grade levels). */
  strong: boolean;
}

export type VolunteeringIcon = "anchor" | "heart" | "users";

export interface VolunteeringEntry {
  title: string;
  organization: string;
  period: string;
  icon: VolunteeringIcon;
  description: string;
  achievements: string[];
  active: boolean;
}

export interface BookEntry {
  title: string;
  subtitle: string;
  description: string;
  topics: string[];
  coverKey: "aiBusinessExcellence" | "aiTeacherCompanion" | "promptEngineering" | "aiSolvedBusinessProblems";
}

export interface AisbpProduct {
  title: string;
  price: string;
  description: string;
  buttonText: string;
  link: string;
  featured?: boolean;
}

export interface Testimonial {
  text: string;
  author: string;
  organization: string;
  role: string;
}

/** Everything the site knows about Davor — single source of truth (M-7). */
export interface Profile {
  name: string;
  headline: string;
  roleLine: string;
  availability: string;
  intro: string;
  location: string;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  linkedinUrl: string;
  websiteUrl: string;
  industries: string[];
  heroMetrics: HeadlineMetric[];
  careerEras: CareerEra[];
  aboutParagraphs: string[];
  aboutMetrics: HeadlineMetric[];
  competencies: string[];
  education: EducationEntry[];
  trophies: Trophy[];
  ventures: Venture[];
  gallery: GalleryEntry[];
  certifications: CredentialEntry[];
  standards: CredentialEntry[];
  languages: LanguageEntry[];
  skills: string[];
  experience: ExperienceEntry[];
  volunteering: VolunteeringEntry[];
  interests: CredentialEntry[];
  books: BookEntry[];
  aisbp: {
    summary: string;
    stats: Metric[];
    products: AisbpProduct[];
    websiteUrl: string;
    book: BookEntry;
  };
  portfolioSummary: string;
  testimonials: Testimonial[];
}
