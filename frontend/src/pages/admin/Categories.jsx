import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronRight,
    FolderTree,
    Image as ImageIcon,
    Upload,
    X,
    Save,
    Tag,
    AlertCircle,
    RefreshCw,
    MoreVertical
} from "lucide-react";
import { AdminSidebar, AdminHeader, AdminContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState([]);
    const [parentCategories, setParentCategories] = useState([]);

    // React Hook Form
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            parentCategory: '',
            isActive: true,
            order: 0
        }
    });

    // Watch form values
    const watchIsActive = watch('isActive');

    // Filters
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        level: "all"
    });

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoading(true);

            // Build query params
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.status !== 'all') params.append('status', filters.status);
            if (filters.level !== 'all') params.append('level', filters.level);

            const response = await axiosInstance.get(`/api/v1/admin/categories?${params.toString()}`);

            if (response.data.success) {
                setCategories(response.data.data);
                setFilteredCategories(response.data.data);
            }

            // Fetch parent categories for dropdown
            const parentsResponse = await axiosInstance.get('/api/v1/admin/categories/parents');
            if (parentsResponse.data.success) {
                setParentCategories(parentsResponse.data.data);
            }

        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error(error.response?.data?.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [filters.search, filters.status, filters.level]);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            search: "",
            status: "all",
            level: "all"
        });
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            setImageFile(file);
        }
    };

    // Remove image
    const removeImage = () => {
        setImagePreview(null);
        setImageFile(null);
    };

    // Handle form submit
    // Handle form submit
    const onSubmit = async (data) => {
        if (!data.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        try {
            setUploading(true);

            const formDataToSend = new FormData();
            formDataToSend.append('name', data.name.trim());
            if (data.parentCategory) {
                formDataToSend.append('parentCategory', data.parentCategory);
            }
            formDataToSend.append('isActive', data.isActive);
            formDataToSend.append('order', data.order || 0);

            if (imageFile) {
                formDataToSend.append('categoryImage', imageFile);
            }

            if (editingCategory) {
                // Update existing category
                const response = await axiosInstance.put(
                    `/api/v1/admin/categories/${editingCategory._id}`,
                    formDataToSend,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                );

                if (response.data.success) {
                    toast.success('Category updated successfully');

                    // Update categories list
                    const updatedCategories = categories.map(cat =>
                        cat._id === editingCategory._id ? response.data.data : cat
                    );
                    setCategories(updatedCategories);
                    setFilteredCategories(updatedCategories); // Update filtered categories too

                    // Update parent categories list if this is a parent category
                    if (!response.data.data.parentCategory) {
                        setParentCategories(prevParents =>
                            prevParents.map(p => p._id === response.data.data._id ? response.data.data : p)
                        );
                    }
                }
            } else {
                // Create new category
                const response = await axiosInstance.post('/api/v1/admin/categories', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data.success) {
                    toast.success('Category created successfully');

                    // Add new category to both states
                    const newCategory = response.data.data;
                    const updatedCategories = [...categories, newCategory];
                    setCategories(updatedCategories);
                    setFilteredCategories(updatedCategories); // Update filtered categories too

                    // If this is a parent category, add to parentCategories list
                    if (!newCategory.parentCategory) {
                        setParentCategories(prevParents => [...prevParents, newCategory]);
                    } else {
                        // If it's a subcategory, we should also refresh parent categories
                        // to get updated parent info if needed
                        const parentsResponse = await axiosInstance.get('/api/v1/admin/categories/parents');
                        if (parentsResponse.data.success) {
                            setParentCategories(parentsResponse.data.data);
                        }
                    }
                }
            }

            resetForm();

        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(error.response?.data?.message || 'Failed to save category');
        } finally {
            setUploading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        reset({
            name: '',
            parentCategory: '',
            isActive: true,
            order: 0
        });
        setImagePreview(null);
        setImageFile(null);
        setEditingCategory(null);
        setShowForm(false);
    };

    // Edit category
    const handleEdit = (category) => {
        setValue('name', category.name);
        setValue('parentCategory', category.parentCategory?._id || category.parentCategory || "");
        setValue('isActive', category.isActive);
        setValue('order', category.order || 0);

        if (category.image?.url) {
            setImagePreview(category.image.url);
        }

        setEditingCategory(category);
        setShowForm(true);
    };

    // Toggle category status
    const toggleStatus = async (category) => {
        try {
            const response = await axiosInstance.patch(`/api/v1/admin/categories/${category._id}/toggle-status`);

            if (response.data.success) {
                // Update both categories and filteredCategories states
                const updatedCategories = categories.map(cat =>
                    cat._id === category._id ? response.data.data : cat
                );
                setCategories(updatedCategories);
                setFilteredCategories(updatedCategories); // Update filtered categories too

                // Update parent categories if needed
                if (!category.parentCategory) {
                    setParentCategories(prevParents =>
                        prevParents.map(p => p._id === category._id ? response.data.data : p)
                    );
                }

                toast.success(`Category ${response.data.data.isActive ? 'activated' : 'deactivated'}`);
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error(error.response?.data?.message || 'Failed to update category status');
        }
    };

    // Delete category
    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            const response = await axiosInstance.delete(`/api/v1/admin/categories/${categoryToDelete._id}`);

            if (response.data.success) {
                // Update both categories and filteredCategories states
                const updatedCategories = categories.filter(cat => cat._id !== categoryToDelete._id);
                setCategories(updatedCategories);
                setFilteredCategories(updatedCategories); // Update filtered categories too

                // Remove from parent categories if needed
                if (!categoryToDelete.parentCategory) {
                    setParentCategories(prevParents =>
                        prevParents.filter(p => p._id !== categoryToDelete._id)
                    );
                } else {
                    // If it's a subcategory, refresh parent categories to update any counts
                    const parentsResponse = await axiosInstance.get('/api/v1/admin/categories/parents');
                    if (parentsResponse.data.success) {
                        setParentCategories(parentsResponse.data.data);
                    }
                }

                toast.success('Category deleted successfully');
            }

            setShowDeleteModal(false);
            setCategoryToDelete(null);

        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error(error.response?.data?.message || 'Failed to delete category');
            setShowDeleteModal(false);
            setCategoryToDelete(null);
        }
    };

    // Toggle category expansion
    const toggleExpand = (categoryId) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    // Get child categories
    const getChildCategories = (parentId) => {
        return categories
            .filter(cat => cat.parentCategory?._id === parentId || cat.parentCategory === parentId)
            .sort((a, b) => {
                const orderA = a.order || 0;
                const orderB = b.order || 0;
                return orderA - orderB;
            });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading && categories.length === 0) {
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
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Categories Management</h1>
                            <p className="text-gray-600 mt-1">Create and manage parent categories and subcategories</p>
                        </div>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <button
                                onClick={() => fetchCategories()}
                                className="p-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw size={18} className="text-gray-600" />
                            </button>
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Plus size={18} />
                                Add Category
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search categories..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
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
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-500">
                                Showing {filteredCategories.length} categories
                            </div>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-primary hover:text-primary-dark font-medium"
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>

                    {/* Categories Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                            <FolderTree size={16} />
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Image
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Level
                                        </th>
                                        {/* <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order
                                        </th> */}
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mentors
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredCategories
                                        .filter(cat => !cat.parentCategory)
                                        .map((category) => (
                                            <CategoryRow
                                                key={category._id}
                                                category={category}
                                                categories={categories}
                                                expandedCategories={expandedCategories}
                                                toggleExpand={toggleExpand}
                                                handleEdit={handleEdit}
                                                toggleStatus={toggleStatus}
                                                setCategoryToDelete={setCategoryToDelete}
                                                setShowDeleteModal={setShowDeleteModal}
                                                getChildCategories={getChildCategories}
                                                formatDate={formatDate}
                                            />
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredCategories.length === 0 && (
                            <div className="text-center py-12">
                                <Tag size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No categories found</h3>
                                <p className="text-gray-500 mb-6">
                                    {filters.search || filters.status !== "all" || filters.level !== "all"
                                        ? "No categories match your current filters"
                                        : "Get started by creating your first category"}
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Plus size={18} />
                                    Create Category
                                </button>
                            </div>
                        )}
                    </div>
                </AdminContainer>
            </div>

            {/* Category Form Modal */}
            {showForm && (
                <CategoryFormModal
                    register={register}
                    handleSubmit={handleSubmit}
                    onSubmit={onSubmit}
                    errors={errors}
                    watchIsActive={watchIsActive}
                    setValue={setValue}
                    editingCategory={editingCategory}
                    parentCategories={parentCategories}
                    imagePreview={imagePreview}
                    handleImageUpload={handleImageUpload}
                    removeImage={removeImage}
                    resetForm={resetForm}
                    uploading={uploading}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && categoryToDelete && (
                <DeleteConfirmationModal
                    category={categoryToDelete}
                    onConfirm={handleDelete}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setCategoryToDelete(null);
                    }}
                />
            )}
        </section>
    );
};

// Category Row Component with Subcategories
const CategoryRow = ({
    category,
    categories,
    expandedCategories,
    toggleExpand,
    handleEdit,
    toggleStatus,
    setCategoryToDelete,
    setShowDeleteModal,
    getChildCategories,
    level = 0,
    formatDate
}) => {
    const children = getChildCategories(category._id);
    const isExpanded = expandedCategories.includes(category._id);
    const hasChildren = children.length > 0;

    return (
        <>
            <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                    <button
                        onClick={() => toggleExpand(category._id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        disabled={!hasChildren}
                    >
                        {hasChildren ? (
                            isExpanded ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />
                        ) : (
                            <div className="w-4" />
                        )}
                    </button>
                </td>
                <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                        {category.image?.url ? (
                            <img
                                src={category.image.url}
                                alt={category.name}
                                className="h-10 w-14 rounded-lg object-cover border border-gray-200"
                            />
                        ) : (
                            <div className="h-10 w-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                        )}
                    </div>
                </td>
                <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">
                        {level > 0 && (
                            <span className="inline-block w-4 mr-2 text-gray-400">↳</span>
                        )}
                        {category.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Slug: {category.slug}
                    </div>
                </td>
                <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${category.level === 0
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                        {category.level === 0 ? 'Parent' : 'Subcategory'}
                    </span>
                </td>
                {/* <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">
                        {category.order || 0}
                    </div>
                </td> */}
                <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">
                        {category.freelancerCount || 0}
                    </div>
                </td>
                <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${category.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {category.isActive ? (
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
                            onClick={() => handleEdit(category)}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit Category"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => toggleStatus(category)}
                            className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                            title={category.isActive ? 'Deactivate' : 'Activate'}
                        >
                            {category.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                            onClick={() => {
                                setCategoryToDelete(category);
                                setShowDeleteModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Category"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </td>
            </tr>
            {isExpanded && hasChildren && (
                <>
                    {children
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map(child => (
                            <CategoryRow
                                key={child._id}
                                category={child}
                                categories={categories}
                                expandedCategories={expandedCategories}
                                toggleExpand={toggleExpand}
                                handleEdit={handleEdit}
                                toggleStatus={toggleStatus}
                                setCategoryToDelete={setCategoryToDelete}
                                setShowDeleteModal={setShowDeleteModal}
                                getChildCategories={getChildCategories}
                                level={level + 1}
                                formatDate={formatDate}
                            />
                        ))}
                </>
            )}
        </>
    );
};

// Category Form Modal Component with React Hook Form
const CategoryFormModal = ({
    register,
    handleSubmit,
    onSubmit,
    errors,
    watchIsActive,
    setValue,
    editingCategory,
    parentCategories,
    imagePreview,
    handleImageUpload,
    removeImage,
    resetForm,
    uploading
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl my-8">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {editingCategory ? 'Edit Category' : 'Create New Category'}
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
                    {/* Category Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('name', {
                                required: 'Category name is required',
                                minLength: {
                                    value: 2,
                                    message: 'Category name must be at least 2 characters'
                                }
                            })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="e.g., Web Development, Graphic Design"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Parent Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Parent Category
                        </label>
                        <select
                            {...register('parentCategory')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">-- None (Parent Category) --</option>
                            {parentCategories
                                .filter(cat => !editingCategory || cat._id !== editingCategory._id)
                                .map(cat => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Select a parent to create a subcategory
                        </p>
                    </div>

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
                            Active Category
                        </label>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Image
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                            <input
                                type="file"
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    {imagePreview ? (
                                        <>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-32 w-full rounded-lg object-cover border border-gray-200"
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="text-sm text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        document.getElementById('image-upload').click();
                                                    }}
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    Change Image
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    Click to upload image
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Recommended: 800×400px JPG/PNG (Max 5MB)
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={uploading}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {editingCategory ? 'Update Category' : 'Create Category'}
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
const DeleteConfirmationModal = ({ category, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 mb-2">
                        Are you sure you want to delete the category <strong>"{category.name}"</strong>?
                    </p>
                    {category.level === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                            <p className="text-sm text-yellow-700">
                                <strong>Note:</strong> This is a parent category. All subcategories will become parent categories.
                            </p>
                        </div>
                    )}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-red-700">
                            <strong>Warning:</strong> This action cannot be undone.
                        </p>
                    </div>

                    {category.serviceCount > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                            <p className="text-sm text-yellow-700">
                                <strong>Note:</strong> This category has {category.serviceCount} services. They will need to be reassigned.
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
                        Delete Category
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Categories;