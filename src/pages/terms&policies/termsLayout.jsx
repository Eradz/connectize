import React from "react";
import { Outlet } from "react-router-dom";
import Logo from "../../components/logo";

export default function TermsLayout() {
  return (
    <main className="bg-background min-h-screen md:space-y-4 pb-8">
      <header className="container max-w-screen-md py-2 md:py-4">
        <Logo />
      </header>
      <section className="container max-w-screen-md p-4 md:p-6 bg-white rounded-md flex flex-col md:flex-row gap-4">
        <Outlet />
      </section>
    </main>
  );
}
