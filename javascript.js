window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction || 
window.webkitIDBTransaction || window.msIDBTransaction;

window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || 
window.msIDBKeyRange

if (!window.indexedDB) {
    window.alert("Browser does not support IndexedDb"); 
}

const projectsName = "Project List";
const projectsDetails = "Project Details"

let db;

    let request = window.indexedDB.open("ToDoList", 1)
    console.log(request);
    request.onerror = function(event) {
        reject("failed to open db");
    };

    request.onsuccess = function(event) {
        db = request.result;
        console.log("onsuccess " + db)
        return db;
    };

    request.onupgradeneeded = function(event) {
        let db = event.target.result;
        
        let objectStore = db.createObjectStore(projectsName, { keyPath: "name" });
        let objectStore2 = db.createObjectStore(projectsDetails, { keyPath: "id", autoIncrement: true });
        objectStore2.createIndex("ToDo" , "ToDo", { unique: false });
        objectStore2.createIndex("Created" , "Created", { unique: false });
        console.log("upgrage " + db);
        return db;
    }    

const insertToggleBtn = document.querySelector("#toggle-project-insert");
insertToggleBtn.addEventListener("click", function(){
    document.querySelector(".project-input-container").classList.toggle("show");
});

const insertProjectBtn = document.querySelector("#insert-project-button");
insertProjectBtn.addEventListener("click", function(){
    const inputBox = document.querySelector("#project-input")
    const projectName = inputBox.value;

    if (projectName != ""){
        data = { name: projectName, data: ""}
        addToDb(projectsName, data);
         inputBox.value = "";
    }    
});

const toggleProjectDetailsBtn = document.querySelector("#table-insert-toggle");
toggleProjectDetailsBtn.addEventListener("click", function(){
    console.log("click");
    document.querySelector(".form-content-container").classList.toggle("show");
});

// 
const insertProjectDetailsBtn = document.querySelector("#insert-project-details-btn")
insertProjectDetailsBtn.addEventListener("click", function(){
    const nameData = document.querySelector('#content-header-title').innerHTML;

    if (nameData != "Project"){             
        const TodoData = document.querySelector('#ToDo-input-box').value;
        const messageData = document.querySelector('#message-input-box').value;
        const dateOpenedData = getDate();
        const dateClosedData = undefined;
        const priorityData = document.querySelector('#priority-check').checked;

        const inputData = [{ name: nameData, ToDo: TodoData, message : messageData, 
                            Created: dateOpenedData, closed: dateClosedData, priority: priorityData }];

        addToDb(projectsDetails, inputData);
    }
    
})

// IndexedDb functions
// IndexedDb crud functions
function addToDb(objStore, data){    
    
    let request = db.transaction([objStore], "readwrite")
        .objectStore(objStore)
        .add(data);

    request.onsuccess = function(event){
        console.log("successfully written to db");
        switch (objStore){
            case projectsName:
                readProjectsDb();
            case projectsDetails:
                readProjectDetailsDb();
        }
       
    }
    request.onerror = function(event){
        alert("Failed to write " + data + " to db");
    }
}

function deleteFromDb(value){
    const parent = value.parentElement;
    const id = parent.firstChild.innerHTML;
    const request = db.transaction([projectsName], "readwrite")
    .objectStore(projectsName)
    .delete(id);

    request.onsuccess = function(event){
        console.log("successfully deleted from Db")
        readProjectsDb();
    }
}


function editDb(key, dataD){
    const insertData = { name : key, data: dataD }
    const request = db.transaction([projectsName], "readwrite")
        .objectStore(projectsName)
        .put(insertData)

}
// Read Db to nav Window
function readProjectsDb(){
    clearNavBar();
    console.log("Read project list called");  
    let transaction = db.transaction("Project List").objectStore("Project List");
    transaction.openCursor().onsuccess = function(event){
        let cursor = event.target.result;
        if (cursor){
            console.log(cursor.key);
            const projectList = document.querySelector("#project-list");
            const newLi = document.createElement("li");
            const newSpan = document.createElement("span");
            const newButton = document.createElement("button");
            newButton.textContent = "-";
            newButton.className = "delbtn btn";
            newButton.addEventListener("click", function(){
                deleteFromDb(this);
            }, false);
            newSpan.textContent = cursor.key;
            newSpan.className = "projects";
            newSpan.addEventListener("click", function(){
                openNewObjectStore(this);
            }, false);
            newLi.appendChild(newSpan);
            newLi.appendChild(newButton);           
            projectList.appendChild(newLi);          
            cursor.continue();
        };
    };
};

function readProjectDetailsDb(){
    console.log("Read table data")
    let transaction = db.transaction("Project Details").objectStore("Project Details");
    transaction.openCursor().onsuccess = function(event){
        let cursor = event.target.result;
        if (cursor){
            console.log(cursor.key);
            console.log(cursor.value[0].name);
            console.log(cursor.value[0].ToDo);
            console.log(cursor.value[0].message);
            console.log(cursor.value[0].Created);
            console.log(cursor.value[0].closed);
            cursor.continue();

        }
    }
    transaction.openCursor().onerror = function(event){
        console.log("failure")
    }
}

// functions to clear the screen
function clearNavBar(){
    let liClear = document.querySelector("#project-list");
    while (liClear.firstChild){
        liClear.removeChild(liClear.firstChild);
    }
}

// TODO clear table before writing to it
function clearTable(){

}

function openNewObjectStore(value){
    const tableName = value.innerHTML;
    const tableHeader = document.querySelector("#content-header-title");
    tableHeader.textContent= tableName;

   // updateDb(tableName);
}
    

function clearTable(){
    // TODO
}

window.onload = function(){
    const loadDoc = new Promise(function(resolve, reject){
        let request = window.indexedDB.open("ToDoList");
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
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();

    const date = dd + "/" + mm + "/" + yyyy;
    return date;
}
