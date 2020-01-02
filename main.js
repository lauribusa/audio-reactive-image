navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

document.getElementById('fileInput').addEventListener('change', handleFiles);


// available anchorPoint. Value must be either "upLeft" (upper left), "botLeft" (bottom left), "upRight" (upper right), "botRight" (bottom right), "center"
let anchorPoint = "botRight";
// image height.
let imgWidth = 300;
// image width.
let imgHeight = 300;
// multiplies the effect by X. Use decimals (ex: 0.5) to diminish the effect.
let multiplier = 2;
// changes the background color;
let greenScreenColor = "#00ff00";
// change this number to raise the volume at which the effect starts.
let threshold = 0;

let glblImg; 
function handleFiles(e) {
  
  let ctx = $("#canvas")[0].getContext("2d");
        var img = new Image;
        img.onload = function() {
          URL.revokeObjectURL(img.src)
            ctx.drawImage(img, imgWidth, imgHeight);
           glblImg = img;
        }
        img.src = URL.createObjectURL(e.target.files[0]);
}
let canvas = $("#canvas")[0];
if (navigator.getUserMedia) {
  navigator.getUserMedia({
      audio: true
    },
    function(stream) {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);
      javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);
    
      let canvasContext = canvas.getContext("2d");
        
      javascriptNode.onaudioprocess = function() {
          var array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          var values = 0;

          var length = array.length;
          for (var i = 0; i < length; i++) {
            values += (array[i]);
          }

          var average = (values / length);
          console.log("volume before multiplier: ",average);
          if(average < threshold){
            return;
          }
          
          average = average * multiplier;

          console.log("volume after multiplier: ",average);
      
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.fillStyle = '#00ff00';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        switch (anchorPoint) {
            case "upLeft":
                canvasContext.drawImage(glblImg, 0, 0, imgWidth+average , imgHeight+average);
                break;
            case "botLeft":
                canvasContext.drawImage(glblImg, 0,  (canvas.height - imgHeight) - average, imgWidth+average, imgHeight+average);
                break;
            case "upRight":
                canvasContext.drawImage(glblImg, (canvas.width - imgWidth) - average, 0, imgWidth+average, imgHeight+average);
                break;
            case "botRight":
                canvasContext.drawImage(glblImg, (canvas.width - imgWidth) - average, (canvas.height - imgHeight) - average, imgWidth+average, imgHeight+average);
                break;
            case "center":
                canvasContext.drawImage(glblImg, ((canvas.width * 0.5) - (imgWidth * 0.5)) - (average * 0.5), ((canvas.width * 0.5) - (imgHeight*0.5)) - (average * 0.5), imgWidth+average, imgHeight+average);
                break;
            default:
                console.error("Wrong type of case used. Only use upLeft, upRight, botLeft, botRight, center");
                break;
        }

        } // end fn stream
    },
    function(err) {
      console.log("The following error occured: " + err.name)
    });
} else {
  console.log("getUserMedia not supported");
}