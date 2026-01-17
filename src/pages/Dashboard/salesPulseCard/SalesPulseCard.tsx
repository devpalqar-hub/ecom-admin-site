import { useEffect, useState } from "react";
import styles from "./SalesPulseCard.module.css";
import api from "../../../services/api";

type Period = "last_day" | "last_week" | "last_month" | "last_year";

export default function SalesPulseCard() {
  const [period, setPeriod] = useState<Period>("last_month");
  const [data, setData] = useState<number[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchSales = async () => {
      const res = await api.get("/analytics/sales-progress", {
        params: { period },
      });

      const values: number[] = res.data.data.data.map(Number);
      setData(values);
      setTotal(values.reduce((a, b) => a + b, 0));
    };

    fetchSales();
  }, [period]);

  return (
    
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Sales Pulse</h3>

        <div className={styles.toggle}>
          {["last_day", "last_week", "last_month", "last_year"].map((p) => (
            <button
              key={p}
              className={period === p ? styles.active : ""}
              onClick={() => setPeriod(p as Period)}
            >
              {p.replace("last_", "").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.value}>
        QAR {total.toLocaleString("en-IN")}
      </div>

      {total === 0 && (
        <p className={styles.noData}>
            No sales recorded for this period
        </p>
        )}


      <div className={styles.heatStrip}>
        {data.map((v, i) => (
          <span
            key={i}
            style={{
              opacity: Math.max(0.15, v / Math.max(...data)),
            }}
          />
        ))}
      </div>
    </div>
  );
}
