import Head from "next/head";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Download, Wand2, Mail, Sparkles, Lock, Plus, CheckCircle, Star, Trash2, Link as LinkIcon,
} from "lucide-react";

/* ---------------- Types ---------------- */
type Experience = {
  id: string; title: string; company: string; location?: string;
  start: string; end: string; bullets: string[];
};
type Education = {
  id: string; degree: string; school: string; year: string; details?: string;
};
type LinkItem = { label: string; url: string };
type Resume = {
  name: string; role: string; email: string; phone: string; location: string;
  links: LinkItem[]; summary: string; skills: string[];
  experience: Experience[]; education: Education[];
};

const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------------- Seed ---------------- */
const defaultResume: Resume = {
  name: "Your Name",
  role: "Operations & E-commerce Manager",
  email: "you@example.com",
  phone: "+91 90000 00000",
  location: "Gurugram, IN",
  links: [
    { label: "LinkedIn", url: "https://linkedin.com/in/username" },
    { label: "Portfolio", url: "https://your-portfolio.com" },
  ],
  summary:
    "Data-driven operator with 5+ years in D2C/e-commerce. Built automated reconciliation, optimized courier SLAs, and improved net margins by 12%.",
  skills: [
    "Excel / Power Query",
    "Python / Pandas",
    "Amazon / Flipkart Ops",
    "Inventory & SKU Mapping",
    "Razorpay / Payments",
  ],
  experience: [
    {
      id: uid(),
      title: "Senior Operations Manager",
      company: "Home Essentials Pvt. Ltd.",
      location: "Gurugram",
      start: "Jan 2022",
      end: "Present",
      bullets: [
        "Automated courier status reconciliation; reduced RTO mismatch by 31%",
        "Scaled order processing to 2k+/day via Unicommerce & custom scripts",
        "Negotiated freight, saving ₹9L/yr; improved OTIF by 8%",
      ],
    },
    {
      id: uid(),
      title: "Ops Analyst",
      company: "Nimbus Logistics",
      location: "Bengaluru",
      start: "Aug 2019",
      end: "Dec 2021",
      bullets: [
        "Built SKU master & ATS variance tracker; cut stockouts 22%",
        "Led migration to e-invoicing; ensured 100% compliance",
      ],
    },
  ],
  education: [
    { id: uid(), degree: "B.Com (H)", school: "Delhi University", year: "2019", details: "Finance" },
  ],
};

/* ---------------- Skill Library (suggestions) ---------------- */
const SKILL_LIBRARY: string[] = [
  // Tech / Data
  "Excel", "Excel / Power Query", "Power BI", "Tableau",
  "SQL", "MySQL", "PostgreSQL", "Python", "Pandas", "NumPy",
  "Google Sheets", "Looker Studio", "ETL", "Data Cleaning", "A/B Testing",
  // E-commerce / Ops
  "Amazon Seller Central", "Flipkart Seller Hub", "Myntra Partner Portal",
  "Marketplace Operations", "Inventory Planning", "SKU Mapping", "Order Fulfilment",
  "Unicommerce", "Shiprocket", "Delhivery", "DTDC", "Blue Dart",
  "Courier Reconciliation", "RTO Reduction", "SLA Management", "OTIF",
  // Business / Tools
  "Razorpay", "Cashfree", "Stripe", "Zoho Books", "Tally",
  "JIRA", "Asana", "Notion", "Confluence", "Slack",
  // Soft
  "Stakeholder Management", "Vendor Negotiation", "Process Design",
  "Documentation", "KPI Dashboards", "Presentation",
  // Dev-ish
  "JavaScript", "TypeScript", "HTML/CSS", "React", "Node.js",
];

/* ---------------- Templates List ---------------- */
const TEMPLATES = [
  { id: "minimal", name: "ATS Minimal", isPremium: false, badge: "Free" },
  { id: "sidebar", name: "Modern Sidebar", isPremium: true, badge: "Pro" },
  { id: "elegant", name: "Elegant Serif", isPremium: true, badge: "Pro" },
  { id: "slateShade", name: "Slate Shaded", isPremium: false, badge: "Free" },
  { id: "indigoHeader", name: "Indigo Header", isPremium: true, badge: "Pro" },
  { id: "cards", name: "Card Sections", isPremium: false, badge: "Free" },
  { id: "compactTwoCol", name: "Compact 2-Col", isPremium: true, badge: "Pro" },
] as const;
type TemplateId = typeof TEMPLATES[number]["id"];

/* ---------------- Small UI helpers ---------------- */
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p}
    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${p.className || ""}`}
  />
);
const TextArea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p}
    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${p.className || ""}`}
  />
);
const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{children}</span>
);

/* ---------------- Generators ---------------- */
function generateCoverLetter(resume: Resume, jobTitle = "", company = "", tone: "formal" | "friendly" = "formal") {
  const intro =
    tone === "formal"
      ? `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle || "role"} at ${company || "your organization"}. With experience in ${resume.role.toLowerCase()} and a track record of driving operational efficiency, I can add value from day one.`
      : `Hi there,\n\nI'm excited to apply for the ${jobTitle || "role"} at ${company || "your team"}. I'm a hands-on ${resume.role} who loves building automations and scaling ops.`;

  const body = `\n\nHighlights:\n• ${resume.experience[0]?.bullets[0] || "Delivered measurable results"}\n• ${resume.experience[0]?.bullets[1] || "Automated workflows to save time"}\n• ${resume.skills.slice(0, 3).join(", ")}\n\nWhy ${company || "this role"}:\n• Fast-moving environment and scope to own impact\n• Opportunity to apply data-driven problem solving`;

  const close =
    tone === "formal"
      ? `\n\nThank you for your time. I have attached my resume and would welcome the opportunity to discuss further.\n\nSincerely,\n${resume.name}`
      : `\n\nThanks for reading! Attaching my resume—would love to chat.\n\nBest,\n${resume.name}`;

  return `${intro}${body}${close}`;
}

function generateJobEmail(resume: Resume, jobTitle = "", company = "") {
  return `Subject: Application for ${jobTitle || "Open Role"} – ${resume.name}\n\nHi ${
    company ? company + " Team" : "Hiring Team"
  },\n\nSharing my resume for ${jobTitle || "the role"}. Quick snapshot: ${
    resume.summary
  }\n\nLinks: ${resume.links.map((l) => `${l.label}: ${l.url}`).join(" | ")}\n\nThanks,\n${
    resume.name
  }\n${resume.phone} | ${resume.email}`;
}

/* ---------------- Templates ---------------- */
// 1) ATS Minimal
function TemplateMinimal({ resume }: { resume: Resume }) {
  return (
    <div className="mx-auto max-w-[800px] bg-white p-8 text-[12.2px] leading-relaxed text-gray-900 print:p-0" style={{ width: 800 }}>
      <header className="border-b pb-2">
        <h1 className="text-3xl font-bold tracking-tight">{resume.name}</h1>
        <div className="mt-1 text-sm text-gray-700">{resume.role}</div>
        <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-gray-600">
          <span>{resume.email}</span><span>•</span><span>{resume.phone}</span><span>•</span><span>{resume.location}</span>
          {resume.links.map((l, i) => (<span key={i} className="flex items-center gap-1"><span>•</span><span className="underline">{l.label}</span></span>))}
        </div>
      </header>
      <section className="mt-4">
        <h2 className="mb-1 border-b text-[13px] font-semibold uppercase tracking-wide">Summary</h2>
        <p>{resume.summary}</p>
      </section>
      <section className="mt-4">
        <h2 className="mb-1 border-b text-[13px] font-semibold uppercase tracking-wide">Experience</h2>
        {resume.experience.map((exp) => (
          <div key={exp.id} className="mb-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-semibold">{exp.title} • {exp.company}</div>
              <div className="text-[12px] text-gray-600">{exp.start} – {exp.end}{exp.location ? ` • ${exp.location}` : ""}</div>
            </div>
            <ul className="ml-5 list-disc">{exp.bullets.map((b, i) => (<li key={i}>{b}</li>))}</ul>
          </div>
        ))}
      </section>
      <section className="mt-4 grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <h2 className="mb-1 border-b text-[13px] font-semibold uppercase tracking-wide">Education</h2>
          {resume.education.map((ed) => (
            <div key={ed.id} className="mb-2">
              <div className="font-semibold">{ed.degree} – {ed.school}</div>
              <div className="text-[12px] text-gray-600">{ed.year}</div>
              {ed.details && <div className="text-[12px]">{ed.details}</div>}
            </div>
          ))}
        </div>
        <div>
          <h2 className="mb-1 border-b text-[13px] font-semibold uppercase tracking-wide">Skills</h2>
          <div className="flex flex-wrap gap-1.5">{resume.skills.map((s, i) => (<Chip key={i}>{s}</Chip>))}</div>
        </div>
      </section>
    </div>
  );
}

// 2) Modern Sidebar (Pro)
function TemplateSidebar({ resume }: { resume: Resume }) {
  return (
    <div className="mx-auto grid max-w-[900px] grid-cols-3 bg-white text-[12.2px] text-gray-900" style={{ width: 900 }}>
      <aside className="col-span-1 bg-slate-50 p-6">
        <div className="text-2xl font-bold">{resume.name}</div>
        <div className="text-sm text-gray-700">{resume.role}</div>
        <div className="mt-4 space-y-1 text-[12px] text-gray-700">
          <div>{resume.email}</div><div>{resume.phone}</div><div>{resume.location}</div>
          {resume.links.map((l, i) => (<div key={i} className="underline">{l.label}</div>))}
        </div>
        <div className="mt-6">
          <div className="mb-1 border-b text-[13px] font-semibold uppercase tracking-wide">Skills</div>
          <div className="flex flex-wrap gap-1.5">{resume.skills.map((s, i) => (<Chip key={i}>{s}</Chip>))}</div>
        </div>
        <div className="mt-6">
          <div className="mb-1 border-b text-[13px] font-semibold uppercase tracking-wide">Education</div>
          {resume.education.map((ed) => (
            <div key={ed.id} className="mb-2">
              <div className="font-semibold">{ed.degree}</div>
              <div className="text-[12px]">{ed.school} • {ed.year}</div>
              {ed.details && <div className="text-[12px] text-gray-600">{ed.details}</div>}
            </div>
          ))}
        </div>
      </aside>
      <main className="col-span-2 p-8">
        <div className="mb-2 border-b text-[13px] font-semibold uppercase tracking-wide">Summary</div>
        <p className="mb-4 leading-relaxed">{resume.summary}</p>
        <div className="mb-2 border-b text-[13px] font-semibold uppercase tracking-wide">Experience</div>
        {resume.experience.map((exp) => (
          <div key={exp.id} className="mb-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-semibold">{exp.title} – {exp.company}</div>
              <div className="text-[12px] text-gray-600">{exp.start} – {exp.end}</div>
            </div>
            <ul className="ml-5 list-disc">{exp.bullets.map((b, i) => (<li key={i}>{b}</li>))}</ul>
          </div>
        ))}
      </main>
    </div>
  );
}

// 3) Elegant Serif (Pro)
function TemplateElegant({ resume }: { resume: Resume }) {
  return (
    <div className="mx-auto max-w-[820px] bg-white p-10 font-serif text-[12.5px] text-gray-900" style={{ width: 820 }}>
      <div className="border-b pb-3 text-center">
        <div className="text-4xl font-bold tracking-tight">{resume.name}</div>
        <div className="mt-1 text-sm italic text-gray-700">{resume.role}</div>
        <div className="mt-2 flex flex-wrap justify-center gap-3 text-[12px] text-gray-600">
          <span>{resume.email}</span><span>•</span><span>{resume.phone}</span><span>•</span><span>{resume.location}</span>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 text-[13px] font-semibold uppercase tracking-wide">Professional Summary</div>
        <p className="leading-relaxed">{resume.summary}</p>
      </div>
      <div className="mt-4">
        <div className="mb-1 text-[13px] font-semibold uppercase tracking-wide">Core Skills</div>
        <div className="flex flex-wrap gap-2">{resume.skills.map((s, i) => (<span key={i} className="rounded bg-slate-100 px-2 py-1">{s}</span>))}</div>
      </div>
      <div className="mt-4">
        <div className="mb-1 text-[13px] font-semibold uppercase tracking-wide">Experience</div>
        {resume.experience.map((exp) => (
          <div key={exp.id} className="mb-3">
            <div className="flex flex-wrap items-baseline justify-between">
              <div className="font-semibold">{exp.title}, {exp.company}</div>
              <div className="text-[12px] text-gray-600">{exp.start} – {exp.end}</div>
            </div>
            <ul className="ml-5 list-disc">{exp.bullets.map((b, i) => (<li key={i}>{b}</li>))}</ul>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="mb-1 text-[13px] font-semibold uppercase tracking-wide">Education</div>
        {resume.education.map((ed) => (
          <div key={ed.id} className="mb-2">
            <div className="font-semibold">{ed.degree} – {ed.school}</div>
            <div className="text-[12px] text-gray-600">{ed.year}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4) Slate Shaded (Free)
function TemplateSlateShaded({ resume }: { resume: Resume }) {
  return (
    <div className="mx-auto max-w-[820px] bg-white text-[12.2px] text-slate-900" style={{ width: 820 }}>
      <div className="bg-slate-100 px-8 py-6">
        <div className="text-3xl font-bold">{resume.name}</div>
        <div className="text-sm text-slate-700">{resume.role}</div>
        <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-slate-700">
          <span>{resume.email}</span><span>•</span><span>{resume.phone}</span><span>•</span><span>{resume.location}</span>
        </div>
      </div>
      <div className="px-8 py-6">
        <div className="mb-3 border-l-4 border-slate-300 pl-3 text-[13px] font-semibold uppercase tracking-wide">Summary</div>
        <p className="mb-4">{resume.summary}</p>
        <div className="mb-3 border-l-4 border-slate-300 pl-3 text-[13px] font-semibold uppercase tracking-wide">Experience</div>
        {resume.experience.map((exp) => (
          <div key={exp.id} className="mb-4">
            <div className="flex flex-wrap items-baseline justify-between">
              <div className="font-semibold">{exp.title} – {exp.company}</div>
              <div className="text-[12px] text-slate-600">{exp.start} – {exp.end}</div>
            </div>
            <ul className="ml-5 list-disc">{exp.bullets.map((b, i) => (<li key={i}>{b}</li>))}</ul>
          </div>
        ))}
        <div className="mb-3 border-l-4 border-slate-300 pl-3 text-[13px] font-semibold uppercase tracking-wide">Skills & Education</div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2"><div className="flex flex-wrap gap-1.5">{resume.skills.map((s, i) => (<Chip key={i}>{s}</Chip>))}</div></div>
          <div>{resume.education.map((ed) => (
            <div key={ed.id} className="mb-1">
              <div className="font-semibold">{ed.degree}</div>
              <div className="text-[12px] text-slate-600">{ed.school} • {ed.year}</div>
            </div>))}</div>
        </div>
      </div>
    </div>
  );
}

// 5) Indigo Header (Pro)
function TemplateIndigoHeader({ resume }: { resume: Resume }) {
  return (
    <div className="mx-auto max-w-[820px] overflow-hidden rounded-md bg-white text-[12.2px] text-gray-900" style={{ width: 820 }}>
      <div className="bg-indigo-600 px-8 py-6 text-white">
        <div className="text-3xl font-bold tracking-tight">{resume.name}</div>
        <div className="text-sm opacity-90">{resume.role}</div>
        <div className="mt-2 flex flex-wrap gap-3 text-[12px] opacity-90">
          <span>{resume.email}</span><span>•</span><span>{resume.phone}</span><span>•</span><span>{resume.location}</span>
        </div>
      </div>
      <div className="px-8 py-6">
        <div className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-indigo-700">Summary</div>
        <p className="mb-4">{resume.summary}</p>
        <div className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-indigo-700">Experience</div>
        {resume.experience.map((exp) => (
          <div key={exp.id} className="mb-3">
            <div className="flex flex-wrap items-baseline justify-between">
              <div className="font-semibold">{exp.title} – {exp.company}</div>
              <div className="text-[12px] text-gray-600">{exp.start} – {exp.end}</div>
            </div>
            <ul className="ml-5 list-disc">{exp.bullets.map((b, i) => (<li key={i}>{b}</li>))}</ul>
          </div>
        ))}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <div className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-indigo-700">Education</div>
            {resume.education.map((ed) => (
              <div key={ed.id} className="mb-2">
                <div className="font-semibold">{ed.degree} – {ed.school}</div>
                <div className="text-[12px] text-gray-600">{ed.year}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-indigo-700">Skills</div>
            <div className="flex flex-wrap gap-1.5">{resume.skills.map((s, i) => (<Chip key={i}>{s}</Chip>))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 6) Card Sections (Free)
function TemplateCards({ resume }: { resume: Resume }) {
  return (
    <div className="mx-auto max-w-[820px] bg-white p-6 text-[12.2px] text-gray-900" style={{ width: 820 }}>
      <div className="mb-4 rounded-lg bg-gradient-to-r from-slate-50 to-white p-5">
        <div className="text-3xl font-bold">{resume.name}</div>
        <div className="text-sm text-gray-700">{resume.role}</div>
        <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-gray-600">
          <span>{resume.email}</span><span>•</span><span>{resume.phone}</span><span>•</span><span>{resume.location}</span>
        </div>
      </div>
      <div className="grid gap-4">
        <section className="rounded-lg bg-slate-50 p-4">
          <div className="mb-1 text-[13px] font-semibold uppercase tracking-wide">Summary</div>
          <p>{resume.summary}</p>
        </section>
        <section className="rounded-lg bg-slate-50 p-4">
          <div className="mb-1 text-[13px] font-semibold uppercase tracking-wide">Experience</div>
          {resume.experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex flex-wrap items-baseline justify-between">
                <div className="font-semibold">{exp.title} – {exp.company}</div>
                <div className="text-[12px] text-gray-600">{exp.start} – {exp.end}</div>
              </div>
              <ul className="ml-5 list-disc">{exp.bullets.map((b, i) => (<li key={i}>{b}</li>))}</ul>
            </div>
          ))}
        </section>
        <section className="grid grid-cols-3 gap-4">
          <div className="col-span-2 rounded-lg bg-slate-50 p-4">
            <div className="mb-1 text-[13px] font-semibold uppercase tracking-wide">Education</div>
            {resume.education.map((ed) => (
              <div key={ed.id} className="mb-2">
                <div className="font-semibold">{ed.degree} – {ed.school}</div>
                <div className="text-[12px] text-gray-600">{ed.year}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="mb-1 text-[13px] font-semibold uppercase tracking-wide">Skills</div>
            <div className="flex flex-wrap gap-1.5">{resume.skills.map((s, i) => (<Chip key={i}>{s}</Chip>))}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

// 7) Compact Two-Column (Pro)
function TemplateCompactTwoCol({ resume }: { resume: Resume }) {
  return (
    <div className="mx-auto max-w-[820px] bg-white p-6 text-[12.2px] text-gray-900" style={{ width: 820 }}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{resume.name}</div>
          <div className="text-sm text-gray-700">{resume.role}</div>
        </div>
        <div className="text-right text-[12px] text-gray-600">
          <div>{resume.email}</div>
          <div>{resume.phone}</div>
          <div>{resume.location}</div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <div className="mb-1 border-b text-[13px] font-semibold uppercase tracking-wide">Experience</div>
          {resume.experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex items-baseline justify-between">
                <div className="font-semibold">{exp.title} – {exp.company}</div>
                <div className="text-[12px] text-gray-600">{exp.start} – {exp.end}</div>
              </div>
              <ul className="ml-5 list-disc">{exp.bullets.map((b, i) => (<li key={i}>{b}</li>))}</ul>
            </div>
          ))}
        </div>
        <div className="col-span-2">
          <div className="mb-1 border-b text-[13px] font-semibold uppercase tracking-wide">Summary</div>
          <p className="mb-3">{resume.summary}</p>
          <div className="mb-1 border-b text-[13px] font-semibold uppercase tracking-wide">Skills</div>
          <div className="mb-3 flex flex-wrap gap-1.5">{resume.skills.map((s, i) => (<Chip key={i}>{s}</Chip>))}</div>
          <div className="mb-1 border-b text-[13px] font-semibold uppercase tracking-wide">Education</div>
          {resume.education.map((ed) => (
            <div key={ed.id} className="mb-2">
              <div className="font-semibold">{ed.degree}</div>
              <div className="text-[12px] text-gray-600">{ed.school} • {ed.year}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function Home() {
  const [resume, setResume] = useState<Resume>(defaultResume);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("minimal");
  const [isPro, setIsPro] = useState(false);            // simulate subscription
  const [freeCredits, setFreeCredits] = useState(1);    // simulate 1 free download
  const [newSkill, setNewSkill] = useState("");
  const [skillQuery, setSkillQuery] = useState("");
  const [links, setLinks] = useState<LinkItem[]>(defaultResume.links);

  // letter/email modals
  const [jobTitle, setJobTitle] = useState(""); const [company, setCompany] = useState("");
  const [showLetter, setShowLetter] = useState(false); const [letterText, setLetterText] = useState("");
  const [showEmail, setShowEmail] = useState(false); const [emailText, setEmailText] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  // persistence
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cvb:resume");
      const st = localStorage.getItem("cvb:template");
      const pro = localStorage.getItem("cvb:pro");
      const fc = localStorage.getItem("cvb:free");
      const rl = localStorage.getItem("cvb:links");
      if (raw) setResume(JSON.parse(raw));
      if (st) setSelectedTemplate(st as TemplateId);
      if (pro) setIsPro(pro === "1");
      if (fc) setFreeCredits(parseInt(fc));
      if (rl) setLinks(JSON.parse(rl));
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem("cvb:resume", JSON.stringify(resume)); } catch {} }, [resume]);
  useEffect(() => { try { localStorage.setItem("cvb:template", selectedTemplate); } catch {} }, [selectedTemplate]);
  useEffect(() => { try { localStorage.setItem("cvb:pro", isPro ? "1" : "0"); } catch {} }, [isPro]);
  useEffect(() => { try { localStorage.setItem("cvb:free", String(freeCredits)); } catch {} }, [freeCredits]);
  useEffect(() => { try { localStorage.setItem("cvb:links", JSON.stringify(links)); } catch {} }, [links]);

  // wire links to resume object
  useEffect(() => { setResume((r) => ({ ...r, links })); }, [links]);

  // skill suggestions
  const skillSuggestions = useMemo(() => {
    const q = (skillQuery || newSkill).trim().toLowerCase();
    if (!q) return SKILL_LIBRARY.slice(0, 10);
    return SKILL_LIBRARY.filter((s) => s.toLowerCase().includes(q)).slice(0, 10);
  }, [skillQuery, newSkill]);

  const TemplateView = useMemo(() => {
    const props = { resume };
    switch (selectedTemplate) {
      case "minimal": return <TemplateMinimal {...props} />;
      case "sidebar": return <TemplateSidebar {...props} />;
      case "elegant": return <TemplateElegant {...props} />;
      case "slateShade": return <TemplateSlateShaded {...props} />;
      case "indigoHeader": return <TemplateIndigoHeader {...props} />;
      case "cards": return <TemplateCards {...props} />;
      case "compactTwoCol": return <TemplateCompactTwoCol {...props} />;
      default: return <TemplateMinimal {...props} />;
    }
  }, [selectedTemplate, resume]);

  /* ----------- Actions ----------- */
  function addExperience() {
    setResume((r) => ({
      ...r,
      experience: [
        ...r.experience,
        { id: uid(), title: "Role", company: "Company", location: "", start: "Jan 2023", end: "Present", bullets: ["Achievement / impact", "Tools / metrics"] },
      ],
    }));
  }
  function removeExperience(id: string) {
    setResume((r) => ({ ...r, experience: r.experience.filter((e) => e.id !== id) }));
  }
  function addEducation() {
    setResume((r) => ({
      ...r,
      education: [...r.education, { id: uid(), degree: "Degree", school: "Institute", year: "2024", details: "" }],
    }));
  }
  function removeEducation(id: string) {
    setResume((r) => ({ ...r, education: r.education.filter((e) => e.id !== id) }));
  }
  function addSkill() {
    const s = (newSkill || skillQuery).trim();
    if (!s) return;
    if (!resume.skills.includes(s)) setResume((r) => ({ ...r, skills: [...r.skills, s] }));
    setNewSkill(""); setSkillQuery("");
  }
  function removeSkill(idx: number) {
    setResume((r) => ({ ...r, skills: r.skills.filter((_, i) => i !== idx) }));
  }
  function addLink() {
    setLinks((l) => [...l, { label: "Website", url: "https://example.com" }]);
  }
  function removeLink(idx: number) {
    setLinks((l) => l.filter((_, i) => i !== idx));
  }

  function generateLetter() { setLetterText(generateCoverLetter(resume, jobTitle, company, "formal")); setShowLetter(true); }
  function generateEmail() { setEmailText(generateJobEmail(resume, jobTitle, company)); setShowEmail(true); }

  async function downloadPDF() {
    // Pricing simulation (replace with server auth + Razorpay later)
    const sel = TEMPLATES.find((t) => t.id === selectedTemplate)!;
    if (sel.isPremium && !isPro) {
      if (!confirm("This is a premium template. Pay ₹10 to download? (simulation)")) return;
    } else if (!sel.isPremium && freeCredits <= 0) {
      if (!confirm("You've used your free download. Pay ₹5 for this download? (simulation)")) return;
    }
    try {
      const html2canvasMod: any = await import("html2canvas");
      const html2canvas = html2canvasMod.default || html2canvasMod;
      const jsPDFMod: any = await import("jspdf");
      const JsPDFCtor = jsPDFMod.jsPDF || jsPDFMod.default;

      const node = printRef.current;
      if (!node) return;

      // hide toolbar/badges
      const hiders = document.querySelectorAll(".print-hidden");
      hiders.forEach((el) => ((el as HTMLElement).style.visibility = "hidden"));
      await new Promise((r) => setTimeout(r, 50));

      const canvas = await html2canvas(node, {
        scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false,
        windowWidth: node.scrollWidth, windowHeight: node.scrollHeight,
      });
      hiders.forEach((el) => ((el as HTMLElement).style.visibility = ""));

      const img = canvas.toDataURL("image/png");
      const pdf = new JsPDFCtor("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight();
      const ratio = pageW / canvas.width, pdfH = canvas.height * ratio;

      if (pdfH <= pageH) {
        pdf.addImage(img, "PNG", 0, 0, pageW, pdfH, "", "FAST");
      } else {
        let remaining = pdfH, pos = 0;
        while (remaining > 0) {
          pdf.addImage(img, "PNG", 0, pos, pageW, pdfH, "", "FAST");
          remaining -= pageH;
          if (remaining > 0) { pdf.addPage(); pos -= pageH; }
        }
      }
      pdf.save("resume.pdf");
      if (!sel.isPremium && freeCredits > 0) setFreeCredits((n) => n - 1);
    } catch (e) {
      console.error(e);
      alert("Download failed. Refresh and try again.");
    }
  }

  return (
    <>
      <Head>
        <title>CVCraft – Resume Builder</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white text-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* Top bar */}
          <header className="mb-4 flex items-center justify-between print-hidden">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              <h1 className="text-xl font-bold">CVCraft – Resume Builder</h1>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">MVP</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {isPro ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-yellow-800">
                  <Star className="h-4 w-4" /> Pro Active
                </span>
              ) : (
                <button onClick={() => setIsPro(true)} className="rounded-xl border bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-gray-50">
                  Activate Pro (simulate)
                </button>
              )}
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">Free downloads left: {freeCredits}</span>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Form */}
            <div className="rounded-2xl border bg-white p-4 shadow-sm lg:col-span-1 print-hidden">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Your Details</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs text-gray-600">Full Name</label>
                  <Input value={resume.name} onChange={(e) => setResume({ ...resume, name: e.target.value })} />
                </div>
                <div><label className="text-xs text-gray-600">Role / Headline</label>
                  <Input value={resume.role} onChange={(e) => setResume({ ...resume, role: e.target.value })} />
                </div>
                <div><label className="text-xs text-gray-600">Location</label>
                  <Input value={resume.location} onChange={(e) => setResume({ ...resume, location: e.target.value })} />
                </div>
                <div><label className="text-xs text-gray-600">Email</label>
                  <Input value={resume.email} onChange={(e) => setResume({ ...resume, email: e.target.value })} />
                </div>
                <div><label className="text-xs text-gray-600">Phone</label>
                  <Input value={resume.phone} onChange={(e) => setResume({ ...resume, phone: e.target.value })} />
                </div>
              </div>

              {/* Links */}
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs text-gray-600">Links</label>
                  <button onClick={addLink} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-gray-50">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {links.map((lnk, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2">
                      <Input className="col-span-2" placeholder="Label (e.g., LinkedIn)" value={lnk.label}
                        onChange={(e) => setLinks((arr) => arr.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))} />
                      <Input className="col-span-3" placeholder="https://..." value={lnk.url}
                        onChange={(e) => setLinks((arr) => arr.map((x, idx) => (idx === i ? { ...x, url: e.target.value } : x)))} />
                      <button onClick={() => removeLink(i)} className="col-span-5 inline-flex items-center gap-1 text-xs text-red-600 hover:underline">
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="mt-3">
                <label className="text-xs text-gray-600">Summary</label>
                <TextArea rows={4} value={resume.summary} onChange={(e) => setResume({ ...resume, summary: e.target.value })} />
              </div>

              {/* Skills with autocomplete */}
              <div className="mt-3">
                <div className="mb-1"><label className="text-xs text-gray-600">Skills</label></div>
                <div className="relative">
                  <Input
                    placeholder="Type a skill… (e.g., Excel)"
                    value={skillQuery || newSkill}
                    onChange={(e) => { setSkillQuery(e.target.value); setNewSkill(e.target.value); }}
                    onKeyDown={(e) => { if (e.key === "Enter") addSkill(); }}
                  />
                  { (skillQuery || newSkill) && (
                    <div className="absolute z-10 mt-1 max-h-44 w-full overflow-auto rounded-xl border bg-white p-1 shadow-lg">
                      {skillSuggestions.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-gray-500">No suggestions</div>
                      ) : skillSuggestions.map((s, i) => (
                        <button key={i}
                          onClick={() => { setNewSkill(s); setSkillQuery(""); setTimeout(addSkill, 0); }}
                          className="block w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-gray-50"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {resume.skills.map((s, i) => (
                    <span key={i} className="group inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs">
                      {s}
                      <button onClick={() => removeSkill(i)} className="opacity-60 hover:opacity-100">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Experience</h3>
                  <button onClick={addExperience} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-gray-50">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="space-y-3">
                  {resume.experience.map((exp, idx) => (
                    <div key={exp.id} className="rounded-xl border p-3">
                      <div className="mb-2 flex items-center justify-between text-xs text-gray-600">
                        #{idx + 1}
                        <button onClick={() => removeExperience(exp.id)} className="text-red-600 hover:underline">Remove</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Title" value={exp.title}
                          onChange={(e) => setResume((r) => ({ ...r, experience: r.experience.map((x) => x.id === exp.id ? { ...x, title: e.target.value } : x) }))} />
                        <Input placeholder="Company" value={exp.company}
                          onChange={(e) => setResume((r) => ({ ...r, experience: r.experience.map((x) => x.id === exp.id ? { ...x, company: e.target.value } : x) }))} />
                        <Input placeholder="Start" value={exp.start}
                          onChange={(e) => setResume((r) => ({ ...r, experience: r.experience.map((x) => x.id === exp.id ? { ...x, start: e.target.value } : x) }))} />
                        <Input placeholder="End" value={exp.end}
                          onChange={(e) => setResume((r) => ({ ...r, experience: r.experience.map((x) => x.id === exp.id ? { ...x, end: e.target.value } : x) }))} />
                      </div>
                      <div className="mt-2">
                        <label className="text-xs text-gray-600">Bullets (one per line)</label>
                        <TextArea rows={3} value={exp.bullets.join("\n")}
                          onChange={(e) => setResume((r) => ({ ...r, experience: r.experience.map((x) => x.id === exp.id ? { ...x, bullets: e.target.value.split("\n").filter(Boolean) } : x) }))} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Education</h3>
                  <button onClick={addEducation} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-gray-50">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="space-y-3">
                  {resume.education.map((ed, idx) => (
                    <div key={ed.id} className="rounded-xl border p-3">
                      <div className="mb-2 flex items-center justify-between text-xs text-gray-600">
                        #{idx + 1}
                        <button onClick={() => removeEducation(ed.id)} className="text-red-600 hover:underline">Remove</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Degree" value={ed.degree}
                          onChange={(e) => setResume((r) => ({ ...r, education: r.education.map((x) => x.id === ed.id ? { ...x, degree: e.target.value } : x) }))} />
                        <Input placeholder="School" value={ed.school}
                          onChange={(e) => setResume((r) => ({ ...r, education: r.education.map((x) => x.id === ed.id ? { ...x, school: e.target.value } : x) }))} />
                        <Input placeholder="Year" value={ed.year}
                          onChange={(e) => setResume((r) => ({ ...r, education: r.education.map((x) => x.id === ed.id ? { ...x, year: e.target.value } : x) }))} />
                        <Input placeholder="Details" value={ed.details || ""}
                          onChange={(e) => setResume((r) => ({ ...r, education: r.education.map((x) => x.id === ed.id ? { ...x, details: e.target.value } : x) }))} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cover letter & Email */}
              <div className="mt-4 rounded-xl bg-indigo-50 p-3">
                <div className="mb-2 text-xs font-semibold uppercase text-indigo-700">Cover Letter & Email</div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Job Title (e.g., Ops Manager)" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                  <Input placeholder="Company (e.g., Myntra)" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={generateLetter} className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">
                    <Wand2 className="h-4 w-4" /> Generate Letter
                  </button>
                  <button onClick={generateEmail} className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">
                    <Mail className="h-4 w-4" /> Generate Email
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Templates + Preview */}
            <div className="lg:col-span-2">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 print-hidden">
                <div className="flex flex-wrap items-center gap-2">
                  {TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${selectedTemplate === t.id ? "bg-gray-900 text-white" : "bg-white border"}`}
                    >
                      {t.name}
                      {t.isPremium ? <Lock className="ml-1 h-4 w-4" /> : <CheckCircle className="ml-1 h-4 w-4" />}
                      <span className={`ml-1 rounded-full px-1.5 text-[10px] ${t.isPremium ? "bg-yellow-100 text-yellow-800" : "bg-emerald-100 text-emerald-700"}`}>{t.badge}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={downloadPDF} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black">
                    <Download className="h-4 w-4" /> Download PDF
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm" ref={printRef}>
                <div className="mx-auto w-full max-w-[840px]">
                  {selectedTemplate === "minimal" && <TemplateMinimal resume={resume} />}
                  {selectedTemplate === "sidebar" && <TemplateSidebar resume={resume} />}
                  {selectedTemplate === "elegant" && <TemplateElegant resume={resume} />}
                  {selectedTemplate === "slateShade" && <TemplateSlateShaded resume={resume} />}
                  {selectedTemplate === "indigoHeader" && <TemplateIndigoHeader resume={resume} />}
                  {selectedTemplate === "cards" && <TemplateCards resume={resume} />}
                  {selectedTemplate === "compactTwoCol" && <TemplateCompactTwoCol resume={resume} />}

                  {/* Premium watermark */}
                  {TEMPLATES.find((t) => t.id === selectedTemplate)?.isPremium && !isPro && (
                    <div className="pointer-events-none absolute right-6 top-6 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs text-white print-hidden">
                      <Lock className="h-3 w-3" /> Premium preview
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500 print-hidden">
                Tip: The PDF button exports a high-quality A4 document. For browser print, use A4 and enable background graphics.
              </p>
            </div>
          </div>

          {/* Modals */}
          {showLetter && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 print-hidden">
              <div className="max-w-2xl rounded-2xl bg-white p-4 shadow-xl">
                <div className="mb-2 text-sm font-semibold">Generated Cover Letter</div>
                <TextArea rows={16} value={letterText} onChange={(e) => setLetterText(e.target.value)} />
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => navigator.clipboard.writeText(letterText)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">Copy</button>
                  <button onClick={() => setShowLetter(false)} className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white">Close</button>
                </div>
              </div>
            </div>
          )}
          {showEmail && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 print-hidden">
              <div className="max-w-2xl rounded-2xl bg-white p-4 shadow-xl">
                <div className="mb-2 text-sm font-semibold">Generated Job Email</div>
                <TextArea rows={14} value={emailText} onChange={(e) => setEmailText(e.target.value)} />
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => navigator.clipboard.writeText(emailText)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">Copy</button>
                  <button onClick={() => setShowEmail(false)} className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white">Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </>
  );
}
