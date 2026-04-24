import { useState, useEffect } from "react";

const teaStalls = [
  { id: 1, name: "Cutting Chai Corner", owner: "Ramesh Patel", address: "12, Ring Road, Surat", distance: "0.3 km", rating: 4.8, reviews: 124, open: true, img: "🏪", menu: [
    { id: 1, name: "Cutting Chai", price: 10 }, { id: 2, name: "Masala Chai", price: 15 },
    { id: 3, name: "Ginger Chai", price: 12 }, { id: 4, name: "Kadak Chai", price: 10 }, { id: 5, name: "Green Tea", price: 20 },
  ]},
  { id: 2, name: "Surat Chai House", owner: "Vijay Shah", address: "45, Udhna Main Rd, Surat", distance: "0.7 km", rating: 4.5, reviews: 89, open: true, img: "☕", menu: [
    { id: 1, name: "Classic Chai", price: 10 }, { id: 2, name: "Tulsi Chai", price: 14 },
    { id: 3, name: "Elaichi Chai", price: 15 }, { id: 4, name: "Cold Brew Tea", price: 25 },
  ]},
  { id: 3, name: "Chaudhary Tea Stall", owner: "Suresh Chaudhary", address: "8, Varachha Road, Surat", distance: "1.2 km", rating: 4.3, reviews: 56, open: false, img: "🍵", menu: [
    { id: 1, name: "Doodh Chai", price: 12 }, { id: 2, name: "Black Tea", price: 8 }, { id: 3, name: "Masala Chai", price: 15 },
  ]},
  { id: 4, name: "Morning Brew", owner: "Kiran Mehta", address: "22, Athwa Gate, Surat", distance: "1.8 km", rating: 4.6, reviews: 210, open: true, img: "🫖", menu: [
    { id: 1, name: "Cutting Chai", price: 10 }, { id: 2, name: "Lemon Tea", price: 18 },
    { id: 3, name: "Ginger Lemon Chai", price: 20 }, { id: 4, name: "Masala Chai", price: 15 }, { id: 5, name: "Kashmiri Chai", price: 30 },
  ]},
];

const SCREENS = { AUTH: "auth", HOME: "home", STALL: "stall", ORDER: "order", CHECKLIST: "checklist", BILL: "bill", PAY: "pay", OWNER: "owner", PROFILE: "profile" };

const getDB = () => { try { return JSON.parse(localStorage.getItem("chaiconnect_users") || "{}"); } catch { return {}; } };
const saveDB = (db) => localStorage.setItem("chaiconnect_users", JSON.stringify(db));
const getUserData = (email) => { try { return JSON.parse(localStorage.getItem("chaiconnect_data_" + email) || "null"); } catch { return null; } };
const saveUserData = (email, data) => localStorage.setItem("chaiconnect_data_" + email, JSON.stringify(data));
const getSession = () => { try { return JSON.parse(localStorage.getItem("chaiconnect_session") || "null"); } catch { return null; } };
const saveSession = (u) => localStorage.setItem("chaiconnect_session", JSON.stringify(u));
const clearSession = () => localStorage.removeItem("chaiconnect_session");

const initialUserData = { orders: [], checklist: [1, 2], bills: { 1: [{ id: 1, date: "Apr 10", item: "Masala Chai x2", amount: 30 }], 2: [{ id: 1, date: "Apr 11", item: "Classic Chai x4", amount: 40 }] }, paid: {} };

export default function App() {
  const [screen, setScreen] = useState(SCREENS.AUTH);
  const [authTab, setAuthTab] = useState("login"); // login | signup
  const [userType, setUserType] = useState("corporate"); // corporate | owner
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", address: "", password: "", confirm: "" });
  const [formErr, setFormErr] = useState("");
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedStall, setSelectedStall] = useState(null);
  const [cart, setCart] = useState({});
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [payAmount, setPayAmount] = useState("");
  const [reviewInput, setReviewInput] = useState("");
  const [ownerOrders, setOwnerOrders] = useState([
    { id: 1, company: "TechCorp Pvt Ltd", item: "Masala Chai x3", status: "Pending", time: "10:32 AM" },
    { id: 2, company: "Infosys Surat", item: "Cutting Chai x5", status: "Pending", time: "10:45 AM" },
    { id: 3, company: "HDFC Bank Office", item: "Ginger Chai x2", status: "Ready", time: "11:00 AM" },
  ]);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const sess = getSession();
    if (sess) { setUser(sess); const d = getUserData(sess.email) || { ...initialUserData }; setUserData(d); setScreen(sess.role === "owner" ? SCREENS.OWNER : SCREENS.HOME); }
  }, []);

  const persistUD = (email, d) => { setUserData(d); saveUserData(email, d); };
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };
  const fSet = (k, v) => { setForm(p => ({ ...p, [k]: v })); setFormErr(""); };

  const handleSignup = () => {
    if (!form.name.trim()) return setFormErr("Full name is required.");
    if (userType === "corporate" && !form.company.trim()) return setFormErr("Company name is required.");
    if (userType === "owner" && !form.address.trim()) return setFormErr("Stall address is required.");
    if (!form.email.trim() || !form.email.includes("@")) return setFormErr("Enter a valid email.");
    if (!form.phone.trim() || form.phone.length < 10) return setFormErr("Enter a valid 10-digit phone number.");
    if (form.password.length < 6) return setFormErr("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setFormErr("Passwords do not match.");
    const db = getDB();
    if (db[form.email]) return setFormErr("Account already exists with this email. Please login.");
    const newUser = { name: form.name, company: userType === "corporate" ? form.company : form.name + "'s Stall", email: form.email, phone: form.phone, address: form.address, role: userType, createdAt: new Date().toLocaleDateString() };
    db[form.email] = { ...newUser, password: form.password };
    saveDB(db);
    saveUserData(form.email, { ...initialUserData, orders: [], checklist: [], bills: {}, paid: {} });
    saveSession(newUser);
    setUser(newUser);
    setUserData({ ...initialUserData, orders: [], checklist: [], bills: {}, paid: {} });
    setForm({ name: "", company: "", email: "", phone: "", address: "", password: "", confirm: "" });
    showToast("✅ Account created successfully! Welcome!");
    setScreen(userType === "owner" ? SCREENS.OWNER : SCREENS.HOME);
  };

  const handleLogin = () => {
    if (!form.email.trim()) return setFormErr("Email is required.");
    if (!form.password.trim()) return setFormErr("Password is required.");
    const db = getDB();
    const acc = db[form.email];
    if (!acc) return setFormErr("No account found with this email. Please sign up.");
    if (acc.password !== form.password) return setFormErr("Incorrect password. Please try again.");
    const { password: _, ...safeUser } = acc;
    saveSession(safeUser);
    setUser(safeUser);
    const d = getUserData(form.email) || { ...initialUserData };
    setUserData(d);
    setForm({ name: "", company: "", email: "", phone: "", address: "", password: "", confirm: "" });
    setFormErr("");
    showToast(`Welcome back, ${safeUser.name}! 🍵`);
    setScreen(safeUser.role === "owner" ? SCREENS.OWNER : SCREENS.HOME);
  };

  const handleLogout = () => { clearSession(); setUser(null); setUserData(null); setCart({}); setScreen(SCREENS.AUTH); setAuthTab("login"); };

  const totalCart = Object.values(cart).reduce((a, b) => a + b.qty * b.price, 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b.qty, 0);

  const addToCart = (stallId, item) => setCart(p => ({ ...p, [item.id]: { ...item, qty: (p[item.id]?.qty || 0) + 1, stallId } }));
  const removeFromCart = (itemId) => setCart(p => { const n = { ...p }; if (n[itemId]?.qty > 1) n[itemId] = { ...n[itemId], qty: n[itemId].qty - 1 }; else delete n[itemId]; return n; });

  const placeOrder = () => {
    const items = Object.values(cart);
    if (!items.length) return showToast("Cart is empty!");
    const stallId = items[0].stallId;
    const newOrder = { id: Date.now(), stallId, stallName: teaStalls.find(s => s.id === stallId)?.name, items, total: totalCart, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), status: "Confirmed" };
    const newBillEntry = { id: Date.now(), date: "Today", item: items.map(i => `${i.name} x${i.qty}`).join(", "), amount: totalCart };
    const d = { ...userData, orders: [newOrder, ...(userData.orders || [])], checklist: userData.checklist.includes(stallId) ? userData.checklist : [...userData.checklist, stallId], bills: { ...userData.bills, [stallId]: [...(userData.bills[stallId] || []), newBillEntry] } };
    persistUD(user.email, d);
    setCart({});
    showToast("✅ Order placed successfully!");
    setScreen(SCREENS.CHECKLIST);
  };

  const getBillTotal = (stallId) => (userData?.bills?.[stallId] || []).reduce((a, b) => a + b.amount, 0);
  const getPaid = (stallId) => userData?.paid?.[stallId] || 0;
  const getDue = (stallId) => getBillTotal(stallId) - getPaid(stallId);

  const handlePay = () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return showToast("Enter a valid amount");
    if (amt > getDue(selectedStall?.id)) return showToast("Amount exceeds due balance");
    const d = { ...userData, paid: { ...userData.paid, [selectedStall.id]: (userData.paid[selectedStall.id] || 0) + amt } };
    persistUD(user.email, d);
    setPayAmount("");
    showToast(`✅ ₹${amt} paid successfully!`);
    setScreen(SCREENS.BILL);
  };

  const updateOwnerOrder = (id, status) => { setOwnerOrders(p => p.map(o => o.id === id ? { ...o, status } : o)); showToast(`Order marked as ${status}`); };
  const stars = (r) => "★".repeat(Math.floor(r)) + "☆".repeat(5 - Math.floor(r));

  const inp = (placeholder, key, type = "text", extra = {}) => (
    <div style={{ position: "relative", marginBottom: 12 }}>
      <input placeholder={placeholder} type={type === "password" && showPass ? "text" : type} value={form[key]} onChange={e => fSet(key, e.target.value)}
        style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #eee", borderRadius: 12, fontSize: 14, boxSizing: "border-box", outline: "none", ...extra }} />
      {type === "password" && (
        <button onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#aaa" }}>{showPass ? "🙈" : "👁"}</button>
      )}
    </div>
  );

  // ─── AUTH SCREEN ──────────────────────────────────────────────────────────
  if (screen === SCREENS.AUTH) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#ff6b00,#ffb347)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: 16 }}>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", padding: "10px 24px", borderRadius: 20, zIndex: 99, fontSize: 14, whiteSpace: "nowrap" }}>{toast}</div>}
      <div style={{ background: "#fff", borderRadius: 24, padding: 28, width: "100%", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 44 }}>🍵</div>
          <h1 style={{ margin: "6px 0 2px", color: "#ff6b00", fontSize: 24, fontWeight: 800 }}>ChaiConnect</h1>
          <p style={{ color: "#888", fontSize: 12, margin: 0 }}>Corporate Tea Ordering Platform</p>
        </div>

        {/* Login / Signup tabs */}
        <div style={{ display: "flex", background: "#f5f5f5", borderRadius: 12, padding: 3, marginBottom: 18 }}>
          {["login", "signup"].map(t => (
            <button key={t} onClick={() => { setAuthTab(t); setFormErr(""); }} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", background: authTab === t ? "#ff6b00" : "transparent", color: authTab === t ? "#fff" : "#888", transition: "all .2s" }}>
              {t === "login" ? "🔑 Login" : "📝 Sign Up"}
            </button>
          ))}
        </div>

        {/* User type selector */}
        <div style={{ display: "flex", background: "#f5f5f5", borderRadius: 12, padding: 3, marginBottom: 16 }}>
          {["corporate", "owner"].map(m => (
            <button key={m} onClick={() => { setUserType(m); setFormErr(""); }} style={{ flex: 1, padding: "7px 0", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer", background: userType === m ? "#333" : "transparent", color: userType === m ? "#fff" : "#888", transition: "all .2s" }}>
              {m === "corporate" ? "🏢 Corporate" : "🏪 Stall Owner"}
            </button>
          ))}
        </div>

        {authTab === "signup" && <>
          {inp("Full Name *", "name")}
          {userType === "corporate" ? inp("Company Name *", "company") : inp("Stall Address *", "address")}
          {inp("Phone Number *", "phone", "tel")}
        </>}

        {inp("Email Address *", "email", "email")}
        {inp("Password *", "password", "password")}
        {authTab === "signup" && inp("Confirm Password *", "confirm", "password")}

        {formErr && <div style={{ background: "#fce4ec", color: "#c62828", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 12, fontWeight: 600 }}>⚠️ {formErr}</div>}

        <button onClick={authTab === "login" ? handleLogin : handleSignup}
          style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#ff6b00,#ff8c00)", color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 4 }}>
          {authTab === "login" ? "Login →" : "Create Account →"}
        </button>

        <p style={{ textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 14, marginBottom: 0 }}>
          {authTab === "login" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setAuthTab(authTab === "login" ? "signup" : "login"); setFormErr(""); }} style={{ color: "#ff6b00", fontWeight: 700, cursor: "pointer" }}>
            {authTab === "login" ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );

  if (!user || !userData) return null;

  // ─── OWNER PANEL ──────────────────────────────────────────────────────────
  if (screen === SCREENS.OWNER) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", background: "#f8f8f8", minHeight: "100vh" }}>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", padding: "10px 24px", borderRadius: 20, zIndex: 99, fontSize: 14 }}>{toast}</div>}
      <div style={{ background: "linear-gradient(135deg,#ff6b00,#ff8c00)", padding: "20px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, opacity: .8 }}>Owner Panel 🏪</div>
            <h2 style={{ margin: 0, fontSize: 18 }}>{user.name}</h2>
            <div style={{ fontSize: 12, opacity: .75 }}>{user.email}</div>
          </div>
          <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>Logout</button>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {[["Pending", ownerOrders.filter(o => o.status === "Pending").length, "#ff6b00"], ["Ready", ownerOrders.filter(o => o.status === "Ready").length, "#4caf50"], ["Delivered", ownerOrders.filter(o => o.status === "Delivered").length, "#2196f3"]].map(([label, count, color]) => (
            <div key={label} style={{ flex: 1, background: "#fff", borderRadius: 14, padding: "14px 10px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{count}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{label}</div>
            </div>
          ))}
        </div>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#333" }}>📋 Incoming Orders</h3>
        {ownerOrders.map(o => (
          <div key={o.id} style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{o.company}</span>
              <span style={{ fontSize: 11, color: "#888" }}>{o.time}</span>
            </div>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 10 }}>🍵 {o.item}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {o.status === "Pending" && <button onClick={() => updateOwnerOrder(o.id, "Ready")} style={{ flex: 1, padding: "8px", background: "#4caf50", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>✅ Mark Ready</button>}
              {o.status === "Ready" && <button onClick={() => updateOwnerOrder(o.id, "Delivered")} style={{ flex: 1, padding: "8px", background: "#2196f3", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>🚚 Mark Delivered</button>}
              {o.status === "Delivered" && <span style={{ flex: 1, textAlign: "center", padding: "8px", background: "#e8f5e9", color: "#4caf50", borderRadius: 10, fontWeight: 700, fontSize: 12 }}>✔ Delivered</span>}
              <span style={{ padding: "8px 12px", background: o.status === "Pending" ? "#fff3e0" : o.status === "Ready" ? "#e3f2fd" : "#e8f5e9", color: o.status === "Pending" ? "#ff6b00" : o.status === "Ready" ? "#2196f3" : "#4caf50", borderRadius: 10, fontWeight: 700, fontSize: 12 }}>{o.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── HOME ─────────────────────────────────────────────────────────────────
  if (screen === SCREENS.HOME) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", background: "#f8f8f8", minHeight: "100vh" }}>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", padding: "10px 24px", borderRadius: 20, zIndex: 99, fontSize: 14 }}>{toast}</div>}
      <div style={{ background: "linear-gradient(135deg,#ff6b00,#ff8c00)", padding: "20px 20px 30px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div><div style={{ fontSize: 11, opacity: .8 }}>Good Morning ☀️</div><h2 style={{ margin: 0, fontSize: 18 }}>{user.company || user.name}</h2></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setScreen(SCREENS.CHECKLIST)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 10, padding: "6px 10px", cursor: "pointer", fontSize: 18 }}>📋</button>
            <button onClick={() => setScreen(SCREENS.PROFILE)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 10, padding: "6px 10px", cursor: "pointer", fontSize: 18 }}>👤</button>
          </div>
        </div>
        <div style={{ marginTop: 14, background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span>📍</span><span style={{ fontSize: 13 }}>Surat, Gujarat — Showing nearby stalls</span>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#333" }}>🏪 Nearest Tea Stalls</h3>
        {teaStalls.map(s => (
          <div key={s.id} onClick={() => { if (!s.open) return showToast("This stall is currently closed"); setSelectedStall(s); setScreen(SCREENS.STALL); }}
            style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", cursor: s.open ? "pointer" : "not-allowed", opacity: s.open ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 34, background: "#fff7f0", borderRadius: 12, width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.img}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#222" }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "#888", margin: "2px 0" }}>👨‍💼 {s.owner}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>📍 {s.address}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#ff6b00" }}>{s.distance}</div>
                <div style={{ fontSize: 11, color: "#f5a623" }}>{stars(s.rating)} {s.rating}</div>
                <div style={{ fontSize: 10, color: "#bbb" }}>{s.reviews} reviews</div>
              </div>
            </div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, background: s.open ? "#e8f5e9" : "#fce4ec", color: s.open ? "#4caf50" : "#e91e63", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{s.open ? "● Open Now" : "● Closed"}</span>
              {userData.checklist.includes(s.id) && <span style={{ fontSize: 11, background: "#fff3e0", color: "#ff6b00", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>📋 In Checklist</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── STALL ────────────────────────────────────────────────────────────────
  if (screen === SCREENS.STALL && selectedStall) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", background: "#f8f8f8", minHeight: "100vh", paddingBottom: cartCount > 0 ? 90 : 0 }}>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", padding: "10px 24px", borderRadius: 20, zIndex: 99, fontSize: 14 }}>{toast}</div>}
      <div style={{ background: "linear-gradient(135deg,#ff6b00,#ff8c00)", padding: "20px", color: "#fff" }}>
        <button onClick={() => setScreen(SCREENS.HOME)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 13, marginBottom: 12 }}>← Back</button>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontSize: 44, background: "rgba(255,255,255,0.2)", borderRadius: 14, width: 66, height: 66, display: "flex", alignItems: "center", justifyContent: "center" }}>{selectedStall.img}</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 19 }}>{selectedStall.name}</h2>
            <div style={{ fontSize: 13, opacity: .85 }}>👨‍💼 {selectedStall.owner}</div>
            <div style={{ fontSize: 12, opacity: .75 }}>📍 {selectedStall.address}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>{stars(selectedStall.rating)} {selectedStall.rating} ({selectedStall.reviews})</div>
          </div>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <button onClick={() => setScreen(SCREENS.BILL)} style={{ flex: 1, padding: "10px", background: "#fff", border: "1.5px solid #ff6b00", color: "#ff6b00", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>🧾 View Bill</button>
          {!userData.checklist.includes(selectedStall.id) && <button onClick={() => { const d = { ...userData, checklist: [...userData.checklist, selectedStall.id] }; persistUD(user.email, d); showToast("Added to checklist!"); }}
            style={{ flex: 1, padding: "10px", background: "#fff3e0", border: "none", color: "#ff6b00", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>📋 Add to List</button>}
        </div>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#333" }}>🍵 Menu</h3>
        {selectedStall.menu.map(item => (
          <div key={item.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div><div style={{ fontWeight: 700, color: "#222", fontSize: 14 }}>{item.name}</div><div style={{ color: "#ff6b00", fontWeight: 800, fontSize: 15, marginTop: 2 }}>₹{item.price}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {cart[item.id]?.qty > 0 && <><button onClick={() => removeFromCart(item.id)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#ff6b00", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 16 }}>-</button>
                <span style={{ fontWeight: 800, fontSize: 15, minWidth: 20, textAlign: "center" }}>{cart[item.id].qty}</span></>}
              <button onClick={() => addToCart(selectedStall.id, item)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#ff6b00", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 16 }}>+</button>
            </div>
          </div>
        ))}
        <div style={{ background: "#fff", borderRadius: 14, padding: 14, marginTop: 4 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>⭐ Leave a Review</div>
          <textarea placeholder="Write your experience..." value={reviewInput} onChange={e => setReviewInput(e.target.value)} rows={2}
            style={{ width: "100%", border: "1.5px solid #eee", borderRadius: 10, padding: "8px 10px", fontSize: 13, resize: "none", boxSizing: "border-box" }} />
          <button onClick={() => { setReviewInput(""); showToast("Review submitted! ⭐"); }} style={{ marginTop: 8, width: "100%", padding: "10px", background: "#ff6b00", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Submit Review</button>
        </div>
      </div>
      {cartCount > 0 && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", width: 380, maxWidth: "90vw" }}>
          <button onClick={() => setScreen(SCREENS.ORDER)} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg,#ff6b00,#ff8c00)", color: "#fff", border: "none", borderRadius: 18, fontWeight: 800, fontSize: 16, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 8px 24px rgba(255,107,0,0.4)" }}>
            <span>🛒 {cartCount} items</span><span>View Order · ₹{totalCart}</span>
          </button>
        </div>
      )}
    </div>
  );

  // ─── ORDER ────────────────────────────────────────────────────────────────
  if (screen === SCREENS.ORDER) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", background: "#f8f8f8", minHeight: "100vh" }}>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", padding: "10px 24px", borderRadius: 20, zIndex: 99, fontSize: 14 }}>{toast}</div>}
      <div style={{ background: "linear-gradient(135deg,#ff6b00,#ff8c00)", padding: "20px", color: "#fff" }}>
        <button onClick={() => setScreen(SCREENS.STALL)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 13, marginBottom: 12 }}>← Back</button>
        <h2 style={{ margin: 0 }}>🛒 Your Order</h2>
        <p style={{ margin: "4px 0 0", opacity: .8, fontSize: 13 }}>{selectedStall?.name}</p>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ background: "#fff", borderRadius: 18, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 14 }}>
          {Object.values(cart).map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
              <div><div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div><div style={{ fontSize: 12, color: "#888" }}>₹{item.price} × {item.qty}</div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => removeFromCart(item.id)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "#ff6b00", color: "#fff", fontWeight: 800, cursor: "pointer" }}>-</button>
                <span style={{ fontWeight: 800, minWidth: 18, textAlign: "center" }}>{item.qty}</span>
                <button onClick={() => addToCart(selectedStall.id, item)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "#ff6b00", color: "#fff", fontWeight: 800, cursor: "pointer" }}>+</button>
                <span style={{ fontWeight: 800, color: "#ff6b00", minWidth: 48, textAlign: "right" }}>₹{item.price * item.qty}</span>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontWeight: 800, fontSize: 16 }}>
            <span>Total</span><span style={{ color: "#ff6b00" }}>₹{totalCart}</span>
          </div>
        </div>
        <div style={{ background: "#fff3e0", borderRadius: 14, padding: 14, marginBottom: 14, fontSize: 13, color: "#ff6b00", fontWeight: 600 }}>💳 Bill added to monthly account — Pay anytime or at month end</div>
        <div style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 16, fontSize: 13 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>🏢 Delivery To</div>
          <div style={{ color: "#555" }}>{user.company || user.name}</div>
          <div style={{ color: "#888", fontSize: 12 }}>{user.address || "Office Address, Surat"}</div>
        </div>
        <button onClick={placeOrder} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg,#ff6b00,#ff8c00)", color: "#fff", border: "none", borderRadius: 18, fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 24px rgba(255,107,0,0.35)" }}>
          ✅ Place Order — ₹{totalCart}
        </button>
      </div>
    </div>
  );

  // ─── CHECKLIST ────────────────────────────────────────────────────────────
  if (screen === SCREENS.CHECKLIST) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", background: "#f8f8f8", minHeight: "100vh" }}>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", padding: "10px 24px", borderRadius: 20, zIndex: 99, fontSize: 14 }}>{toast}</div>}
      <div style={{ background: "linear-gradient(135deg,#ff6b00,#ff8c00)", padding: "20px", color: "#fff" }}>
        <button onClick={() => setScreen(SCREENS.HOME)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 13, marginBottom: 12 }}>← Home</button>
        <h2 style={{ margin: 0 }}>📋 My Checklist</h2>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["orders", "stalls"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", background: activeTab === t ? "#ff6b00" : "#fff", color: activeTab === t ? "#fff" : "#888", fontSize: 13 }}>
              {t === "orders" ? "📦 Orders" : "🏪 My Stalls"}
            </button>
          ))}
        </div>
        {activeTab === "orders" && (
          !userData.orders?.length
            ? <div style={{ textAlign: "center", padding: 40, color: "#bbb" }}><div style={{ fontSize: 48 }}>📭</div><p>No orders yet</p></div>
            : userData.orders.map(o => (
              <div key={o.id} style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>{o.stallName}</span>
                  <span style={{ fontSize: 11, color: "#4caf50", fontWeight: 700 }}>✅ {o.status}</span>
                </div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{o.date} · {o.time}</div>
                {o.items.map(i => <div key={i.id} style={{ fontSize: 13, color: "#555" }}>• {i.name} x{i.qty} — ₹{i.price * i.qty}</div>)}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid #f0f0f0" }}>
                  <span style={{ fontWeight: 800 }}>Total: ₹{o.total}</span>
                  <span style={{ fontSize: 12, color: "#ff6b00", fontWeight: 700 }}>Added to bill</span>
                </div>
              </div>
            ))
        )}
        {activeTab === "stalls" && (
          !userData.checklist?.length
            ? <div style={{ textAlign: "center", padding: 40, color: "#bbb" }}><div style={{ fontSize: 48 }}>🏪</div><p>No stalls saved yet</p></div>
            : userData.checklist.map(id => {
              const s = teaStalls.find(x => x.id === id);
              return s ? (
                <div key={id} style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 28 }}>{s.img}</span>
                      <div><div style={{ fontWeight: 800, fontSize: 14 }}>{s.name}</div><div style={{ fontSize: 12, color: "#888" }}>{s.owner} · {s.distance}</div></div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setSelectedStall(s); setScreen(SCREENS.BILL); }} style={{ padding: "6px 10px", background: "#fff3e0", border: "none", color: "#ff6b00", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>🧾 Bill</button>
                      <button onClick={() => { setSelectedStall(s); setScreen(SCREENS.STALL); }} style={{ padding: "6px 10px", background: "#ff6b00", border: "none", color: "#fff", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Order</button>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#555" }}>Outstanding: <strong style={{ color: "#ff6b00" }}>₹{getDue(id)}</strong></span>
                    <button onClick={() => { const d = { ...userData, checklist: userData.checklist.filter(x => x !== id) }; persistUD(user.email, d); }} style={{ fontSize: 11, color: "#e91e63", background: "none", border: "none", cursor: "pointer" }}>✕ Remove</button>
                  </div>
                </div>
              ) : null;
            })
        )}
      </div>
    </div>
  );

  // ─── BILL ─────────────────────────────────────────────────────────────────
  if (screen === SCREENS.BILL && selectedStall) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", background: "#f8f8f8", minHeight: "100vh" }}>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", padding: "10px 24px", borderRadius: 20, zIndex: 99, fontSize: 14 }}>{toast}</div>}
      <div style={{ background: "linear-gradient(135deg,#ff6b00,#ff8c00)", padding: "20px", color: "#fff" }}>
        <button onClick={() => setScreen(SCREENS.CHECKLIST)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 13, marginBottom: 12 }}>← Back</button>
        <h2 style={{ margin: 0 }}>🧾 Bill Statement</h2>
        <p style={{ margin: "4px 0 0", opacity: .8, fontSize: 13 }}>{selectedStall.name}</p>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ background: "#fff", borderRadius: 18, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            {[["Total Bill", getBillTotal(selectedStall.id), "#333"], ["Paid", getPaid(selectedStall.id), "#4caf50"], ["Due", getDue(selectedStall.id), "#ff6b00"]].map(([label, val, color]) => (
              <div key={label} style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color }}>₹{val}</div>
                <div style={{ fontSize: 11, color: "#888" }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
            {(userData.bills?.[selectedStall.id] || []).length === 0
              ? <div style={{ textAlign: "center", color: "#bbb", padding: 16 }}>No transactions yet</div>
              : (userData.bills[selectedStall.id] || []).map(b => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f9f9f9", fontSize: 13 }}>
                  <div><div style={{ fontWeight: 600 }}>{b.item}</div><div style={{ color: "#aaa", fontSize: 11 }}>{b.date}</div></div>
                  <div style={{ fontWeight: 700, color: "#333" }}>₹{b.amount}</div>
                </div>
              ))}
          </div>
        </div>
        {getDue(selectedStall.id) > 0
          ? <button onClick={() => setScreen(SCREENS.PAY)} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg,#ff6b00,#ff8c00)", color: "#fff", border: "none", borderRadius: 18, fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 24px rgba(255,107,0,0.35)" }}>💳 Pay Now — ₹{getDue(selectedStall.id)} Due</button>
          : <div style={{ textAlign: "center", padding: 20, color: "#4caf50", fontWeight: 800 }}>✅ All paid! No dues.</div>}
      </div>
    </div>
  );

  // ─── PAY ──────────────────────────────────────────────────────────────────
  if (screen === SCREENS.PAY && selectedStall) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", background: "#f8f8f8", minHeight: "100vh" }}>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", padding: "10px 24px", borderRadius: 20, zIndex: 99, fontSize: 14 }}>{toast}</div>}
      <div style={{ background: "linear-gradient(135deg,#ff6b00,#ff8c00)", padding: "20px", color: "#fff" }}>
        <button onClick={() => setScreen(SCREENS.BILL)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 13, marginBottom: 12 }}>← Back</button>
        <h2 style={{ margin: 0 }}>💳 Pay Bill</h2>
        <p style={{ margin: "4px 0 0", opacity: .8, fontSize: 13 }}>Due: ₹{getDue(selectedStall.id)}</p>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ background: "#fff", borderRadius: 18, padding: 20, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Enter Amount</div>
          <input type="number" placeholder={`Max ₹${getDue(selectedStall.id)}`} value={payAmount} onChange={e => setPayAmount(e.target.value)}
            style={{ width: "100%", padding: "14px", border: "2px solid #ff6b00", borderRadius: 14, fontSize: 20, fontWeight: 800, textAlign: "center", boxSizing: "border-box", color: "#ff6b00" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {[Math.floor(getDue(selectedStall.id) / 2), getDue(selectedStall.id)].map((amt, i) => (
              <button key={i} onClick={() => setPayAmount(String(amt))} style={{ flex: 1, padding: "10px", background: "#fff3e0", border: "none", color: "#ff6b00", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                {i === 1 ? "Pay Full" : "Pay Half"} ₹{amt}
              </button>
            ))}
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Pay via</div>
          {["UPI / GPay / PhonePe", "Net Banking", "Debit / Credit Card"].map(m => (
            <div key={m} style={{ padding: "10px 0", borderBottom: "1px solid #f5f5f5", fontSize: 14, color: "#333", cursor: "pointer" }}>💳 {m}</div>
          ))}
        </div>
        <button onClick={handlePay} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg,#ff6b00,#ff8c00)", color: "#fff", border: "none", borderRadius: 18, fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 24px rgba(255,107,0,0.35)" }}>✅ Confirm Payment</button>
      </div>
    </div>
  );

  // ─── PROFILE ──────────────────────────────────────────────────────────────
  if (screen === SCREENS.PROFILE) return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto", background: "#f8f8f8", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg,#ff6b00,#ff8c00)", padding: "20px", color: "#fff" }}>
        <button onClick={() => setScreen(SCREENS.HOME)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 13, marginBottom: 12 }}>← Back</button>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🏢</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>{user.name}</h2>
            <div style={{ fontSize: 13, opacity: .8 }}>{user.company}</div>
            <div style={{ fontSize: 12, opacity: .7 }}>{user.email}</div>
          </div>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ background: "#fff", borderRadius: 18, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 14 }}>
          {[["👤 Full Name", user.name], ["🏢 Company", user.company || "—"], ["📧 Email", user.email], ["📱 Phone", user.phone || "—"], ["📍 Address", user.address || "—"], ["📅 Joined", user.createdAt || "—"]].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
              <span style={{ color: "#888" }}>{label}</span><span style={{ fontWeight: 700, color: "#333", maxWidth: 200, textAlign: "right" }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: 18, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 14 }}>
          {[["📦 Total Orders", userData.orders?.length || 0], ["🏪 Saved Stalls", userData.checklist?.length || 0], ["💰 Total Due", "₹" + (userData.checklist || []).reduce((a, id) => a + getDue(id), 0)]].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f5f5f5", fontSize: 14 }}>
              <span style={{ color: "#555" }}>{label}</span><span style={{ fontWeight: 800, color: "#ff6b00" }}>{val}</span>
            </div>
          ))}
        </div>
        <button onClick={handleLogout} style={{ width: "100%", padding: "14px", background: "#fce4ec", border: "none", borderRadius: 14, color: "#e91e63", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>🚪 Logout</button>
      </div>
    </div>
  );

  return null;
}