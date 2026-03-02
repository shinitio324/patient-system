// ===============================
// Firebase設定
// ===============================
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAbHE9-LXEk01dN7kVZ0hzPUYmtit3i3c4",
  authDomain: "patient-system-bb97f.firebaseapp.com",
  databaseURL: "https://patient-system-bb97f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "patient-system-bb97f",
  storageBucket: "patient-system-bb97f.firebasestorage.app",
  messagingSenderId: "347247174812",
  appId: "1:347247174812:web:ba7640fcf852387a88b959",
  measurementId: "G-LLHBWG915Z"
};

// Firebaseを初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ===============================
// 和暦 ⇔ 西暦 変換
// ===============================

// 元号の開始年（西暦）
const WAREKI_ERAS = {
    'R': 2018,  // 令和: 2019年5月1日開始 → 令和1年=2019年
    'H': 1988,  // 平成: 1989年1月8日開始 → 平成1年=1989年
    'S': 1925,  // 昭和: 1926年12月25日開始 → 昭和1年=1926年
    'T': 1911,  // 大正: 1912年7月30日開始 → 大正1年=1912年
    'M': 1867   // 明治: 1868年1月25日開始 → 明治1年=1868年
};

// 和暦 → 西暦変換してhiddenフィールドにセット
function warekiToDate(fieldId) {
    const era = document.getElementById(fieldId + '_era').value;
    const year = parseInt(document.getElementById(fieldId + '_year').value);
    const month = parseInt(document.getElementById(fieldId + '_month').value);
    const day = parseInt(document.getElementById(fieldId + '_day').value);
    const hidden = document.getElementById(fieldId);

    if (!era || !year || !month || !day) {
        hidden.value = '';
        return;
    }

    const seireki = WAREKI_ERAS[era] + year;
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    hidden.value = `${seireki}-${mm}-${dd}`;
}

// 西暦 → 和暦変換してフォームにセット
function dateToWareki(fieldId, dateStr) {
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return;
    const seireki = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();

    let era = '', warekiYear = 0;
    if (seireki >= 2019) { era = 'R'; warekiYear = seireki - 2018; }
    else if (seireki >= 1989) { era = 'H'; warekiYear = seireki - 1988; }
    else if (seireki >= 1926) { era = 'S'; warekiYear = seireki - 1925; }
    else if (seireki >= 1912) { era = 'T'; warekiYear = seireki - 1911; }
    else if (seireki >= 1868) { era = 'M'; warekiYear = seireki - 1867; }
    else return;

    const eraEl = document.getElementById(fieldId + '_era');
    const yearEl = document.getElementById(fieldId + '_year');
    const monthEl = document.getElementById(fieldId + '_month');
    const dayEl = document.getElementById(fieldId + '_day');
    const hidden = document.getElementById(fieldId);

    if (eraEl) eraEl.value = era;
    if (yearEl) yearEl.value = warekiYear;
    if (monthEl) monthEl.value = month;
    if (dayEl) dayEl.value = day;
    if (hidden) hidden.value = dateStr;
}



// ===============================
// ログイン認証
// ===============================

const SYSTEM_PASSWORD = 'Asahi101';

function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        showMainContent();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainContent').classList.add('hidden');
}

function showMainContent() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');
}

function handleLogin(event) {
    event.preventDefault();
    
    const passwordInput = document.getElementById('passwordInput');
    const loginError = document.getElementById('loginError');
    const enteredPassword = passwordInput.value;
    
    if (enteredPassword === SYSTEM_PASSWORD) {
        sessionStorage.setItem('isLoggedIn', 'true');
        loginError.classList.add('hidden');
        showMainContent();
        passwordInput.value = '';
        
        // Firebaseからデータをリアルタイムで読み込む
        setupFirebaseListeners();
        
        showNotification('ログインしました', 'success');
    } else {
        loginError.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
        setTimeout(() => {
            loginError.classList.add('hidden');
        }, 3000);
    }
}

function handleLogout() {
    if (confirm('ログアウトしますか？')) {
        // リアルタイムリスナーを解除
        db.ref('patients').off();
        db.ref('history').off();
        db.ref('transfers').off();
        db.ref('dailyRecords').off();
        
        sessionStorage.removeItem('isLoggedIn');
        showLoginScreen();
        showNotification('ログアウトしました', 'success');
    }
}

// ===============================
// データ管理（Firebase対応）
// ===============================

let allPatients = [];
let allHistory = [];
let allTransfers = [];
let allDailyRecords = [];
let importData = [];
let teamChart = null;
let diseaseChart = null;
let periodChart = null;
let admissionTypeChart = null;
let admissionFormChart = null;
let currentMode = 'auto';

// ===============================
// Firebaseリアルタイムリスナー設定
// ===============================
function setupFirebaseListeners() {
    // 患者データのリアルタイム同期
    db.ref('patients').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            allPatients = Object.values(data);
        } else {
            allPatients = [];
            // 初期サンプルデータを投入（初回のみ）
            const samplePatients = [
                {
                    id: '1',
                    patientId: 'P0001',
                    name: '山田 太郎',
                    dateOfBirth: '1950-01-15',
                    disease: '統合失調症',
                    primaryPhysician: '田中 医師',
                    admissionDate: '2025-10-01',
                    dischargeDate: null,
                    team: '1A',
                    assignedNurse: '鈴木 NS',
                    admissionType: '新規入院',
                    admissionForm: '医療保護入院',
                    status: '入院中'
                },
                {
                    id: '2',
                    patientId: 'P0002',
                    name: '佐藤 花子',
                    dateOfBirth: '1955-05-20',
                    disease: '双極性障害',
                    primaryPhysician: '山田 医師',
                    admissionDate: '2025-11-15',
                    dischargeDate: null,
                    team: '1B',
                    assignedNurse: '田中 NS',
                    admissionType: '新規入院',
                    admissionForm: '任意入院',
                    status: '入院中'
                },
                {
                    id: '3',
                    patientId: 'P0003',
                    name: '鈴木 次郎',
                    dateOfBirth: '1960-03-10',
                    disease: 'うつ病',
                    primaryPhysician: '佐藤 医師',
                    admissionDate: '2026-01-15',
                    dischargeDate: '2026-02-01',
                    team: '1A',
                    assignedNurse: '高橋 NS',
                    admissionType: '新規入院',
                    admissionForm: '任意入院',
                    status: '退院'
                }
            ];
            savePatientsToStorage(samplePatients);
        }
        updateDashboard();
        renderPatientsList();
        renderDischargeList();
        renderRecentDischargeList();
    });

    // 履歴データのリアルタイム同期
    db.ref('history').on('value', (snapshot) => {
        const data = snapshot.val();
        allHistory = data ? Object.values(data).sort((a, b) => new Date(b.changeTimestamp) - new Date(a.changeTimestamp)) : [];
        renderHistoryList();
    });

    // 転入・転出履歴のリアルタイム同期
    db.ref('transfers').on('value', (snapshot) => {
        const data = snapshot.val();
        allTransfers = data ? Object.values(data).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];
        renderTransferHistory();
    });

    // デイリー記録のリアルタイム同期
    db.ref('dailyRecords').on('value', (snapshot) => {
        const data = snapshot.val();
        allDailyRecords = data ? Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
        renderDailyRecordsList();
    });
}

// ===============================
// Firebase 保存関数
// ===============================

function savePatientsToStorage(patients) {
    const patientsToSave = patients || allPatients;
    const patientsObj = {};
    patientsToSave.forEach(p => { patientsObj[p.id] = p; });
    db.ref('patients').set(patientsObj);
}

function saveHistoryToStorage() {
    const historyObj = {};
    allHistory.forEach(h => { historyObj[h.id] = h; });
    db.ref('history').set(historyObj);
}

function saveTransfersToStorage() {
    const transfersObj = {};
    allTransfers.forEach(t => { transfersObj[t.id] = t; });
    db.ref('transfers').set(transfersObj);
}

function saveDailyRecordsToStorage() {
    const recordsObj = {};
    allDailyRecords.forEach(r => { recordsObj[r.date.replace(/-/g, '')] = r; });
    db.ref('dailyRecords').set(recordsObj);
}

// ===============================
// 履歴・転送 追加関数
// ===============================

function addTransferHistory(patientId, patientName, transferType, destination, transferDate, reason) {
    const transferEntry = {
        id: Date.now().toString(),
        patientId,
        patientName,
        transferType,
        destination,
        transferDate,
        reason: reason || '',
        timestamp: new Date().toISOString()
    };
    allTransfers.unshift(transferEntry);
    saveTransfersToStorage();
}

function addHistory(patientId, patientName, changeType, changedFields, oldValue, newValue) {
    const historyEntry = {
        id: Date.now().toString(),
        patientId,
        patientName,
        changeType,
        changedFields,
        oldValue: JSON.stringify(oldValue),
        newValue: JSON.stringify(newValue),
        changeTimestamp: new Date().toISOString()
    };
    allHistory.unshift(historyEntry);
    saveHistoryToStorage();
}

// ===============================
// UI関数
// ===============================

function showNotification(message, type = 'success') {
    const notificationArea = document.getElementById('notificationArea');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    const notification = document.createElement('div');
    notification.className = `notification ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${icon} text-2xl mr-3"></i>
            <span class="font-semibold">${message}</span>
        </div>
    `;
    
    notificationArea.appendChild(notification);
    setTimeout(() => { notification.remove(); }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP');
}

function calculateAdmissionPeriod(admissionDate, dischargeDate = null) {
    const admission = new Date(admissionDate);
    const end = dischargeDate ? new Date(dischargeDate) : new Date();
    const diffTime = Math.abs(end - admission);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function calculateDaysSinceDischarge(dischargeDate) {
    const discharge = new Date(dischargeDate);
    const today = new Date();
    const diffTime = Math.abs(today - discharge);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// ===============================
// 新規入院率計算
// ===============================

function updateNewAdmissionRate() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAdmissions = allPatients.filter(p => {
        const admissionDate = new Date(p.admissionDate);
        return admissionDate >= thirtyDaysAgo;
    });
    
    const newAdmissions = recentAdmissions.filter(p => 
        p.admissionType === '新規入院' || p.admissionType === '急性増悪'
    );
    
    const total = recentAdmissions.length;
    const newCount = newAdmissions.length;
    const percentage = total > 0 ? Math.round((newCount / total) * 100) : 0;
    
    const alertBox = document.getElementById('newAdmissionAlertBox');
    const icon = document.getElementById('newAdmissionIcon');
    const title = document.getElementById('newAdmissionTitle');
    const rate = document.getElementById('newAdmissionRate');
    const detail = document.getElementById('newAdmissionDetail');
    
    if (percentage < 70) {
        alertBox.className = 'border-l-4 p-4 rounded-lg shadow warning-red border-red-500';
        icon.className = 'fas fa-exclamation-triangle text-2xl text-red-600';
        title.className = 'text-lg font-semibold warning-text-red';
        rate.className = 'text-sm font-semibold warning-text-red';
        rate.innerHTML = `⚠️ 新規入院率: ${percentage}% （70%未満）`;
        detail.className = 'text-xs mt-1 warning-text-red';
    } else {
        alertBox.className = 'border-l-4 p-4 rounded-lg shadow bg-green-50 border-green-500';
        icon.className = 'fas fa-check-circle text-2xl text-green-600';
        title.className = 'text-lg font-semibold text-green-800';
        rate.className = 'text-sm font-semibold text-green-800';
        rate.innerHTML = `✓ 新規入院率: ${percentage}%`;
        detail.className = 'text-xs mt-1 text-green-700';
    }
    
    detail.textContent = `過去30日: 全入院${total}件中、新規入院${newCount}件`;
}

// ===============================
// ダッシュボード
// ===============================

function updateDashboard() {
    const totalPatients = allPatients.length;
    const admittedPatients = allPatients.filter(p => p.status === '入院中').length;
    const dischargedPatients = allPatients.filter(p => p.status === '退院').length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAdmissions = allPatients.filter(p => {
        const admissionDate = new Date(p.admissionDate);
        return admissionDate >= thirtyDaysAgo;
    });
    
    const newAdmissionCount = recentAdmissions.filter(p => p.admissionType === '新規入院').length;
    const acuteCount = recentAdmissions.filter(p => p.admissionType === '急性増悪').length;
    const readmissionCount = recentAdmissions.filter(p => p.admissionType === '再入院').length;
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const twoMonthsPatients = allPatients.filter(p => {
        if (p.status !== '入院中') return false;
        const admissionDate = new Date(p.admissionDate);
        return admissionDate <= twoMonthsAgo;
    });
    
    const voluntaryCount = allPatients.filter(p => p.status === '入院中' && p.admissionForm === '任意入院').length;
    const medicalProtectionCount = allPatients.filter(p => p.status === '入院中' && p.admissionForm === '医療保護入院').length;
    const compulsoryCount = allPatients.filter(p => p.status === '入院中' && p.admissionForm === '措置入院').length;
    
    const team1A = allPatients.filter(p => p.status === '入院中' && p.team === '1A');
    const team1B = allPatients.filter(p => p.status === '入院中' && p.team === '1B');
    
    document.getElementById('totalPatients').textContent = totalPatients;
    document.getElementById('admittedPatients').textContent = admittedPatients;
    document.getElementById('twoMonthsPatients').textContent = twoMonthsPatients.length;
    document.getElementById('dischargedPatients').textContent = dischargedPatients;
    document.getElementById('newAdmissionCount').textContent = newAdmissionCount;
    document.getElementById('acuteCount').textContent = acuteCount;
    document.getElementById('readmissionCount').textContent = readmissionCount;
    document.getElementById('voluntaryCount').textContent = voluntaryCount;
    document.getElementById('medicalProtectionCount').textContent = medicalProtectionCount;
    document.getElementById('compulsoryCount').textContent = compulsoryCount;
    document.getElementById('team1ACount').textContent = team1A.length;
    document.getElementById('team1BCount').textContent = team1B.length;
    
    updateNewAdmissionRate();
    renderTeamList('team1AList', team1A);
    renderTeamList('team1BList', team1B);
    renderTwoMonthsAlert(twoMonthsPatients);
    renderTwoMonthsPatientsList(twoMonthsPatients);
}

function renderTeamList(containerId, patients) {
    const container = document.getElementById(containerId);
    if (patients.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">患者なし</p>';
        return;
    }
    let html = '<ul class="space-y-2">';
    patients.forEach(patient => {
        html += `<li class="text-sm"><span class="font-semibold">${patient.patientId}</span> - ${patient.name}${patient.assignedNurse ? `<span class="text-gray-500 ml-2">(${patient.assignedNurse})</span>` : ''}</li>`;
    });
    html += '</ul>';
    container.innerHTML = html;
}

function renderTwoMonthsAlert(patients) {
    const alertDiv = document.getElementById('twoMonthsAlert');
    const alertList = document.getElementById('twoMonthsAlertList');
    
    if (patients.length === 0) {
        alertDiv.classList.add('hidden');
        return;
    }
    alertDiv.classList.remove('hidden');
    let html = `<p class="font-semibold mb-2">${patients.length}名の患者が入院から2か月を経過しています：</p><ul class="list-disc list-inside space-y-1">`;
    patients.forEach(patient => {
        const admissionPeriod = calculateAdmissionPeriod(patient.admissionDate);
        html += `<li>${patient.patientId} - ${patient.name} (${admissionPeriod}日経過)</li>`;
    });
    html += '</ul>';
    alertList.innerHTML = html;
}

function renderTwoMonthsPatientsList(patients) {
    const container = document.getElementById('twoMonthsPatientsList');
    if (patients.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">該当する患者はいません</p>';
        return;
    }
    let html = `<table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者番号</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者名</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">チーム</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">病名</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院形態</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院日</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院期間</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">主治医</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">受け持ちNS</th>
    </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    patients.forEach(patient => {
        const admissionPeriod = calculateAdmissionPeriod(patient.admissionDate);
        const formColor = {'任意入院':'bg-green-100 text-green-800','医療保護入院':'bg-blue-100 text-blue-800','措置入院':'bg-red-100 text-red-800'}[patient.admissionForm] || 'bg-gray-100 text-gray-800';
        html += `<tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${patient.patientId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.team === '1A' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">${patient.team}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.disease}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${formColor}">${patient.admissionForm}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(patient.admissionDate)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${admissionPeriod}日</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.primaryPhysician}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.assignedNurse || '-'}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===============================
// 退院後3か月以内患者リスト
// ===============================

function renderRecentDischargeList() {
    const container = document.getElementById('recentDischargeList');
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentDischarges = allPatients.filter(p => {
        if (p.status !== '退院' || !p.dischargeDate) return false;
        const dischargeDate = new Date(p.dischargeDate);
        return dischargeDate >= threeMonthsAgo;
    });
    
    if (recentDischarges.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">該当する患者はいません</p>';
        return;
    }
    
    let html = `<div class="mb-4"><p class="text-sm font-semibold text-gray-700">退院後3か月以内の患者: ${recentDischarges.length}名</p></div>
        <table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者番号</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者名</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">病名</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院種別</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院日</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">退院日</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">退院後経過日数</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">主治医</th>
    </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    
    recentDischarges.forEach(patient => {
        const daysSinceDischarge = calculateDaysSinceDischarge(patient.dischargeDate);
        const typeColor = {'新規入院':'bg-blue-100 text-blue-800','急性増悪':'bg-orange-100 text-orange-800','再入院':'bg-purple-100 text-purple-800'}[patient.admissionType] || 'bg-gray-100 text-gray-800';
        html += `<tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${patient.patientId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.disease}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeColor}">${patient.admissionType}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(patient.admissionDate)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(patient.dischargeDate)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${daysSinceDischarge < 30 ? 'text-red-600 font-semibold' : ''}">${daysSinceDischarge}日</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.primaryPhysician}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===============================
// 患者一覧
// ===============================

function renderPatientsList() {
    const searchTerm = document.getElementById('searchInput') ? document.getElementById('searchInput').value : '';
    const teamFilter = document.getElementById('teamFilter') ? document.getElementById('teamFilter').value : '';
    const statusFilter = document.getElementById('statusFilter') ? document.getElementById('statusFilter').value : '';
    const admissionFormFilter = document.getElementById('admissionFormFilter') ? document.getElementById('admissionFormFilter').value : '';
    const container = document.getElementById('patientsList');
    
    let filteredPatients = allPatients;
    if (searchTerm) filteredPatients = filteredPatients.filter(p => p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) || p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (teamFilter) filteredPatients = filteredPatients.filter(p => p.team === teamFilter);
    if (statusFilter) filteredPatients = filteredPatients.filter(p => p.status === statusFilter);
    if (admissionFormFilter) filteredPatients = filteredPatients.filter(p => p.admissionForm === admissionFormFilter);
    
    if (filteredPatients.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">該当する患者はいません</p>';
        return;
    }
    
    let html = `<table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者番号</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者名</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">チーム</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">病名</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院種別</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院形態</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">主治医</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">受け持ちNS</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院日</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
    </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    
    filteredPatients.forEach(patient => {
        const statusClass = patient.status === '入院中' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
        const typeColor = {'新規入院':'bg-blue-100 text-blue-800','急性増悪':'bg-orange-100 text-orange-800','再入院':'bg-purple-100 text-purple-800'}[patient.admissionType] || 'bg-gray-100 text-gray-800';
        const formColor = {'任意入院':'bg-green-100 text-green-800','医療保護入院':'bg-blue-100 text-blue-800','措置入院':'bg-red-100 text-red-800'}[patient.admissionForm] || 'bg-gray-100 text-gray-800';
        html += `<tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${patient.patientId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.team === '1A' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">${patient.team}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.disease}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeColor}">${patient.admissionType}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${formColor}">${patient.admissionForm}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.primaryPhysician}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.assignedNurse || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(patient.admissionDate)}</td>
            <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${patient.status}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                <button onclick="editPatient('${patient.id}')" class="text-blue-600 hover:text-blue-900"><i class="fas fa-edit"></i> 編集</button>
                <button onclick="deletePatient('${patient.id}')" class="text-red-600 hover:text-red-900"><i class="fas fa-trash"></i> 削除</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===============================
// 患者編集・削除
// ===============================

function editPatient(id) {
    const patient = allPatients.find(p => p.id === id);
    if (!patient) return;
    document.getElementById('editId').value = patient.id;
    document.getElementById('editPatientId').value = patient.patientId;
    document.getElementById('editName').value = patient.name;
    dateToWareki('editDateOfBirth', patient.dateOfBirth);
    document.getElementById('editDisease').value = patient.disease;
    document.getElementById('editPrimaryPhysician').value = patient.primaryPhysician;
    dateToWareki('editAdmissionDate', patient.admissionDate);
    document.getElementById('editAdmissionType').value = patient.admissionType;
    document.getElementById('editAdmissionForm').value = patient.admissionForm;
    document.getElementById('editTeam').value = patient.team;
    document.getElementById('editAssignedNurse').value = patient.assignedNurse || '';
    document.getElementById('editStatus').value = patient.status;
    document.getElementById('editDischargeDate').value = patient.dischargeDate || '';
    document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

function deletePatient(id) {
    const patient = allPatients.find(p => p.id === id);
    if (!patient) return;
    if (!confirm(`患者「${patient.name}」の情報を削除しますか？`)) return;
    addHistory(patient.patientId, patient.name, '削除', '患者情報', patient, null);
    allPatients = allPatients.filter(p => p.id !== id);
    savePatientsToStorage();
    showNotification('患者情報を削除しました', 'success');
}

// ===============================
// 退院管理
// ===============================

function renderDischargeList() {
    const container = document.getElementById('dischargeList');
    const admittedPatients = allPatients.filter(p => p.status === '入院中');
    if (admittedPatients.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">入院中の患者はいません</p>';
        return;
    }
    let html = `<table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者番号</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者名</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">チーム</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">病名</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院形態</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院日</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院期間</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
    </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    admittedPatients.forEach(patient => {
        const admissionPeriod = calculateAdmissionPeriod(patient.admissionDate);
        const formColor = {'任意入院':'bg-green-100 text-green-800','医療保護入院':'bg-blue-100 text-blue-800','措置入院':'bg-red-100 text-red-800'}[patient.admissionForm] || 'bg-gray-100 text-gray-800';
        html += `<tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${patient.patientId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.team === '1A' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">${patient.team}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.disease}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${formColor}">${patient.admissionForm}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(patient.admissionDate)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${admissionPeriod}日</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button onclick="dischargePatient('${patient.id}')" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"><i class="fas fa-sign-out-alt mr-1"></i>退院処理</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function dischargePatient(id) {
    const patient = allPatients.find(p => p.id === id);
    if (!patient) return;
    if (!confirm(`患者「${patient.name}」を退院処理しますか？`)) return;
    const oldStatus = patient.status;
    const today = new Date().toISOString().split('T')[0];
    patient.status = '退院';
    patient.dischargeDate = today;
    addHistory(patient.patientId, patient.name, '退院処理', 'ステータス', oldStatus, '退院');
    incrementDailyCount(patient.team === '1A' ? 'team1A' : 'team1B', 'discharge');
    savePatientsToStorage();
    showNotification('退院処理が完了しました', 'success');
}

// ===============================
// 履歴管理
// ===============================

function renderHistoryList() {
    const searchTerm = document.getElementById('historySearch') ? document.getElementById('historySearch').value : '';
    const container = document.getElementById('historyList');
    let filteredHistory = allHistory;
    if (searchTerm) filteredHistory = filteredHistory.filter(h => h.patientId.toLowerCase().includes(searchTerm.toLowerCase()) || h.patientName.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filteredHistory.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">履歴データはありません</p>';
        return;
    }
    let html = '';
    filteredHistory.forEach(record => {
        const changeTypeClass = {'新規登録':'bg-green-100 text-green-800','情報更新':'bg-blue-100 text-blue-800','退院処理':'bg-purple-100 text-purple-800','削除':'bg-red-100 text-red-800'}[record.changeType] || 'bg-gray-100 text-gray-800';
        html += `<div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-start justify-between mb-2">
                <div><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${changeTypeClass}">${record.changeType}</span>
                <span class="ml-2 font-semibold">${record.patientId} - ${record.patientName}</span></div>
                <span class="text-sm text-gray-500">${formatDateTime(record.changeTimestamp)}</span>
            </div>
            ${record.changedFields ? `<div class="text-sm text-gray-700 mt-2"><span class="font-semibold">変更内容:</span> ${record.changedFields}</div>` : ''}
        </div>`;
    });
    container.innerHTML = html;
}

// ===============================
// 転入・転出管理
// ===============================

function showTransferOutModal() {
    const select = document.getElementById('transferOutPatientId');
    select.innerHTML = '<option value="">患者を選択してください</option>';
    const admittedPatients = allPatients.filter(p => p.status === '入院中');
    admittedPatients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.patientId} - ${patient.name} (${patient.team}チーム)`;
        select.appendChild(option);
    });
    document.getElementById('transferOutModal').classList.remove('hidden');
}

function showTransferInModal() {
    document.getElementById('transferInModal').classList.remove('hidden');
}

function closeTransferOutModal() {
    document.getElementById('transferOutModal').classList.add('hidden');
}

function closeTransferInModal() {
    document.getElementById('transferInModal').classList.add('hidden');
}

function renderTransferHistory() {
    const container = document.getElementById('transferHistoryList');
    if (!container) return;
    if (allTransfers.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">転入・転出履歴はありません</p>';
        return;
    }
    let html = `<table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日時</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">種別</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者番号</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者名</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">転出先/転入元</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">理由</th>
    </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    allTransfers.forEach(t => {
        const typeClass = t.transferType === '転出' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800';
        html += `<tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(t.transferDate)}</td>
            <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeClass}">${t.transferType}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${t.patientId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${t.patientName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${t.destination}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${t.reason || '-'}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===============================
// CSV一括インポート
// ===============================

function downloadTemplate() {
    const template = 'patientId,name,dateOfBirth,disease,primaryPhysician,admissionDate,team,assignedNurse,admissionType,admissionForm\nP0001,山田 太郎,1950-01-15,統合失調症,田中 医師,2026-02-01,1A,鈴木 NS,新規入院,医療保護入院\nP0002,佐藤 花子,1955-05-20,双極性障害,山田 医師,2026-02-01,1B,田中 NS,急性増悪,任意入院\n';
    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '患者情報インポートテンプレート_精神科.csv';
    link.click();
    showNotification('テンプレートをダウンロードしました', 'success');
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) { parseCSV(e.target.result); };
    reader.readAsText(file);
}

function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    importData = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const patient = {};
        headers.forEach((header, index) => { patient[header.trim()] = values[index]?.trim() || ''; });
        importData.push(patient);
    }
    showImportPreview();
}

function showImportPreview() {
    const previewDiv = document.getElementById('importPreview');
    const contentDiv = document.getElementById('importPreviewContent');
    let html = `<p class="mb-4 text-sm text-gray-600">${importData.length}件のデータが見つかりました。</p>
        <table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr>
        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">患者番号</th>
        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">患者名</th>
        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">病名</th>
        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">入院日</th>
        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">チーム</th>
    </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    importData.forEach(p => {
        html += `<tr><td class="px-4 py-2 text-sm">${p.patientId}</td><td class="px-4 py-2 text-sm">${p.name}</td><td class="px-4 py-2 text-sm">${p.disease}</td><td class="px-4 py-2 text-sm">${p.admissionDate}</td><td class="px-4 py-2 text-sm">${p.team}</td></tr>`;
    });
    html += '</tbody></table>';
    contentDiv.innerHTML = html;
    previewDiv.classList.remove('hidden');
}

function executeImport() {
    let importedCount = 0;
    importData.forEach(data => {
        if (!data.patientId || !data.name) return;
        const exists = allPatients.find(p => p.patientId === data.patientId);
        if (exists) return;
        const newPatient = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            patientId: data.patientId,
            name: data.name,
            dateOfBirth: data.dateOfBirth || '',
            disease: data.disease || '',
            primaryPhysician: data.primaryPhysician || '',
            admissionDate: data.admissionDate || '',
            dischargeDate: null,
            team: data.team || '1A',
            assignedNurse: data.assignedNurse || '',
            admissionType: data.admissionType || '新規入院',
            admissionForm: data.admissionForm || '任意入院',
            status: '入院中'
        };
        allPatients.push(newPatient);
        importedCount++;
    });
    savePatientsToStorage();
    showNotification(`${importedCount}件のデータをインポートしました`, 'success');
    document.getElementById('importPreview').classList.add('hidden');
}

// ===============================
// CSVエクスポート
// ===============================

function exportCSV() {
    if (allPatients.length === 0) {
        showNotification('エクスポートするデータがありません', 'error');
        return;
    }
    let csv = '\uFEFF';
    csv += '患者番号,患者名,チーム,生年月日,病名,主治医,受け持ち看護師,入院日,退院日,入院種別,入院形態,ステータス,入院期間\n';
    allPatients.forEach(patient => {
        const admissionPeriod = calculateAdmissionPeriod(patient.admissionDate, patient.dischargeDate);
        csv += `${patient.patientId},"${patient.name}",${patient.team},${patient.dateOfBirth},"${patient.disease}","${patient.primaryPhysician}","${patient.assignedNurse || ''}",${patient.admissionDate},${patient.dischargeDate || ''},${patient.admissionType},${patient.admissionForm},${patient.status},${admissionPeriod}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `患者データ_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showNotification('CSVファイルをエクスポートしました', 'success');
}

// ===============================
// デイリー記録管理
// ===============================

function getDateString(date) {
    if (typeof date === 'string') return date.split('T')[0];
    const d = date || new Date();
    return d.toISOString().split('T')[0];
}

function setToday() {
    document.getElementById('dailyRecordDate').valueAsDate = new Date();
    loadDailyRecord();
}

function switchMode(mode) {
    currentMode = mode;
    const autoBtn = document.getElementById('autoModeBtn');
    const manualBtn = document.getElementById('manualModeBtn');
    const autoInfo = document.getElementById('autoModeInfo');
    const manualInfo = document.getElementById('manualModeInfo');
    if (mode === 'auto') {
        autoBtn.classList.remove('bg-gray-300', 'text-gray-700');
        autoBtn.classList.add('bg-blue-600', 'text-white');
        manualBtn.classList.remove('bg-blue-600', 'text-white');
        manualBtn.classList.add('bg-gray-300', 'text-gray-700');
        autoInfo.classList.remove('hidden');
        manualInfo.classList.add('hidden');
    } else {
        manualBtn.classList.remove('bg-gray-300', 'text-gray-700');
        manualBtn.classList.add('bg-blue-600', 'text-white');
        autoBtn.classList.remove('bg-blue-600', 'text-white');
        autoBtn.classList.add('bg-gray-300', 'text-gray-700');
        manualInfo.classList.remove('hidden');
        autoInfo.classList.add('hidden');
    }
}

function loadDailyRecord() {
    const dateStr = document.getElementById('dailyRecordDate').value;
    const record = allDailyRecords.find(r => r.date === dateStr);
    if (record) {
        document.getElementById('team1A_admission').value = record.team1A.admission;
        document.getElementById('team1A_discharge').value = record.team1A.discharge;
        document.getElementById('team1A_transferIn').value = record.team1A.transferIn;
        document.getElementById('team1A_transferOut').value = record.team1A.transferOut;
        document.getElementById('team1B_admission').value = record.team1B.admission;
        document.getElementById('team1B_discharge').value = record.team1B.discharge;
        document.getElementById('team1B_transferIn').value = record.team1B.transferIn;
        document.getElementById('team1B_transferOut').value = record.team1B.transferOut;
    } else {
        if (currentMode === 'auto') autoCalculateDaily(dateStr);
        else clearDailyRecord();
    }
    updateTotals();
    renderDailyRecordsList();
}

function autoCalculateDaily(dateStr) {
    const counts = {
        team1A: { admission: 0, discharge: 0, transferIn: 0, transferOut: 0 },
        team1B: { admission: 0, discharge: 0, transferIn: 0, transferOut: 0 }
    };
    allPatients.forEach(p => {
        if (getDateString(p.admissionDate) === dateStr) {
            if (p.team === '1A') counts.team1A.admission++;
            else if (p.team === '1B') counts.team1B.admission++;
        }
        if (p.dischargeDate && getDateString(p.dischargeDate) === dateStr) {
            if (p.team === '1A') counts.team1A.discharge++;
            else if (p.team === '1B') counts.team1B.discharge++;
        }
    });
    allTransfers.forEach(t => {
        if (getDateString(t.transferDate) === dateStr) {
            const patient = allPatients.find(p => p.patientId === t.patientId);
            const team = patient ? patient.team : '1A';
            if (t.transferType === '転入') { if (team === '1A') counts.team1A.transferIn++; else counts.team1B.transferIn++; }
            else if (t.transferType === '転出') { if (team === '1A') counts.team1A.transferOut++; else counts.team1B.transferOut++; }
        }
    });
    document.getElementById('team1A_admission').value = counts.team1A.admission;
    document.getElementById('team1A_discharge').value = counts.team1A.discharge;
    document.getElementById('team1A_transferIn').value = counts.team1A.transferIn;
    document.getElementById('team1A_transferOut').value = counts.team1A.transferOut;
    document.getElementById('team1B_admission').value = counts.team1B.admission;
    document.getElementById('team1B_discharge').value = counts.team1B.discharge;
    document.getElementById('team1B_transferIn').value = counts.team1B.transferIn;
    document.getElementById('team1B_transferOut').value = counts.team1B.transferOut;
}

function updateTotals() {
    const team1A_admission = parseInt(document.getElementById('team1A_admission').value) || 0;
    const team1A_discharge = parseInt(document.getElementById('team1A_discharge').value) || 0;
    const team1A_transferIn = parseInt(document.getElementById('team1A_transferIn').value) || 0;
    const team1A_transferOut = parseInt(document.getElementById('team1A_transferOut').value) || 0;
    const team1B_admission = parseInt(document.getElementById('team1B_admission').value) || 0;
    const team1B_discharge = parseInt(document.getElementById('team1B_discharge').value) || 0;
    const team1B_transferIn = parseInt(document.getElementById('team1B_transferIn').value) || 0;
    const team1B_transferOut = parseInt(document.getElementById('team1B_transferOut').value) || 0;
    const team1A_total = team1A_admission + team1A_transferIn - team1A_discharge - team1A_transferOut;
    const team1B_total = team1B_admission + team1B_transferIn - team1B_discharge - team1B_transferOut;
    document.getElementById('team1A_total').textContent = team1A_total >= 0 ? `+${team1A_total}` : team1A_total;
    document.getElementById('team1B_total').textContent = team1B_total >= 0 ? `+${team1B_total}` : team1B_total;
    const total_admission = team1A_admission + team1B_admission;
    const total_discharge = team1A_discharge + team1B_discharge;
    const total_transferIn = team1A_transferIn + team1B_transferIn;
    const total_transferOut = team1A_transferOut + team1B_transferOut;
    const total_net = total_admission + total_transferIn - total_discharge - total_transferOut;
    document.getElementById('total_admission').textContent = total_admission;
    document.getElementById('total_discharge').textContent = total_discharge;
    document.getElementById('total_transferIn').textContent = total_transferIn;
    document.getElementById('total_transferOut').textContent = total_transferOut;
    document.getElementById('total_net').textContent = total_net >= 0 ? `+${total_net}` : total_net;
}

function clearDailyRecord() {
    ['team1A_admission','team1A_discharge','team1A_transferIn','team1A_transferOut',
     'team1B_admission','team1B_discharge','team1B_transferIn','team1B_transferOut'].forEach(id => {
        document.getElementById(id).value = 0;
    });
    updateTotals();
}

function saveDailyRecord() {
    const dateStr = document.getElementById('dailyRecordDate').value;
    if (!dateStr) { showNotification('日付を選択してください', 'error'); return; }
    const record = {
        date: dateStr,
        team1A: {
            admission: parseInt(document.getElementById('team1A_admission').value) || 0,
            discharge: parseInt(document.getElementById('team1A_discharge').value) || 0,
            transferIn: parseInt(document.getElementById('team1A_transferIn').value) || 0,
            transferOut: parseInt(document.getElementById('team1A_transferOut').value) || 0
        },
        team1B: {
            admission: parseInt(document.getElementById('team1B_admission').value) || 0,
            discharge: parseInt(document.getElementById('team1B_discharge').value) || 0,
            transferIn: parseInt(document.getElementById('team1B_transferIn').value) || 0,
            transferOut: parseInt(document.getElementById('team1B_transferOut').value) || 0
        },
        timestamp: new Date().toISOString()
    };
    const existingIndex = allDailyRecords.findIndex(r => r.date === dateStr);
    if (existingIndex >= 0) allDailyRecords[existingIndex] = record;
    else allDailyRecords.push(record);
    allDailyRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    saveDailyRecordsToStorage();
    renderDailyRecordsList();
    showNotification(`${formatDate(dateStr)} の記録を保存しました`, 'success');
}

function renderDailyRecordsList() {
    const tbody = document.getElementById('dailyRecordsList');
    if (!tbody) return;
    if (allDailyRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="px-4 py-8 text-center text-gray-500">記録がありません</td></tr>';
        return;
    }
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRecords = allDailyRecords.filter(r => new Date(r.date) >= thirtyDaysAgo);
    if (recentRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="px-4 py-8 text-center text-gray-500">過去30日間の記録がありません</td></tr>';
        return;
    }
    let html = '';
    recentRecords.forEach(record => {
        const net = (record.team1A.admission + record.team1A.transferIn - record.team1A.discharge - record.team1A.transferOut) + (record.team1B.admission + record.team1B.transferIn - record.team1B.discharge - record.team1B.transferOut);
        const netClass = net > 0 ? 'text-green-600 font-bold' : net < 0 ? 'text-red-600 font-bold' : 'text-gray-600';
        const netText = net > 0 ? `+${net}` : net;
        html += `<tr class="hover:bg-gray-50">
            <td class="px-4 py-3 border-b text-sm font-semibold">${formatDate(record.date)}</td>
            <td class="px-2 py-3 border-b text-center text-sm">${record.team1A.admission}</td>
            <td class="px-2 py-3 border-b text-center text-sm">${record.team1A.discharge}</td>
            <td class="px-2 py-3 border-b text-center text-sm">${record.team1A.transferIn}</td>
            <td class="px-2 py-3 border-b text-center text-sm">${record.team1A.transferOut}</td>
            <td class="px-2 py-3 border-b text-center text-sm">${record.team1B.admission}</td>
            <td class="px-2 py-3 border-b text-center text-sm">${record.team1B.discharge}</td>
            <td class="px-2 py-3 border-b text-center text-sm">${record.team1B.transferIn}</td>
            <td class="px-2 py-3 border-b text-center text-sm">${record.team1B.transferOut}</td>
            <td class="px-2 py-3 border-b text-center text-sm ${netClass}">${netText}</td>
            <td class="px-2 py-3 border-b text-center text-sm">
                <button onclick="editDailyRecord('${record.date}')" class="text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i></button>
                <button onclick="deleteDailyRecord('${record.date}')" class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

function editDailyRecord(dateStr) {
    document.getElementById('dailyRecordDate').value = dateStr;
    loadDailyRecord();
    const dailyTab = document.querySelector('[data-tab="daily"]');
    if (dailyTab) dailyTab.click();
    setTimeout(() => { document.getElementById('dailyRecordDate').scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
}

function deleteDailyRecord(dateStr) {
    if (!confirm(`${formatDate(dateStr)} の記録を削除しますか？`)) return;
    allDailyRecords = allDailyRecords.filter(r => r.date !== dateStr);
    saveDailyRecordsToStorage();
    renderDailyRecordsList();
    showNotification(`${formatDate(dateStr)} の記録を削除しました`, 'success');
}

function exportDailyRecordsCSV() {
    if (allDailyRecords.length === 0) { showNotification('エクスポートするデータがありません', 'error'); return; }
    let csv = '\uFEFF';
    csv += '日付,チーム1A入院,チーム1A退院,チーム1A転入,チーム1A転出,チーム1A純増減,チーム1B入院,チーム1B退院,チーム1B転入,チーム1B転出,チーム1B純増減,全体入院合計,全体退院合計,全体転入合計,全体転出合計,全体純増減\n';
    allDailyRecords.forEach(record => {
        const team1A_net = record.team1A.admission + record.team1A.transferIn - record.team1A.discharge - record.team1A.transferOut;
        const team1B_net = record.team1B.admission + record.team1B.transferIn - record.team1B.discharge - record.team1B.transferOut;
        const total_admission = record.team1A.admission + record.team1B.admission;
        const total_discharge = record.team1A.discharge + record.team1B.discharge;
        const total_transferIn = record.team1A.transferIn + record.team1B.transferIn;
        const total_transferOut = record.team1A.transferOut + record.team1B.transferOut;
        const total_net = total_admission + total_transferIn - total_discharge - total_transferOut;
        csv += `${record.date},${record.team1A.admission},${record.team1A.discharge},${record.team1A.transferIn},${record.team1A.transferOut},${team1A_net},${record.team1B.admission},${record.team1B.discharge},${record.team1B.transferIn},${record.team1B.transferOut},${team1B_net},${total_admission},${total_discharge},${total_transferIn},${total_transferOut},${total_net}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `デイリー記録_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showNotification('CSVファイルをエクスポートしました', 'success');
}

function incrementDailyCount(team, type) {
    if (currentMode !== 'auto') return;
    const today = getDateString(new Date());
    const record = allDailyRecords.find(r => r.date === today);
    if (record) {
        record[team][type]++;
        saveDailyRecordsToStorage();
    } else {
        const newRecord = {
            date: today,
            team1A: { admission: 0, discharge: 0, transferIn: 0, transferOut: 0 },
            team1B: { admission: 0, discharge: 0, transferIn: 0, transferOut: 0 },
            timestamp: new Date().toISOString()
        };
        newRecord[team][type]++;
        allDailyRecords.push(newRecord);
        allDailyRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
        saveDailyRecordsToStorage();
    }
}

// ===============================
// フォームリセット
// ===============================

function resetForm() {
    document.getElementById('patientForm').reset();
    // 和暦フィールドもリセット
    ['dateOfBirth', 'admissionDate'].forEach(id => {
        const era = document.getElementById(id + '_era');
        const year = document.getElementById(id + '_year');
        const month = document.getElementById(id + '_month');
        const day = document.getElementById(id + '_day');
        const hidden = document.getElementById(id);
        if (era) era.value = '';
        if (year) year.value = '';
        if (month) month.value = '';
        if (day) day.value = '';
        if (hidden) hidden.value = '';
    });
}

// ===============================
// タブ切り替え
// ===============================

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
                b.classList.add('text-gray-600');
            });
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
            btn.classList.remove('text-gray-600');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            if (tabId === 'charts') updateCharts();
        });
    });
}

// ===============================
// 統計グラフ
// ===============================

function updateCharts() {
    const admittedPatients = allPatients.filter(p => p.status === '入院中');
    
    // 入院種別
    const admissionTypes = ['新規入院', '急性増悪', '再入院'];
    const admissionTypeCounts = admissionTypes.map(type => allPatients.filter(p => p.admissionType === type).length);
    if (admissionTypeChart) admissionTypeChart.destroy();
    admissionTypeChart = new Chart(document.getElementById('admissionTypeChart'), {
        type: 'bar',
        data: { labels: admissionTypes, datasets: [{ label: '入院種別', data: admissionTypeCounts, backgroundColor: ['#3b82f6','#f97316','#8b5cf6'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    // 入院形態別
    const admissionForms = ['任意入院', '医療保護入院', '措置入院'];
    const admissionFormCounts = admissionForms.map(form => admittedPatients.filter(p => p.admissionForm === form).length);
    if (admissionFormChart) admissionFormChart.destroy();
    admissionFormChart = new Chart(document.getElementById('admissionFormChart'), {
        type: 'pie',
        data: { labels: admissionForms, datasets: [{ data: admissionFormCounts, backgroundColor: ['#22c55e','#3b82f6','#ef4444'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    // チーム別
    if (teamChart) teamChart.destroy();
    teamChart = new Chart(document.getElementById('teamChart'), {
        type: 'bar',
        data: { labels: ['チーム1A', 'チーム1B'], datasets: [{ label: '入院患者数', data: [admittedPatients.filter(p=>p.team==='1A').length, admittedPatients.filter(p=>p.team==='1B').length], backgroundColor: ['#3b82f6','#8b5cf6'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    // 病名別
    const diseaseCounts = {};
    admittedPatients.forEach(p => { diseaseCounts[p.disease] = (diseaseCounts[p.disease] || 0) + 1; });
    if (diseaseChart) diseaseChart.destroy();
    diseaseChart = new Chart(document.getElementById('diseaseChart'), {
        type: 'doughnut',
        data: { labels: Object.keys(diseaseCounts), datasets: [{ data: Object.values(diseaseCounts), backgroundColor: ['#3b82f6','#22c55e','#f97316','#ef4444','#8b5cf6','#06b6d4','#f59e0b'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    // 入院期間分布
    const periods = {'〜1ヶ月':0, '1〜2ヶ月':0, '2〜3ヶ月':0, '3ヶ月以上':0};
    admittedPatients.forEach(p => {
        const days = calculateAdmissionPeriod(p.admissionDate);
        if (days <= 30) periods['〜1ヶ月']++;
        else if (days <= 60) periods['1〜2ヶ月']++;
        else if (days <= 90) periods['2〜3ヶ月']++;
        else periods['3ヶ月以上']++;
    });
    if (periodChart) periodChart.destroy();
    periodChart = new Chart(document.getElementById('periodChart'), {
        type: 'bar',
        data: { labels: Object.keys(periods), datasets: [{ label: '患者数', data: Object.values(periods), backgroundColor: ['#22c55e','#f97316','#ef4444','#8b5cf6'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// ===============================
// 初期化
// ===============================

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    setupTabs();
    
    // 今日の日付をデイリー記録にセット
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('dailyRecordDate')) {
        document.getElementById('dailyRecordDate').value = today;
    }
    
    // ログインフォーム
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // 患者登録フォーム
    document.getElementById('patientForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newPatient = {
            id: Date.now().toString(),
            patientId: document.getElementById('patientId').value,
            name: document.getElementById('name').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            disease: document.getElementById('disease').value,
            primaryPhysician: document.getElementById('primaryPhysician').value,
            admissionDate: document.getElementById('admissionDate').value,
            dischargeDate: null,
            team: document.getElementById('team').value,
            assignedNurse: document.getElementById('assignedNurse').value || '',
            admissionType: document.getElementById('admissionType').value,
            admissionForm: document.getElementById('admissionForm').value,
            status: '入院中'
        };
        allPatients.push(newPatient);
        addHistory(newPatient.patientId, newPatient.name, '新規登録', '患者情報', null, newPatient);
        savePatientsToStorage();
        incrementDailyCount(newPatient.team === '1A' ? 'team1A' : 'team1B', 'admission');
        resetForm();
        showNotification('患者情報を登録しました', 'success');
    });
    
    // 編集フォーム
    document.getElementById('editForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const patient = allPatients.find(p => p.id === id);
        if (!patient) return;
        const oldPatient = {...patient};
        patient.patientId = document.getElementById('editPatientId').value;
        patient.name = document.getElementById('editName').value;
        patient.dateOfBirth = document.getElementById('editDateOfBirth').value;
        patient.disease = document.getElementById('editDisease').value;
        patient.primaryPhysician = document.getElementById('editPrimaryPhysician').value;
        patient.admissionDate = document.getElementById('editAdmissionDate').value;
        patient.team = document.getElementById('editTeam').value;
        patient.assignedNurse = document.getElementById('editAssignedNurse').value || '';
        patient.admissionType = document.getElementById('editAdmissionType').value;
        patient.admissionForm = document.getElementById('editAdmissionForm').value;
        patient.status = document.getElementById('editStatus').value;
        patient.dischargeDate = document.getElementById('editDischargeDate').value || null;
        addHistory(patient.patientId, patient.name, '情報更新', '患者情報', oldPatient, patient);
        savePatientsToStorage();
        closeEditModal();
        showNotification('患者情報を更新しました', 'success');
    });
    
    // 検索・フィルター
    ['searchInput', 'teamFilter', 'statusFilter', 'admissionFormFilter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', renderPatientsList);
    });
    document.getElementById('historySearch').addEventListener('input', renderHistoryList);
    
    // 転入・転出フォーム
    const transferOutForm = document.getElementById('transferOutForm');
    if (transferOutForm) {
        transferOutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const patientSelect = document.getElementById('transferOutPatientId');
            const patient = allPatients.find(p => p.id === patientSelect.value);
            if (!patient) return;
            const destination = document.getElementById('transferOutDestination').value;
            const transferDate = document.getElementById('transferOutDate').value;
            const reason = document.getElementById('transferOutReason').value;
            patient.status = '退院';
            patient.dischargeDate = transferDate;
            addHistory(patient.patientId, patient.name, '転出処理', '転出先', null, destination);
            addTransferHistory(patient.patientId, patient.name, '転出', destination, transferDate, reason);
            incrementDailyCount(patient.team === '1A' ? 'team1A' : 'team1B', 'transferOut');
            savePatientsToStorage();
            closeTransferOutModal();
            showNotification(`${patient.name}の転出処理が完了しました`, 'success');
        });
    }
    
    const transferInForm = document.getElementById('transferInForm');
    if (transferInForm) {
        transferInForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const patientId = document.getElementById('transferInPatientId').value;
            const patientName = document.getElementById('transferInPatientName').value;
            const origin = document.getElementById('transferInOrigin').value;
            const transferDate = document.getElementById('transferInDate').value;
            const team = document.getElementById('transferInTeam').value;
            const reason = document.getElementById('transferInReason').value;
            const newPatient = {
                id: Date.now().toString(),
                patientId: patientId,
                name: patientName,
                dateOfBirth: '',
                disease: '',
                primaryPhysician: '',
                admissionDate: transferDate,
                dischargeDate: null,
                team: team,
                assignedNurse: '',
                admissionType: '新規入院',
                admissionForm: '任意入院',
                status: '入院中'
            };
            allPatients.push(newPatient);
            addTransferHistory(patientId, patientName, '転入', origin, transferDate, reason);
            incrementDailyCount(team === '1A' ? 'team1A' : 'team1B', 'transferIn');
            savePatientsToStorage();
            closeTransferInModal();
            showNotification(`${patientName}の転入処理が完了しました`, 'success');
        });
    }
    
    // ドラッグ&ドロップ
    const dropZone = document.querySelector('.border-dashed');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('border-blue-500'); });
        dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('border-blue-500'); });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-500');
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.csv')) {
                const reader = new FileReader();
                reader.onload = (event) => parseCSV(event.target.result);
                reader.readAsText(file);
            }
        });
    }
});
