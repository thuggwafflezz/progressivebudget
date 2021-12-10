//create a variable to store database connection
let db;

//this creates a connection to the indexedDB, named budget_tracker as that's what mongoose is trying to connect to in the server.js, version is 01
const request = indexedDB.open('budget', 01);

//if the version of the indexedDB changes, this function runs, and creates an objectstore named newTransaction
request.onupgradeneeded = function(e) {
    const db = e.target.result;
    db.createObjectStore('newTransaction', { autoIncrement: true });
};

//sets db variable to the result of the succcessful creation of the indexed db data store.
request.onsuccess = function(e) {

    db = e.target.result;
};

function saveRecord(record) {

    const transaction = db.transaction(['newTransaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('newTransaction');
    budgetObjectStore.add(record);
}

function uploadTransaction() {

    const transaction = db.transaction(['newTransaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('newTransaction');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const budgetObjectStore = transaction.objectStore('new_transaction');
                    budgetObjectStore.clear();

                    alert('All saved transactions has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

window.addEventListener('online', uploadTransaction);