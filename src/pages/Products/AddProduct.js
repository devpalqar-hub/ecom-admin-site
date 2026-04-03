import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import styles from "./CreateProduct.module.css";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/toast/ToastContext";
export default function CreateProduct() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [stockCount, setStockCount] = useState(0);
    const [actualPrice, setActualPrice] = useState("");
    const [discountedPrice, setDiscountedPrice] = useState("");
    const [isStock, setIsStock] = useState(true);
    const { showToast } = useToast();
    const [isFeatured, setIsFeatured] = useState(false);
    const [variationTitle, setVariationTitle] = useState("");
    const [variationsEnabled, setVariationsEnabled] = useState(false);
    useEffect(() => {
        if (variationsEnabled) {
            setStockCount(0); // clear stock
        }
    }, [variationsEnabled]);
    const [variations, setVariations] = useState([
        {
            variationName: "",
            price: "",
            discountedPrice: "",
            stockCount: "",
            isAvailable: true,
        },
    ]);
    const addVariation = () => {
        setVariations([
            ...variations,
            {
                variationName: "",
                price: "",
                discountedPrice: "",
                stockCount: "",
                isAvailable: true,
            },
        ]);
    };
    const updateVariation = (index, key, value) => {
        const updated = [...variations];
        updated[index] = {
            ...updated[index],
            [key]: value,
        };
        setVariations(updated);
    };
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/categories", {
                    params: {
                        isActive: "true",
                    },
                });
                const allCategories = res.data?.data?.data ?? [];
                const normalizedCategories = allCategories.map((cat) => ({
                    ...cat,
                    subCategories: cat.subCategories?.filter((sub) => sub.isActive) ?? [],
                }));
                setCategories(normalizedCategories);
            }
            catch (err) {
                console.error("Failed to fetch categories", err);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);
    /* ---------------- IMAGES ---------------- */
    const [mainImage, setMainImage] = useState(null);
    const [images, setImages] = useState([]);
    const handleMainImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setMainImage(file);
    };
    const handleAdditionalImages = (e) => {
        if (!e.target.files)
            return;
        setImages(prev => [...prev, ...Array.from(e.target.files)]);
    };
    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };
    const validateForm = () => {
        /* ---------- BASIC PRODUCT ---------- */
        if (!name.trim()) {
            showToast("Product name is required", "error");
            return false;
        }
        if (!selectedCategory) {
            showToast("Category is required", "error");
            return false;
        }
        const selectedCategoryObj = categories.find((cat) => cat.id === selectedCategory);
        if (selectedCategoryObj &&
            selectedCategoryObj.subCategories.length > 0 &&
            !selectedSubCategory) {
            showToast("Subcategory is required", "error");
            return false;
        }
        if (!variationsEnabled) {
            if (stockCount <= 0) {
                showToast("Stock quantity is required", "error");
                return false;
            }
        }
        if (!actualPrice || Number(actualPrice) <= 0) {
            showToast("Regular price must be greater than 0", "error");
            return false;
        }
        if (Number(discountedPrice) < 0) {
            showToast("Discounted price cannot be negative", "error");
            return false;
        }
        if (discountedPrice &&
            Number(discountedPrice) > Number(actualPrice)) {
            showToast("Discounted price cannot be greater than regular price", "error");
            return false;
        }
        if (!mainImage) {
            showToast("Main product image is required", "error");
            return false;
        }
        /* ---------- VARIATIONS ---------- */
        if (variationsEnabled) {
            if (variations.length === 0) {
                showToast("Add at least one variation", "error");
                return false;
            }
            const totalVariationStock = variations.reduce((sum, v) => sum + Number(v.stockCount || 0), 0);
            for (let i = 0; i < variations.length; i++) {
                const v = variations[i];
                if (!v.variationName.trim()) {
                    showToast(`Variation ${i + 1}: Name is required`, "error");
                    return false;
                }
                if (Number(v.stockCount) < 0) {
                    showToast(`Variation ${i + 1}: Stock cannot be negative`, "error");
                    return false;
                }
                if (!v.price || Number(v.price) <= 0) {
                    showToast(`Variation ${i + 1}: Price must be greater than 0`, "error");
                    return false;
                }
                if (Number(v.discountedPrice) < 0) {
                    showToast(`Variation ${i + 1}: Discounted price cannot be negative`, "error");
                    return false;
                }
                if (v.discountedPrice &&
                    Number(v.discountedPrice) > Number(v.price)) {
                    showToast(`Variation ${i + 1}: Discounted price cannot exceed price`, "error");
                    return false;
                }
            }
        }
        return true;
    };
    const handleCreateProduct = async () => {
        if (!validateForm())
            return;
        try {
            const formData = new FormData();
            /* ---------------- TEXT FIELDS ---------------- */
            formData.append("name", name);
            formData.append("description", description);
            formData.append("stockCount", String(stockCount));
            formData.append("actualPrice", actualPrice);
            const finalDiscount = discountedPrice === "" || discountedPrice === null || discountedPrice === " " || discountedPrice === "0"
                ? actualPrice
                : discountedPrice;
            formData.append("discountedPrice", finalDiscount);
            formData.append("subCategoryId", selectedSubCategory);
            formData.append("isFeatured", String(isFeatured));
            formData.append("isStock", String(isStock));
            formData.append("variationTitle", variationTitle);
            /* ---------------- VARIATIONS (ADD HERE ) ---------------- */
            if (variationsEnabled) {
                const payloadVariations = variations.map((v) => {
                    const price = Number(v.price);
                    const discounted = v.discountedPrice === "" || v.discountedPrice === null || v.discountedPrice === "0"
                        ? price
                        : Number(v.discountedPrice);
                    return {
                        variationName: v.variationName,
                        actualPrice: price,
                        discountedPrice: discounted,
                        stockCount: Number(v.stockCount),
                        isAvailable: v.isAvailable,
                    };
                });
                formData.append("variations", JSON.stringify(payloadVariations));
            }
            /* ---------------- IMAGES ---------------- */
            if (!mainImage) {
                showToast("Main image is required", "error");
                return;
            }
            formData.append("images", mainImage);
            images.forEach((img) => {
                formData.append("images", img);
            });
            /* ---------------- API CALL ---------------- */
            const res = await api.post("/products", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Product created:", res.data);
            showToast("Product created successfully", "success");
            navigate("/products");
        }
        catch (error) {
            console.error("Create product failed", error?.response?.data || error);
            showToast(error?.response?.data?.message || "Failed to create product", "error");
        }
    };
    const selectedCategoryObj = categories.find((cat) => cat.id === selectedCategory);
    const filteredSubCategories = selectedCategoryObj?.subCategories ?? [];
    const hasNoSubCategories = selectedCategoryObj &&
        selectedCategoryObj.subCategories.length === 0;
    /* ---------------- UI ---------------- */
    return (_jsxs("div", { className: styles.page, children: [_jsx("div", { className: styles.header, children: _jsxs("div", { className: styles.headerLeft, children: [_jsx("button", { type: "button", className: styles.backBtn, onClick: () => navigate("/products"), children: _jsx(FiArrowLeft, {}) }), _jsxs("div", { className: styles.headerText, children: [_jsx("h1", { children: "Create New Product" }), _jsx("p", { children: "Add a new product to your catalog" })] })] }) }), _jsxs("div", { className: styles.layout, children: [_jsxs("div", { className: styles.left, children: [_jsxs("div", { className: styles.card, children: [_jsx("h3", { children: "Product Information" }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Product Name *" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Stock Quantity *" }), _jsx("input", { type: "number", value: variationsEnabled ? "" : stockCount === 0 ? "" : stockCount, disabled: variationsEnabled, onChange: (e) => setStockCount(e.target.value === "" ? 0 : Number(e.target.value)) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Description" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value) })] }), _jsxs("div", { className: styles.row, children: [_jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Category *" }), _jsxs("select", { value: selectedCategory, onChange: (e) => {
                                                            setSelectedCategory(e.target.value);
                                                            setSelectedSubCategory("");
                                                        }, children: [_jsx("option", { value: "", children: "Select category" }), categories.map((cat) => (_jsx("option", { value: cat.id, children: cat.name }, cat.id)))] })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Subcategory *" }), _jsx("select", { value: selectedSubCategory, disabled: !selectedCategory || filteredSubCategories.length === 0, onChange: (e) => setSelectedSubCategory(e.target.value), children: filteredSubCategories.length === 0 ? (_jsx("option", { value: "", children: "No subcategories available" })) : (_jsxs(_Fragment, { children: [_jsx("option", { value: "", children: "Select subcategory" }), filteredSubCategories.map((sub) => (_jsx("option", { value: sub.id, children: sub.name }, sub.id)))] })) }), hasNoSubCategories && (_jsx("p", { className: styles.errorText, children: "No subcategories found. Please create a subcategory to create a product." }))] })] })] }), _jsxs("div", { className: styles.card, children: [_jsx("h3", { children: "Pricing" }), _jsxs("div", { className: styles.row, children: [_jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Regular Price *" }), _jsx("input", { value: actualPrice, onChange: (e) => setActualPrice(e.target.value) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Discounted Price" }), _jsx("input", { value: discountedPrice, onChange: (e) => setDiscountedPrice(e.target.value) })] })] })] }), _jsxs("div", { className: styles.card, children: [_jsx("h3", { children: "Product Images" }), _jsxs("label", { className: styles.uploadBox, children: [mainImage ? (_jsx("img", { src: URL.createObjectURL(mainImage), alt: "Main product" })) : (_jsx("span", { children: "+ Click to upload main image (JPG, PNG, GIF, WebP)" })), _jsx("input", { type: "file", hidden: true, accept: "image/*", onChange: handleMainImageUpload })] }), _jsxs("label", { className: styles.addMoreBox, children: ["+ Add more images", _jsx("input", { type: "file", hidden: true, multiple: true, accept: "image/*", onChange: handleAdditionalImages })] }), images.length > 0 && (_jsx("div", { className: styles.additionalGrid, children: images.map((img, i) => (_jsxs("div", { className: styles.thumb, children: [_jsx("img", { src: URL.createObjectURL(img), alt: `extra-${i}` }), _jsx("button", { type: "button", className: styles.removeBtn, onClick: () => removeImage(i), children: "\u00D7" })] }, i))) }))] }), _jsxs("div", { className: styles.card, children: [_jsxs("div", { className: styles.variationHeader, children: [_jsx("h3", { children: "Product Variations" }), _jsxs("label", { className: styles.switch, children: [_jsx("input", { type: "checkbox", checked: variationsEnabled, onChange: () => setVariationsEnabled((v) => !v) }), _jsx("span", { className: styles.slider })] })] }), _jsx("p", { className: styles.mutedVariation, children: "Add variations like sizes, colors, or models" }), _jsxs("div", { className: styles.variationTitleField, children: [_jsx("label", { children: "Variation Title" }), _jsx("input", { type: "text", value: variationTitle, onChange: (e) => setVariationTitle(e.target.value), placeholder: "Size, Models, colors" })] }), variationsEnabled && (_jsxs("div", { className: styles.variationList, children: [variations.map((v, index) => (_jsxs("div", { className: styles.variationCard, children: [_jsxs("h4", { children: ["Variation ", index + 1] }), _jsxs("div", { className: styles.variationRow, children: [_jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Variation Name" }), _jsx("input", { value: v.variationName, onChange: (e) => updateVariation(index, "variationName", e.target.value) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Stock Count" }), _jsx("input", { type: "number", value: v.stockCount, onChange: (e) => updateVariation(index, "stockCount", e.target.value) })] })] }), _jsxs("div", { className: styles.variationRow, children: [_jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Price" }), _jsx("input", { type: "number", value: v.price, onChange: (e) => updateVariation(index, "price", e.target.value) })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { children: "Discounted Price" }), _jsx("input", { type: "number", value: v.discountedPrice, onChange: (e) => updateVariation(index, "discountedPrice", e.target.value) })] })] }), _jsxs("div", { className: styles.fieldCheckbox, children: [_jsx("input", { type: "checkbox", checked: v.isAvailable, onChange: (e) => updateVariation(index, "isAvailable", e.target.checked) }), _jsx("label", { children: "Available" })] })] }, index))), _jsx("button", { type: "button", className: styles.addVariationBtn, onClick: addVariation, children: "+ Add Variation" })] }))] })] }), _jsx("div", { className: styles.right, children: _jsxs("div", { className: styles.card, children: [_jsx("h3", { children: "Product Status" }), _jsxs("div", { className: styles.toggle, children: [_jsx("span", { children: "Active Status" }), _jsx("input", { type: "checkbox", checked: isStock, onChange: () => setIsStock((v) => !v) })] }), _jsxs("div", { className: styles.toggle, children: [_jsx("span", { children: "Featured Product" }), _jsx("input", { type: "checkbox", checked: isFeatured, onChange: () => setIsFeatured((v) => !v) })] }), _jsx("p", { className: styles.muted, children: "Featured products appear on homepage & promotions" })] }) })] }), _jsxs("div", { className: styles.actions, children: [_jsx("button", { className: styles.cancel, onClick: () => navigate("/products"), children: "Cancel" }), _jsx("button", { className: styles.primary, onClick: handleCreateProduct, disabled: !name || !selectedSubCategory, children: "Create Product" })] })] }));
}
