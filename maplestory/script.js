// 오늘 날짜를 yyyy-mm-dd 형식으로 반환하는 함수
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    dateInput.min = '2023-12-21'; // 날짜의 최소값 설정
    dateInput.value = getTodayDate(); // 기본값을 오늘 날짜로 설정
});

document.getElementById('characterForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    const API_KEY = "test_57823a841ba62caafbe38f5b8df5077f5c62e11b01b7c76fa6bbec7859869957efe8d04e6d233bd35cf2fabdeb93fb0d";
    const characterName = document.getElementById('characterName').value; // 입력된 캐릭터 이름 가져오기
    const date = document.getElementById('date').value; // 입력된 날짜 가져오기
    const resultDiv = document.getElementById('result');
    const equipmentDiv = document.getElementById('equipment'); // 장비 아이템을 표시할 div 가져오기
    resultDiv.textContent = '조회 중...';
    equipmentDiv.innerHTML = '';

    const encodedCharacterName = encodeURIComponent(characterName);
    const urlString = "https://open.api.nexon.com/maplestory/v1/id?character_name=" + encodedCharacterName;

    try {
        const ocidResponse = await fetch(urlString, {
            headers: {
                "x-nxopen-api-key": API_KEY
            }
        });

        if (!ocidResponse.ok) {
            throw new Error('Network response was not ok ' + ocidResponse.statusText);
        }

        const ocidData = await ocidResponse.json();
        console.log('OCID Data:', ocidData);

        const ocid = ocidData.characterId || ocidData.ocid || ocidData[0]?.characterId;
        if (!ocid) {
            resultDiv.textContent = '캐릭터를 찾을 수 없습니다.';
            return;
        }

        const characterInfoUrl = `https://open.api.nexon.com/maplestory/v1/character/basic?ocid=${ocid}&date=${date}`;
        const characterInfoResponse = await fetch(characterInfoUrl, {
            headers: {
                "x-nxopen-api-key": API_KEY
            }
        });

        if (!characterInfoResponse.ok) {
            throw new Error('Network response was not ok ' + characterInfoResponse.statusText);
        }

        const characterInfoData = await characterInfoResponse.json();
        console.log('Character Info Data:', characterInfoData);

        const equipmentInfoUrl = `https://open.api.nexon.com/maplestory/v1/character/item-equipment?ocid=${ocid}&date=${date}`;
        const equipmentInfoResponse = await fetch(equipmentInfoUrl, {
            headers: {
                "x-nxopen-api-key": API_KEY
            }
        });

        if (!equipmentInfoResponse.ok) {
            throw new Error('Network response was not ok ' + equipmentInfoResponse.statusText);
        }

        const equipmentInfoData = await equipmentInfoResponse.json();
        console.log('Equipment Info Data:', equipmentInfoData);

        resultDiv.innerHTML = `
            <img src="${characterInfoData.character_image}" alt="캐릭터 이미지">
            <p>캐릭터 이름: ${characterInfoData.character_name}</p>
            <p>캐릭터 레벨: ${characterInfoData.character_level}</p>
            <p>캐릭터 직업: ${characterInfoData.character_class}</p>
            <p>월드: ${characterInfoData.world_name}</p>
        `;

        if (Array.isArray(equipmentInfoData.item_equipment) && equipmentInfoData.item_equipment.length > 0) {
            let itemIndex = 1; // Initialize the item index counter
            const ulElement = document.createElement('ul');

            // 타이틀을 장비 아이템 목록에 추가
            const titleItem = document.createElement('li');
            titleItem.className = `Itemlist${itemIndex++}`;
            titleItem.innerHTML = `<img src="${equipmentInfoData.title.title_icon}" alt="${equipmentInfoData.title.title_name}">`;
            ulElement.appendChild(titleItem);   

            equipmentInfoData.item_equipment.forEach(item => {
                const liElement = document.createElement('li');
                liElement.className = `Itemlist${itemIndex++}`;
                liElement.innerHTML = `<img src="${item.item_icon}" alt="${item.item_name}">`;
                ulElement.appendChild(liElement);
            });

            equipmentDiv.innerHTML = `
                <h3>장비 아이템</h3>
                ${ulElement.outerHTML}
            `;
        } else {
            equipmentDiv.innerHTML = '<p>장비 아이템 정보를 찾을 수 없습니다.</p>';
        }
    } catch (error) {
        console.error('Fetch error: ', error);
        resultDiv.textContent = '오류: ' + error.message;
    }
});
