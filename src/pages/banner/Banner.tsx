import { useEffect, useState } from "react";
import { FiEdit, FiTrash } from "react-icons/fi";
import styles from "./Banner.module.css";
import api from "../../services/api";
import { useToast } from "../../components/toast/ToastContext";

interface Banner {
  id: string;
  image: string;
  title: string;
  link: string;
  createdAt: string;
  updatedAt: string;
}

const Banners = () => {
  const { showToast } = useToast();

  const [banners, setBanners] = useState<Banner[]>([]);

  /* ================= CREATE STATE ================= */
  const [createImage, setCreateImage] = useState<File | null>(null);
  const [createTitle, setCreateTitle] = useState("");
  const [createLink, setCreateLink] = useState("");

  /* ================= EDIT STATE ================= */
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);

  /* ================= FETCH ================= */
  const fetchBanners = async () => {
    try {
      const res = await api.get("/banners");
      setBanners(res.data.data);
    } catch {
      showToast("Failed to fetch banners", "error");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    if (!createImage || !createTitle || !createLink) {
      showToast("All fields are required", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", createImage);
      formData.append("title", createTitle);
      formData.append("link", createLink);

      await api.post("/banners/admin", formData);

      showToast("Banner created successfully", "success");
      setCreateImage(null);
      setCreateTitle("");
      setCreateLink("");
      fetchBanners();
    } catch {
      showToast("Failed to create banner", "error");
    }
  };

  /* ================= OPEN EDIT ================= */
  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setEditTitle(banner.title);
    setEditLink(banner.link);
    setEditImage(null);
    setIsEditOpen(true);
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    if (!editingBanner) return;

    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("link", editLink);

      if (editImage) {
        formData.append("image", editImage);
      }

      await api.patch(`/banners/admin/${editingBanner.id}`, formData);

      showToast("Banner updated successfully", "success");
      closeEditModal();
      fetchBanners();
    } catch {
      showToast("Failed to update banner", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      await api.delete(`/banners/admin/${id}`);
      showToast("Banner deleted", "success");
      fetchBanners();
    } catch {
      showToast("Failed to delete banner", "error");
    }
  };

  /* ================= CLOSE EDIT ================= */
  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingBanner(null);
    setEditTitle("");
    setEditLink("");
    setEditImage(null);
  };

  /* ================= UI ================= */
  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <h1>Banners</h1>
        <p>Manage hero banners displayed on the client website</p>
      </div>

      {/* CREATE BANNER */}
      <div className={styles.tableWrapper}>
        <div className={styles.formCard}>
          <h3>Create Banner</h3>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCreateImage(e.target.files?.[0] || null)}
          />

          <input
            type="text"
            placeholder="Banner title"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
          />

          <input
            type="text"
            placeholder="Redirect link (https://...)"
            value={createLink}
            onChange={(e) => setCreateLink(e.target.value)}
          />

          <button onClick={handleCreate}>Create Banner</button>
        </div>
      </div>

      {/* MOBILE CARD LIST */}
      <div className={styles.mobileCardList}>
        {banners.map((b) => (
          <div key={b.id} className={styles.bannerCard}>
            <img src={b.image} alt={b.title} className={styles.cardImage} />
            <div className={styles.cardContent}>
              <h4 className={styles.cardTitle}>{b.title}</h4>
              <p className={styles.cardLink}>{b.link}</p>
              <p className={styles.cardDate}>
                Created: {new Date(b.createdAt).toLocaleDateString()}
              </p>
              <div className={styles.cardActions}>
                <button
                  className={`${styles.cardButton} ${styles.edit}`}
                  onClick={() => openEditModal(b)}
                >
                  <FiEdit size={16} />
                  Edit
                </button>
                <button
                  className={`${styles.cardButton} ${styles.delete}`}
                  onClick={() => handleDelete(b.id)}
                >
                  <FiTrash size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className={styles.empty}>No banners created</div>
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableScroll}>
          <table>
            <thead>
              <tr>
                <th>Preview</th>
                <th>Title</th>
                <th>Link</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {banners.map((b) => (
                <tr key={b.id}>
                  <td>
                    <img src={b.image} alt={b.title} className={styles.bannerImg} />
                  </td>
                  <td>{b.title}</td>
                  <td>{b.link}</td>
                  <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td className={styles.actions}>
                    <FiEdit onClick={() => openEditModal(b)} />
                    <FiTrash onClick={() => handleDelete(b.id)} />
                  </td>
                </tr>
              ))}

              {banners.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.empty}>
                    No banners created
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Edit Banner</h3>

            {/* Existing image preview */}
            {editingBanner && (
              <img
                src={editingBanner.image}
                className={styles.editPreview}
                alt="Current banner"
              />
            )}

            {/* New image input */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEditImage(e.target.files?.[0] || null)}
            />

            <input
              type="text"
              placeholder="Banner title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />

            <input
              type="text"
              placeholder="Redirect link"
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
            />

            <div className={styles.modalActions}>
              <button onClick={handleUpdate}>Update</button>
              <button className={styles.cancelBtn} onClick={closeEditModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;