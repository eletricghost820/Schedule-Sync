export type PeriodId =
  | "01"
  | "02"
  | "03"
  | "HR"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09";

export const PERIOD_ORDER: PeriodId[] = [
  "01",
  "02",
  "03",
  "HR",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
];

/** Abel Nielsen's bell schedule — reference times for all students. */
export const BELL_TIMES: Record<PeriodId, string> = {
  "01": "8:10–8:52 AM",
  "02": "8:57–9:39 AM",
  "03": "9:44–10:26 AM",
  HR: "10:31–10:41 AM",
  "04": "10:46–11:28 AM",
  "05": "11:33 AM–12:15 PM",
  "06": "12:20–1:02 PM",
  "07": "1:07–1:49 PM",
  "08": "1:54–2:36 PM",
  "09": "2:41–3:23 PM",
};

export const PERIOD_LABEL: Record<PeriodId, string> = {
  "01": "Per 01",
  "02": "Per 02",
  "03": "Per 03",
  HR: "Homeroom",
  "04": "Per 04",
  "05": "Per 05",
  "06": "Per 06",
  "07": "Per 07",
  "08": "Per 08",
  "09": "Per 09",
};

export const PERIOD_SHORT: Record<PeriodId, string> = {
  "01": "1",
  "02": "2",
  "03": "3",
  HR: "HR",
  "04": "4",
  "05": "5",
  "06": "6",
  "07": "7",
  "08": "8",
  "09": "9",
};

export type Slot = {
  className: string;
  teacher: string;
  room: string;
  days?: string;
  alt?: { className: string; teacher: string; room: string; days: string };
};

export type Student = {
  id: string;
  name: string;
  initials: string;
  counselor?: string;
  slots: Partial<Record<PeriodId, Slot>>;
};

export const FREE_KEYWORDS = ["lunch", "study hall"];

function free(name: string) {
  return FREE_KEYWORDS.some((k) => name.toLowerCase().includes(k));
}

/** Free if any arrangement that period is Lunch or Study Hall. */
export function isFree(slot?: Slot): boolean {
  if (!slot) return true;
  return free(slot.className) || (slot.alt ? free(slot.alt.className) : false);
}

/** Free only on some days of the week. */
export function isPartiallyFree(slot?: Slot): boolean {
  if (!slot || !slot.alt) return false;
  return free(slot.className) !== free(slot.alt.className);
}

export const STUDENTS: Student[] = [
  {
    id: "abel-nielsen",
    name: "Abel Nielsen",
    initials: "AN",
    slots: {
      "01": { className: "English 9", teacher: "Graham, Sally", room: "Rm 2220" },
      "02": {
        className: "Study Hall",
        teacher: "Przekota",
        room: "Rm 3160",
        days: "Mon/Thu",
        alt: { className: "Biology", teacher: "Serafini", room: "Rm 2405", days: "Tue/Fri" },
      },
      "03": {
        className: "Biology",
        teacher: "Serafini",
        room: "Rm 2405",
        days: "Mon/Thu",
        alt: { className: "Study Hall", teacher: "Przekota", room: "Rm 3160", days: "Tue/Fri" },
      },
      HR: { className: "Homeroom", teacher: "White, Tenesha", room: "Rm 3155" },
      "04": { className: "Modern World History", teacher: "Lapin, Maxine", room: "Rm 3130" },
      "05": { className: "Alg 1", teacher: "Bartels, Suzanne", room: "Rm 3195" },
      "06": { className: "Lunch", teacher: "Staff", room: "Cafe" },
      "07": { className: "Physical Ed 9", teacher: "Wittleder, William", room: "Gym" },
      "08": { className: "Concert Orchestra", teacher: "Frakes, Natalie", room: "Rm 1705" },
      "09": { className: "AVID 09", teacher: "Heller, Lisa", room: "Rm 2150" },
    },
  },
  {
    id: "jackson-tritt",
    name: "Jackson Tritt",
    initials: "JT",
    slots: {
      "01": { className: "English 9", teacher: "Stosovic, Tijana", room: "Rm 2225" },
      "02": { className: "Modern World History", teacher: "Kokoris, Christina", room: "Rm 2235" },
      "03": { className: "Lunch", teacher: "Staff", room: "Cafe" },
      HR: { className: "Homeroom", teacher: "Guerin, Tyler", room: "Rm 1175" },
      "04": { className: "Biology Hon", teacher: "Fortune, Kathleen", room: "Rm 2420" },
      "05": {
        className: "Biology Hon",
        teacher: "Fortune, Kathleen",
        room: "Rm 2420",
        days: "Wed/Fri",
        alt: { className: "Study Hall", teacher: "—", room: "So Lobby", days: "Mon/Tue/Thu" },
      },
      "06": { className: "AVID 09", teacher: "Heller, Lisa", room: "Rm 2150" },
      "07": { className: "Alg 1", teacher: "Bressler, Kathleen", room: "Rm 3215" },
      "08": { className: "Concert Orchestra", teacher: "Frakes, Natalie", room: "Rm 1705" },
      "09": { className: "Physical Ed 9", teacher: "Reynolds, Nicole", room: "Gym" },
    },
  },
  {
    id: "alexander-king",
    name: "Alexander King",
    initials: "AK",
    slots: {
      "01": { className: "Physical Ed 9", teacher: "Moran, Thomas", room: "Gym" },
      "02": { className: "Business & Tech 1", teacher: "Lastovich, John", room: "Rm 1505" },
      "03": { className: "English 9", teacher: "Ukomadu, Tenesha", room: "Rm 1160" },
      HR: { className: "Homeroom", teacher: "Cherry, Jonda L", room: "Rm 1185" },
      "04": { className: "Lunch", teacher: "Staff", room: "Cafe" },
      "05": { className: "Philharmonic Orchestra", teacher: "Frakes, Natalie", room: "Rm 1705" },
      "06": { className: "Alg 1", teacher: "Bartels, Suzanne", room: "Rm 3195" },
      "07": { className: "Biology Hon", teacher: "Page, Michael", room: "Rm 1410" },
      "08": {
        className: "Biology Hon",
        teacher: "Page, Michael",
        room: "Rm 1410",
        days: "Tue/Wed/Fri",
        alt: { className: "Study Hall", teacher: "—", room: "So Lobby", days: "Mon/Thu" },
      },
      "09": { className: "Modern World History", teacher: "Williams, Preston", room: "Rm 3120" },
    },
  },
  {
    id: "usman-maniya",
    name: "Usman Maniya",
    initials: "UM",
    slots: {
      "01": { className: "Modern World History", teacher: "Reyes, Martin", room: "Rm 3120" },
      "02": { className: "English 9", teacher: "Graham, Sally", room: "Rm 2220" },
      "03": { className: "Automotive Technology 1", teacher: "Thomas, Kyle", room: "Rm 1523" },
      HR: { className: "Homeroom", teacher: "Wiemer, Matthew", room: "—" },
      "04": { className: "Biology Hon", teacher: "Fortune, Kathleen", room: "Rm 2420" },
      "05": { className: "Study Hall", teacher: "—", room: "So Lobby", days: "varies by day" },
      "06": { className: "Lunch", teacher: "Staff", room: "Cafe" },
      "07": { className: "Physical Ed 9", teacher: "Reynolds, Nicole", room: "Gym" },
      "08": { className: "Alg 1", teacher: "Vana, John", room: "Rm 3180" },
      "09": {
        className: "AP Computer Science Principles",
        teacher: "Mosier, Amber",
        room: "Rm 1300",
      },
    },
  },
  {
    id: "aasim-ali",
    name: "Aasim Ali",
    initials: "AA",
    slots: {
      "01": { className: "Biology", teacher: "Rankic, Sandra", room: "Rm 2405" },
      "02": {
        className: "Study Hall",
        teacher: "—",
        room: "So Lobby (1750)",
        days: "Mon/Tue/Thu",
        alt: { className: "Biology", teacher: "Rankic, Sandra", room: "Rm 2405", days: "Wed/Fri" },
      },
      "03": { className: "Business & Tech 1", teacher: "Lastovich, John", room: "Rm 1505" },
      HR: { className: "Homeroom", teacher: "Williams, Preston", room: "—" },
      "04": { className: "Modern World History", teacher: "Torres, Paul", room: "Rm 3005" },
      "05": { className: "English 9", teacher: "Feiereisel, Ronald", room: "Rm 1025" },
      "06": { className: "Lunch", teacher: "Staff", room: "Cafe" },
      "07": { className: "Physical Ed 9", teacher: "Reynolds, Nicole", room: "Gym" },
      "08": { className: "Alg 1", teacher: "Vana, John", room: "Rm 3180" },
      "09": { className: "Spanish 2", teacher: "Travis, Emma", room: "Rm 3140" },
    },
  },
  {
    id: "aaron-powell",
    name: "Aaron Powell",
    initials: "AP",
    slots: {
      "01": { className: "English 9", teacher: "Iqbal, Saima", room: "Rm 1199" },
      "02": { className: "Physical Ed 9", teacher: "Moran, Thomas", room: "Gym" },
      "03": { className: "Lunch", teacher: "Staff", room: "Cafe" },
      HR: { className: "Homeroom", teacher: "Block, Matthew", room: "—" },
      "04": { className: "IED-PLTW", teacher: "Pros, Christopher", room: "Rm 1520" },
      "05": { className: "AP World History: Modern", teacher: "Johnson, Melanie", room: "Rm 2035" },
      "06": { className: "Alg 2 Hon", teacher: "Rauser, Lynne", room: "Rm 3185" },
      "07": { className: "Biology Hon", teacher: "Page, Michael", room: "Rm 1410" },
      "08": {
        className: "Biology Hon",
        teacher: "Page, Michael",
        room: "Rm 1410",
        days: "Wed/Fri",
        alt: {
          className: "Frosh Study Hall",
          teacher: "—",
          room: "So Lobby",
          days: "Mon/Tue/Thu",
        },
      },
      "09": { className: "French 1", teacher: "Nimtz, Catherine", room: "Rm 3010" },
    },
  },
  {
    id: "aariz-fazili",
    name: "Aariz Fazili",
    initials: "AF",
    counselor: "Green, Carla Morgan",
    slots: {
      "01": { className: "Reading 9", teacher: "Nageeb, Maheen", room: "Rm 1195" },
      "02": { className: "Modern World History", teacher: "Kokoris, Christina", room: "Rm 2235" },
      "03": { className: "Alg 1", teacher: "White, Tenesha", room: "Rm 3155" },
      HR: { className: "Homeroom", teacher: "Jackson, Kristen", room: "Rm 1165" },
      "04": { className: "Spanish 1", teacher: "Heintzelman, Carmela", room: "Rm 2320" },
      "05": { className: "English 9", teacher: "Feiereisel, Ronald", room: "Rm 1025" },
      "06": { className: "Lunch", teacher: "Staff", room: "Cafe" },
      "07": { className: "Biology", teacher: "Fortune, Kathleen", room: "Rm 2415" },
      "08": { className: "Frosh Study Hall", teacher: "—", room: "Rm 1750" },
      "09": { className: "Physical Ed 9", teacher: "Shemroske, Samuel", room: "Gym" },
    },
  },
  {
    id: "zachary-king",
    name: "Zachary King",
    initials: "ZK",
    counselor: "Romack, Kathleen",
    slots: {
      "01": { className: "Alg 1", teacher: "White, Tenesha", room: "Rm 3155" },
      "02": { className: "Spanish 1", teacher: "Heintzelman, Carmela", room: "Rm 2320" },
      "03": { className: "Modern World History", teacher: "Torres, Paul", room: "Rm 3015" },
      HR: { className: "Homeroom", teacher: "Aichholzer, Haley Demerise", room: "Rm 1010" },
      "04": { className: "Lunch", teacher: "Staff", room: "Cafe" },
      "05": {
        className: "Frosh Study Hall",
        teacher: "—",
        room: "So Lobby (Mon) / Rm 1750 (Wed,Fri)",
        days: "Mon/Wed/Fri",
        alt: { className: "Biology Hon", teacher: "Schram, Susan", room: "Rm 1430", days: "Tue/Thu" },
      },
      "06": { className: "Biology Hon", teacher: "Schram, Susan", room: "Rm 1430" },
      "07": { className: "Business & Tech 1", teacher: "Khasho, Raymond", room: "Rm 1315" },
      "08": { className: "English 9", teacher: "Ukomadu, Tenesha", room: "Rm 1160" },
      "09": { className: "Physical Ed 9", teacher: "Shemroske, Samuel", room: "Gym" },
    },
  },
  {
    id: "subhan-nadim",
    name: "Subhan Nadim",
    initials: "SN",
    slots: {
      "01": { className: "Modern World History", teacher: "Williams, Preston", room: "Rm 2035" },
      "02": { className: "German 1", teacher: "Mayschak, Charles", room: "Rm 2199" },
      "03": { className: "Physical Ed 9", teacher: "Wittleder, William", room: "Gym" },
      HR: { className: "Homeroom", teacher: "Tran, Sabrina", room: "Rm 3420" },
      "04": { className: "English 9", teacher: "Ukomadu, Tenesha", room: "Rm 1160" },
      "05": { className: "Lunch", teacher: "Staff", room: "Cafe" },
      "06": { className: "Geometry Adv", teacher: "DeFelice, Sean", room: "Rm 3155" },
      "07": { className: "Biology Hon", teacher: "Barnett, Chris", room: "Rm 2410" },
      "08": {
        className: "Biology Hon",
        teacher: "Barnett, Chris",
        room: "Rm 2410",
        days: "Wed/Fri",
        alt: {
          className: "Frosh Study Hall",
          teacher: "—",
          room: "So Lobby",
          days: "Mon/Tue/Thu",
        },
      },
      "09": { className: "AVID 09", teacher: "Heller, Lisa", room: "Rm 2150" },
    },
  },
];


export function getStudent(id: string) {
  return STUDENTS.find((s) => s.id === id);
}

export function classKey(name: string) {
  return name.trim().toLowerCase();
}

export const WEDNESDAY_NOTE =
  "Wednesday runs a shortened, shifted bell schedule — school starts later and periods are compressed. Times shown here are the standard Mon/Tue/Thu/Fri bells.";