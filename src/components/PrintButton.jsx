// src/components/PrintButton.jsx

import React from 'react';
import html2canvas from 'html2canvas'; 
import jsPDF from 'jspdf';           
import Swal from 'sweetalert2'; // <-- Import SweetAlert2

export default function PrintButton({ componentRef }) {
  
  const handleDownloadPDF = async () => {
    const input = componentRef.current; 

    if (!input) {
      // --- GANTI ALERT ERROR DENGAN SWEETALERT2 ---
      Swal.fire({
          title: "Gagal Download! 😔",
          text: "Error: Konten cetak tidak ditemukan. Coba refresh halaman.",
          icon: "error",
          confirmButtonText: "Tutup",
          background: '#2c2c2c',
          color: '#f0f0f0',
          customClass: { confirmButton: 'swal-custom-button', popup: 'swal-custom-popup' }
      });
      return;
    }
    
    // Tampilkan notifikasi loading (optional, tapi bagus untuk UX)
    Swal.fire({
        title: 'Memproses Laporan...',
        text: 'Mohon tunggu, kami sedang menyiapkan PDF Anda.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
        background: '#2c2c2c',
        color: '#f0f0f0',
        customClass: { popup: 'swal-custom-popup' }
    });

    try {
        const pdfWidth = 210; 
        const pdfHeight = 297; 

        // 1. Ambil screenshot dari elemen Dashboard
        const canvas = await html2canvas(input, {
            scale: 2, 
            useCORS: true,
            windowWidth: input.scrollWidth, 
            windowHeight: input.scrollHeight, 
        });

        const imgData = canvas.toDataURL('image/jpeg'); 
        const imgHeight = canvas.height * pdfWidth / canvas.width; 
        
        const pdf = new jsPDF('p', 'mm', 'a4'); 
        
        let heightLeft = imgHeight; 
        let position = 0; 

        // 2. Loop untuk memotong dan menambah halaman
        while (heightLeft > 0) {
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            if (heightLeft > 0) {
                pdf.addPage();
                position = - (imgHeight - heightLeft);
            }
        }

        // 3. Download file
        pdf.save(`Laporan_KostLife_${new Date().toLocaleDateString('id-ID')}.pdf`);
        
        // Tutup notifikasi loading setelah download berhasil
        Swal.close(); 
        
    } catch (error) {
        Swal.fire({
            title: "Gagal Download! 😔",
            text: `Terjadi error saat membuat PDF: ${error.message}`,
            icon: "error",
            confirmButtonText: "Tutup",
            background: '#2c2c2c',
            color: '#f0f0f0',
            customClass: { confirmButton: 'swal-custom-button', popup: 'swal-custom-popup' }
        });
    }
  };

  return (
    <div className="print-action">
        <button onClick={handleDownloadPDF} className="print-btn">
            ⬇️ Download PDF
        </button>
    </div>
  );
}