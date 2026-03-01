import Link from "next/link";
import {
  Shield,
  Layers,
  Star,
  Globe,
  Zap,
  GitMerge,
  ArrowRight,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
} from "lucide-react";

const STATS = [
  { icon: DollarSign, value: "$500K+", label: "Jobs Completed" },
  { icon: Users, value: "5,000+", label: "Freelancers" },
  { icon: TrendingUp, value: "0%", label: "Platform Fee" },
  { icon: Briefcase, value: "1,200+", label: "Jobs Posted" },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Escrow Payments",
    description:
      "Funds are locked in a Solana smart contract before work begins. No more payment disputes or fraud.",
    color: "text-purple-400",
    bg: "bg-purple-600/10",
  },
  {
    icon: Layers,
    title: "Milestone Releases",
    description:
      "Break projects into milestones. Funds release automatically as each milestone is approved on-chain.",
    color: "text-blue-400",
    bg: "bg-blue-600/10",
  },
  {
    icon: Star,
    title: "On-Chain Reviews",
    description:
      "Immutable, tamper-proof reviews stored on Solana. Build a verifiable reputation that follows you.",
    color: "text-yellow-400",
    bg: "bg-yellow-600/10",
  },
  {
    icon: GitMerge,
    title: "Dispute Resolution",
    description:
      "Decentralized arbitration via DAO voting. Fair outcomes for both clients and freelancers.",
    color: "text-red-400",
    bg: "bg-red-600/10",
  },
  {
    icon: Globe,
    title: "Global Access",
    description:
      "Work with anyone, anywhere. No bank account required — just a Solana wallet to get started.",
    color: "text-emerald-400",
    bg: "bg-emerald-600/10",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description:
      "Solana's 400ms block times mean payments settle in seconds, not days. Get paid faster.",
    color: "text-cyan-400",
    bg: "bg-cyan-600/10",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Post or Find a Job",
    description: "Clients post jobs with detailed milestones. Freelancers browse and submit proposals.",
  },
  {
    step: "02",
    title: "Fund Escrow",
    description: "Client deposits project funds into a secure Solana smart contract escrow.",
  },
  {
    step: "03",
    title: "Deliver & Get Paid",
    description: "Complete milestones, client approves, funds release instantly — no middleman.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center grid-bg">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-purple-700/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-blue-700/20 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-700/50 bg-purple-900/30 px-4 py-1.5 text-sm text-purple-300 mb-8 animate-fade-in">
            <Zap className="h-3.5 w-3.5" />
            Built on Solana · Sub-second finality
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-6 animate-slide-up leading-[1.05]">
            Work Without{" "}
            <span className="gradient-text">Middlemen</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-400 mb-10 animate-slide-up leading-relaxed">
            The first decentralized freelance marketplace on Solana. Zero fees, trustless
            payments, global talent.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link
              href="/jobs"
              className="group flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-purple-700 transition-all hover:shadow-lg hover:shadow-purple-900/40 hover:-translate-y-0.5"
            >
              Find Work
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl border border-purple-700/50 bg-purple-900/20 px-8 py-3.5 text-base font-semibold text-purple-300 hover:bg-purple-900/40 transition-all hover:-translate-y-0.5"
            >
              Post a Job
            </Link>
          </div>

          {/* Trust indicators */}
          <p className="mt-8 text-xs text-gray-600 animate-fade-in">
            No sign-up required · Connect your Solana wallet to get started
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-purple-900/30 bg-[#12091f]">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon className="h-6 w-6 text-purple-400" />
                </div>
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose <span className="gradient-text">SolGig</span>?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A new paradigm for freelance work — built on trustless infrastructure, owned by its
              community.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
              <div
                key={title}
                className="card-hover rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-6"
              >
                <div className={`h-11 w-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 bg-[#12091f]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Three simple steps to work without trust issues or payment delays.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <div key={step} className="relative text-center">
                <div className="text-6xl font-black text-purple-900/40 mb-3">{step}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl border border-purple-700/40 bg-gradient-to-br from-purple-900/40 to-blue-900/20 p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Join thousands of freelancers and clients already building the future of work on
              Solana.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/jobs"
                className="group flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-purple-700 transition-all hover:shadow-lg hover:shadow-purple-900/40"
              >
                Find Talent
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/jobs"
                className="flex items-center gap-2 rounded-xl border border-purple-700/50 px-8 py-3.5 text-base font-semibold text-purple-300 hover:bg-purple-900/20 transition-all"
              >
                Find Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-900/30 py-10 px-4">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-gradient">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-white">
              Sol<span className="text-purple-400">Gig</span>
            </span>
          </div>
          <p className="text-sm text-gray-600">
            © 2024 SolGig. Decentralized freelance on Solana.
          </p>
          <div className="flex gap-6">
            {["Jobs", "Dashboard", "Messages"].map((l) => (
              <Link
                key={l}
                href={`/${l.toLowerCase()}`}
                className="text-sm text-gray-500 hover:text-purple-400 transition-colors"
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
