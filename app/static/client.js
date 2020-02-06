var el = x => document.getElementById(x);

function showPicker() {
  el("file-input").click();
}

function showPicked(input) {
  el("upload-label").innerHTML = input.files[0].name;
  var reader = new FileReader();
  reader.onload = function(e) {
    el("image-picked").src = e.target.result;
    el("image-picked").className = "";
  };
  reader.readAsDataURL(input.files[0]);
}

function analyze(model) {
  var uploadFiles = el("file-input").files;
  if (uploadFiles.length !== 1) alert("Please select a file to analyze!");

  el("analyze-button").innerHTML = "Analyzing...";
  var xhr = new XMLHttpRequest();
  var loc = window.location;
  xhr.open("POST", `${loc.protocol}//${loc.hostname}:${loc.port}/analyze/` + window.mlModel,
    true);
  xhr.onerror = function() {
    alert(xhr.responseText);
  };
  xhr.onload = function(e) {
    if (this.readyState === 4) {
      var response = JSON.parse(e.target.responseText);
      response.result = response.result.split(', ')
      var returnObj = { prediction: '', predictionArray:   }
      response.result[0] = response.result[0].split(" ")[1]
      el("result-label").innerHTML = `Result = ${response["result"]}`;
    }
    el("analyze--button").innerHTML = "Go Go Gadget Analyze";
  };

  var fileData = new FormData();
  fileData.append("file", uploadFiles[0]);
  xhr.send(fileData);
}

function yieldResult(result) {
  let beginning = 'Hmmmm. I\'m resonably certain It\'s an image of ';
  let confidence = 1;
  if (confidence > 0.6) {
    switch(rand) {
      case 1:
        beginning = 'Oh. This is ';
        break;
      case 2:
        beginning = 'You\'re looking at ';
        break;
      case 3:
        beginning = 'That\'s ';
        break;
    }
  } else {
    switch(rand) {
      case 1:
        beginning = 'Hm. I think it\'s ';
        break;
      case 2:
        beginning = 'I\'m somewhat confident its ';
        break;
      case 3:
        beginning = 'Reasonably certain this is ';
        break;
    }
  }
}
