/* Practice lab — checks the reader's journal entries against LAB_DATA,
   then posts finished entries to the General Journal and ledger accounts.
   Everything stays in this page. Only "which transactions are finished" is saved in this browser. */
(function () {
  'use strict';
  var D = window.LAB_DATA, B = window.BFT;
  if (!D || !B) return;
  var b = B.b, t = B.t, esc = B.esc, peso = B.peso;
  var root = document.getElementById('lab');
  if (!root) return;

  var ACC = {};
  D.accounts.forEach(function (a) { ACC[a.id] = a; });
  var TX = D.transactions;
  var NORMAL_DEBIT = { asset: true, expense: true, drawings: true };

  /* Self-check of the answer key: every entry must balance. Shows a warning if someone edits the data wrongly. */
  var keyProblems = [];
  TX.forEach(function (tx) {
    var dr = 0, cr = 0;
    tx.lines.forEach(function (l) {
      if (!ACC[l.acct]) keyProblems.push('Transaction ' + tx.id + ': unknown account "' + l.acct + '"');
      dr += l.dr || 0; cr += l.cr || 0;
    });
    if (Math.round(dr * 100) !== Math.round(cr * 100)) keyProblems.push('Transaction ' + tx.id + ': debits ' + dr + ' ≠ credits ' + cr);
  });

  /* Saved state: { done: {id: 'solved'|'shown'} } */
  var saved = B.store.getJSON('lab', {});
  var done = (saved && typeof saved.done === 'object' && saved.done) || {};
  function save() { B.store.setJSON('lab', { done: done }); }

  var current = TX[0].id;
  for (var i = 0; i < TX.length; i++) { if (!done[TX[i].id]) { current = TX[i].id; break; } }
  var rows = {};          // what the reader typed, per transaction (kept in memory only)
  var feedback = {};      // last feedback html per transaction
  var justPosted = null;

  function txById(id) { for (var i = 0; i < TX.length; i++) if (TX[i].id === id) return TX[i]; return null; }
  function rowsFor(id) {
    if (!rows[id]) rows[id] = [{ acct: '', side: '', amt: '' }, { acct: '', side: '', amt: '' }];
    return rows[id];
  }
  function parseAmt(s) {
    var n = parseFloat(String(s).replace(/[₱,\s]/g, ''));
    return isFinite(n) ? Math.round(n * 100) / 100 : NaN;
  }
  function fmtDate(iso) {
    var d = iso.split('-');
    var mEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var mFil = ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'];
    var m = parseInt(d[1], 10) - 1;
    return b(mEn[m] + ' ' + parseInt(d[2], 10), mFil[m] + ' ' + parseInt(d[2], 10));
  }
  function acctName(id) { return ACC[id] ? b(esc(ACC[id].en), esc(ACC[id].en)) : ''; }

  function sideReason(acct, side) {
    var a = ACC[acct], ty = a.type, nm = esc(a.en);
    var en, fil;
    if (ty === 'asset') {
      en = side === 'dr' ? nm + ' goes UP here, and assets go up with a debit.' : nm + ' goes DOWN here, and assets go down with a credit.';
      fil = side === 'dr' ? 'Tumataas ang ' + nm + ' dito, at ang asset ay tumataas sa debit.' : 'Bumababa ang ' + nm + ' dito, at ang asset ay bumababa sa credit.';
    } else if (ty === 'expense') {
      en = 'Expenses are recorded on the debit side.'; fil = 'Ang expense ay inilalagay sa debit side.';
    } else if (ty === 'income') {
      en = 'Income is recorded on the credit side.'; fil = 'Ang income ay inilalagay sa credit side.';
    } else if (ty === 'equity') {
      en = 'Owner’s Capital goes up with a credit.'; fil = 'Ang Owner’s Capital ay tumataas sa credit.';
    } else if (ty === 'drawings') {
      en = 'Owner’s Drawings are recorded as debits (they reduce what the owner has in the business).'; fil = 'Ang Owner’s Drawings ay debit (binabawasan nito ang puhunan ng may-ari sa negosyo).';
    } else {
      en = 'Liabilities go up with a credit.'; fil = 'Ang liability ay tumataas sa credit.';
    }
    return b(en, fil);
  }

  /* ---------- Checking an answer ---------- */
  function check(tx) {
    var entered = rowsFor(tx.id).map(function (r) {
      return { acct: r.acct, side: r.side, amt: parseAmt(r.amt) };
    }).filter(function (r) { return r.acct || r.side || !isNaN(r.amt); });

    var msgs = [];
    entered.forEach(function (r, i) {
      if (!r.acct || !r.side || isNaN(r.amt) || r.amt <= 0) {
        msgs.push(b('Line ' + (i + 1) + ' is incomplete — pick an account, Debit or Credit, and type the amount.',
                    'Kulang ang linya ' + (i + 1) + ' — pumili ng account, Debit o Credit, at i-type ang halaga.'));
      }
    });
    if (msgs.length) return { ok: false, msgs: msgs };
    if (!entered.length) return { ok: false, msgs: [b('Fill in at least two lines first.', 'Punan muna ang kahit dalawang linya.')] };

    var used = {};
    entered.forEach(function (r) {
      if (used[r.acct]) {
        msgs.push(b('You used ' + esc(ACC[r.acct].en) + ' twice. Combine it into one line.',
                    'Dalawang beses mong ginamit ang ' + esc(ACC[r.acct].en) + '. Pagsamahin sa isang linya.'));
      }
      used[r.acct] = r;
    });

    tx.lines.forEach(function (l) {
      var side = l.dr ? 'dr' : 'cr', amt = l.dr || l.cr, r = used[l.acct];
      if (!r) {
        msgs.push(b('Something is missing: which other account changed? ', 'May kulang: anong ibang account ang nagbago? ') + '<em>' + b(esc(tx.hint.en), esc(tx.hint.fil)) + '</em>');
      } else {
        if (r.side !== side) msgs.push(b('<strong>' + esc(ACC[l.acct].en) + '</strong> is on the wrong side. ', '<strong>' + esc(ACC[l.acct].en) + '</strong> — mali ang side. ') + sideReason(l.acct, side));
        if (r.amt !== amt) msgs.push(b('Check the amount for <strong>' + esc(ACC[l.acct].en) + '</strong>. Read the story again.',
                                       'Tingnan ulit ang halaga ng <strong>' + esc(ACC[l.acct].en) + '</strong>. Basahin ulit ang kuwento.'));
      }
    });
    Object.keys(used).forEach(function (id) {
      var inKey = tx.lines.some(function (l) { return l.acct === id; });
      if (!inKey) {
        var why = ACC[id].notUsed ? ' ' + b(esc(ACC[id].notUsed.en), esc(ACC[id].notUsed.fil)) : '';
        msgs.push(b('<strong>' + esc(ACC[id].en) + '</strong> isn’t part of this entry.', 'Hindi kasama sa entry na ito ang <strong>' + esc(ACC[id].en) + '</strong>.') + why);
      }
    });
    // de-duplicate "missing" messages
    msgs = msgs.filter(function (m, i) { return msgs.indexOf(m) === i; });
    return { ok: msgs.length === 0, msgs: msgs };
  }

  /* ---------- Rendering ---------- */
  function accountOptions(sel) {
    var groups = [
      ['asset', 'Assets', 'Assets (ari-arian)'], ['liability', 'Liabilities', 'Liabilities (utang)'],
      ['equity', 'Owner’s equity', 'Owner’s equity (puhunan)'], ['drawings', 'Owner’s equity', 'Owner’s equity'],
      ['income', 'Income', 'Income (kita)'], ['expense', 'Expenses', 'Expenses (gastos)']
    ];
    var lang = B.lang();
    var html = '<option value="">' + (lang === 'fil' ? '— Pumili ng account —' : '— Choose an account —') + '</option>';
    groups.forEach(function (g) {
      var list = D.accounts.filter(function (a) { return a.type === g[0]; });
      if (!list.length) return;
      if (g[0] !== 'drawings') html += '<optgroup label="' + esc(lang === 'fil' ? g[2] : g[1]) + '">';
      list.forEach(function (a) {
        html += '<option value="' + a.id + '"' + (sel === a.id ? ' selected' : '') + '>' + esc(t(a)) + '</option>';
      });
      if (g[0] !== 'equity') html += '</optgroup>';
    });
    return html;
  }

  function renderChips() {
    return '<ol class="tx-chips" aria-label="Transactions">' + TX.map(function (tx) {
      return '<li><button type="button" data-go="' + tx.id + '" class="' + (done[tx.id] ? 'done' : '') + '"' +
        (tx.id === current ? ' aria-current="true"' : '') + ' aria-label="' +
        (B.lang() === 'fil' ? 'Transaksyon ' : 'Transaction ') + tx.id + (done[tx.id] ? ' ✓' : '') + '">' + tx.id + '</button></li>';
    }).join('') + '</ol>';
  }

  function renderEntry(tx) {
    var lang = B.lang();
    var isDone = !!done[tx.id];
    var html = '<div class="card" id="txCard">' +
      '<p class="tx-date">' + b('Transaction ' + tx.id + ' of ' + TX.length, 'Transaksyon ' + tx.id + ' sa ' + TX.length) + ' · ' + fmtDate(tx.date) + ', 2026</p>' +
      '<p class="tx-story">' + b(esc(tx.en), esc(tx.fil)) + '</p>' +
      '<p><small>' + b(esc(tx.doc.en), esc(tx.doc.fil)) + '</small></p>';

    if (isDone) {
      html += '<div class="result good">' + (done[tx.id] === 'shown' ? b('Answer shown. Posted to Ana’s books.', 'Ipinakita ang sagot. Naka-post na sa libro ni Ana.') : b('✓ Correct! Posted to Ana’s books.', '✓ Tama! Naka-post na sa libro ni Ana.')) +
        '<p style="margin:8px 0 0">' + b(esc(tx.explain.en), esc(tx.explain.fil)) + '</p></div>' +
        answerTable(tx) +
        '<div class="btn-row">' +
          '<button type="button" class="btn ghost small" data-redo="' + tx.id + '">' + b('Try this one again', 'Subukan ulit ito') + '</button>' +
          nextBtn(tx) + '</div></div>';
      return html;
    }

    html += '<h3 style="margin-top:6px">' + b('Your journal entry', 'Ang journal entry mo') + '</h3>';
    rowsFor(tx.id).forEach(function (r, i) {
      html += '<div class="entry-row">' +
        '<label class="acct">' + b('Account', 'Account') +
          '<select data-row="' + i + '" data-f="acct">' + accountOptions(r.acct) + '</select></label>' +
        '<label>' + b('Debit or Credit?', 'Debit o Credit?') +
          '<select data-row="' + i + '" data-f="side">' +
            '<option value="">' + (lang === 'fil' ? '— Pumili —' : '— Choose —') + '</option>' +
            '<option value="dr"' + (r.side === 'dr' ? ' selected' : '') + '>Debit (Dr)</option>' +
            '<option value="cr"' + (r.side === 'cr' ? ' selected' : '') + '>Credit (Cr)</option>' +
          '</select></label>' +
        '<label>' + b('Amount (₱)', 'Halaga (₱)') +
          '<input type="text" inputmode="decimal" autocomplete="off" data-row="' + i + '" data-f="amt" value="' + esc(r.amt) + '" placeholder="0.00"></label>' +
        (rowsFor(tx.id).length > 2 ? '<button type="button" class="link-btn rm" data-rm="' + i + '">' + b('Remove', 'Alisin') + '</button>' : '<span class="rm"></span>') +
      '</div>';
    });
    html += '<div class="totals-live" id="liveTotals"></div>' +
      '<div class="btn-row">' +
        (rowsFor(tx.id).length < 4 ? '<button type="button" class="btn ghost small" id="addRow">+ ' + b('Add a line', 'Magdagdag ng linya') + '</button>' : '') +
        '<button type="button" class="btn ghost small" id="hintBtn">' + b('Hint', 'Hint') + '</button>' +
      '</div>' +
      '<div class="btn-row">' +
        '<button type="button" class="btn" id="checkBtn">' + b('Check my answer', 'I-check ang sagot ko') + '</button>' +
        '<button type="button" class="btn ghost" id="showBtn">' + b('Show answer', 'Ipakita ang sagot') + '</button>' +
      '</div>' +
      '<div class="feedback" id="fb" aria-live="polite">' + (feedback[tx.id] || '') + '</div>' +
      '</div>';
    return html;
  }

  function nextBtn(tx) {
    var nextOpen = null;
    for (var i = 0; i < TX.length; i++) if (!done[TX[i].id] && TX[i].id !== tx.id) { nextOpen = TX[i]; break; }
    if (nextOpen) return '<button type="button" class="btn small" data-go="' + nextOpen.id + '">' + b('Next transaction', 'Susunod na transaksyon') + ' →</button>';
    return '<a class="btn small" href="#monthEnd">' + b('See month-end totals', 'Tingnan ang month-end totals') + ' ↓</a>';
  }

  function answerTable(tx) {
    var h = '<div class="table-wrap"><table><thead><tr><th>' + b('Account', 'Account') + '</th><th class="num">Debit</th><th class="num">Credit</th></tr></thead><tbody>';
    tx.lines.forEach(function (l) {
      h += '<tr><td' + (l.cr ? ' class="indent"' : '') + '>' + acctName(l.acct) + '</td><td class="num">' + (l.dr ? peso(l.dr) : '') + '</td><td class="num">' + (l.cr ? peso(l.cr) : '') + '</td></tr>';
    });
    return h + '</tbody></table></div>';
  }

  function updateLiveTotals(tx) {
    var el = document.getElementById('liveTotals');
    if (!el) return;
    var dr = 0, cr = 0;
    rowsFor(tx.id).forEach(function (r) {
      var n = parseAmt(r.amt);
      if (isNaN(n)) return;
      if (r.side === 'dr') dr += n; else if (r.side === 'cr') cr += n;
    });
    var bal = Math.round(dr * 100) === Math.round(cr * 100) && dr > 0;
    el.innerHTML = '<span>' + b('Debits', 'Debit') + ': ' + peso(dr) + '</span><span>' + b('Credits', 'Credit') + ': ' + peso(cr) + '</span>' +
      '<span class="' + (bal ? 'ok' : 'off') + '">' + (bal ? b('✓ Balanced', '✓ Balanse') : b('Not balanced yet', 'Hindi pa balanse')) + '</span>';
  }

  /* ---------- Books: journal, ledger, month-end ---------- */
  function postedTx() { return TX.filter(function (tx) { return !!done[tx.id]; }); }

  function renderJournal() {
    var list = postedTx();
    if (!list.length) return '<p class="empty">' + b('Nothing posted yet. Finish a transaction and it will appear here.', 'Wala pang naka-post. Tapusin ang isang transaksyon at lalabas ito rito.') + '</p>';
    var h = '<div class="table-wrap"><table><thead><tr><th>' + b('Date', 'Petsa') + '</th><th>' + b('Account titles & explanation', 'Account titles at paliwanag') + '</th><th>Ref</th><th class="num">Debit</th><th class="num">Credit</th></tr></thead><tbody>';
    var tdr = 0, tcr = 0;
    list.forEach(function (tx) {
      var cls = tx.id === justPosted ? ' class="flash"' : '';
      tx.lines.forEach(function (l, i) {
        tdr += l.dr || 0; tcr += l.cr || 0;
        h += '<tr' + cls + '><td class="nw">' + (i === 0 ? fmtDate(tx.date) : '') + '</td><td' + (l.cr ? ' class="indent"' : '') + '>' + acctName(l.acct) + '</td><td class="nw">GJ-' + tx.id + '</td><td class="num">' + (l.dr ? peso(l.dr) : '') + '</td><td class="num">' + (l.cr ? peso(l.cr) : '') + '</td></tr>';
      });
      h += '<tr' + cls + '><td></td><td colspan="4"><small><em>' + b(esc(shortExpl(tx, 'en')), esc(shortExpl(tx, 'fil'))) + '</em></small></td></tr>';
    });
    h += '</tbody><tfoot><tr><td></td><td>' + b('Totals', 'Kabuuan') + '</td><td></td><td class="num">' + peso(tdr) + '</td><td class="num">' + peso(tcr) + '</td></tr></tfoot></table></div>';
    return h;
  }
  function shortExpl(tx, l) { var s = tx[l]; return '(' + (s.length > 90 ? s.slice(0, 87).replace(/\s+\S*$/, '') + '…' : s) + ')'; }

  function ledgerData() {
    var led = {};
    postedTx().forEach(function (tx) {
      tx.lines.forEach(function (l) {
        (led[l.acct] = led[l.acct] || []).push({ date: tx.date, ref: 'GJ-' + tx.id, dr: l.dr || 0, cr: l.cr || 0, tx: tx.id });
      });
    });
    return led;
  }
  function balanceOf(id, entries) {
    var dr = 0, cr = 0;
    entries.forEach(function (e) { dr += e.dr; cr += e.cr; });
    return NORMAL_DEBIT[ACC[id].type] ? dr - cr : cr - dr;
  }

  function renderLedgers() {
    var led = ledgerData();
    var ids = D.accounts.map(function (a) { return a.id; }).filter(function (id) { return led[id]; });
    if (!ids.length) return '<p class="empty">' + b('No ledger accounts yet.', 'Wala pang ledger account.') + '</p>';
    return '<div class="ledgers">' + ids.map(function (id) {
      var run = 0, normalDr = NORMAL_DEBIT[ACC[id].type];
      var h = '<div class="ledger"><h4>' + acctName(id) + ' <small class="tag">' + (normalDr ? b('normal balance: debit', 'normal balance: debit') : b('normal balance: credit', 'normal balance: credit')) + '</small></h4>' +
        '<div class="table-wrap"><table><thead><tr><th>' + b('Date', 'Petsa') + '</th><th>Ref</th><th class="num">Dr</th><th class="num">Cr</th><th class="num">' + b('Balance', 'Balanse') + '</th></tr></thead><tbody>';
      led[id].forEach(function (e) {
        run += normalDr ? e.dr - e.cr : e.cr - e.dr;
        h += '<tr' + (e.tx === justPosted ? ' class="flash"' : '') + '><td class="nw">' + fmtDate(e.date) + '</td><td class="nw">' + e.ref + '</td><td class="num">' + (e.dr ? peso(e.dr) : '') + '</td><td class="num">' + (e.cr ? peso(e.cr) : '') + '</td><td class="num">' + peso(run) + '</td></tr>';
      });
      return h + '</tbody></table></div></div>';
    }).join('') + '</div>';
  }

  function renderMonthEnd() {
    var led = ledgerData();
    var list = postedTx();
    if (!list.length) return '<p class="empty">' + b('Month-end totals appear once you’ve posted at least one transaction.', 'Lalabas ang month-end totals kapag may na-post ka nang kahit isang transaksyon.') + '</p>';
    var gross = 0, exp = 0, cwt = 0, cash = 0, draw = 0, cap = 0, equip = 0;
    var tbRows = '', tbDr = 0, tbCr = 0;
    D.accounts.forEach(function (a) {
      if (!led[a.id]) return;
      var bal = balanceOf(a.id, led[a.id]);
      if (a.type === 'income') gross += bal;
      if (a.type === 'expense') exp += bal;
      if (a.id === 'cwt') cwt = bal;
      if (a.id === 'cash') cash = bal;
      if (a.id === 'drawings') draw = bal;
      if (a.id === 'capital') cap = bal;
      if (a.id === 'equipment') equip = bal;
      var onDr = NORMAL_DEBIT[a.type] ? bal >= 0 : bal < 0;
      var amt = Math.abs(bal);
      if (onDr) tbDr += amt; else tbCr += amt;
      tbRows += '<tr><td>' + acctName(a.id) + '</td><td class="num">' + (onDr ? peso(amt) : '') + '</td><td class="num">' + (!onDr ? peso(amt) : '') + '</td></tr>';
    });
    var all = list.length === TX.length;
    var balanced = Math.round(tbDr * 100) === Math.round(tbCr * 100);
    var h = '';
    if (!all) h += '<p class="box note">' + b('Running totals so far (' + list.length + ' of ' + TX.length + ' transactions posted). Finish all ' + TX.length + ' to close Ana’s month.',
                                                'Running totals pa lang (' + list.length + ' sa ' + TX.length + ' transaksyon ang naka-post). Tapusin lahat ng ' + TX.length + ' para ma-close ang buwan ni Ana.') + '</p>';
    else h += '<p class="result good">' + b('🎉 All ' + TX.length + ' transactions posted. Here is Ana’s November, closed.', '🎉 Naka-post na lahat ng ' + TX.length + ' transaksyon. Ito ang November ni Ana, sarado na.') + '</p>';
    h += '<div class="stat-grid">' +
      stat(peso(gross), b('Gross sales/receipts (Service Income)', 'Gross sales/receipts (Service Income)')) +
      stat(peso(exp), b('Total expenses', 'Kabuuang gastos (expenses)')) +
      stat(peso(cwt), b('Tax withheld by clients (2307s on file)', 'Buwis na kinaltas ng kliyente (may 2307)')) +
      stat(peso(cash), b('Cash balance per books', 'Cash balance ayon sa libro')) +
      '</div>';
    h += '<h3>' + b('Trial balance', 'Trial balance') + ' <small class="tag">' + (balanced ? b('✓ Debits = Credits', '✓ Debit = Credit') : b('✗ Not balanced', '✗ Hindi balanse')) + '</small></h3>' +
      '<p>' + b('A trial balance lists every account’s ending balance. If the debit column equals the credit column, the posting math is right.',
                'Ang trial balance ay listahan ng ending balance ng bawat account. Kapag pantay ang debit at credit column, tama ang math ng posting.') + '</p>' +
      '<div class="table-wrap"><table><thead><tr><th>' + b('Account', 'Account') + '</th><th class="num">Debit</th><th class="num">Credit</th></tr></thead><tbody>' + tbRows +
      '</tbody><tfoot><tr><td>' + b('Totals', 'Kabuuan') + '</td><td class="num">' + peso(tbDr) + '</td><td class="num">' + peso(tbCr) + '</td></tr></tfoot></table></div>';
    h += '<h3>' + b('What is NOT in the expenses total — and why', 'Ano ang HINDI kasama sa total expenses — at bakit') + '</h3><ul>' +
      (equip ? '<li>' + b('<strong>Equipment ' + peso(equip) + '</strong> — the tablet is an asset she’ll use for years, not this month’s expense.', '<strong>Equipment ' + peso(equip) + '</strong> — asset ang tablet na ilang taon niyang gagamitin, hindi gastos ngayong buwan.') + '</li>' : '') +
      (draw ? '<li>' + b('<strong>Owner’s Drawings ' + peso(draw) + '</strong> — personal money taken out, not a business cost.', '<strong>Owner’s Drawings ' + peso(draw) + '</strong> — personal na perang kinuha, hindi gastos ng negosyo.') + '</li>' : '') +
      (cap ? '<li>' + b('<strong>Owner’s Capital ' + peso(cap) + '</strong> — Ana’s own money put in. It’s not income either.', '<strong>Owner’s Capital ' + peso(cap) + '</strong> — sariling pera ni Ana na ipinasok. Hindi rin ito kita.') + '</li>' : '') +
      '</ul>';
    h += '<div class="box why"><h3>' + b('How this feeds the quarterly return', 'Paano ito napupunta sa quarterly return') + '</h3><ol>' +
      '<li>' + b('Each month, write down the month’s <strong>gross sales/receipts</strong> (here ' + peso(gross) + ') and <strong>total expenses</strong> (here ' + peso(exp) + ').',
                 'Bawat buwan, isulat ang <strong>gross sales/receipts</strong> ng buwan (dito ' + peso(gross) + ') at <strong>total expenses</strong> (dito ' + peso(exp) + ').') + '</li>' +
      '<li>' + b('At quarter-end, add up the months in the quarter. Those quarter totals are the numbers you bring to your quarterly return.',
                 'Pagdating ng quarter-end, pagsamahin ang mga buwan sa quarter. Ang mga quarter total na iyon ang dadalhin mo sa quarterly return.') + '</li>' +
      '<li>' + b('Gross receipts use the FULL ₱20,000 from the client who withheld tax — not the ₱19,000 cash. Keep that client’s 2307 with your records.',
                 'Sa gross receipts, ang BUONG ₱20,000 ang gamit mula sa client na nagkaltas ng buwis — hindi ang ₱19,000 na cash. Itago ang 2307 ng client na iyon kasama ng records mo.') + '</li>' +
      '<li>' + b('Even if you use the Optional Standard Deduction, you must still keep records of gross sales.', 'Kahit Optional Standard Deduction ang gamit mo, kailangan mo pa ring mag-record ng gross sales.') + ' <small class="src">1701-MS Guidelines</small></li>' +
      '</ol><p><small>' + b('This guide does not cover how to fill out returns, which form applies to you, or filing deadlines.', 'Hindi sakop ng gabay na ito kung paano sagutan ang returns, aling form ang para sa iyo, o ang mga deadline.') + '</small></p></div>';
    return h;
  }
  function stat(v, label) { return '<div class="stat"><b>' + v + '</b><span>' + label + '</span></div>'; }

  /* ---------- Main render + events ---------- */
  function render() {
    var tx = txById(current);
    var warn = keyProblems.length ? '<div class="box warn"><strong>Answer key problem (for the editor):</strong><ul><li>' + keyProblems.map(esc).join('</li><li>') + '</li></ul></div>' : '';
    var doneCount = postedTx().length;
    root.innerHTML = warn +
      '<div class="lab-grid"><div class="sticky">' +
        '<h2 style="margin-top:0">' + b('Record Ana’s transactions', 'I-record ang mga transaksyon ni Ana') + '</h2>' +
        '<p>' + b(doneCount + ' of ' + TX.length + ' done. Tap a number to jump.', doneCount + ' sa ' + TX.length + ' ang tapos. Pindutin ang numero para lumipat.') + '</p>' +
        renderChips() + renderEntry(tx) +
        '<button type="button" class="btn ghost small no-print" id="resetLab">' + b('Start the lab over', 'Ulitin ang lab mula simula') + '</button>' +
      '</div><div>' +
        '<h2 style="margin-top:0">' + b('Ana’s General Journal', 'General Journal ni Ana') + '</h2>' +
        '<p><small>' + b('Every entry, in date order. Debits first; credits indented.', 'Bawat entry, ayon sa petsa. Una ang debit; naka-indent ang credit.') + '</small></p>' +
        renderJournal() +
        '<h2>' + b('Ana’s General Ledger', 'General Ledger ni Ana') + '</h2>' +
        '<p><small>' + b('The same amounts, sorted by account. The running balance shows how much is in each account.', 'Parehong halaga, inayos ayon sa account. Ipinapakita ng running balance kung magkano ang laman ng bawat account.') + '</small></p>' +
        renderLedgers() +
      '</div></div>' +
      '<section id="monthEnd" class="card"><h2>' + b('Month-end totals', 'Month-end totals') + '</h2>' + renderMonthEnd() + '</section>';
    if (!done[tx.id]) updateLiveTotals(tx);
    justPosted = null;
  }

  root.addEventListener('change', onInput);
  root.addEventListener('input', function (e) { if (e.target.getAttribute('data-f') === 'amt') onInput(e); });
  function onInput(e) {
    var el = e.target, i = el.getAttribute('data-row'), f = el.getAttribute('data-f');
    if (i == null || !f) return;
    rowsFor(current)[+i][f] = el.value;
    updateLiveTotals(txById(current));
  }

  root.addEventListener('click', function (e) {
    var el = e.target.closest('button, a');
    if (!el || !root.contains(el)) return;
    var tx = txById(current);
    if (el.hasAttribute('data-go')) {
      current = +el.getAttribute('data-go');
      render();
      focusCard();
    } else if (el.id === 'addRow') {
      rowsFor(current).push({ acct: '', side: '', amt: '' });
      render();
    } else if (el.hasAttribute('data-rm')) {
      rowsFor(current).splice(+el.getAttribute('data-rm'), 1);
      render();
    } else if (el.id === 'hintBtn') {
      feedback[current] = '<div class="result info">💡 ' + b(esc(tx.hint.en), esc(tx.hint.fil)) + '</div>';
      document.getElementById('fb').innerHTML = feedback[current];
    } else if (el.id === 'checkBtn') {
      var res = check(tx);
      if (res.ok) {
        done[tx.id] = 'solved'; save(); justPosted = tx.id; feedback[tx.id] = '';
        render();
        focusCard();
      } else {
        feedback[current] = '<div class="result bad"><strong>' + b('Almost! Check these:', 'Malapit na! Tingnan ito:') + '</strong><ul><li>' + res.msgs.join('</li><li>') + '</li></ul></div>';
        document.getElementById('fb').innerHTML = feedback[current];
      }
    } else if (el.id === 'showBtn') {
      done[tx.id] = 'shown'; save(); justPosted = tx.id;
      render();
      focusCard();
    } else if (el.hasAttribute('data-redo')) {
      delete done[current]; save();
      rows[current] = null; feedback[current] = '';
      render();
    } else if (el.id === 'resetLab') {
      // Two-tap confirmation built into the page (browser confirm dialogs are blocked in some viewers)
      if (el.getAttribute('data-armed') === '1') {
        done = {}; rows = {}; feedback = {}; save(); current = TX[0].id; render(); focusCard();
      } else {
        el.setAttribute('data-armed', '1');
        el.innerHTML = b('Tap again to clear all your lab answers', 'Pindutin ulit para burahin lahat ng sagot sa lab');
        setTimeout(function () {
          if (document.body.contains(el)) { el.removeAttribute('data-armed'); el.innerHTML = b('Start the lab over', 'Ulitin ang lab mula simula'); }
        }, 5000);
      }
    }
  });
  function focusCard() {
    var c = document.getElementById('txCard');
    if (c && c.scrollIntoView && window.innerWidth < 1000) c.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  document.addEventListener('bft:lang', render);
  render();
})();
