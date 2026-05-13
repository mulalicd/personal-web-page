
const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Page not found</p>
        <a href="/" className="text-primary font-medium hover:text-primary/80 transition-colors">
          ← Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
