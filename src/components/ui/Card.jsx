export default function Card({
  children,
  title,
  icon: Icon,
  action,
  className = '',
  headerClassName = '',
}) {
  return (
    <div className={['fiscal-card transition-all duration-300 ease-out hover:-translate-y-0.5', className].join(' ')}>
      {(title || Icon || action) && (
        <div className={['flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4', headerClassName].join(' ')}>
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
            )}
            {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
