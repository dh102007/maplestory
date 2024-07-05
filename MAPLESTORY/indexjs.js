function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const dateInputElement = document.getElementById('date');
    dateInputElement.min = '2023-12-21'; // Set minimum date
    dateInputElement.value = getTodayDate(); // Set default value to today
});

document.getElementById('searchButton').addEventListener('click', function(event) {
    event.preventDefault();
    const characterName = document.getElementById('characterName').value;
    const selectedDate = document.getElementById('date').value;
    if (!characterName || !selectedDate) {
        alert('캐릭터 이름과 날짜를 모두 입력해주세요.');
        return;
    }
    localStorage.setItem('characterName', characterName);
    localStorage.setItem('selectedDate', selectedDate);
    window.location.href = 'characterInfo.html';
});