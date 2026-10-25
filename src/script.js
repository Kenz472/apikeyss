let settings = {};
let currentCategoryIndex = null;

const categoryIcons = {
    'Downloader': 'folder',
    'Imagecreator': 'image',
    'Openai': 'smart_toy',
    'AI': 'psychology',
    'AI Tools': 'psychology',
    'Random': 'shuffle',
    'Search': 'search',
    'Stalker': 'visibility',
    'Tools': 'build',
    'Orderkuota': 'paid'
};

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        settings = await loadSettings();
        setupUI();
        renderSidebarCategories();
        setupSearch();
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage(error);
    } finally {
        setTimeout(() => {
            const ls = document.getElementById('loadingScreen');
            if (ls) {
                ls.style.opacity = '0';
                setTimeout(() => { ls.style.display = 'none'; }, 500);
            }
        }, 900);
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
        name: settings.name || "CHISA • API",
        creator: settings.creator || "CHISA",
        description: "Interactive API documentation with real-time testing",
        categories: getDefaultCategories()
    };
}

function getDefaultCategories() {
    return [
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
        }
    ];
}

function setupUI() {
    if(settings.links) {
        const contactLink = document.getElementById("contactLink");
        if(contactLink) contactLink.href = `${settings.links}`;
    }
    const titleApi = document.getElementById("titleApi");
    const descApi = document.getElementById("descApi");
    const footer = document.getElementById("footer");
    
    if(titleApi) titleApi.textContent = settings.name;
    if(descApi) descApi.textContent = settings.description;
    if(footer) footer.textContent = `© 2025 ${settings.creator} - ${settings.name}`;
}

function renderSidebarCategories() {
    const container = document.getElementById('categoryList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!settings.categories || settings.categories.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-xs px-3">Kategori kosong.</p>';
        return;
    }

    settings.categories.forEach((cat, index) => {
        const icon = categoryIcons[cat.name] || 'folder';
        const btn = document.createElement('button');
        btn.className = 'category-btn w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-400 rounded-r-lg mb-1';
        btn.id = `cat-btn-${index}`;
        btn.onclick = () => selectCategory(index);
        
        btn.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="material-icons text-lg opacity-70">${icon}</span>
                <span class="font-medium">${cat.name}</span>
            </div>
            <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">${cat.items.length}</span>
        `;
        container.appendChild(btn);
    });
}

function selectCategory(index) {
    currentCategoryIndex = index;
    
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`cat-btn-${index}`);
    if (activeBtn) activeBtn.classList.add('active');

    if (window.innerWidth < 1024) {
        toggleSidebar();
    }

    const cat = settings.categories[index];
    const contentArea = document.getElementById('api-content-area');
    
    let html = `
        <div class="mb-5 flex items-center gap-3 border-b border-slate-800 pb-3">
            <span class="material-icons text-2xl text-blue-500">${categoryIcons[cat.name] || 'folder'}</span>
            <h2 class="text-xl font-bold text-white font-display">${cat.name} Endpoints</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    `;

    cat.items.forEach((item, i) => {
        const methodColor = (item.method || 'GET') === 'GET' ? 'text-green-400 border-green-500/30' : 'text-yellow-400 border-yellow-500/30';
        html += `
            <div class="glass rounded-2xl p-5 border border-slate-700/50 hover:border-blue-500/50 transition-all cursor-pointer group" onclick="openEndpointDetail(${index}, ${i})">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-white group-hover:text-blue-400 transition-colors">${item.name}</h3>
                    <span class="text-[10px] font-bold px-2 py-1 border rounded bg-transparent ${methodColor}">${item.method || 'GET'}</span>
                </div>
                <p class="text-xs text-slate-400 mb-4 line-clamp-2">${item.desc}</p>
                <div class="bg-[#04070f] p-2 rounded border border-slate-800 overflow-hidden">
                    <code class="text-[11px] text-blue-300 whitespace-nowrap block truncate">${item.path}</code>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    contentArea.innerHTML = html;
    contentArea.classList.remove('fade-in');
    void contentArea.offsetWidth;
    contentArea.classList.add('fade-in');
}

function openEndpointDetail(catIndex, itemIndex) {
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
                    <label class="block text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">${key}</label>
                    <input type="text" id="param-${key}" class="w-full px-3 py-2 border border-slate-700 rounded-lg text-sm bg-[#04070f] text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Masukkan ${key}...">
                </div>
            `;
        }
    }

    let html = `
        <button onclick="selectCategory(${catIndex})" class="text-sm text-blue-400 hover:text-white mb-4 flex items-center gap-2 transition-colors">
            <i class="fas fa-arrow-left"></i> Kembali ke ${cat.name}
        </button>
        
        <div class="glass rounded-3xl p-6 sm:p-8 border border-slate-700/50 relative overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-white font-display mb-1">${item.name}</h2>
                    <p class="text-sm text-slate-400">${item.desc}</p>
                </div>
                <span class="text-xs font-bold px-3 py-1.5 border rounded-lg bg-green-500/10 text-green-400 border-green-500/20">${item.method || 'GET'}</span>
            </div>

            <div class="mb-6">
                <label class="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Request URL</label>
                <div class="flex gap-2">
                    <div class="flex-1 bg-[#04070f] border border-slate-700 rounded-xl px-4 py-3 overflow-x-auto">
                        <code id="full-url" class="text-sm text-blue-300 whitespace-nowrap">${item.path}</code>
                    </div>
                    <button onclick="copyToClipboard(document.getElementById('full-url').innerText)" class="bg-slate-800 hover:bg-slate-700 px-4 rounded-xl border border-slate-700 text-slate-300 transition-colors">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>

            <div class="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4" id="params-wrapper">
                ${formHtml || '<p class="text-sm text-slate-500 italic col-span-2">Endpoint ini tidak membutuhkan parameter.</p>'}
            </div>

            <button onclick="executeApiRequest(${catIndex}, ${itemIndex})" class="btn-gradient w-full py-3 rounded-xl font-bold text-white text-sm shadow-lg flex items-center justify-center gap-2">
                <i class="fas fa-play"></i> Eksekusi Endpoint
            </button>

            <div id="response-container" class="hidden mt-6 border-t border-slate-700 pt-6">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="text-sm font-bold text-white"><i class="fas fa-terminal text-purple-400 mr-2"></i> Response</h3>
                    <div class="flex items-center gap-2">
                        <span id="res-status" class="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-slate-300">--</span>
                        <span id="res-time" class="text-[10px] text-slate-500 font-mono">0ms</span>
                    </div>
                </div>
                <div class="bg-[#04070f] border border-slate-800 rounded-xl overflow-hidden relative">
                    <button onclick="copyToClipboard(document.getElementById('res-body').innerText)" class="absolute top-2 right-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded-lg text-xs z-10 backdrop-blur-sm">
                        <i class="fas fa-copy"></i>
                    </button>
                    <div id="res-body" class="p-4 overflow-auto max-h-[500px] text-sm"></div>
                </div>
            </div>
        </div>
    `;

    contentArea.innerHTML = html;
    contentArea.classList.remove('fade-in');
    void contentArea.offsetWidth;
    contentArea.classList.add('fade-in');

    if (queryString) {
        const inputs = contentArea.querySelectorAll('input[type="text"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                const base = item.path.split('?')[0];
                const params = new URLSearchParams();
                inputs.forEach(i => {
                    if (i.value.trim()) params.set(i.id.replace('param-', ''), i.value.trim());
                });
                document.getElementById('full-url').innerText = base + (params.toString() ? '?' + params.toString() : '');
            });
        });
    }
}

async function executeApiRequest(catIndex, itemIndex) {
    const item = settings.categories[catIndex].items[itemIndex];
    const url = document.getElementById('full-url').innerText;
    
    const resContainer = document.getElementById('response-container');
    const resBody = document.getElementById('res-body');
    const resStatus = document.getElementById('res-status');
    const resTime = document.getElementById('res-time');

    resContainer.classList.remove('hidden');
    resBody.innerHTML = '<div class="flex items-center justify-center py-10"><div class="loader"></div></div>';
    resStatus.textContent = 'Loading...';
    resStatus.className = 'text-[10px] font-bold px-2 py-1 rounded bg-blue-500/20 text-blue-400 animate-pulse';
    resTime.textContent = '';

    const start = Date.now();

    try {
        const response = await fetch(url, {
            method: item.method || 'GET',
            headers: { 'Accept': '*/*' }
        });

        const timeMs = Date.now() - start;
        resTime.textContent = `${timeMs}ms`;
        resStatus.textContent = `${response.status} ${response.statusText}`;
        resStatus.className = response.ok ? 'text-[10px] font-bold px-2 py-1 rounded bg-green-500/20 text-green-400' : 'text-[10px] font-bold px-2 py-1 rounded bg-red-500/20 text-red-400';

        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const json = await response.json();
            resBody.innerHTML = `<pre class="text-green-300 font-mono text-xs leading-relaxed">${JSON.stringify(json, null, 4)}</pre>`;
        } else if (contentType.startsWith('image/')) {
            const blob = await response.blob();
            const objUrl = URL.createObjectURL(blob);
            resBody.innerHTML = `<img src="${objUrl}" class="w-full rounded-lg max-h-[400px] object-contain">`;
        } else if (contentType.includes('video/')) {
            const blob = await response.blob();
            const objUrl = URL.createObjectURL(blob);
            resBody.innerHTML = `<video src="${objUrl}" controls autoplay class="w-full rounded-lg max-h-[400px]"></video>`;
        } else if (contentType.includes('audio/')) {
            const blob = await response.blob();
            const objUrl = URL.createObjectURL(blob);
            resBody.innerHTML = `<audio src="${objUrl}" controls autoplay class="w-full"></audio>`;
        } else {
            const text = await response.text();
            resBody.innerHTML = `<pre class="text-slate-300 font-mono text-xs leading-relaxed whitespace-pre-wrap">${escapeHtml(text)}</pre>`;
        }

    } catch (error) {
        resStatus.textContent = 'Error';
        resStatus.className = 'text-[10px] font-bold px-2 py-1 rounded bg-red-500/20 text-red-400';
        resBody.innerHTML = `<div class="text-center text-red-400 py-6"><i class="fas fa-exclamation-triangle text-2xl mb-2"></i><p class="text-xs">${error.message}</p></div>`;
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg z-[9999] fade-in';
        toast.innerHTML = '<i class="fas fa-check mr-1"></i> Tersalin!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const catBtns = document.querySelectorAll('.category-btn');
        
        if (!term) {
            catBtns.forEach(btn => btn.style.display = 'flex');
            return;
        }

        settings.categories.forEach((cat, i) => {
            const hasMatch = cat.name.toLowerCase().includes(term) || cat.items.some(item => item.name.toLowerCase().includes(term) || item.desc.toLowerCase().includes(term));
            const btn = document.getElementById(`cat-btn-${i}`);
            if (btn) btn.style.display = hasMatch ? 'flex' : 'none';
        });
    });
}

function showErrorMessage(err) {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) loadingScreen.style.display = 'none';
    console.error('App Error:', err);
}