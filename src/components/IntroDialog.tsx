import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { AiTag } from './AiTag';
import { HumanTag } from './HumanTag';
import { useDemo } from '../store';

const PAINS = [
  { t: 'מסמכים מכמה מדינות ושפות', d: 'דרכון, תעודות לידה ונישואין, אפוסטילים ותרגומים נוטריוניים, שמושווים ידנית שדה אחר שדה.' },
  { t: 'הצלבה מול מאגרים', d: 'מרשם האוכלוסין, מעברי גבול, בקשות קודמות ורישום פלילי, כל אחד במערכת נפרדת.' },
  { t: 'ראיון ארוך דרך מתורגמן', d: 'שני בני הזוג מרואיינים בנפרד. הרישום ידני, וסתירות מזוהות מהזיכרון.' },
  { t: 'החלטה ומכתב מאפס', d: 'ריכוז הממצאים, ניסוח הנימוק וכתיבת מכתב ההחלטה, לכל תיק מחדש.' },
];

const FLOW = [
  { t: 'אימות מסמכים', d: 'OCR, תרגום והצלבה. כל אי-התאמה מסומנת עם הסבר.' },
  { t: 'פתיחת תיק', d: 'סיכום, עדכון רשומות מקושרות ומיקודים לראיון.' },
  { t: 'ראיון', d: 'תמלול ותרגום חי, שאלות המשך וגלאי סתירות.' },
  { t: 'הכרעה', d: 'טיוטת המלצה ומכתב. ההחלטה והחתימה אנושיות.' },
];

export function IntroDialog() {
  const { state, dispatch } = useDemo();
  const ref = useRef<HTMLDialogElement>(null);
  const cta = useRef<HTMLButtonElement>(null);
  const open = state.introOpen;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { d.showModal(); cta.current?.focus(); }
    if (!open && d.open) d.close();
  }, [open]);

  const close = () => dispatch({ type: 'intro', open: false });

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
          <h2 id="intro-title">בקשת מעמד לבת זוג זרה: מ-15 שעות טיפול ל-6</h2>
          <p id="intro-lead">עמדת עבודה לרכזת תיקים, שבה ה-AI מכין את העבודה והאדם מקבל את ההחלטות.</p>
        </div>
        <button type="button" className="intro-x" aria-label="סגירה" onClick={close}><Icon name="x" size={20} /></button>
      </div>

      <div className="intro-body">
        <section>
          <h3>הבעיה</h3>
          <p style={{ fontSize: 14, color: 'var(--gray-700)', marginBottom: 10 }}>
            אזרח ישראלי שמבקש מעמד לבת זוגו הזרה פותח תיק שהטיפול בו ידני כמעט לגמרי. רכזת אחת עוברת על עשרות עמודים, מצליבה מאגרים, מראיינת ומנסחת החלטה. התוצאה: כ-15 שעות עבודה לתיק, תורים ארוכים, ושגיאות שמתגלות מאוחר.
          </p>
          <div className="pains">
            {PAINS.map((p) => <div key={p.t} className="pain"><b>{p.t}</b>{p.d}</div>)}
          </div>
        </section>

        <section>
          <h3>מה רואים בדמו</h3>
          <ol className="flow">
            {FLOW.map((f) => <li key={f.t}><b>{f.t}</b>{f.d}</li>)}
          </ol>
        </section>

        <div className="principle">
          <span className="row"><AiTag /> מציע, עם רמת ביטחון והסבר</span>
          <span className="row"><HumanTag text="הוכרע ע״י רכזת" /> מחליט, ונרשם ביומן הביקורת</span>
          <span className="kpi"><s>15 ש׳</s><span aria-hidden="true">←</span><span className="to">6 ש׳ לתיק</span></span>
        </div>
      </div>

      <div className="intro-f">
        <small>כל השמות, המספרים והמסמכים בדמו בדויים. אפשר לפתוח הסבר זה שוב מ״על הדמו״ בתחתית סרגל הצד.</small>
        <button type="button" className="btn btn-primary btn-lg" onClick={close} ref={cta}>
          התחל את הדמו <Icon name="arrow" size={18} />
        </button>
      </div>
    </dialog>
  );
}
