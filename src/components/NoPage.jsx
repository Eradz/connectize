import React from "react";
import { Link } from "react-router-dom";
import HeadingText from "./HeadingText";

function NoPage() {
  return (
    <section className="min-h-[70vh] w-full flex flex-col items-center justify-center space-y-3">
      <HeadingText>404 No content found</HeadingText>
      <div className="flex gap-2">
        <button
          className="bg-gray-200 py-1.5 xs:text-sm px-6 xs:px-10 rounded-full"
          onClick={() => window.history.back()}
        >
          Go back
        </button>
        <Link
          to="/"
          className="bg-gold py-1.5 xs:text-sm px-6 xs:px-10 rounded-full"
        >
          Go Home
        </Link>
      </div>
    </section>
  );
}

export default NoPage;
