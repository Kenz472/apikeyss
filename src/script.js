const BASE_URL = window.location.origin;

let settings = {};
let currentCategoryIndex = null;

const categoryIcons = {
    'Downloader': 'fa-download',
    'Imagecreator': 'fa-image',
    'Openai': 'fa-robot',
    'AI': 'fa-brain',
    'AI Tools': 'fa-tools',
    'Random': 'fa-random',
    'Search': 'fa-search',
    'Stalker': 'fa-user-secret',
    'Tools': 'fa-wrench',
    'Orderkuota': 'fa-shopping-cart',
    'Asupan': 'fa-video',
    'Anime': 'fa-tv',
    'Cecan': 'fa-heart',
    'Emoji': 'fa-smile',
    'Game': 'fa-gamepad',
    'Islamic': 'fa-mosque',
    'Maker': 'fa-paint-brush',
    'News': 'fa-newspaper',
    'Nsfw': 'fa-exclamation-triangle',
    'Photooxy': 'fa-camera',
    'Primbon': 'fa-moon',
    'Random Text': 'fa-font'
};

document.addEventListener('DOMContentLoaded', function() {
    initDeviceInfo();
    initializeApp();
});

async function initializeApp() {
    try {
        settings = await loadSettings();
        renderSidebarCategories();
        setupSearch();
    } catch (error) {
        console.error('Error init:', error);
    } finally {
        setTimeout(() => {
            const ls = document.getElementById('loadingScreen');
            if (ls) {
                ls.style.opacity = '0';
                setTimeout(() => { ls.style.display = 'none'; }, 400);
            }
        }, 500);
    }
}

async function loadSettings() {
    try {
        const response = await fetch('/settings');
        if (!response.ok) throw new Error('Settings not found');
        return await response.json();
    } catch (error) {
        return getDefaultSettings();
    }
}

function getDefaultSettings() {
    return {
        name: "CHISA • API",
        creator: "CHISA",
        description: "Interactive API documentation",
        categories: [
            {
                name: "AI",
                items: [
                    { name: "AI ChatGPT", path: "/ai/chatgpt?apikey=&text=", method: "GET", desc: "Menghasilkan teks menggunakan kecerdasan buatan ChatGPT." },
                    { name: "AI Gemini", path: "/ai/gemini?apikey=&text=", method: "GET", desc: "Menghasilkan teks menggunakan Google Gemini." }
                ]
            },
            {
                name: "Downloader",
                items: [
                    { name: "TikTok Downloader", path: "/downloader/tiktok?apikey=&url=", method: "GET", desc: "Mengunduh video dari TikTok tanpa watermark." }
                ]
            },
            {
                name: "Asupan",
                items: [
                    { name: "Asupan Anony", path: "/asupan/anony?apikey=", method: "GET", desc: "Random video asupan anony." },
                    { name: "Asupan Bocil", path: "/asupan/bocil?apikey=", method: "GET", desc: "Random video asupan bocil." },
                    { name: "Asupan Cecan", path: "/asupan/cecan?apikey=", method: "GET", desc: "Random video asupan cecan." }
                ]
            }
        ]
    };
}

function renderSidebarCategories() {
    const container = document.getElementById('categoryList');
    if (!container) return;
    container.innerHTML = '';

    if (!settings.categories || settings.categories.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-xs px-3 py-4 text-center">Kategori kosong.</p>';
        return;
    }

    settings.categories.forEach((cat, index) => {
        const icon = categoryIcons[cat.name] || 'fa-folder';
        
        const header = document.createElement('div');
        header.className = 'px-3 py-2 mt-2 mb-1 flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider';
        header.innerHTML = `<i class="fas ${icon}"></i> ${cat.name}`;
        container.appendChild(header);

        cat.items.forEach((item, i) => {
            const btn = document.createElement('button');
            btn.className = 'api-row w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 mb-1';
            btn.id = `api-btn-${index}-${i}`;
            btn.onclick = () => selectEndpoint(index, i);
            
            btn.innerHTML = `
                <span class="truncate pr-2 font-medium">${item.name}</span>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded ${item.method === 'POST' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}">${item.method || 'GET'}</span>
            `;
            container.appendChild(btn);
        });
    });
}

function selectEndpoint(catIndex, itemIndex) {
    currentCategoryIndex = catIndex;
    
    document.querySelectorAll('.api-row').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`api-btn-${catIndex}-${itemIndex}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (window.innerWidth < 1024) toggleSidebar();

    const cat = settings.categories[catIndex];
    const item = cat.items[itemIndex];
    const contentArea = document.getElementById('api-content-area');

    const queryString = item.path.split('?')[1];
    const urlParams = new URLSearchParams(queryString);
    let formHtml = '';

    if (queryString) {
        for (const [key, val] of urlParams) {
            formHtml += `
                <div class="mb-3">
                    <label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">${key}</label>
                    <input type="text" id="param-${key}" data-key="${key}" class="w-full px-3 py-2.5 border border-slate-700 rounded-xl text-sm bg-[#04070f] text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Masukkan ${key}...">
                </div>
            `;
        }
    }

    let html = `
        <div class="bg-[#0a1020] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl mb-6 fade-in">
            <div class="p-5 border-b border-slate-800 bg-[#0d1425]/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                    <h2 class="text-xl font-bold text-white font-display flex items-center gap-2">
                        ${item.name}
                        <span class="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">${item.method || 'GET'}</span>
                    </h2>
                    <p class="text-xs text-slate-400 mt-1">${item.desc}</p>
                </div>
                <button onclick="closeDetail()" class="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg transition-colors">
                    <i class="fas fa-times"></i> Tutup
                </button>
            </div>

            <div class="p-5 grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                    <div class="mb-5">
                        <label class="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Base URL (Auto HTTPS)</label>
                        <div class="flex bg-[#04070f] border border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                            <span class="px-3 py-2.5 bg-slate-800 text-slate-400 text-xs font-mono border-r border-slate-700 flex items-center">${BASE_URL}</span>
                            <input type="text" id="path-input" value="${item.path}" class="flex-1 bg-transparent px-3 py-2.5 text-sm text-blue-300 font-mono focus:outline-none" readonly>
                        </div>
                    </div>

                    <div class="mb-5 space-y-3" id="params-wrapper">
                        ${formHtml || '<p class="text-xs text-slate-500 italic py-2">Endpoint ini tidak membutuhkan parameter.</p>'}
                    </div>

                    <button onclick="executeApiRequest(${catIndex}, ${itemIndex})" class="btn-gradient w-full py-3 rounded-xl font-bold text-white text-sm shadow-lg flex items-center justify-center gap-2">
                        <i class="fas fa-paper-plane"></i> Request API
                    </button>
                </div>

                <div class="flex flex-col h-full">
                    <div class="flex justify-between items-center mb-2">
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <i class="fas fa-terminal text-purple-400"></i> Response Output
                        </label>
                        <div class="flex items-center gap-2 text-[10px] font-mono">
                            <span id="res-time" class="text-slate-500">--ms</span>
                            <span id="res-status" class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Idle</span>
                        </div>
                    </div>
                    
                    <div class="bg-[#04070f] border border-slate-800 rounded-xl overflow-hidden relative flex-1 min-h-[250px] flex flex-col">
                        <button onclick="copyResult()" class="absolute top-2 right-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-1.5 rounded-md text-xs z-10 backdrop-blur-sm transition-colors" title="Copy JSON">
                            <i class="fas fa-copy"></i>
                        </button>
                        <div id="res-body" class="p-3 overflow-auto max-h-[400px] text-xs font-mono leading-relaxed h-full">
                            <span class="text-slate-500 italic">Menunggu request...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    contentArea.innerHTML = html;

    const inputs = document.querySelectorAll('#params-wrapper input');
    const pathInput = document.getElementById('path-input');
    const basePath = item.path.split('?')[0];
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const params = new URLSearchParams();
            inputs.forEach(i => {
                if (i.value.trim()) params.set(i.dataset.key, i.value.trim());
            });
            pathInput.value = basePath + (params.toString() ? '?' + params.toString() : '');
        });
    });
}

async function executeApiRequest(catIndex, itemIndex) {
    const item = settings.categories[catIndex].items[itemIndex];
    const pathValue = document.getElementById('path-input').value;
    const fullUrl = BASE_URL + pathValue;
    
    const resBody = document.getElementById('res-body');
    const resStatus = document.getElementById('res-status');
    const resTime = document.getElementById('res-time');

    resBody.innerHTML = `<div class="flex items-center justify-center h-full py-10"><div class="loader"></div></div>`;
    resStatus.textContent = 'Loading...';
    resStatus.className = 'px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse';
    resTime.textContent = '--ms';

    const start = Date.now();

    try {
        const response = await fetch(fullUrl, {
            method: item.method || 'GET',
            headers: { 'Accept': '*/*' }
        });

        const timeMs = Date.now() - start;
        resTime.textContent = `${timeMs}ms`;
        resStatus.textContent = `${response.status} ${response.statusText}`;
        resStatus.className = response.ok 
            ? 'px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30';

        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const json = await response.json();
            const jsonStr = JSON.stringify(json, null, 4);
            const highlighted = jsonStr.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                let cls = 'text-blue-300';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) cls = 'text-purple-400';
                } else if (/true|false/.test(match)) {
                    cls = 'text-orange-400';
                } else if (/null/.test(match)) {
                    cls = 'text-slate-500';
                } else {
                    cls = 'text-green-400';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
            resBody.innerHTML = `<pre>${highlighted}</pre>`;
        } else if (contentType.startsWith('image/')) {
            const blob = await response.blob();
            const objUrl = URL.createObjectURL(blob);
            resBody.innerHTML = `<img src="${objUrl}" class="w-full rounded-lg object-contain max-h-[350px] mx-auto">`;
        } else if (contentType.includes('video/')) {
            const blob = await response.blob();
            const objUrl = URL.createObjectURL(blob);
            resBody.innerHTML = `<video src="${objUrl}" controls autoplay class="w-full rounded-lg max-h-[350px]"></video>`;
        } else {
            const text = await response.text();
            resBody.innerHTML = `<pre class="text-slate-300 whitespace-pre-wrap">${escapeHtml(text)}</pre>`;
        }

    } catch (error) {
        resStatus.textContent = 'Error';
        resStatus.className = 'px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30';
        resBody.innerHTML = `
            <div class="text-center text-red-400 py-8">
                <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                <p class="font-bold">Request Gagal</p>
                <p class="text-[10px] mt-1 text-red-300/70">${error.message}</p>
            </div>
        `;
    }
}

function closeDetail() {
    document.getElementById('api-content-area').innerHTML = `
        <div class="text-center py-20 glass rounded-3xl border border-dashed border-slate-700 mt-4 h-[60vh] flex flex-col items-center justify-center fade-in">
            <div class="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-5">
                <i class="fas fa-hand-pointer text-3xl text-blue-400 animate-bounce"></i>
            </div>
            <h3 class="text-white font-bold text-lg mb-2 font-display">Pilih Endpoint</h3>
            <p class="text-slate-400 text-sm max-w-xs mx-auto">Silakan pilih kategori atau endpoint di menu sebelah kiri untuk mulai mencoba API.</p>
        </div>
    `;
    document.querySelectorAll('.api-row').forEach(btn => btn.classList.remove('active'));
}

function copyResult() {
    const resBody = document.getElementById('res-body');
    const textToCopy = resBody.innerText;
    
    if (!textToCopy || textToCopy.includes('Menunggu request') || textToCopy.includes('Request Gagal')) return;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Response berhasil di-copy!');
    });
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg z-[9999] fade-in flex items-center gap-2';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if(sidebar) sidebar.classList.toggle('open');
    if(overlay) overlay.classList.toggle('active');
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        
        settings.categories.forEach((cat, ci) => {
            cat.items.forEach((item, ii) => {
                const btn = document.getElementById(`api-btn-${ci}-${ii}`);
                if (!btn) return;
                const match = item.name.toLowerCase().includes(term) || item.desc.toLowerCase().includes(term);
                btn.style.display = match ? 'flex' : 'none';
            });
        });
    });
}

function initDeviceInfo() {
    const updateClock = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', { hour12: false });
        const el = document.getElementById('clockText');
        if (el) el.textContent = timeStr;
    };
    updateClock();
    setInterval(updateClock, 1000);

    if ('getBattery' in navigator) {
        navigator.getBattery().then(function (battery) {
            const updateBat = () => {
                const level = Math.round(battery.level * 100);
                const batText = document.getElementById('batText');
                const batIcon = document.getElementById('batIcon');
                
                if(batText) batText.textContent = level + '%' + (battery.charging ? ' ⚡' : '');
                if(batIcon) {
                    batIcon.className = 'fas ' + (
                        level > 80 ? 'fa-battery-full text-green-400' :
                        level > 60 ? 'fa-battery-three-quarters text-green-400' :
                        level > 40 ? 'fa-battery-half text-yellow-400' :
                        level > 20 ? 'fa-battery-quarter text-orange-400' : 'fa-battery-empty text-red-400'
                    );
                }
            };
            updateBat();
            battery.addEventListener('levelchange', updateBat);
            battery.addEventListener('chargingchange', updateBat);
        });
    }

    const updateNetwork = () => {
        const netText = document.getElementById('netText');
        if (navigator.connection) {
            const type = navigator.connection.effectiveType || 'Unknown';
            const dl = navigator.connection.downlink || '0';
            if (netText) netText.textContent = `${type.toUpperCase()} (${dl} Mbps)`;
        } else {
            if (netText) netText.textContent = 'Online';
        }
    };
    updateNetwork();
    if (navigator.connection) {
        navigator.connection.addEventListener('change', updateNetwork);
    }
}