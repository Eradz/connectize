import { Navigate, Outlet, useLocation } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Logo from "../../components/logo";
import { getSession } from "../../lib/session";

function AuthLayout({ redirectUrl = "/" }) {
  const session = getSession();
  const { pathname } = useLocation();

  const isLogin = pathname === "/login";
  const isRegister = pathname === "/signup";
  
  // Allow password reset pages even when logged in
  const isPasswordResetPage = pathname === "/reset-password" || pathname === "/confirm-reset-password";

  const isLoginOrRegister = isLogin || isRegister;

  // Only redirect if logged in AND not on a password reset page
  if (session && !isPasswordResetPage) {
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
            <section className="flex flex-col-reverse gap-2">
              <h1 className="max-w-screen-md text-[1.9rem] leading-tight font-bold">
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
              </h1>
            </section>
            <section className="mt-4">
              <Outlet />
            </section>

            {isLoginOrRegister && (
              <section className="container flex items-center justify-center gap-2 font-semibold text-black mt-12 mb-8">
                <img src="/images/nuprc-logo.png" className="h-8 md:h-10" />
                <small className="font-bold text-xs">Endorsed by NUPRC</small>
              </section>
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

        <section className="max-lg:hidden !w-[48%] shrink-0">
          <div className="flex flex-col h-full min-h-[640px] w-full items-center justify-center rounded-[32px] p-10">
            <div className="w-full max-w-md flex items-center justify-center">
              <DotLottieReact
                src="/lottie/authentication.lottie"
                loop
                autoplay
                className="w-full max-w-sm"
              />
            </div>
            <div className="max-w-md space-y-4 mt-6">
              <div className="space-y-3 text-center">
                <span className="inline-flex rounded-full border border-gold/30 bg-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                  Connectize Access
                </span>
                <h2 className="text-3xl font-bold leading-tight text-gray-900">
                  Secure access for transactions, vendors, and enterprise teams.
                </h2>
                <p className="text-sm leading-7 text-gray-500">
                  Sign in once to manage procurement, logistics, marketplace activity, and company collaboration from a single workspace.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AuthLayout;
