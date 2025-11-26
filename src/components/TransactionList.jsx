import TransactionItem from "./TransactionItem"; 
import Swal from 'sweetalert2'; // <-- Import SweetAlert2

export default function TransactionList({ transactions, onDelete, onEdit, onDeleteAll }) { 
    
    // Fungsi Konfirmasi Penghapusan Massal
    const handleConfirmDeleteAll = async () => {
        // Ganti window.confirm dengan SweetAlert2
        const result = await Swal.fire({
            title: "YAKIN HAPUS SEMUA?",
            text: "Aksi ini tidak dapat dibatalkan. Semua histori transaksi akan hilang dan saldo akan di-reset ke nol. Srius loh ya?! ~ Atmin",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Hapus Semua!",
            cancelButtonText: "Batal",
            background: '#2c2c2c',
            color: '#f0f0f0',
            customClass: {
                // Gunakan class khusus untuk tombol delete agar berwarna merah
                confirmButton: 'swal-custom-button delete-confirm-btn', 
                popup: 'swal-custom-popup',
            }
        });

        // Jika pengguna mengkonfirmasi, panggil fungsi dari parent
        if (result.isConfirmed) {
            onDeleteAll(); // Panggil fungsi asinkron dari Dashboard.jsx
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

            {/* TOMBOL HAPUS SEMUA - Muncul jika ada transaksi */}
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