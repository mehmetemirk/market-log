# Market Log 🚀

**Market Log**, küçük ve orta ölçekli işletmeler için geliştirilmiş, gerçek zamanlı bir depo yönetim ve toptancı satın alma takip sistemidir. Bu proje, **Akilay** bünyesinde stok yönetim süreçlerini dijitalleştirmek ve operasyonel hızı artırmak amacıyla geliştirilmiştir.

## ✨ Öne Çıkan Özellikler

* **Gerçek Zamanlı Dashboard:** Firebase Firestore ile anlık stok takibi ve ürün yönetimi.
* **Gelişmiş Toptancı Listesi:** Eksik ürünlerin toptancı bazlı filtrelenmesi ve durum yönetimi.
* **Güvenli Kimlik Doğrulama:** Firebase Auth ile şubelere özel güvenli giriş katmanı.
* **Akıllı Filtreleme:** Ürün ismi ve satıcıya göre anlık arama (Client-side filtering).
* **Cihaz Uyumluluğu:** Excalibur G770 ve Surface Pro 4 gibi farklı hardware ekosistemlerinde optimize çalışabilen responsive arayüz.

## 🛠️ Teknoloji Yığını

* **Frontend:** React, Vite, React Router.
* **Backend:** Firebase (Firestore & Auth).
* **Güvenlik:** Vite `.env` Environment Variables.

## 🚀 Kurulum ve Çalıştırma

1.  **Projeyi Klonlayın:**
    ```bash
    git clone [https://github.com/mehmetemirk/market-log.git](https://github.com/mehmetemirk/market-log.git)
    cd market-log
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Çevre Değişkenlerini (Environment Variables) Yapılandırın:**
    * `.env.example` dosyasının adını `.env.local` olarak değiştirin.
    * İçindeki alanları kendi Firebase API anahtarlarınızla doldurun.

4.  **Geliştirme Sunucusunu Başlatın:**
    ```bash
    npm run dev
    ```

## 🔐 Güvenlik Protokolü

Bu proje, hassas API anahtarlarını korumak için `.env` mimarisini kullanır. Ger
