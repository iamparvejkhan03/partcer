// pages/admin/Skills.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronRight,
    Tag,
    Save,
    X,
    RefreshCw,
    AlertCircle,
    Filter,
    Layers
} from "lucide-react";
import { AdminSidebar, AdminHeader, AdminContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

const Skills = () => {
    const [skills, setSkills] = useState([]);
    const [filteredSkills, setFilteredSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [skillToDelete, setSkillToDelete] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [expandedSkills, setExpandedSkills] = useState([]);

    // React Hook Form
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            categories: [],
            isActive: true,
        }
    });

    // Watch form values
    const watchIsActive = watch('isActive');

    // Filters
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        category: ""
    });

    // Fetch skills
    const fetchSkills = async () => {
        try {
            setLoading(true);

            // Build query params
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.status !== 'all') params.append('status', filters.status);
            if (filters.category) params.append('category', filters.category);

            const response = await axiosInstance.get(`/api/v1/admin/skills?${params.toString()}`);

            if (response.data.success) {
                setSkills(response.data.data);
                setFilteredSkills(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching skills:', error);
            toast.error(error.response?.data?.message || 'Failed to load skills');
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories for dropdown
    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/admin/categories/parents');
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchSkills();
        fetchCategories();
    }, [filters.search, filters.status, filters.category]);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            search: "",
            status: "all",
            category: ""
        });
    };

    // Handle form submit
    const onSubmit = async (data) => {
        if (!data.name.trim()) {
            toast.error('Skill name is required');
            return;
        }

        try {
            setLoading(true);

            const skillData = {
                name: data.name.trim(),
                categories: selectedCategories.map(cat => cat.value),
                isActive: data.isActive,
                order: data.order || 0
            };

            if (editingSkill) {
                // Update existing skill
                const response = await axiosInstance.put(
                    `/api/v1/admin/skills/${editingSkill._id}`,
                    skillData
                );

                if (response.data.success) {
                    toast.success('Skill updated successfully');

                    // Update skills list
                    const updatedSkills = skills.map(skill =>
                        skill._id === editingSkill._id ? response.data.data : skill
                    );
                    setSkills(updatedSkills);
                    setFilteredSkills(updatedSkills);
                }
            } else {
                // Create new skill
                const response = await axiosInstance.post('/api/v1/admin/skills', skillData);

                if (response.data.success) {
                    toast.success('Skill created successfully');

                    // Add new skill to both states
                    const newSkill = response.data.data;
                    const updatedSkills = [...skills, newSkill];
                    setSkills(updatedSkills);
                    setFilteredSkills(updatedSkills);
                }
            }

            resetForm();

        } catch (error) {
            console.error('Error saving skill:', error);
            toast.error(error.response?.data?.message || 'Failed to save skill');
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        reset({
            name: '',
            isActive: true,
            order: 0
        });
        setSelectedCategories([]);
        setEditingSkill(null);
        setShowForm(false);
    };

    // Edit skill
    const handleEdit = (skill) => {
        setValue('name', skill.name);
        setValue('isActive', skill.isActive);
        setValue('order', skill.order || 0);

        // Set selected categories
        const categoryOptions = skill.categories?.map(cat => ({
            value: cat._id,
            label: cat.name
        })) || [];
        setSelectedCategories(categoryOptions);

        setEditingSkill(skill);
        setShowForm(true);
    };

    // Toggle skill status
    const toggleStatus = async (skill) => {
        try {
            const response = await axiosInstance.patch(`/api/v1/admin/skills/${skill._id}/toggle-status`);

            if (response.data.success) {
                // Update both skills and filteredSkills states
                const updatedSkills = skills.map(s =>
                    s._id === skill._id ? response.data.data : s
                );
                setSkills(updatedSkills);
                setFilteredSkills(updatedSkills);

                toast.success(`Skill ${response.data.data.isActive ? 'activated' : 'deactivated'}`);
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error(error.response?.data?.message || 'Failed to update skill status');
        }
    };

    // Delete skill
    const handleDelete = async () => {
        if (!skillToDelete) return;

        try {
            const response = await axiosInstance.delete(`/api/v1/admin/skills/${skillToDelete._id}`);

            if (response.data.success) {
                // Update both skills and filteredSkills states
                const updatedSkills = skills.filter(s => s._id !== skillToDelete._id);
                setSkills(updatedSkills);
                setFilteredSkills(updatedSkills);

                toast.success('Skill deleted successfully');
            }

            setShowDeleteModal(false);
            setSkillToDelete(null);

        } catch (error) {
            console.error('Error deleting skill:', error);
            toast.error(error.response?.data?.message || 'Failed to delete skill');
            setShowDeleteModal(false);
            setSkillToDelete(null);
        }
    };

    // Toggle skill expansion
    const toggleExpand = (skillId) => {
        setExpandedSkills(prev =>
            prev.includes(skillId)
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId]
        );
    };

    // Get unique categories for grouping
    const getCategoryGroups = () => {
        const groups = {};
        skills.forEach(skill => {
            skill.categories?.forEach(cat => {
                if (!groups[cat._id]) {
                    groups[cat._id] = {
                        id: cat._id,
                        name: cat.name,
                        skills: []
                    };
                }
                groups[cat._id].skills.push(skill);
            });
        });
        return Object.values(groups);
    };

    // Category options for react-select
    const categoryOptions = categories.map(cat => ({
        value: cat._id,
        label: cat.name
    }));

    if (loading && skills.length === 0) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    </AdminContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Skills Management</h1>
                            <p className="text-gray-600 mt-1">Create and manage skills for services</p>
                        </div>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Plus size={18} />
                                Add Skill
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="md:col-span-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search skills..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className='col-span-1'>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Category Filter */}
                            {/* <div>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div> */}
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-500">
                                Showing {filteredSkills.length} skills
                            </div>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-primary hover:text-primary-dark font-medium"
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>

                    {/* Skills Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                            <Layers size={16} />
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Skill Name
                                        </th>
                                        {/* <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Categories
                                        </th> */}
                                        {/* <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order
                                        </th> */}
                                        {/* <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Services
                                        </th> */}
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredSkills.map((skill) => (
                                        <tr key={skill._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <button
                                                    onClick={() => toggleExpand(skill._id)}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    {expandedSkills.includes(skill._id) ? (
                                                        <ChevronDown size={16} className="text-gray-500" />
                                                    ) : (
                                                        <ChevronRight size={16} className="text-gray-500" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-900">{skill.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Slug: {skill.slug}
                                                </div>
                                            </td>
                                            {/* <td className="py-4 px-6">
                                                <div className="flex flex-wrap gap-1">
                                                    {skill.categories?.map((cat, index) => (
                                                        <span
                                                            key={cat?._id || `cat-${index}`} // Add fallback key
                                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                        >
                                                            {cat?.name || 'Unknown Category'}
                                                        </span>
                                                    ))}
                                                    {(!skill.categories || skill.categories.length === 0) && (
                                                        <span className="text-xs text-gray-400">No categories</span>
                                                    )}
                                                </div>
                                            </td> */}
                                            {/* <td className="py-4 px-6">
                                                <div className="text-sm text-gray-600">
                                                    {skill.order || 0}
                                                </div>
                                            </td> */}
                                            {/* <td className="py-4 px-6">
                                                <div className="text-sm text-gray-600">
                                                    {skill.serviceCount || 0}
                                                </div>
                                            </td> */}
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${skill.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {skill.isActive ? (
                                                        <>
                                                            <Eye size={12} />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff size={12} />
                                                            Inactive
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(skill)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                                        title="Edit Skill"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(skill)}
                                                        className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                                                        title={skill.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {skill.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSkillToDelete(skill);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                        title="Delete Skill"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredSkills.length === 0 && (
                            <div className="text-center py-12">
                                <Tag size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No skills found</h3>
                                <p className="text-gray-500 mb-6">
                                    {filters.search || filters.status !== "all" || filters.category
                                        ? "No skills match your current filters"
                                        : "Get started by creating your first skill"}
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Plus size={18} />
                                    Create Skill
                                </button>
                            </div>
                        )}
                    </div>
                </AdminContainer>
            </div>

            {/* Skill Form Modal */}
            {showForm && (
                <SkillFormModal
                    register={register}
                    handleSubmit={handleSubmit}
                    onSubmit={onSubmit}
                    errors={errors}
                    watchIsActive={watchIsActive}
                    editingSkill={editingSkill}
                    categoryOptions={categoryOptions}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    resetForm={resetForm}
                    loading={loading}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && skillToDelete && (
                <DeleteConfirmationModal
                    skill={skillToDelete}
                    onConfirm={handleDelete}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setSkillToDelete(null);
                    }}
                />
            )}
        </section>
    );
};

// Skill Form Modal Component
const SkillFormModal = ({
    register,
    handleSubmit,
    onSubmit,
    errors,
    watchIsActive,
    editingSkill,
    categoryOptions,
    selectedCategories,
    setSelectedCategories,
    resetForm,
    loading
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl my-8">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {editingSkill ? 'Edit Skill' : 'Create New Skill'}
                        </h3>
                        <button
                            onClick={resetForm}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Skill Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Skill Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('name', {
                                required: 'Skill name is required',
                                minLength: {
                                    value: 2,
                                    message: 'Skill name must be at least 2 characters'
                                }
                            })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="e.g., JavaScript, Photoshop, SEO"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Categories */}
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categories
                        </label>
                        <select
                            multiple
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={selectedCategories.map(cat => cat.value)}
                            onChange={(e) => {
                                const selectedOptions = Array.from(e.target.selectedOptions).map(
                                    option => ({
                                        value: option.value,
                                        label: option.text
                                    })
                                );
                                setSelectedCategories(selectedOptions);
                            }}
                            size="5"
                        >
                            {categoryOptions.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Hold Ctrl (Windows) or Cmd (Mac) to select multiple categories
                        </p>
                    </div> */}

                    {/* Display Order */}
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Display Order
                        </label>
                        <input
                            type="number"
                            {...register('order', {
                                valueAsNumber: true,
                                min: {
                                    value: 0,
                                    message: 'Order must be a positive number'
                                }
                            })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.order ? 'border-red-500' : 'border-gray-300'
                                }`}
                            min="0"
                        />
                        {errors.order && (
                            <p className="mt-1 text-sm text-red-600">{errors.order.message}</p>
                        )}
                    </div> */}

                    {/* Status */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            {...register('isActive')}
                            className="h-4 w-4 text-primary rounded focus:ring-primary"
                        />
                        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                            Active Skill
                        </label>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {editingSkill ? 'Update Skill' : 'Create Skill'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ skill, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Delete Skill</h3>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 mb-2">
                        Are you sure you want to delete the skill <strong>"{skill.name}"</strong>?
                    </p>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-red-700">
                            <strong>Warning:</strong> This action cannot be undone.
                        </p>
                    </div>

                    {skill.serviceCount > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                            <p className="text-sm text-yellow-700">
                                <strong>Note:</strong> This skill is used by {skill.serviceCount} services. They will need to be updated.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} />
                        Delete Skill
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Skills;