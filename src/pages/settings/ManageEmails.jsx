import { Badge, Button, Input, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  addEmail,
  getMyEmails,
  removeEmail,
  resendEmailCode,
  setPrimaryEmail,
  verifyEmailCode,
} from "../../api-services/emails";
import CodeInputModal from "../../components/CodeInputModal";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import { createSEO } from "../../components/SEO";
import { webRoutes } from "../../lib/webRoutes";

export const meta = () =>
  createSEO({
    title: "Manage Emails | Connectize",
  });

const ManageEmailsPage = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [verifyingEmail, setVerifyingEmail] = useState(null);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    setLoading(true);
    const results = await getMyEmails();
    setEmails(results);
    setLoading(false);
  };

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setAdding(true);
    try {
      const created = await addEmail(newEmail.trim());
      setNewEmail("");
      if (created) {
        setEmails((prev) => [created, ...prev]);
        setVerifyingEmail(created);
      }
    } catch {
      // already toasted by addEmail
    } finally {
      setAdding(false);
    }
  };

  const handleVerify = async (code) => {
    const updated = await verifyEmailCode(verifyingEmail.id, code);
    if (updated) {
      setEmails((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      toast.success(`${updated.email} verified successfully`);
      setVerifyingEmail(null);
    }
  };

  const handleSetPrimary = async (emailRow) => {
    setActionId(emailRow.id);
    try {
      await setPrimaryEmail(emailRow.id);
      await loadEmails();
    } catch {
      // already toasted
    } finally {
      setActionId(null);
    }
  };

  const handleRemove = async (emailRow) => {
    setActionId(emailRow.id);
    try {
      await removeEmail(emailRow.id);
      setEmails((prev) => prev.filter((e) => e.id !== emailRow.id));
    } catch {
      // already toasted
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" color="gold" />
      </section>
    );
  }

  return (
    <main className="space-y-6">
      <section className="flex items-center justify-between border-b pb-4">
        <div>
          <HeadingText weight="semibold">Manage Emails</HeadingText>
          <LightParagraph className="mt-1">
            Add and verify extra emails, and choose which one you sign in with
          </LightParagraph>
        </div>
        <Link to={webRoutes.settings}>
          <Button size="sm" variant="outline" className="!text-sm">
            Back to Settings
          </Button>
        </Link>
      </section>

      <form onSubmit={handleAddEmail} className="flex gap-2 max-w-lg">
        <Input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Add another email address"
          required
        />
        <Button type="submit" className="!bg-gold !text-black" isLoading={adding} flexShrink={0}>
          Add
        </Button>
      </form>

      <section className="space-y-3">
        {emails.map((emailRow) => (
          <div
            key={emailRow.id}
            className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between gap-4 flex-wrap"
          >
            <div>
              <p className="font-medium text-gray-900">{emailRow.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {emailRow.is_primary && <Badge colorScheme="yellow">Primary</Badge>}
                <Badge colorScheme={emailRow.is_verified ? "green" : "orange"}>
                  {emailRow.is_verified ? "Verified" : "Pending verification"}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              {!emailRow.is_verified && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setVerifyingEmail(emailRow)}
                  >
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    isLoading={actionId === emailRow.id}
                    onClick={async () => {
                      setActionId(emailRow.id);
                      try {
                        await resendEmailCode(emailRow.id);
                      } finally {
                        setActionId(null);
                      }
                    }}
                  >
                    Resend code
                  </Button>
                </>
              )}
              {emailRow.is_verified && !emailRow.is_primary && (
                <Button
                  size="sm"
                  colorScheme="yellow"
                  isLoading={actionId === emailRow.id}
                  onClick={() => handleSetPrimary(emailRow)}
                >
                  Set as primary
                </Button>
              )}
              {!emailRow.is_primary && (
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  isLoading={actionId === emailRow.id}
                  onClick={() => handleRemove(emailRow)}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </section>

      <CodeInputModal
        isOpen={!!verifyingEmail}
        onClose={() => setVerifyingEmail(null)}
        title="Verify your email"
        description={
          verifyingEmail
            ? `We sent a 6-digit code to ${verifyingEmail.email}. Enter it below to verify.`
            : ""
        }
        onSubmit={handleVerify}
        onResend={() => resendEmailCode(verifyingEmail.id)}
      />
    </main>
  );
};

export default ManageEmailsPage;
