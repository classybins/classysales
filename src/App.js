// QUICK START (Create React App version)
// 1) Place 'Classy Junk Removal Logo 2.png' inside your /public folder.
// 2) Replace src/App.js with this code.
// 3) Run: npm start  →  Test locally at http://localhost:3000

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

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(16, 42, 113);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('Classy Junk Removal', 15, 17);
    doc.setFontSize(10);
    doc.text('706-413-9955  |  doswald@classybins.com  |  www.ClassyJunkRemoval.com', 15, 22);
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

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFDF0',
      padding: 16,
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial',
      textAlign: 'center'
    }}>
      <img
        src="/Classy Junk Removal Logo 2.png"
        alt="Classy Junk Removal Logo"
        style={{ width: 220, margin: '40px auto 20px' }}
      />

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
          <Button onClick={() => setScreen('history')} variant="secondary" full>
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
                <Button onClick={handleExportPDF} variant="secondary" full>
                  Export as PDF
                </Button>
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
            <p style={{ color: '#667085' }}>
              (Mockup only) This screen will list saved quotes once we connect a cloud database.
            </p>
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
