import styles from "./Products.module.css";
import { FiSearch,FiEdit2, FiTrash2,FiEye } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api"; 
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/confirmModal/ConfirmModal";
import { useToast } from "../../components/toast/ToastContext";

interface Product {
  id: string;
  name: string;
  discountedPrice: string;
  actualPrice: string;
  stockCount: number;
  isStock: boolean;
  isFeatured?: boolean;
  images: {
    url: string;
    isMain?: boolean;
  }[];
  subCategory?: {
    name: string;
    category?: {
      name: string;
    };
  };
}
interface Category {
  id: string;
  name: string;
}

export default function Products() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

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
          isStock:
          status === "in"
            ? true
            : status === "out"
            ? false
            : undefined,

        },
      });

      setProducts(res.data.data.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, [search, status, page, categoryId]);

 useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data.data); 
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  fetchCategories();
}, []);
const handleDeleteProduct = async () => {
  if (!deleteProductId) return;

  try {
    await api.delete(`/products/${deleteProductId}`);

    // remove product from UI
    setProducts((prev) =>
      prev.filter((product) => product.id !== deleteProductId)
    );
    setShowDeleteConfirm(false);
    setDeleteProductId(null);
    showToast("Product deleted successfully", "success");
  } catch (error: any) {
    console.error("Delete product failed", error?.response?.data || error);
    showToast("Failed to delete product", "error");
  }
};

function ProductImage({
  src,
  alt,
}: {
  src?: string;
  alt: string;
}) {
  const [imgSrc, setImgSrc] = useState(
    src || "/placeholder.png"
  );

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      onError={() => setImgSrc("/placeholder.png")}
    />
  );
}

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1>Products</h1>
          <p>Manage your product catalog</p>
        </div>
        <button
            className={styles.addBtn}
            onClick={() => navigate("/products/add")}
            >
            + Add Product
        </button>
      </div>

      {/* FILTER BAR */}
        <div className={styles.filters}>
            <div className={styles.searchBox}>
                <FiSearch className={styles.searchIcon} />
                <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
                
            </div>

            <select
                value={categoryId}
                onChange={(e) => {
                    setCategoryId(e.target.value);
                    setPage(1); // reset pagination
                }}
                >
                <option value="">All Categories</option>

                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                    {cat.name}
                    </option>
                ))}
            </select>
            <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="in">In Stock</option>
                <option value="out">Out of Stock</option>
              </select>


        </div>

      {/* TABLE */}
      <div className={styles.tableWrapper}>
      {loading && <p>Loading products...</p>}
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
         
          <tbody>
                {products.map((p) => (
                    <tr key={p.id}>
                    <td>
                        <span></span>
                    </td>
                  <td className={styles.productId}>
                    <div className={styles.productCell}>
                        <ProductImage
                          src={
                            p.images?.find((img) => img.isMain)?.url ||
                            p.images?.[0]?.url
                          }
                          alt={p.name}
                        />
                        
                        <div className={styles.productNameWrap}>
                          <span className={styles.productName}>{p.name}</span>
                        </div>

                          {p.isFeatured && (
                            <span className={styles.featuredBadge}>FEATURED</span>
                          )}
                        </div>
                  </td>

                    <td>{p.id.slice(0, 8)}</td>

                    <td>{p.subCategory?.category?.name || "-"}</td>

                    <td>{p.stockCount}</td>

                    <td>QAR {p.discountedPrice}</td>

                    <td>
                        <span className={p.isStock ? styles.inStock : styles.lowStock}>
                        {p.isStock ? "In Stock" : "Out of Stock"}
                        </span>
                    </td>

                    <td className={styles.actions}>
                        
                        <button
                            className={styles.viewBtn}
                            onClick={() => navigate(`/products/${p.id}`)}
                            title="View product"
                          >
                            <FiEye />
                        </button>


                        <button
                          className={styles.editBtn}
                          onClick={() => navigate(`/products/edit/${p.id}`)}
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          className={styles.deleteBtn}
                          onClick={() => {
                            setDeleteProductId(p.id);
                            setShowDeleteConfirm(true);
                          }}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                ))}
                </tbody>
        </table>
        
        {/* PAGINATION */}
        <div className={styles.pagination}>
            <button
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
            >
                Prev
            </button>

            <span className={styles.pageInfo}>
                Page {page}
            </span>

            <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => p + 1)}
            >
                Next
            </button>
        </div>
      </div>
      {/* MOBILE CARDS */}
        <div className={styles.mobileList}>
        {products.map((p) => (
            <div key={p.id} className={styles.mobileCard}>
            <div className={styles.cardTop}>
                <ProductImage
                  src={
                    p.images?.find((img) => img.isMain)?.url ||
                    p.images?.[0]?.url
                  }
                  alt={p.name}
                />
                <div>
                <div className={styles.mobileTitle}>
                  <h4>{p.name}</h4>

                  {p.isFeatured && (
                    <span className={styles.featuredBadge}>FEATURED</span>
                  )}
                </div>
                <p className={styles.category}>
                    {p.subCategory?.category?.name || "-"}
                </p>
                </div>
            </div>

            <div className={styles.cardRow}>
                <span>Stock</span>
                <strong>{p.stockCount}</strong>
            </div>

            <div className={styles.cardRow}>
                <span>Price</span>
                <strong>QAR {p.discountedPrice}</strong>
            </div>

            <div className={styles.cardRow}>
                <span>Status</span>
                <span className={p.isStock ? styles.inStock : styles.lowStock}>
                {p.isStock ? "In Stock" : "Out of Stock"}
                </span>
            </div>
            <div className={styles.cardActionsRight}>
                  <button
                      className={styles.viewBtn}
                      onClick={() => navigate(`/products/${p.id}`)}
                      title="View product"
                    >
                      <FiEye />
                  </button>


                <button
                  className={styles.editBtn}
                  onClick={() => navigate(`/products/edit/${p.id}`)}
                  title="Edit"
                >
                  <FiEdit2 />
                </button>

                <button
                  className={styles.deleteBtn}
                  onClick={() => {
                    setDeleteProductId(p.id);
                    setShowDeleteConfirm(true);
                  }}
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
        ))}
        </div>
            <ConfirmModal 
              open={showDeleteConfirm}
              title="Delete Product"
              message="Are you sure you want to delete this product? This action cannot be undone."
              confirmText="Delete"
              onCancel={() => {
                setShowDeleteConfirm(false);
                setDeleteProductId(null);
              }}
              onConfirm={handleDeleteProduct}
            />
    </div>
  );
}
