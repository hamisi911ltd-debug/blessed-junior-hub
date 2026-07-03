import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  BookOpen, GraduationCap, Users, Trophy, HeartHandshake, Sparkles,
  MapPin, Phone, Mail, Calendar, ArrowRight, CheckCircle2, School,
  Shield, Palette, Music, Microscope, Sun, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Stats />
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
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-gradient text-brand-foreground shadow-glow">
            <School className="h-5 w-5" />
          </span>
          <span>Blessed Junior <span className="text-primary">School</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#about" className="hover:text-primary transition">About</a>
          <a href="#programs" className="hover:text-primary transition">Programs</a>
          <a href="#life" className="hover:text-primary transition">School Life</a>
          <a href="#admissions" className="hover:text-primary transition">Admissions</a>
          <a href="#contact" className="hover:text-primary transition">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
          <Button asChild size="sm" className="bg-brand-gradient text-brand-foreground shadow-glow">
            <Link to="/auth">Portal <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--accent-2)]" />
            Enrolling for the new term now
          </div>
          <h1 className="mt-6 text-5xl md:text-6xl font-extrabold leading-[1.05]">
            Where bright minds <span className="text-primary">bloom</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Blessed Junior School in Magongo Kwahola provides a nurturing, modern
            learning environment where every child discovers curiosity,
            confidence and character.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-brand-gradient text-brand-foreground shadow-glow">
              <a href="#admissions">Apply for admission <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Parent & Staff Portal</Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Qualified teachers</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Safe campus</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Modern curriculum</span>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[4/5] rounded-3xl bg-brand-gradient shadow-glow p-1 rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="h-full w-full rounded-[22px] bg-card p-8 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-4">
                <MiniStat icon={<Users className="h-5 w-5" />} label="Learners" value="480+" />
                <MiniStat icon={<GraduationCap className="h-5 w-5" />} label="Educators" value="32" />
                <MiniStat icon={<Trophy className="h-5 w-5" />} label="Awards" value="45" />
                <MiniStat icon={<BookOpen className="h-5 w-5" />} label="Subjects" value="14" />
              </div>
              <div className="rounded-2xl bg-secondary p-5">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Motto</div>
                <div className="mt-1 font-display text-xl font-semibold">
                  "Learn. Serve. Shine."
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 rounded-2xl bg-[color:var(--accent-2)] text-[color:var(--primary-foreground)] px-4 py-3 shadow-card font-semibold rotate-[-4deg]">
            🎉 CBC-aligned
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="text-primary">{icon}</div>
      <div className="mt-3 text-2xl font-bold font-display">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Stats() {
  const items = [
    { v: "98%", l: "Parent satisfaction" },
    { v: "1:15", l: "Teacher to pupil" },
    { v: "14+", l: "Extra-curricular clubs" },
    { v: "25", l: "Years of excellence" },
  ];
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((i) => (
          <div key={i.l} className="text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-primary font-display">{i.v}</div>
            <div className="text-sm text-muted-foreground mt-1">{i.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">About us</div>
          <h2 className="mt-3 text-4xl font-bold">A caring school shaping brilliant futures.</h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Founded to bring quality education closer to the community of Magongo
            Kwahola, Blessed Junior School blends a rigorous academic program
            with values of kindness, curiosity and service.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Structured curriculum from Baby Class through Primary 7",
              "Certified teachers with continuous training",
              "Safe, spacious campus with library, ICT lab & playgrounds",
              "Active parent-teacher engagement",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" /> <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Feature icon={<Shield />} title="Safe" desc="Fenced, monitored campus" />
          <Feature icon={<HeartHandshake />} title="Nurturing" desc="Small class sizes" />
          <Feature icon={<Sparkles />} title="Creative" desc="Arts, music, drama" />
          <Feature icon={<Microscope />} title="Inquisitive" desc="Hands-on science" />
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border p-6 shadow-card hover:-translate-y-1 transition">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-primary">{icon}</div>
      <div className="mt-4 font-semibold text-lg">{title}</div>
      <div className="text-sm text-muted-foreground">{desc}</div>
    </div>
  );
}

function Programs() {
  const progs = [
    { icon: <Sun />, title: "Early Years", desc: "Baby, Middle & Top Class — play-based discovery." },
    { icon: <BookOpen />, title: "Lower Primary", desc: "P1–P3, building reading, writing & numeracy." },
    { icon: <GraduationCap />, title: "Upper Primary", desc: "P4–P7, preparing pupils for PLE excellence." },
    { icon: <Music />, title: "Arts & Music", desc: "Choir, drama, dance and craft clubs." },
    { icon: <Microscope />, title: "STEM", desc: "Science lab, coding & robotics starter club." },
    { icon: <Palette />, title: "Sports", desc: "Football, netball, athletics & gymnastics." },
  ];
  return (
    <section id="programs" className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Programs</div>
          <h2 className="mt-3 text-4xl font-bold">A well-rounded education</h2>
          <p className="mt-4 text-muted-foreground">
            We follow the national CBC framework, enriched with creative arts,
            sports and STEM.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {progs.map((p) => (
            <div key={p.title} className="group rounded-2xl bg-card border border-border p-6 shadow-card hover:shadow-glow transition">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient text-brand-foreground">{p.icon}</div>
              <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-4 text-sm text-primary font-medium inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                Learn more <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="rounded-3xl bg-brand-gradient text-brand-foreground p-10 md:p-14 shadow-glow relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[color:var(--accent-2)]/40 blur-3xl" />
        <div className="relative grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-3xl md:text-4xl font-bold">Why parents choose us</h2>
            <p className="mt-3 opacity-90">Real results, real care, and a community that feels like family.</p>
          </div>
          <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
            {[
              ["Consistent PLE performance", "Top-tier results year after year."],
              ["Small classes", "Every learner is seen and known."],
              ["Character formation", "Values woven into every lesson."],
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
    </section>
  );
}

function Life() {
  return (
    <section id="life" className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-primary font-semibold">School Life</div>
        <h2 className="mt-3 text-4xl font-bold">Every day is an adventure</h2>
      </div>
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {[
          { t: "Reading Culture", d: "Daily library time and reading challenges.", h: "160" },
          { t: "Sports Day", d: "Termly inter-house competitions.", h: "220" },
          { t: "Music & Drama", d: "Performances every term for the whole community.", h: "180" },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl overflow-hidden border border-border shadow-card">
            <div style={{ height: c.h + "px" }} className="bg-brand-gradient" />
            <div className="p-5">
              <div className="font-semibold">{c.t}</div>
              <div className="text-sm text-muted-foreground mt-1">{c.d}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Admissions() {
  return (
    <section id="admissions" className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-3xl bg-card border border-border p-10 shadow-card">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-primary font-semibold">Admissions</div>
              <h2 className="mt-3 text-3xl font-bold">Join the Blessed family</h2>
              <p className="mt-4 text-muted-foreground">
                We welcome pupils from Baby Class through Primary 7. Applications
                are open all year, with priority intakes at the start of each term.
              </p>
              <div className="mt-6 space-y-3 text-sm">
                <Row icon={<Calendar className="h-4 w-4" />}>Term 1 opens 15th January</Row>
                <Row icon={<Calendar className="h-4 w-4" />}>Term 2 opens 20th May</Row>
                <Row icon={<Calendar className="h-4 w-4" />}>Term 3 opens 9th September</Row>
              </div>
            </div>
            <div>
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
            </div>
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
  return (
    <section id="contact" className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid md:grid-cols-3 gap-6">
        <ContactCard icon={<MapPin />} title="Location" lines={["Magongo Kwahola", "Uganda"]} />
        <ContactCard icon={<Phone />} title="Phone" lines={["+256 700 000 000", "+256 780 000 000"]} />
        <ContactCard icon={<Mail />} title="Email" lines={["info@blessedjunior.sc", "admissions@blessedjunior.sc"]} />
      </div>
    </section>
  );
}

function ContactCard({ icon, title, lines }: { icon: React.ReactNode; title: string; lines: string[] }) {
  return (
    <div className="rounded-2xl border border-border p-6 shadow-card">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-gradient text-brand-foreground">{icon}</div>
      <div className="mt-4 font-semibold text-lg">{title}</div>
      {lines.map((l) => <div key={l} className="text-sm text-muted-foreground">{l}</div>)}
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row gap-4 items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-brand-foreground"><School className="h-4 w-4" /></span>
          © {new Date().getFullYear()} Blessed Junior School, Magongo Kwahola.
        </div>
        <div className="flex gap-6">
          <a href="#about" className="hover:text-primary">About</a>
          <a href="#admissions" className="hover:text-primary">Admissions</a>
          <Link to="/auth" className="hover:text-primary">Portal</Link>
        </div>
      </div>
    </footer>
  );
}
