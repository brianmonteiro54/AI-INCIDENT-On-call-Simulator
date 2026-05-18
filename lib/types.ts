export type Severity = 0 | 1 | 2 | 3;

export type Grade = "F" | "D" | "C-" | "C" | "B-" | "B" | "A-" | "A" | "A+";

export type LogLevel = "INF" | "WRN" | "ERR" | "OK";

export interface LogLine {
  ts: string;
  lv: LogLevel;
  msg: string;
}

export interface Metric {
  label: string;
  value: string;
  cls?: "red" | "amber" | "green" | "cyan";
  delta?: string;
  deltaCls?: "up" | "down";
}

export interface TimelineEvent {
  t: string;
  ev: string;
  bad?: boolean;
  fix?: boolean;
}

export interface ActionBase {
  id: string;
  name: string;
  hint: string;
}

export interface InvestigateAction extends ActionBase {
  type: "investigate";
  reveals: string;
  timeCost: number; // seconds added
}

export interface DecisionAction extends ActionBase {
  type?: "decision";
  grade: Grade;
  costDelta: number;
  xp: number;
  verdict: string;
  sub: string;
}

export type Action = InvestigateAction | DecisionAction;

export interface Service {
  name: string;
  role: string;
  description: string;
}

export interface BossPhase {
  name: string;
  description: string;
  metrics: Metric[];
  logs: LogLine[];
  actions: DecisionAction[];
  duration: number; // seconds before auto-escalate
}

export interface Incident {
  id: string;
  sev: Severity;
  title: string;
  incId: string;
  customer: string;
  slack: string;
  desc: string;
  short: string;
  /** Optional summary from an engineering peer in Slack — helps player recall the problem at decide step */
  slackRecap?: string;
  /** Optional hint shown after 2 wrong attempts in the decide step. Should nudge, not give the answer. */
  hint?: string;
  /** Optional theory quiz shown right after the player solves the mission — reinforces a key concept. */
  quizQuestion?: {
    question: string;
    options: string[];
    correctIdx: number;
    explanation: string;
  };
  ratePerMin: number;
  initialCost: number;
  initialElapsed: number;
  minLevel: number;
  sparkType: "spike" | "flat-spike" | "slow-rise" | "exponential" | "flat" | "chaotic";
  metrics: Metric[];
  timeline: TimelineEvent[];
  logs: LogLine[];
  actions: Action[];
  rootCause: string;
  services: Service[];
  examNote: string;
  isBoss?: boolean;
  phases?: BossPhase[];
}

export interface Finding {
  title: string;
  body: string;
}

export interface IncidentResult {
  id: string;
  grade: Grade;
  xp: number;
  cost: number;
  elapsed: number;
  saved: number;
  wouldve: number;
  actionId: string;
  actionLabel: string;
  verdict: string;
  sub: string;
  at: number;
  perfect?: boolean;
  isDaily?: boolean;
}

export interface Player {
  name: string;
  xp: number;
  totalSaved: number;
  totalCost: number;
  streak: number;
  lastDailyAt: number | null;
  achievements: string[];
  soundOn: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (state: { player: Player; history: IncidentResult[] }) => boolean;
}

export interface LevelDef {
  name: string;
  min: number;
  max: number;
  perks: string;
}
