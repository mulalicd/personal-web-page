/**
 * campaign.ts — the "Career Campaign" chapter structure (Sprint 03).
 *
 * Single source of truth for the page sections: the navigation, the footer,
 * the progress HUD and the chapter banners all read this list (M-7).
 * Chapter titles: Director decision 2026-09-26.
 */

export interface Chapter {
  /** `id` of the <section> element. */
  sectionId: string;
  /** Short label in the navigation. */
  navLabel: string;
  /** 0 = prologue, then 1…8. */
  number: number;
  title: string;
}

export const CHAPTERS: readonly Chapter[] = [
  { sectionId: "home", navLabel: "Home", number: 0, title: "Prologue" },
  { sectionId: "about", navLabel: "About", number: 1, title: "The Leader" },
  { sectionId: "experience", navLabel: "Experience", number: 2, title: "The Campaign" },
  { sectionId: "books", navLabel: "Books", number: 3, title: "The Author" },
  { sectionId: "aisbp", navLabel: "AISBP", number: 4, title: "The System" },
  { sectionId: "portfolio", navLabel: "Portfolio", number: 5, title: "The Lab" },
  { sectionId: "volunteering", navLabel: "Volunteering", number: 6, title: "Giving Back" },
  { sectionId: "references", navLabel: "References", number: 7, title: "The Allies" },
  { sectionId: "contact", navLabel: "Contact", number: 8, title: "The Next Mission" },
];

/** "Chapter 3 · The Author", or "Prologue". */
export function chapterLabel(chapter: Chapter): string {
  return chapter.number === 0 ? chapter.title : `Chapter ${chapter.number} · ${chapter.title}`;
}
