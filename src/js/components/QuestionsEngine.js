import $ from "jquery";
import "jquery-ui-bundle";

export default class QuestionsEngine{
    constructor(modalWindow, callback){
        this.codeOfTask = 0;
        this.mathAnswer = 0;
        this.mathTaskId = 0;
        this.inputWord = '';
        this.chosenWord = '';
        this.chosenWordId = 0;
        this.synth = window.speechSynthesis;
        this.voice = this.synth.getVoices()[4];
        this.utterThis = new SpeechSynthesisUtterance;
        this.utterThis.voice = this.voice;
        this.utterThis.pitch = 1;
        this.utterThis.rate = 0.8;
        this.utterThis.volume = 0.5;
        this.isWordSaid = false;
        this.mainWindow = modalWindow;
        this.callback = callback;
    }

    getWindow() {
        return $(".task-window");
    }

    showQuestionWindow(){
        this.mainWindow.append(() =>{
            const windowBody = `<div class = task-window>
                <div class = answer-window > 
                    <input class = answer-window__input-data>
                </div>
                <button class = answer-window__answer-button>проверить</button>
            </div>`;
            return windowBody;
        });
        $(`.answer-window__input-data`).css({"background-image": "url(./src/images/ui/windows.png)"}).focus().keypress(
            (e) => {if (e.which === 13) $(`.answer-window__answer-button`).click();}
        );
        $(`.answer-window__answer-button`).css({"background-image": "url(./src/images/ui/buttons.png)"}).mouseenter(
            () => window.resources.sound.play("ui", "hover"));
    }

    showQuestionText(){
        this.codeOfTask = Math.floor((Math.random() * 4) + 0);
        switch (this.codeOfTask){
            case 0 : 
                $(".task-window").prepend($(`<p class = "task-window__text" id = "question-title"></p>`));
                $("#question-title").html([window.resources.questions[this.codeOfTask].description]);
                break;
            case 1 :
                $(".task-window").prepend($(`<p class = "task-window__text" id = "question-title"></p>`));
                $("#question-title").html([window.resources.questions[this.codeOfTask].description]);
                break;
            case 2 :
                $(".task-window").prepend($(`<p class = "task-window__text" id = "question-title"></p>`));
                $("#question-title").html([window.resources.questions[this.codeOfTask].description]);
                const repeatButton = $("<button class = answer-window__repeat-button></button>");
                $(".answer-window").prepend(repeatButton);
                repeatButton.prop("disabled", true);
                repeatButton.css({"background-image": "url(./src/images/ui/buttons.png)"});
                break;
            case 3 :
                $(".answer-window").prepend($("<ul class=word-wrapper>" + "</ul>"));
                $(".task-window").prepend($(`<p class = "task-window__text" id = "question-title"></p>`));
                $(".answer-window__input-data").remove();
                $("#question-title").html([window.resources.questions[this.codeOfTask].description]);
                $(".word-wrapper").sortable();
                $(".word-wrapper").disableSelection();
        }
        this.chooseTask();
    }

    chooseTask(){
        switch (this.codeOfTask){
            case 0 : 
                this.createMathTask();
                break;
            case 1 : 
                this.createTranslationTask();
                break;
            case 2 :
                this.createSpeechTask();                
                break;
            case 3 :
                this.createDragAndDropTask();
                break;
        }
    }
    createMathTask(){
        this.mathTaskId = Math.floor((Math.random() * 4) + 1);
        let firstNumber = this.mathTaskId != 3 ? Math.floor((Math.random() * 100) + 1) : Math.floor((Math.random() * 20) + 1),
            secondNumber = this.mathTaskId != 3 ? Math.floor((Math.random() * 100) + 1) : Math.floor((Math.random() * 20) + 1);
        switch (this.mathTaskId){
            case 1 :
                $("#question-title").text('Найди сумму двух чисел:');
                $(".answer-window").prepend($(`<p class="task-window__text task-window__text--w">${firstNumber + ' + ' + secondNumber}</p>`));
                this.mathAnswer = firstNumber + secondNumber;
                break;
            case 2 :
                $("#question-title").text('Найди разность двух чисел:');
                $(".answer-window").prepend($(`<p class="task-window__text task-window__text--w">${firstNumber + ' - ' + secondNumber}</p>`));
                this.mathAnswer = firstNumber - secondNumber;
                break;
            case 3 :
                $("#question-title").text('Найди произведение двух чисел:');
                $(".answer-window").prepend($(`<p class="task-window__text task-window__text--w">${firstNumber + ' * ' + secondNumber}</p>`));
                this.mathAnswer = firstNumber * secondNumber;
                break;
            case 4 : 
                $("#question-title").text('Найди целую часть от деления двух чисел:');
                $(".answer-window").prepend($(`<p class="task-window__text task-window__text--w">${firstNumber + ' / ' + secondNumber}</p>`));
                this.mathAnswer = parseInt(firstNumber / secondNumber);
                break;
        }
    }
    checkAnswer(){
        const button = $(".answer-window__answer-button");
        button.click(() =>{
            window.resources.sound.play("ui", "click");
            button.prop("disabled", true);
            button.off("click");
            let currentEnteredData = $('.answer-window__input-data').val();
            switch (this.codeOfTask){
                case 0 : 
                    parseInt(this.mathAnswer) === parseInt(currentEnteredData) ? this.hideWindow(true) : this.hideWindow(false);
                    break;
                case 1 :
                if(window.resources.questions[1].words[this.chosenWord].translation.includes(currentEnteredData.toLowerCase()))
                    this.hideWindow(true)
                    else this.hideWindow(false);
                    break;
                case 2 :
                    this.chosenWord === currentEnteredData.toLowerCase() ? this.hideWindow(true) : this.hideWindow(false);
                case 3 :
                $('.word-wrapper__letter').text() === this.chosenWord ? this.hideWindow(true) : this.hideWindow(false);
            }
        });
    }

    hideWindow(isRightAnswer) {
        const answerWindow = $(".answer-window");
        answerWindow.fadeTo(300, 0, () => {
            answerWindow.remove();
            const resultNote = $(`<p class="task-window__notification task-window__notification--${isRightAnswer ? "right" : "wrong"}">${isRightAnswer ? "Правильно!" : "Неправильно"}</p>`);
            this.mainWindow.append(resultNote);
            if (isRightAnswer) window.resources.sound.play("ui", "right-answer")
            else window.resources.sound.play("ui", "error");
            resultNote.fadeTo(300, 1).delay(2000).fadeTo(0, 1, () => {this.mainWindow.fadeTo(600, 0, () => {this.mainWindow.remove(); this.callback(isRightAnswer);}), window.resources.sound.play("ui", "hide");});
        });
    }

    createTranslationTask(){
        let wordsNumber = window.resources.questions[1].words.length;
        this.chosenWord = Math.floor((Math.random() * wordsNumber) + 0);
        $('.answer-window').prepend($(`<p class="task-window__text task-window__text--w">${window.resources.questions[1].words[this.chosenWord].inputWord}</p>`));
    }

    speak() {
        if (this.synth.speaking) {
            return;
        }
        if (($('.answer-window__input-data')) !== undefined) {
            this.utterThis.text = window.resources.questions[2].words[this.chosenWordId];
            this.utterThis.onend = function(event) {
                $(".answer-window__repeat-button").prop("disabled", false);
            }
            this.synth.speak(this.utterThis);
        }
    }

    createSpeechTask(){
        if(!this.isWordSaid) {
            this.chosenWordId = Math.floor((Math.random() * window.resources.questions[2].words.length ) + 0);
            this.speak();
            this.isWordSaid = true;
        }
        $(".answer-window__repeat-button").click(() =>{
            window.resources.sound.play("ui", "click");
            $(".answer-window__repeat-button").prop("disabled", true);
            this.speak();
        }).mouseenter(() => window.resources.sound.play("ui", "hover"));
        this.chosenWord = window.resources.questions[2].words[this.chosenWordId];
    }

    createDragAndDropTask(){
        let currentWord = [],
            currentLetterId = 0;
        this.chosenWordId = Math.floor((Math.random() * window.resources.questions[3].words.length) + 0);
        this.chosenWord = window.resources.questions[3].words[this.chosenWordId];
        currentWord = this.chosenWord.split('');

        while(currentWord.length){
            currentLetterId = Math.floor((Math.random() * currentWord.length) + 0);
            const letter = $("<li class=word-wrapper__letter>" + [currentWord[currentLetterId]] + '</li>');
            letter.css({"background-image": "url(./src/images/ui/buttons.png)"});
            $(".word-wrapper").append(letter);
            currentWord.splice(currentLetterId,1);
        }
    }

    showModalWindow(){
        this.showQuestionWindow();
        this.showQuestionText();
        this.checkAnswer();
    }   
}