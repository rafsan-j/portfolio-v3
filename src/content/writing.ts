import type { Essay } from './types';

export const ESSAYS: Essay[] = [
  {
    slug: 'why-we-avoided-sms-permissions-in-ottobudget',
    title: 'Parsing Mobile Banking Alerts on Android Without Triggering Play Protect',
    subtitle:
      'Why OttoBudget replaced READ_SMS with NotificationListenerService and a zero-schema AES-256-GCM vault.',
    excerpt:
      'How sideloaded Android finance apps get blocked by Google Play Protect when declaring SMS permissions, and how NotificationListenerService solves automated bKash, Nagad, Rocket, and bank capture cleanly.',
    publishedAt: '2026-11-12',
    readingTimeMinutes: 5,
    tags: ['android', 'architecture'],
    blocks: [
      {
        type: 'paragraph',
        content:
          'In Bangladesh, day-to-day personal spending flows through a mix of cash, bank cards, and mobile financial services like bKash, Nagad, and Rocket. Almost every transaction produces an instant alert on the phone. For an expense tracker, manual entry is the fastest way to lose user consistency—so automatic capture feels like an obvious first feature. The trap lies in how most Android prototypes try to implement it.',
      },
      {
        type: 'paragraph',
        content:
          'The traditional shortcut is declaring READ_SMS and RECEIVE_SMS in AndroidManifest.xml and running regexes over the user’s inbox. For apps distributed directly as APKs outside the Play Store—or even inside Play Store review—SMS permissions sit in Android’s highest-risk tier because OTP interception is a primary vector for financial malware. Google Play Protect actively flags and blocks internet-sideloaded APKs that request high-risk SMS permissions, stopping legitimate users at installation before they ever see the onboarding screen.',
      },
      {
        type: 'heading',
        content: 'Moving to NotificationListenerService',
      },
      {
        type: 'paragraph',
        content:
          'OttoBudget (com.OttoBudget) avoids READ_SMS and RECEIVE_SMS completely. Instead, it registers a scoped NotificationListenerService that listens only to incoming system status-bar notifications from allowlisted banking and MFS packages (or the default messaging app when an MFS alert arrives). Because the user grants notification access explicitly in Android Settings—and the APK never declares SMS read permissions—the binary stays clean under Play Protect while still capturing bKash, Nagad, Rocket, and bank alerts in real time.',
      },
      {
        type: 'code',
        language: 'kotlin',
        content: `class MfsNotificationListener : NotificationListenerService() {
    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (sbn.packageName !in ALLOWED_SOURCE_PACKAGES) return
        val extras = sbn.notification.extras
        val body = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: return
        val parsed = TransactionParser.parse(source = sbn.packageName, text = body) ?: return
        PendingLedgerQueue.enqueue(parsed) // User reviews or auto-commits to Room SQLite
    }
}`,
      },
      {
        type: 'heading',
        content: 'Keeping Local State Private with vault.enc',
      },
      {
        type: 'paragraph',
        content:
          'Once a transaction is parsed, Room SQLite remains the single local source of truth. Rather than mirroring every ledger row into normalized cloud tables—where a misconfigured policy or schema migration could leak or corrupt financial history—OttoBudget serializes its local database state, encrypts it client-side using AES-256-GCM, and uploads a single opaque blob (vault.enc) to Supabase Storage. The server never inspects amounts, categories, or notes; it only stores ciphertext.',
      },
      {
        type: 'paragraph',
        content:
          'The broader lesson applies beyond fintech: platform guardrails like Play Protect are not obstacles to work around with fragile hacks. Designing around NotificationListenerService and client-side encrypted blobs produces a simpler permission surface, fewer failure modes, and stronger privacy guarantees for the person holding the phone.',
      },
    ],
  },
  {
    slug: 'hamilton-largest-remainder-in-integer-paisa',
    title: 'Zero-Drift Shared Accounting with Integer Paisa and the Hamilton Method',
    subtitle:
      'Eliminating penny-level rounding drift in Mess Manager’s 7-term BDT balance engine.',
    excerpt:
      'Why IEEE-754 floating-point division breaks roommate trust in monthly hostel settlements, and how integer paisa plus the Largest-Remainder method keeps every period balanced to the exact paisa.',
    publishedAt: '2026-11-16',
    readingTimeMinutes: 5,
    tags: ['systems', 'android'],
    blocks: [
      {
        type: 'paragraph',
        content:
          'Shared student messes in Bangladesh run on a deceptively strict accounting cycle. Every month, residents pool bazaar deposits, log daily meals, share fixed utility bills, and settle the net payable or receivable balance in Bangladeshi Taka (৳). When total bazaar spending is divided by total meals consumed, the meal rate almost never terminates cleanly in two decimal places.',
      },
      {
        type: 'paragraph',
        content:
          'If an app computes each resident’s meal charge in Double or Float and rounds individual rows independently, the sum of member charges drifts away from the actual bazaar spent by a few paisa or taka. Even a ৳0.03 discrepancy breaks the fundamental invariant of a closed ledger: total credits must equal total debits. In shared living, a ledger that does not add up immediately undermines confidence in the manager and the tool.',
      },
      {
        type: 'heading',
        content: 'Integer Paisa First, Never Floating Point',
      },
      {
        type: 'paragraph',
        content:
          'In Mess Manager, floating-point numbers are banned from the accounting core. Every currency input is converted at the boundary into 64-bit integer paisa (1 BDT = 100 paisa). All seven terms of a resident’s period balance—opening carryover, deposits, meal share, shared fixed costs, individual adjustments, transfers, and closing settlement—are evaluated strictly in integer arithmetic.',
      },
      {
        type: 'heading',
        content: 'Deterministic Allocation via Hamilton / Largest-Remainder',
      },
      {
        type: 'paragraph',
        content:
          'To divide an integer pool of total bazaar paisa across residents proportionally to their meal counts without losing a single paisa, Mess Manager applies the Hamilton (Largest-Remainder) method. Each resident first receives the integer floor of their exact rational share. The remaining indivisible paisa—strictly fewer than the number of residents—are then distributed one paisa at a time to the members with the largest fractional remainders, using a deterministic tie-breaker on member ID.',
      },
      {
        type: 'code',
        language: 'kotlin',
        content: `data class MemberWeight(val memberId: Long, val meals: Long)

fun allocateHamiltonPaisa(totalPaisa: Long, members: List<MemberWeight>): Map<Long, Long> {
    val totalMeals = members.sumOf { it.meals }
    if (totalMeals == 0L || totalPaisa == 0L) return members.associate { it.memberId to 0L }

    val quotas = members.map { m ->
        val numerator = totalPaisa * m.meals
        Triple(m.memberId, numerator / totalMeals, numerator % totalMeals)
    }
    val remainderPaisa = (totalPaisa - quotas.sumOf { it.second }).toInt()
    val bonusIds = quotas
        .sortedWith(compareByDescending<Triple<Long, Long, Long>> { it.third }.thenBy { it.first })
        .take(remainderPaisa)
        .map { it.first }
        .toSet()

    return quotas.associate { (id, floorShare, _) ->
        id to (floorShare + if (id in bonusIds) 1L else 0L)
    }
}`,
      },
      {
        type: 'paragraph',
        content:
          'Because the sum of allocated shares is mathematically guaranteed to equal totalPaisa, every closed period reconciles to ৳0.00 variance. Pairing exact integer math with period-scoped ledgers turns monthly hostel accounting from a spreadsheet argument into a verifiable record.',
      },
    ],
  },
  {
    slug: 'isolating-threejs-from-editorial-routes',
    title: 'Keeping a 60 FPS Three.js Studio Out of Your Editorial Bundle',
    subtitle:
      'How Portfolio V4 delivers both a procedural WebGL workspace and near-zero-JS reading routes.',
    excerpt:
      'Why ambient WebGL backgrounds hurt portfolio legibility and bundle size, and how isolating Living Sylhet 3D Studio onto /studio via a static document and postMessage bridge solves both.',
    publishedAt: '2026-11-20',
    readingTimeMinutes: 4,
    tags: ['graphics', 'architecture'],
    blocks: [
      {
        type: 'paragraph',
        content:
          'Interactive 3D scenes and editorial reading surfaces want opposite things from the browser. A procedural Three.js workspace—complete with a GLSL wet-glass rain shader, an instanced 78-keycap mechanical keyboard, PBR lighting, and a 60 FPS canvas arcade—needs a dedicated WebGL context, a continuous animation loop, and full viewport ownership. An engineering case study or essay needs crisp typography, fast initial paint, low battery draw, and zero scroll hijacking.',
      },
      {
        type: 'paragraph',
        content:
          'In earlier iterations of my portfolio, bundling Three.js and React Three Fiber inside the shared Next.js application meant even text-heavy routes carried unnecessary client JavaScript and competed with navigation chrome. Worse, decorative background canvases reduce contrast behind body copy and force constant z-index firefighting between overlays, modals, and 3D hit targets.',
      },
      {
        type: 'heading',
        content: 'Dual-Surface Isolation on /studio',
      },
      {
        type: 'paragraph',
        content:
          'Portfolio V4 draws a hard architectural boundary between the two surfaces. Every editorial route (/, /work, /writing, /about, /contact) is a static Next.js Server Component tree with zero Three.js, zero React Three Fiber, and zero framer-motion in its JavaScript chunks. Meanwhile, Living Sylhet 3D Studio lives exclusively at /studio as a self-contained static document (public/studio-scene.html) mounted in a full-viewport same-origin iframe.',
      },
      {
        type: 'code',
        language: 'ts',
        content: `// StudioViewport.tsx — minimal same-origin keyboard bridge
useEffect(() => {
  const onMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === 'STUDIO_EXIT') router.push('/');
    if (event.data?.type === 'STUDIO_OPEN_CMDK') {
      window.dispatchEvent(new CustomEvent('open-command-palette'));
    }
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}, [router]);`,
      },
      {
        type: 'heading',
        content: 'Chrome Suppression Without Losing Navigation',
      },
      {
        type: 'paragraph',
        content:
          'When pathname equals /studio, ShellChrome suppresses the Top Status Bar, the bottom Concentric Floating Capsule Dock, and the Footer so the 3D desk owns 100dvh × 100vw. A single unobstructed top-center Obsidian pill ("← Back to Editorial") and the 8-line postMessage bridge for Escape and ⌘K keep navigation seamless without leaking a single kilobyte of WebGL code into the rest of the site.',
      },
    ],
  },
];

export function getEssayBySlug(slug: string): Essay | undefined {
  return ESSAYS.find((e) => e.slug === slug);
}

export function getPublishedEssays(): Essay[] {
  return [...ESSAYS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
