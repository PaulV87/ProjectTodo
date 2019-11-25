
console.log("Working")

const indexDbfunction = () => {
    addDb = () => "add function";
    deleteDb = () => "delete";
    editDb = () =>"edit";
    openDb = () => "open";

    return { addDb, deleteDb, editDb, openDb}
}


const insertToggleBtn = document.querySelector("#toggle-project-insert");
insertToggleBtn.addEventListener("click", function(){
    document.querySelector(".project-input-container").classList.toggle("show");
});

const insertProjectBtn = document.querySelector("#insert-project-button");
insertProjectBtn.addEventListener("click", function(){
    const inputBox = document.querySelector("#project-input")
    const projectName = inputBox.value;
    data = { name: projectName, data: ""}
    addToDb(projectsName, data);
    inputBox.value = "";
})

const testBtn = document.querySelector("#table-insert-toggle");
testBtn.addEventListener("click", function(){
    console.log("click");
    const tableHeader = document.querySelector("#content-header-title");
    tableTitle = tableHeader.innerHTML;
    let data = [ { name: "yes", class: "Wiskunde" } ]
    console.log(data);
    console.log(tableTitle);
    editDb(tableTitle, data);
    
})
// IndexedDb functions
// open
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction || 
window.webkitIDBTransaction || window.msIDBTransaction;

window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || 
window.msIDBKeyRange
 
if (!window.indexedDB) {
	window.alert("Browser does not support IndexedDb");
}

const projectsName = "Project's Name";
let db;

let request = window.indexedDB.open("projectsNameDb", 1)

request.onerror = function(event) {
	console.log("error: ");
};

request.onsuccess = function(event) {
	db = request.result;
	console.log("success: " + db);
};

request.onupgradeneeded = function(event) {
	let db = event.target.result;
    let objectStore = db.createObjectStore(projectsName, { keyPath: "name" });
}
// IndexedDb crud functions
function addToDb(objStore, data){    
    let request = db.transaction([projectsName], "readwrite")
        .objectStore(objStore)
        .add(data);

    request.onsuccess = function(event){
        console.log("successfully written to db");
        readProjectsDb();
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
    console.log("Read called");  
    let transaction = db.transaction(projectsName).objectStore(projectsName);
    transaction.openCursor().onsuccess = function(event){
        let cursor = event.target.result;
        if (cursor){
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

// functions to clear the screen
function clearNavBar(){
    let liClear = document.querySelector("#project-list");
    while (liClear.firstChild){
        liClear.removeChild(liClear.firstChild);
    }
}

function openNewObjectStore(value){
    const tableName = value.innerHTML;
    const tableHeader = document.querySelector("#content-header-title");
    tableHeader.textContent= tableName;
    console.log("this is my version " + db.version)
   // updateDb(tableName);
}
    
/* function updateDb(tableName){
    const updateIndexedDb = new Promise(function(resolve, reject){
    let dbVersionUpgrade = parseInt(db.version) + 1;
    console.log("this is my new version " + dbVersionUpgrade)
    if (!db.objectStoreNames.contains(tableName)){
        db.close();
        let request = window.indexedDB.open("projectsNameDb", dbVersionUpgrade);
        console.log(tableName);
        request.onsuccess = function(event){
            let db = event.target.result;
            console.log(db);
        }     
        request.onerror = function(event){
            console.log("failed to open db")
        }

        request.onupgradeneeded = function(event){
            console.log("Find me")
            let db = event.target.result;
            let newObjectStore = db.createObjectStore(tableName, { keyPath: "id", autoincrement: "true" });
        }
        
    }
    })
} */

function clearTable(){
    // TODO
}


window.onload= function(){
    // Using a promise to open the DB
    const loadDoc = new Promise(function(resolve, reject){
        // IndexedDb functions
        // open
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

        window.IDBTransaction = window.IDBTransaction || 
        window.webkitIDBTransaction || window.msIDBTransaction;

        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || 
        window.msIDBKeyRange
        
        if (!window.indexedDB) {
            window.alert("Browser does not support IndexedDb");
        }

        const projectsName = "Project's Name";
        let db;

        let request = window.indexedDB.open("projectsNameDb")
        console.log(request);
        request.onerror = function(event) {
            reject("failed to open db");
        };

        request.onsuccess = function(event) {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = function(event) {
            let db = event.target.result;
            let objectStore = db.createObjectStore(projectsName, { keyPath: "name" });
        }    
    });


    // Use promise to load stuff into navbar window on load
    loadDoc.then((db) =>{
        readProjectsDb();
    }) 
}
