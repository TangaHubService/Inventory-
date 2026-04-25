import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Receipt, Package, GitBranch, X, Zap } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const QuickActionsFab = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const quickActions = [
        { id: 'pos', name: t('nav.pos') || 'New Sale', icon: ShoppingCart, href: '/dashboard/pos', color: 'bg-blue-600' },
        { id: 'sale', name: t('nav.sales') || 'Sales', icon: Receipt, href: '/dashboard/sales', color: 'bg-green-600' },
        { id: 'add-product', name: t('products.addProduct') || 'Add Product', icon: Package, href: '/dashboard/inventory-all?add=true', color: 'bg-purple-600' },
        { id: 'transfer', name: t('nav.stockTransfers') || 'Transfer', icon: GitBranch, href: '/dashboard/stock-transfers', color: 'bg-orange-600' },
        { id: 'order', name: t('nav.orders') || 'Orders', icon: ShoppingCart, href: '/dashboard/orders', color: 'bg-teal-600' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (href: string) => {
        setIsOpen(false);
        navigate(href);
    };

    return (
        <div ref={fabRef} className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div className="absolute bottom-16 right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {quickActions.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => handleAction(action.href)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color} text-white`}>
                                <action.icon className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-sm">{action.name}</span>
                        </button>
                    ))}
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 ${
                    isOpen ? 'rotate-45 bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
            </button>
        </div>
    );
};

export default QuickActionsFab;