const panelBase =
  "rounded-[var(--radius)] border border-[#2f3a50] bg-[linear-gradient(170deg,rgba(36,43,57,0.95),rgba(24,30,41,0.95))]";

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export const ui = {
  shell: "flex min-h-screen flex-col gap-[14px] p-[18px] max-[900px]:p-3",
  grid: "grid min-h-0 flex-1 grid-cols-[minmax(470px,1.35fr)_minmax(340px,1fr)] gap-[14px] max-[1260px]:grid-cols-1",
  column: "grid min-h-0 gap-[14px]",

  topbar: "grid grid-cols-[minmax(280px,1fr)_minmax(360px,2fr)] gap-[14px] rounded-[var(--radius)] border border-[#2f3a50] bg-[linear-gradient(145deg,rgba(35,44,61,0.96),rgba(27,33,45,0.96))] p-[14px] backdrop-blur-[3px] animate-[rise_0.35s_ease] max-[1260px]:grid-cols-1",
  titleBlock: "flex flex-col justify-center gap-1",
  title: "text-[clamp(1.05rem,2.2vw,1.45rem)] font-[680] tracking-[0.02em] text-[#f2f5ff]",
  subtitle: "text-[0.87rem] text-[#a6afc4]",
  topControls: "grid grid-cols-[1.6fr_repeat(5,minmax(86px,auto))] items-end gap-[10px] max-[1260px]:grid-cols-2 max-[900px]:grid-cols-1",
  field: "min-w-0",

  label: "mb-[6px] block text-[0.75rem] uppercase tracking-[0.05em] text-[#a6afc4]",
  input:
    "w-full rounded-[11px] border border-[#2f3a50] bg-[#171d29] px-[10px] py-[9px] text-[0.88rem] text-[#f2f5ff] outline-none transition focus:border-[#59d0ff] focus:ring-2 focus:ring-[#59d0ff]/20",
  select:
    "w-full rounded-[11px] border border-[#2f3a50] bg-[#171d29] px-[10px] py-[9px] text-[0.88rem] text-[#f2f5ff] outline-none transition focus:border-[#59d0ff] focus:ring-2 focus:ring-[#59d0ff]/20",
  textarea:
    "w-full rounded-[11px] border border-[#2f3a50] bg-[#171d29] px-[10px] py-[9px] text-[0.88rem] text-[#f2f5ff] outline-none transition focus:border-[#59d0ff] focus:ring-2 focus:ring-[#59d0ff]/20",

  button:
    "cursor-pointer rounded-[11px] border border-[#2f3a50] bg-[#202939] px-3 py-[10px] text-[0.84rem] font-[640] text-[#f2f5ff] transition duration-150 enabled:hover:-translate-y-[1px] enabled:hover:border-[#43587e] enabled:hover:bg-[#263146] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
  buttonPrimary:
    "border-[#2d7c9a] bg-[linear-gradient(165deg,#2c6d8a,#275b73)] enabled:hover:border-[#42b7e3] enabled:hover:bg-[linear-gradient(165deg,#2f86aa,#2a6f8c)]",
  buttonDanger:
    "border-[#7f4040] bg-[linear-gradient(165deg,#683636,#532a2a)]",
  buttonWarn:
    "border-[#7a6140] bg-[linear-gradient(165deg,#6f5a3b,#58462f)]",

  card: `${panelBase} flex min-h-0 flex-col gap-3 p-[14px] animate-[rise_0.38s_ease_both]`,
  cardTitleRow: "flex flex-wrap items-center justify-between gap-3",
  cardTitle: "text-[0.96rem] font-[670] text-[#f2f5ff]",
  cardHint: "text-[0.8rem] text-[#a6afc4]",

  pills: "flex flex-wrap gap-[7px]",
  pill: "rounded-full border border-[#2f3a50] bg-[rgba(14,18,27,0.7)] px-[9px] py-1 text-[0.74rem]",
  pillOk: "border-[#2e7d63] text-[#84e9c5]",
  pillErr: "border-[#7b4545] text-[#ffb6b6]",

  viewerModes: "flex flex-wrap gap-2",
  modeBtn:
    "cursor-pointer rounded-[10px] border border-[#2f3a50] bg-[#202939] px-[10px] py-2 text-[0.82rem] font-semibold text-[#a6afc4] transition hover:border-[#43587e] hover:bg-[#263146]",
  modeBtnActive:
    "border-[#45b9e3] bg-[linear-gradient(170deg,#2b6f8f,#265b74)] text-[#eaf6ff]",

  viewerLayout: "grid grid-cols-[minmax(0,1fr)_minmax(210px,260px)] gap-[10px] max-[1260px]:grid-cols-1",
  viewerStage:
    "relative min-h-[260px] overflow-hidden rounded-[12px] border border-[#2f3a50] bg-[#0f131c] max-[900px]:min-h-[210px]",
  viewerMedia: "block h-full w-full object-contain",
  viewerEmpty:
    "grid min-h-[260px] place-items-center px-6 py-6 text-center text-[0.86rem] text-[#a6afc4] max-[900px]:min-h-[210px]",
  quickPanel:
    "flex flex-col gap-2 rounded-[12px] border border-[#2f3a50] bg-[rgba(16,22,33,0.78)] p-[10px]",
  quickTitle: "text-[0.84rem] uppercase tracking-[0.03em] text-[#dce8ff]",
  quickHint: "text-[0.78rem] leading-[1.35] text-[#a6afc4]",
  quickActionRow: "flex flex-nowrap items-center gap-2 max-[900px]:flex-wrap",
  quickStatus:
    "inline-flex items-center gap-1.5 rounded-full border border-[#2f3a50] bg-[rgba(14,18,27,0.7)] px-[9px] py-[6px] text-[0.74rem]",
  quickStatusOn: "border-[#2e7d63] text-[#84e9c5]",
  quickStatusOff: "border-[#7b4545] text-[#ffb6b6]",
  quickStatusIcon: "size-3.5 shrink-0",
  quickApi: "text-[0.72rem] text-[#b1bdd8]",

  formGrid: "grid grid-cols-4 gap-[9px] max-[900px]:grid-cols-1",
  formGrid3: "grid grid-cols-3 gap-[9px] max-[900px]:grid-cols-1",
  formActions: "flex flex-wrap gap-2",
  mini: "text-[0.78rem] text-[#a6afc4]",

  previewStage:
    "min-h-[140px] overflow-hidden rounded-[10px] border border-dashed border-[#2f3a50] bg-[#0f131c]",
  previewImage: "block h-[220px] w-full object-contain",

  kvGrid: "grid grid-cols-2 gap-[10px] max-[900px]:grid-cols-1",
  kv: "rounded-[10px] border border-[#2f3a50] bg-[rgba(14,18,27,0.52)] p-[9px]",
  kvLabel: "mb-1 text-[0.73rem] uppercase tracking-[0.04em] text-[#a6afc4]",
  kvValue: "break-words text-[0.9rem] font-[620]",

  tableWrap: "max-h-[320px] overflow-auto rounded-[12px] border border-[#2f3a50] max-[900px]:max-h-[260px]",
  table: "min-w-[650px] w-full border-collapse",
  th: "sticky top-0 z-10 border-b border-[#2a3448] bg-[#1a2130] px-2 py-[9px] text-left text-[0.7rem] uppercase tracking-[0.04em] text-[#c3d0eb]",
  td: "border-b border-[#2a3448] px-2 py-[9px] align-top text-[0.79rem]",
  code: "break-all text-[0.76rem]",
  tableActions: "flex gap-1.5",

  logList: "max-h-[190px] overflow-auto rounded-[12px] border border-[#2f3a50] bg-[rgba(13,17,25,0.7)]",
  logLine:
    "grid grid-cols-[68px_62px_minmax(0,1fr)] items-start gap-2 border-b border-[#273043] px-[10px] py-2 text-[0.74rem] last:border-b-0",
  logCodeOk: "text-[#95f1cf]",
  logCodeErr: "text-[#ffacac]",

  inspector:
    "min-h-[210px] overflow-auto whitespace-pre-wrap rounded-[12px] border border-[#2f3a50] bg-[#0f141e] p-[10px] text-[0.78rem] leading-[1.4]",

  footerLinks: "flex flex-wrap gap-2",
  linkChip:
    "rounded-full border border-[#2f3a50] bg-[#202939] px-[10px] py-[5px] text-[0.75rem] text-[#d5ddf2] transition enabled:hover:border-[#43587e] enabled:hover:bg-[#263146] disabled:cursor-not-allowed disabled:opacity-50",
} as const;
