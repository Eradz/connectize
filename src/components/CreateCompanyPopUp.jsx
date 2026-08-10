import React from "react";
import { X, Building2, TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { webRoutes } from "../lib/webRoutes";

const FEATURES = [
  {
    icon: Building2,
    title: "Get Discovered",
    description: "Customers can find and trust your business easily.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Network",
    description: "Connect with partners, representatives and more.",
  },
  {
    icon: ShieldCheck,
    title: "Manage Everything",
    description: "All your business tools and insights in one dashboard.",
  },
];

// Fully controlled: parent owns visibility (see usePresenceModalVisibility).
export default function BusinessPresenceModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-transparent" />

        {/* close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="px-8 pt-10 pb-8">
          {/* header */}
          <h2 className="text-center text-2xl font-semibold text-gray-900 leading-snug">
            Build Your Business
            <br />
            Presence Today
          </h2>
          <p className="mt-3 text-center text-sm text-gray-500 leading-relaxed">
            Create a company profile, connect with customers and grow your
            business all in one place.
          </p>

          {/* feature cards */}
          <div className="mt-6 space-y-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-xl border border-gray-200 p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400">
                  <Icon size={16} className="text-gray-900" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {title}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500 leading-snug">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link to={webRoutes.createCompany} className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-yellow-400 py-3 text-sm font-semibold text-gray-900 hover:bg-yellow-500 transition-colors">
            Create a Company
            <ArrowRight size={16} />
          </Link>

          <p className="mt-3 text-center text-xs text-gray-400">
            It's free and only takes a few minutes!
          </p>
        </div>
      </div>
    </div>
  );
}