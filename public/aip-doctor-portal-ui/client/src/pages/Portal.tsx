import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LayoutDashboard, Search, Building2, MapPin, User, FileEdit, Shield,
  Eye, GitBranch, Users, Megaphone, Crown, MessageSquare, CreditCard,
  Settings, Bell, LogOut, ChevronDown, ChevronRight, Moon, Sun,
  TrendingUp, TrendingDown, ArrowRight, Star, Plus, Send, Inbox,
  CheckCircle2, Clock, XCircle, Filter, Calendar, Award, Stethoscope,
  Phone, Globe, Mail, Lock, UserPlus, Building
} from "lucide-react";
import { toast } from "sonner";

// ─── Data ────────────────────────────────────────────────────────────────────
const DOCTOR = {
  name: "Dr. Sarah Johnson",
  shortName: "Dr. Johnson",
  initials: "SJ",
  title: "Dr. Sarah Johnson, MD, FACC",
  specialty: "Cardiology",
  subSpecialty: "Interventional Cardiology",
  practice: "St. Louis Heart Associates",
  npi: "1234567890",
  gender: "Female",
  languages: "English, Spanish",
  phone: "(314) 555-0192",
  email: "dr.johnson@stlheartassoc.com",
  website: "https://stlheartassociates.com",
  experience: 14,
  status: "Pending AIP Review",
  onboardingPct: 75,
};

const PHYSICIANS = [
  { id: 1, initials: "MC", name: "Dr. Michael Chen, MD", specialty: "Orthopedic Surgery", practice: "Barnes-Jewish Orthopedic Center", city: "St. Louis, MO", insurance: ["Aetna","BCBS","UHC"], badge: "Top Doctor 2024", accepting: true },
  { id: 2, initials: "SL", name: "Dr. Susan Lee, MD", specialty: "Cardiology", practice: "St. Luke's Heart Institute", city: "Chesterfield, MO", insurance: ["Cigna","UHC","Humana"], badge: "Top Doctor 2024", accepting: true },
  { id: 3, initials: "DP", name: "Dr. David Patel, MD", specialty: "Neurology", practice: "Mercy Neurology Clinic", city: "Creve Coeur, MO", insurance: ["Aetna","CBS","Anthem"], badge: "Top Doctor 2024", accepting: false },
  { id: 4, initials: "EW", name: "Dr. Emily White, MD", specialty: "Gastroenterology", practice: "Digestive Health Specialists", city: "St. Louis, MO", insurance: ["Aetna","BCBS","United"], badge: "Top Doctor 2024", accepting: true },
  { id: 5, initials: "JK", name: "Dr. James Kim, MD", specialty: "Dermatology", practice: "Midwest Dermatology", city: "Clayton, MO", insurance: ["Cigna","BCBS","UHC"], badge: null, accepting: true },
  { id: 6, initials: "LR", name: "Dr. Lisa Rodriguez, MD", specialty: "Endocrinology", practice: "SSM Health Endocrinology", city: "St. Louis, MO", insurance: ["Aetna","UHC","Humana"], badge: null, accepting: true },
];

const REFERRALS = [
  { id: 1, patient: "John D.", referredTo: "Dr. Michael Chen", specialty: "Orthopedics", status: "Accepted", date: "Feb 20", type: "sent" },
  { id: 2, patient: "Mary S.", referredTo: "Dr. Robert Kim", specialty: "Neurology", status: "Sent", date: "Feb 18", type: "sent" },
  { id: 3, patient: "Tom W.", referredTo: "Dr. Lisa Park", specialty: "Gastroenterology", status: "Completed", date: "Feb 15", type: "sent" },
  { id: 4, patient: "Anna R.", referredTo: "Dr. James Liu", specialty: "Endocrinology", status: "Pending", date: "Feb 12", type: "received" },
  { id: 5, patient: "Robert K.", referredFrom: "Dr. Emily White", specialty: "Cardiology", status: "Accepted", date: "Feb 10", type: "received" },
];

const ANNOUNCEMENTS = [
  { id: 1, title: "AIP Annual Gala — March 15, 2026", date: "Feb 20, 2026", excerpt: "Join us for the annual celebration of independent medicine at the Chase Park Plaza, St. Louis. Black tie optional. Dinner, awards ceremony, and keynote by Dr. James Harrison.", hasAction: true, action: "Register Now" },
  { id: 2, title: "New Membership Benefits for 2026", date: "Feb 17, 2026", excerpt: "Group purchasing discounts on malpractice insurance now available to all Premium and Professional members. Savings of up to 18% compared to individual market rates." },
  { id: 3, title: "Board Meeting Minutes — February", date: "Feb 15, 2026", excerpt: "Minutes from the February board meeting are now available for member review in the Documents section." },
];

const EVENTS = [
  { icon: "🏛️", title: "Board Meeting", date: "March 5, 2026 · 6:00 PM", location: "AIP Office" },
  { icon: "💻", title: "Webinar: EHR Optimization Tips", date: "March 8, 2026 · 12:00 PM", location: "Virtual" },
  { icon: "🎉", title: "Annual Gala", date: "March 15, 2026 · 7:00 PM", location: "Chase Park Plaza" },
  { icon: "📋", title: "Membership Committee Meeting", date: "March 20, 2026 · 5:30 PM", location: "Virtual" },
];

const FORUM_POSTS = [
  { id: 1, author: "Dr. Michael Chen", initials: "MC", specialty: "Orthopedics", title: "Best practices for EHR documentation in orthopedic surgery", replies: 12, views: 89, time: "2h ago", tags: ["EHR", "Documentation"] },
  { id: 2, author: "Dr. Susan Lee", initials: "SL", specialty: "Cardiology", title: "Thoughts on the new ACC/AHA hypertension guidelines?", replies: 24, views: 156, time: "5h ago", tags: ["Cardiology", "Guidelines"] },
  { id: 3, author: "Dr. James Kim", initials: "JK", specialty: "Dermatology", title: "Referral protocol for complex melanoma cases", replies: 8, views: 67, time: "1d ago", tags: ["Referrals", "Oncology"] },
];

const BOARD = [
  { initials: "JH", name: "Dr. James Harrison, MD", role: "Board President", specialty: "Internal Medicine" },
  { initials: "MP", name: "Dr. Maria Perez, MD", role: "Vice President", specialty: "Family Medicine" },
  { initials: "TN", name: "Dr. Thomas Nguyen, MD", role: "Treasurer", specialty: "Orthopedic Surgery" },
  { initials: "DL", name: "Dr. Diana Lee, MD", role: "Secretary", specialty: "Pediatrics" },
];

const COMMITTEES = [
  { name: "Membership Committee", chair: "Dr. Maria Perez", members: 5, focus: "Reviewing and approving new member applications" },
  { name: "Finance Committee", chair: "Dr. Thomas Nguyen", members: 4, focus: "Overseeing budget, dues, and financial planning" },
  { name: "Advocacy Committee", chair: "Dr. David Patel", members: 6, focus: "Legislative advocacy and policy representation" },
  { name: "Education Committee", chair: "Dr. Susan Lee", members: 5, focus: "CME programs, webinars, and member education" },
];

const MESSAGES = [
  { id: 1, from: "Dr. Michael Chen", initials: "MC", subject: "Re: Referral for John D.", preview: "Thank you for the referral. I've scheduled the patient for next Tuesday...", time: "10:32 AM", unread: true },
  { id: 2, from: "AIP Administration", initials: "AI", subject: "Profile Review Update", preview: "Your profile is currently under review. We will notify you once...", time: "Yesterday", unread: true },
  { id: 3, from: "Dr. Emily White", initials: "EW", subject: "Cardiology Consult Request", preview: "I have a patient with complex cardiac history who would benefit from...", time: "Feb 21", unread: false },
];

const CONDITIONS = [
  { condition: "Coronary Artery Disease", treatments: ["Angioplasty", "Stent Placement", "Medication Management"] },
  { condition: "Hypertension", treatments: ["Medication Management", "Lifestyle Counseling", "Cardiac Monitoring"] },
  { condition: "Heart Failure", treatments: ["Cardiac Rehabilitation", "Medication Management", "Device Therapy"] },
  { condition: "Atrial Fibrillation", treatments: ["Cardioversion", "Ablation", "Anticoagulation Therapy"] },
];

// ─── Nav Config ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "find-physician", label: "Find a Physician", icon: Search },
  {
    id: "my-practice", label: "My Practice", icon: Building2,
    children: [
      { id: "practice-profile", label: "View Practice Profile", icon: Building },
      { id: "practice-locations", label: "View Locations", icon: MapPin },
    ]
  },
  {
    id: "my-profile", label: "My Profile", icon: User,
    children: [
      { id: "edit-profile", label: "Edit Profile", icon: FileEdit },
      { id: "services-insurance", label: "Services & Insurance", icon: Shield },
      { id: "public-profile", label: "View Public Profile", icon: Eye },
    ]
  },
  { id: "referrals", label: "Referrals", icon: GitBranch },
  {
    id: "community", label: "Community & News", icon: Users,
    children: [
      { id: "forum", label: "Community Forum", icon: MessageSquare },
      { id: "announcements", label: "Announcements & Events", icon: Megaphone },
      { id: "leadership", label: "Leadership & Committees", icon: Crown },
    ]
  },
  { id: "messages", label: "Messages", icon: MessageSquare, badge: 3 },
  { id: "membership", label: "Membership & Billing", icon: CreditCard },
  { id: "settings", label: "Account Settings", icon: Settings },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Avatar({ initials, size = "md", color = "teal" }: { initials: string; size?: "sm" | "md" | "lg"; color?: string }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-16 h-16 text-xl" };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: "linear-gradient(135deg, #1A8C7A, #1B3A6B)" }}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Accepted": "badge-accepted", "Sent": "badge-sent", "Pending": "badge-pending",
    "Completed": "badge-completed", "Live": "badge-live", "Pending AIP Review": "badge-review",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || "badge-pending"}`}>
      {status}
    </span>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 relative z-10">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
    </div>
  );
}

// ─── Pages ───────────────────────────────────────────────────────────────────
function DashboardPage({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="space-y-6 relative z-10">
      {/* Welcome */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Good Morning, {DOCTOR.shortName} 👋</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            &nbsp;·&nbsp;{DOCTOR.specialty}&nbsp;·&nbsp;{DOCTOR.practice}
          </p>
        </div>
        <StatusBadge status={DOCTOR.status} />
      </div>

      {/* Onboarding Progress */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Onboarding Progress</p>
            <h2 className="text-lg font-bold text-foreground mt-0.5">Complete Your Profile</h2>
          </div>
          <span className="text-2xl font-black" style={{ color: "var(--aip-gold)" }}>{DOCTOR.onboardingPct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted mb-4">
          <div className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${DOCTOR.onboardingPct}%`, background: "linear-gradient(90deg, #1A8C7A, #1B3A6B)" }} />
        </div>
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Basic Info", done: true },
              { label: "Credentials", done: true },
              { label: "Services & Insurance", done: true },
              { label: "Submit for Approval", done: false },
            ].map(step => (
              <span key={step.label} className="flex items-center gap-1.5 text-sm">
                {step.done
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  : <Clock className="w-4 h-4 text-amber-500" />}
                <span className={step.done ? "text-foreground" : "text-muted-foreground"}>{step.label}</span>
              </span>
            ))}
          </div>
          <button
            onClick={() => toast.success("Profile submitted for AIP review!")}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #1A8C7A, #1B3A6B)" }}>
            Submit for Approval →
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Send, label: "Referrals Sent", value: "12", sub: "+3 this month", trend: "up", color: "#1A8C7A" },
          { icon: Inbox, label: "Referrals Received", value: "8", sub: "+1 this week", trend: "up", color: "#1B3A6B" },
          { icon: Stethoscope, label: "AIP Network", value: "1,247", sub: "Physicians", trend: null, color: "#1A8C7A" },
          { icon: MessageSquare, label: "Unread Messages", value: "3", sub: "View Messages →", trend: null, color: "var(--aip-gold)", action: () => onNavigate("messages") },
        ].map(card => (
          <div key={card.label} className="glass-card p-4 cursor-pointer" onClick={card.action}>
            <div className="flex items-center gap-2 mb-3">
              <card.icon className="w-4 h-4" style={{ color: card.color }} />
              <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
            </div>
            <div className="text-3xl font-black text-foreground">{card.value}</div>
            <div className="flex items-center gap-1 mt-1">
              {card.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
              <span className="text-xs text-muted-foreground">{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent Referrals */}
        <div className="glass-card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Recent Referrals</h3>
            <button onClick={() => onNavigate("referrals")} className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--aip-teal)" }}>
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Patient", "Referred To", "Specialty", "Status", "Date"].map(h => (
                    <th key={h} className="text-left py-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REFERRALS.slice(0, 4).map(r => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-2.5 px-2 font-medium text-foreground">{r.patient}</td>
                    <td className="py-2.5 px-2 text-muted-foreground">{r.referredTo}</td>
                    <td className="py-2.5 px-2 text-muted-foreground">{r.specialty}</td>
                    <td className="py-2.5 px-2"><StatusBadge status={r.status} /></td>
                    <td className="py-2.5 px-2 text-muted-foreground">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Announcements */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Latest Announcements</h3>
            <button onClick={() => onNavigate("announcements")} className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--aip-teal)" }}>
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {ANNOUNCEMENTS.map(a => (
              <div key={a.id} className="border-l-2 pl-3" style={{ borderColor: "var(--aip-teal)" }}>
                <p className="text-sm font-semibold text-foreground leading-tight">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.date}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.excerpt}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Upcoming Events</p>
            <div className="flex flex-wrap gap-2">
              {EVENTS.slice(0, 3).map(e => (
                <span key={e.title} className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground">{e.icon} {e.title.split(":")[0]}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FindPhysicianPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [accepting, setAccepting] = useState(false);
  const [contacts, setContacts] = useState<number[]>([]);

  const filtered = PHYSICIANS.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specialty === "all" || p.specialty === specialty;
    const matchAccepting = !accepting || p.accepting;
    return matchSearch && matchSpec && matchAccepting;
  });

  return (
    <div className="space-y-6 relative z-10">
      <SectionHeader title="Find a Physician" subtitle="Search and connect with physicians across the AIP network" />
      <div className="glass-card p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, specialty, or condition..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <select value={specialty} onChange={e => setSpecialty(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="all">All Specialties</option>
            {["Cardiology","Orthopedic Surgery","Neurology","Gastroenterology","Dermatology","Endocrinology"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option>All Insurance Plans</option>
            <option>Aetna PPO</option><option>BCBS PPO</option><option>Cigna HMO</option><option>United Healthcare</option>
          </select>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <div onClick={() => setAccepting(!accepting)}
              className={`w-10 h-5 rounded-full transition-colors relative ${accepting ? "bg-[#1A8C7A]" : "bg-muted"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${accepting ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-muted-foreground">Accepting New Patients</span>
          </label>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="glass-card p-4 relative">
            {p.badge && (
              <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(184,151,58,0.15)", color: "var(--aip-gold)" }}>
                <Star className="w-3 h-3" /> {p.badge}
              </div>
            )}
            <div className="flex items-start gap-3 mb-3">
              <Avatar initials={p.initials} />
              <div className="min-w-0">
                <p className="font-bold text-foreground text-sm leading-tight">{p.name}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "var(--aip-teal)" }}>{p.specialty}</p>
                <p className="text-xs text-muted-foreground">{p.practice}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {p.city}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {p.insurance.map(ins => (
                <span key={ins} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{ins}</span>
              ))}
              {!p.accepting && <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Not Accepting</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => toast.info(`Viewing ${p.name}'s profile`)}
                className="flex-1 py-1.5 rounded-lg border border-input text-xs font-medium text-foreground hover:bg-accent transition-colors">
                View Profile
              </button>
              <button
                onClick={() => {
                  setContacts(prev => prev.includes(p.id) ? prev.filter(c => c !== p.id) : [...prev, p.id]);
                  toast.success(contacts.includes(p.id) ? `Removed ${p.name} from contacts` : `Added ${p.name} to contacts`);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${contacts.includes(p.id) ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "border border-input text-muted-foreground hover:bg-accent"}`}>
                <UserPlus className="w-3 h-3" />
                {contacts.includes(p.id) ? "In Contacts" : "+ Add to Contacts"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {contacts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button onClick={() => toast.info("Opening My Contacts")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-semibold shadow-lg"
            style={{ background: "linear-gradient(135deg, #1A8C7A, #1B3A6B)" }}>
            <Users className="w-4 h-4" /> My Contacts ({contacts.length})
          </button>
        </div>
      )}
    </div>
  );
}

function EditProfilePage() {
  const [tab, setTab] = useState("basic");
  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "credentials", label: "Credentials & Licenses" },
    { id: "bio", label: "Biography & Awards" },
    { id: "status", label: "Status & Settings" },
  ];
  return (
    <div className="space-y-6 relative z-10">
      <SectionHeader title="Edit Profile" subtitle="Manage your professional information visible to patients and colleagues" />
      <div className="glass-card p-5">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-border">
          <div className="relative">
            <Avatar initials={DOCTOR.initials} size="lg" />
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shadow">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">{DOCTOR.title}</p>
            <p className="text-sm text-muted-foreground">{DOCTOR.specialty} · {DOCTOR.practice} · NPI: {DOCTOR.npi}</p>
            <StatusBadge status={DOCTOR.status} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t.id ? "border-[#1A8C7A] text-[#1A8C7A]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "basic" && (
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "First Name", value: "Sarah", type: "text" },
              { label: "Last Name", value: "Johnson", type: "text" },
              { label: "Credentials / Suffix", value: "MD, FACC", type: "text" },
              { label: "NPI Number", value: "1234567890", type: "text" },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{f.label}</label>
                <input defaultValue={f.value} type={f.type}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Primary Specialty</label>
              <select className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Cardiology</option><option>Internal Medicine</option><option>Orthopedic Surgery</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Secondary Specialty</label>
              <select className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Interventional Cardiology</option><option>Echocardiography</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Gender</label>
              <select className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Female</option><option>Male</option><option>Non-binary</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Languages Spoken</label>
              <input defaultValue="English, Spanish" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Phone Number</label>
              <input defaultValue="(314) 555-0192" type="tel" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Professional Email</label>
              <input defaultValue="dr.johnson@stlheartassoc.com" type="email" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Website</label>
              <input defaultValue="https://stlheartassociates.com" type="url" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Years of Experience</label>
              <input defaultValue="14" type="number" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
        )}

        {tab === "credentials" && (
          <div className="space-y-4">
            {[
              { label: "Medical School", value: "Washington University School of Medicine" },
              { label: "Residency", value: "Barnes-Jewish Hospital — Internal Medicine" },
              { label: "Fellowship", value: "Cleveland Clinic — Interventional Cardiology" },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{f.label}</label>
                <input defaultValue={f.value} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Board Certifications</label>
              <div className="flex flex-wrap gap-2">
                {["American Board of Internal Medicine", "American Board of Cardiovascular Disease", "FACC"].map(cert => (
                  <span key={cert} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-input bg-accent text-accent-foreground">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {cert}
                  </span>
                ))}
                <button onClick={() => toast.info("Add certification feature coming soon")}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-dashed border-input text-muted-foreground hover:bg-accent transition-colors">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">State Medical Licenses</label>
              <div className="glass-card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Missouri — License #MO2024-12345</p>
                    <p className="text-xs text-muted-foreground">Expires: Dec 31, 2026</p>
                  </div>
                  <StatusBadge status="Live" />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "bio" && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Professional Biography</label>
              <textarea rows={5} defaultValue="Dr. Sarah Johnson is a board-certified interventional cardiologist with over 14 years of experience treating complex cardiovascular conditions. She completed her fellowship at the Cleveland Clinic and has been recognized as a Top Doctor by Castle Connolly for three consecutive years."
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Awards & Badges</label>
                <button onClick={() => toast.info("Add award feature coming soon")}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-dashed border-input text-muted-foreground hover:bg-accent transition-colors">
                  <Plus className="w-3 h-3" /> Add Award
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Top Doctor — Cardiology", body: "Castle Connolly", year: "2024" },
                  { title: "Best Doctors in America", body: "Best Doctors Inc.", year: "2023" },
                ].map(award => (
                  <div key={award.title} className="flex items-center gap-3 p-3 rounded-lg border border-input bg-accent/30">
                    <Award className="w-8 h-8 flex-shrink-0" style={{ color: "var(--aip-gold)" }} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{award.title}</p>
                      <p className="text-xs text-muted-foreground">{award.body} · {award.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "status" && (
          <div className="space-y-5">
            {[
              { label: "Accepting New Patients", desc: "Show that you are currently accepting new patients on your public profile", enabled: true },
              { label: "Telehealth Available", desc: "Indicate that you offer virtual/telehealth appointments", enabled: true },
              { label: "Profile Visible to Public", desc: "Control whether your profile appears in the public physician directory", enabled: false },
            ].map(s => (
              <div key={s.label} className="flex items-start justify-between gap-4 p-4 rounded-lg border border-input">
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
                <div onClick={() => toast.info(`Toggled ${s.label}`)}
                  className={`w-11 h-6 rounded-full flex-shrink-0 transition-colors relative cursor-pointer ${s.enabled ? "bg-[#1A8C7A]" : "bg-muted"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${s.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-border">
          <button className="px-4 py-2 rounded-lg border border-input text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
            Discard Changes
          </button>
          <button onClick={() => toast.success("Profile saved successfully!")}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #1A8C7A, #1B3A6B)" }}>
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ServicesInsurancePage() {
  return (
    <div className="space-y-6 relative z-10">
      <SectionHeader title="Services & Insurance" subtitle="Manage your conditions treated, procedures offered, and accepted insurance plans" />
      <div className="glass-card p-5">
        <h3 className="font-bold text-foreground mb-4">Conditions Treated & Procedures Offered</h3>
        <p className="text-sm text-muted-foreground mb-4">Select conditions you treat. For each condition, choose the specific procedures and treatments you offer.</p>
        <div className="space-y-4">
          {CONDITIONS.map(c => (
            <div key={c.condition} className="border border-input rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 p-3 bg-accent/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="font-semibold text-sm text-foreground">{c.condition}</span>
              </div>
              <div className="p-3 flex flex-wrap gap-2">
                {c.treatments.map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-input bg-accent text-accent-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {t}
                  </span>
                ))}
                <button onClick={() => toast.info("Suggest a new treatment")}
                  className="text-xs px-3 py-1.5 rounded-full border border-dashed border-input text-muted-foreground hover:bg-accent transition-colors">
                  + Suggest Treatment
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => toast.info("Add condition feature coming soon")}
            className="w-full py-3 rounded-lg border border-dashed border-input text-sm text-muted-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Condition or Suggest New
          </button>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-bold text-foreground mb-4">Accepted Insurance Plans</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {["Aetna PPO", "BCBS PPO", "Cigna PPO", "United Healthcare", "Medicare", "Humana Gold Plus"].map(ins => (
            <span key={ins} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-input bg-accent text-accent-foreground">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {ins}
              <button onClick={() => toast.info(`Removed ${ins}`)} className="ml-1 text-muted-foreground hover:text-destructive">×</button>
            </span>
          ))}
          <button onClick={() => toast.info("Add insurance plan")}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border border-dashed border-input text-muted-foreground hover:bg-accent transition-colors">
            <Plus className="w-3 h-3" /> Add Plan
          </button>
        </div>
      </div>
    </div>
  );
}

function ReferralsPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? REFERRALS : REFERRALS.filter(r => r.type === filter || (filter === "pending" && r.status === "Pending"));
  return (
    <div className="space-y-6 relative z-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <SectionHeader title="Referrals" subtitle="Manage all incoming and outgoing patient referrals" />
        <button onClick={() => toast.info("New referral form coming soon")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #1A8C7A, #1B3A6B)" }}>
          <Plus className="w-4 h-4" /> New Referral
        </button>
      </div>
      <div className="glass-card p-5">
        <div className="flex gap-2 mb-5">
          {["all", "sent", "received", "pending"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? "text-white" : "text-muted-foreground hover:bg-accent"}`}
              style={filter === f ? { background: "linear-gradient(135deg, #1A8C7A, #1B3A6B)" } : {}}>
              {f}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Patient", "Physician", "Specialty", "Type", "Status", "Date", ""].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-3 font-medium text-foreground">{r.patient}</td>
                  <td className="py-3 px-3 text-muted-foreground">{r.referredTo || r.referredFrom}</td>
                  <td className="py-3 px-3 text-muted-foreground">{r.specialty}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.type === "sent" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="py-3 px-3"><StatusBadge status={r.status} /></td>
                  <td className="py-3 px-3 text-muted-foreground">{r.date}</td>
                  <td className="py-3 px-3">
                    <button onClick={() => toast.info("View referral details")} className="text-xs text-primary hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ForumPage() {
  return (
    <div className="space-y-6 relative z-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <SectionHeader title="Community Forum" subtitle="Connect, discuss, and share knowledge with your AIP colleagues" />
        <button onClick={() => toast.info("New post feature coming soon")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #1A8C7A, #1B3A6B)" }}>
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>
      <div className="space-y-3">
        {FORUM_POSTS.map(post => (
          <div key={post.id} className="glass-card p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast.info("Opening post")}>
            <div className="flex items-start gap-3">
              <Avatar initials={post.initials} size="sm" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm leading-tight">{post.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{post.author} · {post.specialty} · {post.time}</p>
                <div className="flex items-center gap-3 mt-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground">{tag}</span>
                  ))}
                  <span className="text-xs text-muted-foreground ml-auto">{post.replies} replies · {post.views} views</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnouncementsPage() {
  return (
    <div className="space-y-6 relative z-10">
      <SectionHeader title="Announcements & Events" subtitle="Official news and upcoming events from AIP Administration" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {ANNOUNCEMENTS.map(a => (
            <div key={a.id} className="glass-card p-5">
              <h3 className="font-bold text-foreground mb-1">{a.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">Posted {a.date} · by AIP Administration</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.excerpt}</p>
              {a.hasAction && (
                <button onClick={() => toast.success("Registration feature coming soon")}
                  className="mt-3 px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #1A8C7A, #1B3A6B)" }}>
                  {a.action}
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="glass-card p-5 h-fit">
          <h3 className="font-bold text-foreground mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            {EVENTS.map(e => (
              <div key={e.title} className="flex gap-3">
                <span className="text-2xl">{e.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.date}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadershipPage() {
  return (
    <div className="space-y-6 relative z-10">
      <SectionHeader title="Leadership & Committees" subtitle="Meet the physician leaders who govern the Alliance" />
      <div className="glass-card p-5">
        <h3 className="font-bold text-foreground mb-4">Board of Directors</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BOARD.map(b => (
            <div key={b.name} className="text-center p-4 rounded-lg border border-input bg-accent/20">
              <Avatar initials={b.initials} size="lg" />
              <p className="font-bold text-foreground text-sm mt-3">{b.name}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--aip-teal)" }}>{b.role}</p>
              <p className="text-xs text-muted-foreground">{b.specialty}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card p-5">
        <h3 className="font-bold text-foreground mb-4">Committees</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Committee", "Chair", "Members", "Focus"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMMITTEES.map(c => (
                <tr key={c.name} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-3 font-semibold text-foreground">{c.name}</td>
                  <td className="py-3 px-3 text-muted-foreground">{c.chair}</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">{c.members}</td>
                  <td className="py-3 px-3 text-muted-foreground">{c.focus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MessagesPage() {
  const [selected, setSelected] = useState<number | null>(1);
  const msg = MESSAGES.find(m => m.id === selected);
  return (
    <div className="space-y-4 relative z-10">
      <SectionHeader title="Messages" subtitle="Secure direct messaging with AIP colleagues and administration" />
      <div className="grid lg:grid-cols-3 gap-4" style={{ height: "calc(100vh - 220px)", minHeight: 400 }}>
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border">
            <input placeholder="Search messages..." className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {MESSAGES.map(m => (
              <div key={m.id} onClick={() => setSelected(m.id)}
                className={`flex items-start gap-3 p-3 cursor-pointer border-b border-border/50 transition-colors ${selected === m.id ? "bg-accent" : "hover:bg-accent/50"}`}>
                <Avatar initials={m.initials} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${m.unread ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>{m.from}</p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{m.time}</span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${m.unread ? "text-foreground" : "text-muted-foreground"}`}>{m.subject}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.preview}</p>
                </div>
                {m.unread && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: "var(--aip-teal)" }} />}
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card lg:col-span-2 flex flex-col overflow-hidden">
          {msg ? (
            <>
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-foreground">{msg.subject}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">From: {msg.from} · {msg.time}</p>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <p className="text-sm text-muted-foreground leading-relaxed">{msg.preview} This is a preview of the message content. The full message would be displayed here in the actual implementation.</p>
              </div>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input placeholder="Type your reply..." className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <button onClick={() => toast.success("Reply sent!")}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2"
                    style={{ background: "linear-gradient(135deg, #1A8C7A, #1B3A6B)" }}>
                    <Send className="w-3 h-3" /> Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a message to read</div>
          )}
        </div>
      </div>
    </div>
  );
}

function MembershipPage() {
  return (
    <div className="space-y-6 relative z-10">
      <SectionHeader title="Membership & Billing" subtitle="Manage your practice's AIP membership and billing" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="font-bold text-foreground mb-4">Current Plan</h3>
          <div className="p-4 rounded-xl mb-4" style={{ background: "linear-gradient(135deg, rgba(27,58,107,0.15), rgba(26,140,122,0.1))", border: "1px solid rgba(26,140,122,0.3)" }}>
            <p className="text-xl font-black text-foreground">Premium Plan</p>
            <p className="text-sm text-muted-foreground mt-1">5 physician seats · $499/physician/year</p>
            <p className="text-2xl font-black mt-2" style={{ color: "var(--aip-gold)" }}>$2,495 / year</p>
            <p className="text-xs text-muted-foreground mt-1">Next renewal: January 1, 2027</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => toast.info("Invoice download coming soon")}
              className="flex-1 py-2 rounded-lg border border-input text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
              View Invoices
            </button>
            <button onClick={() => toast.info("Add physician seat feature coming soon")}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #1A8C7A, #1B3A6B)" }}>
              Add Physician Seat
            </button>
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="font-bold text-foreground mb-4">Plan Features</h3>
          <div className="space-y-2">
            {[
              "Public directory listing for all physicians",
              "Unlimited referrals",
              "Community forum access",
              "Group purchasing discounts",
              "Priority AIP support",
              "CME event discounts",
              "AIP advocacy representation",
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PracticeProfilePage() {
  return (
    <div className="space-y-6 relative z-10">
      <SectionHeader title="Practice Profile" subtitle="View your practice's information on the AIP network" />
      <div className="glass-card p-5 max-w-2xl">
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-black"
            style={{ background: "linear-gradient(135deg, #1A8C7A, #1B3A6B)" }}>SL</div>
          <div>
            <h2 className="text-xl font-bold text-foreground">St. Louis Heart Associates</h2>
            <p className="text-sm text-muted-foreground">Cardiology · Interventional Cardiology</p>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 badge-live">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Member
            </span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            { icon: Phone, label: "Phone", value: "(314) 555-0100" },
            { icon: Globe, label: "Website", value: "stlheartassociates.com" },
            { icon: Mail, label: "Email", value: "info@stlheartassoc.com" },
            { icon: Users, label: "Physicians", value: "5 members" },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3">
              <f.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{f.label}</p>
                <p className="font-medium text-foreground">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PracticeLocationsPage() {
  return (
    <div className="space-y-6 relative z-10">
      <SectionHeader title="Practice Locations" subtitle="All office locations associated with your practice" />
      {[
        { name: "Main Office", address: "1234 Medical Plaza Dr, Suite 300", city: "St. Louis, MO 63110", phone: "(314) 555-0100", hours: "Mon–Fri: 8:00 AM – 5:00 PM", primary: true },
        { name: "West County Office", address: "5678 Chesterfield Pkwy, Suite 100", city: "Chesterfield, MO 63017", phone: "(314) 555-0200", hours: "Mon, Wed, Fri: 9:00 AM – 3:00 PM", primary: false },
      ].map(loc => (
        <div key={loc.name} className="glass-card p-5 max-w-2xl">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-foreground">{loc.name}</h3>
              {loc.primary && <span className="text-xs px-2 py-0.5 rounded-full badge-live">Primary Location</span>}
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {loc.address}, {loc.city}</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {loc.phone}</p>
            <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {loc.hours}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PublicProfilePage() {
  return (
    <div className="space-y-6 relative z-10">
      <SectionHeader title="View Public Profile" subtitle="Preview how your profile appears to patients and the public" />
      <div className="glass-card p-6 max-w-2xl">
        <div className="flex items-start gap-4 mb-5 pb-5 border-b border-border">
          <Avatar initials={DOCTOR.initials} size="lg" />
          <div>
            <h2 className="text-xl font-bold text-foreground">{DOCTOR.title}</h2>
            <p className="font-semibold mt-1" style={{ color: "var(--aip-teal)" }}>{DOCTOR.specialty} · {DOCTOR.subSpecialty}</p>
            <p className="text-sm text-muted-foreground">{DOCTOR.practice} · St. Louis, MO</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="badge-live text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Accepting New Patients
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">💻 Telehealth Available</span>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">About</p>
          <p className="text-sm text-muted-foreground leading-relaxed">Dr. Sarah Johnson is a board-certified interventional cardiologist with over 14 years of experience treating complex cardiovascular conditions...</p>
        </div>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Awards & Recognition</p>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(184,151,58,0.15)", color: "var(--aip-gold)" }}>
              <Star className="w-3 h-3" /> Top Doctor 2024
            </span>
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(184,151,58,0.15)", color: "var(--aip-gold)" }}>
              <Award className="w-3 h-3" /> Best Doctors 2023
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Accepted Insurance</p>
          <div className="flex flex-wrap gap-2">
            {["Aetna PPO", "BCBS PPO", "Cigna PPO", "UHC", "Medicare", "Humana Gold"].map(ins => (
              <span key={ins} className="text-xs px-2.5 py-1 rounded bg-muted text-muted-foreground">{ins}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-6 relative z-10">
      <SectionHeader title="Account Settings" subtitle="Manage your login credentials and notification preferences" />
      <div className="glass-card p-5 max-w-lg">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Lock className="w-4 h-4" /> Login & Security</h3>
        <div className="space-y-4">
          {[
            { label: "Email Address", value: "dr.johnson@stlheartassoc.com", type: "email" },
            { label: "Current Password", value: "", type: "password", placeholder: "Enter current password" },
            { label: "New Password", value: "", type: "password", placeholder: "Enter new password" },
            { label: "Confirm New Password", value: "", type: "password", placeholder: "Confirm new password" },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{f.label}</label>
              <input defaultValue={f.value} type={f.type} placeholder={f.placeholder}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          ))}
          <button onClick={() => toast.success("Password updated successfully!")}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #1A8C7A, #1B3A6B)" }}>
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Portal Component ────────────────────────────────────────────────────
export default function Portal() {
  const { theme, toggleTheme } = useTheme();
  const [activePage, setActivePage] = useState("dashboard");
  const [expanded, setExpanded] = useState<string[]>(["my-practice", "my-profile", "community"]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const navigate = (id: string) => {
    setActivePage(id);
    // Auto-expand parent
    const parent = NAV_ITEMS.find(n => n.children?.some(c => c.id === id));
    if (parent && !expanded.includes(parent.id)) {
      setExpanded(prev => [...prev, parent.id]);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage onNavigate={navigate} />;
      case "find-physician": return <FindPhysicianPage />;
      case "practice-profile": return <PracticeProfilePage />;
      case "practice-locations": return <PracticeLocationsPage />;
      case "edit-profile": return <EditProfilePage />;
      case "services-insurance": return <ServicesInsurancePage />;
      case "public-profile": return <PublicProfilePage />;
      case "referrals": return <ReferralsPage />;
      case "forum": return <ForumPage />;
      case "announcements": return <AnnouncementsPage />;
      case "leadership": return <LeadershipPage />;
      case "messages": return <MessagesPage />;
      case "membership": return <MembershipPage />;
      case "settings": return <SettingsPage />;
      default: return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background page-glow">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-sidebar-border overflow-y-auto"
        style={{ background: "var(--sidebar)" }}>
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1A8C7A, #1B3A6B)" }}>AIP</div>
            <div>
              <p className="text-xs font-bold text-sidebar-foreground leading-tight">Alliance of Independent</p>
              <p className="text-xs font-bold leading-tight" style={{ color: "var(--aip-teal)" }}>Physicians</p>
              <p className="text-xs text-muted-foreground" style={{ color: "var(--aip-gold)", fontSize: "0.65rem" }}>ST. LOUIS</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <div key={item.id}>
              <button
                onClick={() => item.children ? toggleExpand(item.id) : navigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group ${activePage === item.id ? "font-semibold" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}
                style={activePage === item.id ? { background: "rgba(26,140,122,0.15)", color: "var(--aip-teal)", fontWeight: 600 } : {}}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                    style={{ background: "var(--aip-teal)" }}>{item.badge}</span>
                )}
                {item.children && (
                  expanded.includes(item.id)
                    ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
              {item.children && expanded.includes(item.id) && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                  {item.children.map(child => (
                    <button key={child.id} onClick={() => navigate(child.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${activePage === child.id ? "font-semibold" : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}
                      style={activePage === child.id ? { color: "var(--aip-teal)", fontWeight: 600 } : {}}>
                      <child.icon className="w-3.5 h-3.5 flex-shrink-0" />
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <Avatar initials={DOCTOR.initials} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-sidebar-foreground truncate">{DOCTOR.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--aip-teal)" }}>{DOCTOR.specialty}</p>
            </div>
            <button onClick={() => toast.info("Sign out feature coming soon")} className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex-shrink-0 flex items-center justify-end gap-3 px-6 border-b border-border bg-background/80 backdrop-blur-sm">
          {/* Theme Toggle */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sun className="w-3.5 h-3.5" />
            <button onClick={toggleTheme}
              className={`w-10 h-5 rounded-full transition-colors relative ${theme === "dark" ? "bg-[#1A8C7A]" : "bg-muted"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${theme === "dark" ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <Moon className="w-3.5 h-3.5" />
          </div>
          <button onClick={() => navigate("messages")} className="relative p-2 rounded-lg hover:bg-accent transition-colors">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "var(--aip-teal)" }} />
          </button>
          <button onClick={() => navigate("settings")} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors">
            <Avatar initials={DOCTOR.initials} size="sm" />
            <span className="text-sm font-medium text-foreground hidden sm:block">{DOCTOR.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
