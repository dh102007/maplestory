document.addEventListener('DOMContentLoaded', function() {
    const characterName = localStorage.getItem('characterName');
    const selectedDate = localStorage.getItem('selectedDate');
    if (!characterName || !selectedDate) {
        alert('캐릭터 이름 또는 날짜가 입력되지 않았습니다.');
        window.location.href = 'index.html';
        return;
    }

    const resultDivElement = document.getElementById('result');
    const equipmentDivElement = document.getElementById('equipment');
    const skillFiveDivElement = document.getElementById('skillFive');
    const skillSixDivElement = document.getElementById('skillSix');
    resultDivElement.textContent = '조회 중...';
    equipmentDivElement.innerHTML = '';
    skillFiveDivElement.innerHTML = '';
    skillSixDivElement.innerHTML = '';

    const API_KEY = "";

    async function fetchCharacterInfo() {
        try {
            const encodedCharacterName = encodeURIComponent(characterName);
            const ocidResponse = await fetch(`https://open.api.nexon.com/maplestory/v1/id?character_name=${encodedCharacterName}`, {
                headers: { "x-nxopen-api-key": API_KEY }
            });
            if (!ocidResponse.ok) throw new Error('Network response was not ok ' + ocidResponse.statusText);

            const ocidData = await ocidResponse.json();
            const ocid = ocidData.characterId || ocidData.ocid || ocidData[0]?.characterId;
            if (!ocid) {
                resultDivElement.textContent = '캐릭터를 찾을 수 없습니다.';
                return;
            }

            const [
                characterInfoResponse,
                equipmentInfoResponse,
                characterSkillFiveResponse,
                characterSkillSixResponse
            ] = await Promise.all([
                fetch(`https://open.api.nexon.com/maplestory/v1/character/basic?ocid=${ocid}&date=${selectedDate}`, {
                    headers: { "x-nxopen-api-key": API_KEY }
                }),
                fetch(`https://open.api.nexon.com/maplestory/v1/character/item-equipment?ocid=${ocid}&date=${selectedDate}`, {
                    headers: { "x-nxopen-api-key": API_KEY }
                }),
                fetch(`https://open.api.nexon.com/maplestory/v1/character/skill?ocid=${ocid}&date=${selectedDate}&character_skill_grade=5`, {
                    headers: { "x-nxopen-api-key": API_KEY }
                }),
                fetch(`https://open.api.nexon.com/maplestory/v1/character/skill?ocid=${ocid}&date=${selectedDate}&character_skill_grade=6`, {
                    headers: { "x-nxopen-api-key": API_KEY }
                })
            ]);

            if (!characterInfoResponse.ok) throw new Error('Network response was not ok ' + characterInfoResponse.statusText);
            if (!equipmentInfoResponse.ok) throw new Error('Network response was not ok ' + equipmentInfoResponse.statusText);
            if (!characterSkillFiveResponse.ok) throw new Error('Network response was not ok ' + characterSkillFiveResponse.statusText);
            if (!characterSkillSixResponse.ok) throw new Error('Network response was not ok ' + characterSkillSixResponse.statusText);

            const characterInfoData = await characterInfoResponse.json();
            const equipmentInfoData = await equipmentInfoResponse.json();
            const characterSkillFiveData = await characterSkillFiveResponse.json();
            const characterSkillSixData = await characterSkillSixResponse.json();

            // Display character basic info in resultDivElement
            resultDivElement.innerHTML = `
                <img src="${characterInfoData.character_image}" alt="캐릭터 이미지">
                <p>캐릭터 이름: ${characterInfoData.character_name}</p>
                <p>캐릭터 레벨: ${characterInfoData.character_level}</p>
                <p>캐릭터 직업: ${characterInfoData.character_class}</p>
                <p>월드: ${characterInfoData.world_name}</p>
            `;

            // Display equipment item info in equipmentDivElement
            if (Array.isArray(equipmentInfoData.item_equipment) && equipmentInfoData.item_equipment.length > 0) {
                const ulElement = document.createElement('ul');
                const titleItemElement = document.createElement('li');
                titleItemElement.innerHTML = `<img src="${equipmentInfoData.title.title_icon}" alt="${equipmentInfoData.title.title_name}" title="${equipmentInfoData.title.title_name}">`;
                ulElement.appendChild(titleItemElement);

                equipmentInfoData.item_equipment.forEach((item) => {
                    const liElement = document.createElement('li');
                    liElement.innerHTML = `<img src="${item.item_icon}" alt="${item.item_name}" title="${item.item_name}">`;
                    ulElement.appendChild(liElement);
                });

                equipmentDivElement.innerHTML = `<h3>장비 아이템</h3>${ulElement.outerHTML}`;
            } else {
                equipmentDivElement.innerHTML = '<p>장비 아이템 정보를 찾을 수 없습니다.</p>';
            }

            // Display 5th skill info in skillFiveDivElement
            if (Array.isArray(characterSkillFiveData.character_skill) && characterSkillFiveData.character_skill.length > 0) {
                const skillFiveListElement = document.createElement('ul');
                characterSkillFiveData.character_skill.forEach((skill) => {
                    const liElement = document.createElement('li');
                    liElement.innerHTML = `<img src="${skill.skill_icon}" alt="${skill.skill_name}" title="${skill.skill_name}">`;
                    skillFiveListElement.appendChild(liElement);
                });
                skillFiveDivElement.innerHTML = `<h3>5차 스킬</h3>${skillFiveListElement.outerHTML}`;
            } else {
                skillFiveDivElement.innerHTML = '<p>5차 스킬 정보를 찾을 수 없습니다.</p>';
            }

            // Display 6th skill info in skillSixDivElement
            if (Array.isArray(characterSkillSixData.character_skill) && characterSkillSixData.character_skill.length > 0) {
                const skillSixListElement = document.createElement('ul');
                characterSkillSixData.character_skill.forEach((skill) => {
                    const liElement = document.createElement('li');
                    liElement.innerHTML = `<img src="${skill.skill_icon}" alt="${skill.skill_name}" title="${skill.skill_name}">`;
                    skillSixListElement.appendChild(liElement);
                });
                skillSixDivElement.innerHTML = `<h3>6차 스킬</h3>${skillSixListElement.outerHTML}`;
            } else {
                skillSixDivElement.innerHTML = '<p>6차 스킬 정보를 찾을 수 없습니다.</p>';
            }

        } catch (error) {
            console.error('Fetch error: ', error);
            resultDivElement.textContent = '오류: ' + error.message;
        }
    }

    fetchCharacterInfo();
});
