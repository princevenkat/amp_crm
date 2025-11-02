import React from "react";
import { Link } from "react-router-dom";

export const NotFoundView: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-6">
            <img
                src="/logo.png"
                alt="Advance Mortgages & Protection Logo"
                className="h-24 mb-6 object-contain"
            />
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <p className="text-lg text-text-secondary mb-6">
                Oops! The page you’re looking for doesn’t exist or has been moved.
            </p>
            <Link
                to="/"
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-secondary transition"
            >
                Go Home
            </Link>
        </div>
    );
};
