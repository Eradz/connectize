import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { knowledgeForumService, knowledgeCategoryService } from '../../api-services/oilgas';
import { webRoutes } from '../../lib/webRoutes';

const KnowledgeForumCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    category: '',
    is_public: true,
    is_moderated: false 
  });
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await knowledgeCategoryService.getAll();
      const categoryData = response?.results || response?.data || response || [];
      setCategories(categoryData);
      
      // Auto-select first category if available
      if (categoryData.length > 0) {
        setForm(prev => ({ ...prev, category: categoryData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    if (!form.category) {
      setError('Please select a category');
      setSaving(false);
      return;
    }
    
    try {
      const created = await knowledgeForumService.create(form);
      const forum = created?.data || created;
      if (forum?.slug) {
        navigate(webRoutes.knowledgeForumDetail.replace(':slug', forum.slug));
      } else {
        navigate(webRoutes.knowledgeForums);
      }
    } catch (err) {
      setError('Failed to create forum. Please check required fields or login.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Forum</h1>
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Forum name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={6}
              placeholder="What is this forum about?"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_public"
                checked={form.is_public}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Public forum (visible to all users)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_moderated"
                checked={form.is_moderated}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Moderated forum (posts require approval)
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(webRoutes.knowledgeForums)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md"
            >
              {saving ? 'Creating…' : 'Create Forum'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KnowledgeForumCreate;
