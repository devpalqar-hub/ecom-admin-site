import styles from "./CreateProduct.module.css";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function CreateProduct() {
 
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stockCount, setStockCount] = useState<number>(0);
  const [actualPrice, setActualPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [isStock, setIsStock] = useState(true);

  

  type SubCategory = {
  id: string;
  name: string;
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
  subCategories: SubCategory[];
};

const [categories, setCategories] = useState<Category[]>([]);
const [selectedCategory, setSelectedCategory] = useState("");
const [selectedSubCategory, setSelectedSubCategory] = useState("");

  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data?.data?.data ?? []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      setCategories([]);
    }
  };

  fetchCategories();
}, []);

  /* ---------------- IMAGES ---------------- */
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setMainImage(file);
};

const handleAdditionalImages = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) return;
  setImages(prev => [...prev, ...Array.from(e.target.files!)]);
};

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };


  /* ---------------- VARIATIONS (UI ONLY) ---------------- */
  const [variationsEnabled, setVariationsEnabled] = useState(false);

  type Variation = {
    name: string;
    price: string;
  };

  const [variations, setVariations] = useState<Variation[]>([
  { name: "", price: "" },
]);

const addVariation = () => {
  setVariations(prev => [...prev, { name: "", price: "" }]);
};

  const updateVariation = (
    index: number,
    field: keyof Variation,
    value: string
  ) => {
    setVariations(prev =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  
const handleCreateProduct = async () => {
  try {
    if (!mainImage) {
      alert("Main image is required");
      return;
    }

    const formData = new FormData();

    // TEXT FIELDS
    formData.append("name", name);
    formData.append("description", description);
    formData.append("stockCount", String(stockCount));
    formData.append("actualPrice", actualPrice);
    formData.append("discountedPrice", discountedPrice);
    formData.append("subCategoryId", selectedSubCategory);
    

    // IMAGES (IMPORTANT)
    formData.append("images", mainImage); // main image
    images.forEach((img) => {
      formData.append("images", img); // additional images
    });

    const res = await api.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Product created:", res.data);
    alert("Product created successfully!");
  } catch (error: any) {
    console.error("Create product failed", error?.response?.data || error);
    alert("Failed to create product");
  }
};
const selectedCategoryObj = categories.find(
  (cat) => cat.id === selectedCategory
);

const filteredSubCategories = selectedCategoryObj?.subCategories ?? [];


  /* ---------------- UI ---------------- */
  return (
    <div className={styles.page}>
        <div className={styles.header}>
            <div className={styles.headerLeft}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => navigate("/products")}
               >
               <FiArrowLeft />
               </button>
            <div className={styles.headerText}>
                <h1>Create New Product</h1>
                <p>Add a new product to your catalog</p>
            </div>
        </div>
    </div>

      <div className={styles.layout}>
        <div className={styles.left}>
          <div className={styles.card}>
            <h3>Product Information</h3>

            <div className={styles.field}>
              <label>Product Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className={styles.field}>
              <label>Stock Quantity *</label>
              <input
                type="number"
                value={stockCount}
                onChange={e => setStockCount(Number(e.target.value))}
              />
            </div>

            <div className={styles.field}>
              <label>Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className={styles.row}>
  {/* CATEGORY */}
  <div className={styles.field}>
    <label>Category *</label>
    <select
      value={selectedCategory}
      onChange={(e) => {
        setSelectedCategory(e.target.value);
        setSelectedSubCategory("");
      }}
    >
      <option value="">Select category</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  </div>

  {/* SUBCATEGORY */}
  <div className={styles.field}>
    <label>Subcategory *</label>
    <select
      value={selectedSubCategory}
      onChange={(e) => setSelectedSubCategory(e.target.value)}
      disabled={!selectedCategory}
    >
      <option value="">
        {selectedCategory
          ? "Select subcategory"
          : "Select category first"}
      </option>

      {filteredSubCategories.map((sub) => (
        <option key={sub.id} value={sub.id}>
          {sub.name}
        </option>
      ))}
    </select>
  </div>
</div>

          </div>

          <div className={styles.card}>
            <h3>Pricing</h3>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Regular Price *</label>
                <input
                  value={actualPrice}
                  onChange={e => setActualPrice(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Discounted Price</label>
                <input
                  value={discountedPrice}
                  onChange={e => setDiscountedPrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3>Product Images</h3>

            <label className={styles.uploadBox}>
              {mainImage ? (
                <img src={URL.createObjectURL(mainImage)} alt="Main product" />
              ) : (
                <>+ Click to upload main image</>
              )}
              <input type="file" hidden accept="image/*" onChange={handleMainImageUpload} />
            </label>

            <div className={styles.additionalGrid}>
                {images.map((img, i) => (
                <div key={i} className={styles.thumb}>
                    {img && (
                    <img src={URL.createObjectURL(img)} alt={`product-${i}`} />
                    )}
                    <button type="button" onClick={() => removeImage(i)}>×</button>
                </div>
                ))}

            </div>

            <label className={styles.addMoreBox}>
              + Add more images
              <input type="file" hidden multiple accept="image/*" onChange={handleAdditionalImages} />
            </label>
          </div>

          {/* ================= PRODUCT VARIATIONS ================= */}
            <div className={styles.card}>
                <div className={styles.variationHeader}>
                    <h3>Product Variations</h3>

                    <label className={styles.switch}>
                    <input
                        type="checkbox"
                        checked={variationsEnabled}
                        onChange={() => setVariationsEnabled((v) => !v)}
                    />
                    <span className={styles.slider}></span>
                    </label>
                </div>

                <p className={styles.muted}>
                Add variations like sizes, colors, or models with different prices
                </p>
                {variationsEnabled && (
            <div className={styles.variationList}>
                {variations.map((v, index) => (
                    <div key={index} className={styles.variationCard}>
                    <h4>Variation {index + 1}</h4>

                    {/* NAME + PRICE */}
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label>Variation Name *</label>
                            <input
                                placeholder="e.g. Small, Black, 128GB"
                                value={v.name}
                                onChange={(e) =>
                                updateVariation(index, "name", e.target.value)
                                }
                            />
                        </div>
                    <div className={styles.field}>
                        <label>Price *</label>
                        <input
                            placeholder="$ 0.00"
                            value={v.price}
                            onChange={(e) =>
                            updateVariation(index, "price", e.target.value)
                            }
                        />
                        </div>
                    </div>
                </div>
            ))}
        <button
            type="button"
            className={styles.addVariationBtn}
            onClick={addVariation}
        >
        + Add Variation
      </button>
    </div>
  )}
</div>

        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.right}>
          <div className={styles.card}>
            <h3>Product Status</h3>
            <div className={styles.toggle}>
              <span>Active Status</span>
                <input
                    type="checkbox"
                    checked={isStock}
                    onChange={() => setIsStock((v) => !v)}
                />
            </div>
            <p className={styles.muted}>Product is hidden from store</p>
          </div>

          <div className={styles.card}>
            <h3>Summary</h3>
            <ul className={styles.summary}>
              <li><span>Name:</span> Not set</li>
              <li><span>SKU:</span> Not set</li>
              <li><span>Category:</span> Not set</li>
              <li><span>Price:</span> $0.00</li>
              <li><span>Stock:</span> 0 units</li>
            </ul>
          </div>
        </div>
      </div>


      <div className={styles.actions}>
        <button className={styles.cancel}>Cancel</button>
        <button className={styles.primary} onClick={handleCreateProduct}>
          Create Product
        </button>
      </div>
    </div>
  );
}
