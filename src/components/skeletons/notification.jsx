import clsx from "clsx";

export const NotificationsSkeleton = () => {
  return (
    <div className={clsx("w-full min-w-[300px] overflow-hidden rounded-xl border border-gray-200 bg-white")}>
      <header className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:px-5">
        <div className="h-7 w-36 rounded-lg skeleton" />
        <div className="h-9 w-32 rounded-lg skeleton" />
      </header>
      <div className="flex gap-2 overflow-hidden border-b border-gray-200 px-4 py-3 sm:px-5">
        {["w-16", "w-20", "w-24", "w-20"].map((widthClass, index) => (
          <div key={index} className={clsx("h-8 shrink-0 rounded-full skeleton", widthClass)} />
        ))}
      </div>
      <div className="max-h-[70vh] divide-y divide-gray-100 overflow-y-auto">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3 px-4 py-4 sm:px-5">
            <div className="size-12 shrink-0 rounded-full skeleton" />
            <div className="w-full space-y-2 pt-0.5">
              <div className="h-3.5 w-4/5 rounded skeleton" />
              <div className="h-3.5 w-3/5 rounded skeleton" />
              <div className="h-3 w-1/3 rounded skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
