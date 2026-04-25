import { useState } from "react";
import { Loader2, Minus, Plus } from "lucide-react";
import { apiClient } from "../lib/api-client";
import { useTheme } from "../context/ThemeContext";

interface InlineStockAdjustProps {
    productId: number;
    currentStock: number;
    onAdjust: (newQuantity: number) => void;
}

const InlineStockAdjust: React.FC<InlineStockAdjustProps> = ({
    productId,
    currentStock,
    onAdjust,
}) => {
    const { theme } = useTheme();
    const [adjustQty, setAdjustQty] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showInput, setShowInput] = useState(false);

    const handleAdjust = async (adjustment: number) => {
        if (adjustment === 0) return;
        
        const newQty = currentStock + adjustment;
        if (newQty < 0) return;

        setLoading(true);
        try {
            const orgId = localStorage.getItem("current_organization_id");
            await apiClient.request(`/organizations/${orgId}/inventory/adjust`, {
                method: "POST",
                body: JSON.stringify({
                    productId,
                    quantity: adjustment,
                    note: `${adjustment > 0 ? 'Added' : 'Removed'} via quick adjust`,
                }),
            });
            onAdjust(newQty);
            setShowInput(false);
            setAdjustQty(1);
        } catch (error) {
            console.error("Failed to adjust stock:", error);
        } finally {
            setLoading(false);
        }
    };

    if (showInput) {
        return (
            <div className="flex items-center gap-1">
                <button
                    onClick={() => setAdjustQty(Math.max(1, adjustQty - 1))}
                    className={`w-7 h-7 rounded flex items-center justify-center ${
                        theme === 'dark' 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                >
                    <Minus className="w-3 h-3" />
                </button>
                <input
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`w-16 h-7 text-center text-sm rounded ${
                        theme === 'dark'
                            ? 'bg-gray-700 text-white border-gray-600'
                            : 'bg-white text-gray-900 border-gray-300'
                    } border`}
                    min="1"
                    autoFocus
                />
                <button
                    onClick={() => setAdjustQty(adjustQty + 1)}
                    className={`w-7 h-7 rounded flex items-center justify-center ${
                        theme === 'dark' 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                >
                    <Plus className="w-3 h-3" />
                </button>
                <button
                    onClick={() => handleAdjust(adjustQty)}
                    disabled={loading}
                    className="w-7 h-7 rounded flex items-center justify-center bg-green-600 hover:bg-green-700 text-white"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                </button>
                <button
                    onClick={() => handleAdjust(-adjustQty)}
                    disabled={loading || currentStock < adjustQty}
                    className="w-7 h-7 rounded flex items-center justify-center bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                    <Minus className="w-3 h-3" />
                </button>
                <button
                    onClick={() => setShowInput(false)}
                    className={`w-7 h-7 rounded flex items-center justify-center ${
                        theme === 'dark'
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                >
                    ×
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            <span className={`text-sm font-semibold min-w-[40px] text-center ${
                currentStock <= 5 
                    ? 'text-red-600 dark:text-red-400' 
                    : theme === 'dark' 
                        ? 'text-white' 
                        : 'text-gray-900'
            }`}>
                {currentStock}
            </span>
            <button
                onClick={() => setShowInput(true)}
                className={`w-6 h-6 rounded flex items-center justify-center ${
                    theme === 'dark'
                        ? 'bg-blue-900 text-blue-400 hover:bg-blue-800'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
            >
                <Plus className="w-3 h-3" />
            </button>
        </div>
    );
};

export default InlineStockAdjust;