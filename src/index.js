import React from "react";
import ReactDOM from "react-dom";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./styles.css";

class App extends React.Component {
  videoRef = React.createRef();
  canvasRef = React.createRef();
  // audio = new Audio(
  //   "https://13.sendit.download:443/d/vulyu2qft52fvxijtdt4tbydl4vii4o35qkcwz4g5m6itwnyk3b3zxdctu7dqu2iv5kyugs2/7f450sfhdtwp.mp3"
  // );
  audio = new Audio(
    //"https://freesound.org/data/previews/391/391869_2596106-lq.mp3" //happy birthday
    "https://freesound.org/data/previews/416/416529_5121236-lq.mp3" //birds
  );
  componentDidMount() {
    // if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    //   const screenPromise = navigator.media
    // }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "user"
          }
        })
        .then(stream => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        });
      const screenPromise = navigator.mediaDevices
        .getDisplayMedia()
        .then(stream => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        });
      const modelPromise = cocoSsd.load();

      Promise.all([modelPromise, screenPromise])
        .then(values => {
          this.detectFrame(this.videoRef.current, values[0]);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      this.renderPredictions(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(video, model);
      });
    });
  };

  renderPredictions = predictions => {
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    let peopleFlag = 0;
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
      if (prediction.class === "person") {
        peopleFlag++;
        if (!this.audio.onplaying) {
          this.audio.play();
        }
      } else if (prediction.class !== "person") {
        this.audio.pause();
        //this.audio.currentTime = 0;
      }
    });
    if (!peopleFlag) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  };

  render() {
    return (
      <div>
        <video
          className="size"
          autoPlay
          playsInline
          muted
          ref={this.videoRef}
          width="1920"
          height="1080"
        />
        <canvas
          className="size"
          ref={this.canvasRef}
          width="1920"
          height="1080"
        />
      </div>
    );
  }
}
/*
function countMyself() {
  // Check to see if the counter has been initialized
  if (typeof countMyself.counter === "undefined") {
    // It has not... perform the initialization
    countMyself.counter = 0;
  }

  // Do something stupid to indicate the value
  countMyself.counter++;
  console.log(countMyself.counter);
}
*/

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
