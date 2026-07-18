import { BackButton } from "@/components/BackButton";

export const metadata = {
  title: "İstifadə Şərtləri | Kənd Taxi",
  description: "Kənd Taxi platformasının istifadə şərtləri",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 py-8 max-w-2xl mx-auto w-full">
      <BackButton />

      <h1 className="text-2xl font-bold mb-1">İstifadə Şərtləri</h1>
      <p className="text-sm text-ink-muted mb-8">Son yenilənmə tarixi: 19.07.2026</p>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-ink">
        <section>
          <h2 className="text-base font-semibold mb-2">1. Ümumi müddəalar</h2>
          <p>
            Bu İstifadə Şərtləri (bundan sonra – &quot;Şərtlər&quot;) &quot;Kənd Taxi&quot; onlayn platformasından
            (bundan sonra – &quot;Platforma&quot;) istifadə edən bütün fiziki və hüquqi şəxslər (bundan sonra –
            &quot;İstifadəçi&quot;) üçün məcburi qaydaları müəyyən edir. Platformadan istifadə etməklə İstifadəçi bu
            Şərtlərlə tam şəkildə tanış olduğunu və onları qeyd-şərtsiz qəbul etdiyini təsdiq edir. Şərtlərlə razı
            olmayan şəxs Platformadan istifadə etməməlidir.
          </p>
          <p className="mt-2">
            Bu Şərtlər Azərbaycan Respublikasının Mülki Məcəlləsi, &quot;İstehlakçıların hüquqlarının müdafiəsi
            haqqında&quot;, &quot;Elektron ticarət haqqında&quot;, &quot;Fərdi məlumatlar haqqında&quot; və
            &quot;İnformasiya, informasiyalaşdırma və informasiyanın mühafizəsi haqqında&quot; Azərbaycan
            Respublikası qanunlarına, habelə digər müvafiq normativ hüquqi aktlara uyğun tərtib edilmişdir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">2. Platformadan istifadə qaydaları</h2>
          <p>
            Platforma nəqliyyat (taksi, yük daşıma), xidmət və məhsul elanlarının yerləşdirilməsi, habelə
            istifadəçilər arasında əlaqənin qurulması üçün vasitəçi rolunu oynayan texniki infrastrukturdur.
            Platforma sahibi Platformada baş verən əməliyyatların (nəqliyyat xidməti, alqı-satqı, əmək
            münasibətləri və s.) tərəfi deyil və yalnız İstifadəçilər arasında əlaqənin qurulmasına texniki
            imkan yaradır.
          </p>
          <p className="mt-2">
            Platformadan istifadə üçün İstifadəçi 18 yaşına çatmış olmalı və qeydiyyat zamanı düzgün, dəqiq və
            aktual məlumat təqdim etməlidir. Bir şəxsin adından yalnız bir hesab yaradıla bilər. Hesab
            məlumatlarının (telefon nömrəsi, şifrə) məxfiliyinin qorunması İstifadəçinin öz məsuliyyətindədir və
            hesab üzərindən edilən bütün əməliyyatlara görə İstifadəçi cavabdehdir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">3. İstifadəçinin hüquq və vəzifələri</h2>
          <p className="font-medium mb-1">İstifadəçinin hüquqları:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Platformanın funksionallığından bu Şərtlərə uyğun şəkildə sərbəst istifadə etmək;</li>
            <li>Öz hesabı və elanları üzərində nəzarəti həyata keçirmək, onları redaktə və ya silmək;</li>
            <li>Fərdi məlumatlarının bu Şərtlərin və Məxfilik Siyasətinin şərtlərinə uyğun işlənməsini tələb etmək;</li>
            <li>Platforma ilə bağlı şikayət və müraciətlərini bildirmək.</li>
          </ul>
          <p className="font-medium mt-3 mb-1">İstifadəçinin vəzifələri:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Qeydiyyat zamanı və sonrakı istifadə müddətində doğru məlumat təqdim etmək;</li>
            <li>Azərbaycan Respublikasının qanunvericiliyinə və bu Şərtlərə riayət etmək;</li>
            <li>Digər istifadəçilərin hüquqlarına, şərəf və ləyaqətinə hörmətlə yanaşmaq;</li>
            <li>Hesab məlumatlarının məxfiliyini qorumaq və şübhəli fəaliyyət barədə Platformaya məlumat vermək;</li>
            <li>Yerləşdirdiyi elanların həqiqətə uyğunluğuna görə şəxsən məsuliyyət daşımaq.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">4. Platforma sahibinin hüquq və vəzifələri</h2>
          <p className="font-medium mb-1">Platforma sahibinin hüquqları:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Bu Şərtlərə zidd hərəkət edən İstifadəçilərin elanlarını silmək, hesabını məhdudlaşdırmaq və ya bloklamaq;</li>
            <li>Platformanın funksionallığını, dizaynını və xidmət şərtlərini əvvəlcədən bildirməklə dəyişdirmək;</li>
            <li>Texniki və ya təhlükəsizlik zərurəti yarandıqda Platformanın işini müvəqqəti dayandırmaq;</li>
            <li>Qanunvericiliklə nəzərdə tutulmuş hallarda müvafiq dövlət orqanları ilə əməkdaşlıq etmək.</li>
          </ul>
          <p className="font-medium mt-3 mb-1">Platforma sahibinin vəzifələri:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Platformanın normal və fasiləsiz işləməsi üçün ağlabatan səylər göstərmək;</li>
            <li>İstifadəçilərin fərdi məlumatlarının Məxfilik Siyasətinə uyğun qorunmasını təmin etmək;</li>
            <li>Qanunsuz və ya bu Şərtlərə zidd məzmunun aşkarlanması halında müvafiq tədbirlər görmək.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">5. Qanunsuz məzmunun paylaşılmasının qadağan olunması</h2>
          <p>
            İstifadəçilərə Azərbaycan Respublikasının qanunvericiliyi ilə qadağan olunmuş, üçüncü şəxslərin
            əqli mülkiyyət, şərəf, ləyaqət və ya digər qanuni hüquqlarını pozan, ictimai qaydanı, milli
            təhlükəsizliyi və ya əxlaq normalarını pozan hər hansı məzmunun (mətn, şəkil, video, keçid və s.)
            yerləşdirilməsi qəti qadağandır. Bura, o cümlədən, lisenziyasız fəaliyyətlə bağlı elanlar,
            qadağan olunmuş mal və xidmətlərin təklifi daxildir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">6. Təhqir, söyüş, dələduzluq və saxta elanların qadağan olunması</h2>
          <p>
            Platforma daxilində digər istifadəçilərə qarşı təhqiramiz, söyüş xarakterli, ayrı-seçkiliyə
            yönəlmiş ifadələrin istifadəsi qəti qadağandır. Eyni zamanda, İstifadəçini və ya üçüncü şəxsləri
            aldatmaq məqsədi daşıyan dələduzluq xarakterli hərəkətlər, habelə mövcud olmayan xidmət və ya
            məhsul haqqında yanlış, yanıltıcı və ya saxta elanların yerləşdirilməsi qadağandır. Bu cür
            hərəkətlər aşkar edildikdə Platforma sahibi hesabı dərhal bloklamaq və qanunvericiliklə nəzərdə
            tutulmuş hallarda müvafiq orqanlara məlumat vermək hüququna malikdir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">7. Elanların moderator tərəfindən yoxlanılması və silinməsi hüququ</h2>
          <p>
            Platformada yerləşdirilən bütün elanlar moderasiya prosesindən keçə bilər. Platforma sahibi bu
            Şərtlərə, qanunvericiliyə və ya daxili qaydalara uyğun olmayan istənilən elanı əvvəlcədən
            xəbərdarlıq etmədən yoxlamaq, redaktə tələb etmək, dayandırmaq və ya birdəfəlik silmək hüququnu
            özündə saxlayır. Elanın silinməsi barədə qərar Platforma sahibinin müstəqil mülahizəsi əsasında
            qəbul edilir və bu, İstifadəçiyə qarşı hər hansı kompensasiya öhdəliyi yaratmır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">8. Hesabın müvəqqəti və ya daimi bloklanması halları</h2>
          <p>Aşağıdakı hallarda İstifadəçinin hesabı müvəqqəti və ya daimi olaraq bloklana bilər:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Bu Şərtlərin, o cümlədən 5 və 6-cı bəndlərin pozulması;</li>
            <li>Qeydiyyat zamanı yanlış və ya yanıltıcı məlumatların təqdim edilməsi;</li>
            <li>Digər istifadəçilərə qarşı dələduzluq, təhdid və ya zərərverici hərəkətlərin edilməsi;</li>
            <li>Platformanın texniki infrastrukturuna zərər vurmaq cəhdi (kibertəhlükəsizlik pozuntuları daxil olmaqla);</li>
            <li>Səlahiyyətli dövlət orqanlarının qanuni tələbi.</li>
          </ul>
          <p className="mt-2">
            Müvəqqəti bloklama zamanı hesab müəyyən müddətə məhdudlaşdırılır və pozuntunun aradan qaldırılması
            şərti ilə bərpa oluna bilər. Təkrarlanan və ya ciddi pozuntular halında hesab daimi olaraq
            bloklanır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">9. Mübahisələrin həlli qaydası</h2>
          <p>
            Bu Şərtlərin icrası zamanı yaranan bütün mübahisə və fikir ayrılıqları tərəflər arasında danışıqlar
            yolu ilə həll edilməyə çalışılır. Tərəflər arasında razılıq əldə olunmadıqda mübahisə Azərbaycan
            Respublikasının qanunvericiliyi ilə müəyyən edilmiş qaydada müvafiq məhkəmə orqanlarına verilə
            bilər.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">10. Məsuliyyətin məhdudlaşdırılması</h2>
          <p>
            Platforma sahibi İstifadəçilər arasında bağlanan əqdlərin (nəqliyyat xidməti, alqı-satqı və s.)
            icrasına, keyfiyyətinə və ya nəticələrinə görə məsuliyyət daşımır, belə ki, Platforma yalnız
            texniki vasitəçi rolunu oynayır. Platforma sahibi qanunvericiliklə nəzərdə tutulmuş hallar istisna
            olmaqla, Platformanın istifadəsi nəticəsində yaranan dolayı, təsadüfi və ya əlavə itki və
            zərərlərə görə məsuliyyət daşımır. Platforma &quot;olduğu kimi&quot; (&quot;as is&quot;) əsasda
            təqdim olunur və fasiləsiz, xətasız işləməsinə dair zəmanət verilmir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">11. Azərbaycan Respublikasının qanunvericiliyinin tətbiqi</h2>
          <p>
            Bu Şərtlər Azərbaycan Respublikasının qanunvericiliyinə əsasən tərtib edilmiş, təfsir olunur və
            tətbiq edilir. Şərtlərin hər hansı müddəası Azərbaycan Respublikasının qanunvericiliyinə zidd
            hesab edildiyi halda, həmin müddəa qüvvədən düşür, digər müddəalar isə öz qüvvəsini saxlayır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">12. Yekun müddəalar</h2>
          <p>
            Platforma sahibi bu Şərtlərə dəyişikliklər etmək hüququnu özündə saxlayır. Dəyişikliklər
            Platformada dərc edildiyi andan qüvvəyə minir. İstifadəçinin dəyişiklikdən sonra Platformadan
            istifadəni davam etdirməsi yenilənmiş Şərtlərlə razılaşdığı mənasını daşıyır.
          </p>
        </section>
      </div>
    </main>
  );
}
