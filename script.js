document.addEventListener('DOMContentLoaded', () => {
    // 表單頁籤切換邏輯
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有 active 狀態
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // 加上 active 狀態給點擊的目標
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 處理身分下拉選單「其他」邏輯
    const statusSelect = document.getElementById('status-select');
    const otherStatusGroup = document.getElementById('other-status-group');
    const otherStatusInput = document.getElementById('other-status-input');

    if (statusSelect && otherStatusGroup && otherStatusInput) {
        statusSelect.addEventListener('change', function () {
            if (this.value === 'other') {
                otherStatusGroup.style.display = 'block';
                otherStatusInput.setAttribute('required', 'required');
            } else {
                otherStatusGroup.style.display = 'none';
                otherStatusInput.removeAttribute('required');
                otherStatusInput.value = ''; // 清空內容
            }
        });
    }

    // 錨點平滑滾動
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ==== Google Sheets API 設定 ====
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbywiuibjcTZMy7x6kIhgxQQux1q7u5Byt71VuOc4hi2-9FlD8EoraNzyYJuY6pzGd1psw/exec';

    // 表單送出模擬回饋與資料串接
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 檢查「其他」是否填寫 (針對 C 端)
            if (form.id === 'form-c') {
                const formStatusSelect = document.getElementById('status-select');
                const formOtherStatusInput = document.getElementById('other-status-input');
                if (formStatusSelect && formStatusSelect.value === 'other' && !formOtherStatusInput.value.trim()) {
                    alert('請說明您的其他身分！');
                    formOtherStatusInput.focus();
                    return;
                }
            }

            const btn = form.querySelector('.submit-btn');
            const originalText = btn.innerText;

            btn.innerText = '資料送出中...';
            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none';

            // 準備要傳送的 payload
            let payload = {};

            if (form.id === 'form-c') {
                const inputs = form.querySelectorAll('input, select');
                const trapCheckboxes = form.querySelectorAll('input[name="trap"]:checked');
                const traps = Array.from(trapCheckboxes).map(cb => cb.parentElement.textContent.trim()).join(', ');

                let selectedStatusText = inputs[4].options[inputs[4].selectedIndex].text;
                if (inputs[4].value === 'other') {
                    selectedStatusText = inputs[5].value.trim(); // 取得「其他」文字框內容
                }

                payload = {
                    type: 'form-c',
                    name: inputs[0].value.trim(),
                    phone: inputs[1].value.trim(),
                    email: inputs[2].value.trim(),
                    lineId: inputs[3].value.trim() || '無',
                    status: selectedStatusText,
                    traps: traps || '無勾選'
                };
            } else if (form.id === 'form-b') {
                const inputs = form.querySelectorAll('input, select');
                const textarea = form.querySelector('textarea');
                payload = {
                    type: 'form-b',
                    brandName: inputs[0].value.trim(),
                    contactPerson: inputs[1].value.trim(),
                    email: inputs[2].value.trim(),
                    content: textarea.value.trim(),
                    scale: inputs[3].options[inputs[3].selectedIndex].text
                };
            }

            try {
                // 如果沒有設定 URL，先模擬成功動畫給您看流程
                if (GOOGLE_SCRIPT_URL === '請在這裡貼上您的APPS_SCRIPT_網頁應用程式_網址') {
                    console.log('尚未設定 Google Script URL，模擬傳送資料：', payload);
                    // 模擬假延遲
                    await new Promise(resolve => setTimeout(resolve, 800));
                } else {
                    // 呼叫 Google Apps Script API (改用 URLSearchParams 安全送出)
                    const formData = new URLSearchParams();
                    for (const key in payload) {
                        formData.append(key, payload[key]);
                    }

                    await fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors', // 告訴瀏覽器不要等待 CORS header，直接送出單向請求
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: formData
                    });

                    // 注意：設定 no-cors 後，response.ok 會是 undefined (opaque response)，
                    // 所以只要 fetch 沒有 crash，我們就視為請求已經送出。
                }

                // UI 成功回饋
                btn.innerText = '提交成功！我們將盡快與您聯繫。';
                btn.style.backgroundColor = '#15803D'; // Signal Green
                btn.style.color = '#fff';
                btn.style.borderColor = '#15803D';

                setTimeout(() => {
                    form.reset();
                    // 隱藏「其他」輸入框
                    if (otherStatusGroup) otherStatusGroup.style.display = 'none';

                    btn.innerText = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.color = '';
                    btn.style.borderColor = '';
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                }, 3000);

            } catch (error) {
                console.error('Submission error:', error);
                btn.innerText = '發生錯誤，請稍後再試。';
                btn.style.backgroundColor = '#DC2626'; // Alert Red
                btn.style.color = '#fff';
                btn.style.borderColor = '#DC2626';

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.color = '';
                    btn.style.borderColor = '';
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                }, 3000);
            }
        });
    });
});
