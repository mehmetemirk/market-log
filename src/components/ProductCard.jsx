const ProductCard = ({ product, onDelete, handleAmountChange, orderAmounts, changeStock, handleRequest }) => {
return (


<div key={product.id} style={{ position: 'relative', border: '1px solid #7C3AED', padding: '10px', borderRadius: '12px', backgroundColor: '#1A1A1A', color: 'white' }}>
                          
              {/*Ürün ismi*/}

              <div style={{display:'flex',alignItems:'center', justifyContent:'space-between',gap:'10px' }}  >

                
                <h3 style={{ margin: '0 10px 0 20px', maxWidth: '280px' }}>{product.name}</h3>

                <button 
                onClick={() => onDelete(product.id, product.name)}
                style={{
                  backgroundColor: '#dc3545',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
                title='ürünü sil'
              >🗑
              </button>               



              </div>

             

             <hr style={{ margin: '10px 0', border: '0.5px solid #eee', width: '320px' }} />

              {/* Stok miktarını gösteren ve artırıp azaltmaya yarayan alan */}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                <button 
                  onClick={() => product.stock > 0 && changeStock(product.id, -1)} 
                  style={{ padding: '5px 12px', cursor: 'pointer', fontSize: '1.2rem', borderRadius: '5px', backgroundColor: '#7C3AED', color: 'white' }}
                >
                  -
                </button>
                <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{product.stock}</span>
                <button 
                  onClick={() => changeStock(product.id, 5)} 
                  style={{ padding: '5px 12px', cursor: 'pointer', fontSize: '1.2rem', borderRadius: '5px', backgroundColor: '#7C3AED', color: 'white' }}
                >
                  +
                </button>
              </div>

              <hr style={{ margin: '10px 0', border: '0.5px solid #eee', width: '320px' }} />

              {/* Sipariş verme alanı */}

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
                <input 
                  type="number" 
                  placeholder="Adet"
                  min="1"
                  value={orderAmounts[product.id] || ""} 
                  onChange={(e) => handleAmountChange(product.id, e.target.value)}
                  style={{ width: '80px', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#1e1e1e', color: 'white' }}
                />
                <button 
                  onClick={() => {
                    const miktar = orderAmounts[product.id];
                    if (!miktar || miktar <= 0) return alert("Lütfen miktar girin!");
                    handleRequest(product, miktar);
                    handleAmountChange(product.id, ""); 
                  }}
                  style={{backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', padding: '8px 20px' }}
                >
                  Sipariş Ver
                </button>
              </div>

             


            </div>

                );
};

export default ProductCard;