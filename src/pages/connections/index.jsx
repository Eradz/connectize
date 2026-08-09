import { Avatar, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getUserById, getUserFollowers, getUserFollowing } from "../../api-services/users";
import ConnectButton from "../../components/ConnectButton";
import HeadingText from "../../components/HeadingText";
import { createSEO } from "../../components/SEO";
import { avatarStyle } from "../../components/ResponsiveNav";
import { useAuth } from "../../context/userContext";
import { getUserDisplayName } from "../../lib/userDisplay";
import clsx from "clsx";

export const meta = () =>
  createSEO({
    title: "Connections | Connectize",
  });

const TABS = [
  { key: "followers", label: "Connections" },
  { key: "following", label: "Following" },
];

const ConnectionsPage = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();
  const initialTab = searchParams.get("tab") === "following" ? "following" : "followers";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [items, setItems] = useState([]);
  const [ownerName, setOwnerName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserById(userId)
      .then((owner) => setOwnerName(getUserDisplayName(owner)))
      .catch(() => setOwnerName(""));
  }, [userId]);

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    const fetchList = activeTab === "followers" ? getUserFollowers : getUserFollowing;
    fetchList(userId)
      .then((results) => {
        if (isCurrent) setItems(results || []);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [userId, activeTab]);

  return (
    <main className="space-y-6">
      <section className="flex items-center gap-3 border-b pb-4">
        <Link to={`/co/${userId}`} className="text-gray-500 hover:text-gray-700">
          <ArrowLeftOutlined />
        </Link>
        <HeadingText weight="semibold">
          {ownerName ? `${ownerName}'s Connections` : "Connections"}
        </HeadingText>
      </section>

      <section className="flex gap-6 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              "pb-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.key
                ? "border-gold text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {loading ? (
        <section className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" color="gold" />
        </section>
      ) : items.length === 0 ? (
        <section className="flex flex-col items-center justify-center min-h-[300px] space-y-2">
          <p className="text-gray-500">
            {activeTab === "followers" ? "No connections yet" : "Not following anyone yet"}
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          {items.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-4">
                <Link to={`/co/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar
                    size="md"
                    src={user.avatar}
                    name={getUserDisplayName(user)}
                    className={clsx(avatarStyle)}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {getUserDisplayName(user)}
                    </h3>
                    {(user.role || user.city || user.country) && (
                      <p className="text-sm text-gray-600 truncate mt-0.5">
                        {[user.role, user.city, user.country].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </Link>

                {currentUser?.id !== user.id && (
                  <ConnectButton
                    id={user.id}
                    slug={user.id}
                    first_name={getUserDisplayName(user)}
                    connection_status={user.connection_status}
                  />
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
};

export default ConnectionsPage;
