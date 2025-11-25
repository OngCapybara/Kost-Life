// src/components/PrintButton.jsx (Revisi Final Fix Multi-Page)

import React from 'react';
import html2canvas from 'html2canvas'; 
import jsPDF from 'jspdf';           

export default function PrintButton({ componentRef }) {
  
  const handleDownloadPDF = async () => {
    const input = componentRef.current;
    if (!input) {
      alert("Error: Konten cetak tidak ditemukan.");
      return;
    }

    // Mendefinisikan dimensi A4 dalam mm
    const pdfWidth = 210; // Lebar A4 dalam mm
    const pdfHeight = 297; // Tinggi A4 dalam mm

    // 1. Ambil screenshot dari elemen Dashboard
    const canvas = await html2canvas(input, {
        scale: 2, 
        useCORS: true,
        // Penting: Render seluruh scrollHeight, meskipun tidak terlihat di viewport
        windowWidth: input.scrollWidth, 
        windowHeight: input.scrollHeight, 
    });

    const imgData = canvas.toDataURL('image/jpeg'); // Ganti PNG ke JPEG (lebih kecil)
    const imgHeight = canvas.height * pdfWidth / canvas.width; // Hitung tinggi gambar dalam mm berdasarkan lebar PDF
    
    const pdf = new jsPDF('p', 'mm', 'a4'); 
    
    let heightLeft = imgHeight; // Sisa tinggi konten yang belum dimasukkan ke PDF
    let position = 0; // Posisi vertikal di halaman PDF saat ini

    // 2. Loop untuk memotong dan menambah halaman
    while (heightLeft > 0) {
      // Menambahkan gambar
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);

      // Mengurangi sisa tinggi yang sudah dimasukkan
      heightLeft -= pdfHeight;

      if (heightLeft > 0) {
        // Jika masih ada sisa konten, tambahkan halaman baru
        pdf.addPage();
        // Atur posisi y ke bagian konten yang tersisa (negatif)
        position = - (imgHeight - heightLeft); // Posisikan potongan gambar yang tersisa
      }
    }

    // 3. Download file
    pdf.save(`Laporan_KostLife_${new Date().toLocaleDateString('id-ID')}.pdf`);
  };

  return (
    <div className="print-action">
        <button onClick={handleDownloadPDF} className="print-btn">
            ⬇️ Download PDF
        </button>
    </div>
  );
}