import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const KnowledgeForumCreate = () => {
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    category: '',
    is_public: true,
    is_moderated: false 
  });
  const [categories, setCategories] = useState([
    { id: 1, name: 'General' },
    { id: 2, name: 'Technical' },
    { id: 3, name: 'Discussion' }
  ]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Auto-select first category if available
    if (categories.length > 0) {
      setForm(prev => ({ ...prev, category: categories[0].id }));
    }
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const onSubmit = () => {
    setSaving(true);
    setError(null);
    
    if (!form.category) {
      setError('Please select a category');
      setSaving(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('Forum created successfully!');
    }, 1000);
  };

  const goBack = () => {
    // Navigate back
    console.log('Navigate back');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F1C644] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4">
        <button onClick={goBack} className="mb-4">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Create Forum</h1>
        <p className="text-sm text-gray-500 mt-1">Create Forum For Discussion</p>
      </div>

      <div className="md:max-w-3xl md:mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Desktop Header */}
        <h1 className="hidden md:block text-2xl font-bold text-gray-900 mb-6">Create Forum</h1>
        
        <div className="md:bg-white md:p-6 md:rounded-lg md:shadow-sm space-y-6">
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