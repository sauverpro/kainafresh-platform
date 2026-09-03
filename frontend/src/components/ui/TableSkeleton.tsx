interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export default function TableSkeleton({ columns = 6, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-gray-100 dark:border-white/5">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <td key={cIdx} className="px-4 py-4">
              <div
                className="skeleton-shimmer h-4 rounded-md"
                style={{ width: cIdx === 0 ? "40%" : cIdx === 1 ? "80%" : "60%" }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
