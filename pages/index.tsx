import Head from "next/head";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Download, Sparkles, Star } from "lucide-react";

/* ---------- Types ---------- */
type Experience = {
  id: string;
  title: string;
  company: string;
  location?: string;
  start: string;
  end: string;
  bullets: string[];
};
type Education = {
  id: string;
  degree: string;
  school: string;
  year: string;
  details?: string;
};
type Resume = {
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  links: { label: string; url: string }[];
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
};
const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- Seed data ---------- */
const defaultResume: Resume = {
  name: "Your Name",
  role: "Operations & E-commerce Manager",
  email: "you@example.com",
  phone: "+91-90000 00000",
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
    {
      id: uid(),
      degree: "B.Com (H)",
      school: "Delhi University",
      year: "2019",
      details: "Finance",
    },
  ],
};

/* ---------- Simple Input helpers ---------- */
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...p}
    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
      p.className || ""
    }`}
  />
);
const TextArea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...p}
    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
      p.className || ""
    }`}
  />
);

/* ---------- Minimal Template ---------- */
function TemplateMinimal({ resume }: { resume: Resume }) {
  return (
    <div
      className="mx-auto max-w-[800px] bg-white p-8 text-[12.2px] leading-relaxed text-gray-900 print:p-0"
      style={{ width: 800 }} // helps consistent PDF width
    >
      <header className="border-b pb-2">
        <h1 className="text-3xl font-bold tracking-tight">{resume.name}</h1>
        <div className="mt-1 text-sm text-gray-700">{resume.role}</div>
        <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-gray-600">
          <span>{resume.email}</span>
          <span>•</span>
          <span>{resume.phone}</span>
          <span>•</span>
          <span>{resume.location}</span>
        </div>
      </header>

      <section className="mt-4">
        <h2 className="mb-1 border-b text-[13px] font-semibold uppercase tracking-wide">
          Summary
        </h2>
        <p>{resume.summary}</p>
      </section>

      <section className="mt-4">
        <h2 className="mb-1 border-b text-[13px] font-semibold uppercase tracking-wide">
          Experience
        </h2>
        {resume.experience.map((exp) => (
          <div key={exp.id} className="mb-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-semibold">
                {exp.title} • {exp.company}
              </div>
              <div className="text-[12px] text-gray-600">
                {exp.start} – {exp.end}
                {exp.location ? ` • ${exp.location}` : ""}
              </div>
            </div>
            <ul className="ml-5 list-disc">
              {exp.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mt-4 grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <h2 className="mb-1 border-b text-[13px] font-semibold uppercase tracking-wide">
            Education
          </h2>
          {resume.education.map((ed) => (
            <div key={ed.id} className="mb-2">
              <div className="font-semibold">
                {ed.degree} – {ed.school}
              </div>
              <div className="text-[12px] text-gray-600">{ed.year}</div>
              {ed.details && <div className="text-[12px]">{ed.details}</div>}
            </div>
          ))}
        </div>
        <div>
          <h2 className="mb-1 border-b text-[13px] font-semibold uppercase tracking-wide">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((s, i) => (
              <span key={i} className="rounded bg-gray-100 px-2 py-1 text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Page ---------- */
export default function Home() {
  const [resume, setResume] = useState<Resume>(defaultResume);
  const [isPro, setIsPro] = useState(false);
  const [freeCredits, setFreeCredits] = useState<number>(1);

  const printRef = useRef<HTMLDivElement>(null);

  /* Persistence */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cvb:resume");
      if (raw) setResume(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("cvb:resume", JSON.stringify(resume));
    } catch {}
  }, [resume]);

  const TemplateView = useMemo(
    () => <TemplateMinimal resume={resume} />,
    [resume]
  );

  /* ✅ Robust PDF download with safe dynamic imports */
  async function downloadPDF() {
    try {
      // Load libs only in the browser, handle CJS/ESM differences
      const html2canvasMod: any = await import("html2canvas");
      const html2canvas = html2canvasMod.default || html2canvasMod;

      const jsPDFMod: any = await import("jspdf");
      const JsPDFCtor = jsPDFMod.jsPDF || jsPDFMod.default;

      const node = printRef.current;
      if (!node) {
        alert("Preview not ready yet. Try again in a moment.");
        return;
      }

      // Hide UI during capture
      const hiders = document.querySelectorAll(".print-hidden");
      hiders.forEach((el) => ((el as HTMLElement).style.visibility = "hidden"));
      await new Promise((r) => setTimeout(r, 50));

      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: node.scrollWidth,
        windowHeight: node.scrollHeight,
      });

      // Restore UI
      hiders.forEach((el) => ((el as HTMLElement).style.visibility = ""));

      const imgData = canvas.toDataURL("image/png");
      const pdf = new JsPDFCtor("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth(); // 210
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297

      const pxFullWidth = canvas.width;
      const pxFullHeight = canvas.height;
      const ratio = pageWidth / pxFullWidth;
      const pdfHeight = pxFullHeight * ratio;

      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight, "", "FAST");
      } else {
        // multipage
        let remainingHeight = pdfHeight;
        let position = 0;
        while (remainingHeight > 0) {
          pdf.addImage(
            imgData,
            "PNG",
            0,
            position,
            pageWidth,
            pdfHeight,
            "",
            "FAST"
          );
          remainingHeight -= pageHeight;
          if (remainingHeight > 0) {
            pdf.addPage();
            position -= pageHeight;
          }
        }
      }

      pdf.save("resume.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
      alert(
        "Download failed to start. Please refresh the page, then try the Download button again."
      );
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
          <header className="mb-4 flex items-center justify-between print-hidden">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              <h1 className="text-xl font-bold">CVCraft – Resume Builder</h1>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {isPro ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-yellow-800">
                  <Star className="h-4 w-4" /> Pro Active
                </span>
              ) : (
                <button
                  onClick={() => setIsPro(true)}
                  className="rounded-xl border bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-gray-50"
                >
                  Activate Pro (simulate)
                </button>
              )}
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                Free downloads left: {freeCredits}
              </span>
            </div>
          </header>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 print-hidden">
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>

          {/* Printable Area */}
          <div
            className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            ref={printRef}
          >
            {TemplateView}
          </div>
        </div>
      </div>
    </>
  );
}
