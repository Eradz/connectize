import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";
import { Navigate, Outlet, useLocation } from "react-router";
import Logo from "../../components/logo";
import { getSession } from "../../lib/session";
import LightParagraph from "../../components/ParagraphText";

function AuthLayout({ redirectUrl = "/" }) {
  const session = getSession();
  const { pathname } = useLocation();

  const isLogin = pathname === "/login";
  const isRegister = pathname === "/signup";

  const isLoginOrRegister = isLogin || isRegister;

  if (session) {
    return <Navigate to={isLogin ? "/profile" : redirectUrl} replace />;
  }

  return (
    <div className="h-screen grid flex-col p-4 w-full max-w-full overflow-x-hidden">
      <nav>
        <div className="text-white flex justify-end">
          <a
            href="https://about.connectize.co"
            target="_blank"
            className="text-sm rounded-full py-2 px-3 bg-black hover:opacity-80 mt-[20px] md:mt-0"
          >
            About Us
          </a>
        </div>
      </nav>
      <main className="flex justify-center flex-1 w-full max-w-full overflow-x-hidden">
        <section className="size-full max-h-screen overflow-y-auto flex flex-col items-center lg:!w-1/2 shrink-0 scrollbar-hidden w-full max-w-full">
          <section className="w-full max-xs:h-ful flex-1 flex flex-col justify-center pt-[11px] md:pt-4 pb-4 max-w-xl lg:max-w-md px-0">
            <Logo url="/login" />
            <motion.section
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="flex flex-col-reverse gap-2"
              key={pathname + "section"}
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="max-w-screen-md text-[1.9rem] leading-tight font-bold"
                key={pathname + "heading"}
              >
                {isLogin ? (
                  <>
                    Connect, Collaborate and Thrive{" "}
                    <span className="text-gold ">with Connectize</span>
                  </>
                ) : isRegister ? (
                  <>
                    <span className="text-gold font-bold">Connectize</span>{" "}
                    bridges the gap between interactions and transactions within
                    the oil and gas industry.
                  </>
                ) : (
                  ""
                )}
              </motion.h1>
            </motion.section>
            <motion.section
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-4"
              key={pathname + "outlet"}
            >
              <Outlet />
            </motion.section>

            {isLoginOrRegister && (
              <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                viewport={{ once: true }}
                className="container flex items-center justify-center gap-2 font-semibold text-black mt-12 mb-8"
                key={pathname + "endorsement"}
              >
                <img src="/images/nuprc-logo.png" className="h-8 md:h-10" />
                <small className="font-bold text-xs">Endorsed by NUPRC</small>
              </motion.section>
            )}

            {/* <p className="text-gray-500 text-center">
              Learn more about{" "}
              <a
                href="https://about.connectize.co"
                className="!text-gold font-semibold underline"
                target="_blank"
              >
                Connectize.co
              </a>
            </p> */}
          </section>
        </section>

        <section className="max-lg:hidden !w-[48%] shrink-0 pointer-events-none">
          <DotLottieReact
            src="/lottie/authentication.lottie"
            loop
            autoplay
            className="size-full aspect-square"
          />
        </section>
      </main>
    </div>
  );
}

export default AuthLayout;
