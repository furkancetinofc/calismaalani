// *******************************************************************
// ********* UÇUCU EKİP HESAPLAYICILARI - script.js (NİHAİ) *********
// *******************************************************************

// ********* API VE HARCIRAH VERİ TABANI *********
const harcirahVerileri = {
    // III. GRUP DEĞERLERİ BAZ ALINMIŞTIR (Örnek veriler)
    "ABD": { deger: 60, birim: "USD", dovizAdi: "$" },
    "AVUSTURYA": { deger: 55, birim: "EUR", dovizAdi: "€" },
    "ALMANYA": { deger: 54, birim: "EUR", dovizAdi: "€" },
    "BELÇİKA": { deger: 53, birim: "EUR", dovizAdi: "€" },
    "LÜKSEMBURG": { deger: 54, birim: "EUR", dovizAdi: "€" },
    "FİNLANDİYA": { deger: 48, birim: "EUR", dovizAdi: "€" },
    "FRANSA": { deger: 53, birim: "EUR", dovizAdi: "€" },
    "HOLLANDA": { deger: 52, birim: "EUR", dovizAdi: "€" },
    "İTALYA": { deger: 50, birim: "EUR", dovizAdi: "€" },
    "PORTEKİZ": { deger: 51, birim: "EUR", dovizAdi: "€" },
    "YUNANİSTAN": { deger: 52, birim: "EUR", dovizAdi: "€" },
    "İRLANDA": { deger: 52, birim: "EUR", dovizAdi: "€" },
    "İSPANYA": { deger: 52, birim: "EUR", dovizAdi: "€" },
    "DİĞER AB ÜLKELERİ": { deger: 42, birim: "EUR", dovizAdi: "€" },
    "AVUSTRALYA": { deger: 93, birim: "AUD", dovizAdi: "A$" },
    "DANİMARKA": { deger: 408, birim: "DKK", dovizAdi: "kr" },
    "İSVEÇ": { deger: 447, birim: "SEK", dovizAdi: "kr" },
    "İSVİÇRE": { deger: 60, birim: "CHF", dovizAdi: "CHF" },
    "JAPONYA": { deger: 7000, birim: "JPY", dovizAdi: "¥" },
    "KANADA": { deger: 81, birim: "CAD", dovizAdi: "C$" },
    "KUVEYT": { deger: 16, birim: "KWD", dovizAdi: "KD" },
    "NORVEÇ": { deger: 393, birim: "NOK", dovizAdi: "kr" },
    "İNGİLTERE": { deger: 38, birim: "GBP", dovizAdi: "£" },
    "S.ARABİSTAN": { deger: 204, birim: "SAR", dovizAdi: "﷼" },
    "DİĞER ÜLKELER": { deger: 52, birim: "USD", dovizAdi: "$" },
};

// DÖVİZ KURU API ENTEGRASYONU (Lütfen kendi anahtarınızı girin)
const API_KEY = 'SİZİN_ALDIĞINIZ_API_ANAHTARI'; 
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/TRY`;

// Yol Ücreti API Tanımı
const AKARYAKIT_API_URL = 'https://akaryakit-fiyatlari.vercel.app/api/tp/34'; 
const YEDEK_BENZIN_FIYATI = 52.15; // API çalışmazsa kullanılacak sabit fiyat

// Yol Ücreti Fiyat Değişkenleri
let benzinFiyatlari = {
    AVRUPA: 0, // Referans fiyatı tutacak
    ANADOLU: 0  // Referans fiyatı tutacak
};
let sonGuncellemeTarihi = "Bilinmiyor";

// Varsayılan Kurlar (API başarısız olursa kullanılacak)
let kurVerileri = {
    "USD": 0, "EUR": 0, "JPY": 0, "AUD": 0, "DKK": 0, 
    "SEK": 0, "CHF": 0, "CAD": 0, "KWD": 0, "NOK": 0, "GBP": 0, "SAR": 0,
    "DEFAULT_USD": 30.00, "DEFAULT_EUR": 32.00, "DEFAULT_JPY": 0.20, 
    "DEFAULT_AUD": 18.00, "DEFAULT_DKK": 4.20, "DEFAULT_SEK": 3.00, 
    "DEFAULT_CHF": 34.00, "DEFAULT_CAD": 21.00, "DEFAULT_KWD": 98.00, 
    "DEFAULT_NOK": 2.90, "DEFAULT_GBP": 37.00, "DEFAULT_SAR": 8.00
};

// ********* GENEL FONKSİYONLAR *********

async function kurlariGetir() {
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();

        if (data.result === 'error') {
            throw new Error(`API Hatası: ${data['error-type']}`);
        }

        const rates = data.conversion_rates;
        for (const birim in kurVerileri) {
            if (birim.length === 3 && rates[birim]) { 
                kurVerileri[birim] = 1 / rates[birim]; // TRY'den diğer kura dönüşüm
            }
        }
    } catch (error) {
        console.error("Döviz Kuru API Hatası (Varsayılan kullanılıyor):", error);
        // API başarısız olursa varsayılan kurları atıyoruz
        for (const birim in kurVerileri) {
            if (birim.length === 3 && kurVerileri[`DEFAULT_${birim}`]) {
                kurVerileri[birim] = kurVerileri[`DEFAULT_${birim}`];
            }
        }
    }
}

function ulkeSecimleriniDoldur(selectElement) {
    if (!selectElement) return;
    
    let html = '<option value="">-- Ülke Seçiniz --</option>';

    Object.keys(harcirahVerileri).sort().forEach(ulke => {
        html += `<option value="${ulke}">${ulke} (${harcirahVerileri[ulke].birim})</option>`;
    });

    selectElement.innerHTML = html;
}

let satirId = 0;
function ekleGirisAlani(canDelete = false) {
    const konteyner = document.getElementById('harcirahGirisleri');
    if (!konteyner) return;

    satirId++;

    const div = document.createElement('div');
    div.classList.add('dinamik-giris-satiri');
    div.dataset.id = satirId;

    let html = `
        <div class="input-wrapper select-wrapper">
            <label for="ulke_${satirId}">Gidilen Ülke:</label>
            <select class="ulke-secimi" id="ulke_${satirId}" required></select>
        </div>
        <div class="input-wrapper">
            <label for="sayi_${satirId}">Harcırah Sayısı:</label>
            <input type="number" class="harcirah-sayisi" id="sayi_${satirId}" min="1" required value="1">
        </div>
    `;

    if (canDelete) {
        // Silme butonu
        html += `<button type="button" class="sil-btn" onclick="this.parentNode.remove()">X</button>`;
    } else {
        // İlk satır için yer tutucu
        html += `<div style="width: 40px; flex-shrink: 0;"></div>`; 
    }

    div.innerHTML = html;
    konteyner.appendChild(div);

    const selectElement = div.querySelector('.ulke-secimi');
    ulkeSecimleriniDoldur(selectElement);
}

// ********* DOM HAZIR *********
document.addEventListener('DOMContentLoaded', () => {
    kurlariGetir(); // Kurları hemen yüklemeye başla
    ekleGirisAlani(false); // İlk harcırah giriş satırını ekle

    // ********* SEKMELER ARASI GEÇİŞ MANTIĞI *********
    const tabCalismaBtn = document.getElementById('tabCalismaBtn');
    const tabHaricrahBtn = document.getElementById('tabHaricrahBtn');
    const tabDegerBtn = document.getElementById('tabDegerBtn'); 
    const tabYolUcretiBtn = document.getElementById('tabYolUcretiBtn');

    const calismaGunTab = document.getElementById('calismaGunTab');
    const haricrahTab = document.getElementById('haricrahTab');
    const degerHesaplayiciTab = document.getElementById('degerHesaplayiciTab');
    const yolUcretiTab = document.getElementById('yolUcretiTab');

    if (tabCalismaBtn && tabHaricrahBtn && calismaGunTab && haricrahTab && tabDegerBtn && degerHesaplayiciTab && tabYolUcretiBtn && yolUcretiTab) {
        const allTabs = [calismaGunTab, haricrahTab, degerHesaplayiciTab, yolUcretiTab];
        const allBtns = [tabCalismaBtn, tabHaricrahBtn, tabDegerBtn, tabYolUcretiBtn];
        
        const changeTab = (activeTab, activeBtn) => {
            allTabs.forEach(tab => tab.classList.add('hidden'));
            allBtns.forEach(btn => btn.classList.remove('active'));
            
            activeTab.classList.remove('hidden');
            activeBtn.classList.add('active');

            // Yol Ücreti sekmesine geçince fiyatı yüklemeyi başlat
            if (activeBtn === tabYolUcretiBtn) {
                yukleYolUcretiVerilerini();
            }
        };

        tabCalismaBtn.addEventListener('click', () => changeTab(calismaGunTab, tabCalismaBtn));
        tabHaricrahBtn.addEventListener('click', () => changeTab(haricrahTab, tabHaricrahBtn));
        tabDegerBtn.addEventListener('click', () => changeTab(degerHesaplayiciTab, tabDegerBtn));
        tabYolUcretiBtn.addEventListener('click', () => changeTab(yolUcretiTab, tabYolUcretiBtn));
        
        // Varsayılan olarak aktif olan sekmenin API yüklemesini yap (Eğer yol ücreti değilse yapmaz)
        if (tabYolUcretiBtn.classList.contains('active')) {
             yukleYolUcretiVerilerini();
        }
    }


    // ********* 1. BOŞ GÜN HESAPLAYICISI MANTIĞI *********
    const bosGunTablosu = { 
        31: 8, 30: 8, 29: 8, 28: 7, 27: 7, 26: 7, 25: 7, 
        24: 6, 23: 6, 22: 6, 21: 6, 20: 5, 19: 5, 
        18: 5, 17: 5, 16: 4, 15: 4, 14: 4, 13: 3, 
        12: 3, 11: 3, 10: 3, 9: 2, 8: 2, 7: 2, 
        6: 2, 5: 1, 4: 1, 3: 1, 2: 1, 1: 0, 0: 0 
    };

    const ayGunleri = {
        Ocak: 31, Subat: 29, Mart: 31, Nisan: 30, Mayis: 31, Haziran: 30,
        Temmuz: 31, Agustos: 31, Eylul: 30, Ekim: 31, Kasim: 30, Aralik: 31
    };
    
    const aySecimiSelect = document.getElementById('aySecimi');
    const izinGunInput = document.getElementById('izinGunSayisi');
    const hesaplaBtn = document.getElementById('hesaplaBtn');
    const sonucDiv = document.getElementById('sonuc');
    
    if (hesaplaBtn) {
        hesaplaBtn.addEventListener('click', hesaplaBoşGün);
    }

    function hesaplaBoşGün() {
        if (!aySecimiSelect || !izinGunInput || !sonucDiv) return;

        const ayAdi = aySecimiSelect.value;
        const izinGunSayisi = parseInt(izinGunInput.value);

        // ... (Hesaplama mantığı aynı kalıyor) ...
        const standartBosGun = 8; // Referans alınan boş gün sayısı
        const ayGunSayisi = ayGunleri[ayAdi];
        
        if (!ayAdi || isNaN(izinGunSayisi) || izinGunSayisi < 0) {
            sonucDiv.innerHTML = "Lütfen geçerli bir ay seçin ve izin gün sayısını girin.";
            sonucDiv.className = 'sonuc-kutusu error';
            return;
        }

        let fiiliCalismaGunu = ayGunSayisi - izinGunSayisi;
        
        if (fiiliCalismaGunu > 31) {
            fiiliCalismaGunu = 31;
        } else if (fiiliCalismaGunu < 1) {
            fiiliCalismaGunu = 0;
        }

        const hakEdilenBosGun = bosGunTablosu[fiiliCalismaGunu];
        
        if (hakEdilenBosGun === undefined) {
            sonucDiv.innerHTML = "Hata: Hesaplama aralığı dışında bir fiili çalışma günü oluştu.";
            sonucDiv.className = 'sonuc-kutusu error';
            return;
        }

        const dusenBosGunSayisi = standartBosGun - hakEdilenBosGun;
        
        sonucDiv.innerHTML = `
            <p>Seçilen Ay: <strong>${ayAdi} (${ayGunSayisi} gün)</strong></p>
            <p>Toplam İzin: <strong>${izinGunSayisi} Gün</strong></p>
            <p>Tabloya Esas Fiili Çalışma Günü: <strong>${fiiliCalismaGunu} Gün</strong></p>
            <hr style="border-top: 1px solid #ccc; width: 60%; margin: 15px auto;">
            
            <p style="font-size: 1.5em; color: #cc0000;">Hak Edilen Kullanılabilir Boş Gün: <strong>${hakEdilenBosGun}</strong></p>
            
            <hr style="border-top: 1px solid #ccc; width: 60%; margin: 15px auto;">
            <p style="font-size: 1.2em; color: #004d99;">
                ${dusenBosGunSayisi} Boş Gününüz Planlama Tarafından Alınabilir
                <span style="font-size:0.8em; display:block; color:#666;">(Standart 8 - Hak Edilen ${hakEdilenBosGun})</span>
            </p>
        `;
        sonucDiv.className = 'sonuc-kutusu';
    }


    // ********* 2. HARCIRAH PLANLAYICISI MANTIĞI *********
    const motorKapamaZamaniInput = document.getElementById('motorKapamaZamani');
    const planlaHaricrahBtn = document.getElementById('planlaHaricrahBtn');
    const haricrahSonucDiv = document.getElementById('haricrahSonuc');

    if (planlaHaricrahBtn) {
        planlaHaricrahBtn.addEventListener('click', planlaHaricrah);
    }

    function planlaHaricrah() {
        // ... (Harcırah Planlama Mantığı aynı kalıyor) ...
        if (!motorKapamaZamaniInput || !haricrahSonucDiv) return;

        const motorKapamaZamaniStr = motorKapamaZamaniInput.value;

        if (!motorKapamaZamaniStr) {
            haricrahSonucDiv.innerHTML = "Lütfen Motor Kapama Zamanını (UTC) giriniz.";
            haricrahSonucDiv.className = 'sonuc-kutusu error';
            return;
        }
        
        const motorKapamaDate = new Date(motorKapamaZamaniStr);
        
        const year = motorKapamaDate.getFullYear();
        const month = motorKapamaDate.getMonth();
        const day = motorKapamaDate.getDate();
        const hours = motorKapamaDate.getHours();
        const minutes = motorKapamaDate.getMinutes();
        
        let baslangicSuresiMs = Date.UTC(year, month, day, hours, minutes) + (30 * 60 * 1000); 

        let tabloHTML = `
            <h2>Minimum Harcırah Hak Ediş Saatleri</h2>
            <table style="width:100%; border-collapse: collapse; text-align: center; margin-top: 10px;">
                <tr>
                    <th style="border-bottom: 2px solid #004d99; padding: 8px;">Harcırah</th>
                    <th style="border-bottom: 2px solid #004d99; padding: 8px;">Pushback Eşiği (UTC)</th>
                </tr>
        `;

        for (let N = 1; N <= 5; N++) {
            let pushbackMs;
            let zamanAciklamasi;

            if (N === 1) {
                const yirmiDortSaatMs = 24 * 60 * 60 * 1000;
                const bitisSuresiMs = baslangicSuresiMs + yirmiDortSaatMs;
                
                pushbackMs = bitisSuresiMs + (1 * 60 * 60 * 1000);
                zamanAciklamasi = "ve öncesi";

            } else {
                const gunMs = (N - 1) * 24 * 60 * 60 * 1000;
                const birDakikaMs = 1 * 60 * 1000;

                const minBitisSuresiMs = baslangicSuresiMs + gunMs + birDakikaMs;
                
                pushbackMs = minBitisSuresiMs + (1 * 60 * 60 * 1000);
                zamanAciklamasi = "ve sonrası";
            }

            const pushbackDate = new Date(pushbackMs);

            const tarihSecenekleri = { 
                year: 'numeric', month: 'short', day: 'numeric', 
                hour: '2-digit', minute: '2-digit', 
                hourCycle: 'h23', timeZone: 'UTC' 
            };
            const pushbackZamaniStr = pushbackDate.toLocaleString('tr-TR', tarihSecenekleri);

            tabloHTML += `
                <tr>
                    <td style="border-bottom: 1px solid #ddd; padding: 8px;">${N} Harcırah</td>
                    <td style="border-bottom: 1px solid #ddd; padding: 8px; font-weight: bold;">
                        ${pushbackZamaniStr} UTC ${zamanAciklamasi}
                    </td>
                </tr>
            `;
        }
        
        tabloHTML += `</table>`;
        haricrahSonucDiv.innerHTML = tabloHTML;
        haricrahSonucDiv.classList.remove('error');
    }

    // ********* 3. HARCIRAH DEĞER HESAPLAYICISI MANTIĞI *********
    const ekleBtn = document.getElementById('ekleBtn');
    const hesaplaDegerBtn = document.getElementById('hesaplaDegerBtn');
    const degerSonucDiv = document.getElementById('degerSonuc');

    if (ekleBtn) {
        ekleBtn.addEventListener('click', () => ekleGirisAlani(true));
    }

    if (hesaplaDegerBtn) {
        hesaplaDegerBtn.addEventListener('click', hesaplaHaricrahDeger);
    }

    function hesaplaHaricrahDeger() {
        // ... (Harcırah Değer Hesaplama Mantığı aynı kalıyor) ...
        if (!degerSonucDiv) return;

        const girisSatirlari = document.querySelectorAll('.dinamik-giris-satiri');
        let toplamTL = 0;
        let detayHTML = '';
        let hataVar = false;

        girisSatirlari.forEach((satir) => {
            const ulkeSelect = satir.querySelector('.ulke-secimi');
            const sayiInput = satir.querySelector('.harcirah-sayisi');

            const secilenUlke = ulkeSelect ? ulkeSelect.value : null;
            const harcirahSayisi = sayiInput ? parseInt(sayiInput.value) : 0;

            if (!secilenUlke || isNaN(harcirahSayisi) || harcirahSayisi < 1) {
                hataVar = true;
                return; 
            }
            
            const veri = harcirahVerileri[secilenUlke];
            const tekilDeger = veri.deger;
            const paraBirimi = veri.birim;
            const dovizAdi = veri.dovizAdi;
            
            let kur = kurVerileri[paraBirimi]; 
            if (!kur || kur === 0) {
                kur = kurVerileri[`DEFAULT_${paraBirimi}`] || 1;
            }
            
            const totalOriginalTutar = tekilDeger * harcirahSayisi;
            const tlKarsiligi = totalOriginalTutar * kur;
            toplamTL += tlKarsiligi;

            const kurBilgisiStr = kur.toFixed(4).replace('.', ','); 
            const tlKarsiligiStr = tlKarsiligi.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const tekilDegerStr = tekilDeger.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const totalOriginalTutarStr = totalOriginalTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            detayHTML += `
                <div class="detay-hesaplama-kutusu">
                    <h4 style="color: #004d99; margin-top: 0; font-size: 1.2em;">${secilenUlke} İçin ${harcirahSayisi} Harcırah Değeri</h4>
                    <p style="font-size: 1.1em; margin-bottom: 5px; color:#333;">
                        Orijinal Tutar: 
                        <strong>${totalOriginalTutarStr} ${dovizAdi}</strong> 
                        <span style="font-size:0.8em; color:#666;">(${tekilDegerStr}${dovizAdi} x ${harcirahSayisi})</span>
                    </p>
                    <p style="font-size: 1.1em; color: #333; margin-top: 0; margin-bottom: 10px;">
                        Güncel Kur (${paraBirimi}/TL): 
                        1 ${paraBirimi} = <strong>${kurBilgisiStr} TL</strong>
                    </p>
                    <hr style="border-top: 1px solid #ddd; width: 70%; margin: 10px auto;">
                    <p class="toplam-tl">
                        Toplam TL Karşılığı: 
                        ${tlKarsiligiStr} TL
                    </p>
                </div>
            `;
        });

        if (hataVar) {
            degerSonucDiv.innerHTML = "Lütfen tüm giriş alanlarını doğru bir şekilde doldurunuz (Ülke seçimi ve Harcırah Sayısı > 0).";
            degerSonucDiv.className = 'sonuc-kutusu error';
            return;
        }

        const toplamTLStr = toplamTL.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        let nihaiHTML = `
            <h3>DETAYLI HARCIRAH HESAPLAMASI</h3>
            ${detayHTML}
            
            <div class="genel-toplam">
                <p style="margin: 0; font-weight: normal; font-size: 0.7em;">TOPLAM ALINACAK HARCIRAH</p>
                <strong style="margin: 5px 0 0 0;">${toplamTLStr} TL</strong>
            </div>
            
            <p style="font-size: 0.8em; color: #999; margin-top: 20px; text-align: center;">
                *Kur verisi ExchangeRate-API tarafından sağlanmıştır. Canlı kur bilgisine ulaşılamazsa, varsayılan kurlar kullanılır.
            </p>
        `;
        
        degerSonucDiv.innerHTML = nihaiHTML;
        degerSonucDiv.classList.remove('error');
    }
    
    // ********* 4. YOL ÜCRETİ HESAPLAYICISI MANTIĞI *********
    
    const ikametYeriSelect = document.getElementById('ikametYeri');
    const yolKullanimInput = document.getElementById('yolKullanimSayisi');
    const hesaplaYolUcretiBtn = document.getElementById('hesaplaYolUcretiBtn');
    const yolUcretiSonucDiv = document.getElementById('yolUcretiSonuc');


    async function yukleYolUcretiVerilerini() {
        if (!yolUcretiSonucDiv || benzinFiyatlari.AVRUPA > 0) return; 

        yolUcretiSonucDiv.innerHTML = "Güncel Akaryakıt fiyatı yükleniyor...";
        yolUcretiSonucDiv.classList.remove('error');

        try {
            const response = await fetch(AKARYAKIT_API_URL);
            const data = await response.json(); 

            if (!data || data.length === 0) {
                 throw new Error("API'den geçerli bir fiyat dizisi alınamadı.");
            }
            
            // ISTANBUL - AVRUPA fiyatını bulmaya çalışıyoruz.
            let fiyatObjesi = data.find(item => item.ilce === "ISTANBUL - AVRUPA");

            // Eğer ISTANBUL - AVRUPA bulunamazsa, ISTANBUL - ANADOLU fiyatını yedek olarak kullanıyoruz.
            if (!fiyatObjesi) {
                 fiyatObjesi = data.find(item => item.ilce === "ISTANBUL - ANADOLU");
            }
            
            if (!fiyatObjesi || typeof fiyatObjesi.benzin !== 'number') {
                 throw new Error("Benzin fiyatı ('benzin' anahtarı) tespit edilemedi veya sayı değil.");
            }

            const benzinFiyati = fiyatObjesi.benzin; 
            const referansIlce = fiyatObjesi.ilce;

            // Bulunan fiyatı her iki yaka için referans olarak atıyoruz.
            benzinFiyatlari.AVRUPA = benzinFiyati; 
            benzinFiyatlari.ANADOLU = benzinFiyati; 
            
            // Fiyat verisinin alındığı tarih
            const suankiTarih = new Date().toLocaleString('tr-TR', { 
                year: 'numeric', month: 'short', day: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
            });


            if (benzinFiyati <= 0) {
                 throw new Error("API'den geçerli bir sayısal fiyat değeri alınamadı.");
            }
            
            yolUcretiSonucDiv.innerHTML = `
                Güncel Referans Benzin Fiyatı (${referansIlce}):
                <strong style="color: #004d99; font-size: 1.2em;">${benzinFiyati.toFixed(2).replace('.', ',')} TL/Litre</strong>
                <span style="font-size: 0.8em; color: #666;">Güncelleme: ${suankiTarih}</span><br><br>
                Lütfen ikamet yakanızı ve kullanım sayısını giriniz.
            `;
            
            hesaplaYolUcretiBtn.disabled = false;

        } catch (error) {
            console.error("Akaryakıt API Hatası:", error);
            yolUcretiSonucDiv.innerHTML = `Hata: Referans benzin fiyatı yüklenemedi. Hesaplama yapılamıyor. (${error.message})`;
            
            // API çekilemezse, yedek sabit fiyatı atıyoruz.
            benzinFiyatlari.AVRUPA = YEDEK_BENZIN_FIYATI; 
            benzinFiyatlari.ANADOLU = YEDEK_BENZIN_FIYATI; 
            hesaplaYolUcretiBtn.disabled = false; 
            yolUcretiSonucDiv.className = 'sonuc-kutusu error';
            yolUcretiSonucDiv.innerHTML += `<br> <span style='color:green;'>**Geçici olarak ${YEDEK_BENZIN_FIYATI.toFixed(2).replace('.', ',')} TL/Litre sabit fiyatı kullanılıyor.**</span>`;
        }
    }

    if (hesaplaYolUcretiBtn) {
        hesaplaYolUcretiBtn.addEventListener('click', hesaplaYolUcreti);
        hesaplaYolUcretiBtn.disabled = true;
    }

    function hesaplaYolUcreti() {
        if (benzinFiyatlari.AVRUPA === 0) {
            yolUcretiSonucDiv.innerHTML = "Fiyat verisi yüklenemediği için hesaplama yapılamıyor.";
            yolUcretiSonucDiv.className = 'sonuc-kutusu error';
            return;
        }

        const ikamet = ikametYeriSelect.value;
        const yolSayisi = parseInt(yolKullanimInput.value); 

        if (!ikamet || isNaN(yolSayisi) || yolSayisi < 0) {
            yolUcretiSonucDiv.innerHTML = "Lütfen ikamet yakanızı seçiniz ve geçerli bir kullanım sayısı giriniz.";
            yolUcretiSonucDiv.className = 'sonuc-kutusu error';
            return;
        }

        let katsayi;
        let yakaAciklama;
        // Referans fiyat olarak AVRUPA'ya atanan fiyatı kullanıyoruz.
        let kullanilacakFiyat = benzinFiyatlari.AVRUPA; 
        
        if (ikamet === 'AVRUPA') {
            katsayi = 3.25;
            yakaAciklama = "İstanbul (Avrupa Yakası) İkamet Katsayısı";
        } else if (ikamet === 'ANADOLU') {
            katsayi = 6.5;
            yakaAciklama = "İstanbul (Anadolu Yakası) İkamet Katsayısı";
        }

        // Tek yön hak edişi
        const tekYonUcret = kullanilacakFiyat * katsayi;
        
        // Toplam hak ediş (Tek Yön Ücret * Kullanım Sayısı)
        const toplamHakEdis = tekYonUcret * yolSayisi; 
        
        const tekYonStr = tekYonUcret.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const toplamHakEdisStr = toplamHakEdis.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const fiyatStr = kullanilacakFiyat.toFixed(2).replace('.', ','); 
        
        yolUcretiSonucDiv.innerHTML = `
            <div style="text-align: center;">
                <h3 style="color: #004d99; margin-top: 0; font-size: 1.4em;">Yol Ücreti Hesaplama Sonucu</h3>
                <p>
                    <strong style="color:#666; font-size: 0.9em;">${yakaAciklama} (${katsayi} Katsayısı)</strong>
                </p>
                <p style="font-size: 1.1em;">
                    Kullanılan Benzin Fiyatı: <strong>${fiyatStr} TL/Litre</strong>
                </p>
                
                <hr style="border-top: 1px solid #ccc; width: 60%; margin: 15px auto;">

                <p style="font-size: 1.3em; color: #cc0000; margin-bottom: 5px;">
                    Tek Yön Yol Ücreti Hak Edişi: 
                    <strong>${tekYonStr} TL</strong>
                </p>
                
                <p style="font-size: 1.7em; color: #008000; margin-top: 15px;">
                    Toplam Hak Edilen Yol Ücreti (${yolSayisi} Yol): 
                    <strong>${toplamHakEdisStr} TL</strong>
                </p>
                
                <p style="font-size: 0.8em; color: #999; margin-top: 20px;">
                    *Hesaplama: ${fiyatStr} TL × ${katsayi} Katsayısı × ${yolSayisi} Yol
                </p>
            </div>
        `;
        yolUcretiSonucDiv.classList.remove('error');
    }
});
