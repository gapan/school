export interface FactStats {
  right: number;
  wrong: number;
}

interface Data {
  // Best stars per stage, keyed as "<level>-<stage>".
  stars: Record<string, number>;
  // First-try results per fact (for the parent corner and for picking weak facts more often).
  facts: Record<string, FactStats>;
  unlockAll: boolean;
  // Best score per extra game.
  records: Record<string, number>;
  // Older multiplication saves also kept the sound setting here.
  sound?: boolean;
}

export type Progress = ReturnType<typeof createProgress>;

const defaults = (): Data => ({ stars: {}, facts: {}, unlockAll: false, records: {} });

function read<T>(key: string): Partial<T> | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<T>) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode etc.): progress lasts for this visit only.
  }
}

// Each activity keeps its own progress under its own localStorage key.
export function createProgress(key: string) {
  let cache: Data | null = null;
  const load = (): Data => (cache ??= { ...defaults(), ...read<Data>(key) });
  const save = () => write(key, load());

  return {
    getStars(level: string | number, stage: string): number {
      return load().stars[`${level}-${stage}`] ?? 0;
    },
    recordStars(level: string | number, stage: string, stars: number): void {
      const p = load();
      const k = `${level}-${stage}`;
      p.stars[k] = Math.max(p.stars[k] ?? 0, stars);
      save();
    },
    totalStars(): number {
      return Object.values(load().stars).reduce((a, b) => a + b, 0);
    },
    recordFact(fact: string, firstTry: boolean): void {
      const f = (load().facts[fact] ??= { right: 0, wrong: 0 });
      if (firstTry) f.right++;
      else f.wrong++;
      save();
    },
    getFact(fact: string): FactStats {
      return load().facts[fact] ?? { right: 0, wrong: 0 };
    },
    isUnlockAll(): boolean {
      return load().unlockAll;
    },
    setUnlockAll(on: boolean): void {
      load().unlockAll = on;
      save();
    },
    getRecord(game: string): number | undefined {
      return load().records[game];
    },
    // Stores the score if it beats the old record; returns true when it does.
    saveRecord(game: string, score: number, lowerIsBetter = false): boolean {
      const p = load();
      const old = p.records[game];
      if (old !== undefined && (lowerIsBetter ? score >= old : score <= old)) return false;
      p.records[game] = score;
      save();
      return true;
    },
    // Start this activity from scratch: clears stars, stickers, fact stats and records.
    reset(): void {
      cache = defaults();
      save();
    },
  };
}

// Settings shared by every activity.
const SETTINGS_KEY = 'school:settings:v1';
let sound: boolean | undefined;

export function isSoundOn(): boolean {
  // Before there were several activities, the sound setting lived in the multiplication save.
  sound ??= read<{ sound: boolean }>(SETTINGS_KEY)?.sound ?? read<Data>('multiplication-kingdom:v1')?.sound ?? true;
  return sound;
}

export function setSound(on: boolean): void {
  sound = on;
  write(SETTINGS_KEY, { sound });
}
