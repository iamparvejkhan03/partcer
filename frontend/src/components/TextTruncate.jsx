import { useState } from 'react';

const TextTruncate = ({ text, maxLength = 200, className = '' }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) return null;

    const shouldTruncate = text.length > maxLength;
    const displayText = shouldTruncate && !isExpanded
        ? text.slice(0, maxLength) + '...'
        : text;

    return (
        <div className={className}>
            {displayText}
            {shouldTruncate && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="ml-2 text-primary hover:text-primary-dark font-medium focus:outline-none"
                >
                    {isExpanded ? 'Show Less' : 'Read More'}
                </button>
            )}
        </div>
    );
};

export default TextTruncate;