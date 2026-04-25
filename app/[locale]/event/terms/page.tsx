import Image from "next/image";

export default function EventTermsPage() {
  return (
    <div className="dashboard-theme relative min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="-translate-x-1/2 absolute top-0 left-1/2 h-150 w-200 rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-100 w-150 rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="dash-animate-in relative z-10 mx-auto w-full max-w-2xl px-6 py-12">
        <div className="mb-10 text-center">
          <Image
            className="mx-auto"
            src="/images/twino.svg"
            alt="Twino"
            width={120}
            height={32}
            priority
          />
        </div>

        <div className="rounded-2xl border border-black/5 bg-white/60 shadow-xl backdrop-blur-md">
          <div className="border-black/5 border-b px-8 py-5">
            <h1 className="font-Helvetica-Neue font-semibold text-primary text-sm">
              TwinO & Property Exclusive 2026: მომხმარებლის მონაცემთა
              დამუშავების პოლიტიკა
            </h1>
          </div>

          <div className="space-y-6 px-8 py-6 text-primary/70 text-sm leading-relaxed">
            <section>
              <h2 className="mb-2 font-Helvetica-Neue font-bold text-primary text-sm">
                1. ზოგადი დებულებები
              </h2>
              <p>
                წინამდებარე პოლიტიკა არეგულირებს შპს &ldquo;თვინო&rdquo;-ს
                (შემდგომში &ldquo;TwinO&rdquo; ან &ldquo;სისტემა&rdquo;) და
                Property Georgia-ს მიერ, ღონისძიება &ldquo;Property Exclusive
                2026&rdquo;-ის ფარგლებში, თქვენი (მომხმარებლის/მყიდველის)
                პერსონალური მონაცემების შეგროვებისა და დამუშავების წესებს.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-Helvetica-Neue font-bold text-primary text-sm">
                2. რა მონაცემებს ვაგროვებთ?
              </h2>
              <p className="mb-3">
                WhatsApp არხში TwinO-ს ხელოვნურ ინტელექტთან (AI ასისტენტთან)
                კომუნიკაციისას, სისტემა ავტომატურად აგროვებს მხოლოდ იმ{" "}
                <span className="font-semibold text-primary">
                  ინფორმაციას, რომელსაც თქვენ ნებაყოფლობით გვაწვდით:
                </span>
              </p>
              <ul className="space-y-1.5 pl-1">
                {[
                  "ტელეფონის ნომერი და WhatsApp პროფილის სახელი.",
                  "თქვენი ინტერესის სფერო (სასურველი დეველოპერი, პროექტი).",
                  "სავარაუდო ფინანსური ბიუჯეტი და შეძენის მიზანი.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="font-semibold text-primary">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="mb-2 font-Helvetica-Neue font-bold text-primary text-sm">
                3. მონაცემთა გამოყენების მიზანი და მესამე პირებისთვის გადაცემა
              </h2>
              <p className="mb-3">
                თქვენი მონაცემების შეგროვების ერთადერთი{" "}
                <span className="font-semibold text-primary">
                  მიზანია დაგაკავშიროთ თქვენთვის სასურველ უძრავი ქონების
                  დეველოპერთან.
                </span>
              </p>
              <ul className="space-y-2.5 pl-1">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>
                    პირდაპირი გადაცემა: AI ასისტენტთან საუბრისას, თქვენს მიერ
                    დაფიქსირებული ინტერესის საფუძველზე, თქვენი მონაცემები
                    მყისიერად და ავტომატურად გადაეცემა მხოლოდ იმ კონკრეტულ
                    დეველოპერს (მაგ: M2, Alliance, Blox),{" "}
                    <span className="font-semibold text-primary">
                      რომლის პროექტითაც დაინტერესდით.
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>
                    ორგანიზატორის წვდომა: მონაცემებზე ასევე წვდომა აქვს
                    ღონისძიების{" "}
                    <span className="font-semibold text-primary">
                      ორგანიზატორს, Property Georgia-ს, მხოლოდ ადმინისტრაციული
                      და სტატისტიკური მიზნებისთვის.
                    </span>{" "}
                  </span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 font-Helvetica-Neue font-bold text-primary text-sm">
                4. მონაცემთა უსაფრთხოება და შენახვის ვადა
              </h2>
              <p>
                TwinO მოქმედებს მხოლოდ როგორც მონაცემთა დამმუშავებელი (Data
                Processor). ჩვენ არ ვიყენებთ თქვენს მონაცემებს ჩვენი{" "}
                <span className="font-semibold text-primary">
                  სარეკლამო მიზნებისთვის და არ ვყიდით მათ.
                </span>{" "}
                თქვენი მონაცემები TwinO-ს სერვერებზე ინახება ღონისძიების
                დასრულებიდან 7 (შვიდი) კალენდარული დღის განმავლობაში, რის
                შემდეგაც ისინი სრულად იშლება ან ანონიმიზირდება.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-Helvetica-Neue font-bold text-primary text-sm">
                5. თქვენი უფლებები
              </h2>
              <p>
                ჩვენ პასუხისმგებლობას არ ვიღებთ მონაცემების{" "}
                <span className="font-semibold text-primary">
                  რედაქტირება/წაშლასთან
                </span>{" "}
                დაკავშირებით(4 პუნქტის შესაბამისად).{" "}
                <span className="font-semibold text-primary">
                  უფლება გაქვთ ნებისმიერ დროს მოითხოვოთ თქვენი მონაცემების წაშლა
                  ან შესწორება თქვენს მიერ არჩეულ დეველოპერთან/ორგანიზატორთან.
                </span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
