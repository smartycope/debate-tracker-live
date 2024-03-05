document.getElementById('close-all').addEventListener('click', function (e){
    function handleFileSelection(event) {
        const inputFile = event.target;

        if (inputFile.files.length > 0) {
          const selectedFileName = inputFile.files[0].name;
          console.log(`Selected file: ${selectedFileName}`);
        } else {
          console.log('No file selected');
        }
      }    for (var i = 0; i < localStorage.length; i++) {
        let item = localStorage.key(i);
        if (item.includes('details-')) {
            window.localStorage.setItem(item, false);
            location.reload();
        }
    }
});

var details = document.getElementsByTagName('details');

document.getElementById('expand-all').addEventListener('click', function (e){
    console.log('here!');
    for (const detail of details){
        window.localStorage.setItem('details-'+detail.id, true);
    }
    location.reload();
});

// This tells all the textareas to send a POST form request whenever the focus moves from them
// const boxes = document.getElementsByClassName("box");
const boxes = document.getElementsByTagName("textarea");
for (const box of boxes) {
    // TODO: Also make them resizeable
    // box.resizable();
    box.addEventListener("focusout", function (e) {
        // const form = this.closest("form");
        // const form = document.getElementById()
        const form = e.target.form;
        console.log(e);
        console.log(form);
        console.log(typeof(form));
        const formData = new FormData(form);
        // Add the formdata manually
        formData.append(this.name, this.value)
        fetch(form.action, {
            method: form.method,
            body: formData
        });
  });
}

// This stores all the detail states whenever they're toggled
for (const detail of details){
    detail.addEventListener('toggle', function(event) {
    window.localStorage.setItem('details-'+this.id, this.open);
  });
}

// This loads all the detail states on loadup
for (var i = 0; i < localStorage.length; i++) {
    let item = localStorage.key(i);
    if (item.includes('details-')) {
        var id = item.split('details-')[1];
        var stat = window.localStorage.getItem(item);
        var elem = document.getElementById(id);
        if (stat == 'true' && elem != null){
          elem.open = true;
         }
       }
}

// Handles loading and reading files
var sender = document.getElementById('load-form');
document.getElementById('file-loader').addEventListener('change', (evt) => {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0];
    if (f) {
        var r = new FileReader();
        r.onload = function(e) {
            var contents = e.target.result;

            const formData = new FormData(sender);
            // Add the formdata manually
            formData.append('contents', contents)
            fetch(sender.action, {
                method: sender.method,
                body: formData
            });
        }
        r.readAsText(f);
        location.reload();
    } else {
        alert("Failed to load file");
    }
});
