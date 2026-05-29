import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, Search, Check } from "lucide-react";

const LanguagesSelect = ({ selectedLanguages, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [dropdownStyle, setDropdownStyle] = useState({});
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    const allLanguages = [
        // International
        "English", "Spanish", "French", "German", "Italian", "Portuguese",
        "Dutch", "Russian", "Japanese", "Korean", "Chinese", "Arabic",
        "Turkish", "Vietnamese", "Thai", "Greek", "Polish", "Swedish",
        "Norwegian", "Danish", "Finnish",
        // Indian languages
        "Hindi", "Bengali", "Urdu", "Tamil", "Telugu", "Marathi",
        "Gujarati", "Kannada", "Malayalam", "Punjabi", "Odia", "Assamese"
    ];

    const filteredLanguages = allLanguages.filter(lang =>
        lang.toLowerCase().includes(search.toLowerCase())
    );

    const toggleLanguage = (language) => {
        if (selectedLanguages.includes(language)) {
            onChange(selectedLanguages.filter(l => l !== language));
        } else {
            onChange([...selectedLanguages, language]);
        }
    };

    // Calculate dropdown position from the trigger button
    const openDropdown = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = 280; // approximate max height

            // If not enough space below, open upward
            if (spaceBelow < dropdownHeight) {
                setDropdownStyle({
                    position: "fixed",
                    bottom: window.innerHeight - rect.top + 4,
                    left: rect.left,
                    width: rect.width,
                    zIndex: 9999,
                });
            } else {
                setDropdownStyle({
                    position: "fixed",
                    top: rect.bottom + 4,
                    left: rect.left,
                    width: rect.width,
                    zIndex: 9999,
                });
            }
        }
        setIsOpen(true);
    };

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)
            ) {
                setIsOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Reposition on scroll/resize while open
    useEffect(() => {
        if (!isOpen) return;
        const handleReposition = () => {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const dropdownHeight = 280;
                if (spaceBelow < dropdownHeight) {
                    setDropdownStyle(prev => ({
                        ...prev,
                        bottom: window.innerHeight - rect.top + 4,
                        left: rect.left,
                        width: rect.width,
                        top: undefined,
                    }));
                } else {
                    setDropdownStyle(prev => ({
                        ...prev,
                        top: rect.bottom + 4,
                        left: rect.left,
                        width: rect.width,
                        bottom: undefined,
                    }));
                }
            }
        };
        window.addEventListener("scroll", handleReposition, true);
        window.addEventListener("resize", handleReposition);
        return () => {
            window.removeEventListener("scroll", handleReposition, true);
            window.removeEventListener("resize", handleReposition);
        };
    }, [isOpen]);

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages I Speak
            </label>

            {/* Selected language tags */}
            {selectedLanguages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedLanguages.map((lang, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                            <span>{lang}</span>
                            <button
                                type="button"
                                onClick={() => toggleLanguage(lang)}
                                className="text-blue-600 hover:text-blue-900 ml-1"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Trigger button */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => isOpen ? setIsOpen(false) : openDropdown()}
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex justify-between items-center transition-colors"
            >
                <span className="text-gray-500 text-sm">
                    {selectedLanguages.length === 0
                        ? "Select languages..."
                        : `${selectedLanguages.length} language${selectedLanguages.length > 1 ? "s" : ""} selected`}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Portal dropdown — renders at document.body, above all overflow constraints */}
            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={dropdownStyle}
                    className="bg-white border border-gray-200 rounded-lg shadow-xl"
                >
                    {/* Search */}
                    <div className="p-2 border-b border-gray-100 bg-white rounded-t-lg">
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search languages..."
                                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Language list */}
                    <div className="overflow-y-auto" style={{ maxHeight: "220px" }}>
                        {filteredLanguages.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-gray-500 text-center">
                                No languages found
                            </div>
                        ) : (
                            filteredLanguages.map((lang, index) => {
                                const isSelected = selectedLanguages.includes(lang);
                                return (
                                    <div
                                        key={index}
                                        className={`px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors ${isSelected
                                                ? "bg-blue-50 text-blue-800"
                                                : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // prevent blur before click registers
                                            toggleLanguage(lang);
                                        }}
                                    >
                                        <span>{lang}</span>
                                        {isSelected && (
                                            <Check size={15} className="text-primary flex-shrink-0" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default LanguagesSelect;