import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/userContext";
import { getUserDisplayName } from "../../lib/userDisplay";

export default function RoomName({ user }) {
  const { user: currentUser } = useAuth();
  return (
    <Link
      to={`/messages/?room_name=room_${currentUser?.id}_${user?.id}`}
      className="text-sm xs:text-xs font-bold"
    >
      {getUserDisplayName(user)}
    </Link>
  );
}
