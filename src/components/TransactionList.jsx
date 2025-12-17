import React, { memo } from 'react'; 
import TransactionItem from "./TransactionItem";
import Swal from "sweetalert2";

// Fungsi helper yang memastikan data date dikonversi menjadi objek Date JS yang valid
const ensureDateObject = (date) => {
  if (!date) return null;
  
  // Kasus 1: Firebase Timestamp
  if (date && typeof date === 'object' && date.seconds) {
    return new Date(date.seconds * 1000);
  }
  
  // Kasus 2: JavaScript Date Object atau String Tanggal
  const dateObj = new Date(date);
  
  // Kasus 3: Cek apakah hasil konversi valid
  if (isNaN(dateObj.getTime())) {
    return null; 
  }
  
  return dateObj;
};

// Fungsi untuk mendapatkan Timestamp dalam milidetik untuk Pengurutan
const getTimestamp = (t) => {
    // 🔥 Menggunakan field t.date sebagai prioritas, fallback ke t.createdAt
    const date = t.date || t.createdAt;
    const dateObj = ensureDateObject(date);
    if (!dateObj) return 0;
    return dateObj.getTime(); 
};

// Fungsi Helper Baru: Format Tanggal Harian
const formatDateHeader = (timestamp) => {
    const dateObj = ensureDateObject(timestamp);
    if (!dateObj) return 'Tanggal Tidak Diketahui';
    
    // Format yang hanya menyertakan tanggal, bulan, dan tahun (tanpa jam)
    return dateObj.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
};


// === KOMPONEN TRANSACTION LIST ===

const TransactionList = memo(({ transactions, onDelete, onEdit, onDeleteAll }) => {

  const handleConfirmDeleteAll = async () => {
    const result = await Swal.fire({
      title: "YAKIN HAPUS SEMUA?",
      text: "Semua histori akan hilang dan saldo di-reset ke 0!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus Semua!",
      cancelButtonText: "Batal",
      background: "#2c2c2c",
      color: "#f0f0f0",
      customClass: {
        confirmButton: "swal-custom-button delete-confirm-btn",
        popup: "swal-custom-popup",
      },
    });

    if (result.isConfirmed) onDeleteAll();
  };
  
  // 🔥 LOGIKA PENGURUTAN: Terbaru ke Terlama (Descending)
  const sortedTransactions = [...transactions].sort((a, b) => {
    // ✅ Menggunakan logika fallback yang sama untuk pengurutan
    const dateA = getTimestamp(a);
    const dateB = getTimestamp(b);
      
    // dateB - dateA -> Terbaru ke Terlama
    return dateB - dateA; 
  });


    // === LOGIKA PENGELOMPOKAN TANGGAL ===
    let lastDateHeader = null; // Nama diubah untuk kejelasan

  return (
    <div className="transaction-list-wrapper">
      <h3>Histori Transaksi</h3>

      {transactions.length === 0 && <p>Belum ada transaksi.</p>}

      {/* Rendering berdasarkan array yang sudah diurutkan */}
      {sortedTransactions.map((t) => {
            // ✅ Mengambil timestamp menggunakan logika fallback yang sudah disempurnakan
            const currentTimestamp = getTimestamp(t);
            const currentDateHeader = formatDateHeader(t.date || t.createdAt);
            
            // Cek apakah tanggal saat ini berbeda dengan tanggal terakhir
            const isNewDay = currentDateHeader !== lastDateHeader;
            
            // Simpan tanggal saat ini untuk iterasi berikutnya
            lastDateHeader = currentDateHeader;

            return (
                <React.Fragment key={t.id}>
                    {/* Render separator jika ini adalah hari baru */}
                    {isNewDay && (
                        <h4 className="transaction-date-separator">
                            {currentDateHeader}
                        </h4>
                    )}
                    
                    {/* ✅ TransactionItem sekarang memiliki key yang benar */}
                    <TransactionItem 
                        key={t.id} 
                        t={t} 
                        onDelete={onDelete} 
                        onEdit={onEdit} 
                    />
                </React.Fragment>
            );
      })}

      {transactions.length > 0 && (
        <div className="delete-all-action">
          <button onClick={handleConfirmDeleteAll} className="delete-all-btn">
            🗑️ Hapus Semua Transaksi
          </button>
        </div>
      )}
    </div>
  );
});

export default TransactionList;