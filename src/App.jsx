import { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD09A_IUArbdXZO6F9DutJigFOi9hpxBa0",
  authDomain: "hitorimeshi-a.firebaseapp.com",
  projectId: "hitorimeshi-a",
  storageBucket: "hitorimeshi-a.firebasestorage.app",
  messagingSenderId: "289020471546",
  appId: "1:289020471546:web:320a8bfe43ba42a1738143"
};
const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);

// Colors
const A = "#FF6B35", BG = "#0F0E0C", SF = "#1A1916", CD = "#232220";
const TX = "#F5F0E8", MU = "#6B6760", GN = "#4CAF7D", YW = "#FFB830";
const RD = "#FF5555", BL = "#4A9EFF";

const EM = {
  // 肉類
  "鶏肉":3,"鶏むね":3,"鶏もも":3,"鶏ささみ":3,"鶏皮":3,"手羽":3,
  "豚肉":3,"豚バラ":3,"豚ロース":3,"豚こま":3,"豚ひれ":3,
  "牛肉":3,"牛バラ":3,"牛ロース":3,"和牛":3,
  "ひき肉":2,"合い挽き":2,"鶏ひき":2,"豚ひき":2,"牛ひき":2,
  "ミンチ":2,"レバー":2,"ホルモン":2,
  // 魚介類
  "魚":2,"刺身":1,"さしみ":1,"刺し身":1,
  "サーモン":2,"鮭":3,"サバ":2,"さば":2,"アジ":2,"あじ":2,
  "マグロ":1,"まぐろ":1,"ブリ":2,"ぶり":2,"タイ":2,"たい":2,
  "エビ":2,"えび":2,"イカ":2,"いか":2,"タコ":3,"たこ":3,
  "ホタテ":2,"はまぐり":1,"あさり":2,"シジミ":2,"かき":2,
  "ツナ":1095,"缶詰":365,
  // 加工肉
  "ベーコン":7,"ハム":7,"ウインナー":7,"ソーセージ":7,
  "サラミ":14,"コンビーフ":3,
  // 乳製品・卵
  "牛乳":7,"ミルク":7,"豆乳":7,
  "卵":21,"たまご":21,"玉子":21,
  "チーズ":14,"スライスチーズ":14,"クリームチーズ":14,
  "バター":30,"マーガリン":30,
  "ヨーグルト":14,"生クリーム":7,"ホイップ":7,
  // 豆腐・大豆製品
  "豆腐":4,"絹豆腐":4,"木綿豆腐":4,"絹ごし":4,
  "厚揚げ":4,"油揚げ":5,"がんも":4,"豆腐":4,
  "納豆":7,"おから":3,"湯葉":3,
  // 野菜
  "レタス":5,"サラダ菜":4,"水菜":5,"春菊":4,"ほうれん草":4,"小松菜":4,
  "キャベツ":14,"紫キャベツ":14,"白菜":14,"チンゲン菜":5,
  "ねぎ":7,"長ねぎ":7,"小ねぎ":5,"万能ねぎ":5,"わけぎ":5,
  "玉ねぎ":30,"新玉ねぎ":10,"赤玉ねぎ":30,
  "にんじん":21,"大根":14,"かぶ":7,"ごぼう":14,"れんこん":14,
  "じゃがいも":30,"さつまいも":30,"里芋":14,"山芋":14,"長芋":14,
  "トマト":5,"ミニトマト":7,"プチトマト":7,
  "きゅうり":5,"なす":5,"ズッキーニ":5,"オクラ":3,
  "ピーマン":7,"パプリカ":10,"唐辛子":7,
  "ブロッコリー":5,"カリフラワー":7,"アスパラ":4,"セロリ":7,
  "もやし":3,"豆もやし":3,"枝豆":3,
  "しめじ":5,"えのき":5,"しいたけ":5,"まいたけ":5,"エリンギ":7,"なめこ":5,
  "アボカド":3,"コーン":3,"とうもろこし":3,
  "生姜":14,"しょうが":14,"にんにく":30,"ガーリック":30,
  // 果物
  "いちご":4,"苺":4,"バナナ":5,"りんご":14,"みかん":14,
  "オレンジ":14,"グレープフルーツ":14,"レモン":14,"ライム":14,
  "ぶどう":5,"桃":4,"もも":4,"梨":7,"なし":7,"柿":7,
  "キウイ":7,"メロン":5,"スイカ":5,"パイナップル":5,
  // 練り物・加工食品
  "かまぼこ":7,"ちくわ":7,"はんぺん":4,"さつま揚げ":4,
  "こんにゃく":7,"しらたき":7,
  // 惣菜・調理済み
  "惣菜":2,"弁当":1,"おにぎり":1,"サラダ":2,"揚げ物":2,"から揚げ":2,
  // パン・麺
  "食パン":5,"パン":4,"バゲット":2,"ベーグル":3,
  "生麺":3,"うどん":3,"そば":3,"ラーメン":3,"パスタ":3,
  // その他
  "もずく":14,"わかめ":14,"昆布":30,"のり":180,
  "漬物":14,"キムチ":30,"梅干し":365,
  "味噌":90,"みそ":90,
};
const DS = {maxTime:30,dishCount:"少なめ",spiceLevel:"普通",cookStyle:"何でも",riceSize:"普通"};

function predExp(name, pd) {
  const d = new Date(pd); let days = 7;
  for (const [k,v] of Object.entries(EM)) { if (name.includes(k)) { days=v; break; } }
  d.setDate(d.getDate()+days);
  return d.toISOString().split("T")[0];
}
function daysTo(exp) { const n=new Date(); n.setHours(0,0,0,0); return Math.ceil((new Date(exp)-n)/86400000); }
function ec(d) { return d<=1?RD:d<=3?YW:GN; }
function el(d) { return d<0?"期限切れ":d===0?"今日まで":d+"日後"; }
function xj(t) {
  try { return JSON.parse(t.trim()); } catch(_) {}
  const s = t.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
  try { return JSON.parse(s); } catch(_) {}
  const a=t.indexOf("{"),b=t.lastIndexOf("}");
  if(a>=0&&b>=0) { try { return JSON.parse(t.slice(a,b+1)); } catch(_) {} }
  return null;
}
function sv(k,v) { try { localStorage.setItem(k,JSON.stringify(v)); } catch(e) {} }
function ld(k,d) { try { const v=localStorage.getItem(k); return v?JSON.parse(v):d; } catch(e) { return d; } }

// Cloud sync helpers
async function cloudGet(uid, key, def) {
  try {
    const res = await fetch(`/api/data?action=get&key=${key}`, {
      headers: { Authorization: `Bearer ${uid}` }
    });
    const data = await res.json();
    return data.value ? JSON.parse(data.value) : def;
  } catch(e) { return def; }
}
async function cloudSet(uid, key, value) {
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${uid}` },
      body: JSON.stringify({ action: 'set', key, value: JSON.stringify(value) })
    });
  } catch(e) {}
}

// ---- Segment Control ----
function Seg({label, options, value, onChange}) {
  return (
    <div style={{marginBottom:20}}>
      <p style={{fontSize:12,color:MU,marginBottom:8}}>{label}</p>
      <div style={{display:"flex",gap:4,background:CD,borderRadius:10,padding:4}}>
        {options.map(o => (
          <button key={o} onClick={()=>onChange(o)} style={{flex:1,padding:"8px 4px",background:value===o?SF:"transparent",border:value===o?"1px solid #3A3835":"1px solid transparent",borderRadius:7,color:value===o?TX:MU,fontSize:12,fontWeight:value===o?700:400,fontFamily:"'Syne',sans-serif",cursor:"pointer",transition:"all .15s"}}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Login Screen ----
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  const doLogin = async () => {
    if (!email || !pass) { setErr("メールアドレスとパスワードを入力してください"); return; }
    setLoading(true); setErr("");
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch(e) {
      const m = {"auth/invalid-credential":"メールアドレスまたはパスワードが間違っています","auth/invalid-email":"メールアドレスの形式が正しくありません","auth/too-many-requests":"しばらく待ってから試してください","auth/network-request-failed":"ネットワークエラーです"};
      setErr(m[e.code] || "ログインに失敗しました ("+e.code+")");
    } finally { setLoading(false); }
  };

  const inputStyle = {width:"100%",background:SF,border:"1px solid #2E2D2B",borderRadius:12,padding:"14px 16px",color:TX,fontSize:16,outline:"none",WebkitAppearance:"none",fontFamily:"'Noto Sans JP',sans-serif"};

  return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Noto+Sans+JP:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::placeholder{color:#3A3835;}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes modalIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{width:"100%",maxWidth:360,animation:"fadeUp .5s ease",fontFamily:"'Syne',sans-serif",color:TX}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:44,marginBottom:12}}>🍳</div>
          <h1 style={{fontSize:34,fontWeight:800,letterSpacing:-1.5}}><span style={{color:A}}>ひとり</span>めし</h1>
          <p style={{fontSize:11,color:MU,marginTop:8,letterSpacing:2,textTransform:"uppercase"}}>1人分レシピ &amp; 冷蔵庫管理</p>
        </div>

        <div style={{marginBottom:14}}>
          <label htmlFor="login-email" style={{display:"block",fontSize:11,color:MU,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>メールアドレス</label>
          <input id="login-email" type="email" value={email} onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&document.getElementById("login-pass")?.focus()}
            placeholder="example@mail.com" inputMode="email" autoComplete="email" style={inputStyle}/>
        </div>
        <div style={{marginBottom:14}}>
          <label htmlFor="login-pass" style={{display:"block",fontSize:11,color:MU,letterSpacing:1,textTransform:"uppercase",marginBottom:7}}>パスワード</label>
          <input id="login-pass" type="password" value={pass} onChange={e=>setPass(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&doLogin()}
            placeholder="••••••••" autoComplete="current-password" style={inputStyle}/>
        </div>

        <button onClick={doLogin} disabled={loading} aria-busy={loading}
          style={{width:"100%",padding:16,background:loading?"#2A2927":A,color:loading?MU:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,fontFamily:"'Syne',sans-serif",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:24}}>
          {loading?<><span style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>ログイン中…</>:"ログイン"}
        </button>

        {err && <div role="alert" style={{background:"rgba(255,85,85,.1)",border:"1px solid rgba(255,85,85,.3)",borderRadius:10,padding:"12px 14px",fontSize:13,color:RD,fontFamily:"'Noto Sans JP',sans-serif",marginTop:14,lineHeight:1.5}}>{err}</div>}

        <div style={{textAlign:"center",marginTop:24}}>
          <button onClick={()=>setShowSignup(true)}
            style={{background:"transparent",border:"none",color:MU,fontSize:13,fontFamily:"'Noto Sans JP',sans-serif",cursor:"pointer",textDecoration:"underline"}}>
            アカウントをお持ちでない方はこちら
          </button>
        </div>
      </div>

      {showSignup && <SignupModal onClose={()=>setShowSignup(false)}/>}
    </div>
  );
}

// ---- Signup Modal ----
function SignupModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!email) e.email = "メールアドレスを入力してください";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "正しいメールアドレスの形式で入力してください";
    if (!pass) e.pass = "パスワードを入力してください";
    else if (pass.length < 6) e.pass = "パスワードは6文字以上にしてください";
    else if (!/[A-Z]/.test(pass)) e.pass = "大文字を1文字以上含めてください";
    else if (!/[0-9]/.test(pass)) e.pass = "数字を1文字以上含めてください";
    if (!passConfirm) e.passConfirm = "パスワード（確認）を入力してください";
    else if (pass !== passConfirm) e.passConfirm = "パスワードが一致しません";
    return e;
  };

  const doSignup = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      setSuccess(true);
    } catch(err) {
      const m = {
        "auth/email-already-in-use":"このメールアドレスはすでに登録されています",
        "auth/invalid-email":"正しいメールアドレスの形式で入力してください",
        "auth/weak-password":"パスワードが弱すぎます",
        "auth/network-request-failed":"ネットワークエラーです"
      };
      setErrors({general: m[err.code] || "登録に失敗しました ("+err.code+")"});
    } finally { setLoading(false); }
  };

  const inputStyle = (hasErr) => ({
    width:"100%",background:"#1A1916",border:"1px solid "+(hasErr?"#FF5555":"#2E2D2B"),
    borderRadius:12,padding:"14px 16px",color:"#F5F0E8",fontSize:15,outline:"none",
    WebkitAppearance:"none",fontFamily:"'Noto Sans JP',sans-serif",marginTop:6
  });

  const errStyle = {fontSize:12,color:RD,marginTop:4,fontFamily:"'Noto Sans JP',sans-serif",lineHeight:1.5};

  return (
    <div role="dialog" aria-modal="true" aria-label="新規ユーザー登録"
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0"}}>
      <div style={{background:BG,borderRadius:"20px 20px 0 0",padding:"28px 24px 48px",width:"100%",maxWidth:480,border:"1px solid #2A2927",animation:"modalIn .3s ease",maxHeight:"90vh",overflowY:"auto"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontSize:18,fontWeight:800,letterSpacing:-.5}}>新規ユーザー登録</h2>
          <button onClick={onClose} aria-label="閉じる"
            style={{background:"none",border:"none",color:MU,fontSize:24,cursor:"pointer",lineHeight:1,padding:4}}>×</button>
        </div>

        {success ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:48,marginBottom:16}}>🎉</div>
            <p style={{fontSize:16,fontWeight:700,marginBottom:8}}>登録完了！</p>
            <p style={{fontSize:14,color:MU,fontFamily:"'Noto Sans JP',sans-serif",lineHeight:1.7,marginBottom:24}}>アカウントが作成されました。<br/>このままアプリを使い始めてください！</p>
            <button onClick={onClose}
              style={{background:A,border:"none",borderRadius:12,padding:"13px 32px",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"'Syne',sans-serif",cursor:"pointer"}}>
              はじめる
            </button>
          </div>
        ) : (
          <>
            <div style={{marginBottom:16}}>
              <label htmlFor="su-email" style={{fontSize:11,color:MU,letterSpacing:1,textTransform:"uppercase",display:"block"}}>メールアドレス <span style={{color:RD}}>*</span></label>
              <input id="su-email" type="email" value={email} onChange={e=>{setEmail(e.target.value);setErrors(p=>({...p,email:""}));}}
                placeholder="example@mail.com" inputMode="email" autoComplete="email" style={inputStyle(!!errors.email)} aria-describedby={errors.email?"su-email-err":undefined} aria-invalid={!!errors.email}/>
              {errors.email && <p id="su-email-err" role="alert" style={errStyle}>⚠ {errors.email}</p>}
            </div>

            <div style={{marginBottom:16}}>
              <label htmlFor="su-pass" style={{fontSize:11,color:MU,letterSpacing:1,textTransform:"uppercase",display:"block"}}>パスワード <span style={{color:RD}}>*</span></label>
              <input id="su-pass" type="password" value={pass} onChange={e=>{setPass(e.target.value);setErrors(p=>({...p,pass:""}));}}
                placeholder="例: Hello123" autoComplete="new-password" style={inputStyle(!!errors.pass)} aria-describedby="su-pass-hint su-pass-err" aria-invalid={!!errors.pass}/>
              <p id="su-pass-hint" style={{fontSize:11,color:MU,marginTop:4,fontFamily:"'Noto Sans JP',sans-serif"}}>6文字以上・大文字1文字以上・数字1文字以上</p>
              {errors.pass && <p id="su-pass-err" role="alert" style={errStyle}>⚠ {errors.pass}</p>}
            </div>

            <div style={{marginBottom:24}}>
              <label htmlFor="su-pass2" style={{fontSize:11,color:MU,letterSpacing:1,textTransform:"uppercase",display:"block"}}>パスワード（確認） <span style={{color:RD}}>*</span></label>
              <input id="su-pass2" type="password" value={passConfirm} onChange={e=>{setPassConfirm(e.target.value);setErrors(p=>({...p,passConfirm:""}));}}
                onKeyDown={e=>e.key==="Enter"&&doSignup()}
                placeholder="もう一度入力" autoComplete="new-password" style={inputStyle(!!errors.passConfirm)} aria-describedby={errors.passConfirm?"su-pass2-err":undefined} aria-invalid={!!errors.passConfirm}/>
              {errors.passConfirm && <p id="su-pass2-err" role="alert" style={errStyle}>⚠ {errors.passConfirm}</p>}
            </div>

            {errors.general && <div role="alert" style={{background:"rgba(255,85,85,.1)",border:"1px solid rgba(255,85,85,.3)",borderRadius:10,padding:"12px 14px",fontSize:13,color:RD,fontFamily:"'Noto Sans JP',sans-serif",marginBottom:16,lineHeight:1.5}}>⚠ {errors.general}</div>}

            <button onClick={doSignup} disabled={loading} aria-busy={loading}
              style={{width:"100%",padding:16,background:loading?"#2A2927":A,color:loading?MU:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,fontFamily:"'Syne',sans-serif",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {loading?<><span style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>登録中…</>:"アカウントを作成"}
            </button>

            <button onClick={onClose}
              style={{width:"100%",padding:13,background:"transparent",border:"none",color:MU,fontSize:13,fontFamily:"'Noto Sans JP',sans-serif",cursor:"pointer",marginTop:12}}>
              キャンセル
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ---- Main App ----
function MainApp({ user }) {
  const [tab, setTab] = useState("fridge");
  const [fridge, setFridgeState] = useState(() => ld("fridge",[]));
  const [settings, setSettingsState] = useState(() => ({...DS,...ld("settings",{})}));
  const [syncing, setSyncing] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanLabel, setScanLabel] = useState("");
  const [scanErr, setScanErr] = useState("");
  const [scanData, setScanData] = useState(null);
  const [cfmSel, setCfmSel] = useState(new Set());
  const [manualOpen, setManualOpen] = useState(false);
  const [editingExpiry, setEditingExpiry] = useState(null); // {id, expiry}
  const [mName, setMName] = useState("");
  const [mQty, setMQty] = useState(1);
  const [mDate, setMDate] = useState(new Date().toISOString().split("T")[0]);
  const [selIds, setSelIds] = useState(new Set());
  const [selQty, setSelQty] = useState({});
  const [generating, setGenerating] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [recipeTab, setRecipeTab] = useState("作り方");
  const [recipeErr, setRecipeErr] = useState("");
  const [shopChk, setShopChk] = useState(new Set());
  const fileRef = useRef();

  const setFridge = v => { setFridgeState(v); sv("fridge",v); cloudSet(user.uid,"fridge",v); };
  const setSettings = v => { setSettingsState(v); sv("settings",v); cloudSet(user.uid,"settings",v); };

  // Load from cloud on mount
  useEffect(() => {
    Promise.all([
      cloudGet(user.uid, "fridge", []),
      cloudGet(user.uid, "settings", DS)
    ]).then(([f, s]) => {
      if (f && f.length > 0) { setFridgeState(f); sv("fridge", f); }
      setSettingsState(prev => ({...DS, ...s}));
      setSyncing(false);
    }).catch(() => setSyncing(false));
  }, [user.uid]);

  const sorted = [...fridge].sort((a,b) => new Date(a.expiry)-new Date(b.expiry));

  const addManual = () => {
    if (!mName.trim()) return;
    const item = {id:Date.now()+"_"+mName+"_"+Math.random(),name:mName.trim(),purchaseDate:mDate,expiry:predExp(mName.trim(),mDate),qty:Math.max(1,mQty)};
    setFridge([...fridge, item]);
    setMName(""); setMQty(1);
  };

  const setP = (pct, lbl) => { setScanStep(pct); setScanLabel(lbl); };

  const scanReceipt = async (file) => {
    setScanning(true); setScanErr(""); setScanData(null); setCfmSel(new Set());
    const steps=[{p:15,l:"画像を読み込み中…"},{p:35,l:"レシートの向きを確認中…"},{p:55,l:"日付・店名を解析中…"},{p:75,l:"商品リストを読み取り中…"},{p:90,l:"金額を確認中…"}];
    let idx=0;
    const tk = setInterval(()=>{ if(idx<steps.length){setP(steps[idx].p,steps[idx].l);idx++;} },1000);
    try {
      // Compress image before sending
      const b64 = await new Promise((res, rej) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 1200;
          let w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else { w = Math.round(w * MAX / h); h = MAX; }
          }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          const data = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
          URL.revokeObjectURL(url);
          res(data);
        };
        img.onerror = rej;
        img.src = url;
      });
      const today = new Date().toISOString().split("T")[0];
      const h = {"Content-Type":"application/json"};
      const res = await fetch("/api/chat",{method:"POST",headers:h,body:JSON.stringify({
        model:"claude-sonnet-4-6",max_tokens:2000,
        system:"あなたは日本のスーパーやコンビニのレシートを読み取る専門家です。JSONのみ返してください。",
        messages:[{role:"user",content:[
          {type:"image",source:{type:"base64",media_type:file.type||"image/jpeg",data:b64}},
          {type:"text",text:"このレシート画像を注意深く読み取ってください。今日は"+today+"です。\nJSONのみで返答（マークダウン不要）:\n{\"store\":\"店名\",\"date\":\"YYYY-MM-DD\",\"items\":[{\"name\":\"商品名\",\"price\":198,\"qty\":1,\"expiryDays\":7}]}\n\nルール:\n1. 日付はYYYY-MM-DD形式(令和6年=2024年)。不明なら"+today+"\n2. 全商品を列挙。消費税・合計・支払方法は除外\n3. expiryDaysは購入日からの賞味期限日数をAIが推定:\n   刺身・生魚:1-2日 / 生肉・ひき肉:2-3日 / 加工肉:7日\n   豆腐:4日 / 納豆:7日 / 卵:21日 / 牛乳:7日 / チーズ:14日\n   葉物野菜:4-5日 / 根菜:14-30日 / 果物:3-7日\n   惣菜・弁当:1-2日 / パン:3-5日 / 冷凍品:90日 / 缶詰:365日"}
        ]}]
      })});
      if(!res.ok){const t=await res.text();setScanErr("APIエラー("+res.status+"): "+t.slice(0,80));return;}
      const data = await res.json();
      const parsed = xj((data.content||[]).map(b=>b.text||"").join(""));
      if(!parsed||!parsed.items||!parsed.items.length){setScanErr("読み取り失敗。画像が鮮明か確認してください。");return;}
      setScanData(parsed);
      setCfmSel(new Set(parsed.items.map((_,i)=>i)));
    } catch(e) { setScanErr("エラー: "+e.message); }
    finally {
      clearInterval(tk); setP(100,"完了！");
      setTimeout(()=>{ setScanning(false); setScanStep(0); setScanLabel(""); },600);
    }
  };

  const confirmScan = () => {
    if(!scanData) return;
    const pd = scanData.date||new Date().toISOString().split("T")[0];
    const newItems = scanData.items.filter((_,i)=>cfmSel.has(i)).map(it=>{
      let expiry;
      if (it.expiryDays) {
        const d = new Date(pd);
        d.setDate(d.getDate() + it.expiryDays);
        expiry = d.toISOString().split("T")[0];
      } else {
        expiry = predExp(it.name, pd);
      }
      return {id:Date.now()+"_"+it.name+"_"+Math.random(),name:it.name,purchaseDate:pd,expiry,qty:it.qty||1};
    });
    setFridge([...fridge,...newItems]);
    setScanData(null);
  };

  const genRecipe = async () => {
    const chosen = fridge.filter(i=>selIds.has(i.id));
    if(!chosen.length) return;
    setGenerating(true); setRecipeErr(""); setRecipe(null);
    try {
      const {maxTime,dishCount,spiceLevel,cookStyle,riceSize} = settings;
      const dn = dishCount==="少なめ"?"できるだけ少ない調理器具で":dishCount==="多くてもOK"?"洗い物は気にしない":"洗い物は普通程度で";
      const ingredientList = chosen.map(i=>`${i.name}(在庫${i.qty}個)`).join(", ");
      const p = `食材: ${ingredientList}。1人分のレシピ1つ。条件: ${maxTime}分以内、${dn}、味は${spiceLevel}、ご飯の量は${riceSize}${cookStyle!=="何でも"?"、"+cookStyle+"を優先":""}。
ご飯の量(${riceSize})に合わせて各食材の適切な使用個数をAIが判断すること。在庫数を超えないこと。
JSONのみ返答: {"name":"料理名","emoji":"🍳","time":"15分","difficulty":"簡単","description":"説明","calories":"400kcal","protein":"15g","carbs":"50g","fat":"10g","steps":["手順1","手順2","手順3"],"missing":[],"tip":"コツ","dishes":"使う調理器具","usedQty":{"食材名":使用個数}}
usedQtyには使用する食材名と個数を必ず含めること。`;
      const h = {"Content-Type":"application/json"};
      const res = await fetch("/api/chat",{method:"POST",headers:h,body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:"日本語でJSONのみで返答。マークダウン不要。",messages:[{role:"user",content:p}]})});
      if(!res.ok){const t=await res.text();setRecipeErr("APIエラー("+res.status+"): "+t.slice(0,80));return;}
      const data = await res.json();
      const parsed = xj((data.content||[]).map(b=>b.text||"").join(""));
      if(!parsed){setRecipeErr("パースエラー。もう一度試してください。");return;}
      setRecipe(parsed); setRecipeTab("作り方"); setShopChk(new Set());
      // Use AI-decided quantities, fall back to 1 if not specified
      const aiUsedQty = parsed.usedQty || {};
      setFridge(prev => {
        return prev.map(item => {
          if (!selIds.has(item.id)) return item;
          const used = aiUsedQty[item.name] || 1;
          const remaining = item.qty - used;
          if (remaining <= 0) return null;
          return {...item, qty: remaining};
        }).filter(Boolean);
      });
      setSelIds(new Set()); setSelQty({});
    } catch(e) { setRecipeErr("エラー: "+e.message); }
    finally { setGenerating(false); }
  };

  const btnStyle = (on) => ({flex:1,padding:"9px",background:on?A:"transparent",border:"none",borderRadius:10,color:on?"#fff":MU,fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",cursor:"pointer",transition:"all .2s"});

  return (
    <div style={{minHeight:"100vh",background:BG,color:TX,fontFamily:"'Syne',sans-serif",paddingBottom:80,maxWidth:480,margin:"0 auto"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Noto+Sans+JP:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}::placeholder{color:#3A3835;}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.5)}input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:#2A2927;outline:none}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#FF6B35;cursor:pointer}`}</style>

      {/* Header */}
      <div style={{padding:"18px 20px 14px",borderBottom:"1px solid #2A2927",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:6}}>
          <span style={{fontSize:22,fontWeight:800,letterSpacing:-1,color:A}}>ひとり</span>
          <span style={{fontSize:22,fontWeight:800,letterSpacing:-1}}>めし</span>
          {syncing && <span style={{fontSize:10,color:MU,marginLeft:4}}>同期中…</span>}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>

          <button onClick={()=>setMenuOpen(s=>!s)} style={{background:"none",border:"none",padding:4,cursor:"pointer",display:"flex",flexDirection:"column",gap:4}}>
            {[0,1,2].map(i=><span key={i} style={{display:"block",width:20,height:2,background:TX,borderRadius:2,transition:"all .2s",transform:menuOpen&&i===0?"rotate(45deg) translate(4px,4px)":menuOpen&&i===2?"rotate(-45deg) translate(4px,-4px)":"none",opacity:menuOpen&&i===1?0:1}}/>)}
          </button>
        </div>
        {menuOpen && (
          <div style={{position:"absolute",top:"100%",right:16,zIndex:100,background:CD,border:"1px solid #3A3835",borderRadius:12,padding:8,minWidth:160,animation:"slideDown .2s ease",boxShadow:"0 8px 32px rgba(0,0,0,.5)"}}>
            {[
              {label:"⚙️ 設定",fn:()=>{setShowSettings(true);setMenuOpen(false);}},
              {label:"🚪 ログアウト",fn:()=>{signOut(auth);setMenuOpen(false);}},
              {label:"🗑 冷蔵庫をリセット",fn:()=>{setShowReset(true);setMenuOpen(false);},danger:true}
            ].map((item,i)=>(
              <button key={i} onClick={item.fn} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",background:"none",border:"none",color:item.danger?RD:TX,fontSize:13,fontFamily:"'Noto Sans JP',sans-serif",borderRadius:8,cursor:"pointer",textAlign:"left"}}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {menuOpen && <div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:50}}/>}



      {/* Tabs */}
      <div style={{display:"flex",padding:"10px 20px 0",gap:4}}>
        <button style={btnStyle(tab==="fridge")} onClick={()=>setTab("fridge")}>冷蔵庫</button>
        <button style={btnStyle(tab==="recipe")} onClick={()=>setTab("recipe")}>レシピ</button>
      </div>

      {/* FRIDGE */}
      {tab==="fridge" && (
        <div style={{padding:"18px 20px 0",animation:"fadeUp .3s ease"}}>
          {/* Scan */}
          <div style={{marginBottom:14}}>
            <button onClick={()=>fileRef.current.click()} disabled={scanning}
              style={{width:"100%",padding:14,background:scanning?"#1A1916":SF,border:"1px dashed "+(scanning?A:"#3A3835"),borderRadius:12,color:TX,fontSize:14,fontWeight:600,fontFamily:"'Syne',sans-serif",cursor:scanning?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              {scanning
                ? <><span style={{width:16,height:16,border:"2px solid #444",borderTopColor:A,borderRadius:"50%",display:"inline-block",animation:"spin .8s linear infinite"}}/>AIが解析中</>
                : <><span style={{fontSize:20}}>📷</span>レシートをスキャンして食材を自動登録</>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{if(e.target.files[0])scanReceipt(e.target.files[0]);e.target.value="";}}/>

            {scanning && (
              <div style={{marginTop:10,background:SF,borderRadius:10,padding:"12px 14px",border:"1px solid #2A2927"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:12,color:TX,fontFamily:"'Noto Sans JP',sans-serif"}}>{scanLabel}</span>
                  <span style={{fontSize:12,fontWeight:700,color:A}}>{scanStep}%</span>
                </div>
                <div style={{height:5,background:CD,borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:scanStep+"%",background:`linear-gradient(90deg,${A},${YW})`,borderRadius:3,transition:"width .7s ease"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-around",marginTop:10}}>
                  {["画像読込","店名・日付","商品一覧","金額確認","完了"].map((s,i)=>{
                    const done = scanStep>=[15,55,75,90,100][i];
                    return (
                      <div key={i} style={{textAlign:"center"}}>
                        <div style={{width:18,height:18,borderRadius:"50%",background:done?A:CD,border:"2px solid "+(done?A:"#3A3835"),display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 4px",fontSize:10,color:"#fff",transition:"all .4s"}}>{done?"✓":""}</div>
                        <span style={{fontSize:9,color:done?A:MU}}>{s}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {scanErr && <p style={{color:RD,fontSize:12,marginTop:6,lineHeight:1.5}}>{scanErr}</p>}
          </div>

          {/* Scan confirm */}
          {scanData && (
            <div style={{background:SF,borderRadius:14,padding:16,border:"1px solid "+A,marginBottom:14,animation:"fadeUp .3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div>
                  <p style={{fontSize:14,fontWeight:700}}>{scanData.store||"店名不明"}</p>
                  <p style={{fontSize:11,color:MU,marginTop:2}}>{scanData.date}</p>
                </div>
                <span style={{fontSize:11,color:A,background:A+"22",padding:"4px 10px",borderRadius:20}}>{scanData.items.length}品を認識</span>
              </div>
              <p style={{fontSize:11,color:MU,marginBottom:10}}>冷蔵庫に追加する食材を選んでください</p>
              {scanData.items.map((it,i)=>(
                <div key={i} onClick={()=>{const s=new Set(cfmSel);s.has(i)?s.delete(i):s.add(i);setCfmSel(s);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #2A2927",cursor:"pointer"}}>
                  <div style={{width:18,height:18,borderRadius:5,border:"2px solid "+(cfmSel.has(i)?A:"#3A3835"),background:cfmSel.has(i)?A:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"#fff",transition:"all .15s"}}>{cfmSel.has(i)?"✓":""}</div>
                  <span style={{flex:1,fontSize:13,fontFamily:"'Noto Sans JP',sans-serif",color:cfmSel.has(i)?TX:MU}}>{it.name}</span>
                  {it.price>0 && <span style={{fontSize:11,color:MU}}>¥{it.price}</span>}
                </div>
              ))}
              <div style={{display:"flex",gap:8,marginTop:14}}>
                <button onClick={()=>setScanData(null)} style={{flex:1,padding:10,background:"transparent",border:"1px solid #3A3835",borderRadius:9,color:MU,fontSize:13,fontFamily:"'Syne',sans-serif",cursor:"pointer"}}>キャンセル</button>
                <button onClick={confirmScan} disabled={cfmSel.size===0} style={{flex:2,padding:10,background:cfmSel.size>0?A:"#2A2927",border:"none",borderRadius:9,color:cfmSel.size>0?"#fff":MU,fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",cursor:cfmSel.size>0?"pointer":"not-allowed"}}>{cfmSel.size}品を追加する</button>
              </div>
            </div>
          )}

          {/* Manual add */}
          <button onClick={()=>setManualOpen(s=>!s)} style={{width:"100%",padding:10,background:"transparent",border:"1px solid #2E2D2B",borderRadius:10,color:MU,fontSize:13,fontFamily:"'Syne',sans-serif",cursor:"pointer",marginBottom:12}}>
            {manualOpen?"▲ 閉じる":"+ 手動で食材を追加"}
          </button>
          {manualOpen && (
            <div style={{background:SF,borderRadius:12,padding:14,marginBottom:14,border:"1px solid #2E2D2B"}}>
              <input value={mName} onChange={e=>setMName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addManual()} placeholder="食材名（例: 卵）"
                style={{width:"100%",background:CD,border:"1px solid #3A3835",borderRadius:8,padding:"10px 12px",color:TX,fontSize:14,outline:"none",fontFamily:"'Noto Sans JP',sans-serif",marginBottom:8}}/>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                <label style={{fontSize:12,color:MU,whiteSpace:"nowrap"}}>個数</label>
                <div style={{display:"flex",alignItems:"center",gap:0,background:CD,border:"1px solid #3A3835",borderRadius:8,overflow:"hidden"}}>
                  <button onClick={()=>setMQty(q=>Math.max(1,q-1))} style={{width:36,height:36,background:"none",border:"none",color:TX,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                  <span style={{minWidth:32,textAlign:"center",fontSize:14,color:TX,fontWeight:700}}>{mQty}</span>
                  <button onClick={()=>setMQty(q=>Math.min(99,q+1))} style={{width:36,height:36,background:"none",border:"none",color:TX,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>＋</button>
                </div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <label style={{fontSize:12,color:MU,whiteSpace:"nowrap"}}>購入日</label>
                <input type="date" value={mDate} onChange={e=>setMDate(e.target.value)}
                  style={{flex:1,background:CD,border:"1px solid #3A3835",borderRadius:8,padding:"9px 12px",color:TX,fontSize:13,outline:"none"}}/>
                <button onClick={addManual} style={{background:A,border:"none",borderRadius:8,padding:"9px 16px",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",cursor:"pointer",whiteSpace:"nowrap"}}>追加</button>
              </div>
            </div>
          )}

          {/* Fridge list */}
          {sorted.length===0 ? (
            <div style={{textAlign:"center",padding:"40px 0",opacity:.4}}>
              <div style={{fontSize:40,marginBottom:12}}>🛒</div>
              <p style={{color:MU,fontSize:14,fontFamily:"'Noto Sans JP',sans-serif"}}>レシートをスキャンして食材を登録しよう</p>
            </div>
          ) : (
            <>
              <p style={{fontSize:11,color:MU,marginBottom:10,letterSpacing:1}}>{sorted.length}品 ・ 賞味期限順</p>
              {sorted.map(it=>{
                const d=daysTo(it.expiry),c=ec(d);
                return (
                  <div key={it.id} style={{background:SF,borderRadius:12,marginBottom:8,border:"1px solid #2A2927",overflow:"hidden"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px"}}>
                      <div style={{flex:1}}>
                        <p style={{fontSize:15,fontFamily:"'Noto Sans JP',sans-serif",fontWeight:500}}>{it.name}{it.qty>1&&<span style={{fontSize:12,color:MU,marginLeft:6}}>×{it.qty}</span>}</p>
                        <p style={{fontSize:11,color:MU,marginTop:2}}>購入: {it.purchaseDate}</p>
                      </div>
                      <span onClick={()=>setEditingExpiry(editingExpiry?.id===it.id?null:{id:it.id,expiry:it.expiry})}
                        style={{fontSize:12,fontWeight:700,color:c,background:c+"22",padding:"3px 10px",borderRadius:20,cursor:"pointer",userSelect:"none"}}>
                        {el(d)} ✎
                      </span>
                      <button onClick={()=>setFridge(fridge.filter(i=>i.id!==it.id))} style={{background:"none",border:"none",color:MU,fontSize:18,padding:"0 2px",lineHeight:1,cursor:"pointer"}}>×</button>
                    </div>
                    {editingExpiry?.id===it.id && (
                      <div style={{padding:"0 14px 12px",borderTop:"1px solid #2A2927",display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:12,color:MU,whiteSpace:"nowrap",fontFamily:"'Noto Sans JP',sans-serif"}}>賞味期限:</span>
                        <input type="date" value={editingExpiry.expiry} onChange={e=>setEditingExpiry(prev=>({...prev,expiry:e.target.value}))}
                          style={{flex:1,background:CD,border:"1px solid #3A3835",borderRadius:8,padding:"7px 10px",color:TX,fontSize:13,outline:"none"}}/>
                        <button onClick={()=>{setFridge(f=>f.map(i=>i.id===it.id?{...i,expiry:editingExpiry.expiry}:i));setEditingExpiry(null);}}
                          style={{background:A,border:"none",borderRadius:8,padding:"7px 14px",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",cursor:"pointer",whiteSpace:"nowrap"}}>保存</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* RECIPE */}
      {tab==="recipe" && (
        <div style={{padding:"18px 20px 0",animation:"fadeUp .3s ease"}}>
          {/* Settings badges */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}} onClick={()=>setShowSettings(true)}>
            {[`⏱ ${settings.maxTime}分`,`🍚 ${settings.riceSize}`,`🍽 ${settings.dishCount}`,`🧂 ${settings.spiceLevel}`,...(settings.cookStyle!=="何でも"?[`🔥 ${settings.cookStyle}`]:[])].map((b,i)=>(
              <span key={i} style={{fontSize:11,color:BL,background:BL+"18",border:"1px solid "+BL+"33",padding:"4px 10px",borderRadius:20,cursor:"pointer"}}>{b}</span>
            ))}
          </div>

          {fridge.length===0 ? (
            <div style={{textAlign:"center",padding:"40px 0",opacity:.4}}>
              <div style={{fontSize:40,marginBottom:12}}>🥘</div>
              <p style={{color:MU,fontSize:14,fontFamily:"'Noto Sans JP',sans-serif"}}>まず冷蔵庫に食材を登録してください</p>
            </div>
          ) : (
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <p style={{fontSize:12,color:MU,letterSpacing:1}}>使う食材を選択</p>
                <button onClick={()=>{setSelIds(new Set(sorted.slice(0,4).map(i=>i.id)));setSelQty({});}} style={{background:"transparent",border:"1px solid #3A3835",borderRadius:8,padding:"5px 12px",color:YW,fontSize:12,fontFamily:"'Syne',sans-serif",cursor:"pointer"}}>⚡ 期限順で自動選択</button>
              </div>
              {sorted.map(it=>{
                const s=selIds.has(it.id),d=daysTo(it.expiry),c=ec(d);
                return (
                  <div key={it.id} onClick={()=>{const ns=new Set(selIds);ns.has(it.id)?ns.delete(it.id):ns.add(it.id);setSelIds(ns);}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:s?CD:SF,borderRadius:12,marginBottom:8,border:"1px solid "+(s?A:"#2A2927"),cursor:"pointer",transition:"all .15s"}}>
                    <div style={{width:20,height:20,borderRadius:6,border:"2px solid "+(s?A:"#3A3835"),background:s?A:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,color:"#fff",transition:"all .15s"}}>{s?"✓":""}</div>
                    <p style={{flex:1,fontSize:14,fontFamily:"'Noto Sans JP',sans-serif"}}>{it.name}{it.qty>1&&<span style={{fontSize:12,color:MU,marginLeft:6}}>在庫×{it.qty}</span>}</p>
                    <span style={{fontSize:11,color:c,background:c+"22",padding:"2px 8px",borderRadius:20}}>{el(d)}</span>
                  </div>
                );
              })}
              <button onClick={genRecipe} disabled={selIds.size===0||generating}
                style={{width:"100%",padding:15,marginTop:8,background:selIds.size===0||generating?"#2A2927":A,color:selIds.size===0||generating?MU:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,fontFamily:"'Syne',sans-serif",cursor:selIds.size===0||generating?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .2s"}}>
                {generating?<><span style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .8s linear infinite"}}/>レシピを考え中…</>:`🍳 ${selIds.size}品でレシピを作る`}
              </button>
              {recipeErr && <p style={{color:RD,fontSize:12,marginTop:8,lineHeight:1.5}}>{recipeErr}</p>}
            </>
          )}

          {/* Recipe result */}
          {recipe && (
            <div style={{marginTop:20,animation:"fadeUp .4s ease"}}>
              <div style={{background:SF,borderRadius:16,padding:18,border:"1px solid #2E2D2B",marginBottom:8}}>
                <div style={{fontSize:32,marginBottom:6}}>{recipe.emoji}</div>
                <h2 style={{fontSize:20,fontWeight:800,letterSpacing:-.5}}>{recipe.name}</h2>
                <p style={{fontSize:13,color:MU,marginTop:4,fontFamily:"'Noto Sans JP',sans-serif"}}>{recipe.description}</p>
                {recipe.dishes && <p style={{fontSize:11,color:MU,marginTop:5,fontFamily:"'Noto Sans JP',sans-serif"}}>🍽 {recipe.dishes}</p>}
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  {[{i:"⏱",v:recipe.time},{i:"📊",v:recipe.difficulty},{i:"🔥",v:recipe.calories}].map((x,i)=>(
                    <div key={i} style={{flex:1,background:CD,borderRadius:10,padding:"9px 6px",textAlign:"center"}}>
                      <div style={{fontSize:14}}>{x.i}</div>
                      <div style={{fontSize:11,color:TX,fontWeight:600,marginTop:2}}>{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{display:"flex",gap:2,marginBottom:10,background:SF,borderRadius:12,padding:4}}>
                {["作り方","栄養","買い物"].map(t=>(
                  <button key={t} onClick={()=>setRecipeTab(t)} style={{flex:1,padding:"8px 4px",background:recipeTab===t?CD:"transparent",border:"none",borderRadius:9,color:recipeTab===t?TX:MU,fontSize:13,fontWeight:recipeTab===t?700:400,fontFamily:"'Syne',sans-serif",cursor:"pointer",transition:"all .2s"}}>
                    {t}{t==="買い物"&&recipe.missing?.length?` (${recipe.missing.length})`:""}
                  </button>
                ))}
              </div>

              <div style={{background:SF,borderRadius:16,padding:18,border:"1px solid #2E2D2B"}}>
                {recipeTab==="作り方" && (
                  <div>
                    {(recipe.steps||[]).map((s,i)=>(
                      <div key={i} style={{display:"flex",gap:12,marginBottom:14}}>
                        <div style={{width:24,height:24,borderRadius:"50%",background:i===0?A:CD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,color:i===0?"#fff":MU}}>{i+1}</div>
                        <p style={{fontSize:14,lineHeight:1.7,color:TX,fontFamily:"'Noto Sans JP',sans-serif",paddingTop:2}}>{s}</p>
                      </div>
                    ))}
                    {recipe.tip && <div style={{marginTop:12,background:CD,borderRadius:10,padding:"11px 13px",borderLeft:"3px solid "+GN,display:"flex",gap:10}}><span>💡</span><p style={{fontSize:13,color:TX,fontFamily:"'Noto Sans JP',sans-serif",lineHeight:1.6}}>{recipe.tip}</p></div>}
                  </div>
                )}
                {recipeTab==="栄養" && (
                  <div>
                    {[{l:"カロリー",v:recipe.calories,m:800,c:A},{l:"タンパク質",v:recipe.protein,m:60,c:GN},{l:"炭水化物",v:recipe.carbs,m:100,c:BL},{l:"脂質",v:recipe.fat,m:50,c:YW}].map((n,i)=>(
                      <div key={i} style={{marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:MU}}>{n.l}</span><span style={{fontSize:12,color:TX}}>{n.v}</span></div>
                        <div style={{height:4,background:"#2A2927",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:Math.min((parseInt(n.v)/n.m)*100,100)+"%",background:n.c,borderRadius:2,transition:"width .8s"}}/></div>
                      </div>
                    ))}
                    <p style={{fontSize:11,color:MU,marginTop:12,textAlign:"center",fontFamily:"'Noto Sans JP',sans-serif"}}>※ 目安値です</p>
                  </div>
                )}
                {recipeTab==="買い物" && (
                  <div>
                    {!recipe.missing?.length ? (
                      <div style={{textAlign:"center",padding:"16px 0"}}><p style={{fontSize:22,marginBottom:6}}>✅</p><p style={{color:MU,fontSize:13,fontFamily:"'Noto Sans JP',sans-serif"}}>追加食材なし！</p></div>
                    ) : recipe.missing.map((name,i)=>(
                      <div key={i} onClick={()=>{const s=new Set(shopChk);s.has(i)?s.delete(i):s.add(i);setShopChk(s);}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #2A2927",cursor:"pointer"}}>
                        <div style={{width:20,height:20,borderRadius:6,border:"2px solid "+(shopChk.has(i)?GN:"#3A3835"),background:shopChk.has(i)?GN:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,color:"#fff",transition:"all .2s"}}>{shopChk.has(i)?"✓":""}</div>
                        <span style={{fontSize:14,fontFamily:"'Noto Sans JP',sans-serif",textDecoration:shopChk.has(i)?"line-through":"none",color:shopChk.has(i)?MU:TX}}>{name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div onClick={()=>setShowSettings(false)} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:BG,borderRadius:"20px 20px 0 0",padding:"24px 20px 40px",width:"100%",maxWidth:480,border:"1px solid #2A2927",animation:"fadeUp .25s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <span style={{fontSize:15,fontWeight:700}}>レシピ設定</span>
              <button onClick={()=>setShowSettings(false)} style={{background:"none",border:"none",color:MU,fontSize:22,cursor:"pointer"}}>×</button>
            </div>
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:13,color:TX,fontFamily:"'Noto Sans JP',sans-serif"}}>⏱ 最大調理時間</span>
                <span style={{fontSize:18,fontWeight:800,color:A}}>{settings.maxTime}<span style={{fontSize:12,color:MU,fontWeight:400}}>分</span></span>
              </div>
              <input type="range" min={5} max={60} step={5} value={settings.maxTime} onChange={e=>setSettings({...settings,maxTime:+e.target.value})}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontSize:10,color:MU}}>5分</span><span style={{fontSize:10,color:MU}}>60分</span></div>
            </div>
            <Seg label="🍚 ご飯の量" options={["小","普通","大","大盛り"]} value={settings.riceSize} onChange={v=>setSettings({...settings,riceSize:v})}/>
            <Seg label="🍽 洗い物の量" options={["少なめ","普通","多くてもOK"]} value={settings.dishCount} onChange={v=>setSettings({...settings,dishCount:v})}/>
            <Seg label="🧂 味の濃さ" options={["薄め","普通","濃いめ"]} value={settings.spiceLevel} onChange={v=>setSettings({...settings,spiceLevel:v})}/>
            <Seg label="🔥 調理スタイル" options={["何でも","炒め物","煮物","レンジ"]} value={settings.cookStyle} onChange={v=>setSettings({...settings,cookStyle:v})}/>
            <button onClick={()=>setSettings({...DS})} style={{width:"100%",marginTop:4,padding:11,background:"transparent",border:"1px solid #3A3835",borderRadius:10,color:MU,fontSize:13,fontFamily:"'Syne',sans-serif",cursor:"pointer"}}>デフォルトに戻す</button>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showReset && (
        <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:CD,borderRadius:16,padding:24,border:"1px solid #3A3835",width:"100%",maxWidth:320,animation:"fadeUp .2s ease"}}>
            <p style={{fontSize:16,fontWeight:700,marginBottom:8}}>冷蔵庫をリセット</p>
            <p style={{fontSize:14,color:MU,fontFamily:"'Noto Sans JP',sans-serif",lineHeight:1.7,marginBottom:20}}>登録されている食材をすべて削除します。この操作は元に戻せません。</p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowReset(false)} style={{flex:1,padding:12,background:SF,border:"1px solid #3A3835",borderRadius:10,fontSize:14,fontWeight:600,color:TX,cursor:"pointer"}}>キャンセル</button>
              <button onClick={()=>{setFridge([]);setSelIds(new Set());setShowReset(false);}} style={{flex:1,padding:12,background:RD,border:"none",borderRadius:10,fontSize:14,fontWeight:700,color:"#fff",cursor:"pointer"}}>削除する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Root ----
export default function App() {
  const [user, setUser] = useState(undefined);
  useEffect(() => { return onAuthStateChanged(auth, u => setUser(u)); }, []);
  if (user === undefined) return <div style={{minHeight:"100vh",background:"#0F0E0C",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{width:32,height:32,border:"3px solid #333",borderTopColor:"#FF6B35",borderRadius:"50%",display:"inline-block",animation:"spin .8s linear infinite"}}/><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>;
  return user ? <MainApp user={user}/> : <LoginScreen/>;
}
