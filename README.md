# Bookkeeping for First-Timers

An interactive English/Filipino guide that teaches self-employed Filipinos and micro business owners how to keep BIR books of accounts and documents. Made by **@missniceph (“Nice to Know”)**.

- Plain HTML, CSS and JavaScript. No build step, no backend, no tracking, no outside fonts or scripts.
- Anything typed into the practice tools stays in the page. Progress is saved only in the reader’s browser (and the site still works if the browser blocks saving).
- **General information only, not tax or accounting advice. Your RDO will confirm which books you need.** Content is as of November 2026.

---

## What’s here and how to update it

**What’s here:** a home page, 9 short modules, a 404 (“page not found”) page, and the shared files that every page uses. Every page has an EN/FIL switch, light/dark mode, a progress tracker, the disclaimer, “As of November 2026”, and a footer link to instagram.com/missniceph.

**Most common updates:**

| I want to… | Edit this |
|---|---|
| Change a sentence on a page | That page’s `.html` file. Change the `lang="en"` **and** `lang="fil"` versions (see “How to edit text and translations” below). |
| Fill in a `[To confirm]` item | Search for `[To confirm]` — see the table further down for where each one is. |
| Change the disclaimer, the “As of” date, or the Instagram link | `assets/js/app.js`, in the part called `buildFooter`. |
| Rename a module | The `MODULES` list near the top of `assets/js/app.js` **and** the `<h1>` and `<title>` of that module’s page. |
| Add or change a practice transaction | `assets/js/lab-data.js` (see “How to add or change practice transactions”). |
| Change a color | The top of `assets/css/style.css` (light colors first, dark-mode colors right after). |
| Change the link-preview text for a page | That page’s `<title>`, `<meta name="description">` and the matching `og:title` / `og:description` lines in its `<head>`. |
| Change the link-preview picture | Edit `assets/img/share-card.svg` (it’s plain text), then make a new 1200×630 PNG from it and save it as `assets/img/share-card.png` (any “SVG to PNG” tool works, or ask Claude). |

**Things that depend on the web address.** The link previews and the 404 page assume the site lives at `https://missniceph.github.io/bookkeeping-guide/`. If you rename the repository or use your own domain, search all files for `missniceph.github.io/bookkeeping-guide` and `/bookkeeping-guide/` and update them.

**After any change**, open the page on your phone, tap EN and FIL, and switch light/dark once to check it still looks right.

---

## The files

| File | What it is |
|---|---|
| `index.html` | Home page with the module list |
| `start-here.html` | Module 1: Start here |
| `documents.html` | Module 2: Documents 101 (has the “Do I need to issue an invoice?” checker) |
| `your-books.html` | Module 3: Your books |
| `recording.html` | Module 4: Recording transactions (has the quick debit/credit quiz) |
| `practice-lab.html` | Module 5: Practice lab (Ana’s 10 transactions) |
| `routine.html` | Module 6: Month-end and quarter-end routine (has the cash reconciliation helper) |
| `keeping-records.html` | Module 7: Keeping records (has the file-name maker) |
| `glossary.html` | Module 8: Glossary (30 terms) |
| `checklists.html` | Module 9: Printable checklists |
| `404.html` | “Page not found” page that GitHub Pages shows for broken links |
| `favicon.svg`, `apple-touch-icon.png` | Browser-tab icon and phone home-screen icon |
| `assets/img/share-card.svg` / `.png` | Link-preview picture for Facebook, Messenger, X, etc. (the SVG is the editable source) |
| `assets/css/style.css` | All colors and layout (light and dark mode) |
| `assets/js/app.js` | Shared parts: header, EN/FIL switch, dark mode, progress, Back/Next, **disclaimer footer** |
| `assets/js/lab-data.js` | **The practice lab’s transactions and answer key** |
| `assets/js/lab.js` | The practice lab’s checking and posting logic (you normally don’t need to touch this) |

---

## How to put it online (GitHub Pages)

1. On GitHub, open the repository → **Settings** → **Pages**.
2. Under “Build and deployment”, choose **Deploy from a branch**.
3. Pick the branch (for example `main`) and the folder **/ (root)**, then **Save**.
4. After a minute, the site appears at `https://<your-username>.github.io/bookkeeping-guide/`.

To preview on your own computer, just double-click `index.html` to open it in a browser.

---

## How to edit text and translations

Every piece of text is written **twice, side by side**: once in English, once in Filipino. The page shows only the language the reader picked.

```html
<p lang="en">Keep every 2307 with your records.</p>
<p lang="fil">Itago ang bawat 2307 kasama ng records mo.</p>
```

- `lang="en"` = English, `lang="fil"` = Filipino.
- To change a sentence, find it (Ctrl+F / Cmd+F in any text editor, or GitHub’s pencil ✏️ “Edit” button) and change the words between `>` and `</`.
- **Always edit both versions** so the two languages say the same thing.
- Short bits inside a sentence use `<span>` instead of `<p>`:
  `<span lang="en">Next</span><span lang="fil">Susunod</span>`
- Lists work the same way: one `<ul lang="en">…</ul>` and one `<ul lang="fil">…</ul>`.

**Text that lives in JavaScript files** (same idea, different look):

- Header, footer and **disclaimer**: in `assets/js/app.js`, look for `b('English text', 'Filipino text')`. The disclaimer and “As of November 2026” are in the `buildFooter` section — change the date there when you update the content.
- Module names (used in Back/Next buttons and the progress tracker): the `MODULES` list near the top of `assets/js/app.js`.
- Practice lab stories, hints and explanations: `assets/js/lab-data.js` (`en:` and `fil:` fields).

Tip: keep the curly apostrophe `’` or use `\’` inside JavaScript text. A plain `'` inside `'…'` will break the page.

### BIR rules and their sources

Each BIR rule sits in a box like this, with its source shown in small text:

```html
<div class="rule">
  <p lang="en">Rule in English…</p>
  <p lang="fil">Rule in Filipino…</p>
  <span class="src">RA 11976</span>
</div>
```

The word “Source:” / “Batayan:” is added automatically. Only add rules you have checked against an official issuance.

---

## How to fill in the [To confirm] items

Every placeholder is marked with `class="tbc"` and the text `[To confirm]`. To find them all, search the project for **`[To confirm]`** (on GitHub: press `.` to open the web editor, then use the search icon).

To fill one in, replace the placeholder with the real information in **both** languages and add the source. For example, this:

```html
<p><span class="tbc">[To confirm]</span> <span lang="en">Registration deadlines for manual and loose-leaf books.</span><span lang="fil">Mga deadline ng registration…</span></p>
```

could become:

```html
<div class="rule">
  <p lang="en">Manual and loose-leaf books must be registered … (your confirmed rule).</p>
  <p lang="fil">… (Filipino version).</p>
  <span class="src">RR/RMC number here</span>
</div>
```

For rules whose source is still unknown, the source shows as `<span class="src"><span class="tbc">[To confirm]</span></span>` — just replace the inner `<span class="tbc">[To confirm]</span>` with the issuance name.

### Every placeholder left, and where it is

| # | What needs confirming | Where |
|---|---|---|
| 1 | Exact set of journals/ledgers your RDO requires for non-VAT service businesses (commonly General Journal, General Ledger, Cash Receipts Journal, Cash Disbursements Journal) | `your-books.html` (“Which books…” section and ORUS step 1) |
| 2 | Complete list of information required on a non-VAT invoice (RR 7-2024 Section 6(B)) | `documents.html` (“What must an invoice show?”) |
| 3 | Registration deadlines for manual and loose-leaf books | `your-books.html` (ORUS section); `checklists.html` (Yearly) |
| 4 | When books or financial statements must be audited by a CPA | `your-books.html` (“Do my books need a CPA audit?”); `checklists.html` (Yearly) |
| 5 | Authority to Print (ATP) and e-invoicing requirements | `documents.html` (“Printing your invoices…”) |
| 6 | Source issuance for: “every business taxpayer, including freelancers, must keep books” | `start-here.html`; `glossary.html` (Books of accounts) |
| 7 | Source issuance for: “keeping two or more sets of books is not allowed” | `start-here.html`; `your-books.html` |
| 8 | Source issuance for: the three book formats (manual, loose-leaf with Permit to Use, computerized) | `your-books.html`; `glossary.html` (Loose-leaf books) |

Items 6–8 are rules from the fact base that came without a specific issuance, so their **source** is shown as [To confirm].

**Not covered on purpose** (the site says so where relevant): filing deadlines, which return form applies, how to fill out returns, withholding rates, and how equipment cost is spread over the years.

---

## How to add or change practice transactions

Open `assets/js/lab-data.js`. Each transaction looks like this:

```js
{
  id: 4, date: '2026-11-07',
  en: 'Ana pays her monthly internet bill of ₱1,699 from the business account.',
  fil: 'Binayaran ni Ana ang buwanang internet bill na ₱1,699 mula sa business account.',
  doc: { en: 'Document: …', fil: 'Dokumento: …' },
  hint: { en: 'Short clue…', fil: 'Maikling clue…' },
  explain: { en: 'Why the answer is right…', fil: 'Bakit tama ang sagot…' },
  lines: [ { acct: 'internet', dr: 1699 }, { acct: 'cash', cr: 1699 } ]
},
```

To add one:

1. Copy a whole `{ … },` block and paste it at the end of the `transactions` list.
2. Give it the next `id` number (11, 12, …) and a date in `YYYY-MM-DD` form, in date order.
3. Write the story, document, hint and explanation in both languages.
4. Write the answer in `lines`. Each line is one account with **either** `dr:` (debit) **or** `cr:` (credit). Amounts are plain numbers: `1699`, not `'₱1,699'`.
5. **Total debits must equal total credits.** If they don’t, the lab page shows a red “Answer key problem” box telling you which transaction is wrong.
6. Up to 4 lines per transaction (the entry form allows 4).

Account ids you can use are in the `accounts` list at the top of the same file (`cash`, `cwt`, `equipment`, `capital`, `drawings`, `income`, `internet`, `software`, `supplies`, `transport`, plus `ar`, `ap`, `rent` used as wrong-answer distractors). To add a new account, copy one line, give it a new `id`, a `type` (`asset`, `liability`, `equity`, `drawings`, `income` or `expense`), and an English and Filipino name. The type decides which side makes it go up and how it is totaled at month-end.

If you change Ana’s transactions, also update the numbers mentioned in the page text: `start-here.html` (Ana’s November gross receipts, ₱28,450) and the “Common mistakes in this lab” box in `practice-lab.html`.

**Current answer key** (cash basis, non-VAT, all amounts fictional):

| # | Transaction | Debit | Credit |
|---|---|---|---|
| 1 | Owner puts in ₱30,000 | Cash 30,000 | Owner’s Capital 30,000 |
| 2 | Buys drawing tablet | Equipment 12,000 | Cash 12,000 |
| 3 | Logo project paid | Cash 8,000 | Service Income 8,000 |
| 4 | Internet bill | Internet Expense 1,699 | Cash 1,699 |
| 5 | Software subscription | Software Subscription Expense 1,200 | Cash 1,200 |
| 6 | Client withholds tax, gives 2307 | Cash 19,000 + Creditable Withholding Tax 1,000 | Service Income 20,000 |
| 7 | Owner withdraws cash | Owner’s Drawings 5,000 | Cash 5,000 |
| 8 | Printer ink and paper | Office Supplies Expense 850 | Cash 850 |
| 9 | Small ₱450 banner sale | Cash 450 | Service Income 450 |
| 10 | Ride to client meeting | Transportation Expense 320 | Cash 320 |

Month-end: gross receipts ₱28,450; expenses ₱4,069; cash ₱36,381; tax withheld ₱1,000; trial balance ₱58,450 = ₱58,450.

---

## Design notes

- Colors are set once at the top of `assets/css/style.css` (`:root`), with a dark-mode set right below. Change a color there and it changes everywhere.
- Illustrations are simple shapes drawn in SVG inside the pages. No photos, stock or AI images, and no BIR forms, logos or official document designs.
- The site is not affiliated with the BIR.
