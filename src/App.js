// QUICK START (Create React App version)
// 1) Place 'Classy Junk Removal Logo 2.png' and 'Classy Junk Removal Mascot 2.png' inside your /public folder.
// 2) Replace src/App.js with this code.
// 3) Run: npm start → Test locally at http://localhost:3000

import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import React, { useState } from "react";
import jsPDF from "jspdf";

// --- Helper: load /public images as base64 to avoid PNG signature error ---
async function loadPublicImageAsDataURL(pathFromPublic) {
  const res = await fetch(`${process.env.PUBLIC_URL}${pathFromPublic}`);
  if (!res.ok) throw new Error(`Image fetch failed: ${pathFromPublic} (${res.status})`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// --- Reusable Components ---
function Field({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ display: "grid", gap: 6, textAlign: "left" }}>
      <label style={{ fontWeight: 700, color: "#001840", fontSize: 14 }}>
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          padding: "12px 14px",
          border: "1px solid #d5d7de",
          borderRadius: 12,
          fontSize: 16,
        }}
      />
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
        marginBottom: 16,
      }}
    >
      {title && (
        <h3 style={{ color: "#102A71", fontWeight: 800, marginBottom: 8 }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", full }) {
  const classyBlue = "#102A71";
  const classyNavy = "#001840";
  const classyYellow = "#F5C400";

  const styles = {
    base: {
      borderRadius: 14,
      padding: "14px 18px",
      fontWeight: 800,
      fontSize: 16,
      cursor: "pointer",
      width: full ? "100%" : "auto",
      border: "none",
    },
    primary: { background: classyBlue, color: "#fff" },
    secondary: { background: classyYellow, color: classyNavy },
    outline: {
      background: "transparent",
      color: classyBlue,
      border: `2px solid ${classyBlue}`,
    },
  };

  const style = { ...styles.base, ...(styles[variant] || styles.primary) };
  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  );
}

// --- Main App ---
export default function App() {
  const [screen, setScreen] = useState("home");
  const [quotesList, setQuotesList] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    loads: "",
    hours: "",
    crew: "",
    distance: "",
    trips: "",
    notes: "",
  });
  const [quote, setQuote] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [uploading, setUploading] = useState(false);

  const classyBlue = "#102A71";
  const classyNavy = "#001840";

  // --- Input handler ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // --- Quote Calculation ---
  const handleCalculate = () => {
    const loads = parseFloat(form.loads || 0);
    const hours = parseFloat(form.hours || 0);
    const crew = parseFloat(form.crew || 1);
    const distance = parseFloat(form.distance || 0);
    const trips = parseFloat(form.trips || 1);
    const markup = 70;

    const loadCost = loads * 150;
    const laborCost = hours * crew * 35;
    const travelCost = distance * 2 * trips;
    const base = loadCost + laborCost + travelCost;
    const total = base * (1 + markup / 100);

    setQuote(total.toFixed(2));
  };

  // --- Upload Photo ---
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `quotes/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageURL(url);
      alert("✅ Photo uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Error uploading photo");
    } finally {
      setUploading(false);
    }
  };

  // --- Save Quote ---
  const handleSaveQuote = async () => {
    try {
      await addDoc(collection(db, "quotes"), {
        ...form,
        total: quote,
        createdAt: Timestamp.now(),
        imageURL: imageURL || null,
      });
      alert("✅ Quote saved to the cloud!");
      setImageURL(null);
    } catch (error) {
      console.error("Error saving quote:", error);
      alert("❌ Error saving quote. Check console for details.");
    }
  };

  // --- Branded PDF Export / View (with optional job photo page) ---
  const handleExportPDF = async (mode = "download") => {
    const docPDF = new jsPDF("p", "pt", "letter");

    // Load brand images
    const logoDataURL = await loadPublicImageAsDataURL(
      "/junk-logo.png"
    );
    const mascotDataURL = await loadPublicImageAsDataURL(
      "/mascot.png"
    );

    const COLORS = {
      navy: "#001840",
      blue: "#102A71",
      yellow: "#F5C400",
      text: "#1A1A1A",
    };

    // HEADER
    docPDF.setFillColor(COLORS.navy);
    docPDF.rect(0, 0, 612, 90, "F");
    // --- Add logo (preserve aspect ratio) ---
const logoImg = new Image();
logoImg.src = logoDataURL;
const logoMaxWidth = 180;   // limit how wide the logo can be
const logoMaxHeight = 60;   // limit how tall it can be

// Wait for the logo to load and calculate scaled dimensions
await new Promise((resolve) => {
  logoImg.onload = () => {
    const ratio = Math.min(
      logoMaxWidth / logoImg.width,
      logoMaxHeight / logoImg.height
    );
    const displayWidth = logoImg.width * ratio;
    const displayHeight = logoImg.height * ratio;
    docPDF.addImage(
      logoDataURL,
      "PNG",
      40,
      25,
      displayWidth,
      displayHeight
    );
    resolve();
  };
});
    docPDF.setFont("helvetica", "bold");
    docPDF.setFontSize(28);
    docPDF.setTextColor("#FFFFFF");
    docPDF.text("ESTIMATE", 572, 55, { align: "right" });

    // ACCENT BAR
    docPDF.setFillColor(COLORS.yellow);
    docPDF.rect(0, 90, 612, 6, "F");

    // BACKGROUND MASCOT
    try {
      const s = docPDF.GState({ opacity: 0.05 });
      docPDF.setGState(s);
    } catch (e) {}
    docPDF.addImage(mascotDataURL, "PNG", 110, 135, 420, 680);
    try {
      const s2 = docPDF.GState({ opacity: 1 });
      docPDF.setGState(s2);
    } catch (e) {}

    // CUSTOMER INFO
    docPDF.setFont("helvetica", "normal");
    docPDF.setFontSize(12);
    docPDF.setTextColor(COLORS.navy);

    const leftX = 40;
    let y = 120;
    docPDF.text(`Customer: ${form.name || ""}`, leftX, y);
    y += 18;
    if (form.address) {
      docPDF.text(form.address, leftX, y);
      y += 18;
    }
    if (form.phone) {
      docPDF.text(form.phone, leftX, y);
      y += 18;
    }
    if (form.email) {
      docPDF.text(form.email, leftX, y);
      y += 18;
    }

    docPDF.text(`Date: ${new Date().toLocaleDateString()}`, 400, 120);

    // JOB DETAILS
    docPDF.setFontSize(11);
    let jobY = Math.max(y, 180);
    const details = [
      ["Number of Loads", form.loads],
      ["Man Hours", form.hours],
      ["Crew Members", form.crew],
      ["Distance (miles)", form.distance],
      ["Trips", form.trips],
    ];
    details.forEach(([label, val]) => {
      docPDF.text(`${label}: ${val || "—"}`, leftX, jobY);
      jobY += 16;
    });

    // TOTAL
    jobY += 20;
    docPDF.setFont("helvetica", "bold");
    docPDF.setFontSize(16);
    docPDF.setTextColor(COLORS.blue);
    docPDF.text(`Estimated Total: $${quote || "—"}`, leftX, jobY);

    // NOTES
    jobY += 25;
    docPDF.setFont("helvetica", "normal");
    docPDF.setFontSize(11);
    docPDF.setTextColor(COLORS.text);
    docPDF.text("Notes:", leftX, jobY);
    jobY += 14;
    docPDF.text(form.notes || "—", leftX + 15, jobY, { maxWidth: 520 });

    // FOOTER
    docPDF.setFillColor(COLORS.navy);
    docPDF.rect(0, 730, 612, 62, "F");
    docPDF.setTextColor("#FFFFFF");
    docPDF.setFontSize(10);
    docPDF.text(
      "706-413-9955  •  doswald@classybins.com  •  classybins.com",
      306,
      760,
      { align: "center" }
    );
    docPDF.setFontSize(12);
    docPDF.text("Stay Classy.", 306, 780, { align: "center" });

    // PAGE 2 — job photo if exists
    if (imageURL) {
      try {
        const imgRes = await fetch(imageURL);
        const imgBlob = await imgRes.blob();
        const imgReader = new FileReader();
        const imageBase64 = await new Promise((resolve, reject) => {
          imgReader.onloadend = () => resolve(imgReader.result);
          imgReader.onerror = reject;
          imgReader.readAsDataURL(imgBlob);
        });

        docPDF.addPage();
        docPDF.setFontSize(18);
        docPDF.setTextColor(COLORS.navy);
        docPDF.text("Job Photo", 306, 50, { align: "center" });
        docPDF.addImage(imageBase64, "JPEG", 60, 80, 480, 360);
      } catch (err) {
        console.warn("Could not add job photo:", err);
      }
    }

    // --- OUTPUT ---
const fileName = `ClassyEstimate_${form.name || "Customer"}.pdf`;

if (mode === "view") {
  // Create a Blob and open it in a new tab
  const blob = docPDF.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl, "_blank");

  if (!win) {
    alert("⚠️ Pop-up blocked — please allow pop-ups to preview the PDF.");
  }
} else {
  docPDF.save(fileName);
}
  };

  // --- Load Quotes ---
  const loadQuotes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "quotes"));
      const quotes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuotesList(quotes);
    } catch (error) {
      console.error("Error loading quotes:", error);
    }
  };

  // --- Update Quote ---
  const handleUpdateQuote = async () => {
    if (!selectedQuote) return alert("No quote selected");
    try {
      await updateDoc(doc(db, "quotes", selectedQuote.id), {
        ...form,
        total: quote,
        updatedAt: Timestamp.now(),
      });
      alert("✅ Quote updated successfully!");
      setScreen("history");
      loadQuotes();
    } catch (error) {
      console.error("Error updating quote:", error);
      alert("❌ Error updating quote.");
    }
  };

  // --- UI ---
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFDF0",
        padding: 16,
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
        textAlign: "center",
      }}
    >
      <div style={{
  backgroundColor: "#001840",
  color: "#fff",
  padding: "10px 20px",
  fontWeight: 800,
  fontSize: 18,
  letterSpacing: "0.5px",
}}>
  Classy Junk Removal • Estimate Builder
</div>
      <img
        src="/junk-logo.png"
        alt="Classy Junk Removal Logo"
        style={{ width: 220, margin: "40px auto 20px" }}
      />

      {/* HOME SCREEN */}
      {screen === "home" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h1 style={{ color: classyNavy, fontSize: 26, fontWeight: 900 }}>
            Classy Junk Removal
          </h1>
          <Button onClick={() => setScreen("new")} variant="primary" full>
            New Quote
          </Button>
          <Button
            onClick={() => {
              setScreen("history");
              loadQuotes();
            }}
            variant="secondary"
            full
          >
            View Past Quotes
          </Button>
        </div>
      )}

      {/* NEW QUOTE SCREEN */}
      {screen === "new" && (
        <div>
          <h2 style={{ color: classyNavy, fontWeight: 900 }}>New Quote</h2>
          <Card title="Customer Info">
            <Field label="Name" name="name" value={form.name} onChange={handleChange} />
            <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            <Field label="Email" name="email" value={form.email} onChange={handleChange} />
            <Field label="Address" name="address" value={form.address} onChange={handleChange} />
          </Card>

          <Card title="Job Details">
            <Field label="Number of Loads" name="loads" value={form.loads} onChange={handleChange} />
            <Field label="Man Hours" name="hours" value={form.hours} onChange={handleChange} />
            <Field label="Crew Members" name="crew" value={form.crew} onChange={handleChange} />
            <Field label="Distance (miles)" name="distance" value={form.distance} onChange={handleChange} />
            <Field label="Trips" name="trips" value={form.trips} onChange={handleChange} />
            <Field label="Notes" name="notes" value={form.notes} onChange={handleChange} />

            <div style={{ marginTop: 10, textAlign: "left" }}>
              <label style={{ fontWeight: 700, color: "#001840" }}>
                Upload Job Photo (optional)
              </label>
              <input type="file" accept="image/*" onChange={handleUploadImage} />
              {uploading && <p>Uploading photo...</p>}
              {imageURL && (
                <img
                  src={imageURL}
                  alt="Uploaded"
                  style={{ width: "100%", borderRadius: 8, marginTop: 8 }}
                />
              )}
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              <Button onClick={handleCalculate} variant="primary" full>
                Calculate Quote
              </Button>
              {quote && (
                <div style={{ fontSize: 18, fontWeight: 900 }}>
                  Estimated Total: ${quote}
                </div>
              )}
              <Button onClick={handleSaveQuote} variant="secondary" full>
                Save Quote to Cloud
              </Button>
              <Button onClick={() => setScreen("home")} variant="outline" full>
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* EDIT SCREEN */}
      {screen === "edit" && (
        <div>
          <h2 style={{ color: classyNavy, fontWeight: 900 }}>Edit Quote</h2>
          <Card title="Customer Info">
            <Field label="Name" name="name" value={form.name} onChange={handleChange} />
            <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            <Field label="Email" name="email" value={form.email} onChange={handleChange} />
            <Field label="Address" name="address" value={form.address} onChange={handleChange} />
          </Card>

          <Card title="Job Details">
            <Field label="Number of Loads" name="loads" value={form.loads} onChange={handleChange} />
            <Field label="Man Hours" name="hours" value={form.hours} onChange={handleChange} />
            <Field label="Crew Members" name="crew" value={form.crew} onChange={handleChange} />
            <Field label="Distance (miles)" name="distance" value={form.distance} onChange={handleChange} />
            <Field label="Trips" name="trips" value={form.trips} onChange={handleChange} />
            <Field label="Notes" name="notes" value={form.notes} onChange={handleChange} />

            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
  <Button onClick={handleCalculate} variant="primary" full>
    Recalculate Quote
  </Button>

  {quote && (
    <div style={{ fontSize: 18, fontWeight: 900 }}>
      Updated Total: ${quote}
    </div>
  )}

  <Button onClick={handleUpdateQuote} variant="secondary" full>
    Save Changes
  </Button>

  {quote && (
    <>
      <Button onClick={() => handleExportPDF("view")} variant="outline" full>
        👁️ View PDF
      </Button>
      <Button onClick={() => handleExportPDF("download")} variant="secondary" full>
        ⬇️ Export as PDF
      </Button>
    </>
  )}

  <Button onClick={() => setScreen("history")} variant="outline" full>
    Back to Quotes
  </Button>
</div>
</Card>
</div>
)}
{/* HISTORY SCREEN */}
{screen === "history" && (
  <div>
    <h2 style={{ color: classyNavy, fontWeight: 900 }}>Past Quotes</h2>
    <Card>
      {quotesList.length === 0 ? (
        <p>No quotes found yet.</p>
      ) : (
        quotesList.map((q) => (
          <div
            key={q.id}
            onClick={() => {
              setSelectedQuote(q);
              setForm({
                name: q.name,
                phone: q.phone,
                email: q.email,
                address: q.address,
                loads: q.loads,
                hours: q.hours,
                crew: q.crew,
                distance: q.distance,
                trips: q.trips,
                notes: q.notes,
              });
              setQuote(q.total);
              setScreen("edit");
            }}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 12,
              marginBottom: 10,
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              cursor: "pointer",
            }}
          >
            <h3 style={{ color: classyBlue }}>{q.name || "Unnamed Quote"}</h3>
            <p>Total: <strong>${q.total}</strong></p>
            <p>Date: {q.createdAt?.toDate?.().toLocaleString?.() || "—"}</p>
            {q.imageURL && (
              <img
                src={q.imageURL}
                alt="Job"
                style={{ width: "100%", borderRadius: 8, marginTop: 8 }}
              />
            )}
          </div>
        ))
      )}
    <Button onClick={() => setScreen("home")} variant="outline" full>
        Back to Home
      </Button>
    </Card>
  </div>
)}

    </div> /* closes main wrapper */
  );
}
