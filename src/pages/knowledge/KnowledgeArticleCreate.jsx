import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { knowledgeArticleService, knowledgeCategoryService } from '../../api-services/oilgas';
import { webRoutes } from '../../lib/webRoutes';
import { ArrowLeft, ChevronRight } from 'lucide-react';

const LOCAL_DRAFT_KEY = 'knowledge_article_draft';
const KnowledgeArticleCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    // Try to restore draft from localStorage
    const draft = localStorage.getItem(LOCAL_DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Don't restore featured_image file object
        return { ...parsed, featured_image: null };
      } catch {
        return {
          title: '', excerpt: '', content: '', category: '', status: 'draft', article_type: '', tags: '', featured_image: null
        };
      }
    }
    return {
      title: '', excerpt: '', content: '', category: '', status: 'draft', article_type: '', tags: '', featured_image: null
    };
  });
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await knowledgeCategoryService.getAll();
        const categoriesData = response?.data?.results || response?.results || response?.data || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

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

  // Save draft to localStorage on every change (except file)
  const saveDraft = (nextForm) => {
    const { featured_image, ...rest } = nextForm;
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(rest));
  };

  const onChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm((prev) => {
        const next = { ...prev, [name]: files?.[0] || null };
        saveDraft(next);
        return next;
      });
    } else {
      setForm((prev) => {
        const next = { ...prev, [name]: value };
        saveDraft(next);
        return next;
      });
    }
  };

  const onContentChange = (value) => {
    setForm((prev) => {
      const next = { ...prev, content: value };
      saveDraft(next);
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let payload = form;
      // If there's a file, use FormData
      if (form.featured_image instanceof File) {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (key === 'featured_image') {
            if (value) formData.append('featured_image', value);
          } else {
            formData.append(key, value);
          }
        });
        payload = formData;
      }
      const created = await knowledgeArticleService.create(payload);
      const article = created?.data || created;
      if (article?.slug) {
        navigate(webRoutes.knowledgeArticleDetail.replace(':slug', article.slug));
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

            {/* Category Field */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
                disabled={loadingCategories}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {loadingCategories && (
                <p className="mt-1 text-xs text-gray-500">Loading categories...</p>
              )}
            </div>

            {/* Status Field */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
              >
                <option value="draft">Draft</option>
                <option value="review">Under Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Article Type Field */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Article Type</label>
              <select
                name="article_type"
                value={form.article_type}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
              >
                <option value="">Select an article type</option>
                <option value="news">News</option>
                <option value="insight">Insight</option>
                <option value="analysis">Analysis</option>
                <option value="tutorial">Tutorial</option>
                <option value="opinion">Opinion</option>
              </select>
            </div>

            {/* Tags Field */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Tags (Optional)</label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter tags separated by commas (e.g., oil, gas, energy)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate multiple tags with commas for better discoverability
              </p>
            </div>

            {/* Featured Image Field */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Featured Image</label>
              <input
                type="file"
                name="featured_image"
                onChange={onChange}
                accept="image/*"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              {form.featured_image && (
                <p className="mt-1 text-xs text-gray-600">
                  Selected: {form.featured_image.name}
                </p>
              )}
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