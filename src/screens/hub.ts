import { t } from '../strings';
import { mascot } from '../ui/mascot';
import { soundToggle } from '../ui/soundToggle';
import type { Subject } from '../catalog';

function card(href: string, icon: string, title: string, subtitle: string): string {
  return `
    <a class="stage-card" href="${href}">
      <span class="stage-icon hub-icon">${icon}</span>
      <span class="stage-text"><strong>${title}</strong><small>${subtitle}</small></span>
    </a>`;
}

function page(header: string, greeting: string, cards: string): string {
  return `
    <header class="topbar">${header}${soundToggle()}</header>
    <section class="hero">
      ${mascot('happy', 120)}
      <p class="bubble">${greeting}</p>
    </section>
    <section class="stages">${cards}</section>`;
}

export function renderSubjects(subjects: Subject[]): string {
  return page(
    `<h1 class="title">${t.hubTitle}</h1>`,
    t.hubGreeting,
    subjects.map((s) => card(`#/${s.id}`, s.icon, s.title, s.subtitle)).join(''),
  );
}

export function renderSubject(subject: Subject): string {
  return page(
    `<a class="btn btn--small" href="#/">← ${t.back}</a><h1 class="title">${subject.title}</h1>`,
    t.subjectGreeting,
    subject.activities.map((a) => card(`#/${subject.id}/${a.id}`, a.icon, a.title, a.subtitle)).join(''),
  );
}
