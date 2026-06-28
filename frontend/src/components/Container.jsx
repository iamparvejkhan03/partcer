function Container({children, className}){
    return (
        <div className={`px-4 md:px-12 lg:px-20 xl:px-24 ${className}`}>
            {children}
        </div>
    );
}

export default Container;