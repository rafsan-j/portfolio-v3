import type { Profile, TimelineEntry } from './types';

export const PROFILE: Profile = {
  name: 'Rafsan Jani',
  shortTitle: 'Computer Science & Engineering, SUST',
  location: 'Sylhet, Bangladesh',
  hometown: 'Dinajpur, Bangladesh',
  timezone: 'Asia/Dhaka',
  email: 'rafsan2972jani@gmail.com',
  links: {
    github: 'https://github.com/rafsan-j',
    linkedin: 'https://linkedin.com/in/rafsan-jani72',
    email: 'mailto:rafsan2972jani@gmail.com',
  },
  home: {
    eyebrow: 'Rafsan Jani · Sylhet, Bangladesh',
    headline:
      'Building offline-first Android apps, applied AI systems, and procedural visual software.',
    bio: 'I am a Computer Science and Engineering undergraduate at Shahjalal University of Science and Technology (SUST), working across Kotlin, Jetpack Compose, Python, and Three.js. My work focuses on dependable local-first software, deterministic engineering, and tactile interfaces built for real-world constraints.',
    primaryCta: { label: 'View Selected Work', href: '/work' },
    secondaryCta: { label: 'Enter 3D Studio', href: '/studio' },
    studioCallout: {
      headline: 'Step inside the rainy Sylhet desk.',
      body: 'Explore a procedural PBR Three.js workspace featuring a GLSL wet-glass rain shader, an instanced 78-keycap mechanical keyboard, a 64-district Bangladesh map, a playable 60 FPS canvas arcade, and a dual-sided page-flip hardcover notebook.',
      ctaLabel: 'Launch 3D Studio',
      caption: 'Best experienced on desktop with WebGL enabled.',
    },
  },
  about: {
    intro:
      'I grew up in Dinajpur, Bangladesh, and now study Computer Science and Engineering in Sylhet. Across mobile engineering, applied AI automation, and teaching, I care about software that stays reliable under real constraints—poor connectivity, strict rounding rules, and small screens.',
  },
  contact: {
    intro:
      'For engineering collaborations, Android or automation projects, or technical conversations, send a note below or reach out directly.',
    availability:
      'Based in Sylhet, Bangladesh (UTC+6). Open to selective Android engineering, AI automation, and technical collaboration alongside undergraduate coursework at SUST.',
  },
};

export const TIMELINE: TimelineEntry[] = [
  {
    id: 'sust-cse',
    kind: 'education',
    period: 'Current',
    title: 'B.Sc. (Engg.) in Computer Science & Engineering',
    organization: 'Shahjalal University of Science and Technology (SUST)',
    location: 'Sylhet, Bangladesh',
    districtId: 'sylhet',
    summary: 'Undergraduate student in Batch CSE-25.',
  },
  {
    id: 'waffle-up',
    kind: 'work',
    period: 'Current',
    title: 'AI & Automation Executive',
    organization: 'Waffle Up',
    location: 'Bangladesh',
    summary: 'Building AI and workflow automation systems.',
  },
  {
    id: 'tworon',
    kind: 'work',
    period: 'Current',
    title: 'STEM & Programming Instructor',
    organization: 'Tworon',
    location: 'Bangladesh',
    summary: 'Teaching STEM fundamentals and programming.',
  },
  {
    id: 'national-merit',
    kind: 'award',
    period: '2025',
    title: '17th National Merit in HSC (GPA 5.00 / 5.00)',
    organization: 'Talentpool Scholar 2025',
    location: 'Bangladesh',
    summary: 'Placed 17th nationally in HSC and previously 18th in SSC.',
  },
  {
    id: 'rcc-prefect',
    kind: 'leadership',
    period: 'Prior Leadership',
    title: 'College Prefect',
    organization: 'Rajshahi Cadet College',
    location: 'Rajshahi, Bangladesh',
    districtId: 'rajshahi',
    summary:
      'Led 297 cadets in student governance and day-to-day residential administration.',
  },
];
