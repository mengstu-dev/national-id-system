import { useState, useEffect } from "react";
import Login from "./Login";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useTranslation } from "react-i18next";

function App() {
  const { t, i18n } = useTranslation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    address: "",
    phone: ""
  });

  const [errors, setErrors] = useState({});
  const [searchId, setSearchId] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [users, setUsers] = useState([]);

  // 🔐 auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // logout
  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
  };

  // load users
  useEffect(() => {
    if (isLoggedIn) {
      const fetchUsers = async () => {
        const snapshot = await getDocs(collection(db, "citizens"));
        setUsers(snapshot.docs.map(doc => doc.data()));
      };
      fetchUsers();
    }
  }, [isLoggedIn]);

  // validation
  const validateForm = () => {
    let tempErrors = {};

    if (!formData.fullName.trim()) {
      tempErrors.fullName = t("fullNameRequired");
    }

    if (!formData.dob) {
      tempErrors.dob = t("dobRequired");
    }

    if (!formData.address.trim()) {
      tempErrors.address = t("addressRequired");
    }

    if (!formData.phone.trim()) {
      tempErrors.phone = t("phoneRequired");
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // register
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const snapshot = await getDocs(collection(db, "citizens"));
    const count = snapshot.size;

    const newUser = {
      id: "ETH-NID-" + (count + 1).toString().padStart(6, "0"),
      ...formData,
      createdAt: new Date()
    };

    await addDoc(collection(db, "citizens"), newUser);

    alert(t("registered") + ": " + newUser.id);

    setUsers([...users, newUser]);

    setFormData({
      fullName: "",
      dob: "",
      address: "",
      phone: ""
    });

    setErrors({});
  };

  // search
  const handleSearch = async () => {
    const snapshot = await getDocs(collection(db, "citizens"));

    const found = snapshot.docs
      .map(doc => doc.data())
      .find(user => user.id === searchId);

    if (found) {
      setSearchedUser(found);
    } else {
      setSearchedUser(null);
      alert(t("notFound"));
    }
  };

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>

      {/* 🌍 LANGUAGE SWITCHER */}
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => i18n.changeLanguage("en")}>English</button>
        <button onClick={() => i18n.changeLanguage("am")} style={{ marginLeft: "10px" }}>
          አማርኛ
        </button>
      </div>

      <button onClick={handleLogout} style={{ float: "right" }}>
        {t("logout")}
      </button>

      <h1>{t("title")}</h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        style={{
  maxWidth: "450px",
  marginTop: "20px",
  padding: "25px",
  borderRadius: "15px",
  background: "linear-gradient(135deg, #3a92d1, #ffffff)",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
}}
      >
        <input
          name="fullName"
          placeholder={t("fullName")}
          value={formData.fullName}
          onChange={handleChange}
        />
        {errors.fullName && <p style={{ color: "red" }}>{errors.fullName}</p>}

        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
        />
        {errors.dob && <p style={{ color: "red" }}>{errors.dob}</p>}

        <input
          name="address"
          placeholder={t("address")}
          value={formData.address}
          onChange={handleChange}
        />
        {errors.address && <p style={{ color: "red" }}>{errors.address}</p>}

        <input
          name="phone"
          placeholder={t("phone")}
          value={formData.phone}
          onChange={handleChange}
        />
        {errors.phone && <p style={{ color: "red" }}>{errors.phone}</p>}

        <button>{t("register")}</button>
      </form>

      {/* SEARCH */}
      <div style={{ marginTop: "30px" }}>
        <h3>{t("searchTitle")}</h3>

        <input
          placeholder="ETH-NID-000001"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />

        <button onClick={handleSearch}>
          {t("search")}
        </button>

        {searchedUser && (
          <div style={{ marginTop: "10px", padding: "10px", border: "1px solid black" }}>
            <p><b>ID:</b> {searchedUser.id}</p>
            <p><b>{t("fullName")}:</b> {searchedUser.fullName}</p>
            <p><b>{t("dob")}:</b> {searchedUser.dob}</p>
            <p><b>{t("address")}:</b> {searchedUser.address}</p>
            <p><b>{t("phone")}:</b> {searchedUser.phone}</p>
          </div>
        )}
      </div>

      {/* TABLE */}
      <h2 style={{ marginTop: "30px" }}>
        {t("registeredList")}
      </h2>

      {users.length === 0 ? (
        <p>{t("noData")}</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t("fullName")}</th>
              <th>{t("dob")}</th>
              <th>{t("address")}</th>
              <th>{t("phone")}</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td>{user.id}</td>
                <td>{user.fullName}</td>
                <td>{user.dob}</td>
                <td>{user.address}</td>
                <td>{user.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;