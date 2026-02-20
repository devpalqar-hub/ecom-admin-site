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
  const [stockCount, setStockCount] = useState<number>(0);
  const [actualPrice, setActualPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [isStock, setIsStock] = useState(true);
  const { showToast } = useToast();  const [isFeatured, setIsFeatured] = useState(false);
  const [variationTitle, setVariationTitle] = useState("");



  type VariationForm = {
  variationName: string;
  price: string;
  stockCount: string;
  isAvailable: boolean;
  discountedPrice: string; 
};

const [variationsEnabled, setVariationsEnabled] = useState(false);

const [variations, setVariations] = useState<VariationForm[]>([
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
    isActive: boolean;
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
        const res = await api.get("/categories", {
          params: {
            isActive: "true", 
          },
        });

        const allCategories: Category[] = res.data?.data?.data ?? [];

        const normalizedCategories = allCategories.map((cat) => ({
          ...cat,
          subCategories: cat.subCategories?.filter(
            (sub) => sub.isActive
          ) ?? [],
        }));

        setCategories(normalizedCategories);
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

    const selectedCategoryObj = categories.find(
      (cat) => cat.id === selectedCategory
    );

    if (
      selectedCategoryObj &&
      selectedCategoryObj.subCategories.length > 0 &&
      !selectedSubCategory
    ) {
      showToast("Subcategory is required", "error");
      return false;
    }


    if (stockCount < 0) {
      showToast("Stock quantity cannot be negative", "error");
      return false;
    }

    if (!actualPrice || Number(actualPrice) <= 0) {
      showToast("Regular price must be greater than 0", "error");
      return false;
    }

    if (Number(discountedPrice) < 0) {
      showToast("Discounted price cannot be negative", "error");
      return false;
    }

    if (
      discountedPrice &&
      Number(discountedPrice) > Number(actualPrice)
    ) {
      showToast(
        "Discounted price cannot be greater than regular price",
        "error"
      );
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

      const totalVariationStock = variations.reduce(
        (sum, v) => sum + Number(v.stockCount || 0),
        0
      );

      if (totalVariationStock > stockCount) {
        showToast(
          `Total variation stock (${totalVariationStock}) cannot exceed product stock (${stockCount})`,
          "error"
        );
        return false;
      }

      for (let i = 0; i < variations.length; i++) {
        const v = variations[i];

        if (!v.variationName.trim()) {
          showToast(`Variation ${i + 1}: Name is required`, "error");
          return false;
        }

        if (Number(v.stockCount) < 0) {
          showToast(
            `Variation ${i + 1}: Stock cannot be negative`,
            "error"
          );
          return false;
        }

        if (!v.price || Number(v.price) <= 0) {
          showToast(
            `Variation ${i + 1}: Price must be greater than 0`,
            "error"
          );
          return false;
        }

        if (Number(v.discountedPrice) < 0) {
          showToast(
            `Variation ${i + 1}: Discounted price cannot be negative`,
            "error"
          );
          return false;
        }

        if (
          v.discountedPrice &&
          Number(v.discountedPrice) > Number(v.price)
        ) {
          showToast(
            `Variation ${i + 1}: Discounted price cannot exceed price`,
            "error"
          );
          return false;
        }
      }
    }

    return true;
  };

  
const handleCreateProduct = async () => {
  if(!validateForm()) return;

  try {
    const formData = new FormData();

    /* ---------------- TEXT FIELDS ---------------- */
    formData.append("name", name);
    formData.append("description", description);
    formData.append("stockCount", String(stockCount));
    formData.append("actualPrice", actualPrice);
    const finalDiscount =
      discountedPrice === "" || discountedPrice === null || discountedPrice === " " || discountedPrice === "0"
      ? actualPrice 
      : discountedPrice
    formData.append("discountedPrice", finalDiscount);
    formData.append("subCategoryId", selectedSubCategory);
    formData.append("isFeatured", String(isFeatured));
    formData.append("isStock", String(isStock));
    formData.append("variationTitle", variationTitle);


    /* ---------------- VARIATIONS (ADD HERE ) ---------------- */
    if (variationsEnabled) {
      const payloadVariations = variations.map((v) => {
        const price = Number(v.price);
        const discounted =
          v.discountedPrice === "" || v.discountedPrice === null || v.discountedPrice === "0"
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
    
    showToast("Product created successfully", "success")
    navigate("/products");
  } catch (error: any) {
    console.error("Create product failed", error?.response?.data || error);
   showToast(
  error?.response?.data?.message || "Failed to create product",
  "error"
);
  }
};

const selectedCategoryObj = categories.find(
  (cat) => cat.id === selectedCategory
);

const filteredSubCategories = selectedCategoryObj?.subCategories ?? [];
const hasNoSubCategories =
  selectedCategoryObj &&
  selectedCategoryObj.subCategories.length === 0;


  /* ---------------- UI ---------------- */
  return (
  <div className={styles.page}>
    {/* HEADER */}
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

    {/* LAYOUT */}
    <div className={styles.layout}>
      {/* LEFT COLUMN */}
      <div className={styles.left}>
        {/* PRODUCT INFO */}
        <div className={styles.card}>
          <h3>Product Information</h3>

          <div className={styles.field}>
            <label>Product Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label>Stock Quantity *</label>
            <input
              type="number"
              value={stockCount === 0 ? "" : stockCount}
              onChange={(e) =>
                setStockCount(e.target.value === "" ? 0 : Number(e.target.value))
              }
            />
          </div>

          <div className={styles.field}>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.row}>
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

            <div className={styles.field}>
              <label>Subcategory *</label>
              <select
                value={selectedSubCategory}
                disabled={!selectedCategory || filteredSubCategories.length === 0}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
              >
                {filteredSubCategories.length === 0 ? (
                  <option value="">No subcategories available</option>
                ) : (
                  <>
                    <option value="">Select subcategory</option>
                    {filteredSubCategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {hasNoSubCategories && (
                <p className={styles.errorText}>
                  No subcategories found. Please create a subcategory to create a product.
                </p>
              )}

            </div>
          </div>
        </div>

        {/* PRICING */}
        <div className={styles.card}>
          <h3>Pricing</h3>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Regular Price *</label>
              <input
                value={actualPrice}
                onChange={(e) => setActualPrice(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>Discounted Price</label>
              <input
                value={discountedPrice}
                onChange={(e) => setDiscountedPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* IMAGES */}
        <div className={styles.card}>
          <h3>Product Images</h3>

          {/* MAIN IMAGE */}
          <label className={styles.uploadBox}>
            {mainImage ? (
              <img
                src={URL.createObjectURL(mainImage)}
                alt="Main product"
              />
            ) : (
              <span>+ Click to upload main image (JPG, PNG, GIF, WebP)</span>
            )}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleMainImageUpload}
            />
          </label>

          {/* ADD MORE */}
          <label className={styles.addMoreBox}>
            + Add more images
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleAdditionalImages}
            />
          </label>

          {/* EXTRA IMAGES */}
          {images.length > 0 && (
            <div className={styles.additionalGrid}>
              {images.map((img, i) => (
                <div key={i} className={styles.thumb}>
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`extra-${i}`}
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeImage(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VARIATIONS */}
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

          <p className={styles.mutedVariation}>
            Add variations like sizes, colors, or models
          </p>
          {/* NEW FIELD */}
          {/* Variation Title Field */}
        <div className={styles.variationTitleField}>
          <label>Variation Title</label>
          <input
            type="text"
            value={variationTitle}
            onChange={(e) => setVariationTitle(e.target.value)}
            placeholder="Size, Models, colors"
          />
        </div>
          {variationsEnabled && (
            <div className={styles.variationList}>
              {variations.map((v, index) => (
                <div key={index} className={styles.variationCard}>
                  <h4>Variation {index + 1}</h4>

                  <div className={styles.variationRow}>
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
                      <label>Stock Count</label>
                      <input
                        type="number"
                        value={v.stockCount}
                        onChange={(e) =>
                          updateVariation(index, "stockCount", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className={styles.variationRow}>
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

                    <div className={styles.field}>
                      <label>Discounted Price</label>
                      <input
                        type="number"
                        value={v.discountedPrice}
                        onChange={(e) =>
                          updateVariation(
                            index,
                            "discountedPrice",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className={styles.fieldCheckbox}>
                    <input
                      type="checkbox"
                      checked={v.isAvailable}
                      onChange={(e) =>
                        updateVariation(index, "isAvailable", e.target.checked)
                      }
                    />
                    <label>Available</label>
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

          <div className={styles.toggle}>
            <span>Featured Product</span>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={() => setIsFeatured((v) => !v)}
            />
          </div>

          <p className={styles.muted}>
            Featured products appear on homepage & promotions
          </p>
        </div>
      </div>
    </div>

    {/* ACTIONS */}
    <div className={styles.actions}>
      <button
        className={styles.cancel}
        onClick={() => navigate("/products")}
      >
        Cancel
      </button>
      <button
        className={styles.primary}
        onClick={handleCreateProduct}
        disabled={!name || !selectedSubCategory}
      >
        Create Product
      </button>
    </div>
  </div>
);
}