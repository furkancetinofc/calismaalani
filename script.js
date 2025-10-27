// **********************************************
// ********* API VE VERİ TABANI AYARLARI *********
// **********************************************

// Harcırahların Sabit Veri Tabanı (Örnek veriler kullanılmıştır)
const harcirahVerileri = {
    "ABD": { tam: 150, kismi: 112.5, birim: "USD" },
    "Almanya": { tam: 120, kismi: 90, birim: "EUR" },
    "Japonya": { tam: 18000, kismi: 13500, birim: "JPY" },
    "Fransa": { tam: 125, kismi: 93.75, birim: "EUR" },
    // Lütfen KENDİ GÜNCEL VE TAM LISTENIZLE DOLDURUNUZ.
};

// YENİ: DÖVİZ KURU API ENTEGRASYONU
const API_KEY = 'SİZİN_ALDIĞINIZ_API_ANAHTARI'; // <<< LÜTFEN KENDİ ANAHTARINIZI BURAYA YAPIŞTIRIN!
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/TRY`;

let kurVerileri = {
    "USD": 0,
    "EUR": 0,
    "JPY": 0, 
    // Varsayılan kurlar (hata durumunda kullanılacak tahmini değerler)
    "DEFAULT_USD": 30.00,
    "DEFAULT_EUR": 32.00,
    "DEFAULT_JPY": 0.20
};

// API'den kurları çeken asenkron fonksiyon
async function kurlariGetir() {
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();

        if (data.result === 'error') {
            throw new Error(`API Hatası: ${data['error-type']}`);
        }

        // 1 Para Birimi = X TL (Conversion rate'in tersi)
        if (data.conversion_rates.USD) kurVerileri.USD = 1 / data.conversion_rates.USD;
        if (data.conversion_rates.EUR) kurVerileri.EUR = 1 / data.conversion_rates.EUR;
        if (data.conversion_rates.JPY) kurVerileri.JPY = 1 / data.conversion_rates.JPY;

    } catch (error) {
        console.error("Döviz Kuru API Hatası:", error);
        // Hata durumunda varsayılan kurlar kullanılıyor.
        kurVerileri.USD = kurVerileri.DEFAULT_USD;
        kurVerileri.EUR = kurVerileri.DEFAULT_EUR;
        kurVerileri.JPY = kurVerileri.DEFAULT_JPY;
        console.log("Varsayılan kurlar kullanılıyor (Hata Durumu).");
    }
}


// YENİ: ÜLKE SEÇİMİNİ DOLDURAN FONKSİYON
function ulkeSecimleriniDoldur() {
    const ulkeSecimiSelect = document.getElementById('ulkeSecimi');
    if (!ulkeSecimiSelect) return;

    // Harcirah verilerindeki ülkeleri alıp option olarak ekliyoruz
    Object.keys(harcirahVerileri).sort().forEach(ulke => {
        const option = document.createElement('option');
        option.value = ulke;
        option.textContent = `${ulke} (${harcirahVerileri[ulke].birim})`;
        ulkeSecimiSelect.appendChild(option);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    // 1. Kurları Getir (API Çağrısı) ve Ülke Seçim Kutusunu Doldur
    kurlariGetir();
    ulkeSecimleriniDoldur();
    
    // **********************************************
    // ********* SEKMELER ARASI GEÇİŞ MANTIĞI *********
    // **********************************************
    
    const tabCalismaBtn = document.getElementById('tabCalismaBtn');
    const tabHaricrahBtn = document.getElementById('tabHaricrahBtn');
    const tabDegerBtn = document.getElementById('tabDegerBtn'); // Yeni buton
    
    const calismaGunTab = document.getElementById('calismaGunTab');
    const haricrahTab = document.getElementById('haricrahTab');
    const degerHesaplayiciTab = document.getElementById('degerHesaplayiciTab'); // Yeni sekme

    // Güvenlik Kontrolü: Sekme elementleri varsa dinleyicileri ekle
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
    
    // Güvenlik Kontrolü: Buton varsa dinleyiciyi ekle
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

    // ***************************************************
    // ********* 3. HARCIRAH DEĞER HESAPLAYICISI MANTIĞI *********
    // ***************************************************
    
    const ulkeSecimiSelect = document.getElementById('ulkeSecimi');
    const hesaplaDegerBtn = document.getElementById('hesaplaDegerBtn');
    const degerSonucDiv = document.getElementById('degerSonuc');

    if (hesaplaDegerBtn) {
        hesaplaDegerBtn.addEventListener('click', hesaplaHaricrahDeger);
    }

    function hesaplaHaricrahDeger() {
        if (!ulkeSecimiSelect || !degerSonucDiv) return;
        
        const harcirahTipiInput = document.querySelector('input[name="harcirahTipi"]:checked');

        if (!ulkeSecimiSelect.value || !harcirahTipiInput) {
            degerSonucDiv.innerHTML = "Lütfen bir ülke seçimi yapınız ve harcırah tipini belirtiniz.";
            degerSonucDiv.className = 'sonuc-kutusu error';
            return;
        }

        const secilenUlke = ulkeSecimiSelect.value;
        const harcirahTipi = harcirahTipiInput.value;
        
        const veri = harcirahVerileri[secilenUlke];
        const originalTutar = veri[harcirahTipi];
        const paraBirimi = veri.birim;
        
        // Kur bilgisini al (kurVerileri objesinden)
        const kur = kurVerileri[paraBirimi] || kurVerileri[`DEFAULT_${paraBirimi}`] || 1; // Kur yoksa varsayılana düş, o da yoksa 1
        
        const tlKarsiligi = originalTutar * kur;

        const kurBilgisiStr = kur.toFixed(4).replace('.', ','); // 4 ondalıklı ve Türkçe format
        const tlKarsiligiStr = tlKarsiligi.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const originalTutarStr = originalTutar.toLocaleString('tr-TR');
        
        // Sonuç Çıktısı
        degerSonucDiv.innerHTML = `
            <h3>${secilenUlke} - ${harcirahTipi === 'tam' ? 'Tam Gün' : 'Kısmi Gün'} Harcırah Değeri</h3>
            <p style="font-size: 1.1em;">Orijinal Tutar: <strong>${originalTutarStr} ${paraBirimi}</strong></p>
            <p style="font-size: 1.1em; color: #004d99;">Güncel Kur (${paraBirimi}/TL): <strong>1 ${paraBirimi} = ${kurBilgisiStr} TL</strong></p>
            <hr style="border-top: 1px solid #ccc; width: 80%; margin: 15px auto;">
            <p style="font-size: 1.8em; color: #cc0000;">TL Karşılığı: <strong>${tlKarsiligiStr} TL</strong></p>
        `;
        degerSonucDiv.className = 'sonuc-kutusu';
    }
});
