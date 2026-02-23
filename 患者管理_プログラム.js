  1	// ===============================
     2	// ログイン認証
     3	// ===============================
     4	
     5	// パスワード設定（変更してください）
     6	const SYSTEM_PASSWORD = 'Asahi101';
     7	
     8	// ログイン状態をチェック
     9	function checkLoginStatus() {
    10	    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    11	    if (isLoggedIn === 'true') {
    12	        showMainContent();
    13	    } else {
    14	        showLoginScreen();
    15	    }
    16	}
    17	
    18	// ログイン画面を表示
    19	function showLoginScreen() {
    20	    document.getElementById('loginScreen').classList.remove('hidden');
    21	    document.getElementById('mainContent').classList.add('hidden');
    22	}
    23	
    24	// メインコンテンツを表示
    25	function showMainContent() {
    26	    document.getElementById('loginScreen').classList.add('hidden');
    27	    document.getElementById('mainContent').classList.remove('hidden');
    28	}
    29	
    30	// ログイン処理
    31	function handleLogin(event) {
    32	    event.preventDefault();
    33	    
    34	    const passwordInput = document.getElementById('passwordInput');
    35	    const loginError = document.getElementById('loginError');
    36	    const enteredPassword = passwordInput.value;
    37	    
    38	    if (enteredPassword === SYSTEM_PASSWORD) {
    39	        // ログイン成功
    40	        sessionStorage.setItem('isLoggedIn', 'true');
    41	        loginError.classList.add('hidden');
    42	        showMainContent();
    43	        
    44	        // パスワード入力欄をクリア
    45	        passwordInput.value = '';
    46	        
    47	        // データを読み込んで表示を更新
    48	        loadPatientsFromStorage();
    49	        loadHistoryFromStorage();
    50	        loadTransfersFromStorage();
    51	        loadDailyRecords();
    52	        updateDashboard();
    53	        renderPatientsList();
    54	        renderDischargeList();
    55	        renderRecentDischargeList();
    56	        renderHistoryList();
    57	        renderTransferHistory();
    58	        renderDailyRecordsList();
    59	        
    60	        showNotification('ログインしました', 'success');
    61	    } else {
    62	        // ログイン失敗
    63	        loginError.classList.remove('hidden');
    64	        passwordInput.value = '';
    65	        passwordInput.focus();
    66	        
    67	        // エラーメッセージを3秒後に非表示
    68	        setTimeout(() => {
    69	            loginError.classList.add('hidden');
    70	        }, 3000);
    71	    }
    72	}
    73	
    74	// ログアウト処理
    75	function handleLogout() {
    76	    if (confirm('ログアウトしますか？')) {
    77	        sessionStorage.removeItem('isLoggedIn');
    78	        showLoginScreen();
    79	        showNotification('ログアウトしました', 'success');
    80	    }
    81	}
    82	
    83	// ===============================
    84	// データ管理
    85	// ===============================
    86	
    87	// ローカルストレージキー
    88	const STORAGE_KEY = 'psychiatricPatientsData';
    89	const HISTORY_KEY = 'psychiatricPatientsHistory';
    90	const TRANSFER_KEY = 'psychiatricTransferHistory';
    91	
    92	// グローバル変数
    93	let allPatients = [];
    94	let allHistory = [];
    95	let allTransfers = [];
    96	let importData = [];
    97	let teamChart = null;
    98	let diseaseChart = null;
    99	let periodChart = null;
   100	let admissionTypeChart = null;
