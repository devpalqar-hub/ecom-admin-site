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

  type VariationForm = {
  variationName: string;
  price: string;
  stockCount: string;
  isAvailable: boolean;
};

const [variationsEnabled, setVariationsEnabled] = useState(false);

const [variations, setVariations] = useState<VariationForm[]>([
  {
    variationName: "",
    price: "",
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
      stockCount: "",
      isAvailable: true,
    },
  ]);
};

const updateVariation = (
  index: number,
  key: keyof VariationForm,
  value: any
) => {
  const updated = [...variations];
  updated[index] = {
    ...updated[index],
    [key]: value,
  };
  setVariations(updated);
};


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


  
  
const handleCreateProduct = async () => {
  try {
    if (!mainImage) {
      alert("Main image is required");
      return;
    }

    const formData = new FormData();

    /* ---------------- TEXT FIELDS ---------------- */
    formData.append("name", name);
    formData.append("description", description);
    formData.append("stockCount", String(stockCount));
    formData.append("actualPrice", actualPrice);
    formData.append("discountedPrice", discountedPrice);
    formData.append("subCategoryId", selectedSubCategory);

    /* ---------------- VARIATIONS (ADD HERE ✅) ---------------- */
    if (variationsEnabled) {
      const payloadVariations = variations.map((v) => ({
        variationName: v.variationName,
        price: Number(v.price),
        stockCount: Number(v.stockCount),
        isAvailable: v.isAvailable,
      }));

      formData.append("variations", JSON.stringify(payloadVariations));
    }

    /* ---------------- IMAGES ---------------- */
    formData.append("images", mainImage); // main image
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

          {/* ROW 1 */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Variation Name</label>
              <input
                value={v.variationName}
                onChange={(e) =>
                  updateVariation(index, "variationName", e.target.value)
                }
              />
            </div>

            <div className={styles.field}>
              <label>Price</label>
              <input
                type="number"
                value={v.price}
                onChange={(e) =>
                  updateVariation(index, "price", e.target.value)
                }
              />
            </div>
          </div>

          {/* ROW 2 */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Stock Count</label>
              <input
                type="number"
                value={v.stockCount}
                onChange={(e) =>
                  updateVariation(index, "stockCount", e.target.value)
                }
              />
            </div>

            <div className={styles.fieldCheckbox}>
              <label>Available</label>
              <input
                type="checkbox"
                checked={v.isAvailable}
                onChange={(e) =>
                  updateVariation(index, "isAvailable", e.target.checked)
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
