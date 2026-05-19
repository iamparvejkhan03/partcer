import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { usePopUp } from "../contexts/PopUpContextProvider";
import axiosInstance from "../utils/axiosInstance";

function SearchFormPopUp({ closePopup }) {
    const searchForm = useForm({
        defaultValues: {
            search: '',
            type: 'Mentor',
        }
    });
    const navigate = useNavigate();
    const [type, setType] = useState(['Mentor', 'Project']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearchForm = (searchData) => {
        try {
            const params = new URLSearchParams();

            if (searchData.search) {
                params.append('search', searchData.search);
            }

            if (searchData.type) {
                if(searchData.type === 'Mentor') {
                    // params.append('type', 'freelancer');
                    navigate(`/freelancers?${params.toString()}`);
                } else if(searchData.type === 'Service') {
                    navigate(`/services?${params.toString()}`);
                } else if(searchData.type === 'Project') {
                    navigate(`/projects?${params.toString()}`);
                }
            }

            // Navigate to auctions page with query parameters
            // navigate(`/auctions?${params.toString()}`);
            closePopup('searchForm');
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className={`w-full min-h-screen h-full fixed inset-0 bg-black/70 z-40`}>
            <X onClick={() => closePopup('searchForm')} className="absolute top-1/4 right-5 text-white cursor-pointer" />
            <form onSubmit={searchForm.handleSubmit(handleSearchForm)} className="w-[80%] self-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white p-6 rounded-md grid grid-cols-1 sm:grid-cols-7 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 items-end max-w-2xl mx-auto">

                    {/* Search */}
                    <div className="text-gray-700 col-span-1 sm:col-span-3 lg:col-span-6">
                        <label htmlFor="search" className="block mb-1">Search</label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Search here..."
                            className="w-full bg-gray-100 text-black py-2.5 px-4 rounded-md focus:outline-2 focus:outline-primary"
                            {...searchForm.register('search', { required: false })}
                        />
                    </div>

                    <div className="text-gray-700 col-span-1 sm:col-span-2 lg:col-span-3">
                        <label htmlFor="type" className="block mb-1">Type</label>
                        <select
                            id="type"
                            className="w-full bg-gray-100 text-gray-600 py-2.5 px-4 rounded-md focus:outline-2 focus:outline-primary"
                            {...searchForm.register('type')}
                            disabled={loading}
                        >
                            <option value="">Select</option>
                            {loading ? (
                                <option value="" disabled>Loading type...</option>
                            ) : error ? (
                                <option value="" disabled>Error loading type</option>
                            ) : (
                                type
                                    .filter(type =>
                                        type?.toLowerCase() !== 'explore' &&
                                        !type.isExplore
                                    )
                                    .map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))
                            )}
                        </select>
                        {error && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-2 md:mt-0">
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center gap-2 py-2.5 px-3.5 rounded-md bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            <Search size={20} />
                            <span>{loading ? 'Loading...' : 'Search'}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default SearchFormPopUp;