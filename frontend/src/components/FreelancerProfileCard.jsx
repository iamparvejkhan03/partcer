import { Link } from 'react-router-dom';
import {  ChevronRight, Star } from 'lucide-react';
import { dummyUserImg } from '../assets';

const FreelancerProfileCard = ({ freelancer }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col items-start gap-5">
                    <div>
                        <div className='flex items-center justify-center gap-5'>
                            <img src={freelancer.profileImage || dummyUserImg} loading='lazy' alt="user image" className='h-14 w-14 object-cover rounded-full' />
                            <div>
                                <h2 className="text-lg font-semibold leading-tight text-gray-900"><Link to={`/freelancer/${freelancer?._id}`}>{freelancer?.displayName || `${freelancer?.firstName} ${freelancer?.lastName}`}</Link></h2>
                                {/* <div className="flex items-center gap-1 mt-1 text-gray-600">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span className="text-sm">{freelancer?.country}</span>
                                </div> */}
                                <div className="flex items-center justify-start gap-1 mt-2">
                                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">{freelancer.rating?.toFixed(1) || "0.0"}</span>
                                    <span className="text-gray-500">({freelancer.reviewCount || 0} reviews)</span>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* Bio Section */}
            <div className="px-6 border-b border-gray-100">
                <p className="text-gray-600 text-sm leading-relaxed">
                    {freelancer.bio?.length > 100
                        ? `${freelancer.bio.slice(0, 100)}...`
                        : freelancer.bio}{' '}

                    {freelancer.bio?.length > 100 && (
                        <Link
                            to={`/freelancer/${freelancer._id}`}
                            className="text-primary font-medium hover:text-primary/80 inline-flex items-center gap-1"
                        >
                            View more
                            <ChevronRight size={14} />
                        </Link>
                    )}
                </p>
            </div>

            {/* Skills Section */}
            <div className="p-6 border-b border-gray-100 flex-grow">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                    {freelancer.skills.map((skill, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                            {skill}
                        </span>
                    ))}
                    <Link to={`/freelancer/${freelancer._id}`} className="text-gray-600 hover:text-primary text-sm font-medium inline-flex items-center gap-1">
                        View more
                        <ChevronRight size={14} />
                    </Link>
                </div>
            </div>

            <div className="p-6 mt-auto">
                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Link
                        to={`/freelancer/${freelancer?._id}`}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
                    >
                        View Profile
                    </Link>
                    {/* <button className='p-3 rounded-lg cursor-pointer transition-all relative bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'><Heart /></button> */}
                </div>
            </div>
        </div>
    );
};

export default FreelancerProfileCard;