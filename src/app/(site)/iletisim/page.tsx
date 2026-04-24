export const metadata = { title: 'İletişim' }

export default function IletisimPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">İletişim</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* İletişim bilgileri */}
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <h2 className="font-bold text-gray-700 text-lg mb-4">Bize Ulaşın</h2>

            {[
              { icon: '📧', label: 'E-posta', value: 'tshf@tshf.org.tr' },
              { icon: '📞', label: 'Telefon', value: '+90 545 548 84 83' },
              { icon: '📍', label: 'Adres', value: 'Maltepe Mahallesi 65/1 Sokak Sivil Toplum Merkezi Güzelbahçe/İZMİR' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{item.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-500">{item.label}</div>
                  <div className="text-gray-800">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-gray-700 text-lg mb-4">Mesaj Gönderin</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Adınız Soyadınız"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="email@ornek.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mesaj</label>
              <textarea
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Mesajınızı yazın..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Gönder
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
