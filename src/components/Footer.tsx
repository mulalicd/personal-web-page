import { Linkedin, Download } from "lucide-react";
import { CVRequestDialog } from "@/components/CVRequestDialog";
import { DMLogo } from "@/components/DMLogo";
import { forwardRef } from "react";
import { profile } from "@/content/profile";
import { CHAPTERS } from "@/content/campaign";

// Forward ref button for DialogTrigger compatibility
const CVButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  (props, ref) => (
    <button
      ref={ref}
      type="button"
      {...props}
      className="flex items-center gap-2 px-4 py-2 bg-background/10 dark:bg-secondary hover:bg-background/20 dark:hover:bg-secondary/80 rounded-full transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground dark:focus-visible:ring-offset-card"
    >
      <Download className="w-4 h-4" />
      Download CV
    </button>
  )
);
CVButton.displayName = "CVButton";

const footerLinks = CHAPTERS.filter((chapter) => chapter.number > 0).map((chapter) => ({
  label: chapter.navLabel,
  href: `#${chapter.sectionId}`,
}));

export function Footer() {
  return (
    <footer className="py-12 lg:py-16 bg-foreground text-background dark:bg-card dark:text-card-foreground dark:border-t dark:border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col items-center mb-12">
          {/* Logo */}
          <div className="mb-4">
            <DMLogo size={56} />
          </div>
          <p className="text-xl font-semibold mb-1">{profile.name}</p>
          <p className="text-background/70 dark:text-muted-foreground text-sm">{profile.headline}</p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-background/70 dark:text-muted-foreground hover:text-background dark:hover:text-foreground transition-colors text-sm rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground dark:focus-visible:ring-offset-card"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Connect with Davor Mulalić on LinkedIn"
            className="flex items-center gap-2 px-4 py-2 bg-background/10 dark:bg-secondary hover:bg-background/20 dark:hover:bg-secondary/80 rounded-full transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground dark:focus-visible:ring-offset-card"
          >
            <Linkedin className="w-4 h-4" />
            Connect
          </a>
          <CVRequestDialog>
            <CVButton />
          </CVRequestDialog>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-background/10 dark:border-border pt-8">
          {/* The year can differ between build time and the visit: allowed during hydration. */}
          <p className="text-background/60 dark:text-muted-foreground text-sm text-center" suppressHydrationWarning>
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
