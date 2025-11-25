// src/components/TransactionItem.jsx

export default function TransactionItem({ t, onDelete, onEdit }) {
  const isIncome = t.type === "income";
  const typeClass = isIncome ? "income" : "expense";
  const sign = isIncome ? "+" : "-";

  // Fungsi untuk memformat timestamp Firestore menjadi string tanggal yang mudah dibaca
  const formatDate = (timestamp) => {
      if (!timestamp) return 'Tanggal tidak tersedia';
      
      // Mengubah Timestamp Firestore menjadi objek Date JavaScript
      // Gunakan || t.createdAt jika field tidak langsung memiliki method toDate()
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
      // Format tanggal dan jam yang ramah pengguna
      return date.toLocaleDateString('id-ID', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
      });
  };

  return (
    <div key={t.id} className="transaction-item">
      <div className="transaction-details">
        <span className={`transaction-type ${typeClass}`}>
          {isIncome ? "Pemasukan" : "Pengeluaran"}
        </span>
        
        {/* TAMBAHAN BARU: Menampilkan tanggal dan waktu transaksi */}
        <small className="transaction-date">
            {t.createdAt ? formatDate(t.createdAt) : 'Tgl. tidak ada'} 
        </small>
        
        <small className="transaction-note">{t.note}</small>
      </div>
      
      <div className="transaction-actions"> 
        <p className={`transaction-amount ${typeClass}`}>
          {sign} Rp {t.amount.toLocaleString('id-ID')}
        </p>

        <div className="action-icons">
          <button 
            className="edit-btn" 
            onClick={() => onEdit(t)} 
            title="Edit Transaksi"
          >
            ✏️
          </button>
          <button 
            className="delete-btn" 
            onClick={() => onDelete(t)} 
            title="Hapus Transaksi"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}