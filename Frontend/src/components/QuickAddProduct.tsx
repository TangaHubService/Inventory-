import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Plus, Package, Loader2, ArrowRight } from "lucide-react";
import { apiClient } from "../lib/api-client";
import { useTheme } from "../context/ThemeContext";
import { useOrganization } from "../context/OrganizationContext";

interface QuickAddProductProps {
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

const CATEGORIES = [
    'Bread',
    'Bakery',
    'Cakes',
    'Water',
    'Soft Drinks',
    'Juice',
    'Milk',
    'Cheese',
    'Yogurt',
    'Butter',
    'Chips',
    'Biscuits',
    'Chocolate',
    'Sweets',
    'Notebook',
    'Pen',
    'Pencil',
    'Paper',
    'Soap',
    'Toilet Paper',
    'Tissues',
    'Phone Credit',
    'Medicine',
    'First Aid',
    'Fresh Produce',
    'Fruits',
    'Vegetables',
    'General',
];

const QUANTITY_UNITS = [
    { value: 'U', label: 'Piece (pc)' },
    { value: 'KG', label: 'Kilogram (kg)' },
    { value: 'GM', label: 'Gram (g)' },
    { value: 'L', label: 'Liter (l)' },
    { value: 'ML', label: 'Milliliter (ml)' },
    { value: 'DZ', label: 'Dozen (dz)' },
    { value: 'RM', label: 'Ream (rm)' },
    { value: 'PC', label: 'Pack (pk)' },
];

const QuickAddProduct: React.FC<QuickAddProductProps> = ({ onSuccess, trigger }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { organization } = useOrganization();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        unitPrice: 0,
        quantity: 1,
        batchNumber: "",
        category: "General",
        minStock: 10,
        unitOfMeasure: "U",
    });

    const resetForm = () => {
        setFormData({
            name: "",
            unitPrice: 0,
            quantity: 1,
            batchNumber: "",
            category: "General",
            minStock: 10,
            unitOfMeasure: "U",
        });
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || formData.unitPrice <= 0) {
            return;
        }

        setLoading(true);
        try {
            const orgId = organization?.id || localStorage.getItem("current_organization_id");
            await apiClient.request(`/organizations/${orgId}/products`, {
                method: "POST",
                body: JSON.stringify({
                    name: formData.name,
                    batchNumber: formData.batchNumber || `BAT-${Date.now()}`,
                    quantity: formData.quantity,
                    unitPrice: formData.unitPrice,
                    category: formData.category,
                    minStock: formData.minStock || 10,
                    unitOfMeasure: formData.unitOfMeasure,
                }),
            });

            resetForm();
            setIsOpen(false);
            onSuccess?.();
        } catch (error) {
            console.error("Failed to add product:", error);
        } finally {
            setLoading(false);
        }
    };

    const defaultTrigger = (
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4" />
            {t("products.addProduct")}
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent
                className={`max-w-md ${theme === "dark"
                    ? "bg-gray-900 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200"
                    }`}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {t("products.quickAdd")}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Required Fields */}
                    <div className="space-y-3">
                        <div>
                            <Label>{t("inventory.productName")} *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="e.g., Milk, Bread, Pen"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>{t("inventory.unitPrice")} *</Label>
                                <Input
                                    type="number"
                                    value={formData.unitPrice || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            unitPrice: parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div>
                                <Label>{t("inventory.quantity")}</Label>
                                <Input
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            quantity: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>{t("inventory.category")}</Label>
                            <select
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({ ...formData, category: e.target.value })
                                }
                                className={`w-full h-10 px-3 rounded-md border ${
                                    theme === "dark"
                                        ? "bg-gray-800 border-gray-600 text-white"
                                        : "bg-white border-gray-300 text-gray-900"
                                }`}
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Advanced Options */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="w-full justify-between"
                    >
                        <span>{t("common.advancedOptions")}</span>
                        <ArrowRight
                            className={`w-4 h-4 transition-transform ${
                                showAdvanced ? "rotate-90" : ""
                            }`}
                        />
                    </Button>

                    {showAdvanced && (
                        <div className="space-y-3 pt-2 border-t">
                            <div>
                                <Label>{t("inventory.batchNumber")}</Label>
                                <Input
                                    value={formData.batchNumber}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            batchNumber: e.target.value,
                                        })
                                    }
                                    placeholder="Auto-generated if empty"
                                />
                            </div>
                            <div>
                                <Label>{t("inventory.unitOfMeasure")}</Label>
                                <select
                                    value={formData.unitOfMeasure}
                                    onChange={(e) =>
                                        setFormData({ ...formData, unitOfMeasure: e.target.value })
                                    }
                                    className={`w-full h-10 px-3 rounded-md border ${
                                        theme === "dark"
                                            ? "bg-gray-800 border-gray-600 text-white"
                                            : "bg-white border-gray-300 text-gray-900"
                                    }`}
                                >
                                    {QUANTITY_UNITS.map((unit) => (
                                        <option key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label>{t("inventory.minStock")}</Label>
                                <Input
                                    type="number"
                                    value={formData.minStock}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            minStock: parseInt(e.target.value) || 10,
                                        })
                                    }
                                    min="0"
                                />
                            </div>
                            <div>
                                <Label>{t("inventory.barcode")}</Label>
                                <Input
                                    value={formData.batchNumber}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            batchNumber: e.target.value,
                                        })
                                    }
                                    placeholder="Scan or enter barcode"
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="flex-1"
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !formData.name.trim() || formData.unitPrice <= 0}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                t("common.save")
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuickAddProduct;