window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction || 
window.webkitIDBTransaction || window.msIDBTransaction;

window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || 
window.msIDBKeyRange

if (!window.indexedDB) {
    window.alert('Browser does not support IndexedDb'); 
}

const projectsName = 'Project List';
const projectsDetails = 'Project Details'

// initialises Db
let db;

let request = window.indexedDB.open('ToDoList', 1)
console.log(request);
request.onerror = function(event) {
    reject('failed to open db');
};

request.onsuccess = function(event) {
    db = request.result;
    console.log('onsuccess ' + db)
    return db;
};

request.onupgradeneeded = function(event) {
    let db = event.target.result;
    
    let objectStore = db.createObjectStore(projectsName, { keyPath: 'name' });
    let objectStore2 = db.createObjectStore(projectsDetails, { keyPath: 'id', autoIncrement: true });
    objectStore2.createIndex('ToDo' , 'ToDo', { unique: false });
    objectStore2.createIndex('Created' , 'Created', { unique: false });
    console.log('upgrage ' + db);
    return db;
}    

// List of button event handlers
// Toggles the insert DOM in the navbar  

const insertToggleBtn = document.querySelector('#toggle-project-insert');
insertToggleBtn.addEventListener('click', function(){
    document.querySelector('.project-input-container').classList.toggle('show');
});

// Inserts data into Indexed Db onclick 

const insertProjectBtn = document.querySelector('#insert-project-button');
insertProjectBtn.addEventListener('click', function(){
    const inputBox = document.querySelector('#project-input')
    const projectName = inputBox.value;

    if (projectName != ''){
        data = { name: projectName, data: ''}
        addToDb(projectsName, data);
         inputBox.value = '';
    }    
});

// Toggles the insert part on the table

const toggleProjectDetailsBtn = document.querySelector('#table-insert-toggle');
toggleProjectDetailsBtn.addEventListener('click', function(){
    toggleInputFields();
   
});

// inserts data into indexedDb 

const insertProjectDetailsBtn = document.querySelector('#insert-project-details-btn')
insertProjectDetailsBtn.addEventListener('click', function(){
    const nameData = document.querySelector('#content-header-title').innerHTML;

    if (nameData != 'Project'){       
        const idBox = document.querySelector('#id-input-box').value;      
        const TodoData = document.querySelector('#ToDo-input-box').value;
        const messageData = document.querySelector('#message-input-box').value;
        const dateOpenedData = getDate();
        const dateClosedData = undefined;
        const priorityData = document.querySelector('#priority-check').checked;
        if (idBox === ""){
            console.log("Writing to Db")
            const inputData = { name: nameData, ToDo: TodoData, message : messageData, 
                Created: dateOpenedData, closed: dateClosedData, priority: priorityData };

            addToDb(projectsDetails, inputData);            
        } else {
            console.log("ammending db")
            const key = parseInt(idBox);
            const inputData = {name: nameData, ToDo: TodoData, message : messageData, 
                Created: dateOpenedData, closed: dateClosedData, priority: priorityData, id: key};
            updateDatabase(projectsDetails, inputData , key)
        }
        
    }
    
})

// IndexedDb Crud functions

function addToDb(objStore, data){    
   
    let request = db.transaction([objStore], 'readwrite')
        .objectStore(objStore)
        .add(data);

    request.onsuccess = function(event){
        console.log('successfully written to db');
        switch (objStore){
            case projectsName:
                readProjectsDb();
            case projectsDetails:
                readProjectDetailsDb();
        }
       
    }
    request.onerror = function(event){
        alert('Failed to write ' + data + ' to db');
    }
}


function deleteFromDb(value){
    const parent = value.parentElement;
    const id = parent.firstChild.innerHTML;
    const request = db.transaction([projectsName], 'readwrite')
    .objectStore(projectsName)
    .delete(id);

    request.onsuccess = function(event){
        console.log('successfully deleted from Db')
        readProjectsDb();
    }
}

// Read Db to nav Window

function readProjectsDb(){
    clearNavBar();
    console.log('Read project list called');  
    let transaction = db.transaction('Project List').objectStore('Project List');
    transaction.openCursor().onsuccess = function(event){
        let cursor = event.target.result;
        if (cursor){            
            const projectList = document.querySelector('#project-list');
            const newLi = document.createElement('li');
            const newSpan = document.createElement('span');

            const newButton = document.createElement('button');
            newButton.textContent = '-';
            newButton.className = 'delbtn btn';
            newButton.addEventListener('click', function(){
                deleteFromDb(this);
            }, false);

            newSpan.textContent = cursor.key;
            newSpan.className = 'projects';
            newSpan.addEventListener('click', function(){
                openNewObjectStore(this);
            }, false);

            newLi.appendChild(newSpan);
            newLi.appendChild(newButton);           
            projectList.appendChild(newLi);          
            cursor.continue();
        };
    };
};


// Opens Title and Db to table
function openNewObjectStore(value){
    const tableName = value.innerHTML;
    const tableHeader = document.querySelector('#content-header-title');
    tableHeader.textContent= tableName;
    readProjectDetailsDb() 
}    

// TODO use a counter class
// Reads data to the table

function readProjectDetailsDb(){
    clearTable();
    let counter = 0;
    console.log('Read table data');
    let transaction = db.transaction('Project Details').objectStore('Project Details');
    transaction.openCursor().onsuccess = function(event){
        let cursor = event.target.result;
        if (cursor){
            const nameCheck = document.querySelector('#content-header-title').innerHTML;

            // Only read the data from the named table header
            if (nameCheck === cursor.value.name){
                const tableBody = document.querySelector('#insert-table-data');
                const row = tableBody.insertRow(counter);
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);
                const cell3 = row.insertCell(2);
                const cell4 = row.insertCell(3);
                const cell5 = row.insertCell(4);
                const cell6 = row.insertCell(5);
                const cell7 = row.insertCell(6);
                const cell8 = row.insertCell(7);

                cell1.textContent = cursor.key;
                cell2.textContent = cursor.value.ToDo;
                cell3.textContent = cursor.value.message;

                // TODO: Need to update DB
                const priorityCheckBox = document.createElement('input');
                priorityCheckBox.type = 'checkbox'
                if (cursor.value.priority){
                    priorityCheckBox.checked = true;
                    row.classList = 'priority';
                };
                priorityCheckBox.addEventListener('change', function(){
                    if (this.checked) {
                        row.classList = 'priority';           
                    } else {
                        priorityCheckBox.checked = false;
                        row.classList.remove('priority');
                    };
                });
             
                cell4.appendChild(priorityCheckBox);


                cell5.textContent = cursor.value.Created;                
                const closedValue =  cursor.value.closed;                
                if (closedValue === undefined){ 

                    const closeBtn = document.createElement('button');
                    closeBtn.textContent = 'Close';
                    closeBtn.classList = "btn table-btn"                
                    closeBtn.addEventListener('click', function(){
                        const parent = this.parentElement;
                        parent.firstChild.remove;
                        const date = getDate();
                        parent.textContent = date;                   
                    });

                cell6.appendChild(closeBtn);

                } else {
                    cell6.textContent = cursor.value.closed;
                }


                // TODO: edit button

                const editBtn = document.createElement('button');
                editBtn.textContent = "edit"
                editBtn.classList = "btn table-btn"
                editBtn.addEventListener("click", function(){
                    console.log("edit Clicked");
                    updateDatabaseValues(this);
                })
                cell7.appendChild(editBtn);


                // TODO: delete button

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = "delete";
                deleteBtn.classList = "btn table-btn";
                deleteBtn.addEventListener("click", function(){
                    console.log("Delete clicked");
                })
                cell8.appendChild(deleteBtn);
                counter++;                
            }

            cursor.continue();
        };
    };
};

// update Db
function updateDatabaseValues(value){
    toggleInputFields()
    const row = value.parentNode.parentNode;
    const id = row.cells[0].textContent;
    const ToDo = row.cells[1].textContent;
    console.log("TODO :" +ToDo)
    const message = row.cells[2].innerHTML;
    const priority = row.cells[3].firstChild.checked;
    const date = row.cells[4].innerHTML;
    console.log(id + ToDo + message);
    console.log(row);
    
    const idBox = document.querySelector('#id-input-box');
    idBox.value = id;
    const TodoData = document.querySelector('#ToDo-input-box');
    TodoData.value = ToDo;
    const messageData = document.querySelector('#message-input-box')
    messageData.textContent = message;
    const dateOpenedData = document.querySelector("#open-input-box")
    dateOpenedData.value = date;

    const priorityData = document.querySelector('#priority-check')
    priorityData.checked = priority;
}

function updateDatabase(objStore, data, key){
    console.log(data[0]);
   const keyD = { id: key}
    let request = db.transaction([objStore], 'readwrite')
        .objectStore(objStore)
        .put(data);

    request.onsuccess = function(event){
        console.log('successfully written to db');
        switch (objStore){
            case projectsName:
                readProjectsDb();
            case projectsDetails:
                readProjectDetailsDb();
        }
    
    }
    request.onerror = function(event){
        alert('Failed to write ' + data + ' to db');
    }
}

// functions to clear the screen
function clearNavBar(){
    let liClear = document.querySelector('#project-list');
    while (liClear.firstChild){
        liClear.removeChild(liClear.firstChild);
    };
};

function clearTable(){
    const tableBody = document.querySelector('#insert-table-data')
    const tableRows = tableBody.getElementsByTagName('tr');
    for (let i = tableRows.length - 1; i >= 0; i--){
        tableBody.deleteRow(i);
    };
};

function toggleInputFields(){
    document.querySelector('.form-content-container').classList.toggle('show');
}

// Loads initial project list if there is one

window.onload = function(){
    const loadDoc = new Promise(function(resolve, reject){
        let request = window.indexedDB.open('ToDoList');
        request.onsuccess = function(event){
            db = event.target.result;
            resolve(db);
        }
    });
    loadDoc.then((db) => {
    readProjectsDb();
    })
};


// returns date in the format 'dd/mm/yyyy'
function getDate(){
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const date = dd + '/' + mm + '/' + yyyy;
    return date;
}
