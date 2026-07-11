import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import logistics from "../../api-services/logistics";
import SEO from "../../components/SEO";

export default function ProviderPublicProfile() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    logistics.getLogisticsProvider(id).then(setProvider).catch(() => setError(true));
  }, [id]);

  if (error) return <main className="mx-auto max-w-4xl p-8"><h1 className="text-2xl font-semibold">Logistics provider not found</h1></main>;
  if (!provider) return <main className="mx-auto max-w-4xl p-8">Loading provider…</main>;

  const name = provider.company_name || provider.name || "Logistics provider";
  const description = provider.description || provider.service_description || "Logistics services on Connectize.";

  return (
    <main className="mx-auto max-w-4xl p-8">
      <SEO title={`${name} | Connectize Logistics`} description={description} type="profile" />
      <article className="rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-950">{name}</h1>
        <p className="mt-4 whitespace-pre-line text-gray-700">{description}</p>
        {(provider.location || provider.country) && <p className="mt-6 text-sm text-gray-600">Location: {provider.location || provider.country}</p>}
      </article>
    </main>
  );
}
