import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import styles from "./SalesPulseCard.module.css";
import api from "../../../services/api";
export default function SalesPulseCard() {
    const [period, setPeriod] = useState("last_month");
    const [data, setData] = useState([]);
    const [labels, setLabels] = useState([]);
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
                const totalSales = values.reduce((sum, value) => sum + value, 0);
                setTotal(totalSales);
                setData(values);
                setLabels(apiData.xAxis);
            }
            finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, [period]);
    const maxValue = Math.max(...data, 0);
    const activeDays = data.filter((v) => v > 0).length;
    const average = activeDays > 0 ? total / activeDays : 0;
    return (_jsxs("div", { className: styles.card, children: [_jsxs("div", { className: styles.header, children: [_jsxs("h3", { className: styles.title, children: ["Sales Pulse", _jsx("span", { className: styles.info, title: "Total sales amount for the selected period. Hover bars for daily values.", children: "\u2139\uFE0F" })] }), _jsx("div", { className: styles.toggle, children: ["last_day", "last_week", "last_month", "last_year"].map((p) => (_jsx("button", { className: period === p ? styles.active : "", onClick: () => setPeriod(p), disabled: loading, children: p.replace("last_", "").toUpperCase() }, p))) })] }), _jsxs("div", { className: styles.value, children: ["QAR", " ", total.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })] }), total > 0 && (_jsxs("p", { className: styles.subText, children: [activeDays, " active days \u2022 Avg QAR", " ", average.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })] })), !loading && total === 0 && (_jsx("div", { className: styles.noDataBox, children: _jsx("p", { children: "No sales recorded for this period" }) })), _jsx("div", { className: styles.heatStrip, children: data.map((v, i) => (_jsx("span", { className: `${styles.bar} ${v === maxValue && v !== 0 ? styles.peak : ""}`, style: {
                        opacity: maxValue
                            ? Math.max(0.2, v / maxValue)
                            : 0.2,
                    }, "data-tooltip": `${labels[i]} • QAR ${v.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                    })}` }, i))) })] }));
}
