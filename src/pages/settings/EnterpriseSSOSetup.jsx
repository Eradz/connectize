import {
  Badge,
  Button,
  Input,
  Select,
  Spinner,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  approveSSORepresentative,
  getPendingSSORepresentatives,
  rejectSSORepresentative,
} from "../../api-services/representatives";
import {
  createEnterpriseSSOConfig,
  deleteEnterpriseSSOConfig,
  getEnterpriseDomainVerificationStatus,
  getEnterpriseSSOConfigs,
  regenerateEnterpriseDomainToken,
  updateEnterpriseSSOConfig,
  verifyEnterpriseDomains,
} from "../../api-services/sso";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import { useAuth } from "../../context/userContext";
import { useUserCompanies } from "../../hooks/useUserCompanies";
import { getUserDisplayName } from "../../lib/userDisplay";
import { webRoutes } from "../../lib/webRoutes";

const createDefaultEnterpriseForm = (companyId = "") => ({
  company: companyId,
  provider_type: "oidc",
  provider_name: "",
  client_id: "",
  client_secret: "",
  discovery_url: "",
  authorization_url: "",
  token_url: "",
  userinfo_url: "",
  email_domains: "",
  is_active: false,
  enforce_sso: false,
  auto_provision: true,
  require_admin_approval: false,
});

export default function EnterpriseSSOSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { companies, loading: companiesLoading } = useUserCompanies(user?.id);
  const [enterpriseConfigs, setEnterpriseConfigs] = useState([]);
  const [enterpriseLoading, setEnterpriseLoading] = useState(true);
  const [enterpriseSaving, setEnterpriseSaving] = useState(false);
  const [enterpriseDeletingId, setEnterpriseDeletingId] = useState(null);
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [pendingEmployeesLoading, setPendingEmployeesLoading] = useState(false);
  const [pendingActionId, setPendingActionId] = useState(null);
  const [verificationStatusByConfig, setVerificationStatusByConfig] = useState({});
  const [verificationLoadingId, setVerificationLoadingId] = useState(null);
  const [verificationResetId, setVerificationResetId] = useState(null);
  const [configsLoadError, setConfigsLoadError] = useState(false);
  const [enterpriseForm, setEnterpriseForm] = useState(createDefaultEnterpriseForm());
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadEnterpriseConfigs();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!companies.length) {
      return;
    }

    setEnterpriseForm((current) => {
      if (current.company) {
        return current;
      }

      return {
        ...current,
        company: String(companies[0].id),
      };
    });
  }, [companies]);

  useEffect(() => {
    if (!enterpriseForm.company) {
      setPendingEmployees([]);
      return;
    }

    loadPendingEmployees(enterpriseForm.company);
  }, [enterpriseForm.company]);

  const updateEnterpriseForm = (key, value) => {
    setEnterpriseForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const normalizeEnterprisePayload = () => ({
    ...enterpriseForm,
    company: Number(enterpriseForm.company),
    provider_name: enterpriseForm.provider_name.trim(),
    client_id: enterpriseForm.client_id.trim(),
    client_secret: enterpriseForm.client_secret.trim(),
    discovery_url: enterpriseForm.discovery_url.trim(),
    authorization_url: enterpriseForm.authorization_url.trim(),
    token_url: enterpriseForm.token_url.trim(),
    userinfo_url: enterpriseForm.userinfo_url.trim(),
    email_domains: enterpriseForm.email_domains
      .split(",")
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean)
      .join(","),
  });

  const resetEnterpriseForm = () => {
    setEnterpriseForm(
      createDefaultEnterpriseForm(companies[0] ? String(companies[0].id) : "")
    );
  };

  const loadEnterpriseConfigs = async () => {
    try {
      setEnterpriseLoading(true);
      setConfigsLoadError(false);
      const configs = await getEnterpriseSSOConfigs();
      const configList = Array.isArray(configs) ? configs : [];
      setEnterpriseConfigs(configList);

      await Promise.all(
        configList.map(async (config) => {
          try {
            const status = await getEnterpriseDomainVerificationStatus(config.id);
            setVerificationStatusByConfig((current) => ({
              ...current,
              [config.id]: status,
            }));
          } catch (error) {
            console.error("Failed to load verification status:", error);
          }
        })
      );
    } catch (error) {
      console.error("Failed to load enterprise SSO configs:", error);
      setConfigsLoadError(true);
      toast.error("Failed to load enterprise SSO settings.");
    } finally {
      setEnterpriseLoading(false);
    }
  };

  const loadPendingEmployees = async (companyId) => {
    try {
      setPendingEmployeesLoading(true);
      const pending = await getPendingSSORepresentatives(companyId);
      setPendingEmployees(Array.isArray(pending) ? pending : []);
    } catch (error) {
      console.error("Failed to load pending SSO employees:", error);
      toast.error("Failed to load pending SSO employees.");
    } finally {
      setPendingEmployeesLoading(false);
    }
  };

  const loadVerificationStatus = async (configId) => {
    try {
      const status = await getEnterpriseDomainVerificationStatus(configId);
      setVerificationStatusByConfig((current) => ({
        ...current,
        [configId]: status,
      }));
    } catch (error) {
      console.error("Failed to load domain verification status:", error);
    }
  };

  const handleEnterpriseSubmit = async () => {
    const payload = normalizeEnterprisePayload();

    if (!payload.company) {
      toast.error("Select the company that will own this SSO config.");
      return;
    }

    if (!payload.provider_name) {
      toast.error("Provider name is required.");
      return;
    }

    if (!payload.email_domains) {
      toast.error("Add at least one email domain.");
      return;
    }

    try {
      setEnterpriseSaving(true);
      const existing = enterpriseConfigs.find(
        (config) => String(config.company) === String(payload.company)
      );

      if (existing) {
        await updateEnterpriseSSOConfig(existing.id, payload);
        toast.success("Enterprise SSO configuration updated.");
      } else {
        await createEnterpriseSSOConfig(payload);
        toast.success("Enterprise SSO configuration created.");
      }

      await loadEnterpriseConfigs();
      resetEnterpriseForm();
      setTabIndex(1);
    } catch (error) {
      const message =
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.client_id?.[0] ||
        error?.response?.data?.discovery_url?.[0] ||
        error?.response?.data?.is_active?.[0] ||
        error?.response?.data?.email_domains?.[0] ||
        "Failed to save enterprise SSO configuration.";
      toast.error(message);
    } finally {
      setEnterpriseSaving(false);
    }
  };

  const handleEnterpriseDelete = async (configId) => {
    try {
      setEnterpriseDeletingId(configId);
      await deleteEnterpriseSSOConfig(configId);
      toast.success("Enterprise SSO configuration deleted.");
      await loadEnterpriseConfigs();
    } catch (error) {
      const message =
        error?.response?.data?.errors?.[0]?.message ||
        "Failed to delete enterprise SSO configuration.";
      toast.error(message);
    } finally {
      setEnterpriseDeletingId(null);
    }
  };

  const fillEnterpriseFormFromConfig = (config) => {
    setEnterpriseForm({
      company: String(config.company || ""),
      provider_type: config.provider_type || "oidc",
      provider_name: config.provider_name || "",
      client_id: config.client_id || "",
      client_secret: "",
      discovery_url: config.discovery_url || "",
      authorization_url: config.authorization_url || "",
      token_url: config.token_url || "",
      userinfo_url: config.userinfo_url || "",
      email_domains: config.email_domains || "",
      is_active: Boolean(config.is_active),
      enforce_sso: Boolean(config.enforce_sso),
      auto_provision: config.auto_provision !== false,
      require_admin_approval: Boolean(config.require_admin_approval),
    });
    setTabIndex(0);
  };

  const handleVerifyDomains = async (configId) => {
    try {
      setVerificationLoadingId(configId);
      const result = await verifyEnterpriseDomains(configId);
      await loadVerificationStatus(configId);
      await loadEnterpriseConfigs();
      toast.success(
        result?.all_domains_verified
          ? "All domains verified successfully. You can now activate SSO."
          : "Verification complete. Some domains are still unverified."
      );
    } catch (error) {
      const message =
        error?.response?.data?.errors?.[0]?.message ||
        "Failed to verify company domains.";
      toast.error(message);
    } finally {
      setVerificationLoadingId(null);
    }
  };

  const handleResetVerificationToken = async (configId) => {
    try {
      setVerificationResetId(configId);
      await regenerateEnterpriseDomainToken(configId);
      await loadVerificationStatus(configId);
      await loadEnterpriseConfigs();
      toast.success("Domain verification token regenerated.");
    } catch (error) {
      const message =
        error?.response?.data?.errors?.[0]?.message ||
        "Failed to regenerate verification token.";
      toast.error(message);
    } finally {
      setVerificationResetId(null);
    }
  };

  const handleApprovePendingEmployee = async (representativeId) => {
    try {
      setPendingActionId(representativeId);
      await approveSSORepresentative(representativeId);
      await loadPendingEmployees(enterpriseForm.company);
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.errors?.[0]?.message ||
        "Failed to approve SSO employee.";
      toast.error(message);
    } finally {
      setPendingActionId(null);
    }
  };

  const handleRejectPendingEmployee = async (representativeId) => {
    try {
      setPendingActionId(representativeId);
      await rejectSSORepresentative(representativeId);
      await loadPendingEmployees(enterpriseForm.company);
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.errors?.[0]?.message ||
        "Failed to reject SSO employee.";
      toast.error(message);
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <main className="p-6 bg-white rounded-md min-h-screen space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
        <div>
          <Button variant="ghost" px={0} onClick={() => navigate(webRoutes.settings)}>
            Back to Settings
          </Button>
          <HeadingText weight="semibold">Enterprise SSO Setup</HeadingText>
          <LightParagraph className="mt-2">
            Company admins can manage provider setup, DNS verification, enforcement, and pending employee approvals here.
          </LightParagraph>
          <p className="text-sm text-gray-600 mt-2">
            Redirect URL to register with your identity provider: {window.location.origin}/sso/enterprise/callback
          </p>
        </div>
      </div>

      {companiesLoading || enterpriseLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : !companies.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Create a company profile first. Enterprise SSO configs are attached to a company.
        </div>
      ) : (
        <Tabs index={tabIndex} onChange={setTabIndex} colorScheme="blue" variant="enclosed">
          <TabList flexWrap="wrap">
            <Tab>Configuration</Tab>
            <Tab>Domain Verification</Tab>
            <Tab>
              Pending Approvals
              {pendingEmployees.length > 0 && (
                <Badge ml={2} colorScheme="red" borderRadius="full">
                  {pendingEmployees.length}
                </Badge>
              )}
            </Tab>
            <Tab>Access Policy</Tab>
          </TabList>

          <TabPanels>
            {/* ── Tab 1: Configuration ── */}
            <TabPanel px={0} pt={6}>
              <div className="space-y-8">
                <section className="rounded-lg border p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-medium">Provider Configuration</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Save the config inactive first, verify domain ownership via DNS TXT, then activate SSO.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 font-medium text-sm">Company</p>
                      <Select
                        value={enterpriseForm.company}
                        onChange={(e) => updateEnterpriseForm("company", e.target.value)}
                      >
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.company_name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <p className="mb-2 font-medium text-sm">Provider Type</p>
                      <Select
                        value={enterpriseForm.provider_type}
                        onChange={(e) => updateEnterpriseForm("provider_type", e.target.value)}
                      >
                        <option value="oidc">OpenID Connect</option>
                        <option value="saml" disabled>
                          SAML 2.0 (not yet supported by login flow)
                        </option>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 font-medium text-sm">Provider Name</p>
                      <Input
                        value={enterpriseForm.provider_name}
                        onChange={(e) => updateEnterpriseForm("provider_name", e.target.value)}
                        placeholder="Microsoft Entra ID"
                      />
                    </div>
                    <div>
                      <p className="mb-2 font-medium text-sm">Email Domains</p>
                      <Input
                        value={enterpriseForm.email_domains}
                        onChange={(e) => updateEnterpriseForm("email_domains", e.target.value)}
                        placeholder="acme.com, acme.co.uk"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 font-medium text-sm">Client ID</p>
                      <Input
                        value={enterpriseForm.client_id}
                        onChange={(e) => updateEnterpriseForm("client_id", e.target.value)}
                        placeholder="Application client ID"
                      />
                    </div>
                    <div>
                      <p className="mb-2 font-medium text-sm">Client Secret</p>
                      <Input
                        type="password"
                        value={enterpriseForm.client_secret}
                        onChange={(e) => updateEnterpriseForm("client_secret", e.target.value)}
                        placeholder="Application client secret"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 font-medium text-sm">OIDC Discovery URL</p>
                    <Input
                      value={enterpriseForm.discovery_url}
                      onChange={(e) => updateEnterpriseForm("discovery_url", e.target.value)}
                      placeholder="https://login.microsoftonline.com/<tenant>/v2.0/.well-known/openid-configuration"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Preferred. If your provider does not expose discovery, fill the manual endpoints below instead.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="mb-2 font-medium text-sm">Authorization URL</p>
                      <Input
                        value={enterpriseForm.authorization_url}
                        onChange={(e) => updateEnterpriseForm("authorization_url", e.target.value)}
                        placeholder="Manual authorization endpoint"
                      />
                    </div>
                    <div>
                      <p className="mb-2 font-medium text-sm">Token URL</p>
                      <Input
                        value={enterpriseForm.token_url}
                        onChange={(e) => updateEnterpriseForm("token_url", e.target.value)}
                        placeholder="Manual token endpoint"
                      />
                    </div>
                    <div>
                      <p className="mb-2 font-medium text-sm">Userinfo URL</p>
                      <Input
                        value={enterpriseForm.userinfo_url}
                        onChange={(e) => updateEnterpriseForm("userinfo_url", e.target.value)}
                        placeholder="Optional userinfo endpoint"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-base">Enable Enterprise SSO</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Turn on the enterprise provider for matching company domains.
                        </p>
                      </div>
                      <Switch
                        colorScheme="blue"
                        size="lg"
                        isChecked={enterpriseForm.is_active}
                        onChange={(e) => updateEnterpriseForm("is_active", e.target.checked)}
                      />
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-base">Enforce SSO</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Block password and social logins for users on matching domains.
                        </p>
                      </div>
                      <Switch
                        colorScheme="blue"
                        size="lg"
                        isChecked={enterpriseForm.enforce_sso}
                        onChange={(e) => updateEnterpriseForm("enforce_sso", e.target.checked)}
                      />
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-base">Auto-Provision Users</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Create a Connectize user automatically on first successful SSO login.
                        </p>
                      </div>
                      <Switch
                        colorScheme="blue"
                        size="lg"
                        isChecked={enterpriseForm.auto_provision}
                        onChange={(e) => updateEnterpriseForm("auto_provision", e.target.checked)}
                      />
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-base">Require Admin Approval</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Let employees sign in with company SSO, but hold access until a company admin approves them.
                        </p>
                      </div>
                      <Switch
                        colorScheme="blue"
                        size="lg"
                        isChecked={enterpriseForm.require_admin_approval}
                        onChange={(e) => updateEnterpriseForm("require_admin_approval", e.target.checked)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button colorScheme="blue" onClick={handleEnterpriseSubmit} isLoading={enterpriseSaving}>
                      Save Enterprise SSO
                    </Button>
                    <Button variant="outline" onClick={resetEnterpriseForm}>
                      Reset
                    </Button>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-lg font-medium">Existing Configurations</h2>
                  {!enterpriseConfigs.length ? (
                    <p className="text-sm text-gray-600">No enterprise SSO configuration exists yet.</p>
                  ) : (
                    enterpriseConfigs.map((config) => {
                      const companyName =
                        companies.find((company) => String(company.id) === String(config.company))?.company_name ||
                        config.company_name ||
                        `Company ${config.company}`;

                      return (
                        <div key={config.id} className="rounded-lg border p-4 space-y-3">
                          <div className="flex items-start justify-between gap-4 max-md:flex-col">
                            <div>
                              <p className="font-semibold text-base">{companyName}</p>
                              <p className="text-sm text-gray-600">
                                {config.provider_name} · {config.provider_type.toUpperCase()} · {config.is_active ? "Active" : "Inactive"}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">Domains: {config.email_domains}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Domain verification: {config.domain_verified_at ? "Verified" : "Pending"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => fillEnterpriseFormFromConfig(config)}>
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleEnterpriseDelete(config.id)}
                                isLoading={enterpriseDeletingId === config.id}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </section>
              </div>
            </TabPanel>

            {/* ── Tab 2: Domain Verification ── */}
            <TabPanel px={0} pt={6}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium">Domain Verification</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Add the DNS TXT records below for each domain, then click Verify DNS. SSO cannot be activated until all domains are verified.
                  </p>
                </div>

                {configsLoadError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center space-y-3">
                    <p className="text-sm text-red-700">Failed to load configurations. The server may be unavailable.</p>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={loadEnterpriseConfigs}>
                      Retry
                    </Button>
                  </div>
                ) : !enterpriseConfigs.length ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center space-y-3">
                    <p className="text-sm text-gray-600">No configurations found yet.</p>
                    <Button size="sm" colorScheme="blue" variant="outline" onClick={() => setTabIndex(0)}>
                      Go to Configuration
                    </Button>
                  </div>
                ) : (
                  enterpriseConfigs.map((config) => {
                    const companyName =
                      companies.find((company) => String(company.id) === String(config.company))?.company_name ||
                      config.company_name ||
                      `Company ${config.company}`;

                    return (
                      <div key={config.id} className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
                          <div>
                            <p className="font-semibold text-base">{companyName}</p>
                            <p className="text-sm text-gray-600">
                              {config.provider_name} · Domains: {config.email_domains}
                            </p>
                            <p className="text-sm mt-1">
                              <span
                                className={config.domain_verified_at ? "text-green-600 font-medium" : "text-amber-600 font-medium"}
                              >
                                {config.domain_verified_at ? "Verified" : "Pending Verification"}
                              </span>
                            </p>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => handleVerifyDomains(config.id)}
                              isLoading={verificationLoadingId === config.id}
                            >
                              Verify DNS
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResetVerificationToken(config.id)}
                              isLoading={verificationResetId === config.id}
                            >
                              Regenerate Token
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-md border bg-gray-50 p-3 space-y-2">
                          <p className="text-sm font-medium text-gray-900">DNS TXT Records</p>
                          <p className="text-sm text-gray-600">Add this TXT record for each listed domain:</p>
                          {(verificationStatusByConfig[config.id]?.instructions || []).map((instruction) => (
                            <div key={instruction.domain} className="rounded bg-white p-3 border text-sm text-gray-700">
                              <p><strong>Domain:</strong> {instruction.domain}</p>
                              <p><strong>Name:</strong> {instruction.record_name}</p>
                              <p><strong>Type:</strong> {instruction.record_type}</p>
                              <p className="break-all"><strong>Value:</strong> {instruction.record_value}</p>
                              <p>
                                <strong>Status:</strong>{" "}
                                <span className={instruction.verified ? "text-green-600" : "text-amber-600"}>
                                  {instruction.verified ? "Verified" : "Pending"}
                                </span>
                              </p>
                            </div>
                          ))}
                          {!(verificationStatusByConfig[config.id]?.instructions || []).length && (
                            <p className="text-sm text-gray-500 italic">No verification instructions available yet. Save the configuration first.</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabPanel>

            {/* ── Tab 3: Pending Approvals ── */}
            <TabPanel px={0} pt={6}>
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
                  <div>
                    <h2 className="text-lg font-medium">Pending SSO Employee Approvals</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Employees who signed in via SSO and are awaiting admin approval.
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-sm">Company</p>
                    <Select
                      size="sm"
                      w="auto"
                      minW="200px"
                      value={enterpriseForm.company}
                      onChange={(e) => updateEnterpriseForm("company", e.target.value)}
                    >
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.company_name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {pendingEmployeesLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Spinner size="md" />
                  </div>
                ) : !pendingEmployees.length ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                    <p className="text-sm text-gray-600">No pending SSO employees for the selected company.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingEmployees.map((representative) => (
                      <div key={representative.id} className="rounded-lg border p-4 flex items-start justify-between gap-4 max-md:flex-col">
                        <div>
                          <p className="font-semibold text-base">
                            {getUserDisplayName(representative)}
                          </p>
                          <p className="text-sm text-gray-600">{representative.email}</p>
                          <p className="text-sm text-gray-600 mt-1">Requested role: {representative.role || "Employee"}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Approval status: {representative.sso_approval_status || "pending"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleApprovePendingEmployee(representative.id)}
                            isLoading={pendingActionId === representative.id}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => handleRejectPendingEmployee(representative.id)}
                            isLoading={pendingActionId === representative.id}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabPanel>

            {/* ── Tab 4: Access Policy ── */}
            <TabPanel px={0} pt={6}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium">Access Policy Overview</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Review the current access and enforcement policies for each SSO configuration. To change a policy, click Edit to update it in the Configuration tab.
                  </p>
                </div>

                {configsLoadError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center space-y-3">
                    <p className="text-sm text-red-700">Failed to load configurations. The server may be unavailable.</p>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={loadEnterpriseConfigs}>
                      Retry
                    </Button>
                  </div>
                ) : !enterpriseConfigs.length ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center space-y-3">
                    <p className="text-sm text-gray-600">No configurations found yet.</p>
                    <Button size="sm" colorScheme="blue" variant="outline" onClick={() => setTabIndex(0)}>
                      Go to Configuration
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enterpriseConfigs.map((config) => {
                      const companyName =
                        companies.find((company) => String(company.id) === String(config.company))?.company_name ||
                        config.company_name ||
                        `Company ${config.company}`;

                      const policies = [
                        { label: "SSO Active", value: config.is_active, color: config.is_active ? "green" : "gray" },
                        { label: "Enforce SSO", value: config.enforce_sso, color: config.enforce_sso ? "blue" : "gray" },
                        { label: "Auto-Provision", value: config.auto_provision !== false, color: config.auto_provision !== false ? "blue" : "gray" },
                        { label: "Admin Approval", value: config.require_admin_approval, color: config.require_admin_approval ? "orange" : "gray" },
                      ];

                      return (
                        <div key={config.id} className="rounded-lg border p-5 space-y-4">
                          <div className="flex items-start justify-between gap-4 max-md:flex-col">
                            <div>
                              <p className="font-semibold text-base">{companyName}</p>
                              <p className="text-sm text-gray-600">
                                {config.provider_name} · {config.provider_type.toUpperCase()} · Domains: {config.email_domains}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Domain verification: {config.domain_verified_at ? "Verified" : "Pending"}
                              </p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => fillEnterpriseFormFromConfig(config)}>
                              Edit
                            </Button>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {policies.map((policy) => (
                              <div
                                key={policy.label}
                                className="rounded-md border p-3 text-center"
                              >
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{policy.label}</p>
                                <Badge mt={1} colorScheme={policy.color} fontSize="sm" px={3} py={1} borderRadius="full">
                                  {policy.value ? "Enabled" : "Disabled"}
                                </Badge>
                              </div>
                            ))}
                          </div>

                          <div className="text-xs text-gray-500">
                            {config.enforce_sso
                              ? "Password and social logins are blocked for users on matching domains."
                              : "Users can still use password or social login alongside SSO."}
                            {config.require_admin_approval
                              ? " New SSO employees require admin approval before they gain access."
                              : " New SSO employees gain immediate access after first login."}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </main>
  );
}
