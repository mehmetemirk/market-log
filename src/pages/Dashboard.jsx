import ProductCard from '../components/ProductCard';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { query, where, getDocs, updateDoc, doc, increment, deleteDoc, writeBatch } from "firebase/firestore";
import { auth } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";



function Dashboard({ user }) {
  const [products, setProducts] = useState([]);
  const [newName, setNewName] = useState("");
  const [newStock, setNewStock] = useState("");
  const [orderAmounts, setOrderAmounts] = useState({});
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  

 // Giriş yapma fonksiyonu
 const handleLogin = async (e) => {
   e.preventDefault();
   try {
     await signInWithEmailAndPassword(auth, email, password);
   } catch (error) {
     alert("Giriş hatalı: " + error.message);
   }
 };
 
  useEffect(() => {
   // Sadece "Beklemede" olan siparişleri canlı dinle
   const q = query(collection(db, "requests"), where("status", "==", "Beklemede"));
   const unsubscribe = onSnapshot(q, (snapshot) => {
     const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
     setIncomingRequests(data);
   });
   return () => unsubscribe();
  }, []); 
 
   useEffect(() => {
     // Firestore'daki 'products' koleksiyonunu canlı dinle
     const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
       const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
       setProducts(data);
     });
     return () => unsubscribe();
   }, []);

   
 
  // Sipariş oluşturma fonksiyonu: Kullanıcıdan miktar al, siparişi firebase "requests" koleksiyonuna ekle
 
 const handleRequest = async (product, quantity) => {
   try {
     const requestsRef = collection(db, "requests");
     
     // SORGULAMA: Beklemede olan ve aynı ürün ID'sine sahip bir talep var mı?
     const q = query(
       requestsRef, 
       where("productId", "==", product.id), 
       where("status", "==", "Beklemede")
     );
 
     const querySnapshot = await getDocs(q);
 
     if (!querySnapshot.empty) {
       // DURUM A: Eğer bekleyen sipariş VARSA, miktarını artır
       const existingDoc = querySnapshot.docs[0]; 
       const docRef = doc(db, "requests", existingDoc.id);
 
       await updateDoc(docRef, {
         requestedQuantity: increment(Number(quantity)),
         requestedAt: serverTimestamp() // Sipariş zamanını güncelle
       });
       alert(`Mevcut ${product.name} talebinin üzerine ${quantity} adet daha eklendi.`);
     } else {
       // DURUM B: Eğer bekleyen sipariş YOKSA, yeni döküman oluştur
       await addDoc(requestsRef, {
         productId: product.id,
         productName: product.name,
         requestedQuantity: Number(quantity),
         requestedAt: serverTimestamp(),
         status: "Beklemede",
         branchName: "Merkez "
       });
       alert(`${quantity} adet ${product.name} siparişi iletildi.`);
     }
   } catch (error) {
     console.error("Sipariş işlenirken hata oluştu:", error);
   }
 };
 
 // TÜMÜNÜ ONAYLA: Hem stoktan düşer hem siparişi tamamlar
 const approveAllOrders = async () => {
   if (incomingRequests.length === 0) return;
   
   const confirmAll = window.confirm("TÜM siparişleri onaylayıp stoktan düşmek istediğinize emin misiniz?");
   if (!confirmAll) return;
 
   try {
     const batch = writeBatch(db); // Toplu işlem başlatıyoruz
 
     incomingRequests.forEach((order) => {
       const productRef = doc(db, "products", order.productId);
       const orderRef = doc(db, "requests", order.id);
       
       // Batch içine işlemleri diziyoruz
       batch.update(productRef, { stock: increment(-order.requestedQuantity) });
       batch.update(orderRef, { status: "Tamamlandı" });
     });
 
     await batch.commit(); // Tüm işlemleri tek seferde veritabanına gönder
     alert("Tüm siparişler başarıyla onaylandı ve stoktan düşüldü!");
   } catch (error) {
     console.error("Toplu onay hatası:", error);
     alert("İşlem sırasında bir hata oluştu.");
   }
 };
 
 // TÜMÜNÜ SİL: Bekleyen siparişleri listeyi temizlemek için siler
 const deleteAllOrders = async () => {
   if (incomingRequests.length === 0) return;
 
   const confirmDelete = window.confirm("Bekleyen TÜM siparişleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz!");
   if (!confirmDelete) return;
 
   try {
     const batch = writeBatch(db);
     
     incomingRequests.forEach((order) => {
       const orderRef = doc(db, "requests", order.id);
       batch.delete(orderRef);
     });
 
     await batch.commit();
     alert("Sipariş listesi temizlendi.");
   } catch (error) {
     console.error("Toplu silme hatası:", error);
   }
 };
 
 // Ürün silme fonksiyonu: Kullanıcıdan onay al, ardından ürünü Firestore'dan sil
 
 const deleteProduct = async (productId, productName) => {
   // Kullanıcıdan onay alalım
   const confirmDelete = window.confirm(`${productName} ürününü tamamen silmek istediğinize emin misiniz?`);
   
   if (confirmDelete) {
     try {
       const productRef = doc(db, "products", productId);
       await deleteDoc(productRef);
       alert("Ürün sistemden kaldırıldı.");
     } catch (error) {
       console.error("Silme hatası:", error);
       alert("Ürün silinirken bir hata oluştu.");
     }
   }
 };
 
 // Siparişi tamamlama fonksiyonu: Stoktan düş ve sipariş durumunu güncelle
 
 const completeOrder = async (order) => {
   try {
     const productRef = doc(db, "products", order.productId);
     const orderRef = doc(db, "requests", order.id);
 
     // 1. Depo stoğunu istenen miktar kadar azalt
     await updateDoc(productRef, {
       stock: increment(-order.requestedQuantity)
     });
 
     // 2. Sipariş durumunu güncelle
     await updateDoc(orderRef, {
       status: "Tamamlandı"
     });
 
     alert(`${order.productName} siparişi onaylandı ve stoktan düşüldü.`);
   } catch (error) {
     console.error("Hata:", error);
     alert("Sipariş tamamlanırken bir hata oluştu.");
   }
 };
 
  // Stok miktarını güncelleme fonksiyonu (artırma/azaltma)
 
   const changeStock = async (productId, amount) => {
   const productRef = doc(db, "products", productId);
   
   try {
     await updateDoc(productRef, {
       stock: increment(amount) // amount 1 ise artırır, -1 ise azaltır
     });
   } catch (error) {
     console.error("Stok güncellenirken hata oluştu:", error);
   }
  };
 
  // Sipariş miktarını güncelleme fonksiyonu
 
  const handleAmountChange = (productId, value) => {
   setOrderAmounts(prev => ({
     ...prev,
     [productId]: value // Sadece ilgili ürünün miktarını güncelle
   }));
  };
 
  // ÜRÜN EKLEME FONKSİYONU: Aynı isimde ürün varsa stoğu güncelle, yoksa yeni ürün ekle
 
  const addProduct = async (e) => {
   e.preventDefault();
   if (newName === "" || newStock === "") return alert("Alanları doldurun!");
 
   try {
     const productsRef = collection(db, "products");
     // 1. Aynı isimde ürün var mı diye sorgu atıyoruz
     const q = query(productsRef, where("name", "==", newName));
     const querySnapshot = await getDocs(q);
 
     if (!querySnapshot.empty) {
       // 2. Ürün varsa: Mevcut olanın stoğunu güncelle
       const existingDoc = querySnapshot.docs[0];
       const docRef = doc(db, "products", existingDoc.id);
       
       await updateDoc(docRef, {
         stock: existingDoc.data().stock + Number(newStock)
       });
       alert("Mevcut ürünün stoğu güncellendi!");
     } else {
       // 3. Ürün yoksa: Yeni kayıt oluştur
       await addDoc(productsRef, {
         name: newName,
         stock: Number(newStock),
         createdAt: serverTimestamp()
       });
       alert("Yeni ürün eklendi!");
     }
 
     setNewName("");
     setNewStock(0);
   } catch (error) {
     console.error("Hata:", error);
   }
   };
   
   const filteredProducts = products.filter(p => 
   p.name.toLowerCase().includes(searchTerm.toLowerCase())
 );
 
 
 
 
 
   // ASIL EKRANA ÇİZİLEN KISIM BURASI
  return (
   <div style={{ 
     display: 'flex', 
     flexDirection: 'column', 
     padding: '40px', 
     textAlign: 'center', 
     fontFamily: 'Poppins', 
     backgroundColor: '#121212', 
     color: 'white', 
     minHeight: '100vh' 
   }}>
 
     {/* KONTROL: Kullanıcı yoksa Login Ekranı */}
     {!user ? (
       <div style={{ maxWidth: '400px', margin: '100px auto', padding: '40px', backgroundColor: '#0f0f0f', borderRadius: '15px', border: '1px solid #333' }}>
         <h2 style={{ marginBottom: '25px' }}>🔐 Sistemi Girişi</h2>
         <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <input 
             type="email" 
             placeholder="E-posta" 
             onChange={(e) => setEmail(e.target.value)} 
             style={{ padding: '12px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#1a1a1a', color: 'white' }} 
           />
           <input 
             type="password" 
             placeholder="Şifre" 
             onChange={(e) => setPassword(e.target.value)} 
             style={{ padding: '12px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#1a1a1a', color: 'white' }} 
           />
           <button type="submit" style={{ padding: '12px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
             Giriş Yap
           </button>
         </form>
       </div>
     ) : (
       /* DASHBOARD: Giriş yapılmışsa senin kodun çalışır */
       <>

       <div  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem' }}>📦 Depo Paneli</h1>
          
         </div>
         
         {/* Yeni Ürün Ekleme Formu */}

         <form onSubmit={addProduct} 
           style={{ 
            marginBottom: '30px',
            padding: '20px', 
            border: '1px solid #7C3AED', 
            borderRadius: '10px', 
            backgroundColor: '#0f0f0f', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            width:'280px' }}>


           <h2 style={{ color: '#fff', margin: '10px' }}>➕ Yeni Ürün Ekle</h2>

           <input 
             type="text" 
             placeholder="Ürün Adı" 
             value={newName} 
             onChange={(e) => setNewName(e.target.value)} 
             style={{ padding: '10px', margin: '10px', backgroundColor: '#1e1e1e', color: 'white', borderRadius: '5px', border: '1px solid #333' }}
           />
           <input 
             type="number" 
             placeholder="Stok Adedi" 
             value={newStock} 
             onChange={(e) => setNewStock(e.target.value)} 
             style={{ padding: '10px', margin: '10px', backgroundColor: '#1e1e1e', color: 'white', borderRadius: '5px', border: '1px solid #333' }}
           />
           <button type="submit" style={{ margin: '10px', padding: '10px 20px', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
             Kaydet
           </button>
         </form>
 
         {/* Arama Çubuğu Bölümü */}
         <div style={{ marginBottom: '20px', width: '90%', alignSelf: 'center' }}>
           <input 
             type="text" 
             placeholder="🔍 Ürün ara" 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             style={{ 
               padding: '12px 20px', 
               borderRadius: '25px', 
               width: '280px',
               border: '1px solid #7C3AED', 
               backgroundColor: '#0f0f0f', 
               color: 'white',
               fontSize: '1rem',
               outline: 'none'
             }}
           />
         </div>
 
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
 
           {filteredProducts.map((product) => (
             <ProductCard 
              key={product.id} 
               product={product} 
               onDelete={deleteProduct} 
               changeStock={changeStock} 
               handleRequest={handleRequest}
               orderAmounts={orderAmounts}
               handleAmountChange={handleAmountChange}        
             />
 
             
           ))}
         </div>
 
         <hr style={{ margin: '50px 0' }} />
         <h2 style={{ color: '#e67e22' }}>🚚 Gelen Şube Siparişleri</h2>
 
         {incomingRequests.length > 0 && (
           <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '15px' }}>
             <button 
               onClick={approveAllOrders}
               style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
             >
               ✅ Tümünü Onayla ve Gönder
             </button>
             <button 
               onClick={deleteAllOrders}
               style={{ backgroundColor: '#c0392b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
             >
               🗑️ Tüm Talepleri Sil
             </button>
           </div>
         )}
 
         <div style={{ padding: '20px', backgroundColor: '#0f0f0f', borderRadius: '15px' }}>
           {incomingRequests.length === 0 ? (
             <p>Şu an beklemede sipariş yok.</p>
           ) : (
             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ borderBottom: '2px solid #f7f6f6' }}>
                   <th style={{ padding: '10px' }}>Ürün</th>
                   <th style={{ padding: '10px' }}>Miktar</th>
                   <th style={{ padding: '10px' }}>Şube</th>
                   <th style={{ padding: '10px' }}>İşlem</th>
                 </tr>
               </thead>
               <tbody>
                 {incomingRequests.map((order) => (
                   <tr key={order.id} style={{ borderBottom: '1px solid #fcf5f5' }}>
                     <td style={{ padding: '10px' }}>{order.productName}</td>
                     <td style={{ padding: '10px', fontWeight: 'bold' }}>{order.requestedQuantity}</td>
                     <td style={{ padding: '10px' }}>{order.branchName}</td>
                     <td style={{ padding: '10px' }}>
                       <button 
                         onClick={() => completeOrder(order)}
                         style={{ backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
                       >
                         Onayla ve Gönder
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
         </div>

         </div>
       </>
     )}
   </div>
 );
}
 
 export default Dashboard;
