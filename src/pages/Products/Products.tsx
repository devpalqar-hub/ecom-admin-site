import styles from "./Products.module.css";
import { FiSearch,FiMoreVertical } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api"; // adjust path if needed
import { useNavigate } from "react-router-dom";
 

interface Product {
  id: string;
  name: string;
  discountedPrice: string;
  actualPrice: string;
  stockCount: number;
  isStock: boolean;
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

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const navigate = useNavigate();

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products", {
        params: {
          page,
          limit,
          search: search || undefined,
          status: status || undefined,
          categoryId: categoryId || undefined,
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
}, [search, status,page,categoryId]);
 useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data.data); // based on your API response
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  fetchCategories();
}, []);

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
                onChange={(e) => setStatus(e.target.value)}
            >
                <option value="">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
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
                        <input type="checkbox" />
                    </td>

                    <td className={styles.productCell}>
                        <img
                            src={
                                p.images?.find((img) => img.isMain)?.url ||
                                p.images?.[0]?.url ||
                                "/placeholder.png"
                            }
                            alt={p.name}
                            onError={(e) => {
                                e.currentTarget.src = "/placeholder.png";
                            }}
                         />
                        <span>{p.name}</span>
                    </td>

                    <td>{p.id.slice(0, 8)}</td>

                    <td>{p.subCategory?.category?.name || "-"}</td>

                    <td>{p.stockCount}</td>

                    <td>${p.discountedPrice}</td>

                    <td>
                        <span className={p.isStock ? styles.inStock : styles.lowStock}>
                        {p.isStock ? "In Stock" : "Out of Stock"}
                        </span>
                    </td>

                    <td className={styles.actions}>
                        <FiMoreVertical />
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
                <img
                    src={
                        p.images?.find((img) => img.isMain)?.url ||
                        p.images?.[0]?.url ||
                        "/placeholder.png"
                    }
                    alt={p.name}
                    onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                    }}
                />
                <div>
                <h4>{p.name}</h4>
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
                <strong>${p.discountedPrice}</strong>
            </div>

            <div className={styles.cardRow}>
                <span>Status</span>
                <span className={p.isStock ? styles.inStock : styles.lowStock}>
                {p.isStock ? "In Stock" : "Out of Stock"}
                </span>
            </div>

            <div className={styles.cardActions}>
                <FiMoreVertical />
            </div>
            </div>
        ))}
        </div>
    </div>
  );
}
