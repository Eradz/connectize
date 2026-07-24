import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Save, Trash2, Award, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { workforceAPI } from '../../api-services/workforce';

const SkillsManager = ({ profileId, initialSkills = [], onSkillsUpdate = () => {} }) => {
  const [skills, setSkills] = useState(initialSkills);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillCategories, setSkillCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  
  const [newSkill, setNewSkill] = useState({
    skill: '',
    proficiency_level: 'beginner',
    years_of_experience: 0,
    last_used: '',
    is_certified: false,
    certification_details: ''
  });

  const proficiencyLevels = [
    { value: 'beginner', label: 'Beginner', color: 'bg-gray-100 text-gray-800' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
    { value: 'advanced', label: 'Advanced', color: 'bg-green-100 text-green-800' },
    { value: 'expert', label: 'Expert', color: 'bg-purple-100 text-purple-800' }
  ];

  useEffect(() => {
    loadAvailableSkills();
    loadSkillCategories();
  }, []);

  const loadAvailableSkills = async () => {
    try {
      const response = await workforceAPI.getSkills();
      setAvailableSkills(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Failed to load skills:', error);
      if (error.response?.status === 403) {
        toast.error('Please log in to manage your skills');
      } else {
        toast.error('Failed to load available skills');
      }
      setAvailableSkills([]);
    }
  };

  const loadSkillCategories = async () => {
    try {
      const response = await workforceAPI.getSkillCategories();
      setSkillCategories(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Failed to load skill categories:', error);
      if (error.response?.status === 403) {
        // Don't show error for categories as it's less critical
        console.warn('Authentication required for skill categories');
      } else {
        toast.error('Failed to load skill categories');
      }
      setSkillCategories([]);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.skill) {
      toast.error('Please select a skill');
      return;
    }

    setLoading(true);
    try {
      const response = await workforceAPI.addUserSkill(profileId, newSkill);
      const addedSkill = response.data;
      setSkills(prev => [...prev, addedSkill]);
      setNewSkill({
        skill: '',
        proficiency_level: 'beginner',
        years_of_experience: 0,
        last_used: '',
        is_certified: false,
        certification_details: ''
      });
      setShowAddForm(false);
      onSkillsUpdate([...skills, addedSkill]);
      toast.success('Skill added successfully!');
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error('Failed to add skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSkill = async (skillId, updatedData) => {
    setLoading(true);
    try {
      const response = await workforceAPI.updateUserSkill(skillId, updatedData);
      const updatedSkill = response.data;
      setSkills(prev => prev.map(skill => 
        skill.id === skillId ? updatedSkill : skill
      ));
      setEditingSkill(null);
      onSkillsUpdate(skills.map(skill => 
        skill.id === skillId ? updatedSkill : skill
      ));
      toast.success('Skill updated successfully!');
    } catch (error) {
      console.error('Error updating skill:', error);
      toast.error('Failed to update skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!confirm('Are you sure you want to remove this skill?')) return;

    setLoading(true);
    try {
      await workforceAPI.deleteUserSkill(skillId);
      const updatedSkills = skills.filter(skill => skill.id !== skillId);
      setSkills(updatedSkills);
      onSkillsUpdate(updatedSkills);
      toast.success('Skill removed successfully!');
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error('Failed to remove skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProficiencyColor = (level) => {
    const proficiency = proficiencyLevels.find(p => p.value === level);
    return proficiency ? proficiency.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Skills & Expertise</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gold text-dark px-4 py-2 rounded-lg hover:bg-custom_yellow flex items-center"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </button>
      </div>

      {/* Add Skill Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Skill</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill *
              </label>
              {availableSkills.length > 0 ? (
                <select
                  value={newSkill.skill}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, skill: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30"
                  required
                >
                  <option value="">Select a skill...</option>
                  {availableSkills.map(skill => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name} {skill.category_name && `(${skill.category_name})`}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={newSkill.skill}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, skill: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30"
                  placeholder="Enter skill name manually..."
                  required
                />
              )}
              {availableSkills.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Unable to load skill list. Please enter skill name manually.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proficiency Level
              </label>
              <select
                value={newSkill.proficiency_level}
                onChange={(e) => setNewSkill(prev => ({ ...prev, proficiency_level: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30"
              >
                {proficiencyLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={newSkill.years_of_experience}
                onChange={(e) => setNewSkill(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Used
              </label>
              <input
                type="date"
                value={newSkill.last_used}
                onChange={(e) => setNewSkill(prev => ({ ...prev, last_used: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newSkill.is_certified}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, is_certified: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">I have certification for this skill</span>
              </label>
            </div>

            {newSkill.is_certified && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certification Details
                </label>
                <textarea
                  value={newSkill.certification_details}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, certification_details: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/30"
                  rows={3}
                  placeholder="Certification name, issuing organization, date, etc."
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 bg-gold text-dark rounded-lg hover:bg-custom_yellow flex items-center"
              disabled={loading}
            >
              {loading ? 'Adding...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Skill
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Skills List */}
      <div className="space-y-4">
        {skills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">No skills added yet</div>
            <div className="text-sm">Click "Add Skill" to get started</div>
          </div>
        ) : (
          skills.filter(skill => skill && skill.skill_name).map((skill) => (
            <div key={skill.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{skill.skill_name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(skill.proficiency_level)}`}>
                      {skill.proficiency_level}
                    </span>
                    {skill.is_certified && (
                      <Award className="w-4 h-4 text-yellow-500" title="Certified" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{skill.years_of_experience || 0} years experience</span>
                    {skill.last_used && (
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Last used: {new Date(skill.last_used).getFullYear()}
                      </span>
                    )}
                    {(skill.endorsement_count || 0) > 0 && (
                      <span>{skill.endorsement_count} endorsements</span>
                    )}
                  </div>

                  {skill.certification_details && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Certification:</strong> {skill.certification_details}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingSkill(skill.id)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit skill"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Remove skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SkillsManager;
