import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstanceOld';
import { FolderTree } from 'lucide-react';

const MobileCategory = ({ category, type }) => (
    <div className="space-y-2">
        <div className="flex items-center gap-3 font-medium text-gray-700">
            <FolderTree size={32} className="text-primary bg-primary/20 p-2 rounded-lg flex-shrink-0" />
            <Link
                to={type === 'services'
                    ? `/services?category=${category.slug}`
                    : `/projects?category=${encodeURIComponent(category.name)}`
                }
                className="hover:text-primary transition-colors"
            >
                {category.name}
            </Link>
        </div>
        <ul className="ml-10 space-y-2.5 text-gray-500 text-[15px]">
            {category.subcategories?.map(sub => (
                <li key={sub._id}>
                    <Link
                        to={type === 'services'
                            ? `/services?category=${category.slug}&subcategory=${sub.slug}`
                            : `/projects?category=${encodeURIComponent(category.name)}&subCategory=${encodeURIComponent(sub.name)}`
                        }
                        className="hover:text-primary transition-colors"
                    >
                        {sub.name}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
);

const MegaMenuMobile = () => {
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
            <div className="space-y-8">
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
        <div className="space-y-8">
            {/* Services Section - First Row */}
            {/* {firstRow.length > 0 && (
                <div>
                    <h4 className="font-medium text-lg mb-4">Explore services by categories</h4>
                    <div className="space-y-6">
                        {firstRow.map(cat => (
                            <MobileCategory key={cat._id} category={cat} type="services" />
                        ))}
                    </div>
                </div>
            )} */}

            {/* Projects Section - Second Row */}
            {secondRow.length > 0 && (
                <div>
                    <h4 className="font-medium text-lg mb-4">Explore projects by categories</h4>
                    <div className="space-y-6">
                        {secondRow.map(cat => (
                            <MobileCategory key={cat._id} category={cat} type="projects" />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MegaMenuMobile;