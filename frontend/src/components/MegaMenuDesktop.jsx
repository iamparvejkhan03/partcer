import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { FolderTree } from 'lucide-react';

const Category = ({ category, type }) => {
    return (
        <div>
            <div className="mb-3 flex items-center gap-3 font-medium text-gray-900">
                <FolderTree size={34} className="text-primary bg-primary/20 p-2 rounded-lg" />
                <Link
                    to={type === 'services'
                        ? `/services?category=${category.slug}`
                        : `/projects?category=${encodeURIComponent(category.name)}`
                    }
                >
                    {category.name}
                </Link>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
                {category.subcategories?.map(sub => (
                    <li key={sub._id} className="hover:text-black cursor-pointer">
                        <Link
                            to={type === 'services'
                                ? `/services?category=${category.slug}&subcategory=${sub.slug}`
                                : `/projects?category=${encodeURIComponent(category.name)}&subCategory=${encodeURIComponent(sub.name)}`
                            }
                        >
                            {sub.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const Section = ({ title, categories, viewAllLink, type }) => (
    <div>
        <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <Link
                to={viewAllLink}
                className="rounded-full bg-gray-100 px-4 py-1.5 text-sm hover:bg-gray-200 transition-colors"
            >
                View All
            </Link>
        </div>

        <div className="grid grid-cols-3 gap-8">
            {categories.map(cat => (
                <Category key={cat._id} category={cat} type={type} />
            ))}
        </div>
    </div>
);

const MegaMenuDesktop = () => {
    const [parentCategories, setParentCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                // Fetch all active parent categories
                const response = await axiosInstance.get('/api/v1/categories/public/parents');

                if (response.data.success) {
                    const parents = response.data.data;

                    // For each parent, fetch its subcategories
                    const categoriesWithSubs = await Promise.all(
                        parents.map(async (parent) => {
                            try {
                                const subResponse = await axiosInstance.get(
                                    `/api/v1/categories/public/${parent.slug}/children`
                                );
                                return {
                                    ...parent,
                                    subcategories: subResponse.data.success
                                        ? subResponse.data.data.subcategories
                                        : []
                                };
                            } catch (error) {
                                console.error(`Error fetching subcategories for ${parent.name}:`, error);
                                return { ...parent, subcategories: [] };
                            }
                        })
                    );

                    setParentCategories(categoriesWithSubs);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="w-[920px] rounded-2xl bg-white p-8 shadow-2xl">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    // Split categories into two groups for display
    const firstRow = parentCategories;
    const secondRow = parentCategories;

    return (
        <div className="w-[920px] max-h-[90vh] overflow-y-scroll rounded-2xl bg-white p-8 shadow-2xl">
            {/* Services Section - First Row */}
            {/* {firstRow.length > 0 && (
                <Section
                    title="Explore services by categories"
                    categories={firstRow}
                    viewAllLink="/services"
                    type="services"
                />
            )}

            {firstRow.length > 0 && secondRow.length > 0 && <hr className="my-8" />} */}

            {/* Projects Section - Second Row */}
            {secondRow.length > 0 && (
                <Section
                    title="Explore projects by categories"
                    categories={secondRow}
                    viewAllLink="/projects"
                    type="projects"
                />
            )}
        </div>
    );
};

export default MegaMenuDesktop;