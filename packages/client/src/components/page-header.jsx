export function PageHeader({ title, description, controls }) {
  return (
    <div className="flex gap-2 items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {controls && <div className="flex gap-2 ml-auto">{controls}</div>}
    </div>
  );
}
