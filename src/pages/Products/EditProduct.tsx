import { useEffect, useState } from "react";
import { FiArrowLeft, FiUpload, FiTrash2, FiPlus } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import styles from "./EditProduct.module.css";
import { useToast } from "../../components/toast/ToastContext";



type VariationForm = {
  id?: string;
  variationName: string;
  discountedPrice: string;
  actualPrice: string;
  stockCount: string;
  isAvailable: boolean;
};

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

 
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stockCount, setStockCount] = useState<number>(0);
  const [actualPrice, setActualPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [isStock, setIsStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [subCategoryId, setSubCategoryId] = useState("");


  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

 
  const [variationsEnabled, setVariationsEnabled] = useState(false);
  const [variations, setVariations] = useState<VariationForm[]>([]);

  const [loading, setLoading] = useState(true);

 

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
          setPreview(
            p.images.find((i: any) => i.isMain)?.url || p.images[0].url
          );
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
  }, [id]);

  /* ================= HANDLERS ================= */

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

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

  // If variation already exists in backend
  if (variation.id) {
    try {
      await api.delete(`/product-variations/${variation.id}`);
      showToast("Variation deleted successfully", "success");
    } catch (error) {
      console.error("Delete variation failed", error);
      showToast("Failed to delete variation", "error");
      return; // stop UI update if API fails
    }
  }

  // Remove from UI state
  setVariations((prev) => prev.filter((_, i) => i !== index));
};

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
       
      formData.append("name", name);
      formData.append("description", description);
      formData.append("stockCount", String(stockCount));
      formData.append("actualPrice", actualPrice);
      formData.append("discountedPrice", discountedPrice);
      formData.append("subCategoryId", subCategoryId);
      formData.append("isStock", String(isStock));
      formData.append("isFeatured", String(isFeatured));

      if (imageFile) {
        formData.append("images", imageFile);
      }

      if (variationsEnabled) {
        formData.append(
          "variations",
          JSON.stringify(
            variations.map((v) => ({
              id: v.id,
              variationName: v.variationName,
              discountedPrice: Number(v.discountedPrice),
              actualPrice: Number(v.actualPrice),
              stockCount: Number(v.stockCount),
              isAvailable: v.isAvailable,
            }))
          )
        );
      }
      console.log(variations)
       console.log(formData,"")
      await api.patch(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("Product updated successfully", "success");
      navigate(-1);
    } catch {
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
        {/* IMAGE */}
        <label className={styles.uploadBox}>
          <FiUpload />
          <span>Upload product image</span>
          <input hidden type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        {preview && (
          <div className={styles.preview}>
            <img src={preview} alt="preview" />
          </div>
        )}

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
                  <input
                    placeholder="Variation Name"
                    value={v.variationName}
                    onChange={(e) =>
                      updateVariation(i, "variationName", e.target.value)
                    }
                  />
                  <input
                    placeholder="Discounted Price"
                    value={v.discountedPrice}
                    onChange={(e) =>
                      updateVariation(i, "discountedPrice", e.target.value)
                    }
                  />
                  <input
                    placeholder="Actual Price"
                    value={v.actualPrice}
                    onChange={(e) =>
                      updateVariation(i, "actualPrice", e.target.value)
                    }
                  />
                  <input
                    placeholder="Stock"
                    value={v.stockCount}
                    onChange={(e) =>
                      updateVariation(i, "stockCount", e.target.value)
                    }
                  />
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
          <button type="submit" className={styles.primary}>
            Update Product
          </button>
        </div>
      </form>
    </div>
  );
}
