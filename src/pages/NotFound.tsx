
import { useEffect } from "react";

/** Unknown route. The SPA answers 200, so tell search engines not to index it. */
const NotFound = () => {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    const previousTitle = document.title;
    document.title = "Page not found — Davor Mulalić";
    return () => {
      meta.remove();
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Page not found</p>
        <a href="/" className="text-primary font-medium hover:text-primary/80 transition-colors">
          ← Return to Home
        </a>
      </div>
    </main>
  );
};

export default NotFound;
