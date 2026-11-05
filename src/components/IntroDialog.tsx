import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { useDemo } from '../store';

// Per-file handling time, from the demo's own model (see the time-per-stage chart on the decision screen).
const MANUAL_H = 15;
const AI_H = 6;
// A full-time caseworker's productive hours per year, used for the FTE equivalent.
const FTE_HOURS = 1800;

const num = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 });
const money = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toLocaleString('he-IL', { maximumFractionDigits: 1 })} מיליון ₪` : `${num.format(v)} ₪`;

function Slider({ id, label, value, min, max, step, onChange, format }: {
  id: string; label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string;
}) {
  return (
    <div className="roi-in">
      <div className="roi-in-h">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="mono">{format(value)}</output>
      </div>
      <input
        id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--p' as string]: `${((value - min) / (max - min)) * 100}%` }}
      />
    </div>
  );
}

export function IntroDialog() {
  const { state, dispatch } = useDemo();
  const ref = useRef<HTMLDialogElement>(null);
  const cta = useRef<HTMLButtonElement>(null);
  const open = state.introOpen;

  const [requests, setRequests] = useState(12000);
  const [rate, setRate] = useState(150);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { d.showModal(); cta.current?.focus(); }
    if (!open && d.open) d.close();
  }, [open]);

  const close = () => dispatch({ type: 'intro', open: false });

  const hoursSaved = requests * (MANUAL_H - AI_H);
  const fte = hoursSaved / FTE_HOURS;
  const savings = hoursSaved * rate;

  return (
    <dialog
      ref={ref} className="intro" aria-labelledby="intro-title" aria-describedby="intro-lead"
      onClose={() => { if (state.introOpen) close(); }}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="intro-h">
        <span className="logo-mark" aria-hidden="true"><Icon name="star" size={22} style={{ color: '#fff' }} /></span>
        <div>
          <div className="eb" dir="ltr" style={{ textAlign: 'right' }}>Jeen.ai Case Assistant · demo</div>
          <h2 id="intro-title">15 שעות לתיק. אפשר 6.</h2>
          <p id="intro-lead">
            בקשת מעמד לבת זוג זרה היא עשרות מסמכים בכמה שפות, הצלבה ידנית מול מאגרים, ראיון דרך מתורגמן ומכתב החלטה מאפס. ה-AI מכין את כל זה. הרכזת מחליטה.
          </p>
        </div>
        <button type="button" className="intro-x" aria-label="סגירה" onClick={close}><Icon name="x" size={20} /></button>
      </div>

      <div className="intro-body">
        <div className="race" aria-label="זמן טיפול לתיק: 15 שעות ידני, 6 שעות עם Jeen.ai">
          <div className="race-row"><span className="l">היום</span><span className="race-track"><span className="man" style={{ width: '100%' }} /></span><span className="v">15 ש׳</span></div>
          <div className="race-row"><span className="l">עם Jeen.ai</span><span className="race-track"><span className="ai" style={{ width: `${(AI_H / MANUAL_H) * 100}%` }} /></span><span className="v ai">6 ש׳</span></div>
        </div>

        <section className="roi" aria-labelledby="roi-h">
          <div className="roi-head">
            <h3 id="roi-h"><Icon name="sparkle" size={14} filled className="ico-ai" />מה זה שווה בשנה?</h3>
            <span className="small muted">הזיזו את ההנחות</span>
          </div>
          <div className="roi-inputs">
            <Slider id="roi-req" label="בקשות בשנה" value={requests} min={2000} max={30000} step={1000} onChange={setRequests} format={num.format} />
            <Slider id="roi-rate" label="עלות שעת רכזת (כולל תקורה)" value={rate} min={80} max={300} step={10} onChange={setRate} format={(v) => `${v} ₪`} />
          </div>
          <div className="kpis" aria-live="polite">
            <div className="kpi-tile hero">
              <span className="k">{money(savings)}</span>
              <span className="d">חיסכון שנתי</span>
            </div>
            <div className="kpi-tile">
              <span className="k">{num.format(hoursSaved)}</span>
              <span className="d">שעות עבודה מתפנות</span>
            </div>
            <div className="kpi-tile">
              <span className="k">{num.format(Math.round(fte))}</span>
              <span className="d">משרות מלאות</span>
            </div>
            <div className="kpi-tile">
              <span className="k"><span dir="ltr">×2.5</span></span>
              <span className="d">תיקים לכל רכזת</span>
            </div>
          </div>
          <p className="roi-note">
            9 שעות נחסכות לתיק · משרה מלאה = {num.format(FTE_HOURS)} שעות בשנה. ההנחות להמחשה בלבד.
          </p>
        </section>
      </div>

      <div className="intro-f">
        <small>כל השמות והמסמכים בדמו בדויים · ״על הדמו״ בסרגל הצד פותח חלון זה שוב</small>
        <button type="button" className="btn btn-primary btn-lg" onClick={close} ref={cta}>
          בואו נראה איך <Icon name="arrow" size={18} />
        </button>
      </div>
    </dialog>
  );
}
