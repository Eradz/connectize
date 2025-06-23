import { Spinner } from "@chakra-ui/react";
import LightParagraph from "./ParagraphText";
import Logo from "./logo";

export default function PageLoading({
  text = "Loading page...",
  hasLogo = true,
}) {
  return (
    <>
      {hasLogo && (
        <nav className="p-4 px-6">
          <Logo />
        </nav>
      )}
      <main className="h-[70vh] flex items-center justify-center p-4">
        <section className="flex items-center gap-2">
          <Spinner className="text-gold" />
          <LightParagraph>{text}</LightParagraph>
        </section>
      </main>
    </>
  );
}
