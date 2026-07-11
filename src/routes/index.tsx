import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  BookOpen, GraduationCap, Users, Trophy, HeartHandshake, Sparkles,
  MapPin, Phone, Mail, Calendar, ArrowRight, CheckCircle2, School,
  Shield, Palette, Music, Microscope, Sun, ChevronRight,
  Facebook, Instagram, Twitter, Youtube,
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
          <span>Mombasa Kiongozi <span className="text-primary">Academy</span></span>
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
      <div className="mx-auto max-w-7xl px-6 pt-6 pb-20 md:pt-10 md:pb-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--accent-2)]" />
            Enrolling for the new term now
          </div>
          <h1 className="mt-4 text-5xl md:text-6xl font-extrabold leading-[1.05]">
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
        </div>
        <div className="relative">
          <div className="aspect-[4/5] rounded-3xl bg-brand-gradient shadow-glow p-2 rotate-2 hover:rotate-0 transition-transform duration-500">
            <img
              src="https://images.pexels.com/photos/14909652/pexels-photo-14909652.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Learners at Mombasa Kiongozi Academy"
              className="h-full w-full rounded-[22px] object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 rounded-2xl bg-[color:var(--accent-2)] text-[color:var(--primary-foreground)] px-4 py-3 shadow-card font-semibold rotate-[-4deg]">
            🎉 CBC-aligned
          </div>
          <div className="absolute -top-6 -right-4 hidden sm:block w-32 aspect-square rounded-2xl overflow-hidden border-4 border-background shadow-card rotate-6">
            <img
              src="https://images.pexels.com/photos/9223236/pexels-photo-9223236.jpeg?auto=compress&cs=tinysrgb&w=300"
              alt="Pupil in school uniform"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { v: "98%", l: "Parent satisfaction" },
    { v: "1:15", l: "Teacher to pupil" },
    { v: "14+", l: "Extra-curricular clubs" },
    { v: "Mombasa", l: "Proudly Kenyan, coastal roots" },
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
    { icon: <Sun />, title: "Early Years", desc: "Playgroup, PP1 & PP2 — play-based discovery." },
    { icon: <BookOpen />, title: "Lower Primary", desc: "Grade 1–3, building reading, writing & numeracy." },
    { icon: <GraduationCap />, title: "Upper Primary", desc: "Grade 4–6, preparing learners for KPSEA excellence." },
    { icon: <Music />, title: "Arts & Music", desc: "Choir, drama, dance and craft clubs." },
    { icon: <Microscope />, title: "STEM", desc: "Science lab, coding & robotics starter club." },
    { icon: <Palette />, title: "Sports", desc: "Football, netball, athletics & swimming." },
  ];
  return (
    <section id="programs" className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Programs</div>
          <h2 className="mt-3 text-4xl font-bold">A well-rounded education</h2>
          <p className="mt-4 text-muted-foreground">
            We follow Kenya's national CBC framework, enriched with creative arts,
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
    </section>
  );
}

function Life() {
  const cards = [
    {
      t: "Reading Culture",
      d: "Daily library time and reading challenges.",
      img: "https://images.unsplash.com/photo-1576108700272-8d9f86c51273?q=80&w=800&auto=format&fit=crop",
    },
    {
      t: "Sports Day",
      d: "Termly inter-house competitions on our playgrounds.",
      img: "https://images.unsplash.com/photo-1591502843994-4d9433685765?q=80&w=800&auto=format&fit=crop",
    },
    {
      t: "Music & Drama",
      d: "Performances every term for the whole community.",
      img: "https://images.unsplash.com/photo-1548102249-acdce64fffbd?q=80&w=800&auto=format&fit=crop",
    },
  ];
  return (
    <section id="life" className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-primary font-semibold">School Life</div>
        <h2 className="mt-3 text-4xl font-bold">Every day is an adventure</h2>
      </div>
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <div key={c.t} className="rounded-2xl overflow-hidden border border-border shadow-card">
            <img src={c.img} alt={c.t} className="h-44 w-full object-cover" />
            <div className="p-5">
              <div className="font-semibold">{c.t}</div>
              <div className="text-sm text-muted-foreground mt-1">{c.d}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          "https://images.unsplash.com/photo-1547082661-71362fc3969c?q=80&w=500&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1547226706-af7e2c20bcea?q=80&w=500&auto=format&fit=crop",
          "https://images.pexels.com/photos/35839372/pexels-photo-35839372.jpeg?auto=compress&cs=tinysrgb&w=500",
          "https://images.pexels.com/photos/18449718/pexels-photo-18449718.jpeg?auto=compress&cs=tinysrgb&w=500",
        ].map((src) => (
          <div key={src} className="aspect-square rounded-xl overflow-hidden border border-border">
            <img src={src} alt="Learners at Mombasa Kiongozi Academy" className="h-full w-full object-cover hover:scale-105 transition duration-500" />
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
        <ContactCard icon={<MapPin />} title="Location" lines={["Mombasa, Kenya"]} />
        <ContactCard icon={<Phone />} title="Phone" lines={["+254 700 000 000", "+254 780 000 000"]} />
        <ContactCard icon={<Mail />} title="Email" lines={["info@mombasakiongozi.ac.ke", "admissions@mombasakiongozi.ac.ke"]} />
      </div>
      <p className="mt-6 text-xs text-muted-foreground text-center max-w-xl mx-auto">
        Contact details above are placeholders — replace with the school's verified
        phone number, email and street address.
      </p>
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
  const socials = [
    { icon: Facebook, label: "Facebook", href: "#", bg: "#1877F2" },
    { icon: Instagram, label: "Instagram", href: "#", bg: "#E1306C" },
    { icon: Twitter, label: "Twitter / X", href: "#", bg: "#1DA1F2" },
    { icon: Youtube, label: "YouTube", href: "#", bg: "#FF0000" },
  ];
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row gap-6 items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient text-brand-foreground"><School className="h-4 w-4" /></span>
          © {new Date().getFullYear()} Mombasa Kiongozi Academy, Mombasa, Kenya.
        </div>
        <div className="flex items-center gap-2">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="grid h-9 w-9 place-items-center rounded-full text-white shadow-card transition hover:opacity-90 hover:-translate-y-0.5"
              style={{ backgroundColor: s.bg }}
            >
              <s.icon className="h-4 w-4" />
            </a>
          ))}
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
