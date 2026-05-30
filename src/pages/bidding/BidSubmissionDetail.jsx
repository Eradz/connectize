import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Download,
  FileText,
  Lock,
  Star,
} from "lucide-react";
import { biddingAPI } from "../../api-services/bidding";
import { webRoutes } from "../../lib/webRoutes";

function unwrapApiPayload(response) {
  if (response == null) return null;
  let payload = response;
  if (payload && typeof payload === "object" && "data" in payload) {
    payload = payload.data;
  }
  return payload ?? null;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

function formatCurrency(amount, currency = "USD") {
  if (amount === null || amount === undefined || amount === "") return "-";
  const num = Number(amount);
  if (!Number.isFinite(num)) return "-";
  return `${currency || "USD"} ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatLabel(value) {
  if (!value) return "-";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function RichTextBlock({ html, empty = "No response provided." }) {
  if (!html) {
    return <p className="text-sm text-gray-500">{empty}</p>;
  }
  return (
    <div
      className="prose prose-sm max-w-none text-gray-700"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}

function JsonBlock({ value, empty = "No data provided." }) {
  if (!value || (typeof value === "object" && Object.keys(value).length === 0)) {
    return <p className="text-sm text-gray-500">{empty}</p>;
  }

  if (typeof value !== "object") {
    return <p className="text-sm text-gray-700">{String(value)}</p>;
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {typeof item === "object" ? JSON.stringify(item, null, 2) : String(item)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {Object.entries(value).map(([key, item]) => (
        <div key={key} className="rounded-lg bg-gray-50 px-3 py-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {formatLabel(key)}
          </dt>
          <dd className="mt-1 text-sm text-gray-800">
            {typeof item === "object" ? JSON.stringify(item, null, 2) : String(item)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function DetailSection({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-[#F1C644]" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function BidSubmissionDetail() {
  const { id, bidId } = useParams();
  const navigate = useNavigate();
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadBid() {
      try {
        setLoading(true);
        setError("");
        const response = await biddingAPI.getBid(bidId);
        if (mounted) setBid(unwrapApiPayload(response));
      } catch (err) {
        console.error("Failed to load bid submission:", err);
        if (mounted) setError("Failed to load bid submission.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadBid();
    return () => {
      mounted = false;
    };
  }, [bidId]);

  const projectId = bid?.project || id;
  const projectUrl = webRoutes.biddingDetail.replace(":id", projectId || id);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="h-8 w-40 bg-gray-100 rounded mb-6 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-36 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !bid) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(projectUrl)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </button>
        <div className="text-center py-16 rounded-xl border border-red-200 bg-white">
          <p className="font-medium text-red-600">{error || "Bid submission not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <button
        onClick={() => navigate(projectUrl)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Project
      </button>

      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bid Submission</h1>
          <p className="text-sm text-gray-500 mt-1">
            {bid.project_title || "Bidding Project"} · {bid.project_reference || "-"}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
              {formatLabel(bid.status)}
            </span>
            {bid.rank && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-sm font-medium text-yellow-700">
                <Star className="w-4 h-4" />
                Rank #{bid.rank}
              </span>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 min-w-[220px]">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total Price</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">
            {formatCurrency(bid.total_price, bid.currency)}
          </p>
          {bid.weighted_score !== null && bid.weighted_score !== undefined && (
            <p className="mt-1 text-sm text-gray-500">Score: {bid.weighted_score}</p>
          )}
        </div>
      </header>

      <DetailSection title="Submission Info" icon={Building2}>
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Bidder</dt>
            <dd className="mt-1 font-medium text-gray-900">{bid.bidder_company_name || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Submitted By</dt>
            <dd className="mt-1 font-medium text-gray-900">{bid.submitted_by_name || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Submitted</dt>
            <dd className="mt-1 font-medium text-gray-900">{formatDate(bid.submitted_at)}</dd>
          </div>
        </dl>
      </DetailSection>

      <DetailSection title="Technical Proposal" icon={FileText}>
        <RichTextBlock html={bid.technical_proposal} />
      </DetailSection>

      <DetailSection title="Envelope Submissions" icon={Lock}>
        {bid.envelopes?.length ? (
          <div className="space-y-3">
            {bid.envelopes.map((envelope) => (
              <div key={envelope.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {formatLabel(envelope.envelope_type)} Envelope
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    {envelope.is_sealed ? "Sealed" : `Opened ${formatDate(envelope.opened_at)}`}
                  </span>
                </div>
                {envelope.is_sealed ? (
                  <p className="text-sm text-gray-500">
                    This envelope is still sealed and cannot be reviewed yet.
                  </p>
                ) : (
                  <RichTextBlock html={envelope.content} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No envelope submissions.</p>
        )}
      </DetailSection>

      <DetailSection title="Bid Documents" icon={Download}>
        {bid.documents?.length ? (
          <div className="space-y-3">
            {bid.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-gray-200 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{doc.title || "Document"}</p>
                  <p className="text-sm text-gray-500">
                    {doc.document_type_label || formatLabel(doc.document_type)} · {formatDate(doc.created_at)}
                  </p>
                </div>
                {doc.file && (
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No bid documents attached.</p>
        )}
      </DetailSection>

      <DetailSection title="Commercial & Other Responses" icon={Calendar}>
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Price Breakdown</h3>
            <JsonBlock value={bid.price_breakdown} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Commercial Terms</h3>
            <JsonBlock value={bid.commercial_terms} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Custom Responses</h3>
            <JsonBlock value={bid.custom_responses} />
          </div>
        </div>
      </DetailSection>
    </div>
  );
}
