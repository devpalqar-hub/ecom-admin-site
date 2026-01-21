import { useEffect, useState } from "react";
import styles from "./SalesPulseCard.module.css";
import api from "../../../services/api";

type Period = "last_day" | "last_week" | "last_month" | "last_year";

export default function SalesPulseCard() {
  const [period, setPeriod] = useState<Period>("last_month");
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);

        const res = await api.get("/analytics/sales-progress", {
          params: { period },
        });

        const apiData = res.data.data;
        const values = apiData.data.map(Number);
        const totalSales = values.reduce(
          (sum: number, value: number) => sum + value,
          0
        );

        setTotal(totalSales);

        setData(values);
        setLabels(apiData.xAxis);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [period]);

  const maxValue = Math.max(...data, 0);
  const activeDays = data.filter((v) => v > 0).length;
  const average =
    activeDays > 0 ? total / activeDays : 0;

  return (
    <div className={styles.card}>
      {/* HEADER */}
      <div className={styles.header}>
        <h3 className={styles.title}>
          Sales Pulse
          <span
            className={styles.info}
            title="Total sales amount for the selected period. Hover bars for daily values."
          >
            ℹ️
          </span>
        </h3>

        <div className={styles.toggle}>
          {["last_day", "last_week", "last_month", "last_year"].map((p) => (
            <button
              key={p}
              className={period === p ? styles.active : ""}
              onClick={() => setPeriod(p as Period)}
              disabled={loading}
            >
              {p.replace("last_", "").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* TOTAL */}
      <div className={styles.value}>
        QAR{" "}
        {total.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>

      {/* SUB INFO */}
      {total > 0 && (
        <p className={styles.subText}>
          {activeDays} active days • Avg QAR{" "}
          {average.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      )}

      {/* EMPTY STATE */}
      {!loading && total === 0 && (
        <div className={styles.noDataBox}>
          <p>No sales recorded for this period</p>
        </div>
      )}

      {/* HEAT STRIP */}
      <div className={styles.heatStrip}>
        {data.map((v, i) => (
          <span
            key={i}
            className={`${styles.bar} ${
              v === maxValue && v !== 0 ? styles.peak : ""
            }`}
            style={{
              opacity: maxValue
                ? Math.max(0.2, v / maxValue)
                : 0.2,
            }}
            data-tooltip={`${labels[i]} • QAR ${v.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
              }
            )}`}
          />
        ))}
      </div>
    </div>
  );
}
