import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Navbar from "./Navbar";
import Footer from "../Components/Footer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const EMAIL_BASE_URL = API_BASE_URL.replace("/api", "");

const PantryReport = ({ userId }) => {
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("expiry");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [emailStatus, setEmailStatus] = useState(""); // "success" | "error"
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
  if (!userId) return;

  const fetchPantryAndNotify = async () => {
    setLoading(true);

    // Ask for permission if not yet decided
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      console.log("🔔 Permission result:", permission);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/pantry/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch pantry items");
      const data = await res.json();
      const items = Array.isArray(data.data) ? data.data : [];
      setPantryItems(items);
      setLastUpdated(new Date().toLocaleString());
      setLoading(false);

      const expiringItems = items.filter((item) => {
        const days = calculateDays(item.expiry);
        return days < 0 || days === 3;
      });

      if (Notification.permission === "granted") {
        expiringItems.forEach((item) => {
          const days = calculateDays(item.expiry);
          const status = getStatus(days);
          new Notification(
            status === "expired"
              ? `🛑 ${item.name} has expired!`
              : `⚠️ ${item.name} will expire in ${days} days!`,
            { body: `Category: ${item.category || "Uncategorized"}` }
          );
        });
      } else if (Notification.permission === "denied") {
        console.warn("🚫 Notifications are blocked in browser settings.");
      }

      if (expiringItems.length > 0) {
        await Promise.all(
          expiringItems.map(async (item) => {
            const type = calculateDays(item.expiry) < 0 ? "expired" : "expiringSoon";
            try {
              await fetch(`${EMAIL_BASE_URL}/email/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId,
                  pantryItemId: item._id,
                  type,
                  subject: "Expiry Alert - Pantry Item",
                  text: `${item.name} is ${
                    type === "expired" ? "expired" : "expiring soon"
                  }.`,
                }),
              });
            } catch (err) {
              console.error("Email send error:", err);
            }
          })
        );
      }
    } catch (err) {
      setLoading(false);
      console.error("❌ Pantry fetch error:", err);
    }
  };

  fetchPantryAndNotify();
}, [userId]);

  // ------------------------ Utility functions ------------------------
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const calculateDays = (expiry) => {
    const today = new Date();
    const exp = new Date(expiry);
    const diffTime = exp - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatus = (days) => {
    if (days < 0) return "expired";
    if (days <= 3) return "soon";
    return "safe";
  };

  const getColor = (status) => {
    if (status === "expired") return "#e74c3c";
    if (status === "soon") return "#f39c12";
    return "#27ae60";
  };

  const getCategoryEmoji = (category) => {
    switch (category?.toLowerCase()) {
      case "fruits":
        return "🍎";
      case "vegetables":
        return "🥦";
      case "dairy":
        return "🥛";
      case "meat":
        return "🥩";
      case "grains":
        return "🍞";
      case "snacks":
        return "🍪";
      case "condiments":
        return "🧂";
      case "bakery":
        return "🥐";
      default:
        return "📦";
    }
  };

  const getProgress = (addedDate, expiry) => {
    const start = addedDate
      ? new Date(addedDate)
      : new Date(new Date(expiry) - 7 * 24 * 60 * 60 * 1000);
    const end = new Date(expiry);
    const today = new Date();

    if (today >= end) return 100;
    const totalDays = (end - start) / (1000 * 60 * 60 * 24);
    const usedDays = (today - start) / (1000 * 60 * 60 * 24);

    return Math.max(0, Math.min(100, (usedDays / totalDays) * 100));
  };

  // ------------------------ Filter, sort, group ------------------------
  const filteredItems = pantryItems
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .filter((item) => {
      const status = getStatus(calculateDays(item.expiry));
      return filter === "all" ? true : status === filter;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "days")
        return calculateDays(a.expiry) - calculateDays(b.expiry);
      return new Date(a.expiry) - new Date(b.expiry);
    });

  const groupedItems = filteredItems.reduce((groups, item) => {
    const category = item.category || "Uncategorized";
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {});

  // ------------------------ PDF generation ------------------------
  const generatePDFBlob = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Pantry Report", 105, 15, null, null, "center");

    doc.setFontSize(11);
    doc.text(`User ID: ${userId}`, 14, 25);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

    Object.keys(groupedItems).forEach((category) => {
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `${getCategoryEmoji(category)} ${category}`,
        14,
        doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 40
      );

      const tableData = groupedItems[category].map((item) => {
        const days = calculateDays(item.expiry);
        const status = getStatus(days);
        const progress = getProgress(item.addedDate, item.expiry);
        const statusLabel =
          days < 0
            ? `Expired (${Math.abs(days)} days ago)`
            : `Expires in ${days} days`;
        return [
          item.name,
          item.category || "Uncategorized",
          formatDate(item.expiry),
          statusLabel,
          status.toUpperCase(),
          `${Math.round(progress)}%`,
        ];
      });

      autoTable(doc, {
        head: [
          ["Name", "Category", "Expiry Date", "Days Left", "Status", "Progress"],
        ],
        body: tableData,
        startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 5 : 45,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [230, 126, 34] },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 4) {
            if (data.cell.raw === "EXPIRED") {
              data.cell.styles.textColor = [255, 255, 255];
              data.cell.styles.fillColor = [231, 76, 60];
            } else if (data.cell.raw === "SOON") {
              data.cell.styles.fillColor = [243, 156, 18];
            } else if (data.cell.raw === "SAFE") {
              data.cell.styles.fillColor = [46, 204, 113];
            }
          }
        },
      });
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, 200, 290, null, null, "right");
    }

    return doc;
  };

  const downloadPDF = () => {
    const doc = generatePDFBlob();
    doc.save("PantryReport.pdf");
  };

  const sendEmailWithPDF = async () => {
    if (!userId) return;

    try {
      setEmailSending(true);
      setEmailStatus("");
      console.log("✅ Generating PDF...");

      const doc = generatePDFBlob();
      const pdfBlob = doc.output("blob");
      const pdfBase64 = await blobToBase64(pdfBlob);

      if (!pdfBase64) {
        console.error("❌ PDF base64 is empty!");
        setEmailStatus("error");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, pdfBase64 }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok && data.success) {
        setEmailStatus("success");
      } else {
        setEmailStatus("error");
      }
    } catch (err) {
      console.error("❌ Error sending PDF email:", err);
      setEmailStatus("error");
    } finally {
      setEmailSending(false);
    }
  };

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(blob);
    });

  // ------------------------ Render ------------------------
  if (!userId) {
    return (
      <>
        <Navbar />
        <div className="center-message">Please login to view pantry report.</div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="center-message loading">Loading pantry items...</div>
      </>
    );
  }

  if (!pantryItems.length) {
    return (
      <>
        <Navbar />
        <div className="center-message empty">🥫 Your pantry is empty! Start adding items to track expiry dates.</div>
      </>
    );
  }

  const renderItem = (item) => {
    const days = calculateDays(item.expiry);
    const status = getStatus(days);
    const progress = getProgress(item.addedDate, item.expiry);
    const label =
      status === "expired"
        ? `Expired: ${formatDate(item.expiry)} (${Math.abs(days)} days ago)`
        : `Expires: ${formatDate(item.expiry)} (in ${days} days)`;

    return (
      <li
        key={item._id}
        className={`pantry-item ${status}`}
        style={{ animation: "fadeIn 0.5s ease" }}
      >
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.name} className="item-img" />
        )}
        <div className="item-info">
          <span className="item-name">{item.name}</span>
          <br />
          <span className="status-badge" style={{ background: getColor(status) }}>
            {status.toUpperCase()}
          </span>
          <br />
          <span className="item-label" style={{ color: getColor(status) }}>{label}</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.max(progress, 5)}%`, background: getColor(status) }} />
          </div>
        </div>
      </li>
    );
  };

  return (
    <>
      <Navbar />
      <div className="report-container">
{/*         {emailSending && <div className="email-status sending">Sending PDF...</div>} */}
{/*         {emailStatus === "success" && <div className="email-status success">✅ PDF sent successfully!</div>} */}
{/*         {emailStatus === "error" && <div className="email-status error">❌ Failed to send PDF</div>} */}

        <div className="report-actions">
          <input type="text" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="expired">Expired</option>
            <option value="soon">Expiring Soon</option>
            <option value="safe">Safe</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="expiry">Sort by Expiry Date</option>
            <option value="name">Sort by Name</option>
            <option value="days">Sort by Days Left</option>
          </select>
          <button onClick={downloadPDF} className="btn download">Download PDF</button>
          <button onClick={sendEmailWithPDF} className="btn send">Send via Email</button>
        </div>

        {Object.keys(groupedItems).map((category) => (
          <div key={category} className="category-section">
            <h3>{getCategoryEmoji(category)} {category}</h3>
            <ul className="pantry-list">
              {groupedItems[category].map(renderItem)}
            </ul>
          </div>

        ))}
      </div>
         <Footer />

      <style>{`
  body {
    background: linear-gradient(to right, #fffaf5, #fff);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
  }

  .center-message {
    text-align: center;
    margin-top: 80px;
    color: #e67e22;
    font-size: 18px;
  }
  .loading { color: #d35400; }
  .empty { color: #f39c12; }

  .report-container {
    min-height: 100vh;
    padding: 120px 24px 50px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .report-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 25px;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }

  .report-actions input, .report-actions select {
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease;
  }
  .report-actions input:focus, .report-actions select:focus {
    border-color: #e67e22;
    box-shadow: 0 0 5px rgba(230,126,34,0.3);
  }

  .btn {
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 3px 6px rgba(0,0,0,0.1);
  }
  .btn.download { background: #f39c12; color: white; }
  .btn.send { background: #e67e22; color: white; }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 10px rgba(0,0,0,0.15); opacity: 0.95; }

  .email-status {
    text-align: center;
    padding: 10px 0;
    border-radius: 8px;
    margin-bottom: 15px;
    font-weight: bold;
    color: #fff;
    animation: fadeIn 0.5s ease;
  }
  .email-status.sending { background: #3498db; }
  .email-status.success { background: #2ecc71; }
  .email-status.error { background: #e74c3c; }

  .category-section {
    margin-bottom: 40px;
  }
  .category-section h3 {
    margin-bottom: 15px;
    color: #e67e22;
    font-size: 20px;
    font-weight: 700;
    border-bottom: 2px solid #f39c12;
    padding-bottom: 5px;
  }

  .pantry-list { list-style: none; padding: 0; margin: 0; }
  .pantry-item {
    background: #fff;
    padding: 18px 20px;
    margin-bottom: 16px;
    border-radius: 14px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.07);
    display: flex;
    align-items: center;
    gap: 18px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .pantry-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 14px rgba(0,0,0,0.12);
  }

  .item-img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 10px;
    flex-shrink: 0;
  }
  .item-info { flex-grow: 1; }
  .item-name { font-weight: 600; color: #2c3e50; font-size: 16px; }
  .status-badge {
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: bold;
    display: inline-block;
    margin-top: 4px;
    color: #fff;
  }
  .item-label { font-size: 13px; display: block; margin-top: 3px; color: #555; }

  .progress-bar {
    width: 100%;
    background: #f2f2f2;
    border-radius: 10px;
    margin-top: 8px;
    height: 10px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 0.5s ease;
    background: linear-gradient(90deg, #f39c12, #e67e22);
  }

  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(5px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`}</style>

    </>
  );
};

export default PantryReport;

