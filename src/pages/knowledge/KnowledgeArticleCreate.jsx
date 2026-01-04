import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { knowledgeArticleService } from '../../api-services/oilgas';
import { webRoutes } from '../../lib/webRoutes';
import { ArrowLeft, ChevronRight } from 'lucide-react';

const KnowledgeArticleCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', excerpt: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Quill editor configuration with comprehensive toolbar
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onContentChange = (value) => {
    setForm((prev) => ({ ...prev, content: value }));
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
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">Publish Article</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Write And Publish Your Article</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <form onSubmit={onSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Write Article</h2>
            
            {error && (
              <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="enter a clear, descriptive title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Excerpt</label>
              <textarea
                name="excerpt"
                value={form.excerpt}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="short summary (optional)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Content</label>
              <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
                <ReactQuill
                  theme="snow"
                  value={form.content}
                  onChange={onContentChange}
                  modules={modules}
                  formats={formats}
                  placeholder="Write your article content here... Use the toolbar above to format your text, add links, images, and more."
                  className="custom-quill-editor"
                  style={{ 
                    minHeight: '400px',
                    backgroundColor: 'white'
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Rich text editor supports formatting, links, images, code blocks, and more.
              </p>
            </div>
          </div>

          {/* Action Buttons - Stacked on mobile, side-by-side on desktop */}
          <div className="border-t border-gray-200 p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
            <button
              type="button"
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 order-2 sm:order-1"
            >
              Save To Draft
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-900 bg-yellow-400 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 flex items-center justify-center gap-1"
            >
              <span>{saving ? 'Publishing…' : 'Publish'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KnowledgeArticleCreate;