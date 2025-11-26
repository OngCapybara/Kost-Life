export default function DashboardSummary({ userData, budgetPerDay, timeLeft, formatTime }) {
  return (
    <>
      {/* Kartu Ringkasan Data */}
      <div className="summary-card">
        <p><strong>Semua Saldo:</strong> Rp {userData.balance.toLocaleString('id-ID')}</p>
        <p><strong>Budget Per Hari:</strong> Rp {budgetPerDay.toFixed(0).toLocaleString('id-ID')}</p>
        <p><strong>Durasi Uangmu:</strong> {formatTime(timeLeft)}</p>
      </div>
    </>
  );
}