import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { knowledgeArticleService, knowledgeCategoryService } from '../../api-services/oilgas';
import { webRoutes } from '../../lib/webRoutes';
import { ArrowLeft, ChevronRight, Loader, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const KnowledgeArticleEdit = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  
  const [form, setForm] = useState({ 
    title: '', 
    excerpt: '', 
    content: '',
    category: '',
    status: 'draft',
    article_type: '',
    tags: [],
    featured_image: null
  });
  const [currentTag, setCurrentTag] = useState(''); 
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories and article data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, articleRes] = await Promise.all([
          knowledgeCategoryService.getAll(),
          knowledgeArticleService.getById(slug)
        ]);

        // Load categories
        const categoriesData = categoriesRes?.data?.results || categoriesRes?.results || categoriesRes?.data || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        // Load article data
        const articleData = articleRes?.data || articleRes;
        if (articleData) {
          setForm({
            title: articleData.title || '',
            excerpt: articleData.excerpt || '',
            content: articleData.content || '',
            category: articleData.category.id || '',
            status: articleData.status || 'draft',
            article_type: articleData.article_type || '',
            tags: articleData.tags ? (Array.isArray(articleData.tags) ? articleData.tags.join(', ') : articleData.tags) : '',
            featured_image: null // Don't load the actual image file, just allow re-upload
          });
        } else {
          setError('Failed to load article');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load article. Please try again.');
        toast.error('Failed to load article');
      } finally {
        setLoading(false);
        setLoadingCategories(false);
      }
    };
    
    fetchData();
  }, [slug]);

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
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files?.[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addTag = () => {
    if (currentTag && !form.tags.includes(currentTag)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, currentTag] }));
      setCurrentTag('');
    }
  };

  const onTagChange = (e) => {
    setCurrentTag(e.target.value);
  };

  const removeTag = (tag) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const onContentChange = (value) => {
    setForm((prev) => ({ ...prev, content: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Prepare form data for multipart upload if there's a featured image
      let updateData = form;
      
      if (form.featured_image instanceof File) {
        // If new image selected, use FormData for multipart upload
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('excerpt', form.excerpt);
        formData.append('content', form.content);
        formData.append('category', form.category);
        formData.append('status', form.status);
        formData.append('article_type', form.article_type);
        formData.append('tags', form.tags);
        formData.append('featured_image', form.featured_image);
        updateData = formData;
      } else {
        // If no new image, just update the text fields
        updateData = { ...form, featured_image: null };
      }

      const response = await knowledgeArticleService.update(slug, updateData);
      
      const article = response?.data || response;
      if (article?.slug) {
        toast.success('Article updated successfully');
        navigate(webRoutes.knowledgeArticleDetail.replace(':slug', article.slug));
      } else {
        toast.success('Article updated successfully');
        navigate(webRoutes.knowledgeArticles);
      }
    } catch (err) {
      setError('Failed to update article. Please check required fields or try again.');
      console.error(err);
      toast.error('Failed to update article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-8 w-8 text-yellow-500 animate-spin" />
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">Edit Article</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Update Your Article Details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <form onSubmit={onSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Article</h2>
            
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
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Add a required skill (e.g., Drilling Operations)"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold/90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {
                    Array.isArray(form?.tags) && form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form?.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-gold"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                    )
                  }
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
              <p className="mt-1 text-xs text-gray-500">
                Upload a new image to replace the current featured image (optional)
              </p>
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
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-900 bg-yellow-400 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 flex items-center justify-center gap-1"
            >
              <span>{saving ? 'Updating…' : 'Update Article'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KnowledgeArticleEdit;
