import React from "react";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";

const PageHeader = ({
  title,
  subtitle,
  eyebrow,
  actions,
  onBack,
  backLabel = "Go back",
  surface = false,
  className = "",
}) => (
  <header
    className={clsx(
      "mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
      surface && "rounded-xl border border-gray-200 bg-white p-4 shadow-soft sm:p-5",
      className
    )}
  >
    <div className="flex min-w-0 items-start gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
          aria-label={backLabel}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gold">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-xl font-bold text-gray-950 dark:text-gray-100 sm:text-2xl">
          {title}
        </h1>
        {subtitle ? (
          <div className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
    {actions ? <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">{actions}</div> : null}
  </header>
);

export default PageHeader;
