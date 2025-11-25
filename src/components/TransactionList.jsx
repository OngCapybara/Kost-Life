import TransactionItem from "./TransactionItem"; 

export default function TransactionList({ transactions, onDelete, onEdit }) { 
  return (
    <>
      <h3>Histori Transaksi</h3>
      {transactions.length === 0 && <p>Belum ada transaksi.</p>}

      {transactions.map((t) => (
        <TransactionItem 
          key={t.id} 
          t={t} 
          onDelete={onDelete} // <-- Meneruskan fungsi Delete
          onEdit={onEdit}   // <-- Meneruskan fungsi Edit
        /> 
      ))}
    </>
  );
}