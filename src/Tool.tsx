// Subkit: a teacher builds a complete substitute plan in five minutes from their own timetable and ready-made lesson shapes.
import { uid, useStored } from "./lib/store";
import { Section } from "./ui/kit";

const T = "subkit";
type Step = { id: string; mins: number; what: string };
type Period = { id: string; time: string; cls: string; subject: string; room: string; objective: string; steps: Step[]; materials: string; collect: string };
type Pack = { teacher: string; school: string; date: string; periods: Period[]; rules: string; watch: string; emergency: string; helpers: string; early: string; tech: string; notes: string };
const SHAPES: Record<string, Omit<Step, "id">[]> = {
  "Practice lesson": [{ mins: 5, what: "Starter on the board: 3 quick questions from last lesson" }, { mins: 10, what: "Go through the worked example on page ___ together" }, { mins: 25, what: "Independent practice: exercises ___ to ___ in exercise books" }, { mins: 10, what: "Swap books and mark with the answer sheet" }, { mins: 5, what: "Exit question: students write one thing they found hard" }],
  "Reading lesson": [{ mins: 5, what: "Silent reading of the text on page ___" }, { mins: 15, what: "Read aloud in turns, one paragraph each" }, { mins: 20, what: "Answer comprehension questions ___ in full sentences" }, { mins: 10, what: "Pairs compare answers, then share two with the class" }],
  "Video lesson": [{ mins: 5, what: "Hand out the question sheet before starting" }, { mins: 25, what: "Watch the video (link in the notes), pausing at the marked times" }, { mins: 15, what: "Students complete the question sheet" }, { mins: 5, what: "Collect the sheets" }],
  "Revision lesson": [{ mins: 10, what: "Quiz: 10 questions on the board, students answer on paper" }, { mins: 25, what: "Revision booklet pages ___ to ___" }, { mins: 15, what: "Students make a one-page summary of the topic" }],
};
const SAMPLE: Pack = {
  teacher: "Mme Leila Haddad", school: "Collège El Menzah", date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  periods: [
    { id: "p1", time: "08:00 to 09:00", cls: "7B", subject: "Maths", room: "B12", objective: "Add and subtract fractions with different denominators.", materials: "Textbook p. 64, answer sheet in the blue folder", collect: "Exercise books on my desk", steps: SHAPES["Practice lesson"].map(s => ({ ...s, id: uid(), what: s.what.replace("page ___", "page 64").replace("___ to ___", "4 to 12") })) },
    { id: "p2", time: "09:00 to 10:00", cls: "8A", subject: "Maths", room: "B12", objective: "Revise linear equations for Friday's quiz.", materials: "Revision booklet (30 copies in the tray)", collect: "Summaries", steps: SHAPES["Revision lesson"].map(s => ({ ...s, id: uid() })) },
    { id: "p3", time: "10:15 to 11:15", cls: "", subject: "Free period", room: "", objective: "", materials: "", collect: "", steps: [] },
  ],
  rules: "Phones in bags. Hands up to speak. Nobody leaves without the pass on my desk.", watch: "7B: Adam needs to sit at the front (hearing). 8A: Rania has a nut allergy (EpiPen in the office).",
  emergency: "Fire: leave by the stairs next to B14, meet on the basketball court, take the register. First aid: Mme Sassi, room A3, ext. 214.", helpers: "M. Jaziri next door in B13 knows both classes well.",
  early: "Fraction puzzles in the green box, or silent reading.", tech: "Laptop password on a card in the top drawer. Projector remote in the drawer.", notes: "Thank you! Please leave a quick note on how each class behaved.",
};

export default function Subkit() {
  const [pack, setPack] = useStored<Pack>(T, "pack", SAMPLE);
  const set = (p: Partial<Pack>) => setPack({ ...pack, ...p });
  const setP = (id: string, patch: Partial<Period>) => set({ periods: pack.periods.map(p => (p.id === id ? { ...p, ...patch } : p)) });
  const total = (p: Period) => p.steps.reduce((a, s) => a + s.mins, 0);
  const field = (k: keyof Pack, label: string, rows = 2) => <label className="field"><span>{label}</span><textarea className="input" rows={rows} value={pack[k] as string} onChange={e => set({ [k]: e.target.value } as Partial<Pack>)} /></label>;

  return (
    <div className="stack">
      <Section title="Cover plan" aside={<button className="btn primary small" onClick={() => window.print()}>Print the pack</button>}>
        <div className="row"><label className="field"><span>Teacher</span><input id="sk-t" className="input" value={pack.teacher} onChange={e => set({ teacher: e.target.value })} /></label><label className="field"><span>School</span><input id="sk-s" className="input" value={pack.school} onChange={e => set({ school: e.target.value })} /></label><label className="field"><span>Date</span><input id="sk-d" type="date" className="input" value={pack.date} onChange={e => set({ date: e.target.value })} /></label></div>
      </Section>
      {pack.periods.map(p => (
        <Section key={p.id} title={`${p.time || "Period"} ${p.cls ? `· ${p.cls}` : ""}`} aside={<><select className="input" style={{ width: "auto" }} aria-label="Lesson shape" value="" onChange={e => e.target.value && setP(p.id, { steps: SHAPES[e.target.value].map(s => ({ ...s, id: uid() })) })}><option value="">Use a lesson shape…</option>{Object.keys(SHAPES).map(k => <option key={k}>{k}</option>)}</select><button className="btn ghost small danger" onClick={() => set({ periods: pack.periods.filter(x => x.id !== p.id) })}>Remove</button></>}>
          <div className="row"><label className="field"><span>Time</span><input className="input" value={p.time} onChange={e => setP(p.id, { time: e.target.value })} /></label><label className="field"><span>Class</span><input className="input" value={p.cls} onChange={e => setP(p.id, { cls: e.target.value })} /></label><label className="field"><span>Subject</span><input className="input" value={p.subject} onChange={e => setP(p.id, { subject: e.target.value })} /></label><label className="field"><span>Room</span><input className="input" value={p.room} onChange={e => setP(p.id, { room: e.target.value })} /></label></div>
          {p.cls && <>
            <label className="field" style={{ marginTop: 10 }}><span>By the end, students can…</span><input className="input" value={p.objective} onChange={e => setP(p.id, { objective: e.target.value })} /></label>
            <div className="stack" style={{ gap: 6, marginTop: 10 }}>{p.steps.map(s => <div key={s.id} className="row" style={{ alignItems: "center" }}><input className="input num" style={{ width: 64 }} aria-label="Minutes" value={s.mins} onChange={e => setP(p.id, { steps: p.steps.map(x => x.id === s.id ? { ...x, mins: parseInt(e.target.value) || 0 } : x) })} /><span className="note">min</span><input className="input" style={{ flex: 1 }} aria-label="Activity" value={s.what} onChange={e => setP(p.id, { steps: p.steps.map(x => x.id === s.id ? { ...x, what: e.target.value } : x) })} /><button className="btn ghost small danger" onClick={() => setP(p.id, { steps: p.steps.filter(x => x.id !== s.id) })}>×</button></div>)}</div>
            <div className="row" style={{ marginTop: 8, alignItems: "center" }}><button className="btn small" onClick={() => setP(p.id, { steps: [...p.steps, { id: uid(), mins: 10, what: "" }] })}>Add a step</button><span className={"pill " + (total(p) > 60 ? "bad" : "")}>{total(p)} minutes</span>{p.steps.some(s => s.what.includes("___")) && <span className="pill warn">Fill in the blanks (___)</span>}</div>
            <div className="row" style={{ marginTop: 10 }}><label className="field"><span>Materials and where they are</span><input className="input" value={p.materials} onChange={e => setP(p.id, { materials: e.target.value })} /></label><label className="field"><span>What to collect</span><input className="input" value={p.collect} onChange={e => setP(p.id, { collect: e.target.value })} /></label></div>
          </>}
        </Section>
      ))}
      <button className="btn" style={{ alignSelf: "flex-start" }} onClick={() => set({ periods: [...pack.periods, { id: uid(), time: "", cls: "", subject: "", room: "", objective: "", steps: [], materials: "", collect: "" }] })}>Add a period</button>
      <div className="grid2">
        <Section title="Class and safety"><div className="stack" style={{ gap: 10 }}>{field("rules", "Class rules")}{field("watch", "Students to know about (first names only)")}{field("emergency", "Fire drill and first aid")}</div></Section>
        <Section title="Helpful extras"><div className="stack" style={{ gap: 10 }}>{field("helpers", "Colleagues who can help")}{field("early", "If students finish early")}{field("tech", "Computer and projector")}{field("notes", "Note to the substitute")}</div></Section>
      </div>
      <article className="sk-print">
        <h1>Cover plan · {pack.teacher}</h1><p>{pack.school} · {new Date(pack.date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p>
        <p className="sk-note">{pack.notes}</p>
        {pack.periods.map(p => <section key={p.id}><h2>{p.time} · {p.cls || "No class"} {p.subject && `· ${p.subject}`} {p.room && `· Room ${p.room}`}</h2>{p.cls && <><p><b>Goal:</b> {p.objective}</p><ol>{p.steps.map(s => <li key={s.id}><b>{s.mins} min</b> {s.what}</li>)}</ol><p><b>Materials:</b> {p.materials}</p><p><b>Collect:</b> {p.collect}</p></>}</section>)}
        <section><h2>Good to know</h2><p><b>Rules:</b> {pack.rules}</p><p><b>Students:</b> {pack.watch}</p><p><b>Emergencies:</b> {pack.emergency}</p><p><b>Help:</b> {pack.helpers}</p><p><b>Early finishers:</b> {pack.early}</p><p><b>Tech:</b> {pack.tech}</p></section>
      </article>
      <style>{`.sk-print{display:none}@media print{body *{visibility:hidden}.sk-print,.sk-print *{visibility:visible}.sk-print{display:block;position:absolute;inset:0 auto auto 0;width:100%;color:#000;font-size:13px}.sk-print h1{font-size:26px}.sk-print h2{font-size:17px;margin-top:14px;border-bottom:1px solid #000}.sk-print section{break-inside:avoid}.sk-note{font-style:italic}}`}</style>
    </div>
  );
}
