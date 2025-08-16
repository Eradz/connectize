import React from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/userContext";

export default function RoomName({ user }) {
  const { user: currentUser } = useAuth();
  return (
    <Link
      to={`/messages/?room_name=room_${currentUser?.id}_${user?.id}`}
      className="text-sm xs:text-xs font-bold"
    >
      {user?.first_name} {user?.last_name}
    </Link>
  );
}
