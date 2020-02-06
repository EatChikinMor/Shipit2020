let el = x => document.getElementById(x);

function showPicker() {
  el("file-input").click();
}

function showPicked(input) {
  el("upload-label").innerHTML = input.files[0].name;
  let reader = new FileReader();
  reader.onload = function(e) {
    el("image-picked").src = e.target.result;
    el("image-picked").className = "";
  };
  reader.readAsDataURL(input.files[0]);
}

function analyze(model) {
  let uploadFiles = el("file-input").files;
  if (uploadFiles.length !== 1) alert("Please select a file to analyze!");

  el("analyze-button").innerHTML = "Analyzing...";
  let xhr = new XMLHttpRequest();
  let loc = window.location;
  xhr.open("POST", `${loc.protocol}//${loc.hostname}:${loc.port}/analyze/` + window.mlModel,
    true);
  xhr.onerror = function() {
    alert(xhr.responseText);
  };
  xhr.onload = function(e) {
    if (this.readyState === 4) {
      let response = JSON.parse(e.target.responseText);
      let regExp = /\(([^)]+)\)/;
      let matches = regExp.exec(response.resultIndex);
      response.resultIndex = parseInt(matches[1], 10);
      matches = regExp.exec(response.resultConfidence);
      response.resultConfidence = JSON.parse(matches[1]);
      yieldResult(response)
    }
    el("analyze-button").innerHTML = "Go Go Gadget Analyze";
  };

  let fileData = new FormData();
  fileData.append("file", uploadFiles[0]);
  xhr.send(fileData);
}

function yieldResult(response) {
  let beginning = 'Hmmmm. I\'m resonably certain It\'s an image of ';
  let confidence = response.resultConfidence[response.resultIndex];
  let rand = Math.floor(Math.random() * 3) + 1
  if (confidence > 0.8) {
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
    if(window.mlModel === 'Baseball' && window.enableResultTheme) {
      if (response.result === 'baseball') {
        themes.baseball()
      } else {
        themes.cricket()
      }
    }

    el("result-label").innerHTML = beginning + response.result.toLowerCase();
    el("confidence-label").innerHTML = "Confidence:" + confidence*100;
  }
}
