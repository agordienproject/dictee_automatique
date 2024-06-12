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

    // Variables pour gérer l'état de la dictée
    let words = [];
    let currentWordIndex = 0;
    let correctCount = 0;
    let userInputs = [];

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

    // Gestion des événements des boutons
    startButton.addEventListener('click', startDictation);
    repeatButton.addEventListener('click', () => speakWord(words[currentWordIndex]));
    nextButton.addEventListener('click', checkWord);
    retryButton.addEventListener('click', () => {
        resultSection.style.display = 'none';
        document.getElementById('input-section').style.display = 'block';
        resultSection.innerHTML = '<h2>Résultats</h2><p id="score" class="lead"></p><button class="btn btn-secondary btn-block" id="retry-button">Réessayer</button>';
    });
});
