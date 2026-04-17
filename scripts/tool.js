export class Tool {
    updatePatientQueueMessage(currentNumber, patientNumber) {
        if (patientNumber === 0) return "請輸入您的號碼";
        const waitingCount = patientNumber - currentNumber;
        let message = null;

        if (waitingCount > 5) {
            message = `您前面還有${waitingCount}位`
        } else if (waitingCount <= 5 && waitingCount > 0) {
            message = `您前面還有${waitingCount}位，即將輪到您。`
        } else if (waitingCount === 0) {
            message = `已經輪到您，請盡快進診間。`
        } else {
            message = `已過號或結束`
        }
        return message;
    }
}

