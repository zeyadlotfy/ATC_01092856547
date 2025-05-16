import { useState, useEffect } from 'react';

const PurpleDarkLoading = () => {
    const [rotation, setRotation] = useState(0);

    // Animate rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => (prev + 15) % 360);
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center justify-center">
            <div
                className="w-6 h-6 border-2 rounded-full border-t-transparent border-purple-600 animate-spin"
                style={{
                    borderTopColor: 'transparent',
                    borderRightColor: '#7e22ce', // purple-700
                    borderBottomColor: '#a855f7', // purple-500
                    borderLeftColor: '#581c87', // purple-900
                    transform: `rotate(${rotation}deg)`
                }}
            />
        </div>
    );
};

export default PurpleDarkLoading;
