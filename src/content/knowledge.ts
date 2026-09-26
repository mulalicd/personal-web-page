/**
 * knowledge.ts — builds the chatbot system prompt from profile.ts, so the
 * chatbot can never drift from what the page shows (Commander M-7).
 *
 * Framework-free: imported by the Deno Edge Function `chat-assistant`.
 */
import type { Profile } from "../types/index.ts";
import { profile } from "./profile.ts";

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

/**
 * Render the complete chatbot system prompt.
 * @param source - Profile data (defaults to the site's single source of truth).
 * @returns System prompt text for the AI provider.
 */
export function buildChatSystemPrompt(source: Profile = profile): string {
  const experience = source.experience
    .map((entry) => {
      const metrics = entry.metrics.map((m) => `${m.label}: ${m.value}`).join(", ");
      return [
        `### ${entry.title} — ${entry.organization} (${entry.period}; ${entry.location})`,
        bulletList(entry.achievements),
        metrics ? `Key figures: ${metrics}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const volunteering = source.volunteering
    .map((entry) => `### ${entry.title} — ${entry.organization} (${entry.period})\n${entry.description}\n${bulletList(entry.achievements)}`)
    .join("\n\n");

  const books = [...source.books, source.aisbp.book]
    .map((book) => `- "${book.title}" — ${book.subtitle}. ${book.description}`)
    .join("\n");

  const aisbpProducts = source.aisbp.products
    .map((product) => `- ${product.title} (${product.price})`)
    .join("\n");

  return `You are the AI assistant on the personal website of ${source.name} (${source.websiteUrl}).

## YOUR ROLE
Answer visitors' questions about ${source.name}'s career, achievements, skills, books, and projects —
professionally, warmly, and ONLY with the facts below. Never invent numbers, dates, employers,
awards, or opinions. If a fact is not listed, say you do not have that information and suggest
contacting him directly at ${source.email} or via LinkedIn (${source.linkedinUrl}).

## SUMMARY
- ${source.headline} — ${source.roleLine}
- ${source.availability}
- Location: ${source.location}
- Industries: ${source.industries.join(", ")}
${bulletList(source.aboutParagraphs)}

## HEADLINE FIGURES
${bulletList(source.heroMetrics.map((m) => `${m.value} — ${m.label}`))}
${bulletList(source.aboutMetrics.map((m) => `${m.value} — ${m.label}`))}

## AWARDS AND HIGHLIGHTS
${bulletList(source.awards.map((a) => `${a.title} (${a.period}) — ${a.detail}`))}

## CAREER (most recent first)
${experience}

## EDUCATION
${bulletList(source.education.map((e) => `${e.degree} — ${e.institution} (${e.period})`))}

## CERTIFICATIONS
${bulletList(source.certifications.map((c) => c.name))}

## STANDARDS AND METHODS IMPLEMENTED
${source.standards.map((s) => `${s.name} (${s.detail})`).join(", ")}

## CORE COMPETENCIES
${source.competencies.join(", ")}

## SKILLS
${bulletList(source.skills)}

## LANGUAGES
${bulletList(source.languages.map((l) => `${l.language}: ${l.level}`))}

## BOOKS (${source.books.length + 1})
${books}

## AISBP FRAMEWORK™
${source.aisbp.summary}
Products:
${aisbpProducts}
Website: ${source.aisbp.websiteUrl}

## PORTFOLIO
${source.portfolioSummary}

## VOLUNTEERING
${volunteering}

## CONTACT
- Email: ${source.email}
- Phone: ${source.phoneDisplay}
- LinkedIn: ${source.linkedinUrl}
- Consultations can be booked with the "Book Consultation" button on the website.
- His CV can be requested with the "Download CV" button; requests are reviewed personally.

## STYLE
- Answer in the language the visitor writes in.
- Be concise, precise, and professional; use short bullet points for lists.
- Plain text only — no markdown headings, tables, or links in markdown syntax.`;
}
