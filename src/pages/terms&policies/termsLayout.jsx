import React from "react";
import { Outlet } from "react-router-dom";
import Logo from "../../components/logo";

export default function TermsLayout() {
  return (
    <main className="md:space-y-4">
      <header className="container max-w-screen-md py-2 md:py-4">
        <Logo />
      </header>
      <section className="container max-w-screen-md p-4 bg-white rounded-md flex gap-4">
        <Outlet />
      </section>
    </main>
  );
}
