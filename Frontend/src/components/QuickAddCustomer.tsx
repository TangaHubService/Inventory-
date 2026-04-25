import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, UserPlus } from "lucide-react";
import { apiClient } from "../lib/api-client";
import { useTheme } from "../context/ThemeContext";
import { useOrganization } from "../context/OrganizationContext";

interface QuickAddCustomerProps {
    onSelect?: (customer: { id: string; name: string; phone: string }) => void;
    buttonVariant?: "default" | "outline" | "ghost";
}

const QuickAddCustomer: React.FC<QuickAddCustomerProps> = ({ 
    onSelect, 
    buttonVariant = "default" 
}) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { organization } = useOrganization();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
    });

    const resetForm = () => {
        setFormData({ name: "", phone: "" });
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return;

        setLoading(true);
        try {
            const orgId = organization?.id || localStorage.getItem("current_organization_id");
            const result = await apiClient.request(`/organizations/${orgId}/customers`, {
                method: "POST",
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone || "",
                    customerType: "INDIVIDUAL",
                }),
            });

            const newCustomer = {
                id: String(result.id),
                name: formData.name,
                phone: formData.phone,
            };

            resetForm();
            setIsOpen(false);
            onSelect?.(newCustomer);
        } catch (error) {
            console.error("Failed to add customer:", error);
        } finally {
            setLoading(false);
        }
    };

    const buttonClass = buttonVariant === "default" 
        ? "bg-blue-600 hover:bg-blue-700 text-white" 
        : buttonVariant === "outline"
            ? "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            : "";

    return (
        <div className="flex items-center gap-2">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${buttonClass} ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}
                >
                    <UserPlus className="w-3 h-3" />
                    {t('customers.addNew')}
                </button>
            ) : (
                <div className="flex items-center gap-1">
                    <input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('customers.namePlaceholder')}
                        className={`w-24 h-7 text-sm px-2 rounded ${
                            theme === 'dark'
                                ? 'bg-gray-700 text-white border-gray-600'
                                : 'bg-white text-gray-900 border-gray-300'
                        } border`}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSubmit();
                            if (e.key === 'Escape') {
                                setIsOpen(false);
                                resetForm();
                            }
                        }}
                    />
                    <input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t('customers.phonePlaceholder')}
                        className={`w-20 h-7 text-sm px-2 rounded ${
                            theme === 'dark'
                                ? 'bg-gray-700 text-white border-gray-600'
                                : 'bg-white text-gray-900 border-gray-300'
                        } border`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSubmit();
                            if (e.key === 'Escape') {
                                setIsOpen(false);
                                resetForm();
                            }
                        }}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.name.trim()}
                        className="w-7 h-7 rounded flex items-center justify-center bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "+"}
                    </button>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            resetForm();
                        }}
                        className={`w-7 h-7 rounded flex items-center justify-center ${
                            theme === 'dark'
                                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuickAddCustomer;