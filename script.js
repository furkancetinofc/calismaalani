// **********************************************
// ********* API VE HARCIRAH VERİ TABANI *********
// **********************************************

// Sizin sağladığınız tabloya göre oluşturulan harcırah değerleri (tekil harcırah tutarları)
const harcirahVerileri = {
    // Para Birimi: USD (ABD Doları)
    "ABD": { deger: 60, birim: "USD", dovizAdi: "$" },
    "DİĞER ÜLKELER": { deger: 64, birim: "USD", dovizAdi: "$" },

    // Para Birimi: EUR (Euro)
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
    "DİĞER AB ÜLKELERİ": { deger: 42, birim: "EUR", dovizAdi: "€" },

    // Para Birimi: AUD (Avustralya Doları)
    "AVUSTRALYA": { deger: 93, birim: "AUD", dovizAdi: "A$" },

    // Para Birimi: DKK (Danimarka Kronu)
    "DANİMARKA": { deger: 408, birim: "DKK", dovizAdi: "kr" },

    // Para Birimi: SEK (İsveç Kronu)
    "İSVEÇ": { deger: 447, birim: "SEK", dovizAdi: "kr" },

    // Para Birimi: CHF (İsviçre Frangı)
    "İSVİÇRE": { deger: 60, birim: "CHF", dovizAdi: "CHF" },

    // Para Birimi: JPY (Japon Yeni)
    "JAPONYA": { deger: 7000, birim: "JPY", dovizAdi: "¥" },

    // Para Birimi: CAD (Kanada Doları)
    "KANADA": { deger: 81, birim: "CAD", dovizAdi: "C$" },

    // Para Birimi: KWD (Kuveyt Dinarı)
    "KUVEYT": { deger: 16, birim: "KWD", dovizAdi: "KD" },

    // Para Birimi: NOK (Norveç Kronu)
    "NORVEÇ": { deger: 393, birim: "NOK", dovizAdi: "kr" },

    // Para Birimi: GBP (İngiliz Sterlini)
    "İNGİLTERE": { deger: 38, birim: "GBP", dovizAdi: "£" },

    // Para Birimi: SAR (Suudi Arabistan Riyali)
    "S.ARABİSTAN": { deger: 204, birim: "SAR", dovizAdi: "﷼" },
};

// Döviz Kuru API
const API_KEY = '87e420cb67c7d1e9f4f2aa5c'; 
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/TRY`;

// Kur verilerini 
let kurVerileri = {
    "USD": 0, "EUR": 0, "JPY": 0, "AUD": 0, "DKK": 0, 
    "SEK": 0, "CHF": 0, "CAD": 0, "KWD": 0, "NOK": 0, "GBP": 0, "SAR": 0,
    // DEFAULT 
    "DEFAULT_USD": 30.00, "DEFAULT_EUR": 32.00, "DEFAULT_JPY": 0.20, 
    "DEFAULT_AUD": 18.00, "DEFAULT_DKK": 4.20, "DEFAULT_SEK": 3.00, 
    "DEFAULT_CHF": 34.00, "DEFAULT_CAD": 21.00, "DEFAULT_KWD": 98.00, 
    "DEFAULT_NOK": 2.90, "DEFAULT_GBP": 37.00, "DEFAULT_SAR": 8.00
};

// API asenkron 
async function kurlariGetir() {
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();

        if (data.result === 'error') {
            throw new Error(`API Hatası: ${data['error-type']}`);
        }

        // 1 Para Birimi = X TL 
        const rates = data.conversion_rates;
        for (const birim in kurVerileri) {
            if (rates[birim]) {
                kurVerileri[birim] = 1 / rates[birim];
            }
        }
        console.log("Güncel Kurlar yüklendi:", kurVerileri);

    } catch (error) {
        console.error("Döviz Kuru API Hatası:", error);
        
        for (const birim in kurVerileri) {
            if (birim.startsWith('DEFAULT_')) {
                const actualBirim = birim.substring(8);
                kurVerileri[actualBirim] = kurVerileri[birim];
            }
        }
        console.log("Varsayılan kurlar kullanılıyor (Hata Durumu).");
    }
}


// Ülke Seçimi Fonksiyonu
function ulkeSecimleriniDoldur() {
    const ulkeSecimiSelect = document.getElementById('ulkeSecimi');
    if (!ulkeSecimiSelect) return;

    // Harcırah option
    Object.keys(harcirahVerileri).sort().forEach(ulke => {
        const option = document.createElement('option');
        option.value = ulke;
        option.textContent = `${ulke} (${harcirahVerileri[ulke].birim})`;
        ulkeSecimiSelect.appendChild(option);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    
    kurlariGetir();
    ulkeSecimleriniDoldur();
    
    // **********************************************
    // ********* SEKMELER ARASI GEÇİŞ MANTIĞI *********
    // **********************************************
    
    const tabCalismaBtn = document.getElementById('tabCalismaBtn');
    const tabHaricrahBtn = document.getElementById('tabHaricrahBtn');
    const tabDegerBtn = document.getElementById('tabDegerBtn'); 
    
    const calismaGunTab = document.getElementById('calismaGunTab');
    const haricrahTab = document.getElementById('haricrahTab');
    const degerHesaplayiciTab = document.getElementById('degerHesaplayiciTab');

    if (tabCalismaBtn && tabHaricrahBtn && calismaGunTab && haricrahTab && tabDegerBtn && degerHesaplayiciTab) {
        const allTabs = [calismaGunTab, haricrahTab, degerHesaplayiciTab];
        const allBtns = [tabCalismaBtn, tabHaricrahBtn, tabDegerBtn];
        
        const changeTab = (activeTab, activeBtn) => {
            allTabs.forEach(tab => tab.classList.add('hidden'));
            allBtns.forEach(btn => btn.classList.remove('active'));
            
            activeTab.classList.remove('hidden');
            activeBtn.classList.add('active');
        };

        tabCalismaBtn.addEventListener('click', () => changeTab(calismaGunTab, tabCalismaBtn));
        tabHaricrahBtn.addEventListener('click', () => changeTab(haricrahTab, tabHaricrahBtn));
        tabDegerBtn.addEventListener('click', () => changeTab(degerHesaplayiciTab, tabDegerBtn));
    }


    // ***************************************************
    // ********* 1. BOŞ GÜN HESAPLAYICISI MANTIĞI *********
    // ***************************************************
    
    // Boş Gün Tablosu
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
    
    const standartBosGun = bosGunTablosu[30]; 

    // Elementler
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

        if (!ayAdi || isNaN(izinGunSayisi) || izinGunSayisi < 0) {
            sonucDiv.innerHTML = "Lütfen geçerli bir ay seçin ve izin gün sayısını girin.";
            sonucDiv.className = 'sonuc-kutusu error';
            return;
        }

        const ayGunSayisi = ayGunleri[ayAdi];
        
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


    // ***************************************************
    // ********* 2. HARCIRAH PLANLAYICISI MANTIĞI *********
    // ***************************************************

    const motorKapamaZamaniInput = document.getElementById('motorKapamaZamani');
    const planlaHaricrahBtn = document.getElementById('planlaHaricrahBtn');
    const haricrahSonucDiv = document.getElementById('haricrahSonuc');

    if (planlaHaricrahBtn) {
        planlaHaricrahBtn.addEventListener('click', planlaHaricrah);
    }

    function planlaHaricrah() {
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
                // 1 Harcırah: 24 saat 00 dakikayı DAHİL EDEN bitiş anı (ve öncesi)
                const yirmiDortSaatMs = 24 * 60 * 60 * 1000;
                const bitisSuresiMs = baslangicSuresiMs + yirmiDortSaatMs;
                
                pushbackMs = bitisSuresiMs + (1 * 60 * 60 * 1000);
                zamanAciklamasi = "ve öncesi";

            } else {
                // N Harcırah: (N-1) tam gün + 1 dakika EŞİĞİNİ GEÇEN BAŞLANGIÇ ANLARI (ve sonrası)
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

    // ***************************************************
    // ********* 3. HARCIRAH DEĞER HESAPLAYICISI MANTIĞI *********
    // ***************************************************
    
    const ulkeSecimiSelect = document.getElementById('ulkeSecimi');
    const harcirahSayisiInput = document.getElementById('harcirahSayisi');
    const hesaplaDegerBtn = document.getElementById('hesaplaDegerBtn');
    const degerSonucDiv = document.getElementById('degerSonuc');

    if (hesaplaDegerBtn) {
        hesaplaDegerBtn.addEventListener('click', hesaplaHaricrahDeger);
    }

    function hesaplaHaricrahDeger() {
        if (!ulkeSecimiSelect || !harcirahSayisiInput || !degerSonucDiv) return;
        
        const secilenUlke = ulkeSecimiSelect.value;
        const harcirahSayisi = parseInt(harcirahSayisiInput.value);

        if (!secilenUlke || isNaN(harcirahSayisi) || harcirahSayisi < 1) {
            degerSonucDiv.innerHTML = "Lütfen bir ülke seçimi yapınız ve harcırah gün sayınızı giriniz.";
            degerSonucDiv.className = 'sonuc-kutusu error';
            return;
        }
        
        const veri = harcirahVerileri[secilenUlke];
        const tekilDeger = veri.deger;
        const paraBirimi = veri.birim;
        const dovizAdi = veri.dovizAdi;
        
        // Kur bilgisini al (kurVerileri objesinden)
        // Kur yoksa varsayılan kura düş, o da yoksa 1
        let kur = kurVerileri[paraBirimi]; 
        if (!kur || kur === 0) {
            kur = kurVerileri[`DEFAULT_${paraBirimi}`] || 1;
            console.warn(`Uyarı: ${paraBirimi} için canlı kur bulunamadı, varsayılan kur (${kur}) kullanılıyor.`);
        }
        
        // Hesaplamalar
        const totalOriginalTutar = tekilDeger * harcirahSayisi;
        const tlKarsiligi = totalOriginalTutar * kur;

        // Formatlama
        const kurBilgisiStr = kur.toFixed(4).replace('.', ','); // 4 ondalıklı ve Türkçe format
        const tlKarsiligiStr = tlKarsiligi.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const totalOriginalTutarStr = totalOriginalTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        // Sonuç Çıktısı
        degerSonucDiv.innerHTML = `
            <h3>${secilenUlke} İçin ${harcirahSayisi} Harcırah Değeri</h3>
            <p style="font-size: 1.1em;">
                Orijinal Tutar: 
                <strong>${totalOriginalTutarStr} ${dovizAdi}</strong> 
                <span style="font-size:0.8em; color:#666;">(${tekilDeger}${dovizAdi} x ${harcirahSayisi})</span>
            </p>
            <p style="font-size: 1.1em; color: #004d99;">
                Güncel Kur (${paraBirimi}/TL): 
                <strong>1 ${paraBirimi} = ${kurBilgisiStr} TL</strong>
            </p>
            <hr style="border-top: 1px solid #ccc; width: 80%; margin: 15px auto;">
            <p style="font-size: 1.8em; color: #cc0000;">
                Toplam TL Karşılığı: 
                <strong>${tlKarsiligiStr} TL</strong>
            </p>
            <p style="font-size: 0.8em; color: #999; margin-top: 10px;">
                *Kur verisi ExchangeRate-API tarafından sağlanmıştır.
            </p>
        `;
        degerSonucDiv.className = 'sonuc-kutusu';
    }
});
