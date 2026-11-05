/* Practice lab data — Ana's November 2026 (FICTIONAL business, made-up amounts)
   How to add or change a practice transaction: see README.md, section "Add practice transactions".

   Rules for every transaction:
   - "lines" is the correct journal entry (the answer key).
   - Each line has an account id (from "accounts" below) and EITHER dr (debit) OR cr (credit).
   - Total debits MUST equal total credits. The page checks this and warns you if they don't.
   - Amounts are in pesos, numbers only (no ₱ sign, no commas).
*/
window.LAB_DATA = {
  /* Account types decide which side makes an account go UP:
     asset, expense, drawings → go up with a DEBIT
     equity, income, liability → go up with a CREDIT */
  accounts: [
    { id: 'cash',      type: 'asset',     en: 'Cash',                         fil: 'Cash (pera sa wallet, bangko at e-wallet)' },
    { id: 'ar',        type: 'asset',     en: 'Accounts Receivable',          fil: 'Accounts Receivable (pautang ng kliyente sa iyo)',
      notUsed: { en: 'Ana uses the cash basis and every client in this lab paid right away, so nothing is owed to her.',
                 fil: 'Cash basis si Ana at lahat ng kliyente sa lab na ito ay nagbayad agad, kaya walang utang sa kanya.' } },
    { id: 'cwt',       type: 'asset',     en: 'Creditable Withholding Tax',   fil: 'Creditable Withholding Tax (buwis na kinaltas ng kliyente, may 2307)' },
    { id: 'equipment', type: 'asset',     en: 'Equipment',                    fil: 'Equipment (gamit na pangmatagalan, gaya ng gadget)' },
    { id: 'ap',        type: 'liability', en: 'Accounts Payable',             fil: 'Accounts Payable (utang mo sa supplier)',
      notUsed: { en: 'Ana paid in full right away, so she doesn’t owe anyone.',
                 fil: 'Binayaran agad ni Ana nang buo, kaya wala siyang utang.' } },
    { id: 'capital',   type: 'equity',    en: 'Owner’s Capital',              fil: 'Owner’s Capital (puhunan ng may-ari)' },
    { id: 'drawings',  type: 'drawings',  en: 'Owner’s Drawings',             fil: 'Owner’s Drawings (perang kinuha ng may-ari para sa sarili)' },
    { id: 'income',    type: 'income',    en: 'Service Income',               fil: 'Service Income (kita mula sa serbisyo)' },
    { id: 'internet',  type: 'expense',   en: 'Internet Expense',             fil: 'Internet Expense (gastos sa internet)' },
    { id: 'software',  type: 'expense',   en: 'Software Subscription Expense', fil: 'Software Subscription Expense (gastos sa app/software)' },
    { id: 'supplies',  type: 'expense',   en: 'Office Supplies Expense',      fil: 'Office Supplies Expense (gastos sa supplies)' },
    { id: 'transport', type: 'expense',   en: 'Transportation Expense',       fil: 'Transportation Expense (pamasahe/biyahe)' },
    { id: 'rent',      type: 'expense',   en: 'Rent Expense',                 fil: 'Rent Expense (upa)',
      notUsed: { en: 'Ana works from home and pays no rent for the business this month.',
                 fil: 'Sa bahay nagtatrabaho si Ana at walang binayarang upa para sa negosyo ngayong buwan.' } }
  ],

  transactions: [
    {
      id: 1, date: '2026-11-01',
      en: 'Ana moves ₱30,000 of her personal savings into a separate bank account just for her design business.',
      fil: 'Inilipat ni Ana ang ₱30,000 mula sa personal savings niya papunta sa hiwalay na bank account para lang sa design business niya.',
      doc: { en: 'Document: bank deposit slip / transfer confirmation.', fil: 'Dokumento: deposit slip o transfer confirmation.' },
      hint: { en: 'Her business gets cash. Where did it come from? From the owner — that’s capital, not income.',
              fil: 'Nagkaroon ng cash ang negosyo. Saan galing? Sa may-ari — puhunan (capital) iyon, hindi kita.' },
      explain: { en: 'Cash (asset) goes up → debit. Owner’s Capital goes up → credit. Putting in your own money is NOT income, so it is not part of gross sales/receipts.',
                 fil: 'Tumaas ang Cash (asset) → debit. Tumaas ang Owner’s Capital → credit. Ang paglagay ng sarili mong pera ay HINDI kita, kaya hindi ito kasama sa gross sales/receipts.' },
      lines: [ { acct: 'cash', dr: 30000 }, { acct: 'capital', cr: 30000 } ]
    },
    {
      id: 2, date: '2026-11-03',
      en: 'Ana buys a drawing tablet for ₱12,000 and pays from the business account. She’ll use it for years.',
      fil: 'Bumili si Ana ng drawing tablet sa halagang ₱12,000, bayad mula sa business account. Ilang taon niya itong gagamitin.',
      doc: { en: 'Document: the seller’s invoice made out to Ana.', fil: 'Dokumento: invoice ng seller na naka-pangalan kay Ana.' },
      hint: { en: 'Something that lasts for years is equipment (an asset), not a monthly expense. Cash goes down.',
              fil: 'Ang gamit na tumatagal nang ilang taon ay equipment (asset), hindi buwanang gastos. Bumaba ang Cash.' },
      explain: { en: 'Equipment (asset) goes up → debit. Cash (asset) goes down → credit. In this lab the tablet is not counted as this month’s expense. How equipment cost is spread over the years is beyond this guide.',
                 fil: 'Tumaas ang Equipment (asset) → debit. Bumaba ang Cash (asset) → credit. Sa lab na ito, hindi binibilang ang tablet bilang gastos ngayong buwan. Kung paano hinahati ang cost ng equipment sa mga taon ay hindi na sakop ng gabay na ito.' },
      lines: [ { acct: 'equipment', dr: 12000 }, { acct: 'cash', cr: 12000 } ]
    },
    {
      id: 3, date: '2026-11-05',
      en: 'A small-business client pays Ana ₱8,000 in full for a logo project. Ana issues an invoice.',
      fil: 'Binayaran si Ana ng isang small-business client ng ₱8,000 nang buo para sa logo project. Nag-issue si Ana ng invoice.',
      doc: { en: 'Document: Ana’s invoice (copy kept in her files).', fil: 'Dokumento: invoice ni Ana (may kopya sa files niya).' },
      hint: { en: 'Money comes in because Ana did work. That’s income.',
              fil: 'May pumasok na pera dahil nagtrabaho si Ana. Kita (income) iyon.' },
      explain: { en: 'Cash goes up → debit. Service Income goes up → credit. This ₱8,000 counts toward gross sales/receipts.',
                 fil: 'Tumaas ang Cash → debit. Tumaas ang Service Income → credit. Kasama ang ₱8,000 sa gross sales/receipts.' },
      lines: [ { acct: 'cash', dr: 8000 }, { acct: 'income', cr: 8000 } ]
    },
    {
      id: 4, date: '2026-11-07',
      en: 'Ana pays her monthly internet bill of ₱1,699 from the business account.',
      fil: 'Binayaran ni Ana ang buwanang internet bill na ₱1,699 mula sa business account.',
      doc: { en: 'Document: the internet provider’s bill and proof of payment.', fil: 'Dokumento: bill ng internet provider at proof of payment.' },
      hint: { en: 'A cost of running the business that’s used up this month = expense.',
              fil: 'Gastos sa pagpapatakbo ng negosyo na nagamit na ngayong buwan = expense.' },
      explain: { en: 'Internet Expense goes up → debit. Cash goes down → credit.',
                 fil: 'Tumaas ang Internet Expense → debit. Bumaba ang Cash → credit.' },
      lines: [ { acct: 'internet', dr: 1699 }, { acct: 'cash', cr: 1699 } ]
    },
    {
      id: 5, date: '2026-11-10',
      en: 'Ana pays ₱1,200 for this month’s design software subscription.',
      fil: 'Nagbayad si Ana ng ₱1,200 para sa design software subscription ngayong buwan.',
      doc: { en: 'Document: the emailed invoice/billing statement from the software company (print or save it).',
             fil: 'Dokumento: invoice o billing statement na in-email ng software company (i-print o i-save).' },
      hint: { en: 'Another monthly cost of doing business.', fil: 'Isa pang buwanang gastos sa negosyo.' },
      explain: { en: 'Software Subscription Expense goes up → debit. Cash goes down → credit.',
                 fil: 'Tumaas ang Software Subscription Expense → debit. Bumaba ang Cash → credit.' },
      lines: [ { acct: 'software', dr: 1200 }, { acct: 'cash', cr: 1200 } ]
    },
    {
      id: 6, date: '2026-11-12',
      en: 'A company client owes Ana ₱20,000 for a brand kit. The client withholds ₱1,000 as tax, pays Ana ₱19,000, and gives her a BIR Form 2307 showing the ₱1,000 withheld. Ana issues an invoice for ₱20,000.',
      fil: 'May bayarin ang isang company client kay Ana na ₱20,000 para sa brand kit. Kinaltasan ng client ng ₱1,000 bilang buwis, ₱19,000 ang ibinayad kay Ana, at binigyan siya ng BIR Form 2307 na nagpapakita ng ₱1,000 na kinaltas. Nag-issue si Ana ng invoice na ₱20,000.',
      doc: { en: 'Documents: Ana’s invoice + the client’s BIR Form 2307. (Amounts are made up for practice; this guide does not cover withholding rates.)',
             fil: 'Mga dokumento: invoice ni Ana + BIR Form 2307 ng client. (Gawa-gawa lang ang halaga para sa practice; hindi sakop ng gabay na ito ang withholding rates.)' },
      hint: { en: 'This entry needs THREE lines. Ana earned the full ₱20,000 — part came as cash, part was withheld (proven by the 2307). Tip: tap “+ Add a line”.',
              fil: 'TATLONG linya ang entry na ito. Buong ₱20,000 ang kinita ni Ana — bahagi ay cash, bahagi ay kinaltas (patunay ang 2307). Tip: pindutin ang “+ Magdagdag ng linya”.' },
      explain: { en: 'Cash goes up by what she actually received (₱19,000) → debit. The ₱1,000 withheld goes to Creditable Withholding Tax (an asset: tax already taken from her payment, backed by the 2307) → debit. Service Income is the FULL ₱20,000 → credit. Debits ₱20,000 = Credits ₱20,000.',
                 fil: 'Tumaas ang Cash sa halagang talagang natanggap (₱19,000) → debit. Ang ₱1,000 na kinaltas ay napupunta sa Creditable Withholding Tax (asset: buwis na kinuha na sa bayad sa kanya, may patunay na 2307) → debit. Ang Service Income ay ang BUONG ₱20,000 → credit. Debit ₱20,000 = Credit ₱20,000.' },
      lines: [ { acct: 'cash', dr: 19000 }, { acct: 'cwt', dr: 1000 }, { acct: 'income', cr: 20000 } ]
    },
    {
      id: 7, date: '2026-11-15',
      en: 'Ana withdraws ₱5,000 from the business account for personal groceries and family expenses.',
      fil: 'Kumuha si Ana ng ₱5,000 mula sa business account para sa personal na grocery at gastusin ng pamilya.',
      doc: { en: 'Document: withdrawal or transfer record. Write “owner’s withdrawal” on it.', fil: 'Dokumento: withdrawal o transfer record. Isulat ang “owner’s withdrawal”.' },
      hint: { en: 'Personal spending is NOT a business expense. Money taken out by the owner goes to a special equity account.',
              fil: 'Ang personal na gastos ay HINDI business expense. Ang perang kinuha ng may-ari ay napupunta sa espesyal na equity account.' },
      explain: { en: 'Owner’s Drawings goes up → debit. Cash goes down → credit. Drawings are not expenses, so they don’t reduce the business’s expenses total.',
                 fil: 'Tumaas ang Owner’s Drawings → debit. Bumaba ang Cash → credit. Hindi expense ang drawings, kaya hindi ito kasama sa total ng gastos ng negosyo.' },
      lines: [ { acct: 'drawings', dr: 5000 }, { acct: 'cash', cr: 5000 } ]
    },
    {
      id: 8, date: '2026-11-18',
      en: 'Ana buys printer ink and paper for client proofs, ₱850, paid in cash. She asks the store for an invoice.',
      fil: 'Bumili si Ana ng printer ink at papel para sa client proofs, ₱850, cash ang bayad. Humingi siya ng invoice sa tindahan.',
      doc: { en: 'Document: the store’s invoice.', fil: 'Dokumento: invoice ng tindahan.' },
      hint: { en: 'Small items that get used up are an expense.', fil: 'Ang maliliit na gamit na nauubos ay expense.' },
      explain: { en: 'Office Supplies Expense goes up → debit. Cash goes down → credit.',
                 fil: 'Tumaas ang Office Supplies Expense → debit. Bumaba ang Cash → credit.' },
      lines: [ { acct: 'supplies', dr: 850 }, { acct: 'cash', cr: 850 } ]
    },
    {
      id: 9, date: '2026-11-22',
      en: 'Ana makes a quick social media banner for ₱450, paid in cash. The amount is below ₱500, but the buyer asks for an invoice, so Ana issues one.',
      fil: 'Gumawa si Ana ng mabilisang social media banner sa halagang ₱450, cash ang bayad. Mas mababa sa ₱500, pero humingi ng invoice ang buyer, kaya nag-issue si Ana.',
      doc: { en: 'Document: Ana’s invoice. (Non-VAT sellers issue an invoice below ₱500 when the buyer asks.)',
             fil: 'Dokumento: invoice ni Ana. (Ang non-VAT seller ay nag-iissue ng invoice kahit mas mababa sa ₱500 kapag humingi ang buyer.)' },
      hint: { en: 'Small sale, same entry as any other sale.', fil: 'Maliit na benta, pareho lang ang entry gaya ng ibang benta.' },
      explain: { en: 'Cash goes up → debit. Service Income goes up → credit. Small sales still count toward gross sales/receipts.',
                 fil: 'Tumaas ang Cash → debit. Tumaas ang Service Income → credit. Kasama pa rin ang maliliit na benta sa gross sales/receipts.' },
      lines: [ { acct: 'cash', dr: 450 }, { acct: 'income', cr: 450 } ]
    },
    {
      id: 10, date: '2026-11-28',
      en: 'Ana pays ₱320 for a ride to a client meeting, paid from business cash.',
      fil: 'Nagbayad si Ana ng ₱320 para sa sakay papunta sa client meeting, mula sa business cash.',
      doc: { en: 'Document: the ride receipt (save the e-receipt). Note who you met and why.',
             fil: 'Dokumento: resibo ng sakay (i-save ang e-receipt). Isulat kung sino ang kinita at bakit.' },
      hint: { en: 'Travel for business = expense.', fil: 'Biyahe para sa negosyo = expense.' },
      explain: { en: 'Transportation Expense goes up → debit. Cash goes down → credit.',
                 fil: 'Tumaas ang Transportation Expense → debit. Bumaba ang Cash → credit.' },
      lines: [ { acct: 'transport', dr: 320 }, { acct: 'cash', cr: 320 } ]
    }
  ]
};
