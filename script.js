// 聖經靈修網站 JavaScript 功能

// 全域變數
let currentUser = null;
let selectedEmotion = null;
let currentDate = new Date().toISOString().split('T')[0];

// 登出函數
function doLogout() {
    console.log('登出按鈕被點擊');
    if (confirm('確定要登出嗎？登出後其他人可以重新登入。')) {
        // 清除當前登入狀態
        currentUser = null;
        localStorage.removeItem('currentUser');
        
        // 清空所有表單內容
        clearForm();
        
        // 回到登入頁面
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('appContent').classList.remove('active');
        
        // 清空登入表單
        document.getElementById('usernameInput').value = '';
        document.getElementById('passwordInput').value = '';
        
        // 重置統計數據顯示
        document.getElementById('totalDays').textContent = '0';
        document.getElementById('thisWeek').textContent = '0';
        document.getElementById('thisMonth').textContent = '0';
        document.getElementById('streak').textContent = '0';
        
        // 顯示通用歡迎訊息
        document.getElementById('historyList').innerHTML = `
            <div class="history-item">
                <div class="history-date">請登入查看您的靈修記錄</div>
                <div class="history-content">登入後可以查看您的個人靈修歷程</div>
            </div>
        `;
        
        console.log('已登出，用戶資料已保留');
    }
}

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
    console.log('頁面載入完成');
    
    // 設定今天日期
    document.getElementById('datePicker').value = currentDate;
    
    // 檢查是否有已登入用戶
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showUserLoggedIn();
    }
    
    // 綁定保存按鈕
    const saveButton = document.getElementById('saveBtn');
    if (saveButton) {
        saveButton.onclick = function() {
            console.log('保存按鈕被點擊');
            
            if (!currentUser) {
                alert('請先登入！');
                return;
            }
            
            const verseRef = document.getElementById('verseReference').value.trim();
            const verseContent = document.getElementById('verseContent').value.trim();
            const devotion = document.getElementById('devotionContent').value.trim();
            const emotionNote = document.getElementById('emotionNote').value.trim();
            
            console.log('讀取到的值:');
            console.log('- verseRef:', verseRef);
            console.log('- verseContent:', verseContent);
            console.log('- devotion:', devotion);
            console.log('- emotionNote:', emotionNote);
            console.log('- selectedEmotion:', selectedEmotion);
            
            if (!verseContent && !devotion && !emotionNote && !selectedEmotion) {
                alert('請至少填寫一項內容或選擇情緒！');
                return;
            }
            
            const record = {
                date: currentDate,
                timestamp: Date.now(),
                verseReference: verseRef,
                verse: verseContent,
                devotion: devotion,
                emotion: selectedEmotion || '',
                emotionNote: emotionNote
            };
            
            console.log('準備保存的記錄:', record);
            
            let records = JSON.parse(localStorage.getItem(getUserKey('records')) || '[]');
            const existingIndex = records.findIndex(r => r.date === currentDate);
            
            if (existingIndex >= 0) {
                records[existingIndex] = record;
            } else {
                records.push(record);
            }
            
            records.sort((a, b) => new Date(b.date) - new Date(a.date));
            localStorage.setItem(getUserKey('records'), JSON.stringify(records));
            
            console.log('記錄已保存');
            
            // 更新顯示
            showSavedMessage();
            updateStats();
            updateHistory();
        };
    }
    
    // 綁定登入按鈕
    document.getElementById('loginBtn').onclick = function() {
        console.log('登入按鈕被點擊');
        const username = document.getElementById('usernameInput').value.trim();
        const password = document.getElementById('passwordInput').value.trim();
        
        if (!username) {
            alert('請輸入您的姓名或暱稱！');
            return;
        }
        
        if (!password) {
            alert('請輸入密碼！');
            return;
        }
        
        if (username.length > 20) {
            alert('名稱不能超過20個字元！');
            return;
        }
        
        if (password.length < 4) {
            alert('密碼至少需要4位！');
            return;
        }
        
        // 檢查用戶是否存在
        const savedPassword = localStorage.getItem('user_' + username + '_password');
        
        if (savedPassword) {
            // 用戶存在，檢查密碼
            if (savedPassword !== password) {
                alert('密碼錯誤！');
                return;
            }
        } else {
            // 新用戶，儲存密碼
            localStorage.setItem('user_' + username + '_password', password);
            alert('新用戶註冊成功！');
        }
        
        // 執行登入
        currentUser = username;
        localStorage.setItem('currentUser', username);
        showUserLoggedIn();
        
        console.log('登入成功:', username);
    };
    
    // 綁定日期相關按鈕
    document.getElementById('prevBtn').onclick = function() {
        changeDate(-1);
    };
    
    document.getElementById('nextBtn').onclick = function() {
        changeDate(1);
    };
    
    document.getElementById('todayBtn').onclick = function() {
        goToToday();
    };
    
    document.getElementById('datePicker').onchange = function() {
        loadSelectedDate();
    };
    
    // 綁定情緒按鈕
    document.querySelectorAll('.emotion-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedEmotion = this.dataset.emotion;
        };
    });
    
    // Enter 鍵登入
    document.getElementById('usernameInput').onkeypress = function(e) {
        if (e.key === 'Enter') {
            document.getElementById('passwordInput').focus();
        }
    };
    
    document.getElementById('passwordInput').onkeypress = function(e) {
        if (e.key === 'Enter') {
            document.getElementById('loginBtn').click();
        }
    };
    
    // 初始化
    updateStats();
    updateHistory();
    loadSelectedDate();
});

// 顯示已登入狀態
function showUserLoggedIn() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('userInfo').style.display = 'block';
    document.getElementById('currentUsername').textContent = currentUser;
    document.getElementById('appContent').classList.add('active');
}

// 獲取用戶專屬鍵值
function getUserKey(key) {
    return currentUser + '_' + key;
}

// 顯示保存成功訊息
function showSavedMessage() {
    const msg = document.getElementById('savedMessage');
    msg.style.display = 'block';
    setTimeout(() => {
        msg.style.display = 'none';
    }, 3000);
}

// 日期操作函數
function changeDate(days) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    currentDate = date.toISOString().split('T')[0];
    document.getElementById('datePicker').value = currentDate;
    loadSelectedDate();
}

function goToToday() {
    currentDate = new Date().toISOString().split('T')[0];
    document.getElementById('datePicker').value = currentDate;
    loadSelectedDate();
}

function loadSelectedDate() {
    currentDate = document.getElementById('datePicker').value;
    
    if (!currentUser) return;
    
    const records = JSON.parse(localStorage.getItem(getUserKey('records')) || '[]');
    const record = records.find(r => r.date === currentDate);
    
    clearForm();
    
    if (record) {
        document.getElementById('verseReference').value = record.verseReference || '';
        document.getElementById('verseContent').value = record.verse || '';
        document.getElementById('devotionContent').value = record.devotion || '';
        document.getElementById('emotionNote').value = record.emotionNote || '';
        
        if (record.emotion) {
            const btn = document.querySelector(`[data-emotion="${record.emotion}"]`);
            if (btn) {
                btn.classList.add('active');
                selectedEmotion = record.emotion;
            }
        }
    }
}

// 清空表單
function clearForm() {
    document.getElementById('verse