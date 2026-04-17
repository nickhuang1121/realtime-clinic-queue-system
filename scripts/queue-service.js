import { db } from "./db.js";
import {
    doc,
    onSnapshot,
    getDoc,
    orderBy,
    getDocs,
    deleteDoc,
    limit,
    query,
    setDoc,
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";


export class QueueService {
    constructor() {
        this.queueStatusEmpty = {//空值全新Current
            currentNumber: 0,
            lastNormalNumber: 0,
            skippedNumber: [],
            customCalledNumber: false,
            notice: "",
        };
        this.queueStatusCurrent = {//目前Current
            currentNumber: 0,
            lastNormalNumber: 0,
            skippedNumber: [],
            customCalledNumber: false,
            notice: "",
        };
        this.logTemplate = {
            actionType: null,
            createAt: null,
            afterNumber: null,
            beforeNumber: null,
        }
        this.queueStatusRef = doc(db, "queueStatus", "current");
    }
    async loadFromDBCurrent() {//將DB的Current狀態載入（用在營業中時，網頁突然當機之類的狀況）
        const queueStatusRef = doc(db, "queueStatus", "current");
        const snapshot = await getDoc(queueStatusRef);
        if (snapshot.exists()) {
            this.queueStatusCurrent = {
                ...snapshot.data()
            }
        } else {
            console.log("沒有取得舊有資料");
        }
    }
    async updateDBCurrent() {//更新DB Current
        const queueStatusRef = doc(db, "queueStatus", "current");
        const queueStatus = {
            ...this.queueStatusCurrent,
            updateAt: serverTimestamp(),
        }
        await setDoc(queueStatusRef, queueStatus);

    }
    async updateLog(log) {
        await addDoc(collection(db, "logs"), log);

    }
    getSkippedNumber() {
        return this.queueStatusCurrent.skippedNumber.shift() ?? null;
    }
    async clearLogs() {
        const logsSnapshot = await getDocs(collection(db, "logs"));
        const deleteTasks = logsSnapshot.docs.map((logDoc) => deleteDoc(logDoc.ref));
        await Promise.all(deleteTasks);
    }
    async callNext() {//叫號碼下一位



        const log = {
            ...this.logTemplate,
            afterNumber: this.queueStatusCurrent.lastNormalNumber,
            createAt: await serverTimestamp(),
            actionType: "正常叫號"
        };

        const nextNormalNumber = this.queueStatusCurrent.lastNormalNumber + 1;
        this.queueStatusCurrent.lastNormalNumber = nextNormalNumber;
        this.queueStatusCurrent.currentNumber = nextNormalNumber;
        log.beforeNumber = nextNormalNumber;
        this.queueStatusCurrent.customCalledNumber = false;
        await this.updateDBCurrent();
        await this.updateLog(log);
    }
    async callSkippedNext() {

        const skippedNumber = this.getSkippedNumber();
        if (skippedNumber === null) {
            return;
        }

        const log = {
            ...this.logTemplate,
            afterNumber: this.queueStatusCurrent.currentNumber,
            beforeNumber: skippedNumber,
            createAt: await serverTimestamp(),
            actionType: "過號叫號"
        };

        this.queueStatusCurrent.currentNumber = skippedNumber;
        this.queueStatusCurrent.customCalledNumber = true;
        await this.updateDBCurrent();
        await this.updateLog(log);
    }
    async pushToSkippedNumber() {//過號，並且將過號的儲存至skip陣列，並叫號
        const currentNumber = this.queueStatusCurrent.currentNumber;
        if (currentNumber <= 0) {
            return;
        }

        if (!this.queueStatusCurrent.skippedNumber.includes(currentNumber)) {
            this.queueStatusCurrent.skippedNumber.push(currentNumber);
        }

        const log = {
            ...this.logTemplate,
            afterNumber: currentNumber,
            beforeNumber: currentNumber,
            createAt: await serverTimestamp(),
            actionType: "儲存過號"
        };

        await this.updateDBCurrent();
        await this.updateLog(log);
    }
    async resetQueueStatus() {//將Current整個重新歸0
        const queueStatusRef = doc(db, "queueStatus", "current");
        const queueStatus = {
            ...this.queueStatusEmpty,
            updateAt: serverTimestamp(),
        }
        await setDoc(queueStatusRef, queueStatus);
        await this.clearLogs();
    }


    //監聽
    watchQueueStatus(onChange) {
        const unsubscribe = onSnapshot(this.queueStatusRef, (snapshot) => {
            if (snapshot.exists()) {
                this.queueStatusCurrent = {
                    ...this.queueStatusEmpty,
                    ...snapshot.data(),
                };
            } else {
                this.queueStatusCurrent = { ...this.queueStatusEmpty };
            }
            //console.log(snapshot.data());

            onChange(this.queueStatusCurrent);
        });
        return unsubscribe;
    }

    watchLogs(onChange) {
        const q = query(
            collection(db, "logs"),
            orderBy("createAt", "desc"),
            limit(10)
        );

        return onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs.map(doc => ({
                id: doc.id, ...doc.data()
            }));
            onChange(logs);
        });
    }
}
