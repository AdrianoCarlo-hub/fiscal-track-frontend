export default function Skeleton({ className = '', variant = 'rect' }) {
  const base = 'relative overflow-hidden rounded-xl bg-slate-200/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

  const sizes = {
    rect: 'h-4 w-full',
    card: 'h-28 w-full',
    circle: 'h-10 w-10 rounded-full',
    text: 'h-4 w-32',
  };

  return <div className={[base, sizes[variant] || sizes.rect, className].join(' ')} />;
}
