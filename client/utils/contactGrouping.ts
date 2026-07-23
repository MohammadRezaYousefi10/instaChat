// client/utils/contactGrouping.ts
import { DeviceContact } from "@/types";

export interface ContactSection {
  key: string;
  letter: string; // "A".."Z" یا "#"
  groupTitle?: string; // فقط روی اولین سکشن هر گروه ست میشه
  data: DeviceContact[];
}

function getGroupLetter(name: string): string {
  const first = name.trim().charAt(0).toUpperCase();
  return /^[A-Z]$/.test(first) ? first : "#"; // غیر انگلیسی → #
}

function buildSections(
  contacts: DeviceContact[],
  groupTitle: string,
  keyPrefix: string
): ContactSection[] {
  const byLetter = new Map<string, DeviceContact[]>();

  for (const c of contacts) {
    const letter = getGroupLetter(c.name);
    if (!byLetter.has(letter)) byLetter.set(letter, []);
    byLetter.get(letter)!.push(c);
  }

  const letters = Array.from(byLetter.keys()).sort((a, b) => {
    if (a === "#") return 1; // # همیشه آخر
    if (b === "#") return -1;
    return a.localeCompare(b);
  });

  return letters.map((letter, idx) => ({
    key: `${keyPrefix}-${letter}`,
    letter,
    groupTitle: idx === 0 ? groupTitle : undefined,
    data: byLetter.get(letter)!.sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export function buildContactSections(contacts: DeviceContact[]): ContactSection[] {
  const registered = contacts.filter((c) => c.registered);
  const notRegistered = contacts.filter((c) => !c.registered);

  return [
    ...buildSections(registered, "Contacts on InstaChat", "reg"),
    ...buildSections(notRegistered, "Invite to InstaChat", "inv"),
  ];
}