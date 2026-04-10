import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import styles from "./DeliveryCharges.module.css";
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import api from "../../services/api";
import ConfirmModal from "../../components/confirmModal/ConfirmModal";
import { useToast } from "../../components/toast/ToastContext";
/* ================= COMPONENT ================= */
export default function DeliveryCharges() {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  /* filters */
  const [search, setSearch] = useState("");
  /* pagination */
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  /* modals */
  const [showCreate, setShowCreate] = useState(false);
  const [editCode, setEditCode] = useState(null);
  const [deleteCode, setDeleteCode] = useState(null);
  /* create/edit form */
  const [postalCodes, setPostalCodes] = useState([]);
  const [postalInput, setPostalInput] = useState("");
  const [charge, setCharge] = useState("");
  const [isFreeDeliveryEligible, setIsFreeDeliveryEligible] = useState(false);
  /* ================= FETCH ================= */
  const fetchCharges = async () => {
    try {
      setLoading(true);
      const res = await api.get("/delivery-charges", {
        params: {
          page,
          limit,
          postalCode: search || undefined,
        },
      });
      const payload = res.data.data;
      setData(payload.data);
      setTotalPages(payload.meta.totalPages);
    } catch {
      showToast("Failed to fetch delivery charges", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCharges();
  }, [page, search]);
  /* ================= CREATE ================= */
  const addPostalCode = () => {
    const code = postalInput.trim();
    if (!code) return;
    if (postalCodes.includes(code)) return;
    setPostalCodes((prev) => [...prev, code]);
    setPostalInput("");
  };
  const handleCreate = async () => {
    const finalCodes = [...postalCodes];
    if (postalInput.trim()) {
      if (!finalCodes.includes(postalInput.trim())) {
        finalCodes.push(postalInput.trim());
      }
    }
    if (finalCodes.length === 0) {
      showToast("Please add at least one zone number", "error");
      return;
    }
    try {
      await api.post("/delivery-charges", {
        postalCodes: finalCodes,
        deliveryCharge: Number(charge),
        isFreeDeliveryEligible,
      });
      showToast("Delivery charges added successfully", "success");
      setPostalCodes([]);
      setPostalInput("");
      setCharge("");
      setShowCreate(false);
      fetchCharges();
    } catch {
      showToast("Failed to create delivery charges", "error");
    }
  };
  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    if (!editCode) return;
    try {
      await api.patch(`/delivery-charges/${editCode}`, {
        deliveryCharge: Number(charge),
        isFreeDeliveryEligible,
      });
      showToast("Delivery charge updated", "success");
      setEditCode(null);
      setCharge("");
      fetchCharges();
    } catch {
      showToast("Failed to update delivery charge", "error");
    }
  };
  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!deleteCode) return;
    try {
      await api.delete(`/delivery-charges/${deleteCode}`);
      showToast("Delivery charge deleted", "success");
      setDeleteCode(null);
      fetchCharges();
    } catch {
      showToast("Failed to delete delivery charge", "error");
    }
  };
  /* ================= UI ================= */
  return _jsxs("div", {
    className: styles.page,
    children: [
      _jsxs("div", {
        className: styles.header,
        children: [
          _jsxs("div", {
            children: [
              _jsx("h1", { children: "Delivery Charges" }),
              _jsx("p", { children: "Manage delivery charges by zone number" }),
            ],
          }),
          _jsxs("button", {
            className: styles.addBtn,
            onClick: () => setShowCreate(true),
            children: [_jsx(FiPlus, {}), " Add Charges"],
          }),
        ],
      }),
      _jsx("div", {
        className: styles.filters,
        children: _jsxs("div", {
          className: styles.searchBox,
          children: [
            _jsx(FiSearch, { className: styles.searchIcon }),
            _jsx("input", {
              placeholder: "Search zone number...",
              value: search,
              onChange: (e) => {
                setPage(1);
                setSearch(e.target.value);
              },
            }),
          ],
        }),
      }),
      _jsxs("div", {
        className: styles.tableWrapper,
        children: [
          loading
            ? _jsx("p", { className: styles.loading, children: "Loading..." })
            : _jsxs(_Fragment, {
                children: [
                  _jsxs("table", {
                    className: styles.desktopTable,
                    children: [
                      _jsx("thead", {
                        children: _jsxs("tr", {
                          children: [
                            _jsx("th", { children: "Zone Number" }),
                            _jsx("th", { children: "Delivery Charge" }),
                            _jsx("th", { children: "Created" }),
                            _jsx("th", { children: "Actions" }),
                          ],
                        }),
                      }),
                      _jsx("tbody", {
                        children: data.map((d) =>
                          _jsxs(
                            "tr",
                            {
                              children: [
                                _jsx("td", { children: d.postalCode }),
                                _jsxs("td", {
                                  children: ["QAR ", d.deliveryCharge],
                                }),
                                _jsx("td", {
                                  children: new Date(
                                    d.createdAt,
                                  ).toLocaleDateString(),
                                }),
                                _jsxs("td", {
                                  className: styles.actions,
                                  children: [
                                    _jsx("button", {
                                      className: styles.editBtn,
                                      onClick: () => {
                                        setEditCode(d.id);
                                        setCharge(d.deliveryCharge);
                                        setIsFreeDeliveryEligible(
                                          d.isFreeDeliveryEligible,
                                        );
                                      },
                                      children: _jsx(FiEdit2, {}),
                                    }),
                                    _jsx("button", {
                                      className: styles.deleteBtn,
                                      onClick: () => setDeleteCode(d.id),
                                      children: _jsx(FiTrash2, {}),
                                    }),
                                  ],
                                }),
                              ],
                            },
                            d.id,
                          ),
                        ),
                      }),
                    ],
                  }),
                  _jsx("div", {
                    className: styles.mobileCards,
                    children: data.map((d) =>
                      _jsxs(
                        "div",
                        {
                          className: styles.card,
                          children: [
                            _jsxs("div", {
                              className: styles.cardHeader,
                              children: [
                                _jsx("span", {
                                  className: styles.cardCode,
                                  children: d.postalCode,
                                }),
                                _jsxs("div", {
                                  className: styles.cardActions,
                                  children: [
                                    _jsx("button", {
                                      className: styles.editBtn,
                                      onClick: () => {
                                        setEditCode(d.id);
                                        setCharge(d.deliveryCharge);
                                        setIsFreeDeliveryEligible(
                                          d.isFreeDeliveryEligible,
                                        );
                                      },
                                      children: _jsx(FiEdit2, {}),
                                    }),
                                    _jsx("button", {
                                      className: styles.deleteBtn,
                                      onClick: () => setDeleteCode(d.id),
                                      children: _jsx(FiTrash2, {}),
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            _jsxs("div", {
                              className: styles.cardBody,
                              children: [
                                _jsxs("div", {
                                  className: styles.cardRow,
                                  children: [
                                    _jsx("span", {
                                      className: styles.label,
                                      children: "Charge:",
                                    }),
                                    _jsxs("span", {
                                      className: styles.value,
                                      children: ["QAR ", d.deliveryCharge],
                                    }),
                                  ],
                                }),
                                _jsxs("div", {
                                  className: styles.cardRow,
                                  children: [
                                    _jsx("span", {
                                      className: styles.label,
                                      children: "Created:",
                                    }),
                                    _jsx("span", {
                                      className: styles.value,
                                      children: new Date(
                                        d.createdAt,
                                      ).toLocaleDateString(),
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        },
                        d.id,
                      ),
                    ),
                  }),
                ],
              }),
          _jsxs("div", {
            className: styles.pagination,
            children: [
              _jsx("button", {
                className: styles.pageBtn,
                disabled: page === 1,
                onClick: () => setPage((p) => p - 1),
                children: "Prev",
              }),
              _jsxs("span", {
                className: styles.pageInfo,
                children: ["Page ", page, " of ", totalPages],
              }),
              _jsx("button", {
                className: styles.pageBtn,
                disabled: page === totalPages,
                onClick: () => setPage((p) => p + 1),
                children: "Next",
              }),
            ],
          }),
        ],
      }),
      (showCreate || editCode) &&
        _jsx("div", {
          className: styles.modalBackdrop,
          children: _jsxs("div", {
            className: styles.modal,
            children: [
              _jsx("h3", {
                children: editCode
                  ? "Edit Delivery Charge"
                  : "Add Delivery Charges",
              }),
              !editCode &&
                _jsxs("div", {
                  className: styles.chipInput,
                  children: [
                    postalCodes.map((c) =>
                      _jsxs(
                        "span",
                        {
                          className: styles.chip,
                          children: [
                            c,
                            _jsx(FiX, {
                              onClick: () =>
                                setPostalCodes(
                                  postalCodes.filter((p) => p !== c),
                                ),
                            }),
                          ],
                        },
                        c,
                      ),
                    ),
                    _jsx("input", {
                      value: postalInput,
                      placeholder: "Enter zone number",
                      onChange: (e) => setPostalInput(e.target.value),
                      onKeyDown: (e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addPostalCode();
                        }
                      },
                    }),
                  ],
                }),
              _jsx("input", {
                type: "number",
                placeholder: "Delivery Charge (QAR)",
                className: styles.modalInput,
                value: charge,
                onChange: (e) => setCharge(e.target.value),
              }),
              _jsxs("label", {
                className: styles.checkbox,
                children: [
                  _jsx("input", {
                    type: "checkbox",
                    checked: isFreeDeliveryEligible,
                    onChange: (e) =>
                      setIsFreeDeliveryEligible(e.target.checked),
                  }),
                  "Free Delivery Eligible",
                ],
              }),
              _jsxs("div", {
                className: styles.modalActions,
                children: [
                  _jsx("button", {
                    className: styles.cancelBtn,
                    onClick: () => {
                      setShowCreate(false);
                      setEditCode(null);
                      setPostalCodes([]);
                      setCharge("");
                      setIsFreeDeliveryEligible(false);
                    },
                    children: "Cancel",
                  }),
                  _jsx("button", {
                    className: styles.saveBtn,
                    onClick: editCode ? handleUpdate : handleCreate,
                    children: "Save",
                  }),
                ],
              }),
            ],
          }),
        }),
      _jsx(ConfirmModal, {
        open: !!deleteCode,
        title: "Delete Delivery Charge",
        message: "Are you sure you want to delete this delivery charge?",
        confirmText: "Delete",
        onCancel: () => setDeleteCode(null),
        onConfirm: handleDelete,
      }),
    ],
  });
}
