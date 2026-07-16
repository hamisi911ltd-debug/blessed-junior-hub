import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import {
  BookOpen, GraduationCap, Users, Trophy, HeartHandshake, Sparkles,
  MapPin, Phone, Mail, Calendar, ArrowRight, CheckCircle2,
  Shield, Palette, Music, Microscope, Sun, ChevronRight,
} from "lucide-react";
import logo from "@/LOGO.jpeg";
import photo1 from "@/1.jpeg";
import photo2 from "@/2.jpeg";
import photo3 from "@/3.jpeg";
import photo4 from "@/4.jpeg";
import photo5 from "@/5.jpeg";
import photoH from "@/h.jpeg";
import photoJ from "@/j.jpeg";
import photoK from "@/k.jpeg";

const creativeImg = "https://images.pexels.com/photos/5063473/pexels-photo-5063473.jpeg?auto=compress&cs=tinysrgb&w=700";
const inquisitiveImg = "https://images.pexels.com/photos/8617957/pexels-photo-8617957.jpeg?auto=compress&cs=tinysrgb&w=700";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <About />
      <Programs />
      <WhyUs />
      <Life />
      <Admissions />
      <Contact />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0 font-display font-bold text-sm sm:text-base md:text-lg">
          <span className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-lg overflow-hidden bg-white shadow-glow p-0.5">
            <img src={logo} alt="Mombasa Kiongozi Academy crest" className="h-full w-full object-contain" />
          </span>
          <span className="leading-tight whitespace-nowrap">
            Mombasa Kiongozi <span className="text-primary">Academy</span>
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-foreground/80 shrink-0">
          <a href="#about" className="whitespace-nowrap hover:text-primary transition">About</a>
          <a href="#programs" className="whitespace-nowrap hover:text-primary transition">Programs</a>
          <a href="#life" className="whitespace-nowrap hover:text-primary transition">School Life</a>
          <a href="#admissions" className="whitespace-nowrap hover:text-primary transition">Admissions</a>
          <a href="#contact" className="whitespace-nowrap hover:text-primary transition">Contact</a>
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="sm" className="bg-brand-gradient text-brand-foreground shadow-glow">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="mx-auto max-w-7xl px-6 pt-0 pb-14 md:pb-16 grid md:grid-cols-2 gap-12 items-center">
        <Reveal from="left">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05]">
            Raising tomorrow's <span className="text-primary">leaders</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Mombasa Kiongozi Academy provides a nurturing, CBC-aligned learning
            environment in Mombasa, Kenya, where every learner discovers curiosity,
            confidence and the character of a true "Kiongozi" — a leader.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-brand-gradient text-brand-foreground shadow-glow">
              <a href="#admissions">Apply for admission <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Parent & Staff Portal</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Qualified teachers</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Safe campus</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> CBC curriculum</span>
          </div>
        </Reveal>
        <Reveal from="right" delay={120} className="relative">
          <div className="aspect-[4/5] rounded-3xl bg-brand-gradient shadow-glow p-2 rotate-2 hover:rotate-0 transition-transform duration-500">
            <img
              src={photo3}
              alt="Learners at Mombasa Kiongozi Academy"
              className="h-full w-full rounded-[22px] object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 rounded-2xl bg-[color:var(--accent-2)] text-[color:var(--primary-foreground)] px-4 py-3 shadow-card font-semibold rotate-[-4deg]">
            🎉 CBC-aligned
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-6 py-14 md:py-16 overflow-x-clip">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <Reveal from="left">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">About us</div>
          <h2 className="mt-3 text-4xl font-bold">A caring academy shaping brilliant futures.</h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Mombasa Kiongozi Academy brings quality, values-driven education to the
            community of Mombasa. "Kiongozi" means leader in Swahili — and our mission
            is to nurture confident, capable leaders through a rigorous Competency
            Based Curriculum (CBC) balanced with kindness, curiosity and service.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Structured CBC curriculum from Playgroup through Junior School",
              "Certified teachers with continuous professional training",
              "Safe, spacious campus with library, ICT lab & playgrounds",
              "Active parent-teacher engagement and community events",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" /> <span>{t}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <div className="grid grid-cols-2 gap-4">
          <Reveal from="right" delay={0}><PhotoFeature img={photo1} icon={<Shield />} title="Safe" desc="Fenced, monitored campus" /></Reveal>
          <Reveal from="right" delay={100}><PhotoFeature img={photo2} icon={<HeartHandshake />} title="Nurturing" desc="Small class sizes" /></Reveal>
          <Reveal from="right" delay={200}><PhotoFeature img={creativeImg} icon={<Sparkles />} title="Creative" desc="Arts, music, drama" /></Reveal>
          <Reveal from="right" delay={300}><PhotoFeature img={inquisitiveImg} icon={<Microscope />} title="Inquisitive" desc="Hands-on science" /></Reveal>
        </div>
      </div>
    </section>
  );
}

function PhotoFeature({ img, icon, title, desc }: { img: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-card hover:-translate-y-1 transition aspect-square">
      <img src={img} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-5 text-white">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/20 backdrop-blur">{icon}</div>
        <div className="mt-3 font-semibold text-lg">{title}</div>
        <div className="text-sm opacity-90">{desc}</div>
      </div>
    </div>
  );
}

function Programs() {
  const progs = [
    {
      icon: <Sun />, title: "Early Years", desc: "Playgroup, PP1 & PP2 — play-based discovery.",
      img: photo1,
    },
    {
      icon: <BookOpen />, title: "Lower Primary", desc: "Grade 1–3, building reading, writing & numeracy.",
      img: photo2,
    },
    {
      icon: <GraduationCap />, title: "Upper Primary", desc: "Grade 4–6, preparing learners for KPSEA excellence.",
      img: photoK,
    },
    {
      icon: <Music />, title: "Arts & Music", desc: "Choir, drama, dance and craft clubs.",
      img: photo3,
    },
    {
      icon: <Microscope />, title: "STEM", desc: "Science lab, coding & robotics starter club.",
      img: photoH,
    },
    {
      icon: <Palette />, title: "Sports", desc: "Football, netball, athletics & swimming.",
      img: photoJ,
    },
  ];
  return (
    <section id="programs" className="bg-secondary/40 py-14 md:py-16 overflow-x-clip">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal from="top" className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Programs</div>
          <h2 className="mt-3 text-4xl font-bold">A well-rounded education</h2>
          <p className="mt-4 text-muted-foreground">
            We follow Kenya's national CBC framework, enriched with creative arts,
            sports and STEM.
          </p>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {progs.map((p, idx) => {
            const green = idx % 2 === 1;
            return (
              <Reveal key={p.title} from={idx % 2 === 0 ? "left" : "right"} delay={(idx % 3) * 110}>
                <div className="group relative rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-glow hover:-translate-y-1 transition h-72">
                  <img src={p.img} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className={`absolute top-3 left-3 grid h-11 w-11 place-items-center rounded-xl shadow-card ${green ? "bg-brand-gradient text-brand-foreground" : "bg-white/95 text-primary backdrop-blur"}`}>
                    {p.icon}
                  </div>
                  <div className="relative h-full flex flex-col justify-end p-5 text-white">
                    <h3 className="text-xl font-semibold">{p.title}</h3>
                    <p className="mt-1 text-sm text-white/85">{p.desc}</p>
                    <div className="mt-3 text-sm font-medium inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      Learn more <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 md:py-16 overflow-x-clip">
      <Reveal from="bottom">
        <div className="rounded-3xl bg-brand-gradient text-brand-foreground p-10 md:p-14 shadow-glow relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[color:var(--accent-2)]/40 blur-3xl" />
          <div className="relative grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h2 className="text-3xl md:text-4xl font-bold">Why parents choose us</h2>
              <p className="mt-3 opacity-90">Real results, real care, and a community that feels like family.</p>
            </div>
            <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
              {[
                ["Consistent academic performance", "Top-tier CBC results year after year."],
                ["Small classes", "Every learner is seen and known."],
                ["Character formation", "Leadership and values woven into every lesson."],
                ["Modern facilities", "Library, ICT lab, health room."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-2xl bg-background/10 backdrop-blur border border-white/20 p-5">
                  <div className="font-semibold text-lg">{t}</div>
                  <div className="mt-1 text-sm opacity-90">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Life() {
  const cards = [
    { t: "Reading Culture", d: "Daily library time and reading challenges.", img: photo4, from: "left" as const },
    {
      t: "Sports Day", d: "Termly inter-house competitions on our playgrounds.",
      img: "https://images.unsplash.com/photo-1591502843994-4d9433685765?q=80&w=800&auto=format&fit=crop",
      from: "bottom" as const,
    },
    { t: "Digital Learning", d: "Hands-on time in our ICT computer lab every week.", img: photo5, from: "right" as const },
  ];
  return (
    <section id="life" className="mx-auto max-w-7xl px-6 py-14 md:py-16 overflow-x-clip">
      <Reveal from="top" className="text-center max-w-2xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-primary font-semibold">School Life</div>
        <h2 className="mt-3 text-4xl font-bold">Every day is an adventure</h2>
      </Reveal>
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Reveal key={c.t} from={c.from}>
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-card hover:-translate-y-1 transition h-64">
              <img src={c.img} alt={c.t} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-5 text-white">
                <div className="font-semibold text-lg">{c.t}</div>
                <div className="text-sm text-white/85 mt-1">{c.d}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Admissions() {
  return (
    <section id="admissions" className="bg-secondary/40 py-14 md:py-16 overflow-x-clip">
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-3xl bg-card border border-border p-10 shadow-card">
          <div className="grid md:grid-cols-2 gap-10">
            <Reveal from="left">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold">Admissions</div>
              <h2 className="mt-3 text-3xl font-bold">Join the Kiongozi family</h2>
              <p className="mt-4 text-muted-foreground">
                We welcome learners from Playgroup through Junior School. Applications
                are open all year, with priority intakes at the start of each term.
              </p>
              <div className="mt-6 space-y-3 text-sm">
                <Row icon={<Calendar className="h-4 w-4" />}>Term 1 opens January</Row>
                <Row icon={<Calendar className="h-4 w-4" />}>Term 2 opens May</Row>
                <Row icon={<Calendar className="h-4 w-4" />}>Term 3 opens September</Row>
              </div>
            </Reveal>
            <Reveal from="right" delay={100}>
              <ol className="space-y-4">
                {["Visit the school or call us", "Collect / complete an application form", "Sit an entry interview", "Receive admission letter", "Pay fees & report on opening day"].map((s, i) => (
                  <li key={s} className="flex items-start gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-gradient text-brand-foreground font-semibold text-sm shrink-0">{i+1}</span>
                    <span className="text-sm">{s}</span>
                  </li>
                ))}
              </ol>
              <Button asChild size="lg" className="mt-6 w-full bg-brand-gradient text-brand-foreground shadow-glow">
                <a href="#contact">Start your application</a>
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="flex items-center gap-2 text-muted-foreground">{icon}{children}</div>;
}

function Contact() {
  const { data } = useQuery({
    queryKey: ["public", "school-contact"],
    queryFn: async () => {
      const res = await fetch("/api/public/school-contact");
      return res.json() as Promise<{ name: string | null; phone: string | null; email: string | null; address: string | null }>;
    },
  });

  const cards = [
    { icon: <MapPin />, title: "Location", lines: data?.address ? [data.address] : [], tone: "green" as const },
    { icon: <Phone />, title: "Phone", lines: data?.phone ? [data.phone] : [], tone: "white" as const },
    { icon: <Mail />, title: "Email", lines: data?.email ? [data.email] : [], tone: "green" as const },
  ].filter((c) => c.lines.length > 0);

  if (!data || cards.length === 0) return null;

  return (
    <section id="contact" className="mx-auto max-w-7xl px-6 py-14 md:py-16 overflow-x-clip">
      <div className={`grid gap-6 ${cards.length === 3 ? "md:grid-cols-3" : cards.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1 max-w-sm mx-auto"}`}>
        {cards.map((c, i) => (
          <Reveal key={c.title} from={i === 0 ? "left" : i === cards.length - 1 ? "right" : "bottom"} delay={i * 100}>
            <ContactCard icon={c.icon} title={c.title} lines={c.lines} tone={c.tone} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ContactCard({ icon, title, lines, tone = "white" }: { icon: React.ReactNode; title: string; lines: string[]; tone?: "white" | "green" }) {
  const green = tone === "green";
  return (
    <div className={`rounded-2xl p-6 shadow-card hover:-translate-y-1 transition ${green ? "bg-brand-gradient text-brand-foreground" : "border border-border bg-card"}`}>
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${green ? "bg-white/15" : "bg-brand-gradient text-brand-foreground"}`}>{icon}</div>
      <div className="mt-4 font-semibold text-lg">{title}</div>
      {lines.map((l) => <div key={l} className={`text-sm ${green ? "opacity-90" : "text-muted-foreground"}`}>{l}</div>)}
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-border bg-secondary/40 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
      <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-[color:var(--accent-2)]/10 blur-3xl" />
      <Reveal from="bottom">
        <div className="relative mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row gap-6 items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg overflow-hidden bg-white p-0.5">
              <img src={logo} alt="Mombasa Kiongozi Academy crest" className="h-full w-full object-contain" />
            </span>
            © {new Date().getFullYear()} Mombasa Kiongozi Academy, Mombasa, Kenya.
          </div>
          <div className="flex gap-6">
            <a href="#about" className="hover:text-primary">About</a>
            <a href="#admissions" className="hover:text-primary">Admissions</a>
            <Link to="/auth" className="hover:text-primary">Portal</Link>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
