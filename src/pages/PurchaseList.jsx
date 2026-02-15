import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";

function PurchaseList() {
  const [list, setList] = useState([]);
  const [formData, setFormData] = useState({ productName: "", wholesaler: "" });
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filterWholesaler, setFilterWholesaler] = useState(""); 

  // 1. VERİ ÇEKME
  useEffect(() => {
    const q = query(collection(db, "purchase_list"), orderBy("productName"));
    const unsub = onSnapshot(q, (snap) => {
      setList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // 2. DURUM GÜNCELLEME FONKSİYONU
  const handleStatusChange = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Alınacak" ? "Sipariş Verildi" : "Alınacak";
    try {
      await updateDoc(doc(db, "purchase_list", id), {
        status: nextStatus
      });
    } catch (error) {
      console.error("Durum güncellenirken hata oluştu:", error);
    }
  };

  // 3. TESLİM ALMA (LİSTEDEN KALDIRMA) FONKSİYONU
  const handleReceive = async (id) => {
    if (window.confirm("Bu ürün teslim alındı mı? Listeden kaldırılacak.")) {
      try {
        await deleteDoc(doc(db, "purchase_list", id));
      } catch (error) {
        console.error("Ürün silinirken hata oluştu:", error);
      }
    }
  };

  // 4. EKLEME FONKSİYONU
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.productName || !formData.wholesaler) return alert("Alanları doldurun!");
    
    await addDoc(collection(db, "purchase_list"), {
      productName: formData.productName,
      wholesaler: formData.wholesaler,
      status: "Alınacak"
    });
    setFormData({ productName: "", wholesaler: "" });
  };

  // 5. FİLTRELEME
  const filteredList = list.filter(item => 
    item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    item.wholesaler?.toLowerCase().includes(filterWholesaler.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', justifyContent: 'center' }}>

      <h1 style={{color:'white'}}>🛒 Eksik Listesi</h1>

      <form onSubmit={handleAdd} 
      style={{
            marginBottom: '30px',
            padding: '20px', 
            border: '1px solid #7C3AED', 
            borderRadius: '10px', 
            backgroundColor: '#0f0f0f', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            width:'280px'

      }}>
        <input 
          placeholder="Ürün İsmi" 
          value={formData.productName} 
          onChange={(e) => setFormData({...formData, productName: e.target.value})}
          style={inputStyle} 
        />
        <input 
          placeholder="Toptancı" 
          value={formData.wholesaler} 
          onChange={(e) => setFormData({...formData, wholesaler: e.target.value})}
          style={inputStyle} 
        />
        <button type="submit" style={buttonStyle}>Ekle</button>
      </form>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexDirection: 'column' }}>
        <input placeholder="🔍 Ürün Filtrele" onChange={(e) => setSearchTerm(e.target.value)} style={filterInputStyle} />
        <input placeholder="🔍 Toptancı Filtrele" onChange={(e) => setFilterWholesaler(e.target.value)} style={filterInputStyle} />
      </div>

      <table style={{ width: '90%', borderCollapse: 'collapse', backgroundColor: '#0f0f0f' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ffffff', display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
            <th style={thStyle}>Ürün</th>
            <th style={thStyle}>Toptancı</th>
            <th style={thStyle}>Durum</th>
            <th style={thStyle}>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between' }}>
              <td style={tdStyle}>{item.productName}</td>
              <td style={tdStyle}>{item.wholesaler}</td>
              <td style={tdStyle}>
                <button 
                  onClick={() => handleStatusChange(item.id, item.status)}
                  style={{ 
                    ...badgeStyle, 
                    backgroundColor: item.status === "Alınacak" ? "#e67e22" : "#3498db",
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  {item.status}
                </button>
              </td>
              <td style={tdStyle}>
                <button 
                  onClick={() => handleReceive(item.id)}
                  style={{ ...buttonStyle, backgroundColor: '#7C3AED', padding: '5px 10px', fontSize: '0.8rem' }}
                >
                  Teslim Al
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Stiller
const inputStyle = { padding: '10px', margin: '10px', backgroundColor: '#1e1e1e', color: 'white', borderRadius: '5px', border: '1px solid #333' };
const filterInputStyle = { padding: '12px 20px', 
               borderRadius: '25px', 
               width: '280px',
               border: '1px solid #7C3AED', 
               backgroundColor: '#0f0f0f', 
               color: 'white',
               fontSize: '1rem',
               outline: 'none' };
const buttonStyle = { margin: '10px', padding: '10px 20px', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'  };
const thStyle = { padding: '15px', textAlign: 'left' };
const tdStyle = { padding: '15px' };
const badgeStyle = { color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' };

export default PurchaseList;