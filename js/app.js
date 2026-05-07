// ==========================================
// CABLE TEST SHEET - REFACTORED ARCHITECTURE
// ==========================================

// ==========================================
// 1. CONFIGURATION
// ==========================================
const CONFIG = {
    CORE_TEMPLATES: [2, 3, 4, 7, 12, 19],
    MAX_CORES: 50,
    STORAGE_KEY: 'cableTestRecords',
    COLORS: {
        primary: '#003057',
        secondary: '#001a32',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8'
    },
    FIELD_CONFIG: {
        cable: ['client', 'project', 'testDate', 'cableId', 'cableLength', 'cableFrom', 'cableTo', 'coreSize', 'testVolts', 'weather', 'referenceCore'],
        tester: ['name', 'date'],
        testData: ['loop', 'coreCore', 'coreEarth', 'coreSheath', 'sheathEarth']
    },
    PDF: {
        margin: 8,
        headerFontSize: 10,
        bodyFontSize: 8,
        tableFontSize: 6,
        lineHeight: 4
    }
};

// ==========================================
// 2. UTILITY FUNCTIONS
// ==========================================
const Utils = {
    sanitizeFilename: (str) => str.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, ''),
    
    generateFilename: (extension, cableId, project, testDate) => {
        const safeProject = project ? Utils.sanitizeFilename(project) : 'NO_PROJECT';
        const safeCableId = Utils.sanitizeFilename(cableId);
        const dateStr = testDate.replace(/-/g, '');
        return `${safeCableId}_${safeProject}_${dateStr}.${extension}`;
    },
    
    formatDate: (dateStr) => new Date(dateStr).toLocaleDateString(),
    
    getToday: () => new Date().toISOString().split('T')[0],
    
    getRadioValue: (name) => {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        return selected ? selected.value : '';
    },
    
    setRadioValue: (name, value) => {
        const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (radio) radio.checked = true;
    }
};

// ==========================================
// 3. STORAGE MANAGER
// ==========================================
const Storage = {
    getAll: () => {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    },
    
    save: (records) => {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(records));
    },
    
    add: (record) => {
        const records = Storage.getAll();
        records.push(record);
        Storage.save(records);
    },
    
    update: (id, record) => {
        let records = Storage.getAll();
        records = records.map(r => r.id === id ? record : r);
        Storage.save(records);
    },
    
    delete: (id) => {
        let records = Storage.getAll();
        records = records.filter(r => r.id !== id);
        Storage.save(records);
    },
    
    getById: (id) => {
        const records = Storage.getAll();
        return records.find(r => r.id === id);
    }
};

// ==========================================
// 4. FORM BUILDER
// ==========================================
const FormBuilder = {
    buildNewTestForm: () => {
        const form = document.getElementById('testForm');
        form.innerHTML = `
            ${FormBuilder.cableInfoSection()}
            ${FormBuilder.coreTemplateSection()}
            ${FormBuilder.testDataSection()}
            ${FormBuilder.signatureSection()}
            ${FormBuilder.actionButtonsSection()}
        `;
    },
    
    cableInfoSection: () => `
        <div class="space-y-2 sm:space-y-3">
            <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 pb-2 border-b-2 border-[#003057]">Cable Information</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                ${FormBuilder.inputField('client', 'Client', 'KiwiRail')}
                ${FormBuilder.inputField('project', 'Project')}
                ${FormBuilder.inputField('testDate', 'Test Date', '', 'date', true)}
                ${FormBuilder.inputField('cableId', 'Cable ID *', '', 'text', true)}
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                ${FormBuilder.inputField('cableLength', 'Length (m)', '', 'number', false, 0.1)}
                ${FormBuilder.inputField('cableFrom', 'From')}
                ${FormBuilder.inputField('cableTo', 'To')}
                ${FormBuilder.inputField('coreSize', 'No. Core / Size')}
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                ${FormBuilder.inputField('testVolts', 'Test Volts', '', 'number', false, 0.1)}
                ${FormBuilder.inputField('weather', 'Weather')}
                <div class="space-y-1 col-span-2 sm:col-span-2 lg:col-span-2">
                    ${FormBuilder.inputField('referenceCore', 'Reference Core No.')}
                </div>
            </div>
            <div class="space-y-1.5 sm:space-y-2">
                ${FormBuilder.radioGroup('polarityOk', 'Polarity OK?', ['YES', 'NO'])}
            </div>
            <div class="space-y-1.5 sm:space-y-2">
                ${FormBuilder.radioGroup('mainLocal', 'Main / Local', ['MAIN', 'LOCAL'])}
            </div>
        </div>
    `,
    
    coreTemplateSection: () => `
        <div class="space-y-2 sm:space-y-3">
            <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 pb-2 border-b-2 border-[#003057]">Select Core Template</h2>
            <div class="flex flex-wrap gap-1.5 sm:gap-2">
                ${CONFIG.CORE_TEMPLATES.map(core => 
                    `<button type="button" class="template-btn px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 border-2 border-gray-300 bg-white text-gray-700 font-bold text-xs sm:text-sm rounded-lg hover:border-[#003057] hover:text-[#003057] transition" onclick="app.form.selectTemplate(${core})">${core} Core</button>`
                ).join('')}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div class="space-y-1">
                    <label class="block text-xs sm:text-sm font-semibold text-gray-700">Custom Core (2-50)</label>
                    <input type="number" id="customCores" min="2" max="50" placeholder="Enter number" class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003057] focus:border-transparent transition">
                </div>
                <div class="flex items-end col-span-1 sm:col-span-2">
                    <button type="button" class="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold text-xs sm:text-sm rounded-lg transition" onclick="app.form.applyCustomCores()">Apply</button>
                </div>
            </div>
        </div>
    `,
    
    testDataSection: () => `
        <div class="space-y-2 sm:space-y-3">
            <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 pb-2 border-b-2 border-[#003057]">Test Data</h2>
            <div class="overflow-x-auto rounded-lg border border-gray-300">
                <table class="w-full text-xs sm:text-sm">
                    <thead class="bg-[#003057] text-white">
                        <tr>
                            <th class="px-2 sm:px-3 py-1.5 sm:py-2 text-left">Core</th>
                            <th class="px-2 sm:px-3 py-1.5 sm:py-2 text-left">Loop (Ω)</th>
                            <th class="px-2 sm:px-3 py-1.5 sm:py-2 text-left">C/C (MΩ)</th>
                            <th class="px-2 sm:px-3 py-1.5 sm:py-2 text-left">C/E (MΩ)</th>
                            <th class="px-2 sm:px-3 py-1.5 sm:py-2 text-left">C/S (MΩ)</th>
                            <th class="px-2 sm:px-3 py-1.5 sm:py-2 text-left">S/E (MΩ)</th>
                        </tr>
                    </thead>
                    <tbody id="testDataBody" class="divide-y divide-gray-200"></tbody>
                </table>
            </div>
        </div>
    `,
    
    signatureSection: () => `
        <div class="space-y-2 sm:space-y-3">
            <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 pb-2 border-b-2 border-[#003057]">Tester Information & Signatures</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                ${FormBuilder.testerSignatureBox(1)}
                ${FormBuilder.testerSignatureBox(2)}
            </div>
        </div>
    `,
    
    testerSignatureBox: (num) => `
        <div class="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
            <h3 class="text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-2">Tester ${num}</h3>
            <div class="border-2 border-[#003057] rounded-lg mb-2 bg-white overflow-hidden h-36 sm:h-40 md:h-44">
                <canvas id="sig${num}Canvas" class="w-full h-full cursor-crosshair touch-none"></canvas>
            </div>

            <div class="flex gap-1.5 sm:gap-2 mb-2">
                <button type="button" class="flex-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-600 hover:bg-gray-700 text-white font-bold text-xs rounded-lg transition" onclick="app.signature.clear('sig${num}')">Clear</button>
                <button type="button" class="flex-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-600 hover:bg-gray-700 text-white font-bold text-xs rounded-lg transition" onclick="app.signature.undo('sig${num}')">Undo</button>
            </div>

            <div class="grid grid-cols-1 gap-1.5 sm:gap-2">
                <div class="space-y-0.5">
                    <label class="text-xs font-semibold text-gray-700">Name</label>
                    <input type="text" id="tester${num}Name" placeholder="Name" class="w-full px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003057] focus:border-transparent text-xs sm:text-sm transition">
                </div>
                <div class="space-y-0.5">
                    <label class="text-xs font-semibold text-gray-700">Date</label>
                    <input type="date" id="tester${num}Date" class="w-full px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003057] focus:border-transparent text-xs sm:text-sm transition">
                </div>
            </div>
        </div>
    `,
    
    actionButtonsSection: () => `
        <div class="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 justify-center pt-2 sm:pt-3 md:pt-4">
            <button type="button" class="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-[#003057] hover:bg-[#001a32] text-white font-bold text-xs sm:text-sm md:text-base rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105" onclick="app.form.save()">💾 Save</button>
            <button type="button" class="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm md:text-base rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105" onclick="app.export.singlePDF()">📄 PDF</button>
            <button type="button" class="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xs sm:text-sm md:text-base rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105" onclick="app.export.singleCSV()">📊 CSV</button>
            <button type="button" class="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold text-xs sm:text-sm md:text-base rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105" onclick="app.form.reset()">🔄 Reset</button>
        </div>
    `,
    
    inputField: (id, label, placeholder = '', type = 'text', required = false, step = null) => {
        const stepAttr = step ? `step="${step}"` : '';
        const requiredAttr = required ? 'required' : '';
        return `
            <div class="space-y-1">
                <label class="block text-xs sm:text-sm font-semibold text-gray-700">${label}</label>
                <input type="${type}" id="${id}" placeholder="${placeholder}" ${requiredAttr} ${stepAttr} class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003057] focus:border-transparent transition">
            </div>
        `;
    },
    
    radioGroup: (name, label, options) => `
        <label class="block text-xs sm:text-sm font-semibold text-gray-700">${label}</label>
        <div class="flex gap-4 sm:gap-6">
            ${options.map(option => `
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="${name}" value="${option}" class="w-4 h-4 text-[#003057] focus:ring-2 focus:ring-[#003057]">
                    <span class="text-xs sm:text-sm text-gray-700">${option}</span>
                </label>
            `).join('')}
        </div>
    `
};

// ==========================================
// 5. SIGNATURE MANAGER
// ==========================================

const SignatureManager = {
    pads: {},

    init: () => {
        ['sig1', 'sig2'].forEach(padName => {
            
            const canvas = document.getElementById(`${padName}Canvas`);

            canvas.style.width = "100%";
            canvas.style.height = "100%";

            const resizeCanvas = () => {
                const ratio = Math.max(window.devicePixelRatio || 1, 1);
                const rect = canvas.getBoundingClientRect();

                const ctx = canvas.getContext('2d');

                // ✅ RESET EVERYTHING FIRST
                ctx.setTransform(1, 0, 0, 1, 0, 0);

                canvas.width = rect.width * ratio;
                canvas.height = rect.height * ratio;

                ctx.scale(ratio, ratio);
            };

            // ✅ MUST RUN BEFORE SignaturePad
            resizeCanvas();

            // ✅ NOW create SignaturePad AFTER correct sizing
            const pad = new SignaturePad(canvas, {
                penColor: '#333',
                throttle: 8,
                minWidth: 1,
                maxWidth: 2.5
            });

            SignatureManager.pads[padName] = pad;

            // ✅ ONLY resize (do NOT re-save/restore here)
            window.addEventListener('resize', () => {
                resizeCanvas();
            });


            SignatureManager.pads[padName] = pad;

            
            window.addEventListener('resize', resizeCanvas);

        });
    },

    clear: (padName) => SignatureManager.pads[padName].clear(),

    undo: (padName) => {
        const data = SignatureManager.pads[padName].toData();
        if (data.length) {
            data.pop();
            SignatureManager.pads[padName].fromData(data);
        }
    },

    getSignature: (padName) => SignatureManager.pads[padName].toDataURL(),

    setSignature: (padName, dataUrl) => {
        SignatureManager.pads[padName].fromDataURL(dataUrl);
    }
};


// ==========================================
// 6. FORM CONTROLLER
// ==========================================
const FormController = {
    currentCoreCount: 4,
    
    selectTemplate: (cores) => {
        FormController.currentCoreCount = cores;
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.classList.remove('border-[#003057]', 'text-[#003057]', 'bg-blue-50');
        });
        event.target.classList.add('border-[#003057]', 'text-[#003057]', 'bg-blue-50');
        FormController.generateTestDataRows(cores);
    },
    
    applyCustomCores: () => {
        const customCores = parseInt(document.getElementById('customCores').value);
        if (isNaN(customCores) || customCores < 2 || customCores > CONFIG.MAX_CORES) {
            alert(`Please enter a valid number between 2 and ${CONFIG.MAX_CORES}`);
            return;
        }
        FormController.currentCoreCount = customCores;
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.classList.remove('border-[#003057]', 'text-[#003057]', 'bg-blue-50');
        });
        FormController.generateTestDataRows(customCores);
    },
    
    generateTestDataRows: (coreCount) => {
        const tbody = document.getElementById('testDataBody');
        tbody.innerHTML = '';
        for (let i = 1; i <= coreCount; i++) {
            const row = document.createElement('tr');
            row.className = i % 2 === 0 ? 'bg-gray-50' : 'bg-white';
            row.innerHTML = `
                <td class="px-2 sm:px-3 py-1.5 sm:py-2 font-semibold text-gray-700 text-xs sm:text-sm">${i}</td>
                ${CONFIG.FIELD_CONFIG.testData.map(field => `
                    <td class="px-2 sm:px-3 py-1.5 sm:py-2">
                        <input type="number" class="${field}-${i} w-full px-1.5 sm:px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003057]" step="0.01" placeholder="${field === 'loop' ? 'Ω' : 'MΩ'}">
                    </td>
                `).join('')}
            `;
            tbody.appendChild(row);
        }
    },
    
    collectTestData: () => {
        const testData = [];
        for (let i = 1; i <= FormController.currentCoreCount; i++) {
            testData.push({
                coreNo: i,
                loop: document.querySelector(`.loop-${i}`)?.value || '',
                coreCore: document.querySelector(`.coreCore-${i}`)?.value || '',
                coreEarth: document.querySelector(`.coreEarth-${i}`)?.value || '',
                coreSheath: document.querySelector(`.coreSheath-${i}`)?.value || '',
                sheathEarth: document.querySelector(`.sheathEarth-${i}`)?.value || ''
            });
        }
        return testData;
    },
    
    collectFormData: () => {
        return {
            id: Date.now(),
            client: document.getElementById('client').value,
            project: document.getElementById('project').value,
            testDate: document.getElementById('testDate').value,
            cableId: document.getElementById('cableId').value,
            cableLength: document.getElementById('cableLength').value,
            cableFrom: document.getElementById('cableFrom').value,
            cableTo: document.getElementById('cableTo').value,
            coreSize: document.getElementById('coreSize').value,
            testVolts: document.getElementById('testVolts').value,
            weather: document.getElementById('weather').value,
            referenceCore: document.getElementById('referenceCore').value,
            polarityOk: Utils.getRadioValue('polarityOk'),
            mainLocal: Utils.getRadioValue('mainLocal'),
            coreCount: FormController.currentCoreCount,
            testData: FormController.collectTestData(),
            tester1: {
                name: document.getElementById('tester1Name').value,
                date: document.getElementById('tester1Date').value,
                signature: SignatureManager.getSignature('sig1')
            },
            tester2: {
                name: document.getElementById('tester2Name').value,
                date: document.getElementById('tester2Date').value,
                signature: SignatureManager.getSignature('sig2')
            }
        };
    },
    
    populateFormData: (record) => {
        document.getElementById('client').value = record.client;
        document.getElementById('project').value = record.project;
        document.getElementById('testDate').value = record.testDate;
        document.getElementById('cableId').value = record.cableId;
        document.getElementById('cableLength').value = record.cableLength;
        document.getElementById('cableFrom').value = record.cableFrom;
        document.getElementById('cableTo').value = record.cableTo;
        document.getElementById('coreSize').value = record.coreSize;
        document.getElementById('testVolts').value = record.testVolts;
        document.getElementById('weather').value = record.weather;
        document.getElementById('referenceCore').value = record.referenceCore;
        Utils.setRadioValue('polarityOk', record.polarityOk);
        Utils.setRadioValue('mainLocal', record.mainLocal);
        
        document.getElementById('tester1Name').value = record.tester1.name;
        document.getElementById('tester1Date').value = record.tester1.date;
        document.getElementById('tester2Name').value = record.tester2.name;
        document.getElementById('tester2Date').value = record.tester2.date;
        
        FormController.generateTestDataRows(record.coreCount);
        record.testData.forEach(td => {
            document.querySelector(`.loop-${td.coreNo}`).value = td.loop;
            document.querySelector(`.coreCore-${td.coreNo}`).value = td.coreCore;
            document.querySelector(`.coreEarth-${td.coreNo}`).value = td.coreEarth;
            document.querySelector(`.coreSheath-${td.coreNo}`).value = td.coreSheath;
            document.querySelector(`.sheathEarth-${td.coreNo}`).value = td.sheathEarth;
        });
        
        SignatureManager.setSignature('sig1', record.tester1.signature);
        SignatureManager.setSignature('sig2', record.tester2.signature);
    },
    
    save: () => {
        const cableId = document.getElementById('cableId').value;
        if (!cableId) {
            alert('Please enter a Cable ID');
            return;
        }
        
        const record = FormController.collectFormData();
        Storage.add(record);
        alert('Test saved successfully!');
        FormController.reset();
    },
    
    reset: () => {
        document.getElementById('testForm').reset();
        SignatureManager.clear('sig1');
        SignatureManager.clear('sig2');
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.classList.remove('border-[#003057]', 'text-[#003057]', 'bg-blue-50');
        });
        FormController.currentCoreCount = 4;
        const today = Utils.getToday();
        document.getElementById('testDate').value = today;
        document.getElementById('tester1Date').value = today;
        document.getElementById('tester2Date').value = today;
        FormController.generateTestDataRows(4);
    }
};

// ==========================================
// 7. RECORDS CONTROLLER
// ==========================================
const RecordsController = {
    allRecords: [],
    filteredRecords: [],
    selectedRecords: new Set(),
    
    load: () => {
        RecordsController.allRecords = Storage.getAll();
        RecordsController.filteredRecords = [...RecordsController.allRecords];
        RecordsController.display(RecordsController.filteredRecords);
    },
    
    display: (records) => {
        const recordsList = document.getElementById('recordsList');
        if (records.length === 0) {
            recordsList.innerHTML = `
                <div class="col-span-full text-center py-8 sm:py-12 text-gray-400">
                    <h3 class="text-lg sm:text-xl font-bold mb-1 sm:mb-2">No records found</h3>
                    <p class="text-xs sm:text-sm">Create a new test to get started</p>
                </div>
            `;
            return;
        }
        
        recordsList.innerHTML = records.map(record => `
            <div class="bg-gradient-to-br from-white to-gray-50 border border-gray-300 rounded-lg p-2 sm:p-3 md:p-4 shadow-md hover:shadow-xl transition transform hover:scale-105">
                <div class="flex items-start justify-between mb-2 sm:mb-3">
                    <div>
                        <h3 class="text-sm sm:text-base md:text-lg font-bold text-[#003057]">${record.cableId}</h3>
                        <p class="text-xs sm:text-sm text-gray-600">${record.client}</p>
                    </div>
                    <label class="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" onchange="app.records.toggleSelection('${record.id}', this.checked)" class="w-4 h-4 text-[#003057] rounded focus:ring-2 focus:ring-[#003057]">
                    </label>
                </div>
                <div class="space-y-0.5 sm:space-y-1 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-700">
                    <p><span class="font-semibold">Cores:</span> ${record.coreCount}</p>
                    <p><span class="font-semibold">Route:</span> ${record.cableFrom} → ${record.cableTo}</p>
                    <p class="text-xs text-gray-500">📅 ${Utils.formatDate(record.testDate)}</p>
                </div>
                <div class="flex gap-1 sm:gap-1.5 flex-wrap">
                    <button onclick="app.records.view('${record.id}')" class="flex-1 min-w-fit px-2 sm:px-3 py-1 sm:py-1.5 bg-[#003057] hover:bg-[#001a32] text-white font-bold text-xs rounded-lg transition">👁️</button>
                    <button onclick="app.records.edit('${record.id}')" class="flex-1 min-w-fit px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xs rounded-lg transition">✏️</button>
                    <button onclick="app.records.delete('${record.id}')" class="flex-1 min-w-fit px-2 sm:px-3 py-1 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition">🗑️</button>
                </div>
            </div>
        `).join('');
    },
    
    view: (recordId) => {
        const record = Storage.getById(recordId);
        if (!record) return;
        
        const testDataHTML = record.testData.map((td, idx) => `
            <tr class="${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
                <td class="px-2 sm:px-3 py-1 sm:py-1.5 font-semibold text-gray-700 text-xs sm:text-sm">${td.coreNo}</td>
                <td class="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">${td.loop || '-'}</td>
                <td class="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">${td.coreCore || '-'}</td>
                <td class="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">${td.coreEarth || '-'}</td>
                <td class="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">${td.coreSheath || '-'}</td>
                <td class="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">${td.sheathEarth || '-'}</td>
            </tr>
        `).join('');
        
        const html = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div><p class="text-xs sm:text-sm text-gray-600"><span class="font-semibold">Cable ID:</span> ${record.cableId}</p></div>
                <div><p class="text-xs sm:text-sm text-gray-600"><span class="font-semibold">Client:</span> ${record.client}</p></div>
                <div><p class="text-xs sm:text-sm text-gray-600"><span class="font-semibold">Test Date:</span> ${record.testDate}</p></div>
                <div><p class="text-xs sm:text-sm text-gray-600"><span class="font-semibold">Length:</span> ${record.cableLength} m</p></div>
                <div><p class="text-xs sm:text-sm text-gray-600"><span class="font-semibold">From:</span> ${record.cableFrom}</p></div>
                <div><p class="text-xs sm:text-sm text-gray-600"><span class="font-semibold">To:</span> ${record.cableTo}</p></div>
                <div><p class="text-xs sm:text-sm text-gray-600"><span class="font-semibold">Cores:</span> ${record.coreCount}</p></div>
                <div><p class="text-xs sm:text-sm text-gray-600"><span class="font-semibold">Test Volts:</span> ${record.testVolts}</p></div>
                <div><p class="text-xs sm:text-sm text-gray-600"><span class="font-semibold">Polarity:</span> ${record.polarityOk}</p></div>
            </div>
            <h3 class="text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-2 sm:mb-3">Test Data</h3>
            <div class="overflow-x-auto mb-4 sm:mb-6 rounded-lg border border-gray-300">
                <table class="w-full text-xs sm:text-sm">
                    <thead class="bg-[#003057] text-white">
                        <tr>
                            <th class="px-2 sm:px-3 py-1 sm:py-2 text-left">Core</th>
                            <th class="px-2 sm:px-3 py-1 sm:py-2 text-left">Loop (Ω)</th>
                            <th class="px-2 sm:px-3 py-1 sm:py-2 text-left">C/C (MΩ)</th>
                            <th class="px-2 sm:px-3 py-1 sm:py-2 text-left">C/E (MΩ)</th>
                            <th class="px-2 sm:px-3 py-1 sm:py-2 text-left">C/S (MΩ)</th>
                            <th class="px-2 sm:px-3 py-1 sm:py-2 text-left">S/E (MΩ)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">${testDataHTML}</tbody>
                </table>
            </div>
            <h3 class="text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-2 sm:mb-3">Signatures</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                <div class="bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200">
                    <h4 class="font-bold text-gray-800 text-xs sm:text-sm mb-1">Tester 1: ${record.tester1.name}</h4>
                    <p class="text-xs text-gray-600 mb-1.5">Date: ${record.tester1.date}</p>
                    <img src="${record.tester1.signature}" class="w-full border border-gray-300 rounded">
                </div>
                <div class="bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200">
                    <h4 class="font-bold text-gray-800 text-xs sm:text-sm mb-1">Tester 2: ${record.tester2.name}</h4>
                    <p class="text-xs text-gray-600 mb-1.5">Date: ${record.tester2.date}</p>
                    <img src="${record.tester2.signature}" class="w-full border border-gray-300 rounded">
                </div>
            </div>
            <div class="flex gap-1.5 sm:gap-2 md:gap-3">
                <button onclick="app.export.recordPDF('${record.id}')" class="flex-1 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm rounded-lg transition">📄 PDF</button>
                <button onclick="app.export.recordCSV('${record.id}')" class="flex-1 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xs sm:text-sm rounded-lg transition">📊 CSV</button>
            </div>
        `;
        
        document.getElementById('viewModalBody').innerHTML = html;
        app.ui.openModal('viewModal');
    },
    
    edit: (recordId) => {
        const record = Storage.getById(recordId);
        if (!record) return;
        
        FormController.populateFormData(record);
        FormController.generateTestDataRows(record.coreCount);
        Storage.delete(recordId);
        app.ui.switchTab('new-test');
    },
    
    delete: (recordId) => {
        if (confirm('Are you sure you want to delete this record?')) {
            Storage.delete(recordId);
            RecordsController.load();
        }
    },
    
    search: () => {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        RecordsController.filteredRecords = RecordsController.allRecords.filter(r =>
            r.cableId.toLowerCase().includes(searchTerm) ||
            r.client.toLowerCase().includes(searchTerm)
        );
        RecordsController.selectedRecords.clear();
        RecordsController.display(RecordsController.filteredRecords);
    },
    
    resetSearch: () => {
        document.getElementById('searchInput').value = '';
        RecordsController.filteredRecords = [...RecordsController.allRecords];
        RecordsController.selectedRecords.clear();
        RecordsController.display(RecordsController.filteredRecords);
    },
    
    toggleSelection: (recordId, checked) => {
        if (checked) {
            RecordsController.selectedRecords.add(recordId);
        } else {
            RecordsController.selectedRecords.delete(recordId);
        }
        RecordsController.updateSelectAllCheckbox();
    },
    
    toggleSelectAll: () => {
        const isChecked = document.getElementById('selectAllCheckbox').checked;
        RecordsController.filteredRecords.forEach(record => {
            if (isChecked) {
                RecordsController.selectedRecords.add(String(record.id));
            } else {
                RecordsController.selectedRecords.delete(String(record.id));
            }
        });
        RecordsController.load();
    },
    
    updateSelectAllCheckbox: () => {
        const checkbox = document.getElementById('selectAllCheckbox');
        checkbox.checked = RecordsController.filteredRecords.length > 0 && 
            RecordsController.filteredRecords.every(r => RecordsController.selectedRecords.has(String(r.id)));
    }
};

// ==========================================
// 8. EXPORT CONTROLLER
// ==========================================
const ExportController = {
    singlePDF: () => {
        const cableId = document.getElementById('cableId').value;
        if (!cableId) {
            alert('Please enter a Cable ID');
            return;
        }
        
        const record = FormController.collectFormData();
        const fileName = Utils.generateFilename('pdf', cableId, record.project, record.testDate);
        ExportController.generatePDF([record], fileName);
    },
    
    recordPDF: (recordId) => {
        const record = Storage.getById(recordId);
        if (record) {
            const fileName = Utils.generateFilename('pdf', record.cableId, record.project, record.testDate);
            ExportController.generatePDF([record], fileName);
        }
    },
    
    batchPDF: () => {
        const selected = RecordsController.allRecords.filter(r => RecordsController.selectedRecords.has(String(r.id)));
        if (selected.length === 0) {
            alert('Please select at least one record');
            return;
        }
        
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const fileName = `Batch_Export_${dateStr}.pdf`;
        ExportController.generatePDF(selected, fileName);
    },
    
    generatePDF: async (records, fileName) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = CONFIG.PDF.margin;
        let yPosition = margin;
        
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const estimatedHeight = 80 + (record.coreCount * 2.5);
            
            if (yPosition + estimatedHeight > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
            
            yPosition = ExportController.addTestToPDF(doc, record, yPosition, pageWidth);
            yPosition += 3;
        }
        
        doc.save(fileName);
        alert(`PDF exported! (${records.length} test${records.length > 1 ? 's' : ''})`);
    },

    
    compressImage: (dataUrl) => {
        return new Promise(resolve => {
            const img = new Image();
            img.src = dataUrl;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
        });
    },

    
    addTestToPDF: (doc, record, startY, pageWidth) => {
        const margin = CONFIG.PDF.margin;
        const contentWidth = pageWidth - (margin * 2);
        let yPos = startY;
        const lineHeight = CONFIG.PDF.lineHeight;
        
        doc.setFontSize(CONFIG.PDF.headerFontSize);
        doc.setFont(undefined, 'bold');
        doc.text(`Cable Test - ${record.cableId}`, margin, yPos);
        yPos += 4;
        
        doc.setFontSize(CONFIG.PDF.bodyFontSize);
        doc.setFont(undefined, 'normal');
        
        const col1X = margin;
        const col2X = margin + contentWidth / 2;
        const colWidth = contentWidth / 2 - 1;
        
        const headerInfo = [
            ['Client:', record.client, 'Date:', record.testDate],
            ['Cable ID:', record.cableId, 'Length:', `${record.cableLength} m`],
            ['From:', record.cableFrom, 'To:', record.cableTo],
            ['Cores:', record.coreSize, 'Volts:', record.testVolts],
            ['Polarity:', record.polarityOk, 'Main/Local:', record.mainLocal]
        ];
        
        headerInfo.forEach(row => {
            doc.text(row[0], col1X, yPos, { maxWidth: 12 });
            const val1 = String(row[1]).substring(0, 20);
            doc.text(val1, col1X + 13, yPos, { maxWidth: colWidth - 13 });
            
            doc.text(row[2], col2X, yPos, { maxWidth: 12 });
            const val2 = String(row[3]).substring(0, 20);
            doc.text(val2, col2X + 13, yPos, { maxWidth: colWidth - 13 });
            
            yPos += lineHeight - 1;
        });
        
        yPos += 2;
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(CONFIG.PDF.tableFontSize);
        
        const tableHeaders = ['Core', 'Loop(Ω)', 'C/C(MΩ)', 'C/E(MΩ)', 'C/S(MΩ)', 'S/E(MΩ)'];
        const colWidths = [12, 13, 13, 13, 13, 13];
        let tableX = margin;
        
        doc.setFillColor(0, 48, 87);
        doc.setTextColor(255, 255, 255);
        tableHeaders.forEach((header, idx) => {
            doc.rect(tableX, yPos - 2.5, colWidths[idx], 3, 'F');
            doc.text(header, tableX + colWidths[idx] / 2, yPos, { align: 'center', fontSize: CONFIG.PDF.tableFontSize });
            tableX += colWidths[idx];
        });
        
        yPos += 3.5;
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
        record.testData.forEach((testData, idx) => {
            if (yPos > pageHeight - margin - 20) {
                doc.addPage();
                yPos = margin;
            }
            
            tableX = margin;
            const rowData = [
                testData.coreNo,
                testData.loop || '-',
                testData.coreCore || '-',
                testData.coreEarth || '-',
                testData.coreSheath || '-',
                testData.sheathEarth || '-'
            ];
            
            if (idx % 2 === 0) {
                doc.setFillColor(240, 240, 240);
                doc.rect(margin, yPos - 2.2, contentWidth, 2.8, 'F');
            }
            
            rowData.forEach((data, colIdx) => {
                doc.text(String(data).substring(0, 8), tableX + colWidths[colIdx] / 2, yPos, { align: 'center' });
                tableX += colWidths[colIdx];
            });
            
            yPos += 2.8;
        });
        
        yPos += 2;
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(7);
        doc.text('Tester 1', margin, yPos);
        doc.text('Tester 2', col2X, yPos);
        yPos += 8;
        
        try {
            if (record.tester1.signature && record.tester1.signature.length > 100) {
                doc.addImage(record.tester1.signature, 'PNG', margin, yPos - 8, 30, 10);
            }
            if (record.tester2.signature && record.tester2.signature.length > 100) {
                doc.addImage(record.tester2.signature, 'PNG', col2X, yPos - 8, 30, 10);
            }
        } catch (e) {
            console.log('Could not add signatures');
        }
        
        yPos += 8;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(6);
        doc.text(`${record.tester1.name} - ${record.tester1.date}`, margin, yPos);
        doc.text(`${record.tester2.name} - ${record.tester2.date}`, col2X, yPos);
        
        return yPos + 3;
    },
    
    singleCSV: () => {
        const cableId = document.getElementById('cableId').value;
        if (!cableId) {
            alert('Please enter a Cable ID');
            return;
        }
        
        const record = FormController.collectFormData();
        const fileName = Utils.generateFilename('csv', cableId, record.project, record.testDate);
        ExportController.generateCSV([record], fileName);
    },
    
    recordCSV: (recordId) => {
        const record = Storage.getById(recordId);
        if (record) {
            const fileName = Utils.generateFilename('csv', record.cableId, record.project, record.testDate);
            ExportController.generateCSV([record], fileName);
        }
    },
    
    batchCSV: () => {
        const selected = RecordsController.allRecords.filter(r => RecordsController.selectedRecords.has(String(r.id)));
        if (selected.length === 0) {
            alert('Please select at least one record');
            return;
        }
        
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const fileName = `Batch_Export_${dateStr}.csv`;
        ExportController.generateCSV(selected, fileName);
    },
    
    generateCSV: (records, fileName) => {
        let csv = 'Cable ID,Client,Test Date,From,To,Cores,Length (m),Test Volts,Polarity,Main/Local,Weather,Reference Core,Core No,Loop (Ω),Core/Core (MΩ),Core/Earth (MΩ),Core/Sheath (MΩ),Sheath/Earth (MΩ),Tester 1 Name,Tester 1 Date,Tester 2 Name,Tester 2 Date\n';
        
        records.forEach(record => {
            record.testData.forEach((testData, idx) => {
                csv += `"${record.cableId}","${record.client}","${record.testDate}","${record.cableFrom}","${record.cableTo}",${record.coreCount},"${record.cableLength}","${record.testVolts}","${record.polarityOk}","${record.mainLocal}","${record.weather}","${record.referenceCore}",${testData.coreNo},"${testData.loop}","${testData.coreCore}","${testData.coreEarth}","${testData.coreSheath}","${testData.sheathEarth}"`;
                if (idx === 0) {
                    csv += `,"${record.tester1.name}","${record.tester1.date}","${record.tester2.name}","${record.tester2.date}"`;
                }
                csv += '\n';
            });
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        
        alert(`CSV exported! (${records.length} test${records.length > 1 ? 's' : ''})`);
    }
};

// ==========================================
// 9. UI MANAGER
// ==========================================
const UIManager = {
    buildTabNavigation: () => {
        const nav = document.getElementById('tabNavigation');
        nav.innerHTML = `
            <button class="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white text-[#003057] font-bold text-xs sm:text-sm md:text-base rounded-t-lg shadow-lg hover:shadow-xl transition-all" onclick="app.ui.switchTab('new-test')">
                ➕ New Test
            </button>
            <button class="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gray-200 text-gray-600 font-bold text-xs sm:text-sm md:text-base rounded-t-lg shadow-lg hover:shadow-xl transition-all" onclick="app.ui.switchTab('records')">
                📂 Records
            </button>
        `;
    },
    
    switchTab: (tabName) => {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
        document.getElementById(tabName).classList.remove('hidden');
        
        document.querySelectorAll('[onclick*="switchTab"]').forEach(btn => {
            btn.classList.remove('bg-white', 'text-[#003057]');
            btn.classList.add('bg-gray-200', 'text-gray-600');
        });
        event.target.classList.remove('bg-gray-200', 'text-gray-600');
        event.target.classList.add('bg-white', 'text-[#003057]');
        
        if (tabName === 'records') {
            RecordsController.load();
        }
    },
    
    openModal: (modalId) => {
        document.getElementById(modalId).classList.remove('hidden');
    },
    
    closeModal: (modalId) => {
        document.getElementById(modalId).classList.add('hidden');
    }
};

window.onclick = (event) => {
    const modal = document.getElementById('viewModal');
    if (event.target === modal) {
        UIManager.closeModal('viewModal');
    }
};

// ==========================================
// 10. APPLICATION INITIALIZATION
// ==========================================
const app = {
    form: FormController,
    records: RecordsController,
    export: ExportController,
    ui: UIManager,
    signature: {
        clear: (padName) => SignatureManager.clear(padName),
        undo: (padName) => SignatureManager.undo(padName)
    }
};

document.addEventListener('DOMContentLoaded', () => {
    UIManager.buildTabNavigation();
    FormBuilder.buildNewTestForm();
    SignatureManager.init();
    FormController.reset();
    RecordsController.load();
});
