import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { knowledgeArticleService } from '../../api-services/oilgas';
import { webRoutes } from '../../lib/webRoutes';

const KnowledgeArticleCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', excerpt: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await knowledgeArticleService.create(form);
      const article = created?.data || created;
      if (article?.slug) {
        navigate(webRoutes.knowledgeArticleDetail.replace(':slug', article.slug));
      } else {
        navigate(webRoutes.knowledgeArticles);
      }
    } catch (err) {
      setError('Failed to create article. Please check required fields or login.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Write Article</h1>
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter a clear, descriptive title"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Excerpt</label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Short summary (optional)"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Content</label>
            <textarea
              name="content"
              value={form.content}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              rows={10}
              placeholder="Write your article content here..."
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {saving ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KnowledgeArticleCreate;
