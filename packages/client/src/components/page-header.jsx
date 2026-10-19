export function PageHeader({ title, description, controls }) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        {description && <p className="max-w-xl text-muted-foreground">{description}</p>}
      </div>
      {controls && <div className="ml-auto flex gap-2">{controls}</div>}
    </div>
  );
}
