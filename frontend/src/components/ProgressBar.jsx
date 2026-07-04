function ProgressBar({ total, approved }) {
    const progress = total > 0 ? (approved / total) * 100 : 0;

    return (
        <div className="relative flex items-center max-w-full w-full bg-gray-500/80 h-6 rounded-md">
            <div className="bg-green-600 h-6 rounded-md" style={{ width: `${progress}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-normal text-white">
                {approved} of {total} session completed
            </span>
        </div>
    );
};

export default ProgressBar;