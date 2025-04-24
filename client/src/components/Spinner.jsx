const Spinner = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80">
            <div className="relative">
                {/* Spinner backdrop */}
                <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
                
                {/* Spinner animated element */}
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
            </div>
        </div>
    );
}

export default Spinner;