import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">
            <Link to="/" className="hover:text-brand-deep transition-colors flex items-center gap-1">
                <Home size={10} />
                <span>Home</span>
            </Link>
            {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                return (
                    <div key={name} className="flex items-center gap-2">
                        <ChevronRight size={10} />
                        {isLast ? (
                            <span className="text-brand-deep">{name}</span>
                        ) : (
                            <Link to={routeTo} className="hover:text-brand-deep transition-colors">
                                {name}
                            </Link>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Breadcrumbs;
