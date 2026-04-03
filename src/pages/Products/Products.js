import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./Products.module.css";
import { FiSearch, FiEdit2, FiEye } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/confirmModal/ConfirmModal";
import { useToast } from "../../components/toast/ToastContext";
import { PiToggleLeftThin, PiToggleRightThin } from "react-icons/pi";
export default function Products() {
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState("");
    const { showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteProductId, setDeleteProductId] = useState(null);
    const [stockStatus, setStockStatus] = useState("");
    const [activeStatus, setActiveStatus] = useState("all");
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await api.get("/products", {
                    params: {
                        page,
                        limit,
                        search: search || undefined,
                        categoryId: categoryId || undefined,
                        isStock: stockStatus === "in"
                            ? true
                            : stockStatus === "out"
                                ? false
                                : undefined,
                        isActive: activeStatus === "active"
                            ? true
                            : activeStatus === "inactive"
                                ? false
                                : undefined,
                    },
                });
                setProducts(res.data.data.data);
            }
            catch (error) {
                console.error("Failed to fetch products", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [search, stockStatus, activeStatus, page, categoryId]);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/categories");
                setCategories(res.data.data.data);
            }
            catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);
    const handleDeleteProduct = async () => {
        if (!deleteProductId)
            return;
        try {
            await api.delete(`/products/${deleteProductId}`);
            // remove product from UI
            setProducts((prev) => prev.filter((product) => product.id !== deleteProductId));
            setShowDeleteConfirm(false);
            setDeleteProductId(null);
            showToast("Product deleted successfully", "success");
        }
        catch (error) {
            console.error("Delete product failed", error?.response?.data || error);
            showToast("Failed to delete product", "error");
        }
    };
    function ProductImage({ src, alt, }) {
        const [imgSrc, setImgSrc] = useState(src || "/placeholder.png");
        return (_jsx("img", { src: imgSrc, alt: alt, loading: "lazy", onError: () => setImgSrc("/placeholder.png") }));
    }
    const toggleProductStatus = async (product) => {
        try {
            await api.patch(`/products/${product.id}`, {
                isActive: !product.isActive,
            });
            setProducts((prev) => prev.map((p) => p.id === product.id
                ? { ...p, isActive: !p.isActive }
                : p));
            showToast(product.isActive
                ? "Product deactivated"
                : "Product activated", "success");
        }
        catch (error) {
            console.error("Status update failed", error);
            showToast("Failed to update product status", "error");
        }
    };
    return (_jsxs("div", { className: styles.page, children: [_jsxs("div", { className: styles.header, children: [_jsxs("div", { children: [_jsx("h1", { children: "Products" }), _jsx("p", { children: "Manage your product catalog" })] }), _jsx("button", { className: styles.addBtn, onClick: () => navigate("/products/add"), children: "+ Add Product" })] }), _jsxs("div", { className: styles.filters, children: [_jsxs("div", { className: styles.searchBox, children: [_jsx(FiSearch, { className: styles.searchIcon }), _jsx("input", { placeholder: "Search products...", value: search, onChange: (e) => setSearch(e.target.value) })] }), _jsxs("select", { value: categoryId, onChange: (e) => {
                            setCategoryId(e.target.value);
                            setPage(1); // reset pagination
                        }, children: [_jsx("option", { value: "", children: "All Categories" }), categories.map((cat) => (_jsx("option", { value: cat.id, children: cat.name }, cat.id)))] }), _jsxs("select", { value: stockStatus, onChange: (e) => {
                            setStockStatus(e.target.value);
                            setPage(1);
                        }, children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "in", children: "In Stock" }), _jsx("option", { value: "out", children: "Out of Stock" })] }), _jsxs("select", { value: activeStatus, onChange: (e) => {
                            setActiveStatus(e.target.value);
                            setPage(1);
                        }, children: [_jsx("option", { value: "all", children: "All Products" }), _jsx("option", { value: "active", children: "Active Products" }), _jsx("option", { value: "inactive", children: "Inactive Products" })] })] }), _jsxs("div", { className: styles.tableWrapper, children: [loading && _jsx("p", { children: "Loading products..." }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", {}), _jsx("th", { children: "Product" }), _jsx("th", { children: "SKU" }), _jsx("th", { children: "Category" }), _jsx("th", { children: "Stock" }), _jsx("th", { children: "Price" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: products.map((p) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("span", {}) }), _jsx("td", { className: styles.productId, children: _jsxs("div", { className: styles.productCell, children: [_jsx(ProductImage, { src: p.images?.find((img) => img.isMain)?.url ||
                                                            p.images?.[0]?.url, alt: p.name }), _jsx("div", { className: styles.productNameWrap, children: _jsx("span", { className: styles.productName, children: p.name }) }), p.isFeatured && (_jsx("span", { className: styles.featuredBadge, children: "FEATURED" }))] }) }), _jsx("td", { children: p.id.slice(0, 8) }), _jsx("td", { children: p.subCategory?.category?.name || "-" }), _jsx("td", { children: p.stockCount }), _jsxs("td", { children: ["QAR ", p.discountedPrice] }), _jsx("td", { children: _jsx("span", { className: p.isStock ? styles.inStock : styles.lowStock, children: p.isStock ? "In Stock" : "Out of Stock" }) }), _jsxs("td", { className: styles.actions, children: [_jsx("button", { className: styles.viewBtn, onClick: () => navigate(`/products/${p.id}`), title: "View product", children: _jsx(FiEye, {}) }), _jsx("button", { className: styles.editBtn, onClick: () => navigate(`/products/edit/${p.id}`), title: "Edit", children: _jsx(FiEdit2, {}) }), _jsx("button", { className: styles.statusBtn, onClick: () => toggleProductStatus(p), title: p.isActive ? "Deactivate product" : "Activate product", children: p.isActive ? (_jsx(PiToggleRightThin, { "data-active": "true" })) : (_jsx(PiToggleLeftThin, { "data-active": "false" })) })] })] }, p.id))) })] }), _jsxs("div", { className: styles.pagination, children: [_jsx("button", { className: styles.pageBtn, disabled: page === 1, onClick: () => setPage((p) => p - 1), children: "Prev" }), _jsxs("span", { className: styles.pageInfo, children: ["Page ", page] }), _jsx("button", { className: styles.pageBtn, onClick: () => setPage((p) => p + 1), children: "Next" })] })] }), _jsx("div", { className: styles.mobileList, children: products.map((p) => (_jsxs("div", { className: styles.mobileCard, children: [_jsxs("div", { className: styles.cardTop, children: [_jsx(ProductImage, { src: p.images?.find((img) => img.isMain)?.url ||
                                        p.images?.[0]?.url, alt: p.name }), _jsxs("div", { children: [_jsxs("div", { className: styles.mobileTitle, children: [_jsx("h4", { children: p.name }), p.isFeatured && (_jsx("span", { className: styles.featuredBadge, children: "FEATURED" }))] }), _jsx("p", { className: styles.category, children: p.subCategory?.category?.name || "-" })] })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { children: "Stock" }), _jsx("strong", { children: p.stockCount })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { children: "Price" }), _jsxs("strong", { children: ["QAR ", p.discountedPrice] })] }), _jsxs("div", { className: styles.cardRow, children: [_jsx("span", { children: "Status" }), _jsx("span", { className: p.isStock ? styles.inStock : styles.lowStock, children: p.isStock ? "In Stock" : "Out of Stock" })] }), _jsxs("div", { className: styles.cardActionsRight, children: [_jsx("button", { className: styles.viewBtn, onClick: () => navigate(`/products/${p.id}`), title: "View product", children: _jsx(FiEye, {}) }), _jsx("button", { className: styles.editBtn, onClick: () => navigate(`/products/edit/${p.id}`), title: "Edit", children: _jsx(FiEdit2, {}) }), _jsx("button", { className: styles.statusBtn, onClick: () => toggleProductStatus(p), title: p.isActive ? "Deactivate product" : "Activate product", children: p.isActive ? (_jsx(PiToggleRightThin, { "data-active": "true" })) : (_jsx(PiToggleLeftThin, { "data-active": "false" })) })] })] }, p.id))) }), _jsx(ConfirmModal, { open: showDeleteConfirm, title: "Delete Product", message: "Are you sure you want to delete this product? This action cannot be undone.", confirmText: "Delete", onCancel: () => {
                    setShowDeleteConfirm(false);
                    setDeleteProductId(null);
                }, onConfirm: handleDeleteProduct })] }));
}
