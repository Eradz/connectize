import { lazy, Suspense } from "react";
import "react-quill/dist/quill.snow.css";

const ReactQuill = lazy(() => import("react-quill"));

export default function LazyReactQuill(props) {
  return (
    <Suspense
      fallback={(
        <div
          className="min-h-40 animate-pulse rounded border border-gray-200 bg-gray-50"
          aria-label="Loading editor"
        />
      )}
    >
      <ReactQuill {...props} />
    </Suspense>
  );
}
