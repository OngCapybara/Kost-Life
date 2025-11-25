// src/components/TransactionChart.jsx

import { Line } from 'react-chartjs-2';
// Impor elemen-elemen Chart.js yang diperlukan
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Wajib: Registrasi elemen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function TransactionChart({ transactions }) {
  // 1. Proses Data: Kumpulkan total pemasukan dan pengeluaran harian
  const dailyData = transactions.reduce((acc, t) => {
    // Ubah timestamp ke format tanggal (YYYY-MM-DD)
    const dateStr = t.createdAt?.toDate ? t.createdAt.toDate().toISOString().split('T')[0] : 'Unknown';
    
    if (!acc[dateStr]) {
      acc[dateStr] = { income: 0, expense: 0 };
    }

    if (t.type === 'income') {
      acc[dateStr].income += t.amount;
    } else {
      acc[dateStr].expense += t.amount;
    }
    return acc;
  }, {});

  // 2. Format Data untuk Chart.js (hanya ambil 30 hari terakhir)
  const labels = Object.keys(dailyData).sort().slice(-30);
  const incomeData = labels.map(date => dailyData[date].income);
  const expenseData = labels.map(date => dailyData[date].expense);

  const data = {
    labels,
    datasets: [
      {
        label: 'Pengeluaran',
        data: expenseData,
        borderColor: '#ff6464', // Merah (sesuai tema expense)
        backgroundColor: 'rgba(255, 100, 100, 0.5)',
      },
      {
        label: 'Pemasukan',
        data: incomeData,
        borderColor: '#64ffda', // Hijau/Aksen (sesuai tema income)
        backgroundColor: 'rgba(100, 255, 218, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#f0f0f0' } },
      title: { display: true, text: 'Aktivitas Transaksi 30 Hari Terakhir', color: '#f0f0f0' },
    },
    scales: {
      x: { ticks: { color: '#aaa' }, grid: { color: '#333' } },
      y: { ticks: { color: '#aaa' }, grid: { color: '#333' } }
    }
  };

  if (transactions.length === 0) {
    return <p style={{textAlign: 'center', color: '#aaa'}}>Tidak ada data transaksi yang cukup untuk menampilkan grafik.</p>;
  }

  return <Line options={options} data={data} />;
}