# Irk Standartları - Değişiklik Notları (16.11.2026)

## Sorun
- Admin panelden (/admin/standartlar) eklenen kayıtlar canlıda (/standartlar) görünmüyordu.
- Neden: /api/standartlar yanıtı derleme anında önbelleğe alınıyordu (x-nextjs-cache: HIT).
- Ana sayfadaki Irk Standartları kartları eski siteye (tshfedstandartlar.com) gidiyordu.

## Yapılanlar
1. src/app/api/standartlar/route.ts
   - Önbellek kapatıldı (dynamic = 'force-dynamic'). Panelden eklenen kayıt derleme gerekmeden hemen görünür.
   - Kayıtlar kategori içinde Türkçe harf sırasına göre dizilir. İstisna: terminoloji (MANUAL_ORDER_SLUGS), paneldeki sırayla kalır.
   - Her kayda badge alanı eklenir: YENİ (yeni eklenen) veya GÜNCELLENDİ (sonradan düzenlenen).
   - Etiket süresi: BADGE_DAYS = 30 gün. Süreyi değiştirmek için bu sabit değiştirilir.
   - IMPORT_CUTOFF = 25.10.2026: 24 Ekim toplu aktarım kayıtları etiket almaz.
2. src/app/(site)/standartlar/page.tsx
   - Irk adının yanında etiket gösterilir (YENİ kırmızı, GÜNCELLENDİ mavi).
   - /standartlar?kategori=<slug> ile kategori doğrudan açılır.
   - "Son Eklenenler" filtresi yalnızca etiketli kayıtları gösterir.
3. src/app/(site)/page.tsx (ana sayfa)
   - 8 kart /standartlar?kategori=... adresine bağlandı (terminoloji, dev-irk, cuce, kaz, ordek, hindi, bec, yerli).

## Bilinenler / Yapılacaklar
- Kosova Ötücüsü iki kez kayıtlı (id 137: ırk PDF, id 138: renk PDF). Panelden tek kayıtta birleştirilmeli.
- Tavşan kategorisi boş; ana sayfada kartı yok. Kayıt eklenince kart eklenebilir (slug: Tavşan).
- Kaydı başka kategoriye taşımak da GÜNCELLENDİ etiketi çıkarır.
- İki ayrı admin sayfası var: "Irk Standartları" (/admin/standartlar, bu sayfayı besler) ve "Hayvan Standartları" (/admin/hayvan-standartlari, yarışma içindir, bu sayfayla ilgisi yok).

## Yayına alma
- cd /var/www/tshf && npm run build && pm2 restart tshf
- Eski dosyaların yedeği: /root/yedek-standartlar-20261116/
- Bu çalışmada Yarışma Kaydı dosyalarına dokunulmadı.
