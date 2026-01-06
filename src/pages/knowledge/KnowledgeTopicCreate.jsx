import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { knowledgeForumService, knowledgeForumTopicService } from '../../api-services/oilgas';
import { toast } from 'sonner';
import RichTextEditor from '../../components/RichTextEditor';

const KnowledgeTopicCreate = () => {
  const { forumSlug } = useParams();
  const navigate = useNavigate();
  
  const [forum, setForum] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    is_pinned: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (forumSlug) {
      loadForum();
    }
  }, [forumSlug]);

  const loadForum = async () => {
    try {
      const response = await knowledgeForumService.getById(forumSlug);
      const forumData = response?.data || response;
      setForum(forumData);
    } catch (error) {
      console.error('Error loading forum:', error);
      setError('Failed to load forum information');
      navigate(webRoutes.knowledgeForums);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (name, value) => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!form.title.trim()) {
      setError('Please enter a topic title');
      setSaving(false);
      return;
    }

    if (!form.content.trim()) {
      setError('Please enter topic content');
      setSaving(false);
      return;
    }

    try {
      const topicData = {
        ...form,
        forum: forum.id
      };

      const created = await knowledgeForumTopicService.create(topicData);
      const topic = created?.data || created;
      
      toast.success('Topic created successfully!');
      
      if (topic?.slug) {
        navigate(webRoutes.knowledgeForumTopicDetail?.replace(':slug', topic.slug) || 
                webRoutes.knowledgeForumDetail.replace(':slug', forumSlug));
      } else {
        navigate(webRoutes.knowledgeForumDetail.replace(':slug', forumSlug));
      }
    } catch (err) {
      console.error('Error creating topic:', err);
      setError('Failed to create topic. Please check your input and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(webRoutes.knowledgeForumDetail.replace(':slug', forumSlug));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forum information...</p>
        </div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forum Not Found</h1>
          <p className="text-gray-600 mb-4">The forum you're trying to post in doesn't exist.</p>
          <Link 
            to={webRoutes.knowledgeForums}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forums
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to {forum.name}
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">Create New Topic</h1>
            <p className="text-gray-600 mt-1">Start a discussion in {forum.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Topic Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Topic Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={onInputChange}
                placeholder="Enter a descriptive title for your topic"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
                required
              />
            </div>

            {/* Topic Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <RichTextEditor
                value={form.content}
                onChange={(value) => onChange('content', value)}
                placeholder="Write your topic content here. Be clear and descriptive to encourage good discussions."
                minHeight="200px"
              />
              <p className="mt-2 text-sm text-gray-500">
                Minimum 10 characters. You can use the rich text editor for formatting.
              </p>
            </div>

            {/* Options */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Topic Options</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_pinned"
                    name="is_pinned"
                    checked={form.is_pinned}
                    onChange={onInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_pinned" className="ml-3 text-sm text-gray-700">
                    Pin this topic (requires moderator privileges)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <p>By posting, you agree to follow the forum guidelines.</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.title.trim() || !form.content.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-custom_yellow disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Creating...' : 'Create Topic'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Forum Info */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Posting in: {forum.name}</h3>
          <p className="text-gray-600 text-sm">{forum.description}</p>
          {forum.is_moderated && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> This forum is moderated. Your topic will be reviewed before it becomes visible to other users.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeTopicCreate;
