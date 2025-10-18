// QUICK START (Create React App version)
// 1) Place 'Classy Junk Removal Logo 2.png' inside your /public folder.
// 2) Replace src/App.js with this code.
// 3) Run: npm start  →  Test locally at http://localhost:3000
import { collection, addDoc, Timestamp, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
addDoc(collection(db, "test"), { createdAt: Timestamp.now() })
  .then(() => console.log("🔥 Firestore works!"))
  .catch(err => console.error("Firestore error:", err));
import React, { useState } from 'react';
import jsPDF from 'jspdf';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    loads: '',
    hours: '',
    crew: '',
    distance: '',
    trips: '',
  });
  const [quote, setQuote] = useState(null);
const [imageURL, setImageURL] = useState(null);
const [uploading, setUploading] = useState(false);
const [quotesList, setQuotesList] = useState([]);
  const classyBlue = '#102A71';
  const classyNavy = '#001840';
  const classyYellow = '#F5C400';

  // ✅ Correct controlled input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleCalculate = () => {
    const loads = parseFloat(form.loads || 0);
    const hours = parseFloat(form.hours || 0);
    const crew = parseFloat(form.crew || 1);
    const distance = parseFloat(form.distance || 0);
    const trips = parseFloat(form.trips || 1);
    const markup = 70; // hidden profit

    const loadCost = loads * 150;
    const laborCost = hours * crew * 35;
    const travelCost = (distance * 2) * trips; // round-trip * trips
    const base = loadCost + laborCost + travelCost;
    const total = base * (1 + markup / 100);

    setQuote(total.toFixed(2));
  };
const handleUploadImage = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploading(true);
  try {
    // Create a reference for this file in Firebase Storage
    const storageRef = ref(storage, `quotes/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);

    // Get the file URL after upload
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
const handleSaveQuote = async () => {
  console.log("Save Quote button clicked");
  try {
    await addDoc(collection(db, "quotes"), {
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      loads: form.loads,
      hours: form.hours,
      crew: form.crew,
      distance: form.distance,
      trips: form.trips,
      total: quote,
      createdAt: Timestamp.now(),
      imageURL: imageURL || null
    });
    alert("✅ Quote saved to the cloud!");
    setImageURL(null);
  } catch (error) {
    console.error("🔥 Firestore save failed:", error);
    console.error("Error saving quote:", error);
    alert("❌ Error saving quote. Check console for details.");
  }
};

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(16, 42, 113);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('Classy Junk Removal', 15, 17);
    doc.setFontSize(10);
    doc.text('706-413-9955  |  doswald@classybins.com  |  www.classybins.com/junk-removal', 15, 22);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Customer Information:', 15, 40);
    doc.text(`Name: ${form.name}`, 20, 48);
    doc.text(`Phone: ${form.phone}`, 20, 55);
    doc.text(`Email: ${form.email}`, 20, 62);
    doc.text(`Address: ${form.address}`, 20, 69);
    doc.text('Job Details:', 15, 85);
    doc.text(`Loads: ${form.loads}`, 20, 93);
    doc.text(`Man Hours: ${form.hours}`, 20, 100);
    doc.text(`Crew Members: ${form.crew}`, 20, 107);
    doc.text(`Distance to Landfill: ${form.distance} miles`, 20, 114);
    doc.text(`Trips: ${form.trips}`, 20, 121);
    doc.setFontSize(14);
    doc.setTextColor(16, 42, 113);
    doc.text(`Estimated Total: $${quote || '—'}`, 15, 140);
    doc.setDrawColor(245, 196, 0);
    doc.setLineWidth(0.8);
    doc.line(15, 145, 195, 145);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Customer Signature: ___________________________', 15, 160);
    doc.text('Date: ___________________', 150, 160);
    doc.text('Notes:', 15, 175);
    doc.line(15, 177, 195, 177);
    doc.line(15, 185, 195, 185);
    doc.line(15, 193, 195, 193);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Thank you for choosing Classy Junk Removal – Stay Classy!', 15, 205);
    doc.save(`ClassyQuote_${form.name || 'Customer'}.pdf`);
  };
const loadQuotes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "quotes"));
    const quotes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setQuotesList(quotes);
    console.log("✅ Loaded quotes:", quotes);
  } catch (error) {
    console.error("Error loading quotes:", error);
  }
};
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFDF0',
      padding: 16,
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial',
      textAlign: 'center'
    }}>
      <img src="/junk-logo.jpg" alt="Classy Junk Removal Logo" style={{ width: 220, margin: '40px auto 20px' }} />



      {screen === 'home' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12
        }}>
          <h1 style={{ color: classyNavy, fontSize: 26, fontWeight: 900, marginBottom: 12 }}>
            Classy Junk Removal
          </h1>
          <Button onClick={() => setScreen('new')} variant="primary" full>
            New Quote
          </Button>
          <Button onClick={() => { setScreen('history'); loadQuotes(); }} variant="secondary" full>
  View Past Quotes
</Button>

        </div>
      )}

      {screen === 'new' && (
        <div>
          <h2 style={{
            color: classyNavy,
            fontWeight: 900,
            fontSize: 20,
            marginBottom: 12
          }}>New Quote</h2>

          <Card title="Customer Info">
            <div style={{ display: 'grid', gap: 12 }}>
              <Field label="Name" name="name" value={form.name} onChange={handleChange} placeholder="Customer full name" />
              <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="706-xxx-xxxx" />
              <Field label="Email" name="email" value={form.email} onChange={handleChange} placeholder="name@example.com" />
              <Field label="Address" name="address" value={form.address} onChange={handleChange} placeholder="Street, City, ZIP" />
            </div>
          </Card>

          <Card title="Job Details">
            <div style={{ display: 'grid', gap: 12 }}>
              <Field label="Number of Loads" name="loads" value={form.loads} onChange={handleChange} placeholder="e.g. 1.5" />
              <Field label="Man Hours" name="hours" value={form.hours} onChange={handleChange} placeholder="e.g. 4" />
              <Field label="Crew Members" name="crew" value={form.crew} onChange={handleChange} placeholder="e.g. 2" />
              <Field label="Distance to Landfill (miles)" name="distance" value={form.distance} onChange={handleChange} placeholder="e.g. 12" />
              <Field label="Number of Trips" name="trips" value={form.trips} onChange={handleChange} placeholder="e.g. 3" />
            </div>
<div style={{ marginTop: 10, textAlign: 'left' }}>
  <label style={{ fontWeight: 700, color: '#001840' }}>
    Upload Job Photo (optional)
  </label>
  <input
    type="file"
    accept="image/*"
    onChange={handleUploadImage}
    style={{
      marginTop: 6,
      padding: 10,
      border: '1px solid #d5d7de',
      borderRadius: 8,
      width: '100%',
    }}
  />
  {uploading && <p style={{ color: '#001840' }}>Uploading photo...</p>}
  {imageURL && (
    <div style={{ marginTop: 8 }}>
      <img
        src={imageURL}
        alt="Uploaded Preview"
        style={{
          width: '100%',
          borderRadius: 10,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  )}
</div>

<Button onClick={handleSaveQuote} variant="secondary" full>
  Save Quote to Cloud
</Button>

            <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
              <Button onClick={handleCalculate} variant="primary" full>
                Calculate Quote
              </Button>
              {quote && (
                <div style={{
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: 900,
                  color: classyNavy
                }}>
                  Estimated Total: ${quote}
                </div>
              )}
              <Button onClick={() => setScreen('home')} variant="outline" full>
                Back to Home
              </Button>
              {quote && (
  <>
    <Button onClick={handleExportPDF} variant="secondary" full>
      Export as PDF
    </Button>
    <Button onClick={handleSaveQuote} variant="secondary" full>
      Save Quote to Cloud
    </Button>
  </>
)}
            </div>
          </Card>
        </div>
      )}

      {screen === 'history' && (
        <div>
          <h2 style={{
            color: classyNavy,
            fontWeight: 900,
            fontSize: 20,
            marginBottom: 12
          }}>Past Quotes</h2>
          <Card>
            <button
  onClick={() => handleDeleteQuote(quote.id)}
  style={{
    background: 'transparent',
    border: '1px solid #ff4d4f',
    color: '#ff4d4f',
    padding: '8px 12px',
    borderRadius: 8,
    fontWeight: 600,
    width: '100%'
  }}
>
  🗑 Delete
</button>
            {quotesList.length === 0 ? (
  <p style={{ color: '#667085' }}>No quotes found yet.</p>
) : (
  <div style={{ display: 'grid', gap: 12 }}>
    {quotesList.map((quote) => (
      <div key={quote.id} style={{
        background: '#fff',
        borderRadius: 12,
        padding: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ color: classyBlue, marginBottom: 4 }}>{quote.name || 'Unnamed Quote'}</h3>
        <p style={{ margin: 0 }}>Total: <strong>${quote.total}</strong></p>
        <p style={{ margin: 0 }}>Date: {quote.createdAt?.toDate?.().toLocaleString?.() || '—'}</p>
        {quote.imageURL && (
          <img src={quote.imageURL} alt="Job Photo" style={{
            width: '100%',
            marginTop: 8,
            borderRadius: 8,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }} />
        )}
      </div>
    ))}
  </div>
)}
            <div style={{ marginTop: 16 }}>
              <Button onClick={() => setScreen('home')} variant="outline" full>
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// --- Reusable Components ---
function Field({ label, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ display: 'grid', gap: 6, textAlign: 'left' }}>
      <label style={{ fontWeight: 700, color: '#001840', fontSize: 14 }}>{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          padding: '12px 14px',
          border: '1px solid #d5d7de',
          borderRadius: 12,
          fontSize: 16,
        }}
      />
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
      marginBottom: 16
    }}>
      {title && <h3 style={{
        color: '#102A71',
        fontWeight: 800,
        marginBottom: 8
      }}>{title}</h3>}
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = 'primary', full }) {
  const classyBlue = '#102A71';
  const classyNavy = '#001840';
  const classyYellow = '#F5C400';

  const styles = {
    base: { borderRadius: 14, padding: '14px 18px', fontWeight: 800, fontSize: 16, cursor: 'pointer', width: full ? '100%' : 'auto', border: 'none' },
    primary: { background: classyBlue, color: '#fff' },
    secondary: { background: classyYellow, color: classyNavy },
    outline: { background: 'transparent', color: classyBlue, border: `2px solid ${classyBlue}` },
  };
  const style = { ...styles.base, ...(styles[variant] || styles.primary) };
  return <button onClick={onClick} style={style}>{children}</button>;
}
const handleDeleteQuote = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this quote?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "quotes", id));
    alert("🗑️ Quote deleted successfully!");
    setQuotesList(quotesList.filter((quote) => quote.id !== id)); // instantly update the UI
  } catch (error) {
    console.error("Error deleting quote:", error);
    alert("❌ Error deleting quote. Check console for details.");
  }
};