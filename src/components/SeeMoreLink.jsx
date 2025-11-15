import { Link } from "react-router-dom";

export default function SeeMoreLink({ url }) {
  return (
    <div className="p-2 pb-0 mt-2 border-t flex justify-center items-center text-center w-full">
      <Link
        to={url || ""}
        className="transition-colors duration-300 !text-gray-400 hover:!text-black text-sm"
      >
        View more
      </Link>
    </div>
  );
}
