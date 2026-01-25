import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { knowledgeForumService, knowledgeCategoryService } from '../../api-services/oilgas';
import { webRoutes } from '../../lib/webRoutes';
import { ArrowLeft } from 'lucide-react';
import BackArrowButton from '../../components/BackArrowButton';

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

  const goBack = () => {
    // Navigate back
    console.log('Navigate back');
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F1C644] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Create forum form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">

      <div className="py-4">
        {/* Desktop Header */}
        <div className="flex flex-col md:flex-row mb-4 px-4 md:px-0">
          <BackArrowButton/>
          <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Create Forum</h1>
          <p className="text-sm text-gray-500 mt-1">Create Forum For Discussion</p>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 md:rounded-lg md:shadow-sm space-y-6">
          {error && (
            <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          {/* Mobile Section Title */}
          <h2 className="md:hidden text-lg font-semibold text-gray-900">Forum Creation</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F1C644] focus:border-transparent text-sm"
              placeholder="enter a clear, descriptive title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F1C644] focus:border-transparent text-sm resize-none"
              rows={4}
              placeholder="short summary (optional)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
            <div className="relative">
              <select
                name="category"
                value={form.category}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F1C644] focus:border-transparent text-sm appearance-none bg-white"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={form.is_public}
                  onChange={onChange}
                  className="h-4 w-4 rounded appearance-none focus:ring-2 focus:ring-[#F1C644] focus:ring-offset-2 cursor-pointer"
                  style={{
                    border: '2px solid',
                    borderImage: 'linear-gradient(135deg, #FFC000 0%, #FF8400 100%) 1',
                    background: form.is_public ? 'linear-gradient(135deg, #FFC000 0%, #FF8400 100%)' : 'white'
                  }}
                />
                {form.is_public && (
                  <svg className="absolute left-0.5 top-0.5 w-3 h-3 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              <label className="ml-2 text-sm text-gray-700">
                Public forum (visible to all user)
              </label>
            </div>
            
            <div className="flex items-center">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="is_moderated"
                  checked={form.is_moderated}
                  onChange={onChange}
                  className="h-4 w-4 rounded appearance-none focus:ring-2 focus:ring-[#F1C644] focus:ring-offset-2 cursor-pointer"
                  style={{
                    border: '2px solid',
                    borderImage: 'linear-gradient(135deg, #FFC000 0%, #FF8400 100%) 1',
                    background: form.is_moderated ? 'linear-gradient(135deg, #FFC000 0%, #FF8400 100%)' : 'white'
                  }}
                />
                {form.is_moderated && (
                  <svg className="absolute left-0.5 top-0.5 w-3 h-3 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              <label className="ml-2 text-sm text-gray-700">
                Moderated forum (post require approval)
              </label>
            </div>
          </div>
          
          {/* Desktop Buttons */}
          <div className="hidden md:flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={goBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={saving}
              style={{ backgroundColor: '#F1C644' }}
              className="hover:opacity-90 disabled:opacity-50 text-gray-900 font-medium px-6 py-2 rounded-md transition-opacity"
            >
              {saving ? 'Creating…' : 'Create Forum'}
            </button>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden pt-6">
            <button
              onClick={onSubmit}
              disabled={saving}
              style={{ backgroundColor: '#F1C644' }}
              className="w-full hover:opacity-90 disabled:opacity-50 text-gray-900 font-semibold px-6 py-3.5 rounded-lg transition-opacity flex items-center justify-center"
            >
              {saving ? 'Creating…' : (
                <>
                  Create
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeForumCreate;