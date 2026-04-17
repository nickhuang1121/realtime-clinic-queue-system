import { QueueService } from "./queue-service.js";
import { UI } from "./ui.js";
import { Tool } from "./tool.js";
import { signInWithGoogle, signOutUser, watchAuthState } from "./auth.js";

const queueService = new QueueService();
const tool = new Tool();
let isLogin = false;


const adminInputRefs = {
    callNextButton: document.getElementById("call-next-button"),
    callNextTwiceButton: document.getElementById("call-next-twice-button"),
    skipCurrentButton: document.getElementById("skip-current-button"),
    resetQueueButton: document.getElementById("reset-queue-button"),
    loginGoogleButton: document.getElementById("login-google-button"),
    logoutButton: document.getElementById("logout-button"),
    callSkipNumberButton: document.getElementById("call-skip-number-button"),
    closeMessageButton: document.getElementById("close-message")
}

const adminOutputRefs = {
    adminActionsCurrentNumberEl: document.getElementById("admin-actions-current-number"),
    adminActionsLastNumberEl: document.getElementById("admin-actions-last-number"),
    adminActionsSkippedNumberEl: document.getElementById("admin-actions-skipped-number"),
    logsEl: document.getElementById("logs"),
    fixWindowEl: document.getElementById("fix-window"),
    messageEl: document.getElementById("message")
}



const patientInputRefs = {
    patientNumberInput: document.getElementById("patient-number-input"),
    patientNumberBtn: document.getElementById("patient-number-btn"),
}

const patientOutputRefs = {
    patientCurrentNumberEl: document.getElementById("patient-current-number-display"),
    patientStateEl: document.getElementById("patient-state-display"),
    patientNumberEl: document.getElementById("patient-number"),
    patientSkippedNumberEl: document.getElementById("patient-skipped-number")
}


const ui = new UI({
    patientOutputRefs,
    adminInputRefs,
    patientInputRefs,
    adminOutputRefs

});

function onPatientNumberChange() {
    const message = tool.updatePatientQueueMessage(queueService.queueStatusCurrent.currentNumber, ui.getPatientNumber())
    ui.showPatientQueueMessage(message);
}
function errorMessage(msg) {
    console.log(msg)
}

ui.bindAdminEvents({
    onCallNext: async () => {
        if (!isLogin) {
            ui.displayMessage("此為管理端行為，呼叫號碼前，請先登入帳號");
            return;
        }
        await queueService.callNext();
    },
    onSkipCurrent: async () => {
        if (!isLogin) {
            ui.displayMessage("此為管理端行為，儲存過號前，請先登入帳號");
            return;
        }
        await queueService.pushToSkippedNumber();
    },
    onResetQueue: async () => {
        if (!isLogin) {
            ui.displayMessage("此為管理端行為，重置系統前，請先登入帳號");
            return;
        }
        await queueService.resetQueueStatus();
    },
    onPatientNumberChange: () => {
        onPatientNumberChange();
    },
    onLogin: async () => {
        await signInWithGoogle();
    },
    onLogout: async () => {
        await signOutUser();
    },
    onCallSkipped: async () => {
        if (!isLogin) {
            ui.displayMessage("此為管理端行為，跳號前，請先登入帳號");
            return;
        }
        await queueService.callSkippedNext();
    }
});

ui.Init();

const unsubscribeQueueStatus = queueService.watchQueueStatus((queueStatus) => {
    ui.onChangeCurrent(queueStatus);
    onPatientNumberChange();
});
let unsubscribeLogs = null;

watchAuthState((user) => {
    console.log(user)
    if (user) {
        isLogin = true;
        unsubscribeLogs = queueService.watchLogs((logs) => {
            ui.onChangeLogs(logs);
        })
    } else {
        isLogin = false;
    }

});



