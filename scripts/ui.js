export class UI {
    constructor({
        patientOutputRefs,
        patientInputRefs,
        adminInputRefs,
        adminOutputRefs,


    } = {}) {
        this.patientCurrentNumberEl = patientOutputRefs.patientCurrentNumberEl;
        this.patientCurrentStateEl = patientOutputRefs.patientStateEl;
        this.patientNumberEl = patientOutputRefs.patientNumberEl;
        this.patientSkippedNumberEl = patientOutputRefs.patientSkippedNumberEl;

        this.patientNumberBtn = patientInputRefs.patientNumberBtn;
        this.patientNumberInput = patientInputRefs.patientNumberInput;

        this.adminActionsCurrentNumberEl = adminOutputRefs.adminActionsCurrentNumberEl;
        this.adminActionsLastNumberEl = adminOutputRefs.adminActionsLastNumberEl;
        this.adminActionsSkippedNumberEl = adminOutputRefs.adminActionsSkippedNumberEl;
        this.logsEl = adminOutputRefs.logsEl;
        this.fixWindowEl = adminOutputRefs.fixWindowEl;
        this.messageEl = adminOutputRefs.messageEl;
        this.closeMessageButton = adminInputRefs.closeMessageButton;

        this.callNextButton = adminInputRefs.callNextButton;
        this.callNextTwiceButton = adminInputRefs.callNextTwiceButton;
        this.skipCurrentButton = adminInputRefs.skipCurrentButton;
        this.resetQueueButton = adminInputRefs.resetQueueButton;
        this.loginGoogleButton = adminInputRefs.loginGoogleButton;
        this.logoutButton = adminInputRefs.logoutButton;
        this.callSkipNumberButton = adminInputRefs.callSkipNumberButton;


        this.patientNumber = null;
    }

    Init() {
        this.closeMessageButton.addEventListener("click", () => {
            this.fixWindowEl.classList.remove("active");
        })
    }
    displayMessage(msg) {
        this.fixWindowEl.classList.add("active");
        this.messageEl.innerText = msg;
    }
    getPatientNumber() {
        return Number(this.patientNumberInput.value);
    }
    showPatientQueueMessage(message) { //會根據病人號碼，更新UI視覺或文字提醒
        this.patientCurrentStateEl.innerText = message;
        this.patientNumberEl.innerText = this.getPatientNumber();
    }
    bindAdminEvents({
        onCallNext,
        onSkipCurrent,
        onResetQueue,
        onPatientNumberChange,
        onLogin,
        onLogout,
        onCallSkipped
    }) {
        this.callNextButton.addEventListener("click", onCallNext);
        this.callNextTwiceButton.addEventListener("click", () => {
            onCallNext(); onCallNext()
        })
        this.skipCurrentButton.addEventListener("click", onSkipCurrent);
        this.resetQueueButton.addEventListener("click", onResetQueue);
        this.patientNumberBtn.addEventListener("click", onPatientNumberChange);
        this.loginGoogleButton.addEventListener("click", onLogin);
        this.logoutButton.addEventListener("click", onLogout);
        this.callSkipNumberButton.addEventListener("click", onCallSkipped)

    }

    onChangeCurrent(data) {
        console.log(data)
        this.displayCurrentNumber(data.currentNumber);
        this.displaySkippedList(data.skippedNumber);
        this.displayAdminLastNumber(data.lastNormalNumber);
    }
    transformDate(timestamp) {
        if (!timestamp) return "";

        return timestamp.toDate().toLocaleTimeString("zh-TW", { hour12: false })
    }
    onChangeLogs(logs) {
        this.logsEl.innerHTML = "";
        logs.forEach(log => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${log.actionType}:${log.afterNumber} -> ${log.beforeNumber} <small>${this.transformDate(log.createAt)}</small>
            `;
            this.logsEl.append(li);
        })


    }

    displayAdminLastNumber(number) {
        this.adminActionsLastNumberEl.innerText = number;
    }



    displaySkippedList(arr) {
        this.patientSkippedNumberEl.innerHTML = "";
        this.adminActionsSkippedNumberEl.innerHTML = "";

        arr.forEach(element => {
            const span = document.createElement("span");
            span.innerHTML = element;
            this.patientSkippedNumberEl.append(span);

            this.adminActionsSkippedNumberEl.append(span.cloneNode(true));
        });
    }
    displayCurrentNumber(number) {
        this.adminActionsCurrentNumberEl.innerText = number;
        this.patientCurrentNumberEl.innerText = number
    }

    updateAuthState(user) {
        console.log("user:", user)
    }


}
