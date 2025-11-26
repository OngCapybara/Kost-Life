import TransactionItem from "./TransactionItem"; 

export default function TransactionList({ transactions, onDelete, onEdit, onDeleteAll }) { 
    
    // Fungsi konfirmasi sebelum memanggil onDeleteAll dari parent
    const handleConfirmDeleteAll = () => {
        if (window.confirm("ANDA YAKIN? Ini akan menghapus SEMUA transaksi Anda secara permanen!")) {
            onDeleteAll();
        }
    };
    
    return (
        <>
            <h3>Histori Transaksi</h3>
            
            {/* Tampilkan pesan jika tidak ada transaksi */}
            {transactions.length === 0 && <p>Belum ada transaksi.</p>}

            {/* Daftar Transaksi */}
            {transactions.map((t) => (
                <TransactionItem 
                    key={t.id} 
                    t={t} 
                    onDelete={onDelete} 
                    onEdit={onEdit} 
                /> 
            ))}

            {/* ============================================== */}
            {/* TOMBOL HAPUS SEMUA - Muncul jika ada transaksi */}
            {/* ============================================== */}
            {transactions.length > 0 && (
                <div className="delete-all-action">
                    <button 
                        onClick={handleConfirmDeleteAll} 
                        className="delete-all-btn"
                    >
                        🗑️ Hapus Semua Transaksi
                    </button>
                </div>
            )}
        </>
    );
}