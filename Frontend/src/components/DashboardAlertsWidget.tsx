import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AlertTriangle, Package, Clock, ArrowRight, RefreshCw } from "lucide-react";
import { apiClient } from "../lib/api-client";
import { useOrganization } from "../context/OrganizationContext";
import { useTheme } from "../context/ThemeContext";

interface AlertSummary {
    lowStock: number;
    expiringSoon: number;
    expired: number;
    pendingTransfers: number;
}

const DashboardAlertsWidget = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { organization } = useOrganization();
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState<AlertSummary>({
        lowStock: 0,
        expiringSoon: 0,
        expired: 0,
        pendingTransfers: 0,
    });

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const orgId = organization?.id || localStorage.getItem("current_organization_id");

            const [lowStockRes, expiringRes, expiredRes] = await Promise.allSettled([
                apiClient.request(`/organizations/${orgId}/products/low-stock?status=critical&limit=1`),
                apiClient.request(`/organizations/${orgId}/products/expiring?days=30&limit=1`),
                apiClient.request(`/organizations/${orgId}/products/expired?limit=1`),
            ]);

            setAlerts({
                lowStock: lowStockRes.status === 'fulfilled' ? (lowStockRes.value.data?.pagination?.totalItems || 0) : 0,
                expiringSoon: expiringRes.status === 'fulfilled' ? (expiringRes.value.data?.pagination?.totalItems || 0) : 0,
                expired: expiredRes.status === 'fulfilled' ? (expiredRes.value.data?.pagination?.totalItems || 0) : 0,
                pendingTransfers: 0,
            });
        } catch (error) {
            console.error("Failed to fetch alerts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, [organization?.id]);

    const alertItems = [
        {
            id: 'lowStock',
            label: t('inventory.lowStockItems'),
            count: alerts.lowStock,
            color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
            icon: AlertTriangle,
            href: '/low-stock',
        },
        {
            id: 'expiring',
            label: t('inventory.expiringSoon'),
            count: alerts.expiringSoon,
            color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
            icon: Clock,
            href: '/expiring-products',
        },
        {
            id: 'expired',
            label: t('inventory.expiredProducts'),
            count: alerts.expired,
            color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
            icon: Package,
            href: '/expired',
        },
    ];

    const totalAlerts = alertItems.reduce((sum, item) => sum + item.count, 0);

    if (loading) {
        return (
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            </div>
        );
    }

    if (totalAlerts === 0) {
        return (
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('dashboard.alerts')}
                </h3>
                <div className="text-center py-4">
                    <Package className={`w-8 h-8 mx-auto mb-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {t('dashboard.noAlerts')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('dashboard.alerts')}
                </h3>
                <button
                    onClick={fetchAlerts}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-2">
                {alertItems.map((item) => (
                    item.count > 0 && (
                        <Link
                            key={item.id}
                            to={item.href}
                            className={`flex items-center justify-between p-2 rounded-lg ${item.color} hover:opacity-90 transition-opacity`}
                        >
                            <div className="flex items-center gap-2">
                                <item.icon className="w-4 h-4" />
                                <span className="font-medium text-sm">{item.count}</span>
                            </div>
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    )
                ))}
            </div>

            <Link
                to="/inventory-summary"
                className={`flex items-center justify-center gap-1 mt-3 pt-3 border-t ${
                    theme === 'dark' ? 'border-gray-700 text-blue-400' : 'border-gray-200 text-blue-600'
                } text-sm hover:underline`}
            >
                {t('dashboard.viewAll')}
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
};

export default DashboardAlertsWidget;