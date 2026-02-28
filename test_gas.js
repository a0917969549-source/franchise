const url = 'https://script.google.com/macros/s/AKfycbywiuibjcTZMy7x6kIhgxQQux1q7u5Byt71VuOc4hi2-9FlD8EoraNzyYJuY6pzGd1psw/exec';
const data = new URLSearchParams();
data.append('type', 'form-c');
data.append('name', 'KenTest');
data.append('phone', '0912345678');
data.append('email', 'test@test.com');
data.append('lineId', 'ken123');
data.append('status', 'other');
data.append('traps', 'hidden costs');

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: data
})
.then(res => res.text())
.then(text => console.log('Response:', text))
.catch(err => console.error('Error:', err));
