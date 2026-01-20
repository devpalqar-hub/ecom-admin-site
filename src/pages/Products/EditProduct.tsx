import { useEffect, useState } from "react";
import { FiArrowLeft, FiUpload, FiTrash2, FiPlus } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import styles from "./EditProduct.module.css";
import { useToast } from "../../components/toast/ToastContext";

/* ================= TYPES ================= */

type VariationForm = {
  id?: string;
  variationName: string;
  discountedPrice: string;
  actualPrice: string;
  stockCount: string;
  isAvailable: boolean;
};

type ProductImage = {
  id?: string;
  url: string;
  isMain?: boolean;
};

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  /* ================= PRODUCT ================= */

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stockCount, setStockCount] = useState(0);
  const [actualPrice, setActualPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [isStock, setIsStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [subCategoryId, setSubCategoryId] = useState("");

  /* ================= IMAGES ================= */

  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  /* ================= VARIATIONS ================= */

  const [variationsEnabled, setVariationsEnabled] = useState(false);
  const [variations, setVariations] = useState<VariationForm[]>([]);

  const [loading, setLoading] = useState(true);

  /* ================= LOAD PRODUCT ================= */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data.data;

        setName(p.name);
        setDescription(p.description || "");
        setStockCount(p.stockCount);
        setActualPrice(p.actualPrice);
        setDiscountedPrice(p.discountedPrice);
        setIsStock(p.isStock);
        setIsFeatured(p.isFeatured);
        setSubCategoryId(p.subCategoryId);

        if (p.images?.length) {
          setImages(p.images);
        }

        if (p.variations?.length) {
          setVariationsEnabled(true);
          setVariations(
            p.variations.map((v: any) => ({
              id: v.id,
              variationName: v.variationName,
              discountedPrice: v.discountedPrice,
              actualPrice: v.actualPrice,
              stockCount: String(v.stockCount),
              isAvailable: v.isAvailable,
            }))
          );
        }
      } catch {
        showToast("Failed to load product", "error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, showToast]);

  /* ================= IMAGE HANDLERS ================= */

 const handleImageChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const files = Array.from(e.target.files || []);
  if (!files.length || !id) return;

  try {
    const formData = new FormData();

    // Append multiple images
    files.forEach((file) => {
      formData.append("image", file); 
    });

    await api.post(
      `/products/${id}/gallery/images/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    showToast("Images uploaded successfully", "success");
    e.target.value = "";
  } catch (error: any) {
    console.error("Image upload failed", error);
    showToast(
      error?.response?.data?.message || "Image upload failed",
      "error"
    );
  }
};

const deleteImage = async (imageId?: string, index?: number) => {
  // New image
  if (!imageId && index !== undefined) {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    return;
  }

  if (!imageId || !id) {
    showToast("Invalid product or image", "error");
    return;
  }

  try {
    await api.delete(`/products/${id}/gallery/images/${imageId}`);

    setImages((prev) => prev.filter((img) => img.id !== imageId));
    showToast("Image deleted successfully", "success");
  } catch (err: any) {
    console.error(err);
    showToast(
      err?.response?.data?.message || "Failed to delete image",
      "error"
    );
  }
};

  /* ================= VARIATIONS ================= */

  const addVariation = () => {
    setVariations((v) => [
      ...v,
      {
        variationName: "",
        discountedPrice: "",
        actualPrice: "",
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
    const copy = [...variations];
    copy[index] = { ...copy[index], [key]: value };
    setVariations(copy);
  };

  const deleteVariation = async (index: number) => {
    const variation = variations[index];

    if (variation.id) {
      try {
        await api.delete(`/product-variations/${variation.id}`);
        showToast("Variation deleted", "success");
      } catch {
        showToast("Failed to delete variation", "error");
        return;
      }
    }

    setVariations((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const payload: any = {
      name,
      description,
      stockCount,
      actualPrice: Number(actualPrice),
      discountedPrice: Number(discountedPrice),
      subCategoryId,
      isStock,
      isFeatured,
    };

    if (variationsEnabled) {
      payload.variations = variations.map((v) => ({
        id: v.id,
        variationName: v.variationName,
        discountedPrice: Number(v.discountedPrice),
        actualPrice: Number(v.actualPrice),
        stockCount: Number(v.stockCount),
        isAvailable: v.isAvailable,
      }));
    }

    await api.patch(`/products/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    showToast("Product updated successfully", "success");
    navigate(-1);
  } catch (err) {
    console.error(err);
    showToast("Update failed", "error");
  }
};


  if (loading) return <p>Loading...</p>;

  /* ================= UI ================= */

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>

      <form className={styles.card} onSubmit={handleSubmit}>
        {/* IMAGE UPLOAD */}
<label className={styles.uploadBox}>
  <FiUpload size={22} />
  <span>Upload product images</span>
  <input
  hidden
  type="file"
  accept="image/*"
  multiple
  onChange={handleImageChange}
/>
</label>

<div className={styles.imageSection}>
  <h4 className={styles.imageTitle}>Product Images</h4>

  <div className={styles.imageGrid}>
    {/* EXISTING IMAGES (API DELETE) */}
    {images.map((img) => (
  <div
    key={img.id}
    className={`${styles.imageCard} ${
      img.isMain ? styles.mainImage : ""
    }`}
  >
    <img src={img.url} alt="product" />

    {/* MAIN BADGE */}
    {img.isMain && (
      <span className={styles.mainBadge}>Main</span>
    )}

    {/* DELETE (allowed for ALL images) */}
    <button
      type="button"
      className={styles.deleteIcon}
      onClick={() => deleteImage(img.id)}
      title="Delete image"
    >
      ×
    </button>
  </div>
))}


    {/* NEW IMAGE PREVIEWS (LOCAL DELETE) */}
    {newImages.map((file, i) => (
      <div key={`${file.name}-${i}`} className={styles.imageCard}>
        <img src={URL.createObjectURL(file)} alt="preview" />

        <button
          type="button"
          className={styles.deleteIcon}
          onClick={() => deleteImage(undefined, i)}
          title="Remove image"
        >
          ×
        </button>
      </div>
    ))}
  </div>
</div>

        {/* BASIC FIELDS */}
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label>Stock Quantity</label>
            <input
              type="number"
              value={stockCount}
              onChange={(e) => setStockCount(Number(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <label>Regular Price</label>
            <input value={actualPrice} onChange={(e) => setActualPrice(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label>Discounted Price</label>
            <input
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* STATUS */}
<div className={styles.switchRow}>
  {/* ACTIVE */}
  <div className={styles.toggleItem}>
    <span className={styles.toggleLabel}>Active</span>
    <label className={styles.toggleSwitch}>
      <input
        type="checkbox"
        checked={isStock}
        onChange={() => setIsStock(!isStock)}
      />
      <span className={styles.slider}></span>
    </label>
  </div>

  {/* FEATURED */}
  <div className={styles.toggleItem}>
    <span className={styles.toggleLabel}>Featured</span>
    <label className={styles.toggleSwitch}>
      <input
        type="checkbox"
        checked={isFeatured}
        onChange={() => setIsFeatured(!isFeatured)}
      />
      <span className={styles.slider}></span>
    </label>
  </div>
</div>

        {/* VARIATIONS */}
          <div className={styles.variationHeader}>
            <div>
              <h3>Product Variations</h3>
              <p className={styles.variationHint}>
                Add sizes, colors or models with different prices
              </p>
            </div>

            {/* TOGGLE */}
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={variationsEnabled}
                onChange={() => setVariationsEnabled((v) => !v)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        {variationsEnabled && (
          <div className={styles.variationList}>
            {variations.map((v, i) => (
              <div key={i} className={styles.variationCard}>
                <div className={styles.variationGrid}>
  <div className={styles.field}>
    <label>Variation Name</label>
    <input
      value={v.variationName}
      onChange={(e) =>
        updateVariation(i, "variationName", e.target.value)
      }
    />
  </div>

  <div className={styles.field}>
    <label>Discounted Price</label>
    <input
      value={v.discountedPrice}
      onChange={(e) =>
        updateVariation(i, "discountedPrice", e.target.value)
      }
    />
  </div>

  <div className={styles.field}>
    <label>Actual Price</label>
    <input
      value={v.actualPrice}
      onChange={(e) =>
        updateVariation(i, "actualPrice", e.target.value)
      }
    />
  </div>

  <div className={styles.field}>
    <label>Stock</label>
    <input
      type="number"
      value={v.stockCount}
      onChange={(e) =>
        updateVariation(i, "stockCount", e.target.value)
      }
    />
  </div>
</div>
                <div className={styles.variationActions}>
                  <label>
                    <input
                      type="checkbox"
                      checked={v.isAvailable}
                      onChange={(e) =>
                        updateVariation(i, "isAvailable", e.target.checked)
                      }
                    />
                    Available
                  </label>
                    <button
                      type="button"
                      onClick={() => deleteVariation(i)}
                      className={styles.delete}
                    >
                      <FiTrash2 />
                    </button>
                </div>
              </div>
            ))}

            <button type="button" onClick={addVariation} className={styles.addBtn}>
              <FiPlus /> Add Variation
            </button>
          </div>
        )}

        {/* ACTIONS */}
          <div className={styles.actions}>
            <button type="button" onClick={() => navigate(-1)}>
              Cancel
            </button>

            <button type="submit" className={styles.gradientBtn}>
              Update Product
            </button>
          </div>
      </form>
    </div>
  );
}
