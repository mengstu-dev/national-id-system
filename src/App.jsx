import { useState, useEffect } from "react";
import Login from "./Login";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

function App() {
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

  // 🔐 auto login
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

  // Full Name
  if (!formData.fullName.trim()) {
    tempErrors.fullName = "Full name is required";
  } else if (!/^[A-Za-z\s]{3,}$/.test(formData.fullName)) {
    tempErrors.fullName = "Only letters, minimum 3 characters";
  }

  // DOB
  if (!formData.dob) {
    tempErrors.dob = "Date of birth is required";
  }

  // Address (only letters and spaces)
  if (!formData.address.trim()) {
    tempErrors.address = "Address is required";
  } else if (!/^[A-Za-z\s]+$/.test(formData.address)) {
    tempErrors.address = "Address must contain only letters and spaces (no numbers)";
  }

  // Phone (Ethiopian format)
  if (!formData.phone.trim()) {
    tempErrors.phone = "Phone number is required";
  } else if (!/^(\+2519\d{8}|09\d{8})$/.test(formData.phone)) {
    tempErrors.phone = "Phone must start with +2519 or 09";
  }

  setErrors(tempErrors);
  return Object.keys(tempErrors).length === 0;
};

  // input change
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

    try {
      const snapshot = await getDocs(collection(db, "citizens"));
      const count = snapshot.size;

      const newUser = {
        id: "ETH-NID-" + (count + 1).toString().padStart(6, "0"),
        ...formData,
        createdAt: new Date()
      };

      await addDoc(collection(db, "citizens"), newUser);

      alert("User Registered with ID: " + newUser.id);

      setUsers([...users, newUser]);

      setFormData({
        fullName: "",
        dob: "",
        address: "",
        phone: ""
      });

      setErrors({}); // clear errors

    } catch (error) {
      console.error(error);
      alert("Error saving data!");
    }
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
      alert("Citizen not found!");
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>

      <button onClick={handleLogout} style={{ float: "right" }}>
        Logout
      </button>

      <h1>National ID Registration System</h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginTop: "20px"
        }}
      >
        <input name="fullName" placeholder="Full Name"
          value={formData.fullName} onChange={handleChange}
          style={{ padding: "10px" }}
        />
        {errors.fullName && <p style={{ color: "red", margin: 0 }}>{errors.fullName}</p>}

        <input type="date" name="dob"
          value={formData.dob} onChange={handleChange}
          style={{ padding: "10px" }}
        />
        {errors.dob && <p style={{ color: "red", margin: 0 }}>{errors.dob}</p>}

        <input name="address" placeholder="Address"
          value={formData.address} onChange={handleChange}
          style={{ padding: "10px" }}
        />
        {errors.address && <p style={{ color: "red", margin: 0 }}>{errors.address}</p>}

        <input name="phone" placeholder="Phone Number"
          value={formData.phone} onChange={handleChange}
          style={{ padding: "10px" }}
        />
        {errors.phone && <p style={{ color: "red", margin: 0 }}>{errors.phone}</p>}

        <button type="submit" style={{ padding: "10px" }}>
          Register
        </button>
      </form>

      {/* SEARCH */}
      <div style={{ marginTop: "30px" }}>
        <h3>Search Citizen by ID</h3>

        <input
          placeholder="ETH-NID-000001"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{ padding: "10px", marginRight: "10px" }}
        />

        <button onClick={handleSearch} style={{ padding: "10px" }}>
          Search
        </button>

        {searchedUser && (
          <div style={{ marginTop: "10px", padding: "10px", border: "1px solid black" }}>
            <p><b>ID:</b> {searchedUser.id}</p>
            <p><b>Name:</b> {searchedUser.fullName}</p>
            <p><b>DOB:</b> {searchedUser.dob}</p>
            <p><b>Address:</b> {searchedUser.address}</p>
            <p><b>Phone:</b> {searchedUser.phone}</p>
          </div>
        )}
      </div>

      {/* TABLE */}
      <h2 style={{ marginTop: "30px" }}>Registered Citizens</h2>

      {users.length === 0 ? (
        <p>No citizens registered yet.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>DOB</th>
              <th>Address</th>
              <th>Phone</th>
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