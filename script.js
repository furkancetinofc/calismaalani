// *******************************************************************
// ********* UÇUCU EKİP HESAPLAYICILARI - script.js (V4 - SON API ENT.) *********
// *******************************************************************

// ... (Diğer sabitler ve fonksiyonlar aynı kalıyor) ...

// ********* 3. YOL ÜCRETİ HESAPLAYICISI FONKSİYONLARI (AGRESİF TEMİZLİK KORUNDU) *********

async function yukleYolUcretiVerilerini() {
    const yolUcretiSonucDiv = document.getElementById('yolUcretiSonuc');
    const hesaplaYolUcretiBtn = document.getElementById('hesaplaYolUcretiBtn');

    // Eğer fiyat zaten yüklendiyse (yani > 0 ise), tekrar yüklemeye gerek yok
    if (!yolUcretiSonucDiv || benzinFiyatlari.AVRUPA > 0) return; 

    yolUcretiSonucDiv.innerHTML = "Güncel Akaryakıt fiyatı yükleniyor...";
    yolUcretiSonucDiv.classList.remove('error');

    try {
        const response = await fetch(AKARYAKIT_API_URL);
        const data = await response.json(); 

        // API'den gelen verinin status kontrolü (status: true beklenir)
        if (!data || data.status === false || !data.data) {
             throw new Error("API'den geçerli veri alınamadı veya status false.");
        }
        
        // API'nin data.data nesnesini alıyoruz (Geliştiricinin örneği bunu işaret ediyor)
        const dataObj = data.data; 
        
        // Bu nesnenin ilk anahtarını alıyoruz (Örn: "52,31" veya benzeri dinamik değer)
        const firstKey = Object.keys(dataObj)[0]; 
        
        if (!firstKey) {
             throw new Error("API'den benzin fiyat bilgisi içeren anahtar (şehir/bölge) alınamadı.");
        }
        
        const fiyatData = dataObj[firstKey]; 
        
        // HEDEF ANAHTAR: API'den gelen kaçış karakterli (escaped) anahtarı kullanıyoruz:
        const hedefAnahtar = "Kursunsuz_95(Excellium95)_TL\\/lt";
        
        // Fiyat dizesini al, yoksa yedek fiyatı kullan
        let fiyatString = fiyatData?.[hedefAnahtar] || YEDEK_BENZIN_FIYATI.toString();
        
        // Fiyat dizesini temizle: Baştaki/sondaki boşlukları kaldır
        fiyatString = fiyatString.trim(); 
        
        // Virgülü noktaya çevirip sayıya dönüştür
        const benzinFiyati = parseFloat(fiyatString.replace(',', '.')); 


        if (isNaN(benzinFiyati) || benzinFiyati <= 0) {
             throw new Error(`Fiyat verisi geçersiz veya sıfır: ${fiyatString}`);
        }

        benzinFiyatlari.AVRUPA = benzinFiyati; 
        benzinFiyatlari.ANADOLU = benzinFiyati; 
        
        const suankiTarih = new Date().toLocaleString('tr-TR', { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
        
        const fiyatStr = benzinFiyati.toFixed(2).replace('.', ',');
        
        yolUcretiSonucDiv.innerHTML = `
            Güncel Referans Benzin Fiyatı (İstanbul - API):
            <strong style="color: #004d99; font-size: 1.2em;">${fiyatStr} TL/Litre</strong>
            <span style="font-size: 0.8em; color: #666;">Güncelleme: ${suankiTarih}</span><br><br>
            Lütfen ikamet yakanızı ve kullanım sayısını giriniz.
        `;
        
        hesaplaYolUcretiBtn.disabled = false;

    } catch (error) {
        console.error("Akaryakıt API Hatası:", error);
        
        // API çekilemezse, yedek sabit fiyatı kullanma
        benzinFiyatlari.AVRUPA = YEDEK_BENZIN_FIYATI; 
        benzinFiyatlari.ANADOLU = YEDEK_BENZIN_FIYATI; 
        hesaplaYolUcretiBtn.disabled = false; 
        
        const yedekFiyatStr = YEDEK_BENZIN_FIYATI.toFixed(2).replace('.', ',');
        yolUcretiSonucDiv.className = 'sonuc-kutusu error';
        yolUcretiSonucDiv.innerHTML = `Hata: Fiyat yüklenemedi. (${error.message})`;
        yolUcretiSonucDiv.innerHTML += `<br> <span style='color:green;'>**Geçici olarak ${yedekFiyatStr} TL/Litre sabit fiyatı kullanılıyor.**</span>`;
    }
}

// ... (Kalan fonksiyonlar ve DOMContentLoaded aynı kalıyor) ...
