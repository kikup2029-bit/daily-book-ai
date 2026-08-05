/** Consistent page wrapper: title, optional blurb, then the section itself. */
export function PageShell({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {blurb ? <p className="mt-1 text-sm text-muted-foreground">{blurb}</p> : null}
      </div>
      {children}
    </div>
  );
}
