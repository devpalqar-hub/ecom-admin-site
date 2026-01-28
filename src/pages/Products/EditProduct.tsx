import { useEffect, useState } from "react";
import { FiArrowLeft, FiUpload, FiTrash2, FiPlus } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import styles from "./EditProduct.module.css";
import { useToast } from "../../components/toast/ToastContext";
import axios from "axios";
import ConfirmModal from "../../components/confirmModal/ConfirmModal";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [showVariationDeleteConfirm, setShowVariationDeleteConfirm] =
    useState(false);
  const [deleteVariationIndex, setDeleteVariationIndex] =
    useState<number | null>(null);

  /* ================= LOAD PRODUCT ================= */
  const getErrorMessage = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      if (
        err.message?.includes("413") ||
        err.code === "ERR_BAD_REQUEST"
      ) {
        return "Uploaded images are too large. Please upload smaller images.";
      }
      if (err.response?.status === 413) {
        return "Uploaded images are too large. Please upload smaller images.";
      }

      return err.response?.data?.message || "Something went wrong";
    }

    return "Something went wrong";
  };


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
  } catch (err) {
    showToast(getErrorMessage(err), "error");
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
const handleConfirmDeleteImage = async () => {
  if (!deleteImageId || !id) return;

  try {
    await api.delete(
      `/products/${id}/gallery/images/${deleteImageId}`
    );

    setImages((prev) =>
      prev.filter((img) => img.id !== deleteImageId)
    );

    showToast("Image deleted successfully", "success");
  } catch (err: any) {
    showToast(
      err?.response?.data?.message || "Failed to delete image",
      "error"
    );
  } finally {
    setShowDeleteConfirm(false);
    setDeleteImageId(null);
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

  const handleConfirmDeleteVariation = async () => {
  if (deleteVariationIndex === null) return;

  const variation = variations[deleteVariationIndex];

  try {
    if (variation.id) {
      await api.delete(`/product-variations/${variation.id}`);
    }

    setVariations((prev) =>
      prev.filter((_, i) => i !== deleteVariationIndex)
    );

    showToast("Variation deleted successfully", "success");
  } catch {
    showToast("Failed to delete variation", "error");
  } finally {
    setShowVariationDeleteConfirm(false);
    setDeleteVariationIndex(null);
  }
};


  const validateForm = () => {
    if (variationsEnabled && variations.length === 0) {
      showToast("Add at least one variation or disable variations", "error");
      return false;
    }
    if (!name.trim()) {
      showToast("Product name is required", "error");
      return false;
    }

    if (stockCount < 0) {
      showToast("Stock quantity cannot be negative", "error");
      return false;
    }

    if (!actualPrice || Number(actualPrice) <= 0) {
      showToast("Actual price must be greater than 0", "error");
      return false;
    }

    if (Number(discountedPrice) < 0) {
      showToast("Discounted price cannot be negative", "error");
      return false;
    }

    if (Number(discountedPrice) > Number(actualPrice)) {
      showToast(
        "Discounted price cannot be greater than actual price",
        "error"
      );
      return false;
    }

    if (variationsEnabled) {
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
    }

    if (variationsEnabled) {
      for (let i = 0; i < variations.length; i++) {
        const v = variations[i];

        if (!v.variationName.trim()) {
          showToast(`Variation ${i + 1}: Name is required`, "error");
          return false;
        }

        if (!v.actualPrice || Number(v.actualPrice) <= 0) {
          showToast(
            `Variation ${i + 1}: Actual price must be greater than 0`,
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

        if (Number(v.discountedPrice) > Number(v.actualPrice)) {
          showToast(
            `Variation ${i + 1}: Discounted price cannot exceed actual price`,
            "error"
          );
          return false;
        }

        if (Number(v.stockCount) < 0) {
          showToast(
            `Variation ${i + 1}: Stock cannot be negative`,
            "error"
          );
          return false;
        }
      }
    }

    return true;
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  try {
    const payload: any = {
      name,
      description,
      stockCount,
      actualPrice: Number(actualPrice),
      discountedPrice: Number(discountedPrice),
      subCategoryId,
      isFeatured,
    };

    if (variationsEnabled) {
      payload.variations = variations.map((v) => ({
        id: v.id,
        variationName: v.variationName,
        discountedPrice: Number(v.discountedPrice),
        actualPrice: Number(v.actualPrice),
        stockCount: Number(v.stockCount),
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
    showToast(getErrorMessage(err), "error");
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
              onClick={() => {
                setDeleteImageId(img.id!);
                setShowDeleteConfirm(true);
              }}
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
  {/* <div className={styles.toggleItem}>
    <span className={styles.toggleLabel}>Active</span>
    <label className={styles.toggleSwitch}>
      <input
        type="checkbox"
        checked={isActive}
        onChange={() => setIsActive(!isActive)}
      />
      <span className={styles.slider}></span>
    </label>
  </div> */}

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
    <label>Actual Price</label>
    <input
      value={v.actualPrice}
      onChange={(e) =>
        updateVariation(i, "actualPrice", e.target.value)
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
    <label>Stock</label>
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={v.stockCount}
       onChange={(e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
          updateVariation(i, "stockCount", value);
        }
      }}
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
                      onClick={() => {
                        setDeleteVariationIndex(i);
                        setShowVariationDeleteConfirm(true);
                      }}
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
      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteImageId(null);
        }}
        onConfirm={handleConfirmDeleteImage}
      />
      <ConfirmModal
        open={showVariationDeleteConfirm}
        title="Delete Variation"
        message="Are you sure you want to delete this variation?"
        confirmText="Delete"
        onCancel={() => {
          setShowVariationDeleteConfirm(false);
          setDeleteVariationIndex(null);
        }}
        onConfirm={handleConfirmDeleteVariation}
      />
    </div>
  );
}
