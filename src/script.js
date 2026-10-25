let settings = {};
let allApiItems = [];

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
        await loadAPIData();
        setupEventListeners();
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
            name: "Asupan API",
            items: [
                { name: "Asupan Anony", path: "/asupan/anony?apikey=", method: "GET", desc: "Random video asupan anony" },
                { name: "Asupan Bocil", path: "/asupan/bocil?apikey=", method: "GET", desc: "Random video asupan bocil" }
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

async function loadAPIData() {
    const apiList = document.getElementById('apiList');
    if (!apiList) return;
    
    if (!settings.categories || settings.categories.length === 0) {
        settings.categories = getDefaultCategories();
    }
    
    allApiItems = [];
    let totalApis = 0;

    let html = '<div class="space-y-6">';
    
    settings.categories.forEach((category, catIndex) => {
        totalApis += category.items.length;
        const icon = categoryIcons[category.name] || 'folder';
        
        html += `
        <div class="category-group mb-8" data-category="${category.name.toLowerCase()}">
            <div class="mb-3 flex items-center gap-2 border-b border-slate-700 pb-2">
                <span class="material-icons text-lg text-blue-400">${icon}</span>
                <h2 class="font-bold text-sm text-white uppercase tracking-wider">${category.name}</h2>
                <span class="ml-auto text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">${category.items.length} Endpoints</span>
            </div>
            
            <div class="bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-[#0f172a] border-b border-slate-700">
                            <tr>
                                <th class="py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Name</th>
                                <th class="py-3 px-4 text-xs font-semibold text-slate-400 uppercase hidden sm:table-cell">Parameter</th>
                                <th class="py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Method</th>
                                <th class="py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                                <th class="py-3 px-4 text-xs font-semibold text-slate-400 uppercase text-center">Try</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-700/50">`;
        
        category.items.forEach((item, endpointIndex) => {
            const method = item.method || 'GET';
            const pathParts = item.path.split('?');
            const path = pathParts[0];
            
            const queryString = pathParts[1] || '';
            const urlParams = new URLSearchParams(queryString);
            const paramNames = [];
            for (const [key] of urlParams) {
                if(key !== 'apikey') paramNames.push(key);
            }
            const paramText = paramNames.length > 0 ? paramNames.join(', ') : (queryString ? 'apikey' : '-');

            const statusClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            const methodColor = method === 'GET' ? 'text-blue-400 border-blue-400' : 'text-green-400 border-green-400';

            html += `
                <tr class="api-item hover:bg-slate-800/50 transition-colors"
                    data-method="${method.toLowerCase()}"
                    data-path="${path}"
                    data-alias="${item.name}"
                    data-description="${item.desc}"
                    data-category="${category.name.toLowerCase()}">
                    
                    <td class="py-3 px-4">
                        <div class="font-medium text-sm text-slate-200">${item.name}</div>
                        <div class="text-[11px] text-slate-500 font-mono truncate max-w-[150px] sm:max-w-[250px]" title="${path}">${path}</div>
                    </td>
                    
                    <td class="py-3 px-4 hidden sm:table-cell">
                        <span class="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-700">${paramText}</span>
                    </td>
                    
                    <td class="py-3 px-4">
                        <span class="text-[10px] font-bold px-2 py-1 border rounded bg-transparent ${methodColor}">${method}</span>
                    </td>
                    
                    <td class="py-3 px-4">
                        <span class="text-[10px] font-bold px-2 py-1 rounded ${statusClass}">ONLINE</span>
                    </td>
                    
                    <td class="py-3 px-4 text-center">
                        <button onclick="toggleEndpoint(${catIndex}, ${endpointIndex})" class="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1 mx-auto">
                            <i class="fas fa-play text-[10px]"></i> Try
                        </button>
                    </td>
                </tr>
            `;
            
            html += `
                <tr id="endpoint-row-${catIndex}-${endpointIndex}" class="hidden bg-[#0f172a]">
                    <td colspan="5" class="p-0 border-b border-slate-700">
                        <div class="p-5 border-l-4 border-blue-500">
                            <div class="mb-3">
                                <div class="text-slate-400 text-xs mb-1">Description:</div>
                                <div class="text-sm text-slate-200">${item.desc}</div>
                            </div>
                            
                            <form id="form-${catIndex}-${endpointIndex}">
                                <div class="mb-4 space-y-3 grid grid-cols-1 sm:grid-cols-2 gap-3" id="params-container-${catIndex}-${endpointIndex}">
                                </div>
                                
                                <div class="mb-4">
                                    <div class="text-slate-400 font-bold text-[11px] mb-2 uppercase tracking-wider">Request URL</div>
                                    <div class="flex items-center gap-2">
                                        <div class="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 overflow-x-auto">
                                            <code class="text-xs text-blue-300 whitespace-nowrap" id="url-display-${catIndex}-${endpointIndex}">${item.path}</code>
                                        </div>
                                        <button type="button" onclick="copyUrl(${catIndex}, ${endpointIndex})" class="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 p-2 rounded transition-colors" title="Copy URL">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="flex gap-2">
                                    <button type="button" onclick="executeRequest(event, ${catIndex}, ${endpointIndex}, '${method}', '${path}', 'application/json')" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium px-5 py-2 text-xs rounded transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
                                        <i class="fas fa-bolt"></i> Execute
                                    </button>
                                    <button type="button" onclick="clearResponse(${catIndex}, ${endpointIndex})" class="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-medium px-5 py-2 text-xs rounded transition-colors flex items-center gap-2">
                                        <i class="fas fa-eraser"></i> Clear
                                    </button>
                                </div>
                            </form>

                            <div id="response-${catIndex}-${endpointIndex}" class="hidden mt-5">
                                <div class="text-slate-400 font-bold text-[11px] mb-2 uppercase tracking-wider flex items-center">
                                    <span class="material-icons text-[14px] mr-1">code</span> Response
                                </div>
                                <div class="bg-[#04070f] border border-slate-700 rounded-lg overflow-hidden">
                                    <div class="px-4 py-2 bg-[#1e293b] border-b border-slate-700 flex items-center justify-between">
                                        <div class="flex items-center gap-3">
                                            <span id="response-status-${catIndex}-${endpointIndex}" class="text-[10px] font-bold px-2 py-1 rounded bg-green-500/20 text-green-400">200 OK</span>
                                            <span id="response-time-${catIndex}-${endpointIndex}" class="text-[10px] text-slate-500">0ms</span>
                                        </div>
                                        <button onclick="copyResponse(${catIndex}, ${endpointIndex})" class="text-slate-400 hover:text-white transition-colors" title="Copy Response">
                                            <i class="fas fa-copy text-xs"></i>
                                        </button>
                                    </div>
                                    <div class="p-0 max-h-[400px] overflow-auto">
                                        <div class="response-media-container p-2" id="response-content-${catIndex}-${endpointIndex}"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>`;
        });
        
        html += `</tbody></table></div></div></div>`;
    });
    
    html += '</div>';
    apiList.innerHTML = html;
    
    settings.categories.forEach((category, catIndex) => {
        category.items.forEach((item, endpointIndex) => {
            initializeEndpointParameters(catIndex, endpointIndex, item);
        });
    });
    
    if(document.getElementById('totalApis')) document.getElementById('totalApis').textContent = totalApis;
    if(document.getElementById('totalCategories')) document.getElementById('totalCategories').textContent = settings.categories.length;
    
    initializeSearch();
}

function initializeEndpointParameters(catIndex, endpointIndex, item) {
    const paramsContainer = document.getElementById(`params-container-${catIndex}-${endpointIndex}`);
    if(!paramsContainer) return;
    
    const params = extractParameters(item.path);
    
    if (params.length === 0) {
        paramsContainer.innerHTML = `
            <div class="col-span-full text-xs text-slate-500 italic flex items-center gap-2">
                <i class="fas fa-check-circle text-green-500"></i> No parameters required
            </div>
        `;
        return;
    }
    
    let paramsHtml = '';
    params.forEach(param => {
        const isRequired = param.required;
        paramsHtml += `
            <div>
                <label class="block text-[11px] font-medium text-slate-400 mb-1">
                    ${param.name} ${isRequired ? '<span class="text-red-400">*</span>' : ''}
                    <span class="text-slate-600 ml-1">(${param.type})</span>
                </label>
                <input 
                    type="text" 
                    name="${param.name}" 
                    class="w-full px-3 py-2 border border-slate-700 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-[#04070f] text-slate-200 placeholder-slate-600 transition-colors"
                    placeholder="Enter ${param.name}..."
                    ${isRequired ? 'required' : ''}
                    oninput="updateRequestUrl(${catIndex}, ${endpointIndex})"
                    id="param-${catIndex}-${endpointIndex}-${param.name}"
                >
            </div>`;
    });
    
    paramsContainer.innerHTML = paramsHtml;
    updateRequestUrl(catIndex, endpointIndex);
}

function extractParameters(path) {
    const params = [];
    const queryString = path.split('?')[1];
    if (!queryString) return params;
    
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams) {
        if (value === '' || value === 'YOUR_API_KEY' || key === 'apikey') {
            params.push({
                name: key,
                required: true,
                type: getParamType(key),
                description: getParamDescription(key)
            });
        }
    }
    return params;
}

function getParamType(paramName) {
    const types = {
        'apikey': 'string', 'url': 'string', 'question': 'string',
        'query': 'string', 'prompt': 'string', 'format': 'string',
        'quality': 'string', 'size': 'string', 'limit': 'number'
    };
    return types[paramName] || 'string';
}

function getParamDescription(paramName) {
    const descriptions = {
        'apikey': 'Your API key for authentication',
        'url': 'URL of the content to download/process',
        'question': 'Question or message to ask the AI',
        'query': 'Search query or keywords',
        'prompt': 'Text description for image generation',
        'format': 'Output format (mp4, mp3, jpg, png)',
        'quality': 'Video quality (360p, 720p, 1080p)',
        'size': 'Image dimensions (512x512, 1024x1024)',
        'limit': 'Number of results to return'
    };
    return descriptions[paramName] || paramName;
}

function initializeSearch() {
    allApiItems = [];
    const apiItems = document.querySelectorAll('.api-item');
    apiItems.forEach(item => {
        const name = item.getAttribute('data-alias') || '';
        const desc = item.getAttribute('data-description') || '';
        const path = item.getAttribute('data-path') || '';
        const category = item.getAttribute('data-category') || '';
        
        allApiItems.push({
            element: item,
            name: name.toLowerCase(),
            desc: desc.toLowerCase(),
            path: path.toLowerCase(),
            category: category.toLowerCase()
        });
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const noResults = document.getElementById('noResults');
            
            if (!searchTerm) {
                document.querySelectorAll('.category-group').forEach(group => group.style.display = '');
                document.querySelectorAll('.api-item').forEach(item => item.style.display = '');
                document.querySelectorAll('tr[id^="endpoint-row-"]').forEach(row => row.classList.add('hidden'));
                if(noResults) noResults.classList.add('hidden');
                return;
            }
            
            let visibleCount = 0;
            
            allApiItems.forEach(item => {
                const matches = item.name.includes(searchTerm) || 
                                item.desc.includes(searchTerm) || 
                                item.path.includes(searchTerm) ||
                                item.category.includes(searchTerm);
                
                if (matches && item.element) {
                    item.element.style.display = '';
                    const categoryGroup = item.element.closest('.category-group');
                    if (categoryGroup) categoryGroup.style.display = '';
                    visibleCount++;
                } else if (item.element) {
                    item.element.style.display = 'none';
                }
            });
            
            document.querySelectorAll('.category-group').forEach(category => {
                const hasVisible = category.querySelector('.api-item[style=""]') || 
                                 category.querySelector('.api-item:not([style*="none"])');
                if (!hasVisible) category.style.display = 'none';
            });
            
            if(noResults) noResults.classList.toggle('hidden', visibleCount > 0);
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.matches('input[type="text"]')) {
            if (e.target.closest('form')) {
                const form = e.target.closest('form');
                const formId = form.id;
                const parts = formId.split('-');
                if (parts.length >= 3) {
                    const catIndex = parseInt(parts[1]);
                    const endpointIndex = parseInt(parts[2]);
                    if (!isNaN(catIndex) && !isNaN(endpointIndex) && 
                        settings.categories && 
                        settings.categories[catIndex] && 
                        settings.categories[catIndex].items[endpointIndex]) {
                        
                        const item = settings.categories[catIndex].items[endpointIndex];
                        executeRequest(e, catIndex, endpointIndex, item.method || 'GET', item.path, 'application/json');
                    }
                }
            }
        }
    });
}

function toggleEndpoint(catIndex, endpointIndex) {
    const row = document.getElementById(`endpoint-row-${catIndex}-${endpointIndex}`);
    if(!row) return;
    
    if (row.classList.contains('hidden')) {
        document.querySelectorAll('tr[id^="endpoint-row-"]').forEach(r => r.classList.add('hidden'));
        row.classList.remove('hidden');
    } else {
        row.classList.add('hidden');
    }
}

function updateRequestUrl(catIndex, endpointIndex) {
    const form = document.getElementById(`form-${catIndex}-${endpointIndex}`);
    if (!form) return { url: '', hasErrors: false };
    
    const baseUrl = settings.categories[catIndex].items[endpointIndex].path.split('?')[0];
    const queryParams = new URLSearchParams();
    let hasErrors = false;
    
    const inputs = form.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        const paramName = input.name;
        const paramValue = input.value.trim();
        input.classList.remove('border-red-500');
        
        if (input.required && !paramValue) {
            hasErrors = true;
        }
        if (paramValue) {
            queryParams.set(paramName, paramValue);
        }
    });
    
    const url = baseUrl + (queryParams.toString() ? '?' + queryParams.toString() : '');
    const urlDisplay = document.getElementById(`url-display-${catIndex}-${endpointIndex}`);
    if (urlDisplay) urlDisplay.textContent = url;
    
    return { url, hasErrors };
}

async function executeRequest(event, catIndex, endpointIndex, method, path, produces) {
    if(event) event.preventDefault();
    const { url, hasErrors } = updateRequestUrl(catIndex, endpointIndex);
    
    if (hasErrors) {
        showToast('Please fill in all required parameters', 'error');
        return;
    }
    
    const responseDiv = document.getElementById(`response-${catIndex}-${endpointIndex}`);
    const responseContent = document.getElementById(`response-content-${catIndex}-${endpointIndex}`);
    const responseStatus = document.getElementById(`response-status-${catIndex}-${endpointIndex}`);
    const responseTime = document.getElementById(`response-time-${catIndex}-${endpointIndex}`);
    
    if(!responseDiv) return;
    
    responseDiv.classList.remove('hidden');
    responseContent.innerHTML = '<div class="flex justify-center p-8"><div class="loader border-t-blue-500 rounded-full w-6 h-6 border-2 animate-spin"></div></div>';
    responseStatus.textContent = 'Loading...';
    responseStatus.className = 'text-[10px] px-2 py-1 rounded bg-slate-600 text-slate-300';
    responseTime.textContent = '';
    
    const startTime = Date.now();
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Accept': '*/*', 'User-Agent': 'CHISA-API-Docs' }
        });
        
        const responseTimeMs = Date.now() - startTime;
        
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        const contentType = response.headers.get('content-type') || '';
        responseStatus.textContent = `${response.status} OK`;
        responseStatus.className = 'text-[10px] font-bold px-2 py-1 rounded bg-green-500/20 text-green-400';
        responseTime.textContent = `${responseTimeMs}ms`;
        
        if (contentType.startsWith('image/')) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            responseContent.innerHTML = `<img src="${blobUrl}" class="w-full h-auto object-contain rounded">`;
        } else if (contentType.includes('audio/')) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            responseContent.innerHTML = `<audio controls autoplay class="w-full"><source src="${blobUrl}" type="${contentType}"></audio>`;
        } else if (contentType.includes('video/')) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            responseContent.innerHTML = `<video controls autoplay class="w-full h-full object-contain rounded"><source src="${blobUrl}" type="${contentType}"></video>`;
        } else if (contentType.includes('application/json')) {
            const data = await response.json();
            if (data && typeof data === 'object' && data.error) throw new Error(`API Error: ${data.error}`);
            const formattedResponse = JSON.stringify(data, null, 2);
            responseContent.innerHTML = `<pre class="text-xs p-4 overflow-x-auto text-blue-300 font-mono leading-relaxed">${escapeHtml(formattedResponse)}</pre>`;
        } else {
            const text = await response.text();
            responseContent.innerHTML = `<pre class="text-xs p-4 overflow-x-auto text-slate-300 font-mono">${escapeHtml(text)}</pre>`;
        }
        
        showToast('Request successful!', 'success');
        
    } catch (error) {
        console.error('API Request Error:', error);
        const errorMessage = error.message || 'Unknown error occurred';
        responseContent.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-triangle text-2xl text-red-400 mb-3"></i>
                <div class="text-sm font-medium text-red-400">Error</div>
                <div class="text-xs text-slate-400 mt-1">${escapeHtml(errorMessage)}</div>
            </div>
        `;
        responseStatus.textContent = 'Error';
        responseStatus.className = 'text-[10px] font-bold px-2 py-1 rounded bg-red-500/20 text-red-400';
        responseTime.textContent = `${Date.now() - startTime}ms`;
        showToast(`Request failed: ${errorMessage}`, 'error');
    }
}

function clearResponse(catIndex, endpointIndex) {
    const form = document.getElementById(`form-${catIndex}-${endpointIndex}`);
    const responseDiv = document.getElementById(`response-${catIndex}-${endpointIndex}`);
    if(!form || !responseDiv) return;
    
    const inputs = form.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('border-red-500');
    });
    
    responseDiv.classList.add('hidden');
    updateRequestUrl(catIndex, endpointIndex);
    showToast('Form cleared', 'info');
}

function copyUrl(catIndex, endpointIndex) {
    const urlDisplay = document.getElementById(`url-display-${catIndex}-${endpointIndex}`);
    if(!urlDisplay) return;
    const url = window.location.origin + urlDisplay.textContent;
    navigator.clipboard.writeText(url).then(() => {
        showToast('URL copied!', 'success');
    }).catch(() => showToast('Failed to copy URL', 'error'));
}

function copyResponse(catIndex, endpointIndex) {
    const responseContent = document.getElementById(`response-content-${catIndex}-${endpointIndex}`);
    if(!responseContent) return;
    const text = responseContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Response copied!', 'success');
    }).catch(() => showToast('Failed to copy response', 'error'));
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-custom');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-custom fixed bottom-5 right-5 bg-[#1e293b] border border-slate-700 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-[9999] transform transition-all duration-300 translate-y-10 opacity-0';
    
    const icon = { 'success': 'fa-check-circle', 'error': 'fa-exclamation-circle', 'info': 'fa-info-circle' }[type] || 'fa-info-circle';
    const color = { 'success': '#10b981', 'error': '#ef4444', 'info': '#3b82f6' }[type] || '#3b82f6';
    
    toast.innerHTML = `<i class="fas ${icon} text-lg" style="color: ${color}"></i><span class="text-sm font-medium">${message}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showErrorMessage(err = undefined) {
    const loadingScreen = document.getElementById('loadingScreen');
    if(loadingScreen) {
        loadingScreen.innerHTML = `
            <div class="text-center">
                <i class="fas fa-wifi text-3xl text-slate-400 mb-4"></i>
                <p class="text-sm text-slate-400">${err ? err : "Using demo configuration"}</p>
            </div>
        `;
    }
    
    settings = getDefaultSettings();
    setupUI();
    loadAPIData();
    setupEventListeners();
    
    setTimeout(() => {
        if(loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.style.display = 'none', 300);
        }
    }, 1000);
}

window.toggleCategory = function() {};
window.toggleEndpoint = toggleEndpoint;
window.executeRequest = executeRequest;
window.clearResponse = clearResponse;
window.copyUrl = copyUrl;
window.copyResponse = copyResponse;
window.updateRequestUrl = updateRequestUrl;