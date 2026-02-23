// ===============================
// ログイン認証
// ===============================

// パスワード設定（変更してください）
const SYSTEM_PASSWORD = 'Asahi101';

// ログイン状態をチェック
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        showMainContent();
    } else {
        showLoginScreen();
    }
}

// ログイン画面を表示
function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainContent').classList.add('hidden');
}

// メインコンテンツを表示
function showMainContent() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');
}

// ログイン処理
function handleLogin(event) {
    event.preventDefault();
    
    const passwordInput = document.getElementById('passwordInput');
    const loginError = document.getElementById('loginError');
    const enteredPassword = passwordInput.value;
    
    if (enteredPassword === SYSTEM_PASSWORD) {
        // ログイン成功
        sessionStorage.setItem('isLoggedIn', 'true');
        loginError.classList.add('hidden');
        showMainContent();
        
        // パスワード入力欄をクリア
        passwordInput.value = '';
        
        // データを読み込んで表示を更新
        loadPatientsFromStorage();
        loadHistoryFromStorage();
        loadTransfersFromStorage();
        loadDailyRecords();
        updateDashboard();
        renderPatientsList();
        renderDischargeList();
        renderRecentDischargeList();
        renderHistoryList();
        renderTransferHistory();
        renderDailyRecordsList();
        
        showNotification('ログインしました', 'success');
    } else {
        // ログイン失敗
        loginError.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
        
        // エラーメッセージを3秒後に非表示
        setTimeout(() => {
            loginError.classList.add('hidden');
        }, 3000);
    }
}

// ログアウト処理
function handleLogout() {
    if (confirm('ログアウトしますか？')) {
        sessionStorage.removeItem('isLoggedIn');
        showLoginScreen();
        showNotification('ログアウトしました', 'success');
    }
}

// ===============================
// データ管理
// ===============================

// ローカルストレージキー
const STORAGE_KEY = 'psychiatricPatientsData';
const HISTORY_KEY = 'psychiatricPatientsHistory';
const TRANSFER_KEY = 'psychiatricTransferHistory';

// グローバル変数
let allPatients = [];
let allHistory = [];
let allTransfers = [];
let importData = [];
let teamChart = null;
let diseaseChart = null;
let periodChart = null;
let admissionTypeChart = null;
let admissionFormChart = null;

// ===============================
// データ管理
// ===============================

// ローカルストレージからデータを読み込み
function loadPatientsFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        allPatients = JSON.parse(data);
    } else {
        // 初期サンプルデータ
        allPatients = [
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
        savePatientsToStorage();
    }
}

// ローカルストレージにデータを保存
function savePatientsToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPatients));
}

// 履歴を読み込み
function loadHistoryFromStorage() {
    const data = localStorage.getItem(HISTORY_KEY);
    if (data) {
        allHistory = JSON.parse(data);
    }
}

// 履歴を保存
function saveHistoryToStorage() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
}

// 転入・転出履歴を読み込み
function loadTransfersFromStorage() {
    const data = localStorage.getItem(TRANSFER_KEY);
    if (data) {
        allTransfers = JSON.parse(data);
    }
}

// 転入・転出履歴を保存
function saveTransfersToStorage() {
    localStorage.setItem(TRANSFER_KEY, JSON.stringify(allTransfers));
}

// 転入・転出履歴を追加
function addTransferHistory(patientId, patientName, transferType, destination, transferDate, reason) {
    const transferEntry = {
        id: Date.now().toString(),
        patientId,
        patientName,
        transferType, // '転出' or '転入'
        destination, // 転出先または転入元
        transferDate,
        reason: reason || '',
        timestamp: new Date().toISOString()
    };
    allTransfers.unshift(transferEntry);
    saveTransfersToStorage();
}

// 履歴を追加
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

// 通知表示
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
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 日付フォーマット
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
}

// 日時フォーマット
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP');
}

// 入院期間計算
function calculateAdmissionPeriod(admissionDate, dischargeDate = null) {
    const admission = new Date(admissionDate);
    const end = dischargeDate ? new Date(dischargeDate) : new Date();
    const diffTime = Math.abs(end - admission);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// 退院後経過日数計算
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

// 新規入院率を計算して表示
function updateNewAdmissionRate() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // 過去30日の入院患者
    const recentAdmissions = allPatients.filter(p => {
        const admissionDate = new Date(p.admissionDate);
        return admissionDate >= thirtyDaysAgo;
    });
    
    // 新規入院（新規入院 + 急性増悪）
    const newAdmissions = recentAdmissions.filter(p => 
        p.admissionType === '新規入院' || p.admissionType === '急性増悪'
    );
    
    const total = recentAdmissions.length;
    const newCount = newAdmissions.length;
    const percentage = total > 0 ? Math.round((newCount / total) * 100) : 0;
    
    // アラートボックスの更新
    const alertBox = document.getElementById('newAdmissionAlertBox');
    const icon = document.getElementById('newAdmissionIcon');
    const title = document.getElementById('newAdmissionTitle');
    const rate = document.getElementById('newAdmissionRate');
    const detail = document.getElementById('newAdmissionDetail');
    
    // 新規入院率に応じて色を変更
    if (percentage < 70) {
        // 70%未満の場合は赤色で警告
        alertBox.className = 'border-l-4 p-4 rounded-lg shadow warning-red border-red-500';
        icon.className = 'fas fa-exclamation-triangle text-2xl text-red-600';
        title.className = 'text-lg font-semibold warning-text-red';
        rate.className = 'text-sm font-semibold warning-text-red';
        rate.innerHTML = `⚠️ 新規入院率: ${percentage}% （70%未満）`;
        detail.className = 'text-xs mt-1 warning-text-red';
    } else {
        // 70%以上の場合は緑色
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

// ダッシュボード更新
function updateDashboard() {
    const totalPatients = allPatients.length;
    const admittedPatients = allPatients.filter(p => p.status === '入院中').length;
    const dischargedPatients = allPatients.filter(p => p.status === '退院').length;
    
    // 過去30日の入院種別統計
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAdmissions = allPatients.filter(p => {
        const admissionDate = new Date(p.admissionDate);
        return admissionDate >= thirtyDaysAgo;
    });
    
    const newAdmissionCount = recentAdmissions.filter(p => p.admissionType === '新規入院').length;
    const acuteCount = recentAdmissions.filter(p => p.admissionType === '急性増悪').length;
    const readmissionCount = recentAdmissions.filter(p => p.admissionType === '再入院').length;
    
    // 2か月経過患者を計算
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const twoMonthsPatients = allPatients.filter(p => {
        if (p.status !== '入院中') return false;
        const admissionDate = new Date(p.admissionDate);
        return admissionDate <= twoMonthsAgo;
    });
    
    // 入院形態別カウント
    const voluntaryCount = allPatients.filter(p => p.status === '入院中' && p.admissionForm === '任意入院').length;
    const medicalProtectionCount = allPatients.filter(p => p.status === '入院中' && p.admissionForm === '医療保護入院').length;
    const compulsoryCount = allPatients.filter(p => p.status === '入院中' && p.admissionForm === '措置入院').length;
    
    // チーム別カウント
    const team1A = allPatients.filter(p => p.status === '入院中' && p.team === '1A');
    const team1B = allPatients.filter(p => p.status === '入院中' && p.team === '1B');
    
    // 統計カード更新
    document.getElementById('totalPatients').textContent = totalPatients;
    document.getElementById('admittedPatients').textContent = admittedPatients;
    document.getElementById('twoMonthsPatients').textContent = twoMonthsPatients.length;
    document.getElementById('dischargedPatients').textContent = dischargedPatients;
    
    // 入院種別統計更新
    document.getElementById('newAdmissionCount').textContent = newAdmissionCount;
    document.getElementById('acuteCount').textContent = acuteCount;
    document.getElementById('readmissionCount').textContent = readmissionCount;
    
    // 入院形態別統計更新
    document.getElementById('voluntaryCount').textContent = voluntaryCount;
    document.getElementById('medicalProtectionCount').textContent = medicalProtectionCount;
    document.getElementById('compulsoryCount').textContent = compulsoryCount;
    
    // チーム統計更新
    document.getElementById('team1ACount').textContent = team1A.length;
    document.getElementById('team1BCount').textContent = team1B.length;
    
    // 新規入院率更新
    updateNewAdmissionRate();
    
    // チーム別患者リスト
    renderTeamList('team1AList', team1A);
    renderTeamList('team1BList', team1B);
    
    // 2か月超過アラート
    renderTwoMonthsAlert(twoMonthsPatients);
    
    // 2か月経過患者リスト
    renderTwoMonthsPatientsList(twoMonthsPatients);
}

// チーム別患者リスト表示
function renderTeamList(containerId, patients) {
    const container = document.getElementById(containerId);
    
    if (patients.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">患者なし</p>';
        return;
    }
    
    let html = '<ul class="space-y-2">';
    patients.forEach(patient => {
        html += `
            <li class="text-sm">
                <span class="font-semibold">${patient.patientId}</span> - ${patient.name}
                ${patient.assignedNurse ? `<span class="text-gray-500 ml-2">(${patient.assignedNurse})</span>` : ''}
            </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
}

// 2か月超過アラート表示
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

// 2か月経過患者リスト表示
function renderTwoMonthsPatientsList(patients) {
    const container = document.getElementById('twoMonthsPatientsList');
    
    if (patients.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">該当する患者はいません</p>';
        return;
    }
    
    let html = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者番号</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者名</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">チーム</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">病名</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院形態</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院日</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院期間</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">主治医</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">受け持ちNS</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
    `;
    
    patients.forEach(patient => {
        const admissionPeriod = calculateAdmissionPeriod(patient.admissionDate);
        const formColor = {
            '任意入院': 'bg-green-100 text-green-800',
            '医療保護入院': 'bg-blue-100 text-blue-800',
            '措置入院': 'bg-red-100 text-red-800'
        }[patient.admissionForm] || 'bg-gray-100 text-gray-800';
        
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${patient.patientId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.team === '1A' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">
                        ${patient.team}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.disease}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${formColor}">
                        ${patient.admissionForm}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(patient.admissionDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${admissionPeriod}日</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.primaryPhysician}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.assignedNurse || '-'}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===============================
// 退院後3か月以内患者リスト
// ===============================

// 退院後3か月以内患者リスト表示
function renderRecentDischargeList() {
    const container = document.getElementById('recentDischargeList');
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // 退院後3か月以内の患者
    const recentDischarges = allPatients.filter(p => {
        if (p.status !== '退院' || !p.dischargeDate) return false;
        const dischargeDate = new Date(p.dischargeDate);
        return dischargeDate >= threeMonthsAgo;
    });
    
    if (recentDischarges.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">該当する患者はいません</p>';
        return;
    }
    
    let html = `
        <div class="mb-4">
            <p class="text-sm font-semibold text-gray-700">
                退院後3か月以内の患者: ${recentDischarges.length}名
            </p>
        </div>
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者番号</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者名</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">病名</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院種別</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院日</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">退院日</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">退院後経過日数</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">主治医</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
    `;
    
    recentDischarges.forEach(patient => {
        const daysSinceDischarge = calculateDaysSinceDischarge(patient.dischargeDate);
        const typeColor = {
            '新規入院': 'bg-blue-100 text-blue-800',
            '急性増悪': 'bg-orange-100 text-orange-800',
            '再入院': 'bg-purple-100 text-purple-800'
        }[patient.admissionType] || 'bg-gray-100 text-gray-800';
        
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${patient.patientId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.disease}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeColor}">
                        ${patient.admissionType}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(patient.admissionDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(patient.dischargeDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${daysSinceDischarge < 30 ? 'text-red-600 font-semibold' : ''}">${daysSinceDischarge}日</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.primaryPhysician}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===============================
// 患者一覧
// ===============================

// 患者一覧表示
function renderPatientsList() {
    const searchTerm = document.getElementById('searchInput').value;
    const teamFilter = document.getElementById('teamFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const admissionFormFilter = document.getElementById('admissionFormFilter').value;
    const container = document.getElementById('patientsList');
    
    let filteredPatients = allPatients;
    
    // 検索フィルター
    if (searchTerm) {
        filteredPatients = filteredPatients.filter(p => 
            p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // チームフィルター
    if (teamFilter) {
        filteredPatients = filteredPatients.filter(p => p.team === teamFilter);
    }
    
    // ステータスフィルター
    if (statusFilter) {
        filteredPatients = filteredPatients.filter(p => p.status === statusFilter);
    }
    
    // 入院形態フィルター
    if (admissionFormFilter) {
        filteredPatients = filteredPatients.filter(p => p.admissionForm === admissionFormFilter);
    }
    
    if (filteredPatients.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">該当する患者はいません</p>';
        return;
    }
    
    let html = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
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
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
    `;
    
    filteredPatients.forEach(patient => {
        const statusClass = patient.status === '入院中' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
        const typeColor = {
            '新規入院': 'bg-blue-100 text-blue-800',
            '急性増悪': 'bg-orange-100 text-orange-800',
            '再入院': 'bg-purple-100 text-purple-800'
        }[patient.admissionType] || 'bg-gray-100 text-gray-800';
        const formColor = {
            '任意入院': 'bg-green-100 text-green-800',
            '医療保護入院': 'bg-blue-100 text-blue-800',
            '措置入院': 'bg-red-100 text-red-800'
        }[patient.admissionForm] || 'bg-gray-100 text-gray-800';
        
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${patient.patientId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.team === '1A' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">
                        ${patient.team}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.disease}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeColor}">
                        ${patient.admissionType}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${formColor}">
                        ${patient.admissionForm}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.primaryPhysician}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.assignedNurse || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(patient.admissionDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${patient.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button onclick="editPatient('${patient.id}')" class="text-blue-600 hover:text-blue-900">
                        <i class="fas fa-edit"></i> 編集
                    </button>
                    <button onclick="deletePatient('${patient.id}')" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i> 削除
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===============================
// 患者編集・削除
// ===============================

// 患者編集
function editPatient(id) {
    const patient = allPatients.find(p => p.id === id);
    if (!patient) return;
    
    document.getElementById('editId').value = patient.id;
    document.getElementById('editPatientId').value = patient.patientId;
    document.getElementById('editName').value = patient.name;
    document.getElementById('editDateOfBirth').value = patient.dateOfBirth;
    document.getElementById('editDisease').value = patient.disease;
    document.getElementById('editPrimaryPhysician').value = patient.primaryPhysician;
    document.getElementById('editAdmissionDate').value = patient.admissionDate;
    document.getElementById('editAdmissionType').value = patient.admissionType;
    document.getElementById('editAdmissionForm').value = patient.admissionForm;
    document.getElementById('editTeam').value = patient.team;
    document.getElementById('editAssignedNurse').value = patient.assignedNurse || '';
    document.getElementById('editStatus').value = patient.status;
    document.getElementById('editDischargeDate').value = patient.dischargeDate || '';
    
    document.getElementById('editModal').classList.remove('hidden');
}

// 編集モーダルを閉じる
function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

// 患者削除
function deletePatient(id) {
    const patient = allPatients.find(p => p.id === id);
    if (!patient) return;
    
    if (!confirm(`患者「${patient.name}」の情報を削除しますか？`)) return;
    
    // 履歴に記録
    addHistory(patient.patientId, patient.name, '削除', '患者情報', patient, null);
    
    allPatients = allPatients.filter(p => p.id !== id);
    savePatientsToStorage();
    updateDashboard();
    renderPatientsList();
    renderDischargeList();
    renderRecentDischargeList();
    showNotification('患者情報を削除しました', 'success');
}

// ===============================
// 退院管理
// ===============================

// 退院リスト表示
function renderDischargeList() {
    const container = document.getElementById('dischargeList');
    const admittedPatients = allPatients.filter(p => p.status === '入院中');
    
    if (admittedPatients.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">入院中の患者はいません</p>';
        return;
    }
    
    let html = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者番号</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者名</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">チーム</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">病名</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院形態</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院日</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院期間</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
    `;
    
    admittedPatients.forEach(patient => {
        const admissionPeriod = calculateAdmissionPeriod(patient.admissionDate);
        const formColor = {
            '任意入院': 'bg-green-100 text-green-800',
            '医療保護入院': 'bg-blue-100 text-blue-800',
            '措置入院': 'bg-red-100 text-red-800'
        }[patient.admissionForm] || 'bg-gray-100 text-gray-800';
        
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${patient.patientId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.team === '1A' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">
                        ${patient.team}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.disease}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${formColor}">
                        ${patient.admissionForm}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(patient.admissionDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${admissionPeriod}日</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button onclick="dischargePatient('${patient.id}')" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        <i class="fas fa-sign-out-alt mr-1"></i>退院処理
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// 退院処理
function dischargePatient(id) {
    const patient = allPatients.find(p => p.id === id);
    if (!patient) return;
    
    if (!confirm(`患者「${patient.name}」を退院処理しますか？`)) return;
    
    const oldStatus = patient.status;
    const today = new Date().toISOString().split('T')[0];
    
    patient.status = '退院';
    patient.dischargeDate = today;
    
    // 履歴に記録
    addHistory(patient.patientId, patient.name, '退院処理', 'ステータス', oldStatus, '退院');
    
    // デイリー記録を自動更新
    incrementDailyCount(patient.team === '1A' ? 'team1A' : 'team1B', 'discharge');
    
    savePatientsToStorage();
    updateDashboard();
    renderDischargeList();
    renderPatientsList();
    renderRecentDischargeList();
    showNotification('退院処理が完了しました', 'success');
}

// ===============================
// 履歴管理
// ===============================

// 履歴表示
function renderHistoryList() {
    const searchTerm = document.getElementById('historySearch').value;
    const container = document.getElementById('historyList');
    
    let filteredHistory = allHistory;
    
    if (searchTerm) {
        filteredHistory = filteredHistory.filter(h => 
            h.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.patientName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (filteredHistory.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">履歴データはありません</p>';
        return;
    }
    
    let html = '';
    filteredHistory.forEach(record => {
        const changeTypeClass = {
            '新規登録': 'bg-green-100 text-green-800',
            '情報更新': 'bg-blue-100 text-blue-800',
            '退院処理': 'bg-purple-100 text-purple-800',
            '削除': 'bg-red-100 text-red-800'
        }[record.changeType] || 'bg-gray-100 text-gray-800';
        
        html += `
            <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-start justify-between mb-2">
                    <div>
                        <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${changeTypeClass}">
                            ${record.changeType}
                        </span>
                        <span class="ml-2 font-semibold">${record.patientId} - ${record.patientName}</span>
                    </div>
                    <span class="text-sm text-gray-500">${formatDateTime(record.changeTimestamp)}</span>
                </div>
                ${record.changedFields ? `
                    <div class="text-sm text-gray-700 mt-2">
                        <span class="font-semibold">変更内容:</span> ${record.changedFields}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===============================
// CSV一括インポート
// ===============================

// テンプレートダウンロード
function downloadTemplate() {
    const template = 'patientId,name,dateOfBirth,disease,primaryPhysician,admissionDate,team,assignedNurse,admissionType,admissionForm\nP0001,山田 太郎,1950-01-15,統合失調症,田中 医師,2026-02-01,1A,鈴木 NS,新規入院,医療保護入院\nP0002,佐藤 花子,1955-05-20,双極性障害,山田 医師,2026-02-01,1B,田中 NS,急性増悪,任意入院\n';
    
    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '患者情報インポートテンプレート_精神科.csv';
    link.click();
    
    showNotification('テンプレートをダウンロードしました', 'success');
}

// ファイル選択処理
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSV(text);
    };
    reader.readAsText(file);
}

// CSV解析
function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    importData = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const patient = {};
        headers.forEach((header, index) => {
            patient[header.trim()] = values[index]?.trim() || '';
        });
        importData.push(patient);
    }
    
    showImportPreview();
}

// インポートプレビュー表示
function showImportPreview() {
    const previewDiv = document.getElementById('importPreview');
    const contentDiv = document.getElementById('importPreviewContent');
    
    let html = `
        <p class="mb-4 font-semibold">${importData.length}件のデータをインポート準備完了</p>
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者番号</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者名</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">チーム</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">病名</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院種別</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入院形態</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
    `;
    
    importData.forEach(patient => {
        html += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${patient.patientId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${patient.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${patient.team}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${patient.disease}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${patient.admissionType}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${patient.admissionForm}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    contentDiv.innerHTML = html;
    previewDiv.classList.remove('hidden');
}

// インポート実行
function executeImport() {
    let successCount = 0;
    
    importData.forEach(data => {
        const newPatient = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            patientId: data.patientId,
            name: data.name,
            dateOfBirth: data.dateOfBirth,
            disease: data.disease,
            primaryPhysician: data.primaryPhysician,
            admissionDate: data.admissionDate,
            dischargeDate: null,
            team: data.team,
            assignedNurse: data.assignedNurse || '',
            admissionType: data.admissionType || '新規入院',
            admissionForm: data.admissionForm || '任意入院',
            status: '入院中'
        };
        
        allPatients.push(newPatient);
        addHistory(newPatient.patientId, newPatient.name, '新規登録', 'CSVインポート', null, newPatient);
        successCount++;
    });
    
    savePatientsToStorage();
    updateDashboard();
    renderPatientsList();
    renderRecentDischargeList();
    
    document.getElementById('importPreview').classList.add('hidden');
    document.getElementById('csvFileInput').value = '';
    importData = [];
    
    showNotification(`${successCount}件の患者情報をインポートしました`, 'success');
}

// ===============================
// 統計グラフ
// ===============================

// グラフ描画
function renderCharts() {
    renderAdmissionTypeChart();
    renderAdmissionFormChart();
    renderTeamChart();
    renderDiseaseChart();
    renderPeriodChart();
}

// 入院種別グラフ
function renderAdmissionTypeChart() {
    const ctx = document.getElementById('admissionTypeChart');
    if (!ctx) return;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAdmissions = allPatients.filter(p => {
        const admissionDate = new Date(p.admissionDate);
        return admissionDate >= thirtyDaysAgo;
    });
    
    const newCount = recentAdmissions.filter(p => p.admissionType === '新規入院').length;
    const acuteCount = recentAdmissions.filter(p => p.admissionType === '急性増悪').length;
    const readmissionCount = recentAdmissions.filter(p => p.admissionType === '再入院').length;
    
    if (admissionTypeChart) admissionTypeChart.destroy();
    
    admissionTypeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['新規入院', '急性増悪', '再入院'],
            datasets: [{
                label: '患者数（過去30日）',
                data: [newCount, acuteCount, readmissionCount],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// 入院形態別グラフ
function renderAdmissionFormChart() {
    const ctx = document.getElementById('admissionFormChart');
    if (!ctx) return;
    
    const voluntary = allPatients.filter(p => p.status === '入院中' && p.admissionForm === '任意入院').length;
    const medical = allPatients.filter(p => p.status === '入院中' && p.admissionForm === '医療保護入院').length;
    const compulsory = allPatients.filter(p => p.status === '入院中' && p.admissionForm === '措置入院').length;
    
    if (admissionFormChart) admissionFormChart.destroy();
    
    admissionFormChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['任意入院', '医療保護入院', '措置入院'],
            datasets: [{
                data: [voluntary, medical, compulsory],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// チーム別グラフ
function renderTeamChart() {
    const ctx = document.getElementById('teamChart');
    if (!ctx) return;
    
    const team1A = allPatients.filter(p => p.status === '入院中' && p.team === '1A').length;
    const team1B = allPatients.filter(p => p.status === '入院中' && p.team === '1B').length;
    
    if (teamChart) teamChart.destroy();
    
    teamChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['チーム1A', 'チーム1B'],
            datasets: [{
                label: '入院患者数',
                data: [team1A, team1B],
                backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(168, 85, 247, 0.8)']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// 病名別グラフ
function renderDiseaseChart() {
    const ctx = document.getElementById('diseaseChart');
    if (!ctx) return;
    
    const diseaseCount = {};
    allPatients.forEach(p => {
        diseaseCount[p.disease] = (diseaseCount[p.disease] || 0) + 1;
    });
    
    const labels = Object.keys(diseaseCount);
    const data = Object.values(diseaseCount);
    
    if (diseaseChart) diseaseChart.destroy();
    
    diseaseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// 入院期間分布グラフ
function renderPeriodChart() {
    const ctx = document.getElementById('periodChart');
    if (!ctx) return;
    
    const periods = {
        '1週間未満': 0,
        '1週間〜1か月': 0,
        '1〜2か月': 0,
        '2〜3か月': 0,
        '3か月以上': 0
    };
    
    allPatients.filter(p => p.status === '入院中').forEach(p => {
        const days = calculateAdmissionPeriod(p.admissionDate);
        if (days < 7) periods['1週間未満']++;
        else if (days < 30) periods['1週間〜1か月']++;
        else if (days < 60) periods['1〜2か月']++;
        else if (days < 90) periods['2〜3か月']++;
        else periods['3か月以上']++;
    });
    
    if (periodChart) periodChart.destroy();
    
    periodChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(periods),
            datasets: [{
                label: '患者数',
                data: Object.values(periods),
                backgroundColor: 'rgba(59, 130, 246, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// ===============================
// CSVエクスポート
// ===============================

// CSVエクスポート
function exportCSV() {
    const headers = ['患者番号', '患者名', 'チーム', '生年月日', '病名', '主治医', '受け持ちNS', '入院日', '退院日', '入院種別', '入院形態', 'ステータス', '入院期間(日)'];
    let csv = headers.join(',') + '\n';
    
    allPatients.forEach(patient => {
        const admissionPeriod = calculateAdmissionPeriod(patient.admissionDate, patient.dischargeDate);
        const row = [
            patient.patientId,
            patient.name,
            patient.team,
            patient.dateOfBirth,
            patient.disease,
            patient.primaryPhysician,
            patient.assignedNurse || '',
            patient.admissionDate,
            patient.dischargeDate || '',
            patient.admissionType,
            patient.admissionForm,
            patient.status,
            admissionPeriod
        ];
        csv += row.join(',') + '\n';
    });
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `患者情報_精神科_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('CSVファイルをエクスポートしました', 'success');
}

// ===============================
// フォーム処理
// ===============================

// フォームリセット
function resetForm() {
    document.getElementById('patientForm').reset();
    showNotification('フォームをリセットしました', 'success');
}

// ===============================
// 初期化
// ===============================

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    // ログイン状態をチェック
    checkLoginStatus();
    
    // ログインフォームのイベントリスナー
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // パスワード入力欄でEnterキーを押した時の処理
    document.getElementById('passwordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin(e);
        }
    });
    
    // データ読み込み（ログイン後にも実行されるため、ここでは初期化のみ）
    loadPatientsFromStorage();
    loadHistoryFromStorage();
    loadTransfersFromStorage();
    
    // 初期表示
    updateDashboard();
    renderPatientsList();
    renderDischargeList();
    renderRecentDischargeList();
    renderHistoryList();
    renderTransferHistory();
    
    // タブ切り替え
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // タブボタンのスタイル更新
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
                btn.classList.add('text-gray-600');
            });
            button.classList.add('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
            button.classList.remove('text-gray-600');
            
            // タブコンテンツの表示切替
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            // グラフタブの場合は描画
            if (targetTab === 'charts') {
                renderCharts();
            }
            
            // 退院後3か月以内患者タブの場合はリスト更新
            if (targetTab === 'readmission') {
                renderRecentDischargeList();
            }
            
            // 転入・転出管理タブの場合は履歴更新
            if (targetTab === 'transfer') {
                renderTransferHistory();
            }
        });
    });
    
    // 患者登録フォーム送信
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
        
        // デイリー記録を自動更新
        incrementDailyCount(newPatient.team === '1A' ? 'team1A' : 'team1B', 'admission');
        
        updateDashboard();
        renderPatientsList();
        renderDischargeList();
        renderRecentDischargeList();
        resetForm();
        showNotification('患者情報を登録しました', 'success');
    });
    
    // 編集フォーム送信
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
        updateDashboard();
        renderPatientsList();
        renderDischargeList();
        renderRecentDischargeList();
        closeEditModal();
        showNotification('患者情報を更新しました', 'success');
    });
    
    // 検索フィルター
    document.getElementById('searchInput').addEventListener('input', renderPatientsList);
    document.getElementById('teamFilter').addEventListener('change', renderPatientsList);
    document.getElementById('statusFilter').addEventListener('change', renderPatientsList);
    document.getElementById('admissionFormFilter').addEventListener('change', renderPatientsList);
    document.getElementById('historySearch').addEventListener('input', renderHistoryList);
    
    // 転出フォーム送信
    document.getElementById('transferOutForm').addEventListener('submit', handleTransferOut);
    
    // 転入フォーム送信
    document.getElementById('transferInForm').addEventListener('submit', handleTransferIn);
    
    // 転出日を今日の日付に設定
    document.getElementById('transferOutDate').valueAsDate = new Date();
    document.getElementById('transferInDate').valueAsDate = new Date();
    
    // デイリー記録の日付を今日に設定
    document.getElementById('dailyRecordDate').valueAsDate = new Date();
    
    // デイリー記録をロード
    loadDailyRecords();
    loadDailyRecord();
});

// ===============================
// 転入・転出管理
// ===============================

// 転出モーダルを表示
function showTransferOutModal() {
    const select = document.getElementById('transferOutPatientId');
    select.innerHTML = '<option value="">患者を選択してください</option>';
    
    // 入院中の患者のみ表示
    const admittedPatients = allPatients.filter(p => p.status === '入院中');
    admittedPatients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.patientId} - ${patient.name} (${patient.team}チーム)`;
        select.appendChild(option);
    });
    
    document.getElementById('transferOutModal').classList.remove('hidden');
}

// 転出モーダルを閉じる
function closeTransferOutModal() {
    document.getElementById('transferOutModal').classList.add('hidden');
    document.getElementById('transferOutForm').reset();
    document.getElementById('transferOutPatientInfo').classList.add('hidden');
}

// 転出患者情報を更新
function updateTransferOutPatientInfo() {
    const patientId = document.getElementById('transferOutPatientId').value;
    if (!patientId) {
        document.getElementById('transferOutPatientInfo').classList.add('hidden');
        return;
    }
    
    const patient = allPatients.find(p => p.id === patientId);
    if (!patient) return;
    
    const detailsDiv = document.getElementById('transferOutPatientDetails');
    detailsDiv.innerHTML = `
        <div class="space-y-1">
            <p><span class="font-semibold">患者番号:</span> ${patient.patientId}</p>
            <p><span class="font-semibold">患者名:</span> ${patient.name}</p>
            <p><span class="font-semibold">病名:</span> ${patient.disease}</p>
            <p><span class="font-semibold">入院形態:</span> ${patient.admissionForm}</p>
            <p><span class="font-semibold">チーム:</span> ${patient.team}</p>
            <p><span class="font-semibold">入院日:</span> ${formatDate(patient.admissionDate)}</p>
            <p><span class="font-semibold">入院期間:</span> ${calculateAdmissionPeriod(patient.admissionDate)}日</p>
        </div>
    `;
    
    document.getElementById('transferOutPatientInfo').classList.remove('hidden');
}

// 転出処理を実行
async function handleTransferOut(event) {
    event.preventDefault();
    
    const patientId = document.getElementById('transferOutPatientId').value;
    const destination = document.getElementById('transferOutDestination').value;
    const transferDate = document.getElementById('transferOutDate').value;
    const reason = document.getElementById('transferOutReason').value;
    
    const patient = allPatients.find(p => p.id === patientId);
    if (!patient) return;
    
    if (!confirm(`患者「${patient.name}」を${destination}へ転出処理しますか？\n\n転出後、当病棟の入院患者リストから削除されます。`)) {
        return;
    }
    
    // 転出履歴を記録
    addTransferHistory(patient.patientId, patient.name, '転出', destination, transferDate, reason);
    
    // 通常の履歴にも記録
    addHistory(patient.patientId, patient.name, '転出処理', `転出先: ${destination}`, 
        {status: patient.status, ward: '当病棟'}, 
        {status: '転出', ward: destination});
    
    // デイリー記録を自動更新
    incrementDailyCount(patient.team === '1A' ? 'team1A' : 'team1B', 'transferOut');
    
    // 患者をリストから削除
    allPatients = allPatients.filter(p => p.id !== patientId);
    savePatientsToStorage();
    
    // 表示を更新
    updateDashboard();
    renderPatientsList();
    renderDischargeList();
    renderRecentDischargeList();
    renderTransferHistory();
    
    closeTransferOutModal();
    showNotification(`患者「${patient.name}」を${destination}へ転出処理しました`, 'success');
}

// 転入モーダルを表示
function showTransferInModal() {
    document.getElementById('transferInModal').classList.remove('hidden');
}

// 転入モーダルを閉じる
function closeTransferInModal() {
    document.getElementById('transferInModal').classList.add('hidden');
    document.getElementById('transferInForm').reset();
}

// 転入処理を実行
async function handleTransferIn(event) {
    event.preventDefault();
    
    const newPatient = {
        id: Date.now().toString(),
        patientId: document.getElementById('transferInPatientId').value,
        name: document.getElementById('transferInName').value,
        dateOfBirth: document.getElementById('transferInDateOfBirth').value,
        disease: document.getElementById('transferInDisease').value,
        primaryPhysician: document.getElementById('transferInPrimaryPhysician').value,
        admissionDate: document.getElementById('transferInAdmissionDate').value,
        dischargeDate: null,
        team: document.getElementById('transferInTeam').value,
        assignedNurse: document.getElementById('transferInAssignedNurse').value || '',
        admissionType: document.getElementById('transferInAdmissionType').value,
        admissionForm: document.getElementById('transferInAdmissionForm').value,
        status: '入院中'
    };
    
    const source = document.getElementById('transferInSource').value;
    const transferDate = document.getElementById('transferInDate').value;
    const reason = document.getElementById('transferInReason').value;
    
    if (!confirm(`患者「${newPatient.name}」を${source}から転入処理しますか？`)) {
        return;
    }
    
    // 転入履歴を記録
    addTransferHistory(newPatient.patientId, newPatient.name, '転入', source, transferDate, reason);
    
    // 通常の履歴にも記録
    addHistory(newPatient.patientId, newPatient.name, '転入処理', `転入元: ${source}`, 
        {status: '転入前', ward: source}, 
        {status: '入院中', ward: '当病棟'});
    
    // デイリー記録を自動更新
    incrementDailyCount(newPatient.team === '1A' ? 'team1A' : 'team1B', 'transferIn');
    
    // 患者を追加
    allPatients.push(newPatient);
    savePatientsToStorage();
    
    // 表示を更新
    updateDashboard();
    renderPatientsList();
    renderDischargeList();
    renderRecentDischargeList();
    renderTransferHistory();
    
    closeTransferInModal();
    showNotification(`患者「${newPatient.name}」を${source}から転入処理しました`, 'success');
}

// 転入・転出履歴を表示
function renderTransferHistory() {
    const container = document.getElementById('transferHistoryList');
    
    if (allTransfers.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">転入・転出履歴はありません</p>';
        return;
    }
    
    let html = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日時</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">種別</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者番号</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者名</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">転出先/転入元</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">転送日</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">理由・備考</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
    `;
    
    allTransfers.forEach(transfer => {
        const typeClass = transfer.transferType === '転出' 
            ? 'bg-orange-100 text-orange-800' 
            : 'bg-green-100 text-green-800';
        const icon = transfer.transferType === '転出' 
            ? 'fa-arrow-right' 
            : 'fa-arrow-left';
        
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDateTime(transfer.timestamp)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeClass}">
                        <i class="fas ${icon} mr-1"></i>${transfer.transferType}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${transfer.patientId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${transfer.patientName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${transfer.destination}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(transfer.transferDate)}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${transfer.reason || '-'}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===============================
// デイリー記録管理
// ===============================

let allDailyRecords = [];
let currentMode = 'auto'; // 'auto' or 'manual'

// ローカルストレージからデイリー記録を読み込む
function loadDailyRecords() {
    const saved = localStorage.getItem('psychiatricDailyRecords');
    allDailyRecords = saved ? JSON.parse(saved) : [];
}

// ローカルストレージにデイリー記録を保存
function saveDailyRecordsToStorage() {
    localStorage.setItem('psychiatricDailyRecords', JSON.stringify(allDailyRecords));
}

// 日付を YYYY-MM-DD 形式で取得
function getDateString(date) {
    if (typeof date === 'string') {
        return date.split('T')[0];
    }
    const d = date || new Date();
    return d.toISOString().split('T')[0];
}

// 今日の日付を設定
function setToday() {
    document.getElementById('dailyRecordDate').valueAsDate = new Date();
    loadDailyRecord();
}

// モード切替
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

// 指定日の記録を読み込む
function loadDailyRecord() {
    const dateStr = document.getElementById('dailyRecordDate').value;
    const record = allDailyRecords.find(r => r.date === dateStr);
    
    if (record) {
        // 既存記録を表示
        document.getElementById('team1A_admission').value = record.team1A.admission;
        document.getElementById('team1A_discharge').value = record.team1A.discharge;
        document.getElementById('team1A_transferIn').value = record.team1A.transferIn;
        document.getElementById('team1A_transferOut').value = record.team1A.transferOut;
        
        document.getElementById('team1B_admission').value = record.team1B.admission;
        document.getElementById('team1B_discharge').value = record.team1B.discharge;
        document.getElementById('team1B_transferIn').value = record.team1B.transferIn;
        document.getElementById('team1B_transferOut').value = record.team1B.transferOut;
    } else {
        // 自動集計モードの場合、当日のイベントから集計
        if (currentMode === 'auto') {
            autoCalculateDaily(dateStr);
        } else {
            clearDailyRecord();
        }
    }
    
    updateTotals();
    renderDailyRecordsList();
}

// 当日のイベントから自動集計
function autoCalculateDaily(dateStr) {
    const counts = {
        team1A: { admission: 0, discharge: 0, transferIn: 0, transferOut: 0 },
        team1B: { admission: 0, discharge: 0, transferIn: 0, transferOut: 0 }
    };
    
    // 新規入院患者をカウント
    allPatients.forEach(p => {
        if (getDateString(p.admissionDate) === dateStr) {
            if (p.team === '1A') counts.team1A.admission++;
            else if (p.team === '1B') counts.team1B.admission++;
        }
    });
    
    // 退院患者をカウント
    allPatients.forEach(p => {
        if (p.dischargeDate && getDateString(p.dischargeDate) === dateStr) {
            if (p.team === '1A') counts.team1A.discharge++;
            else if (p.team === '1B') counts.team1B.discharge++;
        }
    });
    
    // 転入・転出をカウント
    allTransfers.forEach(t => {
        if (getDateString(t.transferDate) === dateStr) {
            // 転入・転出時のチームを特定するのは難しいため、患者情報から判定
            const patient = allPatients.find(p => p.patientId === t.patientId);
            const team = patient ? patient.team : '1A'; // デフォルト1A
            
            if (t.transferType === '転入') {
                if (team === '1A') counts.team1A.transferIn++;
                else if (team === '1B') counts.team1B.transferIn++;
            } else if (t.transferType === '転出') {
                if (team === '1A') counts.team1A.transferOut++;
                else if (team === '1B') counts.team1B.transferOut++;
            }
        }
    });
    
    // 入力フィールドに反映
    document.getElementById('team1A_admission').value = counts.team1A.admission;
    document.getElementById('team1A_discharge').value = counts.team1A.discharge;
    document.getElementById('team1A_transferIn').value = counts.team1A.transferIn;
    document.getElementById('team1A_transferOut').value = counts.team1A.transferOut;
    
    document.getElementById('team1B_admission').value = counts.team1B.admission;
    document.getElementById('team1B_discharge').value = counts.team1B.discharge;
    document.getElementById('team1B_transferIn').value = counts.team1B.transferIn;
    document.getElementById('team1B_transferOut').value = counts.team1B.transferOut;
}

// 合計を更新
function updateTotals() {
    const team1A_admission = parseInt(document.getElementById('team1A_admission').value) || 0;
    const team1A_discharge = parseInt(document.getElementById('team1A_discharge').value) || 0;
    const team1A_transferIn = parseInt(document.getElementById('team1A_transferIn').value) || 0;
    const team1A_transferOut = parseInt(document.getElementById('team1A_transferOut').value) || 0;
    
    const team1B_admission = parseInt(document.getElementById('team1B_admission').value) || 0;
    const team1B_discharge = parseInt(document.getElementById('team1B_discharge').value) || 0;
    const team1B_transferIn = parseInt(document.getElementById('team1B_transferIn').value) || 0;
    const team1B_transferOut = parseInt(document.getElementById('team1B_transferOut').value) || 0;
    
    // チーム別合計変動（入院+転入 - 退院-転出）
    const team1A_total = team1A_admission + team1A_transferIn - team1A_discharge - team1A_transferOut;
    const team1B_total = team1B_admission + team1B_transferIn - team1B_discharge - team1B_transferOut;
    
    document.getElementById('team1A_total').textContent = team1A_total >= 0 ? `+${team1A_total}` : team1A_total;
    document.getElementById('team1B_total').textContent = team1B_total >= 0 ? `+${team1B_total}` : team1B_total;
    
    // 全体合計
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

// 記録をクリア
function clearDailyRecord() {
    document.getElementById('team1A_admission').value = 0;
    document.getElementById('team1A_discharge').value = 0;
    document.getElementById('team1A_transferIn').value = 0;
    document.getElementById('team1A_transferOut').value = 0;
    
    document.getElementById('team1B_admission').value = 0;
    document.getElementById('team1B_discharge').value = 0;
    document.getElementById('team1B_transferIn').value = 0;
    document.getElementById('team1B_transferOut').value = 0;
    
    updateTotals();
}

// デイリー記録を保存
function saveDailyRecord() {
    const dateStr = document.getElementById('dailyRecordDate').value;
    
    if (!dateStr) {
        showNotification('日付を選択してください', 'error');
        return;
    }
    
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
    
    // 既存記録を更新または新規追加
    const existingIndex = allDailyRecords.findIndex(r => r.date === dateStr);
    if (existingIndex >= 0) {
        allDailyRecords[existingIndex] = record;
    } else {
        allDailyRecords.push(record);
    }
    
    // 日付順にソート
    allDailyRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    saveDailyRecordsToStorage();
    renderDailyRecordsList();
    showNotification(`${formatDate(dateStr)} の記録を保存しました`, 'success');
}

// 過去の記録一覧を表示
function renderDailyRecordsList() {
    const tbody = document.getElementById('dailyRecordsList');
    
    if (allDailyRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="px-4 py-8 text-center text-gray-500">記録がありません</td></tr>';
        return;
    }
    
    // 過去30日分のみ表示
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRecords = allDailyRecords.filter(r => new Date(r.date) >= thirtyDaysAgo);
    
    if (recentRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="px-4 py-8 text-center text-gray-500">過去30日間の記録がありません</td></tr>';
        return;
    }
    
    let html = '';
    recentRecords.forEach(record => {
        const net = 
            (record.team1A.admission + record.team1A.transferIn - record.team1A.discharge - record.team1A.transferOut) +
            (record.team1B.admission + record.team1B.transferIn - record.team1B.discharge - record.team1B.transferOut);
        
        const netClass = net > 0 ? 'text-green-600 font-bold' : net < 0 ? 'text-red-600 font-bold' : 'text-gray-600';
        const netText = net > 0 ? `+${net}` : net;
        
        html += `
            <tr class="hover:bg-gray-50">
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
                    <button onclick="editDailyRecord('${record.date}')" 
                        class="text-blue-600 hover:text-blue-800 mr-2" title="編集">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteDailyRecord('${record.date}')" 
                        class="text-red-600 hover:text-red-800" title="削除">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// デイリー記録を編集
function editDailyRecord(dateStr) {
    document.getElementById('dailyRecordDate').value = dateStr;
    loadDailyRecord();
    
    // デイリー記録タブへ移動
    const dailyTab = document.querySelector('[data-tab="daily"]');
    if (dailyTab) dailyTab.click();
    
    // スクロールして日付入力エリアへ
    setTimeout(() => {
        document.getElementById('dailyRecordDate').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

// デイリー記録を削除
function deleteDailyRecord(dateStr) {
    if (!confirm(`${formatDate(dateStr)} の記録を削除しますか？`)) {
        return;
    }
    
    allDailyRecords = allDailyRecords.filter(r => r.date !== dateStr);
    saveDailyRecordsToStorage();
    renderDailyRecordsList();
    showNotification(`${formatDate(dateStr)} の記録を削除しました`, 'success');
}

// デイリー記録をCSVエクスポート
function exportDailyRecordsCSV() {
    if (allDailyRecords.length === 0) {
        showNotification('エクスポートするデータがありません', 'error');
        return;
    }
    
    // CSVヘッダー
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += '日付,チーム1A入院,チーム1A退院,チーム1A転入,チーム1A転出,チーム1A純増減,';
    csv += 'チーム1B入院,チーム1B退院,チーム1B転入,チーム1B転出,チーム1B純増減,';
    csv += '全体入院合計,全体退院合計,全体転入合計,全体転出合計,全体純増減\n';
    
    // データ行
    allDailyRecords.forEach(record => {
        const team1A_net = record.team1A.admission + record.team1A.transferIn - record.team1A.discharge - record.team1A.transferOut;
        const team1B_net = record.team1B.admission + record.team1B.transferIn - record.team1B.discharge - record.team1B.transferOut;
        const total_admission = record.team1A.admission + record.team1B.admission;
        const total_discharge = record.team1A.discharge + record.team1B.discharge;
        const total_transferIn = record.team1A.transferIn + record.team1B.transferIn;
        const total_transferOut = record.team1A.transferOut + record.team1B.transferOut;
        const total_net = total_admission + total_transferIn - total_discharge - total_transferOut;
        
        csv += `${record.date},`;
        csv += `${record.team1A.admission},${record.team1A.discharge},${record.team1A.transferIn},${record.team1A.transferOut},${team1A_net},`;
        csv += `${record.team1B.admission},${record.team1B.discharge},${record.team1B.transferIn},${record.team1B.transferOut},${team1B_net},`;
        csv += `${total_admission},${total_discharge},${total_transferIn},${total_transferOut},${total_net}\n`;
    });
    
    // ダウンロード
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `デイリー記録_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('CSVファイルをエクスポートしました', 'success');
}

// 患者登録時に当日のデイリー記録を自動更新
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
