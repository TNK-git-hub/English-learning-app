/**
 * Quiz Page — Logic for interactive assessments
 */

// Enhanced Mock Data with Explanations
const MOCK_QUIZZES = [
    {
        id: "q_vocab",
        title: "Vocabulary Mastery",
        category: "Library",
        difficulty: "Mixed",
        duration: "10 mins",
        questions: [
            {
                question: "What is the meaning of 'unprecedented'?",
                options: ["Never done or known before", "Very common", "Expected", "Repeated"],
                correct: 0,
                explanation: "'Unprecedented' means never done or known before. Example: The new AI model predicts outcomes with unprecedented accuracy."
            },
            {
                question: "The word 'collaborate' means:",
                options: ["To compete", "To work together", "To argue", "To separate"],
                correct: 1,
                explanation: "'Collaborate' means to work jointly on an activity or project. Example: Challenges around collaboration and company culture remain significant concerns."
            },
            {
                question: "What is the synonym of 'eliminate'?",
                options: ["Add", "Include", "Remove", "Create"],
                correct: 2,
                explanation: "'Eliminate' means to completely remove or get rid of something. Example: Manchester City must play the perfect game to eliminate Real Madrid."
            },
            {
                question: "'Aesthetic' relates to:",
                options: ["Beauty and art appreciation", "Mathematics", "Physical exercise", "Cooking"],
                correct: 0,
                explanation: "'Aesthetic' is concerned with beauty or the appreciation of beauty. Example: Every element reflects centuries of refined aesthetic sensibility."
            },
            {
                question: "What does 'infrastructure' mean?",
                options: ["A type of building material", "Basic physical structures needed for society", "The design of furniture", "A method of transport"],
                correct: 1,
                explanation: "'Infrastructure' refers to the basic physical and organizational structures and facilities needed for the operation of a society or enterprise."
            },
            {
                question: "In the phrase 'financial stability', what does 'stability' mean?",
                options: ["The state of being steady and not changing", "The growth of money", "The decline of economy", "The exchange of currency"],
                correct: 0,
                explanation: "'Stability' is the state of being stable, steady, and not likely to change or fail."
            },
            {
                question: "What is a 'hybrid work model'?",
                options: ["Working only from home", "Working only in office", "A mix of remote and office work", "Working while traveling"],
                correct: 2,
                explanation: "A hybrid work model is a type of flexible working where an employee's time is split between working from home and working in an office."
            },
            {
                question: "'Culinary traditions' refers to:",
                options: ["Sports activities", "Religious ceremonies", "Food and cooking customs", "Musical performances"],
                correct: 2,
                explanation: "'Culinary' means relating to or used in cooking. Traditions are long-established customs or beliefs."
            },
            {
                question: "What does 'adoption' mean in a technology context?",
                options: ["The rejection of old methods", "The acceptance and use of something new", "Legally taking someone's child", "A training program"],
                correct: 1,
                explanation: "Technology adoption is the choice to acquire and use a new invention or innovation."
            },
            {
                question: "The phrase 'career prospects' means:",
                options: ["Current salary", "Past achievements", "Work schedule", "Future opportunities in one's job"],
                correct: 3,
                explanation: "'Career prospects' are the possibilities of future success in a career."
            }
        ]
    },
    {
        id: "q1",
        title: "Business Idioms Master",
        category: "Vocabulary",
        difficulty: "Intermediate",
        duration: "5 mins",
        questions: [
            {
                question: "What does 'to get the ball rolling' mean?",
                options: ["To start a process", "To play soccer", "To make a mistake", "To end a meeting"],
                correct: 0,
                explanation: "'To get the ball rolling' is a common business idiom that means to set a process or activity in motion, especially one that is important or complex."
            },
            {
                question: "If someone 'cuts to the chase', they...",
                options: ["Run very fast", "Stop talking", "Get to the main point", "Start a fight"],
                correct: 2,
                explanation: "Originating from the film industry, 'cut to the chase' means to skip the preamble and get directly to the most important part of a discussion or story."
            },
            {
                question: "Which idiom means 'to do something well'?",
                options: ["Break a leg", "Hit it out of the park", "Cry wolf", "Beat around the bush"],
                correct: 1,
                explanation: "'Hit it out of the park' is a baseball metaphor used in business to describe an outstanding performance or a major success."
            }
        ]
    },
    {
        id: "q2",
        title: "Present Perfect vs Past Simple",
        category: "Grammar",
        difficulty: "Beginner",
        duration: "8 mins",
        questions: [
            {
                question: "I _______ to London three times.",
                options: ["was", "have been", "went", "am being"],
                correct: 1,
                explanation: "We use the Present Perfect ('have been') to talk about experiences at an unspecified time in the past, often with 'three times', 'ever', or 'never'."
            },
            {
                question: "She _______ her keys yesterday.",
                options: ["lost", "has lost", "loses", "was losing"],
                correct: 0,
                explanation: "The Past Simple ('lost') is used here because there is a specific finished time reference ('yesterday')."
            }
        ]
    }
];

function attachQuizEvents() {
    // Navigation & Common UI
    const navLinks = {
        'nav-quiz-articles': 'articles',
        'nav-quiz-library': 'vocabulary',
        'nav-quiz-dashboard': 'user-dashboard',
        'quiz-to-articles': 'articles',
        'quiz-back-to-articles': 'articles',
        'result-finish-btn': 'articles',
    };

    Object.entries(navLinks).forEach(([id, view]) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                animateTransition(view);
            });
        }
    });

    // Quiz Selection
    const quizCards = document.querySelectorAll('.quiz-card');
    quizCards.forEach(card => {
        card.addEventListener('click', () => {
            const quizId = card.dataset.quizId;
            startQuiz(quizId);
        });
    });

    // Quiz Controls
    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', handleNextStep);
    }

    const exitBtn = document.getElementById('quiz-exit-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', () => {
            const modal = document.getElementById('quiz-exit-modal');
            if (modal) modal.classList.add('show');
        });
    }

    // Modal Actions
    const exitCancel = document.getElementById('quiz-exit-cancel');
    if (exitCancel) {
        exitCancel.addEventListener('click', () => {
            const modal = document.getElementById('quiz-exit-modal');
            if (modal) modal.classList.remove('show');
        });
    }

    const exitConfirm = document.getElementById('quiz-exit-confirm');
    if (exitConfirm) {
        exitConfirm.addEventListener('click', () => {
            const modal = document.getElementById('quiz-exit-modal');
            if (modal) modal.classList.remove('show');
            showQuizView('selection');
        });
    }

    const retryBtn = document.getElementById('result-retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            if (AppState.currentQuiz) {
                startQuiz(AppState.currentQuiz.id);
            }
        });
    }
}

/**
 * Start a specific quiz
 */
function startQuiz(quizId) {
    const quiz = MOCK_QUIZZES.find(q => q.id === quizId);
    if (!quiz) return;

    AppState.currentQuiz = quiz;
    AppState.quizActiveQuestion = 0;
    AppState.quizScore = 0;

    showQuizView('active');
    renderQuestion();
}

/**
 * Render current question
 */
function renderQuestion() {
    const quiz = AppState.currentQuiz;
    const qIndex = AppState.quizActiveQuestion;
    const question = quiz.questions[qIndex];

    // Update UI
    document.getElementById('current-q-index').textContent = qIndex + 1;
    document.getElementById('total-q-count').textContent = quiz.questions.length;
    document.getElementById('quiz-question-text').textContent = question.question;

    // Progress Bar
    const progress = ((qIndex) / quiz.questions.length) * 100;
    document.getElementById('quiz-progress-fill').style.width = `${progress}%`;

    // Hide Explanation
    const explanationBox = document.getElementById('quiz-explanation-box');
    if (explanationBox) {
        explanationBox.classList.remove('show');
    }

    // Options
    const optionsList = document.getElementById('quiz-options-list');
    optionsList.innerHTML = '';

    question.options.forEach((opt, index) => {
        const div = document.createElement('div');
        div.className = 'quiz-option';
        div.innerHTML = `<span>${opt}</span><i class="fa-regular fa-circle"></i>`;
        div.addEventListener('click', () => selectOption(div, index));
        optionsList.appendChild(div);
    });

    // Reset Button
    const nextBtn = document.getElementById('quiz-next-btn');
    nextBtn.textContent = 'Check Answer';
    nextBtn.disabled = true;
    nextBtn.dataset.state = 'check';
}

/**
 * Handle option selection
 */
function selectOption(el, index) {
    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn.dataset.state !== 'check') return;

    // Clear previous selection
    document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
    
    el.classList.add('selected');
    AppState.selectedOptionIndex = index;
    nextBtn.disabled = false;
}

/**
 * Handle Check Answer / Next Question
 */
function handleNextStep() {
    const nextBtn = document.getElementById('quiz-next-btn');
    const quiz = AppState.currentQuiz;
    const question = quiz.questions[AppState.quizActiveQuestion];

    if (nextBtn.dataset.state === 'check') {
        // Validation logic
        const options = document.querySelectorAll('.quiz-option');
        const correctIndex = question.correct;
        const selectedIndex = AppState.selectedOptionIndex;

        options.forEach((opt, idx) => {
            opt.classList.remove('selected');
            if (idx === correctIndex) {
                opt.classList.add('correct');
                opt.querySelector('i').className = 'fa-solid fa-circle-check';
            } else if (idx === selectedIndex) {
                opt.classList.add('wrong');
                opt.querySelector('i').className = 'fa-solid fa-circle-xmark';
            }
        });

        // Show Explanation
        const explanationBox = document.getElementById('quiz-explanation-box');
        const explanationText = document.getElementById('quiz-explanation-text');
        if (explanationBox && explanationText) {
            explanationText.textContent = question.explanation;
            explanationBox.classList.add('show');
        }

        if (selectedIndex === correctIndex) {
            AppState.quizScore++;
        }

        nextBtn.textContent = AppState.quizActiveQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Show Results';
        nextBtn.dataset.state = 'next';
    } else {
        // Move to next question or finish
        if (AppState.quizActiveQuestion < quiz.questions.length - 1) {
            AppState.quizActiveQuestion++;
            renderQuestion();
        } else {
            showResults();
        }
    }
}

/**
 * Show final results
 */
function showResults() {
    showQuizView('result');
    
    const quiz = AppState.currentQuiz;
    const scorePercent = Math.round((AppState.quizScore / quiz.questions.length) * 100);
    
    document.getElementById('result-score-val').textContent = `${scorePercent}%`;
    
    // Animate ring
    const ring = document.getElementById('result-score-ring');
    const circumference = 439.8; // 2 * pi * 70
    const offset = circumference - (scorePercent / 100) * circumference;
    
    setTimeout(() => {
        ring.style.strokeDashoffset = offset;
    }, 100);

    // Message
    const msgEl = document.getElementById('result-message');
    const subEl = document.getElementById('result-sub');

    if (scorePercent === 100) {
        msgEl.textContent = "Perfect Score! 🏆";
        subEl.textContent = "You have a complete mastery of this topic. Amazing work!";
    } else if (scorePercent >= 70) {
        msgEl.textContent = "Great Job! 🌟";
        subEl.textContent = "You've shown strong understanding. Keep it up!";
    } else {
        msgEl.textContent = "Good Effort! 💪";
        subEl.textContent = "Practice makes perfect. Why not try again?";
    }
}

/**
 * Helper to switch between quiz views
 */
function showQuizView(view) {
    const views = ['selection', 'active', 'result'];
    views.forEach(v => {
        const el = document.getElementById(`quiz-view-${v}`);
        if (el) el.style.display = (v === view) ? 'block' : 'none';
    });
}
