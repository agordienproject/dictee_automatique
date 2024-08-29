document.addEventListener('DOMContentLoaded', () => {
    // Sélection des éléments HTML
    const wordListInput = document.getElementById('word-list');
    const startButton = document.getElementById('start-button');
    const dictationSection = document.getElementById('dictation-section');
    const currentWordDisplay = document.getElementById('current-word');
    const wordInput = document.getElementById('word-input');
    const repeatButton = document.getElementById('repeat-button');
    const nextButton = document.getElementById('next-button');
    const resultSection = document.getElementById('result-section');
    const scoreDisplay = document.getElementById('score');
    const retryButton = document.getElementById('retry-button');
    const voiceInputButton = document.getElementById('voice-input-button');
    const voiceInputResult = document.getElementById('voice-input-result');
    const microphoneIcon = document.getElementById('microphone-icon');
    const fileInput = document.getElementById('file-input');
    const excelParams = document.getElementById('excel-params');
    const columnStartInput = document.getElementById('column-start');
    const rowStartInput = document.getElementById('row-start');
    const validateExcelButton = document.getElementById('validate-excel-button');

    // Variables pour gérer l'état de la dictée
    let words = [];
    let currentWordIndex = 0;
    let correctCount = 0;
    let userInputs = [];
    let fileData = null;

    // Fonction pour démarrer la dictée
    function startDictation() {
        // Récupération des mots depuis la textarea
        const text = wordListInput.value;
        words = text.split('\n').filter(word => word.trim() !== '');
        currentWordIndex = 0;
        correctCount = 0;
        userInputs = [];

        // Si la liste de mots n'est pas vide, on commence la dictée
        if (words.length > 0) {
            document.getElementById('input-section').style.display = 'none';
            dictationSection.style.display = 'block';
            showCurrentWord();
        }
    }

    // Fonction pour afficher le mot actuel
    function showCurrentWord() {
        currentWordDisplay.textContent = `Mot ${currentWordIndex + 1} / ${words.length}`;
        speakWord(words[currentWordIndex]);
        nextButton.textContent = (currentWordIndex === words.length - 1) ? 'Correction' : 'Mot suivant';
    }

    // Fonction pour utiliser la synthèse vocale
    function speakWord(word) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'fr-FR';
        speechSynthesis.speak(utterance);
    }

    // Fonction pour vérifier le mot entré par l'utilisateur
    function checkWord() {
        const userInput = wordInput.value.trim();
        userInputs.push(userInput);
        if (userInput.toLowerCase() === words[currentWordIndex].toLowerCase()) {
            correctCount++;
        }
        wordInput.value = '';
        currentWordIndex++;
        if (currentWordIndex < words.length) {
            showCurrentWord();
        } else {
            endDictation();
        }
    }

    // Fonction pour terminer la dictée et afficher le résultat
    function endDictation() {
        dictationSection.style.display = 'none';
        resultSection.style.display = 'block';
        displayResults();
    }

    // Fonction pour afficher les résultats
    function displayResults() {
        scoreDisplay.innerHTML = `Vous avez correctement écrit ${correctCount} sur ${words.length} mots.`;
        const resultList = document.createElement('ul');
        resultList.classList.add('list-group', 'mt-3');

        words.forEach((word, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            if (userInputs[index].toLowerCase() === word.toLowerCase()) {
                listItem.classList.add('list-group-item-success');
                listItem.textContent = `Correct: ${word}`;
            } else {
                listItem.classList.add('list-group-item-danger');
                listItem.innerHTML = `Incorrect: ${userInputs[index]} (Correct: ${word})`;
            }
            resultList.appendChild(listItem);
        });

        resultSection.appendChild(resultList);
    }

    // Fonction pour réinitialiser la dictée
    function resetDictation() {
        resultSection.style.display = 'none';
        dictationSection.style.display = 'none';
        document.getElementById('input-section').style.display = 'block';
        resultSection.innerHTML = '<h2>Résultats</h2><p id="score" class="lead"></p><button class="btn btn-secondary btn-block" id="retry-button">Réessayer</button>';
        const newRetryButton = document.getElementById('retry-button');
        newRetryButton.addEventListener('click', resetDictation);
    }

    // Gestion de la reconnaissance vocale
    function startVoiceInput() {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'fr-FR';

        // Change l'icône de microphone pour indiquer l'écoute
        microphoneIcon.classList.add('listening');
        voiceInputResult.textContent = 'Écoute en cours...';

        recognition.start();

        recognition.onresult = (event) => {
            const spokenWord = event.results[0][0].transcript;
            wordListInput.value += spokenWord + '\n';
            voiceInputResult.textContent = `Mot ajouté : ${spokenWord}`;
            microphoneIcon.classList.remove('listening');
        };

        recognition.onerror = (event) => {
            voiceInputResult.textContent = 'Erreur de reconnaissance vocale : ' + event.error;
            microphoneIcon.classList.remove('listening');
        };

        recognition.onspeechend = () => {
            recognition.stop();
            microphoneIcon.classList.remove('listening');
        };
    }

    // Gestion de l'importation de fichiers
    function handleFileInput(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            const fileType = file.type;

            if (fileType === 'text/plain' || fileType === 'text/csv') {
                reader.onload = (e) => {
                    const text = e.target.result;
                    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
                    wordListInput.value = lines.join('\n');
                };
                reader.readAsText(file);
            } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileType === 'application/vnd.ms-excel') {
                reader.onload = (e) => {
                    fileData = e.target.result;
                };
                reader.readAsArrayBuffer(file);
            }
        }
    }

    // Fonction pour traiter les données du fichier Excel
    function processExcelData() {
        if (fileData) {
            const data = new Uint8Array(fileData);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const columnStart = columnStartInput.value.toUpperCase();
            const rowStart = parseInt(rowStartInput.value, 10);

            const columnNumber = XLSX.utils.decode_col(columnStart);
            const words = [];
            for (let row = rowStart; ; row++) {
                const cellAddress = XLSX.utils.encode_cell({ c: columnNumber, r: row - 1 });
                const cell = sheet[cellAddress];
                if (!cell) break;
                words.push(cell.v);
            }

            wordListInput.value = words.join('\n');
        }
    }

    // Afficher les paramètres Excel si le fichier est de type Excel
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileType = file.type;
            if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileType === 'application/vnd.ms-excel') {
                excelParams.style.display = 'block';
            } else {
                excelParams.style.display = 'none';
            }
            handleFileInput(event);
        }
    });

    // Gestion des événements des boutons
    startButton.addEventListener('click', startDictation);
    repeatButton.addEventListener('click', () => speakWord(words[currentWordIndex]));
    nextButton.addEventListener('click', checkWord);
    retryButton.addEventListener('click', resetDictation);
    voiceInputButton.addEventListener('click', startVoiceInput);
    validateExcelButton.addEventListener('click', processExcelData);
});
