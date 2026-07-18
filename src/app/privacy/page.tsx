import { BackButton } from "@/components/BackButton";

export const metadata = {
  title: "Məxfilik Siyasəti | Kənd Taxi",
  description: "Kənd Taxi platformasının məxfilik siyasəti",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-8 max-w-2xl mx-auto w-full">
      <BackButton />

      <h1 className="text-2xl font-bold mb-1">Məxfilik Siyasəti</h1>
      <p className="text-sm text-ink-muted mb-8">Son yenilənmə tarixi: 19.07.2026</p>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-ink">
        <section>
          <h2 className="text-base font-semibold mb-2">1. Ümumi müddəalar</h2>
          <p>
            Bu Məxfilik Siyasəti (bundan sonra – &quot;Siyasət&quot;) &quot;Kənd Taxi&quot; platformasının
            (bundan sonra – &quot;Platforma&quot;) İstifadəçilərin fərdi məlumatlarını hansı məqsədlə
            topladığını, necə işlədiyini, saxladığını və qoruduğunu izah edir. Siyasət Azərbaycan
            Respublikasının &quot;Fərdi məlumatlar haqqında&quot; Qanununa və digər müvafiq normativ hüquqi
            aktlara uyğun hazırlanmışdır. Platformadan istifadə etməklə İstifadəçi bu Siyasətdə göstərilən
            şərtlərlə razılaşdığını təsdiq edir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">2. Hansı məlumatlar toplanır</h2>
          <p>Platformadan istifadə zamanı aşağıdakı fərdi məlumatlar toplana bilər:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Ad;</li>
            <li>Soyad;</li>
            <li>Telefon nömrəsi;</li>
            <li>E-poçt ünvanı (yalnız İstifadəçi könüllü təqdim etdikdə);</li>
            <li>Profil məlumatları (profil şəkli və hesabla bağlı digər əlavə məlumatlar);</li>
            <li>Elan məlumatları (yerləşdirilən elanların mətn, şəkil və əlaqə məlumatları).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">3. Məlumatların hansı məqsədlə istifadə olunması</h2>
          <p>Toplanan fərdi məlumatlar aşağıdakı məqsədlər üçün istifadə olunur:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>İstifadəçi hesabının yaradılması və identifikasiyası;</li>
            <li>Platformanın əsas funksionallığının (elanların yerləşdirilməsi, sifarişlərin idarə olunması, bildirişlər) təmin edilməsi;</li>
            <li>İstifadəçilər arasında əlaqənin qurulması (məsələn, elan sahibi ilə maraqlanan şəxs arasında);</li>
            <li>Şifrənin unudulması halında hesabın bərpası (yalnız e-poçt təqdim edildikdə);</li>
            <li>Platformanın təhlükəsizliyinin təmin edilməsi, fırıldaqçılıq və sui-istifadə hallarının qarşısının alınması;</li>
            <li>Qanunvericiliklə nəzərdə tutulmuş öhdəliklərin yerinə yetirilməsi.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">4. Telefon nömrəsinin digər istifadəçilərə göstərilməsi</h2>
          <p>
            İstifadəçinin telefon nömrəsi qaydaya əsasən məxfi saxlanılır. Telefon nömrəsi yalnız aşağıdakı
            hallarda digər İstifadəçilərə göstərilə bilər:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>İstifadəçi özü elan yerləşdirərkən əlaqə nömrəsini elanda göstərməyi seçdikdə;</li>
            <li>Sifariş və ya xidmət prosesinin icrası üçün (məsələn, taksi sifarişi zamanı sürücü və sərnişin arasında) əlaqənin qurulması zəruri olduqda;</li>
            <li>İstifadəçinin bu barədə açıq razılığı olduqda.</li>
          </ul>
          <p className="mt-2">
            Bu hallar istisna olmaqla, telefon nömrəsi üçüncü şəxslərə İstifadəçinin razılığı olmadan
            açıqlanmır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">5. Administratorun məlumatlara çıxış hüququ</h2>
          <p>
            Platformanın administratoru xidmətin düzgün fəaliyyəti, moderasiya, təhlükəsizlik və
            qanunvericiliyə uyğunluğun təmin edilməsi məqsədilə İstifadəçilərin hesab və elan məlumatlarına
            çıxış əldə edə bilər. Bu çıxış yalnız xidməti zərurət çərçivəsində həyata keçirilir və
            məlumatlardan yalnız bu Siyasətdə göstərilən məqsədlər üçün istifadə olunur.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">6. Məlumatların qorunması</h2>
          <p>
            Platforma İstifadəçilərin fərdi məlumatlarının icazəsiz girişdən, itirilmədən, dəyişdirilmədən
            və ya açıqlanmasından qorunması üçün müvafiq texniki və təşkilati tədbirlər görür. Məlumatlara
            giriş yalnız səlahiyyətli şəxslərlə məhdudlaşdırılır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">7. Şifrələrin qorunması</h2>
          <p>
            İstifadəçilərin şifrələri açıq mətn şəklində deyil, bir istiqamətli kriptoqrafik alqoritmlə
            hash edilmiş formada saxlanılır. Bu, Platforma daxilində belə İstifadəçinin real şifrəsinin heç
            kimə (o cümlədən administratora) məlum olmamasını təmin edir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">8. İstifadəçinin öz məlumatlarını yeniləmək və silmək hüququ</h2>
          <p>
            İstifadəçi öz profilindəki fərdi məlumatları istənilən vaxt yeniləmək hüququna malikdir. Habelə,
            İstifadəçi hesabının və ona aid fərdi məlumatların silinməsini tələb edə bilər. Belə tələb daxil
            olduqda məlumatlar, qanunvericiliklə nəzərdə tutulmuş saxlama müddətləri istisna olmaqla, Platforma
            tərəfindən silinir və ya anonimləşdirilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">9. Hüquq-mühafizə orqanlarının qanuni sorğusu</h2>
          <p>
            Azərbaycan Respublikasının qanunvericiliyi ilə müəyyən edilmiş qaydada səlahiyyətli dövlət və
            hüquq-mühafizə orqanlarının qanuni əsaslara söykənən rəsmi sorğusu olduğu təqdirdə, Platforma
            İstifadəçiyə aid müvafiq fərdi məlumatları həmin orqanlara təqdim edə bilər.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">10. Platformanın məlumat təhlükəsizliyi ilə bağlı öhdəlikləri</h2>
          <p>
            Platforma fərdi məlumatların məxfiliyinin və bütövlüyünün qorunması üçün lazımi texniki (şifrələmə,
            girişə nəzarət və s.) və təşkilati tədbirləri görməyi öhdəsinə götürür. Məlumat təhlükəsizliyi
            insidenti baş verdiyi halda, Platforma qanunvericiliklə nəzərdə tutulmuş qaydada müvafiq tədbirləri
            görür və zəruri hallarda İstifadəçini məlumatlandırır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">11. Yekun müddəalar</h2>
          <p>
            Platforma bu Siyasətə dəyişikliklər etmək hüququnu özündə saxlayır. Yenilənmiş Siyasət
            Platformada dərc edildiyi andan qüvvəyə minir. Siyasətlə bağlı suallar üçün İstifadəçi
            Platformanın dəstək xidməti ilə əlaqə saxlaya bilər.
          </p>
        </section>
      </div>
    </main>
  );
}
