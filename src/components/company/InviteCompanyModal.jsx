import { Badge, Button, Input, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import ReusableModal from "../custom/ResusableModal";
import { getCompanyInvites, inviteCompany } from "../../api-services/company-invites";

const STATUS_COLORS = {
  pending: "orange",
  registered: "green",
  expired: "gray",
};

export default function InviteCompanyModal({ isOpen, onClose, companySlug }) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingInvites(true);
    getCompanyInvites(companySlug)
      .then((results) => setInvites(results || []))
      .finally(() => setLoadingInvites(false));
  }, [isOpen, companySlug]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    try {
      const created = await inviteCompany(companySlug, {
        email: email.trim(),
        company_name: companyName.trim(),
        message: message.trim(),
      });
      setInvites((prev) => [created, ...prev]);
      setEmail("");
      setCompanyName("");
      setMessage("");
    } catch {
      // already toasted by inviteCompany
    } finally {
      setSending(false);
    }
  };

  return (
    <ReusableModal isOpen={isOpen} onClose={onClose} title="Invite a Company">
      <form onSubmit={handleSend} className="space-y-3">
        <p className="text-sm text-gray-600">
          Know a supplier, partner, or client who should be on Connectize? Invite their company directly.
        </p>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Contact email"
          required
        />
        <Input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company name (optional)"
        />
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Optional personal message"
          rows={3}
        />
        <Button type="submit" className="!bg-gold !text-black" isLoading={sending} width="full">
          Send Invitation
        </Button>
      </form>

      <div className="mt-6 border-t pt-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Sent Invitations</h4>
        {loadingInvites ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : invites.length === 0 ? (
          <p className="text-sm text-gray-500">No invitations sent yet.</p>
        ) : (
          <ul className="space-y-2 max-h-56 overflow-y-auto">
            {invites.map((invite) => (
              <li key={invite.id} className="flex items-center justify-between text-sm border rounded-md px-3 py-2">
                <div>
                  <p className="font-medium">{invite.invited_company_name || invite.invited_email}</p>
                  <p className="text-gray-500">{invite.invited_email}</p>
                </div>
                <Badge colorScheme={STATUS_COLORS[invite.status] || "gray"}>{invite.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ReusableModal>
  );
}
