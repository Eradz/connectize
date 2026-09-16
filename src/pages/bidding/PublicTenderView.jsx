import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, Calendar, Clock, FileText, Lock } from "lucide-react";
import { biddingAPI } from "../../api-services/bidding";
import { webRoutes } from "../../lib/webRoutes";
import NoPage from "../../components/NoPage";
import { Skeleton } from "../../components/ui/Skeleton";
import SEO from "../../components/SEO";

const STATUS_LABELS = {
  published: "Published",
  submission_open: "Submission Open",
};

// Logged-out landing page for a public tender, e.g. a visitor arriving from
// a Google search result. Only shows the same narrow, non-sensitive fields
// /api/seo/public/tender/ already exposes to bots (no budgets, bids, or
// award data) - full detail still requires signing in via BiddingProjectDetail.
export default function PublicTenderView() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    biddingAPI
      .getPublicProject(id)
      .then((response) => {
        if (!cancelled) setProject(response?.data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (notFound || !project) return <NoPage />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO
        title={`${project.title} | Connectize Bidding`}
        description={project.description}
      />
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {STATUS_LABELS[project.status] || project.status}
          </span>
          {project.project_type && (
            <span className="text-xs text-gray-500 capitalize">
              {project.project_type.replace(/_/g, " ")}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-semibold text-gray-900">{project.title}</h1>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building2 className="w-4 h-4 shrink-0" />
          <span>{project.company_name}</span>
        </div>

        {project.submission_deadline && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              Submissions close{" "}
              {new Date(project.submission_deadline).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}

        {project.published_at && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              Published {new Date(project.published_at).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
          <FileText className="w-4 h-4 shrink-0 mt-1 text-gray-400" />
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {project.description}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-4 mt-4">
          <Lock className="w-4 h-4 shrink-0 text-gray-400" />
          <p className="text-sm text-gray-600">
            Sign in to see full scope, requirements, and submission details, or
            place a bid.
          </p>
          <Link
            to={webRoutes.login}
            className="ml-auto shrink-0 px-4 py-2 bg-[#242424] hover:bg-[#373737] text-white rounded-lg text-sm"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
