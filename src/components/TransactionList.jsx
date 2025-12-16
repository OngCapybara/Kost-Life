import TransactionItem from "./TransactionItem";
import Swal from "sweetalert2";

// Fungsi helper yang memastikan data date dikonversi menjadi objek Date JS yang valid
const ensureDateObject = (date) => {
  if (!date) return null;
  
  // Kasus 1: Firebase Timestamp
  if (date.seconds) {
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
const getTimestamp = (date) => {
  const dateObj = ensureDateObject(date);
  if (!dateObj) return 0;
  return dateObj.getTime(); 
};


// === KOMPONEN TRANSACTION LIST ===

export default function TransactionList({ transactions, onDelete, onEdit, onDeleteAll }) {

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
    const dateA = getTimestamp(a.date);
    const dateB = getTimestamp(b.date);
      
    // dateB - dateA akan mengurutkan dari nilai yang lebih besar (terbaru) ke nilai yang lebih kecil (terlama)
    return dateB - dateA; 
  });

  return (
    <>
      <h3>Histori Transaksi</h3>

      {transactions.length === 0 && <p>Belum ada transaksi.</p>}

      {/* Rendering berdasarkan array yang sudah diurutkan */}
      {sortedTransactions.map((t) => (
          <div key={t.id}>
            {/* Menggunakan t.date untuk memastikan data konsisten dengan sorting */}
            <TransactionItem t={t} onDelete={onDelete} onEdit={onEdit} />
          </div>
      ))}

      {transactions.length > 0 && (
        <div className="delete-all-action">
          <button onClick={handleConfirmDeleteAll} className="delete-all-btn">
            🗑️ Hapus Semua Transaksi
          </button>
        </div>
      )}
    </>
  );
}