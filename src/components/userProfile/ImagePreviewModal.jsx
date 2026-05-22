import { useEffect } from "react";
import { X } from "lucide-react";
export function CoverPhotoPreviewModal({ open, onClose, image }) {
    if (!open) return null;

    const handleClickOutside = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEsc);

        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [onClose]);

    return (
        <div
            onClick={handleClickOutside}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-in fade-in duration-300"
        >
            {/* Close Button - Top Right */}
            <button
                onClick={onClose}
                className="fixed top-28 right-4 md:top-10 md:right-36 z-50 bg-white/20 backdrop-blur-md hover:bg-white/40 p-3 rounded-full transition-all duration-200 shadow-lg"
                aria-label="Close"
            >
                <X className="w-6 h-6 text-white" />
            </button>

            {/* Image Container */}
            <div className="relative max-w-6xl w-[95vw] max-h-[95vh]">
                <div className="rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10">
                    <img
                        src={image}
                        alt="Cover preview"
                        draggable={false}
                        className="w-full h-full max-h-[90vh] object-contain bg-gray-900 select-none"
                        style={{ imageRendering: "-webkit-optimize-contrast" }}
                    />
                </div>

                {/* Optional: Subtle zoom hint */}
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium tracking-wider">
                    Click outside to close
                </p>
            </div>
        </div>
    );
}

export function ProfilePhotoPreviewModal({ open, onClose, image }) {
    if (!open) return null;

    const handleClickOutside = (e) => {
        if (e.target === e.currentTarget) onClose();
    };
    
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEsc);

        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [onClose]);

    return (
        <div
            onClick={handleClickOutside}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-in fade-in duration-300 p-4"
        >
            {/* Close Button - Top Right */}
            <button
                onClick={onClose}
                className="fixed top-6 right-6 z-50 bg-white/20 backdrop-blur-md hover:bg-white/40 p-4 rounded-full transition-all duration-300 shadow-2xl"
                aria-label="Close"
            >
                <X className="w-7 h-7 text-white" />
            </button>

            {/* Profile Image with Elegant Frame */}
            <div className="relative">
                {/* Outer Glow Ring */}
                <div className="absolute inset-0 rounded-full bg-white/20 blur-3xl scale-110 -z-10 animate-pulse"></div>

                {/* Main Image Container */}
                <div className="rounded-full overflow-hidden shadow-2xl ring-8 ring-white/30 p-2 bg-gradient-to-br from-white/10 to-transparent">
                    <div className="rounded-full overflow-hidden ring-8 ring-black/50">
                        <img
                            src={image}
                            alt="Profile preview"
                            className="w-80 h-80 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] object-cover rounded-full transition-transform duration-500 hover:scale-105"
                        />
                    </div>
                </div>

                {/* Zoom Hint */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium">
                    Click outside to close
                </div>
            </div>
        </div>
    );
}