import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { knowledgeForumService } from '../../api-services/oilgas';
import { webRoutes } from '../../lib/webRoutes';
import { toast } from 'sonner';

const KnowledgeForumInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const action = (searchParams.get('action') || '').toLowerCase();
  const [status, setStatus] = useState('idle'); // idle | working | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const autoAct = async () => {
      if (!token) return;
      if (action !== 'accept' && action !== 'decline') return;
      setStatus('working');
      try {
        if (action === 'accept') {
          await knowledgeForumService.acceptInvite(token);
          setMessage('Invitation accepted.');
          toast.success('Invitation accepted');
        } else {
          await knowledgeForumService.declineInvite(token);
          setMessage('Invitation declined.');
          toast.info('Invitation declined');
        }
        setStatus('success');
      } catch (e) {
        setStatus('error');
        setMessage('Unable to process the invitation. It may be invalid or already processed.');
        toast.error('Invite processing failed');
      }
    };
    autoAct();
  }, [token, action]);

  const handleAccept = async () => {
    setStatus('working');
    try {
      await knowledgeForumService.acceptInvite(token);
      setStatus('success');
      setMessage('Invitation accepted.');
      toast.success('Invitation accepted');
    } catch (e) {
      setStatus('error');
      setMessage('Unable to accept the invitation.');
      toast.error('Failed to accept');
    }
  };

  const handleDecline = async () => {
    setStatus('working');
    try {
      await knowledgeForumService.declineInvite(token);
      setStatus('success');
      setMessage('Invitation declined.');
      toast.info('Invitation declined');
    } catch (e) {
      setStatus('error');
      setMessage('Unable to decline the invitation.');
      toast.error('Failed to decline');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-semibold mb-2">Forum Invitation</h1>
        {!token ? (
          <p className="text-gray-600">Missing invitation token.</p>
        ) : (
          <>
            {status === 'idle' && (
              <p className="text-gray-600">Use the buttons below to respond to the invitation.</p>
            )}
            {status === 'working' && (
              <p className="text-gray-600">Processing…</p>
            )}
            {status !== 'idle' && message && (
              <p className="mt-2 text-gray-800">{message}</p>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleAccept}
                disabled={!token || status === 'working'}
                className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
              >
                Accept
              </button>
              <button
                onClick={handleDecline}
                disabled={!token || status === 'working'}
                className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={() => navigate(webRoutes.knowledgeForums)}
                className="px-4 py-2 rounded border"
              >
                Back to Forums
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KnowledgeForumInvite;
