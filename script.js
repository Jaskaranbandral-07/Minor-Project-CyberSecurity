// ===== MD4 (Pure JS for NTLM) =====
function _lr(n,b){return((n<<b)|(n>>>(32-b)))>>>0}
function md4(msg){
    let h0=0x67452301,h1=0xEFCDAB89,h2=0x98BADCFE,h3=0x10325476;
    let m=[];for(let i=0;i<msg.length;i++)m.push(msg.charCodeAt(i));
    let ol=m.length*8;m.push(0x80);while(m.length%64!==56)m.push(0);
    for(let i=0;i<8;i++)m.push((ol>>>(i*8))&0xFF);
    for(let o=0;o<m.length;o+=64){
        let X=[];for(let i=0;i<16;i++)X.push((m[o+i*4])|(m[o+i*4+1]<<8)|(m[o+i*4+2]<<16)|(m[o+i*4+3]<<24));
        let a=h0,b=h1,c=h2,d=h3,s=[3,7,11,19];
        for(let k=0;k<16;k++){let f=((b&c)|((~b>>>0)&d))>>>0,t=(a+f+X[k])>>>0;
            a=d;d=c;c=b;b=_lr(t,s[k%4])}
        s=[3,5,9,13];let idx2=[0,4,8,12,1,5,9,13,2,6,10,14,3,7,11,15];
        for(let i=0;i<16;i++){let k=idx2[i],f=((a&b)|(a&c)|(b&c))>>>0,t=(a+f+X[k]+0x5A827999)>>>0;
            a=d;d=c;c=b;b=_lr(t,s[i%4])}
        s=[3,9,11,15];let idx3=[0,8,4,12,2,10,6,14,1,9,5,13,3,11,7,15];
        for(let i=0;i<16;i++){let k=idx3[i],f=(a^b^c)>>>0,t=(a+f+X[k]+0x6ED9EBA1)>>>0;
            a=d;d=c;c=b;b=_lr(t,s[i%4])}
        h0=(h0+a)>>>0;h1=(h1+b)>>>0;h2=(h2+c)>>>0;h3=(h3+d)>>>0;
    }
    let hex='';[h0,h1,h2,h3].forEach(v=>{for(let i=0;i<4;i++)hex+=('0'+((v>>>(i*8))&0xFF).toString(16)).slice(-2)});
    return hex;
}
function ntlmHash(pw){let u='';for(let i=0;i<pw.length;i++){u+=String.fromCharCode(pw.charCodeAt(i),0)}return md4(u)}

// ===== DATA STORE (localStorage) =====
const STORE_KEY='hashbreaker_data';
function loadData(){try{return JSON.parse(localStorage.getItem(STORE_KEY))||{hashes:[],attacks:[],log:[]}}catch(e){return{hashes:[],attacks:[],log:[]}}}
function saveData(d){localStorage.setItem(STORE_KEY,JSON.stringify(d))}
function addLog(msg){let d=loadData();d.log.unshift({time:new Date().toLocaleTimeString(),msg});if(d.log.length>50)d.log.length=50;saveData(d)}

// ===== NAVIGATION =====
function navigateTo(s){
    document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
    document.querySelectorAll('.section').forEach(sec=>sec.classList.remove('active'));
    document.querySelector(`[data-section="${s}"]`).classList.add('active');
    document.getElementById(s).classList.add('active');
    refreshUI();
}
document.querySelectorAll('.nav-link').forEach(link=>{
    link.addEventListener('click',e=>{e.preventDefault();navigateTo(link.dataset.section)})
});

// ===== PASSWORD UTILS =====
const WEAK_LIST=["password","123456","12345678","qwerty","abc123","monkey","letmein","dragon","111111","baseball","iloveyou","master","sunshine","ashley","michael","shadow","123123","654321","superman","qazwsx","admin","welcome","hello","charlie","donald","login","princess","football","passw0rd","test","computer","soccer","lovely","freedom","whatever","ginger","trustno1","batman","cookie","summer","ninja","access","solo","hottie","loveme","flower","1234567","qwerty123","password1","000000",
"winter","spring","autumn","monday","tuesday","wednesday","thursday","friday","saturday","sunday","january","february","march","april","may","june","july","august","september","october","november","december","company"];
function getStrength(pw){
    let s=0;if(pw.length>=8)s++;if(pw.length>=12)s++;if(/[a-z]/.test(pw))s++;if(/[A-Z]/.test(pw))s++;if(/[0-9]/.test(pw))s++;if(/[^a-zA-Z0-9]/.test(pw))s++;
    return s<=2?'weak':s<=4?'medium':'strong';
}
function randWeak(){return WEAK_LIST[Math.floor(Math.random()*WEAK_LIST.length)]}
function randMedium(){const b=["Summer","Winter","Password","Welcome","Monday","January","Football"];const s=["!","@","#","1","12","123","!1","99"];return b[Math.floor(Math.random()*b.length)]+s[Math.floor(Math.random()*s.length)]}
function randStrong(len){const c="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";let p='';for(let i=0;i<(len||14);i++)p+=c[Math.floor(Math.random()*c.length)];return p}

// ===== GENERATE HASHES =====
function addManualPasswords(){
    const ta=document.getElementById('manual-passwords');
    const lines=ta.value.trim().split('\n').map(l=>l.trim()).filter(Boolean);
    if(!lines.length)return;
    let d=loadData(),added=0;
    lines.forEach(pw=>{
        const h=ntlmHash(pw);
        if(!d.hashes.find(x=>x.hash===h)){d.hashes.push({password:pw,hash:h,strength:getStrength(pw),cracked:false,attack:null});added++}
    });
    saveData(d);addLog(`Added ${added} passwords manually (${lines.length} input, ${lines.length-added} duplicates)`);
    ta.value='';refreshUI();
}
function addTargetHashes(){
    const ta=document.getElementById('manual-hashes');
    if(!ta)return;
    const lines=ta.value.trim().split('\n').filter(Boolean);
    if(!lines.length)return;
    let d=loadData(),added=0,invalid=0,autoCracked=0;
    
    // Pre-compute quick lookup for auto-cracking
    const quickLookup = {};
    WEAK_LIST.forEach(w=>{
        quickLookup[ntlmHash(w)] = {pw: w, attack: 'Dictionary'};
        DICT_RULES.forEach(r=>{
            const c = r(w);
            quickLookup[ntlmHash(c)] = {pw: c, attack: 'Rule-Based'};
        });
    });

    lines.forEach(line=>{
        const match = line.toLowerCase().match(/[0-9a-f]{32}/);
        if(match){
            const h = match[0];
            if(!d.hashes.find(x=>x.hash===h)){
                let pw = '???', strength = 'unknown', cracked = false, attack = null;
                if(quickLookup[h]){
                    pw = quickLookup[h].pw;
                    strength = getStrength(pw);
                    cracked = true;
                    attack = quickLookup[h].attack;
                    autoCracked++;
                }
                d.hashes.push({password:pw,hash:h,strength:strength,cracked:cracked,attack:attack});
                added++;
            }
        } else {
            invalid++;
        }
    });
    if(added>0){
        saveData(d);addLog(`Added ${added} target hashes (${autoCracked} auto-cracked)`);
        ta.value='';refreshUI();
        let msg = `Added ${added} hashes. `;
        if(autoCracked > 0) msg += `\n🔥 ${autoCracked} hashes were AUTO-CRACKED instantly using the built-in dictionary!`;
        if(invalid > 0) msg += `\n⚠️ Skipped ${invalid} lines without a valid 32-char hex hash.`;
        alert(msg);
    } else {
        alert('Could not find any new valid 32-character hex hashes (they might already be in the table).');
    }
}
function generateRandomPasswords(){
    const count=Math.min(500,Math.max(1,+document.getElementById('gen-count').value||50));
    const wk=document.getElementById('mix-weak').checked,md=document.getElementById('mix-medium').checked,st=document.getElementById('mix-strong').checked;
    if(!wk&&!md&&!st)return;
    const types=[];if(wk)types.push('w');if(md)types.push('m');if(st)types.push('s');
    let d=loadData(),added=0;
    for(let i=0;i<count;i++){
        const t=types[Math.floor(Math.random()*types.length)];
        const pw=t==='w'?randWeak():t==='m'?randMedium():randStrong(10+Math.floor(Math.random()*6));
        const h=ntlmHash(pw);
        if(!d.hashes.find(x=>x.hash===h)){d.hashes.push({password:pw,hash:h,strength:getStrength(pw),cracked:false,attack:null});added++}
    }
    saveData(d);addLog(`Generated ${added} random passwords (${count} requested)`);refreshUI();
}
function clearHashes(){let d=loadData();d.hashes=[];d.attacks=[];saveData(d);addLog('Cleared all hashes');refreshUI()}
function clearAllData(){localStorage.removeItem(STORE_KEY);addLog('Full reset');refreshUI()}
function exportHashes(){
    const d=loadData();if(!d.hashes.length)return;
    const txt=d.hashes.map(h=>h.hash).join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt]));a.download='ntlm_hashes.txt';a.click();
}
function exportResults(){
    const d=loadData();const cracked=d.hashes.filter(h=>h.cracked);if(!cracked.length)return;
    const csv='Hash,Password,Attack,Strength\n'+cracked.map(h=>`${h.hash},${h.password},${h.attack},${h.strength}`).join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv]));a.download='cracked_results.csv';a.click();
}

// ===== ATTACK ENGINE =====
const DICT_RULES=[p=>p,p=>p[0].toUpperCase()+p.slice(1),p=>p.toUpperCase()];
["1","12","123","1234","12345","99","69","420","00","01","02","2023","2024","!","@","#","$","%","!1","!12","!123","@1","@123","#1","#123"].forEach(s=>{
    DICT_RULES.push(p=>p+s); DICT_RULES.push(p=>p[0].toUpperCase()+p.slice(1)+s);
});
DICT_RULES.push(p=>p.replace(/a/gi,'@'), p=>p.replace(/e/gi,'3'), p=>p.replace(/i/gi,'1'), p=>p.replace(/o/gi,'0'), p=>p.replace(/s/gi,'$'));
DICT_RULES.push(p=>p[0].toUpperCase()+p.slice(1).replace(/a/gi,'@').replace(/e/gi,'3').replace(/i/gi,'1').replace(/o/gi,'0'));
DICT_RULES.push(p=>p.split('').reverse().join(''));
let attackRunning=false;
async function runAttack(type){
    if(attackRunning)return;
    const d=loadData();const uncracked=d.hashes.filter(h=>!h.cracked);
    if(!uncracked.length){alert('No uncracked hashes remaining!');return}
    attackRunning=true;
    const panel=document.getElementById('attack-progress');panel.classList.remove('hidden');
    const bar=document.getElementById('attack-progress-bar');
    const status=document.getElementById('attack-status');
    const feed=document.getElementById('attack-live-feed');
    const summary=document.getElementById('attack-summary');
    summary.classList.add('hidden');feed.innerHTML='';bar.style.width='0%';
    document.getElementById('attack-title').textContent=`Running ${type} attack...`;
    let candidates=[],label='';
    if(type==='dictionary'){label='Dictionary';candidates=[...WEAK_LIST]}
    else if(type==='rule'){label='Rule-Based';WEAK_LIST.forEach(w=>DICT_RULES.forEach(r=>{const c=r(w);if(!candidates.includes(c))candidates.push(c)}))}
    else{
        label='Brute Force';
        const ch='abcdefghijklmnopqrstuvwxyz0123456789';
        // 1 to 4 characters of a-z0-9 (about 1.7M combinations)
        for(let a=0;a<ch.length;a++)candidates.push(ch[a]);
        for(let a=0;a<ch.length;a++)for(let b=0;b<ch.length;b++)candidates.push(ch[a]+ch[b]);
        for(let a=0;a<ch.length;a++)for(let b=0;b<ch.length;b++)for(let c=0;c<ch.length;c++)candidates.push(ch[a]+ch[b]+ch[c]);
        for(let a=0;a<ch.length;a++)for(let b=0;b<ch.length;b++)for(let c=0;c<ch.length;c++)for(let d=0;d<ch.length;d++){
            candidates.push(ch[a]+ch[b]+ch[c]+ch[d]);
            if(candidates.length>500000)break; // Cap at 500k to prevent freezing browser
        }
    }
    // Build lookup of uncracked hashes
    const hashMap={};uncracked.forEach(h=>{hashMap[h.hash]=h});
    let found=0,checked=0,total=candidates.length,batchSize=1000;
    const startTime=Date.now();
    for(let i=0;i<total;i+=batchSize){
        const batch=candidates.slice(i,i+batchSize);
        for(const guess of batch){
            const gh=ntlmHash(guess);
            if(hashMap[gh]&&!hashMap[gh].cracked){
                hashMap[gh].cracked=true;hashMap[gh].attack=label;found++;
                if(hashMap[gh].password==='???'){hashMap[gh].password=guess;hashMap[gh].strength=getStrength(guess);}
                const line=document.createElement('div');line.className='feed-line hit';
                line.textContent=`[CRACKED] ${gh.slice(0,16)}... => ${guess}`;feed.prepend(line);
            }
            checked++;
        }
        const pct=Math.min(100,(checked/total*100));
        bar.style.width=pct+'%';
        status.textContent=`Checked ${checked.toLocaleString()} / ${total.toLocaleString()} candidates | Found: ${found} | Elapsed: ${((Date.now()-startTime)/1000).toFixed(1)}s`;
        await new Promise(r=>setTimeout(r,10)); // yield to UI
    }
    bar.style.width='100%';
    const elapsed=((Date.now()-startTime)/1000).toFixed(2);
    status.textContent=`Complete! Checked ${total.toLocaleString()} candidates in ${elapsed}s — Cracked ${found} passwords`;
    // Save results
    const dd=loadData();
    Object.values(hashMap).forEach(h=>{const idx=dd.hashes.findIndex(x=>x.hash===h.hash);if(idx>=0)dd.hashes[idx]=h});
    dd.attacks.push({type:label,found,checked:total,time:elapsed,date:new Date().toISOString()});
    saveData(dd);addLog(`${label} attack: cracked ${found} of ${uncracked.length} remaining (${elapsed}s)`);
    // Show summary
    summary.classList.remove('hidden');
    const totalH=dd.hashes.length,totalC=dd.hashes.filter(h=>h.cracked).length;
    document.getElementById('attack-summary-content').innerHTML=`
        <div class="results-stats-row" style="margin-top:12px">
            <div class="mini-stat"><span class="mini-val">${found}</span><span class="mini-label">Cracked This Run</span></div>
            <div class="mini-stat"><span class="mini-val green">${totalC}/${totalH}</span><span class="mini-label">Total Cracked</span></div>
            <div class="mini-stat"><span class="mini-val purple">${(totalC/totalH*100).toFixed(1)}%</span><span class="mini-label">Overall Rate</span></div>
            <div class="mini-stat"><span class="mini-val">${elapsed}s</span><span class="mini-label">Time</span></div>
        </div>`;
    attackRunning=false;refreshUI();
}

// ===== CHARTS =====
let charts={};
function destroyCharts(){Object.values(charts).forEach(c=>{if(c)c.destroy()});charts={}}
function buildCharts(d){
    destroyCharts();
    Chart.defaults.color='#94a3b8';Chart.defaults.font.family='Inter';
    const attacks=d.attacks||[];
    // Attack chart
    const aLabels=attacks.map(a=>a.type);const aData=attacks.map(a=>a.found);
    if(aLabels.length){
        charts.attack=new Chart(document.getElementById('attackChart'),{type:'bar',
            data:{labels:aLabels,datasets:[{label:'Cracked',data:aData,backgroundColor:['#6366f1','#8b5cf6','#a855f7','#06b6d4','#3b82f6'].slice(0,aLabels.length),borderRadius:6,barThickness:40}]},
            options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#1a2035'}},x:{grid:{display:false}}}}})
    }
    // Strength chart
    const wk=d.hashes.filter(h=>h.strength==='weak').length,md=d.hashes.filter(h=>h.strength==='medium').length,st=d.hashes.filter(h=>h.strength==='strong').length;
    charts.complexity=new Chart(document.getElementById('complexityChart'),{type:'doughnut',
        data:{labels:['Weak','Medium','Strong'],datasets:[{data:[wk,md,st],backgroundColor:['#ef4444','#f59e0b','#22c55e'],borderWidth:0,spacing:3}]},
        options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{padding:12,usePointStyle:true,pointStyle:'circle'}}}}})
    // Length chart
    const lenBuckets={'1-5':0,'6-8':0,'9-12':0,'13+':0};
    d.hashes.forEach(h=>{const l=h.password.length;if(l<=5)lenBuckets['1-5']++;else if(l<=8)lenBuckets['6-8']++;else if(l<=12)lenBuckets['9-12']++;else lenBuckets['13+']++});
    charts.length=new Chart(document.getElementById('lengthChart'),{type:'bar',
        data:{labels:Object.keys(lenBuckets),datasets:[{label:'Count',data:Object.values(lenBuckets),backgroundColor:['#ef4444','#f59e0b','#3b82f6','#22c55e'],borderRadius:6,barThickness:40}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#1a2035'}},x:{grid:{display:false}}}}})
    // Timeline chart
    if(attacks.length){
        let cum=0;const tData=attacks.map(a=>{cum+=a.found;return cum});
        charts.timeline=new Chart(document.getElementById('timelineChart'),{type:'line',
            data:{labels:attacks.map(a=>a.type),datasets:[{label:'Cumulative Cracked',data:tData,borderColor:'#6366f1',backgroundColor:'rgba(99,102,241,.1)',fill:true,tension:.4,pointRadius:5,pointBackgroundColor:'#6366f1'}]},
            options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#1a2035'}},x:{grid:{display:false}}}}})
    }
}

// ===== REFRESH UI =====
function refreshUI(){
    const d=loadData();const total=d.hashes.length;const cracked=d.hashes.filter(h=>h.cracked).length;const rate=total?((cracked/total)*100):0;
    // Dashboard
    if(total===0){document.getElementById('empty-state').classList.remove('hidden');document.getElementById('dashboard-content').classList.add('hidden')}
    else{document.getElementById('empty-state').classList.add('hidden');document.getElementById('dashboard-content').classList.remove('hidden');
        document.getElementById('stat-total').textContent=total;document.getElementById('stat-cracked').textContent=cracked;
        document.getElementById('stat-rate').textContent=rate.toFixed(1)+'%';document.getElementById('stat-uncracked').textContent=total-cracked;
        document.getElementById('bar-total').style.width='100%';document.getElementById('bar-cracked').style.width=rate+'%';
        document.getElementById('bar-rate').style.width=rate+'%';document.getElementById('bar-uncracked').style.width=(100-rate)+'%';
        buildCharts(d);
        const logEl=document.getElementById('activity-log');
        logEl.innerHTML=d.log.map(l=>`<div class="log-entry"><span class="log-time">${l.time}</span><span class="log-msg">${l.msg}</span></div>`).join('')||'<p class="empty-text">No activity yet.</p>';
    }
    // Hash table
    document.getElementById('hash-count').textContent=total;
    const htb=document.querySelector('#hash-table tbody');
    if(total===0){document.getElementById('hash-empty').classList.remove('hidden');htb.innerHTML=''}
    else{document.getElementById('hash-empty').classList.add('hidden');
        htb.innerHTML=d.hashes.slice(0,200).map((h,i)=>`<tr><td>${i+1}</td><td>${h.password}</td><td><code style="color:var(--text2);font-size:0.8rem">${h.hash}</code></td>
            <td><span class="strength-badge ${h.strength}">${h.strength}</span></td>
            <td><span class="status-badge ${h.cracked?'cracked':'safe'}">${h.cracked?'Cracked':'Secure'}</span></td></tr>`).join('');
    }
    // Attack panel
    const uncracked=d.hashes.filter(h=>!h.cracked).length;
    if(total===0){document.getElementById('attack-no-data').classList.remove('hidden');document.getElementById('attack-panel').classList.add('hidden')}
    else{document.getElementById('attack-no-data').classList.add('hidden');document.getElementById('attack-panel').classList.remove('hidden')}
    // Results
    const crackedList=d.hashes.filter(h=>h.cracked);
    if(!crackedList.length){document.getElementById('results-empty').classList.remove('hidden');document.getElementById('results-content').classList.add('hidden')}
    else{document.getElementById('results-empty').classList.add('hidden');document.getElementById('results-content').classList.remove('hidden');
        document.getElementById('res-total').textContent=total;document.getElementById('res-cracked').textContent=cracked;
        document.getElementById('res-remaining').textContent=total-cracked;document.getElementById('res-rate').textContent=rate.toFixed(1)+'%';
        const rtb=document.querySelector('#results-table tbody');
        rtb.innerHTML=crackedList.map((h,i)=>`<tr><td>${i+1}</td><td><code style="color:var(--text2);font-size:0.8rem">${h.hash}</code></td><td>${h.password}</td>
            <td>${h.attack}</td><td><span class="strength-badge ${h.strength}">${h.strength}</span></td></tr>`).join('');
        // Findings
        const fl=document.getElementById('findings-list');
        const weakC=crackedList.filter(h=>h.strength==='weak').length;
        const dictC=crackedList.filter(h=>h.attack==='Dictionary').length;
        fl.innerHTML=`
            <li><strong>${cracked}</strong> of ${total} passwords cracked (<strong>${rate.toFixed(1)}%</strong> crack rate)</li>
            <li><strong>${weakC}</strong> weak passwords cracked (${crackedList.length?(weakC/crackedList.length*100).toFixed(0):0}% of all cracked)</li>
            <li><strong>${dictC}</strong> fell to a simple dictionary attack alone</li>
            <li><strong>${total-cracked}</strong> passwords remain uncracked</li>
            <li>Average password length: <strong>${(d.hashes.reduce((a,h)=>a+h.password.length,0)/total).toFixed(1)}</strong> characters</li>`;
    }
}

// Init
refreshUI();
