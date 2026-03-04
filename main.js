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

// 入力モード切替（和暦 ↔ カレンダー）
function switchDateMode(fieldId, mode) {
    const warekiBlock = document.getElementById(fieldId + '_warekiBlock');
    const calendarBlock = document.getElementById(fieldId + '_calendarBlock');
    const btnWareki = document.getElementById(fieldId + '_modeWareki');
    const btnCalendar = document.getElementById(fieldId + '_modeCalendar');
    const hidden = document.getElementById(fieldId);

    if (mode === 'wareki') {
        if (warekiBlock) warekiBlock.classList.remove('hidden');
        if (calendarBlock) calendarBlock.classList.add('hidden');
        if (btnWareki) { btnWareki.classList.remove('bg-gray-200','text-gray-700'); btnWareki.classList.add('bg-blue-600','text-white'); }
        if (btnCalendar) { btnCalendar.classList.remove('bg-blue-600','text-white'); btnCalendar.classList.add('bg-gray-200','text-gray-700'); }
        // カレンダー値から和暦に変換してセット
        const calInput = document.getElementById(fieldId + '_calendar');
        if (calInput && calInput.value) {
            dateToWareki(fieldId, calInput.value);
        }
    } else {
        if (warekiBlock) warekiBlock.classList.add('hidden');
        if (calendarBlock) calendarBlock.classList.remove('hidden');
        if (btnCalendar) { btnCalendar.classList.remove('bg-gray-200','text-gray-700'); btnCalendar.classList.add('bg-blue-600','text-white'); }
        if (btnWareki) { btnWareki.classList.remove('bg-blue-600','text-white'); btnWareki.classList.add('bg-gray-200','text-gray-700'); }
        // 和暦からカレンダーに変換してセット
        if (hidden && hidden.value) {
            const calInput = document.getElementById(fieldId + '_calendar');
            if (calInput) calInput.value = hidden.value;
        }
    }
}

// カレンダー入力 → hidden フィールドに反映
function calendarToHidden(fieldId) {
    const calInput = document.getElementById(fieldId + '_calendar');
    const hidden = document.getElementById(fieldId);
    if (calInput && hidden) {
        hidden.value = calInput.value;
    }
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
let _isEditModalOpen = false; // 編集モーダル開閉フラグ（Firebase更新中の競合防止）


// ===============================
// データ初期化・一括登録（Excel取込）
// ===============================
const EXCEL_IMPORT_DATA = {"excel_0000_20240201_19303": {"id": "excel_0000_20240201_19303", "patientId": "19303", "name": "下河文子", "dateOfBirth": "1931-07-26", "admissionDate": "2024-02-01", "dischargeDate": "2024-02-28", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0001_20240202_19080": {"id": "excel_0001_20240202_19080", "patientId": "19080", "name": "宇津宮珠美", "dateOfBirth": "2023-09-01", "admissionDate": "2024-02-02", "dischargeDate": "2024-06-08", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0002_20240203_14880": {"id": "excel_0002_20240203_14880", "patientId": "14880", "name": "森聖美", "dateOfBirth": "1982-08-19", "admissionDate": "2024-02-03", "dischargeDate": "2024-03-01", "disease": "うつ病,パニック障害", "primaryPhysician": "深堀", "assignedNurse": "筒井", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0003_20240203_19308": {"id": "excel_0003_20240203_19308", "patientId": "19308", "name": "矢嶋光江", "dateOfBirth": "1975-03-06", "admissionDate": "2024-02-03", "dischargeDate": "2024-03-06", "disease": "神経症性うつ病", "primaryPhysician": "深堀", "assignedNurse": "古藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0004_20240206_13117": {"id": "excel_0004_20240206_13117", "patientId": "13117", "name": "井上多美", "dateOfBirth": "S.57.10.11", "admissionDate": "2024-02-06", "dischargeDate": "2024-03-05", "disease": "解離性障害・双極性障害", "primaryPhysician": "深堀", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0005_20240207_18571": {"id": "excel_0005_20240207_18571", "patientId": "18571", "name": "冨永　紀子", "dateOfBirth": "1984-11-03", "admissionDate": "2024-02-07", "dischargeDate": "2024-05-01", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "佐々", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0006_20240208_9127": {"id": "excel_0006_20240208_9127", "patientId": "9127", "name": "渡邉民夫", "dateOfBirth": "S49.4.21", "admissionDate": "2024-02-08", "dischargeDate": "2024-04-26", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0007_20240205_6715": {"id": "excel_0007_20240205_6715", "patientId": "6715", "name": "竹本直子", "dateOfBirth": "1973-05-19", "admissionDate": "2024-02-05", "dischargeDate": "2024-02-10", "disease": "反復性うつ病性障害", "primaryPhysician": "深堀", "assignedNurse": "大江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0008_20240209_19257": {"id": "excel_0008_20240209_19257", "patientId": "19257", "name": "首藤沙愛", "dateOfBirth": "1986-04-07", "admissionDate": "2024-02-09", "dischargeDate": "2024-03-04", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "古藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0009_20240213_18317": {"id": "excel_0009_20240213_18317", "patientId": "18317", "name": "中尾裕子", "dateOfBirth": "1953-03-20", "admissionDate": "2024-02-13", "dischargeDate": "2024-04-26", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0010_20240214_12695": {"id": "excel_0010_20240214_12695", "patientId": "12695", "name": "日田加代子", "dateOfBirth": "S35.4.26", "admissionDate": "2024-02-14", "dischargeDate": "2024-03-13", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "原口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0011_20240214_19313": {"id": "excel_0011_20240214_19313", "patientId": "19313", "name": "井上茜", "dateOfBirth": "1984-11-04", "admissionDate": "2024-02-14", "dischargeDate": "2024-04-12", "disease": "双極性障害、アルコール依存症", "primaryPhysician": "深堀", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0012_20240215_19319": {"id": "excel_0012_20240215_19319", "patientId": "19319", "name": "福田博", "dateOfBirth": "1946-08-24", "admissionDate": "2024-02-15", "dischargeDate": "2024-05-01", "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "波多江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0013_20240215_7220": {"id": "excel_0013_20240215_7220", "patientId": "7220", "name": "佐々木眞美子", "dateOfBirth": "S26.4.10", "admissionDate": "2024-02-15", "dischargeDate": "2024-02-29", "disease": "遷延性うつ病", "primaryPhysician": "深堀", "assignedNurse": "大江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0014_20240216_11285": {"id": "excel_0014_20240216_11285", "patientId": "11285", "name": "明石修二", "dateOfBirth": "1954-03-04", "admissionDate": "2024-02-16", "dischargeDate": "2024-03-08", "disease": "アルコール依存症", "primaryPhysician": "中村", "assignedNurse": "原口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0015_20240217_5651": {"id": "excel_0015_20240217_5651", "patientId": "5651", "name": "内田一郎", "dateOfBirth": "1974-10-29", "admissionDate": "2024-02-17", "dischargeDate": "2024-09-28", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0016_20240221_19327": {"id": "excel_0016_20240221_19327", "patientId": "19327", "name": "梅木万友美", "dateOfBirth": "1969-03-31", "admissionDate": "2024-02-21", "dischargeDate": "2024-04-26", "disease": "双極性感情障害", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0017_20240222_15560": {"id": "excel_0017_20240222_15560", "patientId": "15560", "name": "吉田祐美子", "dateOfBirth": "1974-12-17", "admissionDate": "2024-02-22", "dischargeDate": "2024-03-05", "disease": "抑うつ神経症", "primaryPhysician": "石橋", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0018_20240226_14876": {"id": "excel_0018_20240226_14876", "patientId": "14876", "name": "岡美代子", "dateOfBirth": "Ｓ42.8.5", "admissionDate": "2024-02-26", "dischargeDate": "2024-03-14", "disease": "アルコール依存症、肺高血圧症", "primaryPhysician": "深堀", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0019_20240228_18772": {"id": "excel_0019_20240228_18772", "patientId": "18772", "name": "髙倉昂弘", "dateOfBirth": "1987-12-19", "admissionDate": "2024-02-28", "dischargeDate": "2024-04-30", "disease": "統合失調症、アルコール依存症", "primaryPhysician": "角", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0020_20240229_11895": {"id": "excel_0020_20240229_11895", "patientId": "11895", "name": "宮尾幸恵", "dateOfBirth": "S19.12.14", "admissionDate": "2024-02-29", "dischargeDate": "2024-04-30", "disease": "認知症", "primaryPhysician": "角", "assignedNurse": "筒井", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0021_20240305_5333": {"id": "excel_0021_20240305_5333", "patientId": "5333", "name": "百﨑抑", "dateOfBirth": "1982-04-22", "admissionDate": "2024-03-05", "dischargeDate": "2024-03-11", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0022_20240306_14632": {"id": "excel_0022_20240306_14632", "patientId": "14632", "name": "相良恭司", "dateOfBirth": "1972-11-12", "admissionDate": "2024-03-06", "dischargeDate": "2024-04-08", "disease": "アルコール依存症", "primaryPhysician": "中村", "assignedNurse": "筒井", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0023_20240307_13117": {"id": "excel_0023_20240307_13117", "patientId": "13117", "name": "井上多美", "dateOfBirth": "S.57.10.11", "admissionDate": "2024-03-07", "dischargeDate": "2024-04-06", "disease": "解離性障害・双極性障害", "primaryPhysician": "深堀", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0024_20240311_9887": {"id": "excel_0024_20240311_9887", "patientId": "9887", "name": "田中明", "dateOfBirth": "S53.11.7", "admissionDate": "2024-03-11", "dischargeDate": "2024-04-06", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0025_20240311_17610": {"id": "excel_0025_20240311_17610", "patientId": "17610", "name": "古川真由美", "dateOfBirth": "1975-04-23", "admissionDate": "2024-03-11", "dischargeDate": "2024-04-13", "disease": "うつ病、PTSD", "primaryPhysician": "深堀", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0026_20240313_19350": {"id": "excel_0026_20240313_19350", "patientId": "19350", "name": "隅里菜", "dateOfBirth": "1993-10-02", "admissionDate": "2024-03-13", "dischargeDate": "2024-03-27", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "波多江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0027_20240314_16771": {"id": "excel_0027_20240314_16771", "patientId": "16771", "name": "安井廣", "dateOfBirth": "1938-11-15", "admissionDate": "2024-03-14", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0028_20240316_3721": {"id": "excel_0028_20240316_3721", "patientId": "3721", "name": "土谷学", "dateOfBirth": "1968-06-30", "admissionDate": "2024-03-16", "dischargeDate": "2024-04-17", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "中野", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0029_20240316_18508": {"id": "excel_0029_20240316_18508", "patientId": "18508", "name": "姫野真友子", "dateOfBirth": "2010-03-27", "admissionDate": "2024-03-16", "dischargeDate": "2024-04-02", "disease": "PTSD,ADHD", "primaryPhysician": "森本", "assignedNurse": "大江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0030_20240318_6274": {"id": "excel_0030_20240318_6274", "patientId": "6274", "name": "三好遥", "dateOfBirth": "1983-11-13", "admissionDate": "2024-03-18", "dischargeDate": "2024-04-15", "disease": "心因性過食", "primaryPhysician": "森本", "assignedNurse": "古藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0031_20240321_11639": {"id": "excel_0031_20240321_11639", "patientId": "11639", "name": "古川昭", "dateOfBirth": "1963-12-01", "admissionDate": "2024-03-21", "dischargeDate": "2024-04-20", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "伊藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0032_20240401_14876": {"id": "excel_0032_20240401_14876", "patientId": "14876", "name": "岡美代子", "dateOfBirth": "Ｓ42.8.5", "admissionDate": "2024-04-01", "dischargeDate": "2024-05-30", "disease": "アルコール依存症、肺高血圧症", "primaryPhysician": "深堀", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0033_20240401_19087": {"id": "excel_0033_20240401_19087", "patientId": "19087", "name": "岡八代美", "dateOfBirth": "1964-08-30", "admissionDate": "2024-04-01", "dischargeDate": "2024-05-30", "disease": "アルコール依存症", "primaryPhysician": "深堀", "assignedNurse": "原口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0034_20240330_18385": {"id": "excel_0034_20240330_18385", "patientId": "18385", "name": "北川結愛", "dateOfBirth": "2007-05-09", "admissionDate": "2024-03-30", "dischargeDate": "2024-04-01", "disease": "思春期うつ病", "primaryPhysician": "深堀", "assignedNurse": "伊藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0035_20240401_16473": {"id": "excel_0035_20240401_16473", "patientId": "16473", "name": "福澤義孝", "dateOfBirth": "1951-04-02", "admissionDate": "2024-04-01", "dischargeDate": "2024-06-29", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0036_20240402_19360": {"id": "excel_0036_20240402_19360", "patientId": "19360", "name": "武田アサ子", "dateOfBirth": "1941-08-10", "admissionDate": "2024-04-02", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "中村", "assignedNurse": "古藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0037_20240403_3798": {"id": "excel_0037_20240403_3798", "patientId": "3798", "name": "春日正弘", "dateOfBirth": "1951-12-25", "admissionDate": "2024-04-03", "dischargeDate": "2024-05-01", "disease": "統合失調症", "primaryPhysician": "中村", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0038_20240404_17698": {"id": "excel_0038_20240404_17698", "patientId": "17698", "name": "井口史", "dateOfBirth": "1975-06-06", "admissionDate": "2024-04-04", "dischargeDate": "2024-04-18", "disease": "気分変調証の増悪", "primaryPhysician": "深堀", "assignedNurse": "大江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0039_20240408_18998": {"id": "excel_0039_20240408_18998", "patientId": "18998", "name": "藤木唯", "dateOfBirth": "1985-11-17", "admissionDate": "2024-04-08", "dischargeDate": "2024-09-18", "disease": "双極性障害", "primaryPhysician": "佐伯", "assignedNurse": "筒井", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0040_20240408_13117": {"id": "excel_0040_20240408_13117", "patientId": "13117", "name": "井上多美", "dateOfBirth": "S.57.10.11", "admissionDate": "2024-04-08", "dischargeDate": "2024-05-02", "disease": "解離性障害・双極性障害", "primaryPhysician": "深堀", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0041_20240408_9887": {"id": "excel_0041_20240408_9887", "patientId": "9887", "name": "田中明", "dateOfBirth": "S53.11.7", "admissionDate": "2024-04-08", "dischargeDate": "2024-05-07", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0042_20240408_17657": {"id": "excel_0042_20240408_17657", "patientId": "17657", "name": "月俣恭子", "dateOfBirth": "1992-01-23", "admissionDate": "2024-04-08", "dischargeDate": "2024-04-30", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "瀬戸", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0043_20240410_17510": {"id": "excel_0043_20240410_17510", "patientId": "17510", "name": "宗沙織", "dateOfBirth": "1985-06-03", "admissionDate": "2024-04-10", "dischargeDate": "2024-06-05", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "伊藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0044_20240411_12695": {"id": "excel_0044_20240411_12695", "patientId": "12695", "name": "日田加代子", "dateOfBirth": "S35.4.26", "admissionDate": "2024-04-11", "dischargeDate": "2024-05-02", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "大江", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0045_20240412_19387": {"id": "excel_0045_20240412_19387", "patientId": "19387", "name": "廣中良子", "dateOfBirth": "1941-11-15", "admissionDate": "2024-04-12", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0046_20240420_6715": {"id": "excel_0046_20240420_6715", "patientId": "6715", "name": "竹本直子", "dateOfBirth": "1973-05-19", "admissionDate": "2024-04-20", "dischargeDate": "2024-05-07", "disease": "反復性うつ病性障害", "primaryPhysician": "深堀", "assignedNurse": "大江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0047_20240422_11639": {"id": "excel_0047_20240422_11639", "patientId": "11639", "name": "古川昭", "dateOfBirth": "1963-12-01", "admissionDate": "2024-04-22", "dischargeDate": "2024-05-21", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "伊藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0048_20240425_19403": {"id": "excel_0048_20240425_19403", "patientId": "19403", "name": "坂牧敏美", "dateOfBirth": "1968-05-11", "admissionDate": "2024-04-25", "dischargeDate": "2024-06-07", "disease": "うつ病", "primaryPhysician": "藤本", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0049_20240430_15503": {"id": "excel_0049_20240430_15503", "patientId": "15503", "name": "下川真理子", "dateOfBirth": "1985-02-18", "admissionDate": "2024-04-30", "dischargeDate": "2024-06-03", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0050_20240501_19418": {"id": "excel_0050_20240501_19418", "patientId": "19418", "name": "神谷正子", "dateOfBirth": "1953-12-01", "admissionDate": "2024-05-01", "dischargeDate": "2024-06-12", "disease": "妄想性障害", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0051_20240508_19250": {"id": "excel_0051_20240508_19250", "patientId": "19250", "name": "北澤雅", "dateOfBirth": "1970-09-02", "admissionDate": "2024-05-08", "dischargeDate": "2025-01-28", "disease": "うつ病、アルコール依存症", "primaryPhysician": "佐伯", "assignedNurse": "波多江", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0052_20240508_17333": {"id": "excel_0052_20240508_17333", "patientId": "17333", "name": "宮脇土喜", "dateOfBirth": "1939-04-20", "admissionDate": "2024-05-08", "dischargeDate": "2024-06-29", "disease": "神経症", "primaryPhysician": "中村", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0053_20240508_19427": {"id": "excel_0053_20240508_19427", "patientId": "19427", "name": "白波瀬和己", "dateOfBirth": "1939-01-03", "admissionDate": "2024-05-08", "dischargeDate": "2024-08-24", "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "大江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0054_20240509_13910": {"id": "excel_0054_20240509_13910", "patientId": "13910", "name": "髙橋廣美", "dateOfBirth": "1946-07-13", "admissionDate": "2024-05-09", "dischargeDate": null, "disease": "うつ病、軽度認知症", "primaryPhysician": "佐伯", "assignedNurse": "瀬戸", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0055_20240509_9887": {"id": "excel_0055_20240509_9887", "patientId": "9887", "name": "田中明", "dateOfBirth": "S53.11.7", "admissionDate": "2024-05-09", "dischargeDate": "2024-06-06", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0056_20240510_19352": {"id": "excel_0056_20240510_19352", "patientId": "19352", "name": "岩嵜洋一", "dateOfBirth": "1969-03-26", "admissionDate": "2024-05-10", "dischargeDate": "2024-05-31", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "筒井", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0057_20240514_13978": {"id": "excel_0057_20240514_13978", "patientId": "13978", "name": "中村長門", "dateOfBirth": "1940-09-24", "admissionDate": "2024-05-14", "dischargeDate": "2024-05-31", "disease": "糖尿病", "primaryPhysician": "深堀", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0058_20240518_6715": {"id": "excel_0058_20240518_6715", "patientId": "6715", "name": "竹本直子", "dateOfBirth": "1973-05-19", "admissionDate": "2024-05-18", "dischargeDate": "2024-06-05", "disease": "反復性うつ病性障害", "primaryPhysician": "深堀", "assignedNurse": "大江", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0059_20240518_18172": {"id": "excel_0059_20240518_18172", "patientId": "18172", "name": "井口保弘", "dateOfBirth": "1970-06-01", "admissionDate": "2024-05-18", "dischargeDate": "2024-05-31", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "古藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0060_20240520_18940": {"id": "excel_0060_20240520_18940", "patientId": "18940", "name": "福井真莉", "dateOfBirth": "1990-02-02", "admissionDate": "2024-05-20", "dischargeDate": "2024-06-22", "disease": "解離性障害、軽度知的障害", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0061_20240520_19442": {"id": "excel_0061_20240520_19442", "patientId": "19442", "name": "山﨑まなみ", "dateOfBirth": "1958-11-22", "admissionDate": "2024-05-20", "dischargeDate": "2024-06-10", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "波多江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0062_20240521_19443": {"id": "excel_0062_20240521_19443", "patientId": "19443", "name": "農口幸子", "dateOfBirth": "1942-06-30", "admissionDate": "2024-05-21", "dischargeDate": "2024-05-25", "disease": "うつ病、認知症", "primaryPhysician": "垣内", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0063_20240521_17610": {"id": "excel_0063_20240521_17610", "patientId": "17610", "name": "古川真由美", "dateOfBirth": "1975-04-23", "admissionDate": "2024-05-21", "dischargeDate": "2024-06-29", "disease": "うつ病、PTSD", "primaryPhysician": "深堀", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0064_20240522_19437": {"id": "excel_0064_20240522_19437", "patientId": "19437", "name": "寺本隆光", "dateOfBirth": "1968-05-05", "admissionDate": "2024-05-22", "dischargeDate": "2024-08-23", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0065_20240523_11639": {"id": "excel_0065_20240523_11639", "patientId": "11639", "name": "古川昭", "dateOfBirth": "1963-12-01", "admissionDate": "2024-05-23", "dischargeDate": "2024-06-20", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "伊藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0066_20240524_3798": {"id": "excel_0066_20240524_3798", "patientId": "3798", "name": "春日正弘", "dateOfBirth": "1951-12-25", "admissionDate": "2024-05-24", "dischargeDate": "2024-06-28", "disease": "統合失調症", "primaryPhysician": "中村", "assignedNurse": "中田", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": "急性増悪"}, "excel_0067_20240529_7039": {"id": "excel_0067_20240529_7039", "patientId": "7039", "name": "鬼木利明", "dateOfBirth": "S35.12.15", "admissionDate": "2024-05-29", "dischargeDate": null, "disease": "SC", "primaryPhysician": "中村", "assignedNurse": "樋口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0068_20240530_15560": {"id": "excel_0068_20240530_15560", "patientId": "15560", "name": "吉田祐美子", "dateOfBirth": "1974-12-17", "admissionDate": "2024-05-30", "dischargeDate": "2024-06-20", "disease": "抑うつ神経症", "primaryPhysician": "石橋", "assignedNurse": "中田", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0069_20240530_15198": {"id": "excel_0069_20240530_15198", "patientId": "15198", "name": "北薗雄一", "dateOfBirth": "1956-04-11", "admissionDate": "2024-05-30", "dischargeDate": "2024-08-05", "disease": "神経症", "primaryPhysician": "深堀", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0070_20240601_13117": {"id": "excel_0070_20240601_13117", "patientId": "13117", "name": "井上多美", "dateOfBirth": "S.57.10.11", "admissionDate": "2024-06-01", "dischargeDate": "2024-06-29", "disease": "解離性障害・双極性障害", "primaryPhysician": "深堀", "assignedNurse": "古藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0071_20240604_17051": {"id": "excel_0071_20240604_17051", "patientId": "17051", "name": "西島京子", "dateOfBirth": "1940-10-12", "admissionDate": "2024-06-04", "dischargeDate": "2024-06-29", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "中野", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0072_20240605_13978": {"id": "excel_0072_20240605_13978", "patientId": "13978", "name": "中村長門", "dateOfBirth": "1940-09-24", "admissionDate": "2024-06-05", "dischargeDate": "2024-06-28", "disease": "糖尿病", "primaryPhysician": "深堀", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0073_20240605_18925": {"id": "excel_0073_20240605_18925", "patientId": "18925", "name": "山本茂喜", "dateOfBirth": "1975-12-26", "admissionDate": "2024-06-05", "dischargeDate": null, "disease": "心因反応", "primaryPhysician": "垣内", "assignedNurse": "筒井", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0074_20240607_6715": {"id": "excel_0074_20240607_6715", "patientId": "6715", "name": "竹本直子", "dateOfBirth": "1973-05-19", "admissionDate": "2024-06-07", "dischargeDate": "2024-08-29", "disease": "反復性うつ病性障害", "primaryPhysician": "深堀", "assignedNurse": "大江", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0075_20240608_9887": {"id": "excel_0075_20240608_9887", "patientId": "9887", "name": "田中明", "dateOfBirth": "S53.11.7", "admissionDate": "2024-06-08", "dischargeDate": "2024-06-20", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0076_20240610_18463": {"id": "excel_0076_20240610_18463", "patientId": "18463", "name": "立山貴子", "dateOfBirth": "1974-03-30", "admissionDate": "2024-06-10", "dischargeDate": "2024-07-29", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "伊藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0077_20240610_18374": {"id": "excel_0077_20240610_18374", "patientId": "18374", "name": "今橋紀子", "dateOfBirth": "1957-09-28", "admissionDate": "2024-06-10", "dischargeDate": "2024-10-08", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0078_20240611_3721": {"id": "excel_0078_20240611_3721", "patientId": "3721", "name": "土谷学", "dateOfBirth": "1968-06-30", "admissionDate": "2024-06-11", "dischargeDate": "2024-09-09", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "波多江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0079_20240611_19110": {"id": "excel_0079_20240611_19110", "patientId": "19110", "name": "西川明美", "dateOfBirth": "2004-09-25", "admissionDate": "2024-06-11", "dischargeDate": "2024-08-31", "disease": "双極性感情障害", "primaryPhysician": "森本", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0080_20240612_19464": {"id": "excel_0080_20240612_19464", "patientId": "19464", "name": "安留正倫", "dateOfBirth": "2000-11-02", "admissionDate": "2024-06-12", "dischargeDate": "2024-06-21", "disease": "適応障害", "primaryPhysician": "藤本", "assignedNurse": "小林", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0081_20240612_19469": {"id": "excel_0081_20240612_19469", "patientId": "19469", "name": "松下智子", "dateOfBirth": "1947-01-02", "admissionDate": "2024-06-12", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0082_20240613_19471": {"id": "excel_0082_20240613_19471", "patientId": "19471", "name": "河邉照夫", "dateOfBirth": "1955-12-09", "admissionDate": "2024-06-13", "dischargeDate": "2024-06-28", "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "筒井", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0083_20240615_16624": {"id": "excel_0083_20240615_16624", "patientId": "16624", "name": "北御門悟", "dateOfBirth": "1994-07-28", "admissionDate": "2024-06-15", "dischargeDate": "2024-07-17", "disease": "非定型うつ病", "primaryPhysician": "深堀", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0084_20240617_19472": {"id": "excel_0084_20240617_19472", "patientId": "19472", "name": "江原巧", "dateOfBirth": "1997-04-15", "admissionDate": "2024-06-17", "dischargeDate": "2024-06-26", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0085_20240620_7383": {"id": "excel_0085_20240620_7383", "patientId": "7383", "name": "西村由佳", "dateOfBirth": "1990-10-05", "admissionDate": "2024-06-20", "dischargeDate": "2024-07-11", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "中田", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0086_20240620_11083": {"id": "excel_0086_20240620_11083", "patientId": "11083", "name": "内野育資", "dateOfBirth": "1984-06-11", "admissionDate": "2024-06-20", "dischargeDate": "2024-09-10", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0087_20240625_19314": {"id": "excel_0087_20240625_19314", "patientId": "19314", "name": "黒瀬亜海", "dateOfBirth": "2003-01-20", "admissionDate": "2024-06-25", "dischargeDate": "2024-07-02", "disease": "不安神経症", "primaryPhysician": "石橋", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0088_20240625_19481": {"id": "excel_0088_20240625_19481", "patientId": "19481", "name": "二本橋広美", "dateOfBirth": "1967-02-19", "admissionDate": "2024-06-25", "dischargeDate": "2024-07-11", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "伊藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0089_20240701_16631": {"id": "excel_0089_20240701_16631", "patientId": "16631", "name": "春木康介", "dateOfBirth": "1967-04-06", "admissionDate": "2024-07-01", "dischargeDate": "2024-07-23", "disease": "うつ病", "primaryPhysician": "中村", "assignedNurse": "中野", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0090_20240701_17186": {"id": "excel_0090_20240701_17186", "patientId": "17186", "name": "井上利明", "dateOfBirth": "1939-03-03", "admissionDate": "2024-07-01", "dischargeDate": "2024-08-24", "disease": "認知症", "primaryPhysician": "佐伯", "assignedNurse": "古藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0091_20240701_16202": {"id": "excel_0091_20240701_16202", "patientId": "16202", "name": "中原寿美子", "dateOfBirth": "1959-02-09", "admissionDate": "2024-07-01", "dischargeDate": "2024-07-31", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "佐々", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0092_20240702_15560": {"id": "excel_0092_20240702_15560", "patientId": "15560", "name": "吉田祐美子", "dateOfBirth": "1974-12-17", "admissionDate": "2024-07-02", "dischargeDate": "2024-07-30", "disease": "抑うつ神経症", "primaryPhysician": "石橋", "assignedNurse": "中田", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0093_20240702_19493": {"id": "excel_0093_20240702_19493", "patientId": "19493", "name": "安達勇太", "dateOfBirth": "1981-09-14", "admissionDate": "2024-07-02", "dischargeDate": "2024-08-01", "disease": "統合失調症", "primaryPhysician": "藤本", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0094_20240703_13978": {"id": "excel_0094_20240703_13978", "patientId": "13978", "name": "中村長門", "dateOfBirth": "1940-09-24", "admissionDate": "2024-07-03", "dischargeDate": "2024-08-31", "disease": "糖尿病", "primaryPhysician": "津留", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0095_20240704_4071": {"id": "excel_0095_20240704_4071", "patientId": "4071", "name": "岩崎希光子", "dateOfBirth": "1961-03-07", "admissionDate": "2024-07-04", "dischargeDate": "2024-08-30", "disease": "統合失調症、知的障害", "primaryPhysician": "藤本", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0096_20240712_17147": {"id": "excel_0096_20240712_17147", "patientId": "17147", "name": "佐藤明", "dateOfBirth": "1966-06-30", "admissionDate": "2024-07-12", "dischargeDate": "2024-09-02", "disease": "双極性障害", "primaryPhysician": "中村", "assignedNurse": "原口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0097_20240716_3677": {"id": "excel_0097_20240716_3677", "patientId": "3677", "name": "吉田朱里", "dateOfBirth": "1977-09-15", "admissionDate": "2024-07-16", "dischargeDate": "2024-10-03", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "古藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0098_20240717_19108": {"id": "excel_0098_20240717_19108", "patientId": "19108", "name": "石津茜音", "dateOfBirth": "1997-11-06", "admissionDate": "2024-07-17", "dischargeDate": "2024-07-22", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "筒井", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0099_20240718_19510": {"id": "excel_0099_20240718_19510", "patientId": "19510", "name": "中本太一", "dateOfBirth": "2002-06-08", "admissionDate": "2024-07-18", "dischargeDate": "2024-08-09", "disease": "適応障害", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0100_20240719_11285": {"id": "excel_0100_20240719_11285", "patientId": "11285", "name": "明石修二", "dateOfBirth": "1954-03-04", "admissionDate": "2024-07-19", "dischargeDate": "2024-07-26", "disease": "アルコール依存症", "primaryPhysician": "中村", "assignedNurse": "瀬戸", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0101_20240720_14880": {"id": "excel_0101_20240720_14880", "patientId": "14880", "name": "森聖美", "dateOfBirth": "1982-08-19", "admissionDate": "2024-07-20", "dischargeDate": "2024-08-09", "disease": "うつ病,パニック障害", "primaryPhysician": "深堀", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0102_20240726_11639": {"id": "excel_0102_20240726_11639", "patientId": "11639", "name": "古川昭", "dateOfBirth": "1963-12-01", "admissionDate": "2024-07-26", "dischargeDate": "2024-08-16", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "中野", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0103_20240727_19522": {"id": "excel_0103_20240727_19522", "patientId": "19522", "name": "吉澤圭子", "dateOfBirth": "1964-04-17", "admissionDate": "2024-07-27", "dischargeDate": "2024-08-08", "disease": "不安神経症", "primaryPhysician": "佐伯", "assignedNurse": "瀬戸", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0104_20240801_13182": {"id": "excel_0104_20240801_13182", "patientId": "13182", "name": "井上菜那", "dateOfBirth": "H12.7.15", "admissionDate": "2024-08-01", "dischargeDate": "2024-10-28", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "中田", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0105_20240802_15522": {"id": "excel_0105_20240802_15522", "patientId": "15522", "name": "松田慎一", "dateOfBirth": "1985-10-15", "admissionDate": "2024-08-02", "dischargeDate": "2024-10-31", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "伊藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0106_20240803_7799": {"id": "excel_0106_20240803_7799", "patientId": "7799", "name": "前田薫", "dateOfBirth": "1969-09-04", "admissionDate": "2024-08-03", "dischargeDate": "2024-08-31", "disease": "双極性障害", "primaryPhysician": "深堀", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0107_20240804_18317": {"id": "excel_0107_20240804_18317", "patientId": "18317", "name": "中尾裕子", "dateOfBirth": "1953-03-20", "admissionDate": "2024-08-04", "dischargeDate": "2024-10-29", "disease": "双極性障害", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0108_20240804_19532": {"id": "excel_0108_20240804_19532", "patientId": "19532", "name": "田代鏡子", "dateOfBirth": "1949-08-23", "admissionDate": "2024-08-04", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0109_20240803_3798": {"id": "excel_0109_20240803_3798", "patientId": "3798", "name": "春日正弘", "dateOfBirth": "1951-12-25", "admissionDate": "2024-08-03", "dischargeDate": "2024-09-11", "disease": "統合失調症", "primaryPhysician": "中村", "assignedNurse": "伊藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0110_20240806_13978": {"id": "excel_0110_20240806_13978", "patientId": "13978", "name": "中村長門", "dateOfBirth": "1940-09-24", "admissionDate": "2024-08-06", "dischargeDate": "2024-08-31", "disease": "糖尿病", "primaryPhysician": "津留", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0111_20240808_16447": {"id": "excel_0111_20240808_16447", "patientId": "16447", "name": "植原大輔", "dateOfBirth": "1997-08-28", "admissionDate": "2024-08-08", "dischargeDate": "2024-08-26", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "小林", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0112_20240809_19535": {"id": "excel_0112_20240809_19535", "patientId": "19535", "name": "倉本佐奈美", "dateOfBirth": "1940-09-25", "admissionDate": "2024-08-09", "dischargeDate": "2024-09-02", "disease": "せん妄疑", "primaryPhysician": "藤本", "assignedNurse": "瀬戸", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0113_20240809_18145": {"id": "excel_0113_20240809_18145", "patientId": "18145", "name": "久保彩加", "dateOfBirth": "1992-01-25", "admissionDate": "2024-08-09", "dischargeDate": "2024-09-02", "disease": "うつ病", "primaryPhysician": "森本", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0114_20240810_19537": {"id": "excel_0114_20240810_19537", "patientId": "19537", "name": "宮内一紀", "dateOfBirth": "1942-06-14", "admissionDate": "2024-08-10", "dischargeDate": "2024-08-27", "disease": "認知症", "primaryPhysician": "藤本", "assignedNurse": "瀬戸", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0115_20240811_19525": {"id": "excel_0115_20240811_19525", "patientId": "19525", "name": "大嶋万里子", "dateOfBirth": "1952-01-18", "admissionDate": "2024-08-11", "dischargeDate": "2024-09-30", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0116_20240821_18898": {"id": "excel_0116_20240821_18898", "patientId": "18898", "name": "若木知惠子", "dateOfBirth": "1967-10-22", "admissionDate": "2024-08-21", "dischargeDate": "2024-10-11", "disease": "統合失調感情障害", "primaryPhysician": "佐伯", "assignedNurse": "瀬戸", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0117_20240821_19548": {"id": "excel_0117_20240821_19548", "patientId": "19548", "name": "平尾映子", "dateOfBirth": "1977-01-25", "admissionDate": "2024-08-21", "dischargeDate": "2024-11-20", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0118_20240822_19117": {"id": "excel_0118_20240822_19117", "patientId": "19117", "name": "畑田麻由", "dateOfBirth": "1982-07-03", "admissionDate": "2024-08-22", "dischargeDate": "2024-11-08", "disease": "パニック障害", "primaryPhysician": "藤本", "assignedNurse": "佐々", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0119_20240902_19553": {"id": "excel_0119_20240902_19553", "patientId": "19553", "name": "進藤睦子", "dateOfBirth": "1960-06-22", "admissionDate": "2024-09-02", "dischargeDate": "2024-11-07", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0120_20240828_19336": {"id": "excel_0120_20240828_19336", "patientId": "19336", "name": "若宮秀斗", "dateOfBirth": "2005-10-06", "admissionDate": "2024-08-28", "dischargeDate": "2024-09-26", "disease": "自閉症スペクトラム", "primaryPhysician": "佐伯", "assignedNurse": "大江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0121_20240828_19480": {"id": "excel_0121_20240828_19480", "patientId": "19480", "name": "加藤大二郎", "dateOfBirth": "1990-02-18", "admissionDate": "2024-08-28", "dischargeDate": "2025-03-17", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "古藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0122_20240902_15198": {"id": "excel_0122_20240902_15198", "patientId": "15198", "name": "北薗雄一", "dateOfBirth": "1956-04-11", "admissionDate": "2024-09-02", "dischargeDate": "2024-10-26", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0123_20240904_5333": {"id": "excel_0123_20240904_5333", "patientId": "5333", "name": "百﨑抑", "dateOfBirth": "1982-04-22", "admissionDate": "2024-09-04", "dischargeDate": "2024-09-11", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "筒井", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0124_20240905_19564": {"id": "excel_0124_20240905_19564", "patientId": "19564", "name": "烏山由美", "dateOfBirth": "1948-06-27", "admissionDate": "2024-09-05", "dischargeDate": "2024-10-30", "disease": "不安障害･抗精神薬依存", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0125_20240905_13978": {"id": "excel_0125_20240905_13978", "patientId": "13978", "name": "中村長門", "dateOfBirth": "1940-09-24", "admissionDate": "2024-09-05", "dischargeDate": "2024-09-30", "disease": "糖尿病", "primaryPhysician": "津留", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0126_20240906_18145": {"id": "excel_0126_20240906_18145", "patientId": "18145", "name": "久保彩加", "dateOfBirth": "1992-01-25", "admissionDate": "2024-09-06", "dischargeDate": "2024-09-28", "disease": "うつ病", "primaryPhysician": "森本", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0127_20240907_19569": {"id": "excel_0127_20240907_19569", "patientId": "19569", "name": "鬼丸静香", "dateOfBirth": "1937-11-25", "admissionDate": "2024-09-07", "dischargeDate": "2024-10-10", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0128_20240909_11126": {"id": "excel_0128_20240909_11126", "patientId": "11126", "name": "原田和子", "dateOfBirth": "1952-06-01", "admissionDate": "2024-09-09", "dischargeDate": "2024-10-02", "disease": "双極性障害", "primaryPhysician": "深堀", "assignedNurse": "瀬戸", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0129_20240910_19574": {"id": "excel_0129_20240910_19574", "patientId": "19574", "name": "宮迫正己", "dateOfBirth": "1928-10-10", "admissionDate": "2024-09-10", "dischargeDate": "2024-10-31", "disease": "老年期精神障害", "primaryPhysician": "石橋", "assignedNurse": "波多江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0130_20240911_16029": {"id": "excel_0130_20240911_16029", "patientId": "16029", "name": "星野みゆき", "dateOfBirth": "S44.4.19", "admissionDate": "2024-09-11", "dischargeDate": "2024-10-05", "disease": "うつ病", "primaryPhysician": "中村", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0131_20240911_19577": {"id": "excel_0131_20240911_19577", "patientId": "19577", "name": "川道継子", "dateOfBirth": "1955-12-15", "admissionDate": "2024-09-11", "dischargeDate": "2024-10-30", "disease": "うつ病", "primaryPhysician": "垣内", "assignedNurse": "大江", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0132_20240913_19582": {"id": "excel_0132_20240913_19582", "patientId": "19582", "name": "近藤弘美", "dateOfBirth": "1970-02-03", "admissionDate": "2024-09-13", "dischargeDate": "2024-10-09", "disease": "うつ病", "primaryPhysician": "中村", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0133_20240914_18065": {"id": "excel_0133_20240914_18065", "patientId": "18065", "name": "小森海人", "dateOfBirth": "1995-03-27", "admissionDate": "2024-09-14", "dischargeDate": "2024-10-28", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "伊藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0134_20240918_19590": {"id": "excel_0134_20240918_19590", "patientId": "19590", "name": "仲尾さえ子", "dateOfBirth": "1948-08-18", "admissionDate": "2024-09-18", "dischargeDate": null, "disease": "急性一過性精神病性障害", "primaryPhysician": "佐伯", "assignedNurse": "筒井", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0135_20240919_19142": {"id": "excel_0135_20240919_19142", "patientId": "19142", "name": "山﨑まなみ", "dateOfBirth": "1958-11-22", "admissionDate": "2024-09-19", "dischargeDate": "2024-10-10", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0136_20240924_18421": {"id": "excel_0136_20240924_18421", "patientId": "18421", "name": "橋本陽和", "dateOfBirth": "2009-03-12", "admissionDate": "2024-09-24", "dischargeDate": "2024-09-30", "disease": "抑うつ状態", "primaryPhysician": "森本", "assignedNurse": "中田", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0137_20240930_19507": {"id": "excel_0137_20240930_19507", "patientId": "19507", "name": "石川澄子", "dateOfBirth": "1948-11-19", "admissionDate": "2024-09-30", "dischargeDate": null, "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0138_20240930_19597": {"id": "excel_0138_20240930_19597", "patientId": "19597", "name": "坂田愛菜", "dateOfBirth": "2001-01-03", "admissionDate": "2024-09-30", "dischargeDate": "2024-10-09", "disease": "不安障害、身体性表現性障害", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0139_20241002_14952": {"id": "excel_0139_20241002_14952", "patientId": "14952", "name": "白川和魅", "dateOfBirth": "1987-08-21", "admissionDate": "2024-10-02", "dischargeDate": "2024-10-29", "disease": "うつ病、アルコール依存症", "primaryPhysician": "深堀", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0140_20241002_18508": {"id": "excel_0140_20241002_18508", "patientId": "18508", "name": "姫野真友子", "dateOfBirth": "2010-03-27", "admissionDate": "2024-10-02", "dischargeDate": "2024-10-07", "disease": "適応障害,ADHD", "primaryPhysician": "森本", "assignedNurse": "大江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0141_20241002_19610": {"id": "excel_0141_20241002_19610", "patientId": "19610", "name": "岡田真明", "dateOfBirth": "1994-06-08", "admissionDate": "2024-10-02", "dischargeDate": "2025-04-04", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0142_20241003_19611": {"id": "excel_0142_20241003_19611", "patientId": "19611", "name": "チュ　ジュンヤン", "dateOfBirth": "1997-06-26", "admissionDate": "2024-10-03", "dischargeDate": "2024-10-14", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0143_20241005_7249": {"id": "excel_0143_20241005_7249", "patientId": "7249", "name": "梨本康代", "dateOfBirth": "1986-01-16", "admissionDate": "2024-10-05", "dischargeDate": "2024-10-19", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0144_20241005_19058": {"id": "excel_0144_20241005_19058", "patientId": "19058", "name": "中村寛子", "dateOfBirth": "1972-10-08", "admissionDate": "2024-10-05", "dischargeDate": "2024-12-14", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "佐々", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0145_20241010_19619": {"id": "excel_0145_20241010_19619", "patientId": "19619", "name": "星丸夕美", "dateOfBirth": "1975-08-07", "admissionDate": "2024-10-10", "dischargeDate": null, "disease": "急性一過性精神病性障害", "primaryPhysician": "佐伯", "assignedNurse": "大江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0146_20241010_6419": {"id": "excel_0146_20241010_6419", "patientId": "6419", "name": "中島セツ子", "dateOfBirth": "1956-11-14", "admissionDate": "2024-10-10", "dischargeDate": "2024-12-16", "disease": "双極性感情障害", "primaryPhysician": "佐伯", "assignedNurse": "佐々", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0147_20241011_9400": {"id": "excel_0147_20241011_9400", "patientId": "9400", "name": "大坪剛", "dateOfBirth": "1967-04-05", "admissionDate": "2024-10-11", "dischargeDate": "2024-10-17", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "瀬戸", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0148_20241012_18940": {"id": "excel_0148_20241012_18940", "patientId": "18940", "name": "福井真莉", "dateOfBirth": "1990-02-02", "admissionDate": "2024-10-12", "dischargeDate": "2024-11-06", "disease": "解離性障害、軽度知的障害", "primaryPhysician": "佐伯", "assignedNurse": "瀬戸", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0149_20241015_3721": {"id": "excel_0149_20241015_3721", "patientId": "3721", "name": "土谷学", "dateOfBirth": "1968-06-30", "admissionDate": "2024-10-15", "dischargeDate": "2025-06-17", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "中野", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0150_20241016_14079": {"id": "excel_0150_20241016_14079", "patientId": "14079", "name": "大谷昂輝", "dateOfBirth": "1991-10-04", "admissionDate": "2024-10-16", "dischargeDate": "2024-10-18", "disease": "双極性障害、ASD", "primaryPhysician": "藤本", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0151_20241017_19628": {"id": "excel_0151_20241017_19628", "patientId": "19628", "name": "加藤　ゆうな", "dateOfBirth": "2002-12-18", "admissionDate": "2024-10-17", "dischargeDate": "2024-10-21", "disease": "双極性障害、軽度知的障害", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0152_20241017_12870": {"id": "excel_0152_20241017_12870", "patientId": "12870", "name": "前田哲也", "dateOfBirth": "1966-01-01", "admissionDate": "2024-10-17", "dischargeDate": "2024-10-31", "disease": "アルコール依存症、うつ病", "primaryPhysician": "石橋", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0153_20241018_19621": {"id": "excel_0153_20241018_19621", "patientId": "19621", "name": "石井繁子", "dateOfBirth": "1934-04-24", "admissionDate": "2024-10-18", "dischargeDate": "2024-12-23", "disease": "うつ病疑い", "primaryPhysician": "藤本", "assignedNurse": "瀬戸", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0154_20241021_8564": {"id": "excel_0154_20241021_8564", "patientId": "8564", "name": "冨永ゆり子", "dateOfBirth": "S30.2.12", "admissionDate": "2024-10-21", "dischargeDate": "2024-12-02", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0155_20241021_12252": {"id": "excel_0155_20241021_12252", "patientId": "12252", "name": "眞武順子", "dateOfBirth": "1940-07-18", "admissionDate": "2024-10-21", "dischargeDate": "2024-10-22", "disease": "不安障害", "primaryPhysician": "藤本", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0156_20241023_5651": {"id": "excel_0156_20241023_5651", "patientId": "5651", "name": "内田一郎", "dateOfBirth": "1974-10-29", "admissionDate": "2024-10-23", "dischargeDate": "2025-02-07", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0157_20241023_6099": {"id": "excel_0157_20241023_6099", "patientId": "6099", "name": "豊田新晃", "dateOfBirth": "1967-01-14", "admissionDate": "2024-10-23", "dischargeDate": "2024-11-29", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0158_20241024_18871": {"id": "excel_0158_20241024_18871", "patientId": "18871", "name": "松本宏予", "dateOfBirth": "1965-05-14", "admissionDate": "2024-10-24", "dischargeDate": "2024-11-15", "disease": "統合失調感情障害", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0159_20241028_3798": {"id": "excel_0159_20241028_3798", "patientId": "3798", "name": "春日正弘", "dateOfBirth": "1951-12-25", "admissionDate": "2024-10-28", "dischargeDate": "2024-11-28", "disease": "統合失調症", "primaryPhysician": "中村", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": "出来高"}, "excel_0160_20241031_19198": {"id": "excel_0160_20241031_19198", "patientId": "19198", "name": "高橋静子", "dateOfBirth": "1946-10-31", "admissionDate": "2024-10-31", "dischargeDate": "2024-11-14", "disease": "うつ病", "primaryPhysician": "石橋", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0161_20241030_11357": {"id": "excel_0161_20241030_11357", "patientId": "11357", "name": "井上純一", "dateOfBirth": "1984-04-01", "admissionDate": "2024-10-30", "dischargeDate": "2024-10-31", "disease": "急性一過性精神病性障害", "primaryPhysician": "佐伯", "assignedNurse": "吉田", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0162_20241101_17410": {"id": "excel_0162_20241101_17410", "patientId": "17410", "name": "三山美羽", "dateOfBirth": "2001-02-28", "admissionDate": "2024-11-01", "dischargeDate": "2024-11-22", "disease": "適応障害", "primaryPhysician": "森本", "assignedNurse": "波多江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0163_20241102_18145": {"id": "excel_0163_20241102_18145", "patientId": "18145", "name": "久保彩加", "dateOfBirth": "1992-01-25", "admissionDate": "2024-11-02", "dischargeDate": "2024-11-19", "disease": "うつ病", "primaryPhysician": "森本", "assignedNurse": "大江", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0164_20241102_14284": {"id": "excel_0164_20241102_14284", "patientId": "14284", "name": "結城巧磨", "dateOfBirth": "1993-02-11", "admissionDate": "2024-11-02", "dischargeDate": "2024-11-29", "disease": "知的障害", "primaryPhysician": "中村", "assignedNurse": "中田", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0165_20241106_9515": {"id": "excel_0165_20241106_9515", "patientId": "9515", "name": "小関真由美", "dateOfBirth": "S52.3.26", "admissionDate": "2024-11-06", "dischargeDate": "2024-11-20", "disease": "神経症、適応障害", "primaryPhysician": "深堀", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0166_20241107_19636": {"id": "excel_0166_20241107_19636", "patientId": "19636", "name": "宇薄勝義", "dateOfBirth": "1963-02-16", "admissionDate": "2024-11-07", "dischargeDate": "2024-12-06", "disease": "うつ状態、DM、HT等", "primaryPhysician": "藤本", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0167_20241108_17657": {"id": "excel_0167_20241108_17657", "patientId": "17657", "name": "月俣恭子", "dateOfBirth": "1992-01-23", "admissionDate": "2024-11-08", "dischargeDate": "2024-11-30", "disease": "うつ病", "primaryPhysician": "中村", "assignedNurse": "瀬戸", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0168_20241109_18571": {"id": "excel_0168_20241109_18571", "patientId": "18571", "name": "冨永　紀子", "dateOfBirth": "1984-11-03", "admissionDate": "2024-11-09", "dischargeDate": "2025-02-07", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "佐々", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0169_20241111_19572": {"id": "excel_0169_20241111_19572", "patientId": "19572", "name": "宮本準子", "dateOfBirth": "1933-01-26", "admissionDate": "2024-11-11", "dischargeDate": "2024-11-18", "disease": "アルツハイマー型認知症", "primaryPhysician": "深堀", "assignedNurse": "筒井", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0170_20241112_13662": {"id": "excel_0170_20241112_13662", "patientId": "13662", "name": "清水文子", "dateOfBirth": "1957-04-02", "admissionDate": "2024-11-12", "dischargeDate": "2024-12-21", "disease": "うつ病", "primaryPhysician": "石橋", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0171_20241113_12257": {"id": "excel_0171_20241113_12257", "patientId": "12257", "name": "有園一彦", "dateOfBirth": "1953-11-25", "admissionDate": "2024-11-13", "dischargeDate": "2024-12-26", "disease": "双極性障害", "primaryPhysician": "深堀", "assignedNurse": "原口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0172_20241113_19654": {"id": "excel_0172_20241113_19654", "patientId": "19654", "name": "小淵陽喜", "dateOfBirth": "1946-03-16", "admissionDate": "2024-11-13", "dischargeDate": "2025-01-21", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "大江", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0173_20241114_5645": {"id": "excel_0173_20241114_5645", "patientId": "5645", "name": "豊田直人", "dateOfBirth": "1967-01-14", "admissionDate": "2024-11-14", "dischargeDate": "2024-12-14", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0174_20241118_19661": {"id": "excel_0174_20241118_19661", "patientId": "19661", "name": "梶原康弘", "dateOfBirth": "1946-11-05", "admissionDate": "2024-11-18", "dischargeDate": null, "disease": "脳血管性認知症", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0175_20241119_15560": {"id": "excel_0175_20241119_15560", "patientId": "15560", "name": "吉田祐美子", "dateOfBirth": "1974-12-17", "admissionDate": "2024-11-19", "dischargeDate": "2024-12-11", "disease": "抑うつ神経症", "primaryPhysician": "石橋", "assignedNurse": "筒井", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0176_20241120_16221": {"id": "excel_0176_20241120_16221", "patientId": "16221", "name": "川越まり子", "dateOfBirth": "1961-02-20", "admissionDate": "2024-11-20", "dischargeDate": null, "disease": "不安神経症", "primaryPhysician": "藤本", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0177_20241120_12252": {"id": "excel_0177_20241120_12252", "patientId": "12252", "name": "眞武順子", "dateOfBirth": "1940-07-18", "admissionDate": "2024-11-20", "dischargeDate": "2024-11-25", "disease": "不安障害", "primaryPhysician": "深堀", "assignedNurse": "大江", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0178_20241122_19669": {"id": "excel_0178_20241122_19669", "patientId": "19669", "name": "田坂一彦", "dateOfBirth": "1969-04-01", "admissionDate": "2024-11-22", "dischargeDate": "2025-01-14", "disease": "知的障害", "primaryPhysician": "藤本", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0179_20241125_14247": {"id": "excel_0179_20241125_14247", "patientId": "14247", "name": "末松青空", "dateOfBirth": "1998-11-22", "admissionDate": "2024-11-25", "dischargeDate": "2024-12-23", "disease": "適応障害", "primaryPhysician": "森本", "assignedNurse": "蒲原", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0180_20241127_19676": {"id": "excel_0180_20241127_19676", "patientId": "19676", "name": "宮脇富美子", "dateOfBirth": "1947-02-18", "admissionDate": "2024-11-27", "dischargeDate": null, "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "大江", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0181_20241127_19648": {"id": "excel_0181_20241127_19648", "patientId": "19648", "name": "坂井智弘", "dateOfBirth": "1980-12-30", "admissionDate": "2024-11-27", "dischargeDate": "2025-01-22", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0182_20241130_12708": {"id": "excel_0182_20241130_12708", "patientId": "12708", "name": "小池奈々", "dateOfBirth": "S59.7.13", "admissionDate": "2024-11-30", "dischargeDate": "2024-12-21", "disease": "身体因性うつ病", "primaryPhysician": "深堀", "assignedNurse": "小林", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0183_20241202_14876": {"id": "excel_0183_20241202_14876", "patientId": "14876", "name": "岡美代子", "dateOfBirth": "1967-08-05", "admissionDate": "2024-12-02", "dischargeDate": "2025-01-31", "disease": "アルコール依存症、肺高血圧症", "primaryPhysician": "深堀", "assignedNurse": "波多江", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0184_20241202_19087": {"id": "excel_0184_20241202_19087", "patientId": "19087", "name": "岡八代美", "dateOfBirth": "1964-08-30", "admissionDate": "2024-12-02", "dischargeDate": "2025-02-28", "disease": "アルコール依存症", "primaryPhysician": "深堀", "assignedNurse": "中田", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0185_20241202_8753": {"id": "excel_0185_20241202_8753", "patientId": "8753", "name": "有田慶子", "dateOfBirth": "1972-10-15", "admissionDate": "2024-12-02", "dischargeDate": "2025-03-29", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0186_20241202_19680": {"id": "excel_0186_20241202_19680", "patientId": "19680", "name": "北島慎一", "dateOfBirth": "1938-06-29", "admissionDate": "2024-12-02", "dischargeDate": "2024-12-16", "disease": "ASD、胆のう摘出術後", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0187_20241204_17410": {"id": "excel_0187_20241204_17410", "patientId": "17410", "name": "三山美羽", "dateOfBirth": "2001-02-28", "admissionDate": "2024-12-04", "dischargeDate": "2025-01-27", "disease": "適応障害", "primaryPhysician": "森本", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0188_20241204_18950": {"id": "excel_0188_20241204_18950", "patientId": "18950", "name": "廣司正子", "dateOfBirth": "1975-01-27", "admissionDate": "2024-12-04", "dischargeDate": "2025-01-10", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "古藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0189_20241216_19636": {"id": "excel_0189_20241216_19636", "patientId": "19636", "name": "宇薄勝義", "dateOfBirth": "1963-02-16", "admissionDate": "2024-12-16", "dischargeDate": "2025-01-15", "disease": "うつ病", "primaryPhysician": "藤本", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0190_20241212_16221": {"id": "excel_0190_20241212_16221", "patientId": "16221", "name": "川越まり子", "dateOfBirth": "1961-02-20", "admissionDate": "2024-12-12", "dischargeDate": "2025-02-07", "disease": "急性一過性精神病性障害", "primaryPhysician": "藤本", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0191_20241209_9887": {"id": "excel_0191_20241209_9887", "patientId": "9887", "name": "田中明", "dateOfBirth": "S53.11.7", "admissionDate": "2024-12-09", "dischargeDate": "2025-01-08", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "筒井", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0192_20241211_17333": {"id": "excel_0192_20241211_17333", "patientId": "17333", "name": "宮脇土喜", "dateOfBirth": "1939-04-20", "admissionDate": "2024-12-11", "dischargeDate": "2025-02-17", "disease": "神経症", "primaryPhysician": "中村", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0193_20241211_19691": {"id": "excel_0193_20241211_19691", "patientId": "19691", "name": "髙鍋　博子", "dateOfBirth": "1959-02-07", "admissionDate": "2024-12-11", "dischargeDate": "2025-05-16", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "大江", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0194_20241207_19615": {"id": "excel_0194_20241207_19615", "patientId": "19615", "name": "大島　令", "dateOfBirth": "1980-02-16", "admissionDate": "2024-12-07", "dischargeDate": "2025-02-20", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0195_20241209_19686": {"id": "excel_0195_20241209_19686", "patientId": "19686", "name": "野田　榮子", "dateOfBirth": "1941-08-30", "admissionDate": "2024-12-09", "dischargeDate": "2024-12-23", "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0196_20241218_19702": {"id": "excel_0196_20241218_19702", "patientId": "19702", "name": "今村百花", "dateOfBirth": "1998-06-02", "admissionDate": "2024-12-18", "dischargeDate": "2024-12-25", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0197_20241220_19705": {"id": "excel_0197_20241220_19705", "patientId": "19705", "name": "安河内たえ子", "dateOfBirth": "1952-02-23", "admissionDate": "2024-12-20", "dischargeDate": "2025-03-19", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0198_20241223_19706": {"id": "excel_0198_20241223_19706", "patientId": "19706", "name": "吉岡祐世", "dateOfBirth": "1985-08-23", "admissionDate": "2024-12-23", "dischargeDate": "2025-01-31", "disease": "適応障害", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0199_20241225_16624": {"id": "excel_0199_20241225_16624", "patientId": "16624", "name": "北御門悟", "dateOfBirth": "1994-07-28", "admissionDate": "2024-12-25", "dischargeDate": "2025-01-24", "disease": "非定型うつ病", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0200_20241225_19698": {"id": "excel_0200_20241225_19698", "patientId": "19698", "name": "笹沼賢史", "dateOfBirth": "1963-05-11", "admissionDate": "2024-12-25", "dischargeDate": "2025-01-07", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "瀬戸", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0201_20241227_19686": {"id": "excel_0201_20241227_19686", "patientId": "19686", "name": "野田　榮子", "dateOfBirth": "1941-08-30", "admissionDate": "2024-12-27", "dischargeDate": "2025-01-11", "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0202_20250106_19681": {"id": "excel_0202_20250106_19681", "patientId": "19681", "name": "角直人", "dateOfBirth": "1992-06-09", "admissionDate": "2025-01-06", "dischargeDate": "2025-01-20", "disease": "うつ病", "primaryPhysician": "藤本", "assignedNurse": "原口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0203_20250108_19715": {"id": "excel_0203_20250108_19715", "patientId": "19715", "name": "岩村美保子", "dateOfBirth": "1938-02-02", "admissionDate": "2025-01-08", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "古藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0204_20250111_14350": {"id": "excel_0204_20250111_14350", "patientId": "14350", "name": "上江洲ひとみ", "dateOfBirth": "1998-11-12", "admissionDate": "2025-01-11", "dischargeDate": "2025-03-10", "disease": "うつ病", "primaryPhysician": "森本", "assignedNurse": "瀬戸", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0205_20250115_19720": {"id": "excel_0205_20250115_19720", "patientId": "19720", "name": "薄　武志", "dateOfBirth": "1970-03-23", "admissionDate": "2025-01-15", "dischargeDate": "2025-04-11", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "中田", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0206_20250117_14247": {"id": "excel_0206_20250117_14247", "patientId": "14247", "name": "末松青空", "dateOfBirth": "1998-11-22", "admissionDate": "2025-01-17", "dischargeDate": "2025-02-28", "disease": "適応障害", "primaryPhysician": "森本", "assignedNurse": "蒲原", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0207_20250121_15560": {"id": "excel_0207_20250121_15560", "patientId": "15560", "name": "吉田祐美子", "dateOfBirth": "1974-12-17", "admissionDate": "2025-01-21", "dischargeDate": "2025-02-18", "disease": "抑うつ神経症", "primaryPhysician": "石橋", "assignedNurse": "佐々", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0208_20250122_9887": {"id": "excel_0208_20250122_9887", "patientId": "9887", "name": "田中明", "dateOfBirth": "S53.11.7", "admissionDate": "2025-01-22", "dischargeDate": "2025-02-19", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "筒井", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0209_20250127_19731": {"id": "excel_0209_20250127_19731", "patientId": "19731", "name": "田村柊斗", "dateOfBirth": "1998-12-07", "admissionDate": "2025-01-27", "dischargeDate": "2025-02-28", "disease": "双極性感情障害", "primaryPhysician": "佐伯", "assignedNurse": "大江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0210_20250129_5645": {"id": "excel_0210_20250129_5645", "patientId": "5645", "name": "豊田直人", "dateOfBirth": "1967-01-14", "admissionDate": "2025-01-29", "dischargeDate": "2025-04-17", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0211_20250131_19738": {"id": "excel_0211_20250131_19738", "patientId": "19738", "name": "宗清", "dateOfBirth": "1945-05-28", "admissionDate": "2025-01-31", "dischargeDate": null, "disease": "急性アルコール中毒・アルコール離脱せん妄", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0212_20250131_17513": {"id": "excel_0212_20250131_17513", "patientId": "17513", "name": "細川はるな", "dateOfBirth": "2001-07-14", "admissionDate": "2025-01-31", "dischargeDate": "2025-02-08", "disease": "身体表現性障害", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0213_20250201_19493": {"id": "excel_0213_20250201_19493", "patientId": "19493", "name": "安達勇太", "dateOfBirth": "1981-09-14", "admissionDate": "2025-02-01", "dischargeDate": "2025-02-28", "disease": "統合失調症", "primaryPhysician": "藤本", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0214_20250203_19669": {"id": "excel_0214_20250203_19669", "patientId": "19669", "name": "田坂一彦", "dateOfBirth": "1969-04-01", "admissionDate": "2025-02-03", "dischargeDate": null, "disease": "知的障害", "primaryPhysician": "藤本", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0215_20250203_17343": {"id": "excel_0215_20250203_17343", "patientId": "17343", "name": "浦瀬真琴", "dateOfBirth": "1990-02-06", "admissionDate": "2025-02-03", "dischargeDate": "2025-03-05", "disease": "アルコール依存症", "primaryPhysician": "中村", "assignedNurse": "瀬戸", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0216_20250207_18950": {"id": "excel_0216_20250207_18950", "patientId": "18950", "name": "廣司正子", "dateOfBirth": "1975-01-27", "admissionDate": "2025-02-07", "dischargeDate": "2025-05-02", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0217_20250210_6274": {"id": "excel_0217_20250210_6274", "patientId": "6274", "name": "三好遥", "dateOfBirth": "1983-11-13", "admissionDate": "2025-02-10", "dischargeDate": "2025-03-03", "disease": "摂食障害", "primaryPhysician": "森本", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0218_20250212_6099": {"id": "excel_0218_20250212_6099", "patientId": "6099", "name": "豊田新晃", "dateOfBirth": "1967-01-14", "admissionDate": "2025-02-12", "dischargeDate": "2025-05-22", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0219_20250221_19756": {"id": "excel_0219_20250221_19756", "patientId": "19756", "name": "多田敬子", "dateOfBirth": "1946-11-02", "admissionDate": "2025-02-21", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0220_20250221_19758": {"id": "excel_0220_20250221_19758", "patientId": "19758", "name": "花田芳枝", "dateOfBirth": "1941-01-12", "admissionDate": "2025-02-21", "dischargeDate": "2025-05-17", "disease": "妄想性障害", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0221_20250221_19757": {"id": "excel_0221_20250221_19757", "patientId": "19757", "name": "花田隆蔵", "dateOfBirth": "1980-10-28", "admissionDate": "2025-02-21", "dischargeDate": null, "disease": "認知症", "primaryPhysician": "佐伯", "assignedNurse": "瀬戸", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0222_20250227_19766": {"id": "excel_0222_20250227_19766", "patientId": "19766", "name": "白水洋子", "dateOfBirth": "1935-03-30", "admissionDate": "2025-02-27", "dischargeDate": "2025-05-24", "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0223_20250227_19769": {"id": "excel_0223_20250227_19769", "patientId": "19769", "name": "玉田有巨", "dateOfBirth": "1932-07-25", "admissionDate": "2025-02-27", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "佐々", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0224_20250306_19774": {"id": "excel_0224_20250306_19774", "patientId": "19774", "name": "森田一美", "dateOfBirth": "1948-02-08", "admissionDate": "2025-03-06", "dischargeDate": null, "disease": "認知症疑、双極性感情障害疑", "primaryPhysician": "髙橋", "assignedNurse": "古藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0225_20250306_19775": {"id": "excel_0225_20250306_19775", "patientId": "19775", "name": "田中秀夫", "dateOfBirth": "1948-02-26", "admissionDate": "2025-03-06", "dischargeDate": "2025-06-04", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0226_20250310_3798": {"id": "excel_0226_20250310_3798", "patientId": "3798", "name": "春日正弘", "dateOfBirth": "1951-12-25", "admissionDate": "2025-03-10", "dischargeDate": "2025-04-04", "disease": "統合失調症.パーキンソン", "primaryPhysician": "中村", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0227_20250310_17657": {"id": "excel_0227_20250310_17657", "patientId": "17657", "name": "月俣恭子", "dateOfBirth": "1992-01-23", "admissionDate": "2025-03-10", "dischargeDate": "2025-03-22", "disease": "うつ病", "primaryPhysician": "髙橋", "assignedNurse": "中野", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0228_20250310_19777": {"id": "excel_0228_20250310_19777", "patientId": "19777", "name": "長谷川節子", "dateOfBirth": "1945-11-03", "admissionDate": "2025-03-10", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0229_20250311_13978": {"id": "excel_0229_20250311_13978", "patientId": "13978", "name": "中村長門", "dateOfBirth": "1940-09-24", "admissionDate": "2025-03-11", "dischargeDate": "2025-03-31", "disease": "神経症", "primaryPhysician": "津留", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0230_20250311_18172": {"id": "excel_0230_20250311_18172", "patientId": "18172", "name": "井口保弘", "dateOfBirth": "1970-06-01", "admissionDate": "2025-03-11", "dischargeDate": "2025-03-27", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "古藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0231_20250311_17698": {"id": "excel_0231_20250311_17698", "patientId": "17698", "name": "井口史", "dateOfBirth": "1975-06-06", "admissionDate": "2025-03-11", "dischargeDate": "2025-03-27", "disease": "気分変調証", "primaryPhysician": "深堀", "assignedNurse": "大江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0232_20250311_16221": {"id": "excel_0232_20250311_16221", "patientId": "16221", "name": "川越まり子", "dateOfBirth": "1961-02-20", "admissionDate": "2025-03-11", "dischargeDate": "2025-05-07", "disease": "不安神経症", "primaryPhysician": "藤本", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0233_20250312_5651": {"id": "excel_0233_20250312_5651", "patientId": "5651", "name": "内田一郎", "dateOfBirth": "1974-10-29", "admissionDate": "2025-03-12", "dischargeDate": "2025-06-19", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0234_20250313_18949": {"id": "excel_0234_20250313_18949", "patientId": "18949", "name": "内田こころ", "dateOfBirth": "2004-03-12", "admissionDate": "2025-03-13", "dischargeDate": "2025-03-15", "disease": "適応障害", "primaryPhysician": "森本", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0235_20250313_16968": {"id": "excel_0235_20250313_16968", "patientId": "16968", "name": "脇山明美", "dateOfBirth": "1960-12-02", "admissionDate": "2025-03-13", "dischargeDate": "2025-05-21", "disease": "抑うつ状態", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0236_20250217_19750": {"id": "excel_0236_20250217_19750", "patientId": "19750", "name": "才川幹夫", "dateOfBirth": "1948-07-15", "admissionDate": "2025-02-17", "dischargeDate": null, "disease": "", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0237_20250129_19710": {"id": "excel_0237_20250129_19710", "patientId": "19710", "name": "田中秀秋", "dateOfBirth": "1950-12-23", "admissionDate": "2025-01-29", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0238_20250315_19780": {"id": "excel_0238_20250315_19780", "patientId": "19780", "name": "田中幸子", "dateOfBirth": "1948-01-02", "admissionDate": "2025-03-15", "dischargeDate": "2025-05-17", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "瀬戸", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0239_20250317_6274": {"id": "excel_0239_20250317_6274", "patientId": "6274", "name": "三好遥", "dateOfBirth": "1983-11-13", "admissionDate": "2025-03-17", "dischargeDate": "2025-04-11", "disease": "摂食障害", "primaryPhysician": "森本", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0240_20250321_19786": {"id": "excel_0240_20250321_19786", "patientId": "19786", "name": "中西英輝", "dateOfBirth": "1945-09-27", "admissionDate": "2025-03-21", "dischargeDate": null, "disease": "統合失調パーソナリティ症", "primaryPhysician": "佐伯", "assignedNurse": "中野", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0241_20250321_19787": {"id": "excel_0241_20250321_19787", "patientId": "19787", "name": "岩永晃子", "dateOfBirth": "1975-01-12", "admissionDate": "2025-03-21", "dischargeDate": "2025-03-25", "disease": "双極性感情障害", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0242_20250324_14880": {"id": "excel_0242_20250324_14880", "patientId": "14880", "name": "森聖美", "dateOfBirth": "1982-08-19", "admissionDate": "2025-03-24", "dischargeDate": "2025-04-10", "disease": "うつ病,パニック障害", "primaryPhysician": "深堀", "assignedNurse": "大江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0243_20250325_885": {"id": "excel_0243_20250325_885", "patientId": "885", "name": "柴田フミ子", "dateOfBirth": "1936-01-26", "admissionDate": "2025-03-25", "dischargeDate": "2025-05-28", "disease": "認知症", "primaryPhysician": "中村", "assignedNurse": "原口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0244_20250326_19250": {"id": "excel_0244_20250326_19250", "patientId": "19250", "name": "北澤雅", "dateOfBirth": "1970-09-02", "admissionDate": "2025-03-26", "dischargeDate": null, "disease": "うつ病、アルコール依存症", "primaryPhysician": "佐伯", "assignedNurse": "佐々", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": "急性増悪"}, "excel_0245_20250326_19791": {"id": "excel_0245_20250326_19791", "patientId": "19791", "name": "窪田琢郎", "dateOfBirth": "1960-02-15", "admissionDate": "2025-03-26", "dischargeDate": null, "disease": "アルコール依存症", "primaryPhysician": "藤本", "assignedNurse": "中野", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0246_20250326_1053": {"id": "excel_0246_20250326_1053", "patientId": "1053", "name": "徳永孝子", "dateOfBirth": "1941-09-23", "admissionDate": "2025-03-26", "dischargeDate": "2025-03-27", "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0247_20250328_19794": {"id": "excel_0247_20250328_19794", "patientId": "19794", "name": "山﨑洋子", "dateOfBirth": "1951-12-04", "admissionDate": "2025-03-28", "dischargeDate": "2025-05-31", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0248_20250407_19493": {"id": "excel_0248_20250407_19493", "patientId": "19493", "name": "安達勇太", "dateOfBirth": "1981-09-14", "admissionDate": "2025-04-07", "dischargeDate": "2025-05-08", "disease": "統合失調症", "primaryPhysician": "藤本", "assignedNurse": "樋口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": "急性増悪"}, "excel_0249_20250408_18898": {"id": "excel_0249_20250408_18898", "patientId": "18898", "name": "若木知惠子", "dateOfBirth": "1967-10-22", "admissionDate": "2025-04-08", "dischargeDate": "2025-06-28", "disease": "統合失調感情障害", "primaryPhysician": "佐伯", "assignedNurse": "伊藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0250_20250409_18172": {"id": "excel_0250_20250409_18172", "patientId": "18172", "name": "井口保弘", "dateOfBirth": "1970-06-01", "admissionDate": "2025-04-09", "dischargeDate": "2025-04-16", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "大江", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": "急性増悪"}, "excel_0251_20250409_19798": {"id": "excel_0251_20250409_19798", "patientId": "19798", "name": "吉浦康", "dateOfBirth": "1949-05-05", "admissionDate": "2025-04-09", "dischargeDate": "2025-07-02", "disease": "", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0252_20250412_19654": {"id": "excel_0252_20250412_19654", "patientId": "19654", "name": "小淵陽喜", "dateOfBirth": "1946-03-16", "admissionDate": "2025-04-12", "dischargeDate": "2025-06-25", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "大江", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0253_20250221_9887": {"id": "excel_0253_20250221_9887", "patientId": "9887", "name": "田中明", "dateOfBirth": "S53.11.7", "admissionDate": "2025-02-21", "dischargeDate": "2025-03-19", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "筒井", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0254_20250414_9887": {"id": "excel_0254_20250414_9887", "patientId": "9887", "name": "田中明", "dateOfBirth": "S53.11.7", "admissionDate": "2025-04-14", "dischargeDate": "2025-05-13", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "伊藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0255_20250414_13896": {"id": "excel_0255_20250414_13896", "patientId": "13896", "name": "永島理沙", "dateOfBirth": "2000-11-21", "admissionDate": "2025-04-14", "dischargeDate": "2025-04-18", "disease": "双極性障害", "primaryPhysician": "藤本", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0256_20250417_18145": {"id": "excel_0256_20250417_18145", "patientId": "18145", "name": "久保彩加", "dateOfBirth": "1992-01-25", "admissionDate": "2025-04-17", "dischargeDate": "2025-05-12", "disease": "うつ病", "primaryPhysician": "森本", "assignedNurse": "大江", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0257_20250418_5881": {"id": "excel_0257_20250418_5881", "patientId": "5881", "name": "三好千草", "dateOfBirth": "Ｓ60.11.16", "admissionDate": "2025-04-18", "dischargeDate": "2025-05-16", "disease": "うつ病、適応障害", "primaryPhysician": "森本", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0258_20250419_7358": {"id": "excel_0258_20250419_7358", "patientId": "7358", "name": "栗元和歌子", "dateOfBirth": "1973-01-08", "admissionDate": "2025-04-19", "dischargeDate": "2025-06-05", "disease": "統合失調症", "primaryPhysician": "髙橋", "assignedNurse": "中野", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0259_20250421_18482": {"id": "excel_0259_20250421_18482", "patientId": "18482", "name": "立石禮子", "dateOfBirth": "1952-08-12", "admissionDate": "2025-04-21", "dischargeDate": null, "disease": "統合失調感情障害", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0260_20250426_19830": {"id": "excel_0260_20250426_19830", "patientId": "19830", "name": "田中豊啓", "dateOfBirth": "1960-01-07", "admissionDate": "2025-04-26", "dischargeDate": "2025-05-10", "disease": "双極性障害", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0261_20250501_19836": {"id": "excel_0261_20250501_19836", "patientId": "19836", "name": "福田勝代", "dateOfBirth": "1962-06-27", "admissionDate": "2025-05-01", "dischargeDate": "2025-07-31", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0262_20250502_19004": {"id": "excel_0262_20250502_19004", "patientId": "19004", "name": "鈴木信武", "dateOfBirth": "1950-09-25", "admissionDate": "2025-05-02", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "中村", "assignedNurse": "伊藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0263_20250507_19839": {"id": "excel_0263_20250507_19839", "patientId": "19839", "name": "洲之内結心", "dateOfBirth": "2004-04-21", "admissionDate": "2025-05-07", "dischargeDate": "2025-05-13", "disease": "摂食障害", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0264_20250508_15560": {"id": "excel_0264_20250508_15560", "patientId": "15560", "name": "吉田祐美子", "dateOfBirth": "1974-12-17", "admissionDate": "2025-05-08", "dischargeDate": "2025-05-26", "disease": "抑うつ神経症", "primaryPhysician": "石橋", "assignedNurse": "樋口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": "急性増悪"}, "excel_0265_20250508_19843": {"id": "excel_0265_20250508_19843", "patientId": "19843", "name": "志岐慶太", "dateOfBirth": "1995-05-08", "admissionDate": "2025-05-08", "dischargeDate": "2025-06-23", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0266_20250512_2042": {"id": "excel_0266_20250512_2042", "patientId": "2042", "name": "有本弥生", "dateOfBirth": "1966-03-27", "admissionDate": "2025-05-12", "dischargeDate": "2025-06-09", "disease": "心因反応", "primaryPhysician": "森本", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0267_20250514_19851": {"id": "excel_0267_20250514_19851", "patientId": "19851", "name": "有働結海", "dateOfBirth": "2005-09-30", "admissionDate": "2025-05-14", "dischargeDate": "2025-08-07", "disease": "適応障害", "primaryPhysician": "藤本", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0268_20250514_19852": {"id": "excel_0268_20250514_19852", "patientId": "19852", "name": "濵地芙紀子", "dateOfBirth": "1942-09-17", "admissionDate": "2025-05-14", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0269_20250515_19854": {"id": "excel_0269_20250515_19854", "patientId": "19854", "name": "豊永愛美", "dateOfBirth": "1995-12-17", "admissionDate": "2025-05-15", "dischargeDate": "2025-05-28", "disease": "中等度知的障害", "primaryPhysician": "佐伯", "assignedNurse": "瀬戸", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0270_20250515_19569": {"id": "excel_0270_20250515_19569", "patientId": "19569", "name": "鬼丸静香", "dateOfBirth": "1937-11-25", "admissionDate": "2025-05-15", "dischargeDate": "2025-06-14", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "伊藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0271_20250519_9887": {"id": "excel_0271_20250519_9887", "patientId": "9887", "name": "田中明", "dateOfBirth": "S53.11.7", "admissionDate": "2025-05-19", "dischargeDate": "2025-06-17", "disease": "統合失調症", "primaryPhysician": "深堀", "assignedNurse": "伊藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0272_20250519_19831": {"id": "excel_0272_20250519_19831", "patientId": "19831", "name": "今安絹佳", "dateOfBirth": "1995-09-17", "admissionDate": "2025-05-19", "dischargeDate": "2025-08-18", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0273_20250523_2600": {"id": "excel_0273_20250523_2600", "patientId": "2600", "name": "森友君代", "dateOfBirth": "1939-08-20", "admissionDate": "2025-05-23", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0274_20250524_19189": {"id": "excel_0274_20250524_19189", "patientId": "19189", "name": "平野優亜", "dateOfBirth": "2011-03-10", "admissionDate": "2025-05-24", "dischargeDate": "2025-05-31", "disease": "自閉症スペクトラム", "primaryPhysician": "森本", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0275_20250602_5881": {"id": "excel_0275_20250602_5881", "patientId": "5881", "name": "三好千草", "dateOfBirth": "Ｓ60.11.16", "admissionDate": "2025-06-02", "dischargeDate": "2025-06-30", "disease": "うつ病、適応障害", "primaryPhysician": "森本", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0276_20250602_14095": {"id": "excel_0276_20250602_14095", "patientId": "14095", "name": "津田綾音", "dateOfBirth": "1996-07-10", "admissionDate": "2025-06-02", "dischargeDate": "2025-08-28", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0277_20250602_19864": {"id": "excel_0277_20250602_19864", "patientId": "19864", "name": "松本尚子", "dateOfBirth": "1976-02-08", "admissionDate": "2025-06-02", "dischargeDate": "2025-06-24", "disease": "全般性不安障害、身体表現性障害", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0278_20250603_13486": {"id": "excel_0278_20250603_13486", "patientId": "13486", "name": "酒井夕紀子", "dateOfBirth": "1980-02-20", "admissionDate": "2025-06-03", "dischargeDate": "2025-06-16", "disease": "うつ病", "primaryPhysician": "森本", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0279_20250603_19866": {"id": "excel_0279_20250603_19866", "patientId": "19866", "name": "吉岡順子", "dateOfBirth": "1942-03-10", "admissionDate": "2025-06-03", "dischargeDate": null, "disease": "認知症", "primaryPhysician": "藤本", "assignedNurse": "瀬戸", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0280_20250603_19867": {"id": "excel_0280_20250603_19867", "patientId": "19867", "name": "水橋奏", "dateOfBirth": "2001-01-29", "admissionDate": "2025-06-03", "dischargeDate": "2025-07-07", "disease": "躁状態", "primaryPhysician": "中村", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0281_20250606_18922": {"id": "excel_0281_20250606_18922", "patientId": "18922", "name": "安川愛子", "dateOfBirth": "1993-02-06", "admissionDate": "2025-06-06", "dischargeDate": "2025-06-09", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "金子", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0282_20250610_9694": {"id": "excel_0282_20250610_9694", "patientId": "9694", "name": "古田文代", "dateOfBirth": "1955-06-25", "admissionDate": "2025-06-10", "dischargeDate": "2025-06-19", "disease": "うつ病、アルコール依存症", "primaryPhysician": "深堀", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0283_20250610_18172": {"id": "excel_0283_20250610_18172", "patientId": "18172", "name": "井口保弘", "dateOfBirth": "1970-06-01", "admissionDate": "2025-06-10", "dischargeDate": "2025-06-26", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "瀬戸", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": "急性増悪"}, "excel_0284_20250611_19766": {"id": "excel_0284_20250611_19766", "patientId": "19766", "name": "白水洋子", "dateOfBirth": "1935-03-30", "admissionDate": "2025-06-11", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": "急性増悪"}, "excel_0285_20250613_19876": {"id": "excel_0285_20250613_19876", "patientId": "19876", "name": "宇都宮真由美", "dateOfBirth": "1968-04-02", "admissionDate": "2025-06-13", "dischargeDate": "2025-09-10", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "金子", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0286_20250612_7358": {"id": "excel_0286_20250612_7358", "patientId": "7358", "name": "栗元和歌子", "dateOfBirth": "1973-01-08", "admissionDate": "2025-06-12", "dischargeDate": "2025-09-04", "disease": "統合失調症", "primaryPhysician": "髙橋", "assignedNurse": "中野", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0287_20250614_17657": {"id": "excel_0287_20250614_17657", "patientId": "17657", "name": "月俣恭子", "dateOfBirth": "1992-01-23", "admissionDate": "2025-06-14", "dischargeDate": "2025-08-04", "disease": "うつ病", "primaryPhysician": "髙橋", "assignedNurse": "蒲原", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": "急性増悪"}, "excel_0288_20250616_2042": {"id": "excel_0288_20250616_2042", "patientId": "2042", "name": "有本弥生", "dateOfBirth": "1966-03-27", "admissionDate": "2025-06-16", "dischargeDate": "2025-07-12", "disease": "心因反応", "primaryPhysician": "森本", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0289_20250616_13878": {"id": "excel_0289_20250616_13878", "patientId": "13878", "name": "弘中祥一", "dateOfBirth": "1983-03-16", "admissionDate": "2025-06-16", "dischargeDate": "2025-07-15", "disease": "自閉スペクトラム", "primaryPhysician": "深堀", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0290_20250616_19886": {"id": "excel_0290_20250616_19886", "patientId": "19886", "name": "居倉理恵", "dateOfBirth": "1973-03-30", "admissionDate": "2025-06-16", "dischargeDate": "2025-07-26", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "樋口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0291_20250619_16652": {"id": "excel_0291_20250619_16652", "patientId": "16652", "name": "西田榮子", "dateOfBirth": "1950-12-30", "admissionDate": "2025-06-19", "dischargeDate": "2025-07-18", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0292_20250619_16651": {"id": "excel_0292_20250619_16651", "patientId": "16651", "name": "西田真理子", "dateOfBirth": "1980-06-07", "admissionDate": "2025-06-19", "dischargeDate": "2025-07-18", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "伊藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0293_20250620_19705": {"id": "excel_0293_20250620_19705", "patientId": "19705", "name": "安河内たえ子", "dateOfBirth": "1952-02-23", "admissionDate": "2025-06-20", "dischargeDate": null, "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0294_20250623_16686": {"id": "excel_0294_20250623_16686", "patientId": "16686", "name": "青木徳茂", "dateOfBirth": "1962-03-27", "admissionDate": "2025-06-23", "dischargeDate": "2025-07-09", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0295_20250625_4778": {"id": "excel_0295_20250625_4778", "patientId": "4778", "name": "三島全人", "dateOfBirth": "1977-11-02", "admissionDate": "2025-06-25", "dischargeDate": "2025-11-06", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "佐々", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0296_20250625_18258": {"id": "excel_0296_20250625_18258", "patientId": "18258", "name": "谷瀬梨沙", "dateOfBirth": "1990-05-20", "admissionDate": "2025-06-25", "dischargeDate": "2025-08-25", "disease": "統合失調症、広汎性発達障害", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0297_20250628_19098": {"id": "excel_0297_20250628_19098", "patientId": "19098", "name": "永野和毅", "dateOfBirth": "1965-08-27", "admissionDate": "2025-06-28", "dischargeDate": "2025-07-22", "disease": "パニック障害", "primaryPhysician": "佐伯", "assignedNurse": "瀬戸", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0298_20250630_12833": {"id": "excel_0298_20250630_12833", "patientId": "12833", "name": "田口智也", "dateOfBirth": "1997-02-26", "admissionDate": "2025-06-30", "dischargeDate": "2025-09-11", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "伊藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0299_20250630_3273": {"id": "excel_0299_20250630_3273", "patientId": "3273", "name": "若宮京子", "dateOfBirth": "1932-01-13", "admissionDate": "2025-06-30", "dischargeDate": null, "disease": "神経症、脱水", "primaryPhysician": "津留", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0300_20250702_783": {"id": "excel_0300_20250702_783", "patientId": "783", "name": "津上真澄", "dateOfBirth": "1968-06-17", "admissionDate": "2025-07-02", "dischargeDate": "2025-08-09", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0301_20250710_8894": {"id": "excel_0301_20250710_8894", "patientId": "8894", "name": "増田稔", "dateOfBirth": "1974-09-27", "admissionDate": "2025-07-10", "dischargeDate": null, "disease": "統合失調症", "primaryPhysician": "石橋", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0302_20250710_18109": {"id": "excel_0302_20250710_18109", "patientId": "18109", "name": "島田やす代", "dateOfBirth": "1957-08-27", "admissionDate": "2025-07-10", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "佐々", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0303_20250711_18950": {"id": "excel_0303_20250711_18950", "patientId": "18950", "name": "廣司正子", "dateOfBirth": "1975-01-27", "admissionDate": "2025-07-11", "dischargeDate": "2025-07-16", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0304_20250711_19907": {"id": "excel_0304_20250711_19907", "patientId": "19907", "name": "東八重子", "dateOfBirth": "1934-05-15", "admissionDate": "2025-07-11", "dischargeDate": null, "disease": "妄想性障害", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0305_20250711_19906": {"id": "excel_0305_20250711_19906", "patientId": "19906", "name": "吉浦義人", "dateOfBirth": "1933-08-20", "admissionDate": "2025-07-11", "dischargeDate": null, "disease": "慢性血種後せん妄", "primaryPhysician": "中村", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0306_20250714_19909": {"id": "excel_0306_20250714_19909", "patientId": "19909", "name": "宮地まり子", "dateOfBirth": "1967-12-09", "admissionDate": "2025-07-14", "dischargeDate": "2025-07-29", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "伊藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0307_20250716_16524": {"id": "excel_0307_20250716_16524", "patientId": "16524", "name": "仲西八千代", "dateOfBirth": "1965-05-13", "admissionDate": "2025-07-16", "dischargeDate": "2025-09-13", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0308_20250724_19916": {"id": "excel_0308_20250724_19916", "patientId": "19916", "name": "藤野英子", "dateOfBirth": "1964-02-24", "admissionDate": "2025-07-24", "dischargeDate": "2025-09-20", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0309_20250725_19893": {"id": "excel_0309_20250725_19893", "patientId": "19893", "name": "伴泰輔", "dateOfBirth": "1943-03-07", "admissionDate": "2025-07-25", "dischargeDate": null, "disease": "混合型認知症", "primaryPhysician": "中村", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0310_20250726_16624": {"id": "excel_0310_20250726_16624", "patientId": "16624", "name": "北御門悟", "dateOfBirth": "1994-07-28", "admissionDate": "2025-07-26", "dischargeDate": "2025-08-27", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "樋口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0311_20250728_19920": {"id": "excel_0311_20250728_19920", "patientId": "19920", "name": "山本真亜紗", "dateOfBirth": "1985-07-13", "admissionDate": "2025-07-28", "dischargeDate": "2025-08-21", "disease": "うつ病、ASD", "primaryPhysician": "佐伯", "assignedNurse": "伊藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0312_20250730_3798": {"id": "excel_0312_20250730_3798", "patientId": "3798", "name": "春日正弘", "dateOfBirth": "1951-12-25", "admissionDate": "2025-07-30", "dischargeDate": "2025-10-28", "disease": "統合失調症.パーキンソン", "primaryPhysician": "中村", "assignedNurse": "小林", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0313_20250730_6099": {"id": "excel_0313_20250730_6099", "patientId": "6099", "name": "豊田新晃", "dateOfBirth": "1967-01-14", "admissionDate": "2025-07-30", "dischargeDate": "2025-08-07", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0314_20250731_18448": {"id": "excel_0314_20250731_18448", "patientId": "18448", "name": "藤木美和", "dateOfBirth": "1971-07-08", "admissionDate": "2025-07-31", "dischargeDate": "2025-08-27", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0315_20250801_14876": {"id": "excel_0315_20250801_14876", "patientId": "14876", "name": "岡美代子", "dateOfBirth": "1967-08-05", "admissionDate": "2025-08-01", "dischargeDate": "2025-10-15", "disease": "アルコール依存症、肺高血圧症", "primaryPhysician": "深堀", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0316_20250802_19830": {"id": "excel_0316_20250802_19830", "patientId": "19830", "name": "田中豊啓", "dateOfBirth": "1960-01-07", "admissionDate": "2025-08-02", "dischargeDate": "2025-08-30", "disease": "双極性障害", "primaryPhysician": "佐伯", "assignedNurse": "中島", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0317_20250804_12257": {"id": "excel_0317_20250804_12257", "patientId": "12257", "name": "有園一彦", "dateOfBirth": "1953-11-25", "admissionDate": "2025-08-04", "dischargeDate": "2025-09-22", "disease": "双極性障害", "primaryPhysician": "深堀", "assignedNurse": "原口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0318_20250804_19790": {"id": "excel_0318_20250804_19790", "patientId": "19790", "name": "栁田尚恵", "dateOfBirth": "1976-03-30", "admissionDate": "2025-08-04", "dischargeDate": "2025-11-21", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0319_20250805_19890": {"id": "excel_0319_20250805_19890", "patientId": "19890", "name": "長尾喜久子", "dateOfBirth": "1949-05-13", "admissionDate": "2025-08-05", "dischargeDate": null, "disease": "アルコール依存症", "primaryPhysician": "藤本", "assignedNurse": "佐々.芹田", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0320_20250808_18145": {"id": "excel_0320_20250808_18145", "patientId": "18145", "name": "久保彩加", "dateOfBirth": "1992-01-25", "admissionDate": "2025-08-08", "dischargeDate": "2025-08-22", "disease": "うつ病", "primaryPhysician": "森本", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0321_20250808_19698": {"id": "excel_0321_20250808_19698", "patientId": "19698", "name": "笹沼賢史", "dateOfBirth": "1963-05-11", "admissionDate": "2025-08-08", "dischargeDate": "2025-08-18", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0322_20250818_14635": {"id": "excel_0322_20250818_14635", "patientId": "14635", "name": "谷村友季", "dateOfBirth": "1972-10-26", "admissionDate": "2025-08-18", "dischargeDate": "2025-11-14", "disease": "パニック障害", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0323_20250818_14779": {"id": "excel_0323_20250818_14779", "patientId": "14779", "name": "藤田隆子", "dateOfBirth": "1955-02-03", "admissionDate": "2025-08-18", "dischargeDate": null, "disease": "脳血管性認知症", "primaryPhysician": "中村", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0324_20250820_19943": {"id": "excel_0324_20250820_19943", "patientId": "19943", "name": "梶原佳央里", "dateOfBirth": "1996-01-08", "admissionDate": "2025-08-20", "dischargeDate": "2025-10-31", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0325_20250820_17698": {"id": "excel_0325_20250820_17698", "patientId": "17698", "name": "井口史", "dateOfBirth": "1975-06-06", "admissionDate": "2025-08-20", "dischargeDate": "2025-09-03", "disease": "気分変調証", "primaryPhysician": "深堀", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0326_20250821_17797": {"id": "excel_0326_20250821_17797", "patientId": "17797", "name": "小笹凌太朗", "dateOfBirth": "2002-12-30", "admissionDate": "2025-08-21", "dischargeDate": "2025-11-17", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "中島", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0327_20250822_19945": {"id": "excel_0327_20250822_19945", "patientId": "19945", "name": "和田琉斗", "dateOfBirth": "2000-01-25", "admissionDate": "2025-08-22", "dischargeDate": "2025-08-25", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "伊藤", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0328_20250823_17737": {"id": "excel_0328_20250823_17737", "patientId": "17737", "name": "德永慧", "dateOfBirth": "1988-11-30", "admissionDate": "2025-08-23", "dischargeDate": "2025-10-06", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0329_20250823_14081": {"id": "excel_0329_20250823_14081", "patientId": "14081", "name": "行弘辰代", "dateOfBirth": "1939-06-18", "admissionDate": "2025-08-23", "dischargeDate": "2025-10-29", "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0330_20250827_19681": {"id": "excel_0330_20250827_19681", "patientId": "19681", "name": "角直人", "dateOfBirth": "1992-06-09", "admissionDate": "2025-08-27", "dischargeDate": "2025-09-12", "disease": "うつ病", "primaryPhysician": "藤本", "assignedNurse": "原口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0331_20250827_19949": {"id": "excel_0331_20250827_19949", "patientId": "19949", "name": "安藤智彦", "dateOfBirth": "1994-01-17", "admissionDate": "2025-08-27", "dischargeDate": "2025-09-11", "disease": "神経症", "primaryPhysician": "中村", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0332_20250827_19336": {"id": "excel_0332_20250827_19336", "patientId": "19336", "name": "若宮秀斗", "dateOfBirth": "2005-10-06", "admissionDate": "2025-08-27", "dischargeDate": "2025-08-29", "disease": "自閉症スペクトラム", "primaryPhysician": "佐伯", "assignedNurse": "樋口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0333_20250829_18769": {"id": "excel_0333_20250829_18769", "patientId": "18769", "name": "村上洋子", "dateOfBirth": "1950-01-26", "admissionDate": "2025-08-29", "dischargeDate": "2025-11-28", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "中島", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0334_20250901_18985": {"id": "excel_0334_20250901_18985", "patientId": "18985", "name": "田中杏奈", "dateOfBirth": "2008-02-19", "admissionDate": "2025-09-01", "dischargeDate": "2025-09-03", "disease": "不安障害", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0335_20250901_19953": {"id": "excel_0335_20250901_19953", "patientId": "19953", "name": "平井眞貴子", "dateOfBirth": "1952-08-31", "admissionDate": "2025-09-01", "dischargeDate": "2025-11-29", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "樋口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0336_20250905_19961": {"id": "excel_0336_20250905_19961", "patientId": "19961", "name": "黒川靖", "dateOfBirth": "1961-04-08", "admissionDate": "2025-09-05", "dischargeDate": "2025-09-06", "disease": "双極性感情障害", "primaryPhysician": "佐伯", "assignedNurse": "吉田", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0337_20250906_19963": {"id": "excel_0337_20250906_19963", "patientId": "19963", "name": "松本恂子", "dateOfBirth": "1938-08-02", "admissionDate": "2025-09-06", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0338_20250908_18490": {"id": "excel_0338_20250908_18490", "patientId": "18490", "name": "赤瀬政子", "dateOfBirth": "1974-05-17", "admissionDate": "2025-09-08", "dischargeDate": "2025-10-29", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "伊藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0339_20250910_19967": {"id": "excel_0339_20250910_19967", "patientId": "19967", "name": "小森爽矢", "dateOfBirth": "2007-09-13", "admissionDate": "2025-09-10", "dischargeDate": null, "disease": "自閉症スペクトラム", "primaryPhysician": "佐伯", "assignedNurse": "樋口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0340_20250910_19969": {"id": "excel_0340_20250910_19969", "patientId": "19969", "name": "平島優", "dateOfBirth": "1991-06-12", "admissionDate": "2025-09-10", "dischargeDate": "2025-10-27", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0341_20250912_19964": {"id": "excel_0341_20250912_19964", "patientId": "19964", "name": "牛尾友哉", "dateOfBirth": "2012-01-24", "admissionDate": "2025-09-12", "dischargeDate": "2025-11-22", "disease": "適応障害", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0342_20250912_19972": {"id": "excel_0342_20250912_19972", "patientId": "19972", "name": "岩長祐児", "dateOfBirth": "1980-04-28", "admissionDate": "2025-09-12", "dischargeDate": "2025-11-12", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "中島", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0343_20250913_19876": {"id": "excel_0343_20250913_19876", "patientId": "19876", "name": "宇都宮真由美", "dateOfBirth": "1968-04-02", "admissionDate": "2025-09-13", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0344_20250924_14857": {"id": "excel_0344_20250924_14857", "patientId": "14857", "name": "江夏優衣", "dateOfBirth": "H11.9.15", "admissionDate": "2025-09-24", "dischargeDate": "2025-10-30", "disease": "SC", "primaryPhysician": "佐伯", "assignedNurse": "原口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0345_20250926_19980": {"id": "excel_0345_20250926_19980", "patientId": "19980", "name": "山方次男", "dateOfBirth": "1940-05-27", "admissionDate": "2025-09-26", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0346_20250926_19981": {"id": "excel_0346_20250926_19981", "patientId": "19981", "name": "中川康仁", "dateOfBirth": "1978-10-14", "admissionDate": "2025-09-26", "dischargeDate": "2025-10-06", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0347_20251001_19991": {"id": "excel_0347_20251001_19991", "patientId": "19991", "name": "大渕哲哉", "dateOfBirth": "1968-12-25", "admissionDate": "2025-10-01", "dischargeDate": "2025-10-18", "disease": "双極性感情障害", "primaryPhysician": "中村", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0348_20251001_19993": {"id": "excel_0348_20251001_19993", "patientId": "19993", "name": "廣佐古栞菜", "dateOfBirth": "1997-02-12", "admissionDate": "2025-10-01", "dischargeDate": "2025-11-20", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0349_20251006_19569": {"id": "excel_0349_20251006_19569", "patientId": "19569", "name": "鬼丸静香", "dateOfBirth": "1937-11-25", "admissionDate": "2025-10-06", "dischargeDate": "2025-10-25", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "伊藤", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0350_20251008_19493": {"id": "excel_0350_20251008_19493", "patientId": "19493", "name": "安達勇太", "dateOfBirth": "1981-09-14", "admissionDate": "2025-10-08", "dischargeDate": "2025-11-06", "disease": "統合失調症", "primaryPhysician": "藤本", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0351_20251008_19999": {"id": "excel_0351_20251008_19999", "patientId": "19999", "name": "吉村浩司", "dateOfBirth": "1985-02-02", "admissionDate": "2025-10-08", "dischargeDate": "2025-10-21", "disease": "アルコール離脱症候群", "primaryPhysician": "藤本", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0352_20251014_20005": {"id": "excel_0352_20251014_20005", "patientId": "20005", "name": "上野恒美", "dateOfBirth": "1933-04-20", "admissionDate": "2025-10-14", "dischargeDate": "2025-10-30", "disease": "老年期精神障害", "primaryPhysician": "中村", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0353_20251015_19864": {"id": "excel_0353_20251015_19864", "patientId": "19864", "name": "松本尚子", "dateOfBirth": "1976-02-08", "admissionDate": "2025-10-15", "dischargeDate": "2026-01-14", "disease": "全般性不安障害、身体表現性障害", "primaryPhysician": "佐伯", "assignedNurse": "原口→東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0354_20251016_9331": {"id": "excel_0354_20251016_9331", "patientId": "9331", "name": "永田京子", "dateOfBirth": "1967-10-26", "admissionDate": "2025-10-16", "dischargeDate": "2026-01-15", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0355_20251017_8720": {"id": "excel_0355_20251017_8720", "patientId": "8720", "name": "吉田たつ子", "dateOfBirth": "1952-03-31", "admissionDate": "2025-10-17", "dischargeDate": null, "disease": "統合失調感情障害", "primaryPhysician": "佐伯", "assignedNurse": "樋口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0356_20251020_20011": {"id": "excel_0356_20251020_20011", "patientId": "20011", "name": "松尾誘眞", "dateOfBirth": "2003-10-14", "admissionDate": "2025-10-20", "dischargeDate": "2025-12-26", "disease": "軽度知的障害、ASD,ADHD", "primaryPhysician": "佐伯", "assignedNurse": "芹田", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0357_20251022_7581": {"id": "excel_0357_20251022_7581", "patientId": "7581", "name": "宮園玲子", "dateOfBirth": "S16.6.16", "admissionDate": "2025-10-22", "dischargeDate": "2025-12-03", "disease": "不安神経症、うつ病", "primaryPhysician": "深堀", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0358_20251022_19435": {"id": "excel_0358_20251022_19435", "patientId": "19435", "name": "西山雄二", "dateOfBirth": "1953-01-18", "admissionDate": "2025-10-22", "dischargeDate": "2026-01-21", "disease": "双極性感情障害", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0359_20251024_20021": {"id": "excel_0359_20251024_20021", "patientId": "20021", "name": "佐藤俊一", "dateOfBirth": "1954-08-25", "admissionDate": "2025-10-24", "dischargeDate": "2026-01-08", "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0360_20251027_10083": {"id": "excel_0360_20251027_10083", "patientId": "10083", "name": "冨永まゆみ", "dateOfBirth": "S34.6.28", "admissionDate": "2025-10-27", "dischargeDate": "2026-01-26", "disease": "双極性障害", "primaryPhysician": "深堀", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0361_20251029_14553": {"id": "excel_0361_20251029_14553", "patientId": "14553", "name": "小畑嘉美", "dateOfBirth": "1980-10-15", "admissionDate": "2025-10-29", "dischargeDate": "2026-01-26", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0362_20251105_18802": {"id": "excel_0362_20251105_18802", "patientId": "18802", "name": "東野輝徳", "dateOfBirth": "1975-09-06", "admissionDate": "2025-11-05", "dischargeDate": "2026-02-02", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0363_20251106_20033": {"id": "excel_0363_20251106_20033", "patientId": "20033", "name": "日隈好美", "dateOfBirth": "1991-09-13", "admissionDate": "2025-11-06", "dischargeDate": "2026-01-22", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0364_20251106_20031": {"id": "excel_0364_20251106_20031", "patientId": "20031", "name": "尾道勇飛", "dateOfBirth": "2004-09-17", "admissionDate": "2025-11-06", "dischargeDate": "2025-11-21", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0365_20251107_20039": {"id": "excel_0365_20251107_20039", "patientId": "20039", "name": "川原登志子", "dateOfBirth": "1956-11-05", "admissionDate": "2025-11-07", "dischargeDate": null, "disease": "妄想性障害", "primaryPhysician": "佐伯", "assignedNurse": "芹田", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0366_20251107_18065": {"id": "excel_0366_20251107_18065", "patientId": "18065", "name": "小森海人", "dateOfBirth": "1995-03-27", "admissionDate": "2025-11-07", "dischargeDate": "2026-02-06", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0367_20251112_8564": {"id": "excel_0367_20251112_8564", "patientId": "8564", "name": "冨永ゆり子", "dateOfBirth": "S30.2.12", "admissionDate": "2025-11-12", "dischargeDate": "2026-01-24", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "中島", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0368_20251117_19531": {"id": "excel_0368_20251117_19531", "patientId": "19531", "name": "土井良桂子", "dateOfBirth": "1960-04-03", "admissionDate": "2025-11-17", "dischargeDate": "2026-02-13", "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "山田→樋口", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0369_20251117_3305": {"id": "excel_0369_20251117_3305", "patientId": "3305", "name": "土井良信也", "dateOfBirth": "1957-02-03", "admissionDate": "2025-11-17", "dischargeDate": "2026-02-13", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "原口→池", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0370_20251119_19087": {"id": "excel_0370_20251119_19087", "patientId": "19087", "name": "岡八代美", "dateOfBirth": "1964-08-30", "admissionDate": "2025-11-19", "dischargeDate": "2026-02-18", "disease": "不安障害", "primaryPhysician": "深堀", "assignedNurse": "蒲原", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0371_20251122_19720": {"id": "excel_0371_20251122_19720", "patientId": "19720", "name": "薄　武志", "dateOfBirth": "1970-03-23", "admissionDate": "2025-11-22", "dischargeDate": "2025-12-26", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0372_20251126_20057": {"id": "excel_0372_20251126_20057", "patientId": "20057", "name": "古藤信光", "dateOfBirth": "1965-10-15", "admissionDate": "2025-11-26", "dischargeDate": "2026-02-25", "disease": "アルコール依存症", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0373_20251126_17797": {"id": "excel_0373_20251126_17797", "patientId": "17797", "name": "小笹凌太朗", "dateOfBirth": "2002-12-30", "admissionDate": "2025-11-26", "dischargeDate": "2026-02-25", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "中島", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0374_20251127_15560": {"id": "excel_0374_20251127_15560", "patientId": "15560", "name": "吉田祐美子", "dateOfBirth": "1974-12-17", "admissionDate": "2025-11-27", "dischargeDate": "2025-12-25", "disease": "抑うつ神経症", "primaryPhysician": "石橋", "assignedNurse": "山田", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0375_20251128_20062": {"id": "excel_0375_20251128_20062", "patientId": "20062", "name": "淺田奈津夫", "dateOfBirth": "1953-07-08", "admissionDate": "2025-11-28", "dischargeDate": null, "disease": "うつ病、脳血管性認知症", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0376_20251203_15676": {"id": "excel_0376_20251203_15676", "patientId": "15676", "name": "江崎成美", "dateOfBirth": "1992-12-21", "admissionDate": "2025-12-03", "dischargeDate": null, "disease": "統合失調症、軽度知的障害", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0377_20251204_20069": {"id": "excel_0377_20251204_20069", "patientId": "20069", "name": "喜屋武盛友", "dateOfBirth": "1955-11-01", "admissionDate": "2025-12-04", "dischargeDate": "2026-02-19", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "中島", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0378_20251205_17657": {"id": "excel_0378_20251205_17657", "patientId": "17657", "name": "月俣恭子", "dateOfBirth": "1992-01-23", "admissionDate": "2025-12-05", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "蒲原", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0379_20251216_14632": {"id": "excel_0379_20251216_14632", "patientId": "14632", "name": "相良恭司", "dateOfBirth": "1972-11-12", "admissionDate": "2025-12-16", "dischargeDate": null, "disease": "アルコール依存症", "primaryPhysician": "中村", "assignedNurse": "芹田", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0380_20251217_20089": {"id": "excel_0380_20251217_20089", "patientId": "20089", "name": "塩手浩", "dateOfBirth": "1955-03-31", "admissionDate": "2025-12-17", "dischargeDate": null, "disease": "双極性障害", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0381_20251219_15437": {"id": "excel_0381_20251219_15437", "patientId": "15437", "name": "清水敏子", "dateOfBirth": "1950-12-13", "admissionDate": "2025-12-19", "dischargeDate": "2026-02-07", "disease": "うつ病", "primaryPhysician": "中村", "assignedNurse": "芹田", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0382_20251219_20085": {"id": "excel_0382_20251219_20085", "patientId": "20085", "name": "上野美由紀", "dateOfBirth": "1974-04-12", "admissionDate": "2025-12-19", "dischargeDate": null, "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "樋口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0383_20251220_18258": {"id": "excel_0383_20251220_18258", "patientId": "18258", "name": "谷瀬梨沙", "dateOfBirth": "1990-05-20", "admissionDate": "2025-12-20", "dischargeDate": "2026-02-25", "disease": "統合失調症、広汎性発達障害", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0384_20251222_18172": {"id": "excel_0384_20251222_18172", "patientId": "18172", "name": "井口保弘", "dateOfBirth": "1970-06-01", "admissionDate": "2025-12-22", "dischargeDate": "2026-01-08", "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0385_20251224_14857": {"id": "excel_0385_20251224_14857", "patientId": "14857", "name": "江夏優衣", "dateOfBirth": "H11.9.15", "admissionDate": "2025-12-24", "dischargeDate": "2026-02-05", "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "芹田", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0386_20260108_20097": {"id": "excel_0386_20260108_20097", "patientId": "20097", "name": "古藤義春", "dateOfBirth": "1955-10-12", "admissionDate": "2026-01-08", "dischargeDate": null, "disease": "妄想性障害", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0387_20251120_15625": {"id": "excel_0387_20251120_15625", "patientId": "15625", "name": "樋口ヤス子", "dateOfBirth": "1949-12-21", "admissionDate": "2025-11-20", "dischargeDate": null, "disease": "抑うつ神経症", "primaryPhysician": "石橋", "assignedNurse": "芹田", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0388_20260115_18250": {"id": "excel_0388_20260115_18250", "patientId": "18250", "name": "吉田ほずみ", "dateOfBirth": "1981-04-17", "admissionDate": "2026-01-15", "dischargeDate": "2026-02-05", "disease": "パニック障害", "primaryPhysician": "深堀", "assignedNurse": "東本", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0389_20260116_19851": {"id": "excel_0389_20260116_19851", "patientId": "19851", "name": "有働結海", "dateOfBirth": "2005-09-30", "admissionDate": "2026-01-16", "dischargeDate": null, "disease": "適応障害", "primaryPhysician": "藤本", "assignedNurse": "池", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0390_20260117_20113": {"id": "excel_0390_20260117_20113", "patientId": "20113", "name": "差形優衣", "dateOfBirth": "2004-12-24", "admissionDate": "2026-01-17", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "柳沢", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0391_20260117_20110": {"id": "excel_0391_20260117_20110", "patientId": "20110", "name": "佐伯親保", "dateOfBirth": "1936-07-22", "admissionDate": "2026-01-17", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "芹田", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0392_20260119_19418": {"id": "excel_0392_20260119_19418", "patientId": "19418", "name": "神谷正子", "dateOfBirth": "1953-12-01", "admissionDate": "2026-01-19", "dischargeDate": null, "disease": "妄想性障害", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0393_20260121_19525": {"id": "excel_0393_20260121_19525", "patientId": "19525", "name": "大嶋万里子", "dateOfBirth": "1952-01-18", "admissionDate": "2026-01-21", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "小林", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0394_20260123_11573": {"id": "excel_0394_20260123_11573", "patientId": "11573", "name": "福本辰朗", "dateOfBirth": "1982-09-17", "admissionDate": "2026-01-23", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "池", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0395_20260129_20125": {"id": "excel_0395_20260129_20125", "patientId": "20125", "name": "川上篤人", "dateOfBirth": "2002-06-19", "admissionDate": "2026-01-29", "dischargeDate": null, "disease": "自閉症スペクトラム", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0396_20260130_10123": {"id": "excel_0396_20260130_10123", "patientId": "10123", "name": "若藤由依香", "dateOfBirth": "1985-12-22", "admissionDate": "2026-01-30", "dischargeDate": null, "disease": "解離性障害、軽度知的障害", "primaryPhysician": "佐伯", "assignedNurse": "石橋", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0397_20260202_17456": {"id": "excel_0397_20260202_17456", "patientId": "17456", "name": "江口美波", "dateOfBirth": "1987-09-08", "admissionDate": "2026-02-02", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "尾崎", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0398_20260202_20132": {"id": "excel_0398_20260202_20132", "patientId": "20132", "name": "草場悠花", "dateOfBirth": "2006-11-01", "admissionDate": "2026-02-02", "dischargeDate": null, "disease": "自閉症スペクトラム", "primaryPhysician": "佐伯", "assignedNurse": "大村", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0399_20260205_20133": {"id": "excel_0399_20260205_20133", "patientId": "20133", "name": "灘吉百海", "dateOfBirth": "1997-06-30", "admissionDate": "2026-02-05", "dischargeDate": null, "disease": "双極性障害", "primaryPhysician": "佐伯", "assignedNurse": "田中", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0400_20260206_19992": {"id": "excel_0400_20260206_19992", "patientId": "19992", "name": "吉村益美", "dateOfBirth": "1995-03-08", "admissionDate": "2026-02-06", "dischargeDate": "2026-02-28", "disease": "双極性障害", "primaryPhysician": "佐伯", "assignedNurse": "芹田", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0401_20260210_8564": {"id": "excel_0401_20260210_8564", "patientId": "8564", "name": "冨永ゆり子", "dateOfBirth": "1955-02-12", "admissionDate": "2026-02-10", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "深堀", "assignedNurse": "中島", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0402_20260216_9331": {"id": "excel_0402_20260216_9331", "patientId": "9331", "name": "永田京子", "dateOfBirth": "1967-10-26", "admissionDate": "2026-02-16", "dischargeDate": null, "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "樋口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0403_20260218_20151": {"id": "excel_0403_20260218_20151", "patientId": "20151", "name": "小松比呂志", "dateOfBirth": "1953-02-11", "admissionDate": "2026-02-18", "dischargeDate": "2026-02-20", "disease": "妄想性障害", "primaryPhysician": "佐伯", "assignedNurse": "樋口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "退院", "transferDestination": null, "note": ""}, "excel_0404_20260218_15439": {"id": "excel_0404_20260218_15439", "patientId": "15439", "name": "畠中慎", "dateOfBirth": "1974-07-30", "admissionDate": "2026-02-18", "dischargeDate": null, "disease": "統合失調症", "primaryPhysician": "佐伯", "assignedNurse": "東本", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0405_20260128_20127": {"id": "excel_0405_20260128_20127", "patientId": "20127", "name": "川崎照夫", "dateOfBirth": "1948-03-26", "admissionDate": "2026-01-28", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "藤本", "assignedNurse": "樋口", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0406_20260224_20157": {"id": "excel_0406_20260224_20157", "patientId": "20157", "name": "辻隆子", "dateOfBirth": "1950-10-23", "admissionDate": "2026-02-24", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "中村", "assignedNurse": "田中", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0407_20260225_16624": {"id": "excel_0407_20260225_16624", "patientId": "16624", "name": "北御門悟", "dateOfBirth": "1994-07-28", "admissionDate": "2026-02-25", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "中島", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0408_20260225_20159": {"id": "excel_0408_20260225_20159", "patientId": "20159", "name": "細川莉愛", "dateOfBirth": "2013-02-19", "admissionDate": "2026-02-25", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "大村", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0409_20260228_20162": {"id": "excel_0409_20260228_20162", "patientId": "20162", "name": "江口政一郎", "dateOfBirth": "1971-02-20", "admissionDate": "2026-02-28", "dischargeDate": null, "disease": "うつ病", "primaryPhysician": "佐伯", "assignedNurse": "田中", "admissionForm": "医療保護入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0410_20260302_19626": {"id": "excel_0410_20260302_19626", "patientId": "19626", "name": "大河内導則", "dateOfBirth": "1947-10-16", "admissionDate": "2026-03-02", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "佐伯", "assignedNurse": "尾崎", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}, "excel_0411_20260302_20128": {"id": "excel_0411_20260302_20128", "patientId": "20128", "name": "下釜稔", "dateOfBirth": "1944-01-01", "admissionDate": "2026-03-02", "dischargeDate": null, "disease": "アルツハイマー型認知症", "primaryPhysician": "藤本", "assignedNurse": "芹田", "admissionForm": "任意入院", "admissionType": "新規入院", "team": "1A", "status": "入院中", "transferDestination": null, "note": ""}};

function showClearAllModal() {
    document.getElementById('clearConfirmInput').value = '';
    document.getElementById('clearAllStatus').classList.add('hidden');
    document.getElementById('clearAllModal').classList.remove('hidden');
}

function closeClearAllModal() {
    document.getElementById('clearAllModal').classList.add('hidden');
}

async function executeClearAndImport() {
    const input = document.getElementById('clearConfirmInput').value.trim();
    if (input !== '確認') {
        alert('「確認」と入力してください');
        return;
    }
    const statusEl = document.getElementById('clearAllStatus');
    const btn = document.getElementById('clearExecBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 処理中...';
    statusEl.classList.remove('hidden');
    statusEl.textContent = '既存データを削除しています...';

    try {
        // ① 既存患者データを全削除
        await db.ref('patients').remove();
        statusEl.textContent = '既存データを削除しました。患者データを登録しています...';

        // ② Excelデータを一括登録
        await db.ref('patients').update(EXCEL_IMPORT_DATA);
        statusEl.textContent = '登録完了！';

        setTimeout(() => {
            closeClearAllModal();
            showNotification('Excelデータ（412件）を登録しました', 'success');
        }, 1000);
    } catch(err) {
        console.error(err);
        statusEl.textContent = 'エラーが発生しました: ' + err.message;
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sync-alt"></i> 初期化・登録実行';
    }
}

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
            // サンプルデータ自動投入は廃止
            // （データが空の場合でも既存データを上書きしない）
        }
        // 編集モーダルが開いている場合はリスト再描画をスキップ（競合防止）
        if (!_isEditModalOpen) {
            updateDashboard();
            renderPatientsList();
            renderDischargeList();
            renderRecentDischargeList();
        }
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
    // 全上書きsetを廃止 → 個別updateで競合防止
    const patientsToSave = patients || allPatients;
    const updates = {};
    patientsToSave.forEach(p => { updates['patients/' + p.id] = p; });
    db.ref().update(updates);
}

// 患者1件だけ保存（編集・退院処理用）
function savePatientById(patient) {
    db.ref('patients/' + patient.id).set(patient);
}

// 患者1件を削除
function deletePatientById(patientId) {
    db.ref('patients/' + patientId).remove();
}

function saveHistoryToStorage() {
    // 全上書き廃止 → 個別updateで競合防止
    const updates = {};
    allHistory.forEach(h => { updates['history/' + h.id] = h; });
    db.ref().update(updates);
}

// 履歴1件をFirebaseに書き込む（addHistory用）
function saveHistoryEntry(entry) {
    db.ref('history/' + entry.id).set(entry);
}

function saveTransfersToStorage() {
    // 全上書き廃止 → 個別updateで競合防止
    const updates = {};
    allTransfers.forEach(t => { updates['transfers/' + t.id] = t; });
    db.ref().update(updates);
}

// 転送履歴1件をFirebaseに書き込む
function saveTransferEntry(entry) {
    db.ref('transfers/' + entry.id).set(entry);
}

function saveDailyRecordsToStorage() {
    // 個別updateで競合防止
    const updates = {};
    allDailyRecords.forEach(r => { updates['dailyRecords/' + r.date.replace(/-/g, '')] = r; });
    db.ref().update(updates);
}

// ===============================
// 履歴・転送 追加関数
// ===============================

function addTransferHistory(patientId, patientName, transferType, destination, transferDate, reason) {
    const transferEntry = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 6),
        patientId,
        patientName,
        transferType,
        destination,
        transferDate,
        reason: reason || '',
        timestamp: new Date().toISOString()
    };
    allTransfers.unshift(transferEntry);
    // 全上書きせず1件だけ書き込む
    saveTransferEntry(transferEntry);
}

function addHistory(patientId, patientName, changeType, changedFields, oldValue, newValue) {
    const historyEntry = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 6),
        patientId,
        patientName,
        changeType,
        changedFields,
        oldValue: JSON.stringify(oldValue),
        newValue: JSON.stringify(newValue),
        changeTimestamp: new Date().toISOString()
    };
    allHistory.unshift(historyEntry);
    // 全上書きせず1件だけ書き込む
    saveHistoryEntry(historyEntry);
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

// 入院日数の補足テキスト（〇年〇ヶ月〇日）を返す
function formatStayDaysNote(days) {
    if (!days || days <= 0) return '';
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remDays = days % 30;
    let parts = [];
    if (years > 0) parts.push(`${years}年`);
    if (months > 0) parts.push(`${months}ヶ月`);
    if (remDays > 0 || parts.length === 0) parts.push(`${remDays}日`);
    return '（' + parts.join('') + '）';
}

// 入院日・退院日から入院日数バッジの色クラスを返す
function getStayDaysColorClass(days) {
    if (days >= 365) return 'text-red-600';
    if (days >= 180) return 'text-orange-500';
    if (days >= 90)  return 'text-yellow-600';
    return 'text-blue-700';
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
    updateDashboardHomecareCards();
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
    
    let html = `<table class="min-w-full divide-y divide-gray-200 text-sm"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">患者番号</th>
        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">患者名</th>
        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">操作</th>
        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ステータス</th>
        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">チーム</th>
        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">病名</th>
        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">入院種別</th>
        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">入院形態</th>
        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">主治医</th>
        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">受け持ちNS</th>
        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">入院日</th>
        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">退院日</th>
        <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">入院日数</th>
    </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    
    filteredPatients.forEach(patient => {
        const statusClass = patient.status === '入院中' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
        const typeColor = {'新規入院':'bg-blue-100 text-blue-800','急性増悪':'bg-orange-100 text-orange-800','再入院':'bg-purple-100 text-purple-800'}[patient.admissionType] || 'bg-gray-100 text-gray-800';
        const formColor = {'任意入院':'bg-green-100 text-green-800','医療保護入院':'bg-blue-100 text-blue-800','措置入院':'bg-red-100 text-red-800'}[patient.admissionForm] || 'bg-gray-100 text-gray-800';
        const stayDays = calculateAdmissionPeriod(patient.admissionDate, patient.dischargeDate || null);
        const stayColorClass = getStayDaysColorClass(stayDays);
        const stayNote = formatStayDaysNote(stayDays);
        const isAdmitted = patient.status === '入院中';
        html += `<tr class="hover:bg-gray-50">
            <td class="px-3 py-3 whitespace-nowrap font-medium text-gray-900">${patient.patientId}</td>
            <td class="px-3 py-3 whitespace-nowrap font-semibold text-gray-900">${patient.name}</td>
            <td class="px-3 py-3 whitespace-nowrap">
                <div class="flex items-center gap-1">
                    <button onclick="editPatient('${patient.id}')" title="編集"
                        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                        <i class="fas fa-edit"></i> 編集
                    </button>
                    <button onclick="printPatientChart('${patient.id}')" title="印刷"
                        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100">
                        <i class="fas fa-print"></i> 印刷
                    </button>
                    <button onclick="showDeleteModal('${patient.id}')" title="削除"
                        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100">
                        <i class="fas fa-trash"></i> 削除
                    </button>
                </div>
            </td>
            <td class="px-3 py-3 whitespace-nowrap"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${patient.status}</span></td>
            <td class="px-3 py-3 whitespace-nowrap"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.team === '1A' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">${patient.team}</span></td>
            <td class="px-3 py-3 text-gray-900">${patient.disease}</td>
            <td class="px-3 py-3 whitespace-nowrap"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeColor}">${patient.admissionType}</span></td>
            <td class="px-3 py-3 whitespace-nowrap"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${formColor}">${patient.admissionForm}</span></td>
            <td class="px-3 py-3 whitespace-nowrap text-gray-900">${patient.primaryPhysician}</td>
            <td class="px-3 py-3 whitespace-nowrap text-gray-900">${patient.assignedNurse || '-'}</td>
            <td class="px-3 py-3 whitespace-nowrap text-gray-900">${formatDate(patient.admissionDate)}</td>
            <td class="px-3 py-3 whitespace-nowrap text-gray-500">${patient.dischargeDate ? formatDate(patient.dischargeDate) : '<span class="text-gray-300">-</span>'}</td>
            <td class="px-3 py-3 whitespace-nowrap font-bold ${stayColorClass}">
                ${stayDays}日
                <div class="text-xs font-normal text-gray-400">${stayNote}${isAdmitted ? '<span class="text-green-500 ml-1">経過中</span>' : ''}</div>
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
    const editDestEl = document.getElementById('editDischargeDestination');
    if (editDestEl) editDestEl.value = patient.transferDestination || '';
    updateEditStayDays(); // 入院日数を即時表示
    _isEditModalOpen = true; // 編集モーダルオープン → Firebase更新中のリスト再描画を停止
    document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
    _isEditModalOpen = false; // 編集モーダルクローズ → リスナー更新を再開
    document.getElementById('editModal').classList.add('hidden');
}

// 削除モーダル用グローバル変数
let _deleteTargetId = null;

function showDeleteModal(id) {
    const patient = allPatients.find(p => p.id === id);
    if (!patient) return;
    _deleteTargetId = id;
    document.getElementById('deleteTargetName').textContent =
        `${patient.patientId}　${patient.name}（入院日：${formatDate(patient.admissionDate)}）`;
    document.getElementById('deleteReasonSelect').value = '';
    document.getElementById('deleteReasonOther').value = '';
    document.getElementById('deleteReasonOther').classList.add('hidden');
    document.getElementById('deleteConfirmModal').classList.remove('hidden');
}

function closeDeleteModal() {
    _deleteTargetId = null;
    document.getElementById('deleteConfirmModal').classList.add('hidden');
}

function executeDelete() {
    const id = _deleteTargetId;
    if (!id) return;
    const patient = allPatients.find(p => p.id === id);
    if (!patient) return;
    const reasonSel = document.getElementById('deleteReasonSelect').value;
    const reasonOther = document.getElementById('deleteReasonOther').value.trim();
    const reason = reasonSel === 'その他' ? (reasonOther || 'その他') : reasonSel;
    if (!reason) {
        alert('削除理由を選択してください');
        return;
    }
    addHistory(patient.patientId, patient.name, '削除',
        `削除理由：${reason}`, patient, null);
    allPatients = allPatients.filter(p => p.id !== id);
    deletePatientById(id);
    closeDeleteModal();
    showNotification(`「${patient.name}」を削除しました（理由：${reason}）`, 'success');
}

// 削除理由「その他」選択時にテキスト入力を表示
document.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('deleteReasonSelect');
    if (sel) {
        sel.addEventListener('change', () => {
            const other = document.getElementById('deleteReasonOther');
            if (sel.value === 'その他') {
                other.classList.remove('hidden');
            } else {
                other.classList.add('hidden');
            }
        });
    }
});

function deletePatient(id) {
    // 後方互換のため残す（内部でshowDeleteModal呼び出し）
    showDeleteModal(id);
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
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">現在の入院日数</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
    </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    admittedPatients.forEach(patient => {
        const admissionPeriod = calculateAdmissionPeriod(patient.admissionDate);
        const stayColorClass = getStayDaysColorClass(admissionPeriod);
        const stayNote = formatStayDaysNote(admissionPeriod);
        const formColor = {'任意入院':'bg-green-100 text-green-800','医療保護入院':'bg-blue-100 text-blue-800','措置入院':'bg-red-100 text-red-800'}[patient.admissionForm] || 'bg-gray-100 text-gray-800';
        html += `<tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${patient.patientId}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.team === '1A' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">${patient.team}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${patient.disease}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${formColor}">${patient.admissionForm}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(patient.admissionDate)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold ${stayColorClass}">
                ${admissionPeriod}日
                <div class="text-xs font-normal text-gray-400">${stayNote}<span class="text-green-500 ml-1">経過中</span></div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button onclick="dischargePatient('${patient.id}')" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"><i class="fas fa-sign-out-alt mr-1"></i>退院処理</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// 退院処理モーダル用グローバル変数
let _dischargeTargetId = null;

function dischargePatient(id) {
    const patient = allPatients.find(p => p.id === id);
    if (!patient) return;
    _dischargeTargetId = id;
    // 患者情報表示
    const infoEl = document.getElementById('dischargeModalPatientInfo');
    if (infoEl) {
        infoEl.innerHTML = `<strong>${patient.patientId} ${patient.name}</strong>（${patient.team}チーム）<br>病名：${patient.disease}　入院日：${formatDate(patient.admissionDate)}`;
    }
    // 退院日をデフォルト本日に設定
    const today = new Date().toISOString().split('T')[0];
    const dateEl = document.getElementById('dischargeModalDate');
    if (dateEl) dateEl.value = today;
    // モーダルを表示
    const modal = document.getElementById('dischargeModal');
    if (modal) modal.classList.remove('hidden');
    _isEditModalOpen = true; // 退院モーダルオープン → Firebase更新中のリスト再描画を停止
    // 入院日数を即時表示
    updateDischargeModalStayDays();
}

function closeDischargeModal() {
    const modal = document.getElementById('dischargeModal');
    if (modal) modal.classList.add('hidden');
    _dischargeTargetId = null;
    _isEditModalOpen = false; // 退院モーダルクローズ → リスナー更新を再開
}

// 編集モーダル：入院日数をリアルタイム更新
function updateEditStayDays() {
    const admissionDateVal = document.getElementById('editAdmissionDate') ? document.getElementById('editAdmissionDate').value : '';
    const dischargeDateVal = document.getElementById('editDischargeDate') ? document.getElementById('editDischargeDate').value : '';
    const box = document.getElementById('editStayDaysBox');
    const valEl = document.getElementById('editStayDaysValue');
    const noteEl = document.getElementById('editStayDaysNote');
    if (!admissionDateVal) { if (box) box.classList.add('hidden'); return; }
    const days = calculateAdmissionPeriod(admissionDateVal, dischargeDateVal || null);
    const note = formatStayDaysNote(days);
    const isAdmitted = !dischargeDateVal;
    if (box) box.classList.remove('hidden');
    if (valEl) {
        valEl.textContent = days + '日';
        valEl.className = 'text-2xl font-bold ' + getStayDaysColorClass(days);
    }
    if (noteEl) noteEl.innerHTML = note + (isAdmitted ? ' <span class="text-green-500">入院中</span>' : ' <span class="text-gray-500">退院済</span>');
}

// 退院処理モーダル：入院日数をリアルタイム更新
function updateDischargeModalStayDays() {
    if (!_dischargeTargetId) return;
    const patient = allPatients.find(p => p.id === _dischargeTargetId);
    if (!patient) return;
    const dischargeDateVal = document.getElementById('dischargeModalDate') ? document.getElementById('dischargeModalDate').value : '';
    const days = calculateAdmissionPeriod(patient.admissionDate, dischargeDateVal || null);
    const note = formatStayDaysNote(days);
    const valEl = document.getElementById('dischargeModalStayDaysValue');
    const noteEl = document.getElementById('dischargeModalStayDaysNote');
    if (valEl) {
        valEl.textContent = days + '日';
        valEl.className = 'text-2xl font-bold ' + getStayDaysColorClass(days);
    }
    if (noteEl) noteEl.textContent = note;
}

function confirmDischarge() {
    if (!_dischargeTargetId) return;
    const patient = allPatients.find(p => p.id === _dischargeTargetId);
    if (!patient) return;
    const dateEl = document.getElementById('dischargeModalDate');
    const today = new Date().toISOString().split('T')[0];
    const dischargeDate = (dateEl && dateEl.value) ? dateEl.value : today;
    // 退院先を取得
    const destEl = document.getElementById('dischargeModalDestination');
    const transferDestination = (destEl && destEl.value) ? destEl.value : '';
    const oldStatus = patient.status;
    patient.status = '退院';
    patient.dischargeDate = dischargeDate;
    patient.transferDestination = transferDestination;
    addHistory(patient.patientId, patient.name, '退院処理', 'ステータス', oldStatus,
        `退院（${formatDate(dischargeDate)}）退院先：${transferDestination || '未設定'}`);
    incrementDailyCount(patient.team === '1A' ? 'team1A' : 'team1B', 'discharge');
    // 全上書きsetではなく退院患者のみ更新（競合防止）
    savePatientById(patient);
    closeDischargeModal();
    showNotification(`退院処理が完了しました（退院日：${formatDate(dischargeDate)}　退院先：${transferDestination || '未設定'}）`, 'success');
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
// タイムライン
// ===============================

/**
 * 全データソース（patients / history / transfers）を統合して
 * 時系列イベントリストを生成する
 */
function buildTimelineEvents() {
    const events = [];

    // ---- patients から「入院中」「退院済み」イベントを生成 ----
    allPatients.forEach(p => {
        const team = p.team || '';
        // 入院イベント
        if (p.admissionDate) {
            events.push({
                date: p.admissionDate,
                type: p.admissionType === '再入院' ? '再入院' : '入院',
                patientId: p.patientId,
                patientName: p.name,
                team,
                detail: `${p.admissionForm} ／ ${p.admissionType}`,
                subDetail: `主治医：${p.primaryPhysician}${p.assignedNurse ? '　NS：' + p.assignedNurse : ''}`,
                status: p.status,
                sortKey: new Date(p.admissionDate + 'T00:00:00').getTime()
            });
        }
        // 退院イベント
        if (p.dischargeDate) {
            const stayDays = calculateAdmissionPeriod(p.admissionDate, p.dischargeDate);
            const stayNote = formatStayDaysNote(stayDays);
            events.push({
                date: p.dischargeDate,
                type: '退院',
                patientId: p.patientId,
                patientName: p.name,
                team,
                detail: `入院日数：${stayDays}日 ${stayNote}`,
                subDetail: `入院日：${formatDate(p.admissionDate)}`,
                status: p.status,
                sortKey: new Date(p.dischargeDate + 'T23:59:59').getTime()
            });
        }
    });

    // ---- allHistory から「情報更新」「削除」イベントを追加 ----
    allHistory.forEach(h => {
        // 新規登録・退院処理はpatients側で生成済みなので情報更新のみ追加
        if (h.changeType === '情報更新' || h.changeType === '削除') {
            const p = allPatients.find(pt => pt.patientId === h.patientId);
            events.push({
                date: h.changeTimestamp.split('T')[0],
                type: h.changeType,
                patientId: h.patientId,
                patientName: h.patientName,
                team: p ? p.team : '',
                detail: h.changedFields || '',
                subDetail: '',
                status: '',
                sortKey: new Date(h.changeTimestamp).getTime()
            });
        }
    });

    // ---- allTransfers から転入・転出イベントを追加 ----
    allTransfers.forEach(t => {
        const p = allPatients.find(pt => pt.patientId === t.patientId);
        events.push({
            date: t.transferDate,
            type: t.transferType === '転出' ? '転出' : '転入',
            patientId: t.patientId,
            patientName: t.patientName,
            team: p ? p.team : '',
            detail: t.transferType === '転出' ? `転出先：${t.destination}` : `転入元：${t.destination}`,
            subDetail: t.reason ? `備考：${t.reason}` : '',
            status: '',
            sortKey: new Date(t.transferDate + 'T12:00:00').getTime()
        });
    });

    // 新しい順にソート
    events.sort((a, b) => b.sortKey - a.sortKey);
    return events;
}

/** イベントタイプに応じたスタイル設定を返す */
function getTimelineEventStyle(type) {
    const styles = {
        '入院':    { icon: 'fa-hospital-user',   bg: 'bg-blue-100',   border: 'border-blue-400',   text: 'text-blue-700',   badge: 'bg-blue-500',   label: '入院' },
        '再入院':  { icon: 'fa-redo',             bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', badge: 'bg-purple-500', label: '再入院' },
        '退院':    { icon: 'fa-sign-out-alt',     bg: 'bg-green-100',  border: 'border-green-400',  text: 'text-green-700',  badge: 'bg-green-500',  label: '退院' },
        '転出':    { icon: 'fa-arrow-right',      bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700', badge: 'bg-orange-500', label: '転出' },
        '転入':    { icon: 'fa-arrow-left',       bg: 'bg-teal-100',   border: 'border-teal-400',   text: 'text-teal-700',   badge: 'bg-teal-500',   label: '転入' },
        '情報更新':{ icon: 'fa-pencil-alt',       bg: 'bg-yellow-50',  border: 'border-yellow-300', text: 'text-yellow-700', badge: 'bg-yellow-400', label: '情報更新' },
        '削除':    { icon: 'fa-trash',            bg: 'bg-red-100',    border: 'border-red-400',    text: 'text-red-700',    badge: 'bg-red-500',    label: '削除' },
        '新規登録':{ icon: 'fa-user-plus',        bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-700', badge: 'bg-indigo-500', label: '新規登録' },
    };
    return styles[type] || { icon: 'fa-circle', bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', badge: 'bg-gray-400', label: type };
}

/** タイムライン描画メイン */
function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    const searchTerm  = (document.getElementById('timelineSearch')?.value || '').toLowerCase();
    const eventFilter = document.getElementById('timelineEventFilter')?.value || '';
    const teamFilter  = document.getElementById('timelineTeamFilter')?.value  || '';

    let events = buildTimelineEvents();

    // フィルター適用
    if (searchTerm) {
        events = events.filter(e =>
            e.patientId.toLowerCase().includes(searchTerm) ||
            e.patientName.toLowerCase().includes(searchTerm)
        );
    }
    if (eventFilter) {
        events = events.filter(e => {
            if (eventFilter === '入院') return e.type === '入院' || e.type === '再入院';
            if (eventFilter === '退院処理') return e.type === '退院';
            return e.type === eventFilter;
        });
    }
    if (teamFilter) {
        events = events.filter(e => e.team === teamFilter);
    }

    if (events.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16 text-gray-400">
                <i class="fas fa-stream text-5xl mb-4 block"></i>
                <p class="text-lg">該当するイベントがありません</p>
            </div>`;
        return;
    }

    // 日付ごとにグループ化
    const grouped = {};
    events.forEach(e => {
        const key = e.date || '不明';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(e);
    });
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

    let html = `<div class="relative">`;
    // 縦ライン（中央）
    html += `<div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 z-0 md:left-1/2"></div>`;

    sortedDates.forEach(date => {
        const dayEvents = grouped[date];
        const displayDate = formatDate(date);
        const dayOfWeek = ['日','月','火','水','木','金','土'][new Date(date).getDay()] || '';

        // 日付ラベル（中央固定）
        html += `
            <div class="relative flex justify-center mb-2 z-10">
                <div class="bg-white border border-gray-300 rounded-full px-4 py-1 text-sm font-bold text-gray-600 shadow-sm">
                    <i class="fas fa-calendar-day mr-1 text-gray-400"></i>${displayDate}（${dayOfWeek}）
                </div>
            </div>`;

        dayEvents.forEach((ev, idx) => {
            const style = getTimelineEventStyle(ev.type);
            const isLeft = idx % 2 === 0; // PC: 左右交互配置

            html += `
            <div class="relative flex items-start mb-4 z-10">
                <!-- モバイル：左寄せ / PC：左右交互 -->
                <div class="w-full md:w-5/12 ${isLeft ? 'md:mr-auto md:pr-8 md:text-right' : 'md:ml-auto md:pl-8 md:text-left md:order-last'} pl-14 md:pl-0">
                    <div class="${style.bg} border-l-4 ${style.border} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-default">
                        <!-- ヘッダー行 -->
                        <div class="flex items-center gap-2 flex-wrap ${isLeft ? 'md:justify-end' : ''}">
                            <span class="px-2 py-0.5 rounded-full text-xs font-bold text-white ${style.badge}">
                                <i class="fas ${style.icon} mr-1"></i>${style.label}
                            </span>
                            ${ev.team ? `<span class="px-2 py-0.5 rounded-full text-xs font-semibold ${ev.team === '1A' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}">チーム${ev.team}</span>` : ''}
                        </div>
                        <!-- 患者名 -->
                        <div class="mt-1 font-bold text-gray-800 text-base">${ev.patientId} ${ev.patientName}</div>
                        <!-- 詳細 -->
                        ${ev.detail    ? `<div class="text-sm ${style.text} mt-1"><i class="fas fa-info-circle mr-1"></i>${ev.detail}</div>` : ''}
                        ${ev.subDetail ? `<div class="text-xs text-gray-500 mt-0.5">${ev.subDetail}</div>` : ''}
                    </div>
                </div>

                <!-- 中央のアイコンドット（PC: 真ん中、モバイル: 左） -->
                <div class="absolute left-3 md:left-1/2 md:-translate-x-1/2 w-7 h-7 rounded-full ${style.badge} flex items-center justify-center shadow text-white text-xs z-20 top-4 md:top-4">
                    <i class="fas ${style.icon}"></i>
                </div>

                <!-- PC: 反対側スペーサー -->
                <div class="hidden md:block md:w-5/12 ${isLeft ? 'md:order-last' : ''}"></div>
            </div>`;
        });
    });

    html += `</div>`;

    // フッター: 件数表示
    html += `<div class="text-center text-sm text-gray-400 mt-6 pt-4 border-t border-gray-100">
        <i class="fas fa-check-circle mr-1"></i>全 ${events.length} 件のイベントを表示
    </div>`;

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
// エクスポート共通：フィルター適用済みデータを取得
// ===============================

function getExportPatients() {
    const statusFilter = document.getElementById('exportStatusFilter') ? document.getElementById('exportStatusFilter').value : '';
    const teamFilter   = document.getElementById('exportTeamFilter')   ? document.getElementById('exportTeamFilter').value   : '';
    const formFilter   = document.getElementById('exportFormFilter')   ? document.getElementById('exportFormFilter').value   : '';
    let patients = [...allPatients];
    if (statusFilter) patients = patients.filter(p => p.status === statusFilter);
    if (teamFilter)   patients = patients.filter(p => p.team   === teamFilter);
    if (formFilter)   patients = patients.filter(p => p.admissionForm === formFilter);
    return patients;
}

// エクスポートタブが表示されるたびに件数を更新
function updateExportCount() {
    const el = document.getElementById('exportCount');
    if (el) el.textContent = getExportPatients().length;
}

// CSVエクスポート
// ===============================

function exportCSV() {
    const patients = getExportPatients();
    if (patients.length === 0) {
        showNotification('エクスポートするデータがありません', 'error');
        return;
    }
    let csv = '\uFEFF';
    csv += '患者番号,患者名,チーム,生年月日,病名,主治医,受け持ち看護師,入院日,退院日,入院種別,入院形態,ステータス,入院日数,入院期間\n';
    patients.forEach(patient => {
        const stayDays = calculateAdmissionPeriod(patient.admissionDate, patient.dischargeDate || null);
        const stayNote = formatStayDaysNote(stayDays);
        csv += `${patient.patientId},"${patient.name}",${patient.team},${patient.dateOfBirth},"${patient.disease}","${patient.primaryPhysician}","${patient.assignedNurse || ''}",${patient.admissionDate},${patient.dischargeDate || ''},${patient.admissionType},${patient.admissionForm},${patient.status},${stayDays},"${stayNote}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `患者データ_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showNotification(`CSVファイルをエクスポートしました（${patients.length}件）`, 'success');
}

// Excelエクスポート（SheetJS使用）
// ===============================

function exportExcel() {
    const patients = getExportPatients();
    if (patients.length === 0) {
        showNotification('エクスポートするデータがありません', 'error');
        return;
    }

    if (typeof XLSX === 'undefined') {
        showNotification('Excelライブラリの読み込みに失敗しました。ページを再読み込みしてください。', 'error');
        return;
    }

    // ワークブック作成
    const wb = XLSX.utils.book_new();

    // ===== シート1: 患者データ =====
    const headers = [
        '患者番号','患者名','チーム','生年月日','病名',
        '主治医','受け持ち看護師','入院日','退院日',
        '入院種別','入院形態','ステータス','入院日数','入院期間'
    ];

    const rows = patients.map(p => {
        const stayDays = calculateAdmissionPeriod(p.admissionDate, p.dischargeDate || null);
        const stayNote = formatStayDaysNote(stayDays);
        return [
            p.patientId,
            p.name,
            p.team,
            p.dateOfBirth    || '',
            p.disease,
            p.primaryPhysician,
            p.assignedNurse  || '',
            p.admissionDate  || '',
            p.dischargeDate  || '',
            p.admissionType,
            p.admissionForm,
            p.status,
            stayDays,
            stayNote
        ];
    });

    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // 列幅設定
    ws['!cols'] = [
        {wch:12},{wch:14},{wch:8},{wch:12},{wch:20},
        {wch:14},{wch:14},{wch:12},{wch:12},
        {wch:16},{wch:14},{wch:8},{wch:10},{wch:16}
    ];

    // ヘッダー行スタイル（背景色・太字）
    const headerStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1E40AF' } },
        alignment: { horizontal: 'center' },
        border: {
            top:    { style: 'thin', color: { rgb: '93C5FD' } },
            bottom: { style: 'thin', color: { rgb: '93C5FD' } },
            left:   { style: 'thin', color: { rgb: '93C5FD' } },
            right:  { style: 'thin', color: { rgb: '93C5FD' } }
        }
    };

    headers.forEach((_, ci) => {
        const cellAddr = XLSX.utils.encode_cell({ r: 0, c: ci });
        if (ws[cellAddr]) ws[cellAddr].s = headerStyle;
    });

    // データ行：ステータスに応じて行背景色
    rows.forEach((row, ri) => {
        const status = row[11];
        const bgColor = status === '入院中' ? 'F0FDF4' : 'F9FAFB';
        const stayDays = row[12];
        const stayColor = stayDays >= 365 ? 'DC2626' : stayDays >= 180 ? 'EA580C' : stayDays >= 90 ? 'CA8A04' : '1D4ED8';

        row.forEach((_, ci) => {
            const cellAddr = XLSX.utils.encode_cell({ r: ri + 1, c: ci });
            if (!ws[cellAddr]) return;
            ws[cellAddr].s = {
                fill: { fgColor: { rgb: bgColor } },
                border: {
                    top:    { style: 'thin', color: { rgb: 'E5E7EB' } },
                    bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
                    left:   { style: 'thin', color: { rgb: 'E5E7EB' } },
                    right:  { style: 'thin', color: { rgb: 'E5E7EB' } }
                },
                // 入院日数列（index12）は色付き
                ...(ci === 12 ? { font: { bold: true, color: { rgb: stayColor } } } : {})
            };
        });
    });

    XLSX.utils.book_append_sheet(wb, ws, '患者データ');

    // ===== シート2: チーム別集計 =====
    const team1A = patients.filter(p => p.team === '1A');
    const team1B = patients.filter(p => p.team === '1B');
    const admitted1A = team1A.filter(p => p.status === '入院中').length;
    const admitted1B = team1B.filter(p => p.status === '入院中').length;
    const discharged1A = team1A.filter(p => p.status === '退院').length;
    const discharged1B = team1B.filter(p => p.status === '退院').length;

    const avgDays = (arr) => {
        if (arr.length === 0) return 0;
        const total = arr.reduce((s, p) => s + calculateAdmissionPeriod(p.admissionDate, p.dischargeDate || null), 0);
        return Math.round(total / arr.length);
    };

    const summaryData = [
        ['項目', 'チーム1A', 'チーム1B', '合計'],
        ['総患者数', team1A.length, team1B.length, patients.length],
        ['入院中', admitted1A, admitted1B, admitted1A + admitted1B],
        ['退院', discharged1A, discharged1B, discharged1A + discharged1B],
        ['平均入院日数（日）', avgDays(team1A), avgDays(team1B), avgDays(patients)],
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
    ws2['!cols'] = [{wch:20},{wch:12},{wch:12},{wch:12}];

    const summaryHeaderStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '065F46' } },
        alignment: { horizontal: 'center' }
    };
    ['A1','B1','C1','D1'].forEach(addr => {
        if (ws2[addr]) ws2[addr].s = summaryHeaderStyle;
    });

    XLSX.utils.book_append_sheet(wb, ws2, 'チーム別集計');

    // ===== 出力 =====
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `患者データ_${today}.xlsx`);
    showNotification(`Excelファイルをエクスポートしました（${patients.length}件）`, 'success');
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
    // 個別書き込み（競合防止）
    db.ref('dailyRecords/' + dateStr.replace(/-/g, '')).set(record);
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
    // 全上書きsetではなくremoveで個別削除（競合防止）
    db.ref('dailyRecords/' + dateStr.replace(/-/g, '')).remove();
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
    const dateKey = today.replace(/-/g, '');
    const ref = db.ref('dailyRecords/' + dateKey + '/' + team + '/' + type);
    // Firebase transactionでアトミックにカウントアップ（競合防止）
    ref.transaction((currentValue) => {
        return (currentValue || 0) + 1;
    });
    // dateとtimestampも保証
    db.ref('dailyRecords/' + dateKey + '/date').transaction((v) => v || today);
    db.ref('dailyRecords/' + dateKey + '/timestamp').set(new Date().toISOString());
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
            if (tabId === 'export') updateExportCount();
        if (tabId === 'homecare') renderHomecareTab();
            if (tabId === 'timeline') renderTimeline();
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
    // エクスポートフィルター変更時に件数を更新
    setTimeout(() => {
        ['exportStatusFilter','exportTeamFilter','exportFormFilter'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', updateExportCount);
        });
    }, 500);
    
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
            id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 6),
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
        // 全上書きsetではなく1件のみ書き込む（他端末のデータ保護）
        savePatientById(newPatient);
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
        const destEditEl = document.getElementById('editDischargeDestination');
        patient.transferDestination = destEditEl ? (destEditEl.value || null) : (patient.transferDestination || null);
        addHistory(patient.patientId, patient.name, '情報更新', '患者情報', oldPatient, patient);
        // 全上書きsetではなく編集患者のみ更新（競合防止）
        savePatientById(patient);
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
            // 全上書きsetではなく転出患者のみ更新（競合防止）
            savePatientById(patient);
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
                id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 6),
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
            // 全上書きsetではなく転入患者のみ書き込む
            savePatientById(newPatient);
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


// ===============================
// 印刷機能
// ===============================

// 一覧印刷
function printPatientList() {
    const searchTerm = document.getElementById('searchInput') ? document.getElementById('searchInput').value : '';
    const teamFilter = document.getElementById('teamFilter') ? document.getElementById('teamFilter').value : '';
    const statusFilter = document.getElementById('statusFilter') ? document.getElementById('statusFilter').value : '';
    const admissionFormFilter = document.getElementById('admissionFormFilter') ? document.getElementById('admissionFormFilter').value : '';

    let filtered = allPatients;
    if (searchTerm) filtered = filtered.filter(p => p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) || p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (teamFilter) filtered = filtered.filter(p => p.team === teamFilter);
    if (statusFilter) filtered = filtered.filter(p => p.status === statusFilter);
    if (admissionFormFilter) filtered = filtered.filter(p => p.admissionForm === admissionFormFilter);

    const now = new Date().toLocaleString('ja-JP');
    const filterDesc = [
        searchTerm ? `検索: ${searchTerm}` : '',
        teamFilter ? `チーム: ${teamFilter}` : '',
        statusFilter ? `ステータス: ${statusFilter}` : '',
        admissionFormFilter ? `入院形態: ${admissionFormFilter}` : ''
    ].filter(Boolean).join(' / ') || 'フィルターなし（全件）';

    let rows = '';
    filtered.forEach((p, i) => {
        const stayDays = calculateAdmissionPeriod(p.admissionDate, p.dischargeDate || null);
        rows += `<tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
            <td>${p.patientId}</td>
            <td>${p.name}</td>
            <td>${p.team}</td>
            <td>${p.disease}</td>
            <td>${p.admissionForm}</td>
            <td>${p.admissionType}</td>
            <td>${p.primaryPhysician}</td>
            <td>${p.assignedNurse || '-'}</td>
            <td>${formatDate(p.admissionDate)}</td>
            <td>${p.dischargeDate ? formatDate(p.dischargeDate) : '-'}</td>
            <td style="text-align:center;font-weight:bold">${stayDays}日</td>
            <td style="text-align:center"><span style="padding:2px 8px;border-radius:9999px;font-size:11px;background:${p.status==='入院中'?'#d1fae5':'#f3f4f6'};color:${p.status==='入院中'?'#065f46':'#374151'}">${p.status}</span></td>
        </tr>`;
    });

    const printHtml = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<title>患者一覧 ${now}</title>
<style>
  body { font-family: 'Noto Sans JP', sans-serif; font-size: 10pt; margin: 16mm; color: #111; }
  h1 { font-size: 16pt; margin-bottom: 2px; }
  .sub { font-size: 9pt; color: #555; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; }
  th { background: #1e3a5f; color: #fff; padding: 5px 6px; text-align: left; }
  td { padding: 4px 6px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
  @media print { @page { size: A4 landscape; margin: 12mm; } }
</style></head><body>
<h1>🏥 患者情報管理システム — 患者一覧</h1>
<p class="sub">印刷日時: ${now}　|　絞り込み: ${filterDesc}　|　件数: ${filtered.length}件</p>
<table>
<thead><tr>
  <th>患者番号</th><th>患者名</th><th>チーム</th><th>病名</th>
  <th>入院形態</th><th>入院種別</th><th>主治医</th><th>担当NS</th>
  <th>入院日</th><th>退院日</th><th>入院日数</th><th>状態</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>
</body></html>`;

    const win = window.open('', '_blank', 'width=1000,height=700');
    win.document.write(printHtml);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
}

// 個別カルテ印刷（プレビューモーダル表示）
let _printTargetPatient = null;

function printPatientChart(id) {
    const patient = allPatients.find(p => p.id === id);
    if (!patient) return;
    _printTargetPatient = patient;

    const stayDays = calculateAdmissionPeriod(patient.admissionDate, patient.dischargeDate || null);
    const stayNote = formatStayDaysNote(stayDays);
    const isAdmitted = patient.status === '入院中';
    const admissionFormColors = {
        '任意入院': '#d1fae5',
        '医療保護入院': '#dbeafe',
        '措置入院': '#fee2e2'
    };
    const formBg = admissionFormColors[patient.admissionForm] || '#f3f4f6';

    const preview = `
    <div style="font-family:'Noto Sans JP',sans-serif;font-size:11pt;color:#111;">
      <!-- ヘッダー -->
      <div style="text-align:center;border-bottom:3px solid #1e3a5f;padding-bottom:10px;margin-bottom:14px;">
        <div style="font-size:17pt;font-weight:bold;color:#1e3a5f;">🏥 患者情報管理システム</div>
        <div style="font-size:13pt;font-weight:bold;margin-top:4px;">個別カルテ</div>
        <div style="font-size:9pt;color:#888;margin-top:2px;">印刷日時: ${new Date().toLocaleString('ja-JP')}</div>
      </div>
      <!-- 基本情報 -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
        <tr>
          <td style="width:50%;vertical-align:top;padding:4px 8px 4px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td colspan="2" style="background:#1e3a5f;color:#fff;padding:5px 8px;font-weight:bold;font-size:10pt;">基本情報</td></tr>
              <tr style="background:#f9fafb"><td style="padding:5px 8px;color:#555;width:40%">患者番号</td><td style="padding:5px 8px;font-weight:bold">${patient.patientId}</td></tr>
              <tr><td style="padding:5px 8px;color:#555">患者名</td><td style="padding:5px 8px;font-weight:bold;font-size:13pt">${patient.name}</td></tr>
              <tr style="background:#f9fafb"><td style="padding:5px 8px;color:#555">生年月日</td><td style="padding:5px 8px">${formatDate(patient.dateOfBirth)}</td></tr>
              <tr><td style="padding:5px 8px;color:#555">チーム</td><td style="padding:5px 8px"><span style="padding:2px 10px;border-radius:9999px;background:${patient.team==='1A'?'#dbeafe':'#ede9fe'};font-weight:bold">${patient.team}</span></td></tr>
              <tr style="background:#f9fafb"><td style="padding:5px 8px;color:#555">ステータス</td><td style="padding:5px 8px"><span style="padding:2px 10px;border-radius:9999px;background:${isAdmitted?'#d1fae5':'#f3f4f6'};font-weight:bold;color:${isAdmitted?'#065f46':'#374151'}">${patient.status}</span></td></tr>
            </table>
          </td>
          <td style="width:50%;vertical-align:top;padding:4px 0 4px 8px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td colspan="2" style="background:#1e3a5f;color:#fff;padding:5px 8px;font-weight:bold;font-size:10pt;">担当医・看護師</td></tr>
              <tr style="background:#f9fafb"><td style="padding:5px 8px;color:#555;width:40%">主治医</td><td style="padding:5px 8px;font-weight:bold">${patient.primaryPhysician}</td></tr>
              <tr><td style="padding:5px 8px;color:#555">担当NS</td><td style="padding:5px 8px;font-weight:bold">${patient.assignedNurse || '—'}</td></tr>
              <tr style="background:#f9fafb"><td style="padding:5px 8px;color:#555">病名</td><td style="padding:5px 8px">${patient.disease}</td></tr>
            </table>
          </td>
        </tr>
      </table>
      <!-- 入院情報 -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
        <tr><td colspan="4" style="background:#1e3a5f;color:#fff;padding:5px 8px;font-weight:bold;font-size:10pt;">入院情報</td></tr>
        <tr style="background:#f9fafb">
          <td style="padding:5px 8px;color:#555;width:25%">入院日</td>
          <td style="padding:5px 8px;font-weight:bold">${formatDate(patient.admissionDate)}</td>
          <td style="padding:5px 8px;color:#555;width:25%">退院日</td>
          <td style="padding:5px 8px;font-weight:bold">${patient.dischargeDate ? formatDate(patient.dischargeDate) : (isAdmitted ? '<span style="color:#059669">入院中</span>' : '—')}</td>
        </tr>
        <tr>
          <td style="padding:5px 8px;color:#555">入院形態</td>
          <td style="padding:5px 8px"><span style="padding:2px 10px;border-radius:9999px;background:${formBg}">${patient.admissionForm}</span></td>
          <td style="padding:5px 8px;color:#555">入院種別</td>
          <td style="padding:5px 8px">${patient.admissionType}</td>
        </tr>
        <tr style="background:#f9fafb">
          <td style="padding:5px 8px;color:#555">入院日数</td>
          <td colspan="3" style="padding:5px 8px;font-weight:bold;font-size:13pt;color:#1e3a5f">${stayDays}日 <span style="font-size:9pt;font-weight:normal;color:#888">(${stayNote}${isAdmitted ? ' 経過中' : ''})</span></td>
        </tr>
      </table>
      <!-- 備考欄 -->
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="background:#1e3a5f;color:#fff;padding:5px 8px;font-weight:bold;font-size:10pt;">備考</td></tr>
        <tr><td style="padding:20px 8px;border:1px solid #e5e7eb;height:60px;vertical-align:top;color:#999;font-size:9pt;">（手書き記載欄）</td></tr>
      </table>
    </div>`;

    document.getElementById('printChartPreview').innerHTML = preview;
    document.getElementById('printChartModal').classList.remove('hidden');
}

function closePrintChartModal() {
    document.getElementById('printChartModal').classList.add('hidden');
    _printTargetPatient = null;
}

function executePrintChart() {
    const patient = _printTargetPatient;
    if (!patient) return;
    const stayDays = calculateAdmissionPeriod(patient.admissionDate, patient.dischargeDate || null);
    const stayNote = formatStayDaysNote(stayDays);
    const isAdmitted = patient.status === '入院中';
    const admissionFormColors = { '任意入院': '#d1fae5', '医療保護入院': '#dbeafe', '措置入院': '#fee2e2' };
    const formBg = admissionFormColors[patient.admissionForm] || '#f3f4f6';

    const printHtml = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<title>個別カルテ ${patient.name}</title>
<style>
  body { font-family: 'Noto Sans JP', sans-serif; font-size: 11pt; margin: 18mm 20mm; color: #111; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  th { background: #1e3a5f; color: #fff; padding: 6px 10px; text-align: left; font-size: 10pt; }
  td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
  tr:nth-child(odd) td { background: #f9fafb; }
  .badge { padding: 2px 10px; border-radius: 9999px; font-size: 10pt; font-weight: bold; }
  .remarks { border: 1px solid #d1d5db; height: 80px; }
  @media print { @page { size: A4 portrait; margin: 18mm 20mm; } }
</style></head><body>
<div style="text-align:center;border-bottom:3px solid #1e3a5f;padding-bottom:10px;margin-bottom:16px;">
  <div style="font-size:18pt;font-weight:bold;color:#1e3a5f;">🏥 患者情報管理システム</div>
  <div style="font-size:14pt;font-weight:bold;margin-top:4px;">個別カルテ</div>
  <div style="font-size:9pt;color:#888;margin-top:2px;">印刷日時: ${new Date().toLocaleString('ja-JP')}</div>
</div>
<table>
  <tr><th colspan="4">基本情報</th></tr>
  <tr><td style="color:#555;width:20%">患者番号</td><td style="font-weight:bold;width:30%">${patient.patientId}</td>
      <td style="color:#555;width:20%">チーム</td><td><span class="badge" style="background:${patient.team==='1A'?'#dbeafe':'#ede9fe'}">${patient.team}</span></td></tr>
  <tr><td style="color:#555">患者名</td><td style="font-weight:bold;font-size:13pt" colspan="3">${patient.name}</td></tr>
  <tr><td style="color:#555">生年月日</td><td colspan="3">${formatDate(patient.dateOfBirth)}</td></tr>
  <tr><td style="color:#555">ステータス</td><td colspan="3"><span class="badge" style="background:${isAdmitted?'#d1fae5':'#f3f4f6'};color:${isAdmitted?'#065f46':'#374151'}">${patient.status}</span></td></tr>
</table>
<table>
  <tr><th colspan="4">担当医・看護師 / 病名</th></tr>
  <tr><td style="color:#555;width:20%">主治医</td><td style="font-weight:bold;width:30%">${patient.primaryPhysician}</td>
      <td style="color:#555;width:20%">担当NS</td><td style="font-weight:bold">${patient.assignedNurse || '—'}</td></tr>
  <tr><td style="color:#555">病名</td><td colspan="3">${patient.disease}</td></tr>
</table>
<table>
  <tr><th colspan="4">入院情報</th></tr>
  <tr><td style="color:#555;width:20%">入院日</td><td style="font-weight:bold;width:30%">${formatDate(patient.admissionDate)}</td>
      <td style="color:#555;width:20%">退院日</td><td style="font-weight:bold">${patient.dischargeDate ? formatDate(patient.dischargeDate) : (isAdmitted ? '入院中' : '—')}</td></tr>
  <tr><td style="color:#555">入院形態</td><td><span class="badge" style="background:${formBg}">${patient.admissionForm}</span></td>
      <td style="color:#555">入院種別</td><td>${patient.admissionType}</td></tr>
  <tr><td style="color:#555">入院日数</td>
      <td colspan="3" style="font-weight:bold;font-size:14pt;color:#1e3a5f">${stayDays}日 <span style="font-size:9pt;font-weight:normal;color:#888">(${stayNote}${isAdmitted?' 経過中':''})</span></td></tr>
</table>
<table>
  <tr><th>備考（手書き記載欄）</th></tr>
  <tr><td class="remarks"></td></tr>
</table>
</body></html>`;

    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(printHtml);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
    closePrintChartModal();
}


// ===============================
// 在宅移行・新規率管理
// ===============================

// 在宅移行として算定できる退院先
const HOME_CARE_DESTINATIONS = ['自宅', 'グループホーム', '介護老人保健施設', '精神障害者施設'];

// 新規入院として扱う入院種別
const NEW_ADMISSION_TYPES = ['新規入院', '急性増悪'];

/**
 * 在宅移行KPIを計算する
 * @param {Array} patients - 患者リスト
 * @param {number|string} monthRange - 'current'=当月, 3/6=過去N月, 'all'=全期間
 * @returns {Object} KPIオブジェクト
 */
function calcHomecareKPI(patients, monthRange) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // フィルタリング範囲の決定
    let filterStart = null;
    let filterEnd = null;
    if (monthRange === 'current') {
        filterStart = new Date(currentYear, currentMonth, 1);
        filterEnd = new Date(currentYear, currentMonth + 1, 0);
    } else if (typeof monthRange === 'number') {
        filterStart = new Date(currentYear, currentMonth - monthRange + 1, 1);
        filterEnd = new Date(currentYear, currentMonth + 1, 0);
    }
    // 'all' は filterStart = null のまま

    // 範囲内の入院患者（入院日で絞り込み）
    function inRange(patient) {
        if (!filterStart) return true;
        const admDate = patient.admissionDate ? new Date(patient.admissionDate) : null;
        if (!admDate) return false;
        return admDate >= filterStart && admDate <= filterEnd;
    }

    const targetPatients = patients.filter(inRange);

    // 全入院（対象期間内）
    const totalAdmitted = targetPatients.length;

    // 新規入院（入院種別が新規入院または急性増悪）
    const newPatients = targetPatients.filter(p => NEW_ADMISSION_TYPES.includes(p.admissionType));
    const newCount = newPatients.length;
    const newRate = totalAdmitted > 0 ? (newCount / totalAdmitted) : null;

    // 退院した新規入院患者
    const dischargedNew = newPatients.filter(p => p.status === '退院' && p.dischargeDate);

    // 在宅移行実績（退院先が算定対象）
    const homeCareActual = dischargedNew.filter(p =>
        HOME_CARE_DESTINATIONS.some(d => p.transferDestination && p.transferDestination.includes(d))
    );
    const homeCareCount = homeCareActual.length;
    const homeCareRate = newCount > 0 ? (homeCareCount / newCount) : null;

    // 90日以内退院（新規入院患者で90日以内に退院）
    const within90 = dischargedNew.filter(p => {
        const days = calculateAdmissionPeriod(p.admissionDate, p.dischargeDate);
        return days <= 90;
    });
    const within90Rate = newCount > 0 ? (within90.length / newCount) : null;

    // 現在90日超過の入院中患者（新規・急性増悪）
    const over90Patients = patients.filter(p =>
        p.status === '入院中' &&
        NEW_ADMISSION_TYPES.includes(p.admissionType) &&
        calculateAdmissionPeriod(p.admissionDate, null) > 90
    );

    return {
        totalAdmitted,
        newCount,
        newRate,
        dischargedNewCount: dischargedNew.length,
        homeCareCount,
        homeCareRate,
        within90Count: within90.length,
        within90Rate,
        over90Patients,
        targetPatients,
        newPatients,
        dischargedNew,
        homeCareActual,
    };
}

/** パーセント表示 */
function fmtPct(rate) {
    if (rate === null || isNaN(rate)) return '-';
    return Math.round(rate * 100) + '%';
}

/** 目標達成に応じた色クラス */
function rateColorClass(rate, target) {
    if (rate === null) return 'text-gray-500';
    if (rate >= target) return 'text-emerald-600';
    if (rate >= target * 0.8) return 'text-amber-600';
    return 'text-red-600';
}

/** ダッシュボードのサマリーカードを更新 */
function updateDashboardHomecareCards() {
    const kpi = calcHomecareKPI(allPatients, 'current');
    const newRateEl = document.getElementById('dashNewRate');
    const homeCareRateEl = document.getElementById('dashHomeCareRate');
    const rate90El = document.getElementById('dash90DayRate');
    const over90El = document.getElementById('dashOver90Count');
    if (newRateEl) {
        newRateEl.textContent = fmtPct(kpi.newRate);
        newRateEl.className = 'text-3xl font-bold ' + rateColorClass(kpi.newRate, 0.6);
    }
    if (homeCareRateEl) {
        homeCareRateEl.textContent = fmtPct(kpi.homeCareRate);
        homeCareRateEl.className = 'text-3xl font-bold ' + rateColorClass(kpi.homeCareRate, 0.4);
    }
    if (rate90El) {
        rate90El.textContent = fmtPct(kpi.within90Rate);
        rate90El.className = 'text-3xl font-bold ' + rateColorClass(kpi.within90Rate, 0.4);
    }
    if (over90El) {
        over90El.textContent = kpi.over90Patients.length;
    }
}

/** 在宅移行タブを描画 */
function renderHomecareTab() {
    const rangeSelect = document.getElementById('homecareMonthFilter');
    let range = rangeSelect ? rangeSelect.value : 'current';
    if (range !== 'current' && range !== 'all') range = parseInt(range);

    const kpi = calcHomecareKPI(allPatients, range);

    // --- KPIカード更新 ---
    const set = (id, val, colorFn) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = val;
        if (colorFn) el.className = 'text-3xl font-bold ' + colorFn;
    };
    set('hc_newCount', kpi.newCount);
    set('hc_newRate', fmtPct(kpi.newRate), rateColorClass(kpi.newRate, 0.6));
    set('hc_homeCareCount', kpi.homeCareCount);
    set('hc_homeCareRate', fmtPct(kpi.homeCareRate), rateColorClass(kpi.homeCareRate, 0.4));
    set('hc_within90Rate', fmtPct(kpi.within90Rate), rateColorClass(kpi.within90Rate, 0.4));
    set('hc_over90Count', kpi.over90Patients.length);

    // --- 90日超過アラート ---
    const alertDiv = document.getElementById('hc_over90Alert');
    const alertList = document.getElementById('hc_over90List');
    if (kpi.over90Patients.length > 0 && alertDiv && alertList) {
        alertDiv.classList.remove('hidden');
        let html = `<table class="min-w-full text-sm">
            <thead><tr class="bg-red-100">
                <th class="px-3 py-2 text-left">患者番号</th>
                <th class="px-3 py-2 text-left">患者名</th>
                <th class="px-3 py-2 text-left">チーム</th>
                <th class="px-3 py-2 text-left">入院種別</th>
                <th class="px-3 py-2 text-left">入院日</th>
                <th class="px-3 py-2 text-left font-bold text-red-700">入院日数</th>
                <th class="px-3 py-2 text-left">主治医</th>
            </tr></thead><tbody>`;
        kpi.over90Patients
            .sort((a, b) => calculateAdmissionPeriod(b.admissionDate) - calculateAdmissionPeriod(a.admissionDate))
            .forEach(p => {
                const days = calculateAdmissionPeriod(p.admissionDate);
                html += `<tr class="border-b hover:bg-red-50">
                    <td class="px-3 py-2 font-medium">${p.patientId}</td>
                    <td class="px-3 py-2">${p.name}</td>
                    <td class="px-3 py-2">
                        <span class="px-2 py-0.5 rounded-full text-xs ${p.team==='1A'?'bg-blue-100 text-blue-800':'bg-purple-100 text-purple-800'}">${p.team}</span>
                    </td>
                    <td class="px-3 py-2">${p.admissionType}</td>
                    <td class="px-3 py-2">${formatDate(p.admissionDate)}</td>
                    <td class="px-3 py-2 font-bold text-red-700">${days}日 <span class="font-normal text-xs text-gray-500">(${formatStayDaysNote(days)})</span></td>
                    <td class="px-3 py-2">${p.primaryPhysician}</td>
                </tr>`;
            });
        html += '</tbody></table>';
        alertList.innerHTML = html;
    } else if (alertDiv) {
        alertDiv.classList.add('hidden');
    }

    // --- 退院先内訳 ---
    const breakdownDiv = document.getElementById('hc_destinationBreakdown');
    if (breakdownDiv) {
        const destCounts = {};
        const dischargedPatients = allPatients.filter(p => p.status === '退院');
        dischargedPatients.forEach(p => {
            const dest = p.transferDestination || '未設定';
            destCounts[dest] = (destCounts[dest] || 0) + 1;
        });
        const total = dischargedPatients.length;
        const destColors = {
            '自宅': 'bg-emerald-500',
            'グループホーム': 'bg-blue-500',
            '介護老人保健施設': 'bg-teal-500',
            '精神障害者施設': 'bg-cyan-500',
            '精神科病院': 'bg-orange-500',
            '身体科病院': 'bg-red-400',
            'その他施設': 'bg-purple-400',
            'その他': 'bg-gray-400',
            '未設定': 'bg-gray-300'
        };
        let html = '';
        Object.entries(destCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([dest, cnt]) => {
                const pct = total > 0 ? Math.round(cnt / total * 100) : 0;
                const isHomeCare = HOME_CARE_DESTINATIONS.some(d => dest.includes(d));
                const barColor = destColors[dest] || 'bg-gray-400';
                html += `<div class="flex items-center gap-2">
                    <div class="w-32 text-xs text-right ${isHomeCare ? 'font-semibold text-emerald-700' : 'text-gray-600'}">${dest}${isHomeCare ? ' ✓' : ''}</div>
                    <div class="flex-1 bg-gray-100 rounded-full h-5 relative">
                        <div class="${barColor} h-5 rounded-full" style="width:${pct}%"></div>
                    </div>
                    <div class="w-16 text-xs text-gray-600">${cnt}件 (${pct}%)</div>
                </div>`;
            });
        if (!html) html = '<p class="text-gray-400 text-sm">退院患者データがありません</p>';
        breakdownDiv.innerHTML = html;
    }

    // --- 月別在宅移行率グラフ（過去6か月） ---
    const monthlyDiv = document.getElementById('hc_monthlyChart');
    if (monthlyDiv) {
        const now = new Date();
        let rows = '';
        for (let i = 5; i >= 0; i--) {
            const y = new Date(now.getFullYear(), now.getMonth() - i, 1).getFullYear();
            const m = new Date(now.getFullYear(), now.getMonth() - i, 1).getMonth();
            const monthKpi = calcHomecareKPI(allPatients, 'custom_' + i);
            // 月ごとに計算
            const mStart = new Date(y, m, 1);
            const mEnd = new Date(y, m + 1, 0);
            const monthPatients = allPatients.filter(p => {
                const d = p.admissionDate ? new Date(p.admissionDate) : null;
                return d && d >= mStart && d <= mEnd;
            });
            const mNew = monthPatients.filter(p => NEW_ADMISSION_TYPES.includes(p.admissionType));
            const mDischarged = mNew.filter(p => p.status === '退院' && p.dischargeDate);
            const mHomeCare = mDischarged.filter(p =>
                HOME_CARE_DESTINATIONS.some(d => p.transferDestination && p.transferDestination.includes(d))
            );
            const rate = mNew.length > 0 ? (mHomeCare.length / mNew.length) : null;
            const pct = rate !== null ? Math.round(rate * 100) : 0;
            const label = `${y}/${String(m + 1).padStart(2, '0')}`;
            const color = rate === null ? 'bg-gray-200' : (rate >= 0.4 ? 'bg-emerald-500' : rate >= 0.3 ? 'bg-amber-500' : 'bg-red-400');
            rows += `<div class="flex items-center gap-2">
                <div class="w-14 text-xs text-right text-gray-600">${label}</div>
                <div class="flex-1 bg-gray-100 rounded-full h-5 relative">
                    <div class="${color} h-5 rounded-full" style="width:${Math.max(pct, 2)}%"></div>
                </div>
                <div class="w-20 text-xs ${color.includes('emerald') ? 'text-emerald-700 font-bold' : color.includes('amber') ? 'text-amber-700' : 'text-red-600'}">${rate !== null ? pct + '%' : 'データなし'} (${mHomeCare.length}/${mNew.length})</div>
            </div>`;
        }
        monthlyDiv.innerHTML = rows || '<p class="text-gray-400 text-sm">データがありません</p>';
    }

    // --- 新規入院患者一覧（在宅移行状況） ---
    const patListDiv = document.getElementById('hc_patientList');
    if (patListDiv) {
        const targetList = kpi.newPatients;
        if (targetList.length === 0) {
            patListDiv.innerHTML = '<p class="text-gray-400 text-sm text-center py-4">対象患者データがありません</p>';
        } else {
            let html = `<table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">患者番号</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">患者名</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">チーム</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">入院種別</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">入院日</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">入院日数</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">退院日</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">退院先</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">在宅移行</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                </tr></thead><tbody class="bg-white divide-y divide-gray-200">`;

            targetList
                .sort((a, b) => new Date(b.admissionDate) - new Date(a.admissionDate))
                .forEach(p => {
                    const days = calculateAdmissionPeriod(p.admissionDate, p.dischargeDate || null);
                    const isAdmitted = p.status === '入院中';
                    const over90 = isAdmitted && days > 90;
                    const isHomeCare = p.transferDestination &&
                        HOME_CARE_DESTINATIONS.some(d => p.transferDestination.includes(d));
                    const within90Discharged = !isAdmitted && p.dischargeDate && days <= 90;
                    const rowBg = over90 ? 'bg-red-50' : (isHomeCare ? 'bg-emerald-50' : '');
                    const daysColor = over90 ? 'text-red-600 font-bold' : (days > 60 ? 'text-amber-600 font-semibold' : 'text-gray-900');
                    const typeColor = {'新規入院': 'bg-blue-100 text-blue-800', '急性増悪': 'bg-orange-100 text-orange-800'}[p.admissionType] || 'bg-gray-100 text-gray-800';
                    const statusColor = isAdmitted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';

                    html += `<tr class="${rowBg} hover:bg-gray-50">
                        <td class="px-3 py-2 font-medium">${p.patientId}</td>
                        <td class="px-3 py-2">${p.name}</td>
                        <td class="px-3 py-2">
                            <span class="px-2 py-0.5 rounded-full text-xs ${p.team==='1A'?'bg-blue-100 text-blue-800':'bg-purple-100 text-purple-800'}">${p.team}</span>
                        </td>
                        <td class="px-3 py-2">
                            <span class="px-2 py-0.5 rounded-full text-xs ${typeColor}">${p.admissionType}</span>
                        </td>
                        <td class="px-3 py-2">${formatDate(p.admissionDate)}</td>
                        <td class="px-3 py-2 ${daysColor}">
                            ${days}日
                            ${over90 ? '<span class="ml-1 px-1 py-0.5 bg-red-100 text-red-700 text-xs rounded">⚠️90日超</span>' : ''}
                            ${within90Discharged ? '<span class="ml-1 px-1 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">90日以内✓</span>' : ''}
                        </td>
                        <td class="px-3 py-2 text-gray-600">${p.dischargeDate ? formatDate(p.dischargeDate) : '<span class="text-gray-400">-</span>'}</td>
                        <td class="px-3 py-2">${p.transferDestination || '<span class="text-gray-400">未設定</span>'}</td>
                        <td class="px-3 py-2 text-center">
                            ${isHomeCare ? '<span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-bold">✓ 算定</span>' :
                              isAdmitted ? '<span class="px-2 py-0.5 bg-blue-50 text-blue-500 text-xs rounded-full">入院中</span>' :
                              '<span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">対象外</span>'}
                        </td>
                        <td class="px-3 py-2">
                            <span class="px-2 py-0.5 rounded-full text-xs ${statusColor}">${p.status}</span>
                        </td>
                    </tr>`;
                });
            html += '</tbody></table>';
            patListDiv.innerHTML = html;
        }
    }
}

/** showTab ヘルパー（ダッシュボードから詳細に遷移） */
function showTab(tabId) {
    const btn = document.querySelector(`[data-tab="${tabId}"]`);
    if (btn) btn.click();
}
