import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | TSHF',
  description: 'Türkiye Süs Tavukları ve Bahçe Hayvanları Federasyonu Gizlilik Politikası',
}

export default function GizlilikPolitikasiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Gizlilik Politikası</h1>
      <p className="text-sm text-gray-400 mb-8">Son güncelleme: Nisan 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Genel Bilgi</h2>
          <p>
            Türkiye Süs Tavukları ve Bahçe Hayvanları Federasyonu (TSHF) olarak,{' '}
            <strong>tshf.org.tr</strong> web sitesini ziyaret eden kullanıcıların gizliliğine saygı
            duyuyor ve kişisel verilerini korumayı öncelikli bir sorumluluk olarak kabul ediyoruz.
            Bu politika, hangi verileri topladığımızı, nasıl kullandığımızı ve haklarınızı açıklar.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Toplanan Veriler</h2>
          <p>Sitemizi kullanırken aşağıdaki veriler toplanabilir:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1.5">
            <li><strong>Üyelik verileri:</strong> Ad soyad, e-posta adresi, telefon numarası ve üye olduğunuz dernek bilgisi.</li>
            <li><strong>Sipariş verileri:</strong> Bilezik sipariş bilgileri (numara, adet, tutar).</li>
            <li><strong>Oturum verileri:</strong> Giriş yaptığınızda tarayıcınıza kaydedilen güvenli oturum çerezi (token).</li>
            <li><strong>Teknik veriler:</strong> IP adresi, tarayıcı türü, ziyaret edilen sayfalar ve erişim zamanı (sunucu logları aracılığıyla).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Verilerin Kullanım Amacı</h2>
          <p>Toplanan veriler yalnızca aşağıdaki amaçlarla kullanılır:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1.5">
            <li>Üyelik hesabınızı oluşturmak ve yönetmek</li>
            <li>Bilezik siparişlerinizi işleme almak ve takip etmek</li>
            <li>Şifre sıfırlama gibi hesap güvenliği işlemlerini gerçekleştirmek</li>
            <li>Federasyon duyurularını ve mesajlarını iletmek</li>
            <li>Sitenin teknik olarak düzgün çalışmasını sağlamak</li>
            <li>Yasal yükümlülüklere uymak</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Çerezler (Cookies)</h2>
          <p>
            Sitemiz, işlevselliği sağlamak amacıyla çerezler kullanmaktadır. Kullandığımız çerezler:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1.5">
            <li><strong>Oturum çerezleri:</strong> Giriş durumunuzu korumak için kullanılır. Tarayıcınızı kapattığınızda silinir.</li>
            <li><strong>Kalıcı çerezler:</strong> Tercihlerinizi hatırlamak amacıyla belirli bir süre saklanır.</li>
            <li>
              <strong>Üçüncü taraf çerezleri (Google AdSense/Analytics):</strong> Sitemizde Google
              tarafından sağlanan reklam ve analiz hizmetleri kullanılmaktadır. Bu hizmetler, size
              ilgi alanlarınıza uygun reklamlar göstermek amacıyla çerez kullanabilir. Google'ın
              gizlilik politikası hakkında daha fazla bilgi için{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                policies.google.com/privacy
              </a>{' '}
              adresini ziyaret edebilirsiniz.
            </li>
          </ul>
          <p className="mt-3">
            Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı
            site işlevleri düzgün çalışmayabilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Reklam Hizmetleri</h2>
          <p>
            Bu sitede <strong>Google AdSense</strong> aracılığıyla reklamlar yayınlanabilir.
            Google ve üçüncü taraf reklam sağlayıcıları, önceki ziyaretlerinizi esas alarak
            ilgi alanlarınıza göre reklamlar göstermek için çerez kullanabilir.
          </p>
          <p className="mt-2">
            Google'ın kişiselleştirilmiş reklam ayarlarını yönetmek için{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              Google Reklam Ayarları
            </a>{' '}
            sayfasını ziyaret edebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Veri Güvenliği</h2>
          <p>
            Kişisel verileriniz güvenli sunucularda saklanmakta; şifreler tek yönlü şifreleme
            (hash) yöntemiyle korunmaktadır. Verilerinizi yetkisiz erişime, değiştirilmeye veya
            ifşa edilmeye karşı korumak için makul teknik ve idari önlemler alınmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Üçüncü Taraflarla Veri Paylaşımı</h2>
          <p>
            Kişisel verileriniz; yasal zorunluluklar, mahkeme kararı veya resmi talep dışında
            hiçbir üçüncü tarafla satılmaz, kiralanmaz veya ticari amaçla paylaşılmaz.
            Teknik hizmet sağlayıcılar (barındırma, e-posta gibi) yalnızca hizmet sunumu
            kapsamında veriye erişebilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Haklarınız (KVKK)</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aşağıdaki haklara
            sahipsiniz:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1.5">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>Verilerin düzeltilmesini veya silinmesini isteme</li>
            <li>İşlemenin kısıtlanmasını talep etme</li>
            <li>Veri taşınabilirliği hakkı</li>
          </ul>
          <p className="mt-3">
            Bu haklarınızı kullanmak için aşağıdaki iletişim adreslerimize başvurabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">9. İletişim</h2>
          <p>
            Gizlilik politikamıza ilişkin sorularınız için bizimle iletişime geçebilirsiniz:
          </p>
          <ul className="mt-2 space-y-1.5">
            <li>📧 <a href="mailto:tshf@tshf.org.tr" className="text-primary-600 hover:underline">tshf@tshf.org.tr</a></li>
            <li>📍 Maltepe Mahallesi 65/1 Sokak Sivil Toplum Merkezi Güzelbahçe / İZMİR</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Politika Değişiklikleri</h2>
          <p>
            Bu gizlilik politikası zaman zaman güncellenebilir. Değişiklikler bu sayfada
            yayımlanacak olup önemli değişiklikler için kullanıcılar bilgilendirilecektir.
            Siteyi kullanmaya devam etmeniz, güncel politikayı kabul ettiğiniz anlamına gelir.
          </p>
        </section>

      </div>
    </div>
  )
}
