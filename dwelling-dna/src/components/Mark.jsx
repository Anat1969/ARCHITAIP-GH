// The magazine's mark: a stepped mass with an arch cut through it - the oldest
// built answer to chaos, and the threshold every culture here reinterprets.
export default function Mark({ size = 28, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="mark-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9e4da" />
          <stop offset="1" stopColor="#9c8f7a" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#151515" />
      <path
        fill="url(#mark-g)"
        d="M10 52h44v-8h-6v-8h-6v-8h-6v-6h-8v6h-6v8h-6v8h-6z M28 52v-9a4 4 0 0 1 8 0v9z"
        fillRule="evenodd"
      />
    </svg>
  );
}
