import clsx from "clsx";

export const NotificationsSkeleton = () => {
  return (
    <div
      className={clsx("bg-white rounded p-3 space-y-4 w-full min-w-[300px]")}
    >
      <header className="flex justify-between items-center gap-2 border-b border-gray-100 pb-1">
        <div className="h-5 w-32 rounded skeleton" />
        <div className="h-4 w-24 rounded skeleton" />
      </header>
      <div className="space-y-4 overflow-y-auto max-h-[70vh]">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="rounded-full size-8 shrink-0 skeleton" />
            <div className="space-y-1 w-full">
              <div className="h-3 w-3/5 rounded skeleton" />
              <div className="h-2.5 w-full rounded skeleton" />
              <div className="h-2.5 w-4/5 rounded skeleton" />
              <div className="h-2 w-20 rounded skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
