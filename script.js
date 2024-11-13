const socket = io();

const canvas = document.querySelector('canvas');

const ctx = canvas.getContext('2d', {
  willReadFrequently: true
});

const initializeCanvas = (width, height) => {
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.shadowBlur = 3;
  ctx.shadowColor = "black";
  ctx.strokeStyle = "white";
}

const originalWidth = innerWidth;
const originalHeight = innerHeight;

initializeCanvas(originalWidth, originalHeight);


let isDrawing = false;

const strokeData = [];

let myPath;

canvas.addEventListener('mousedown', (e)=> {
  if(e.button !== 0) return;
  isDrawing = true;
  myPath = new Path2D();
  const x = e.offsetX;
  const y = e.offsetY;
  myPath.moveTo(x, y);
  myPath.lineTo(x, y);
  ctx.stroke(myPath);
  strokeData.push([x / scaleWidth, y / scaleHeight]);
});


canvas.addEventListener('mouseup', () => {
  isDrawing = false;
  socket.emit('sendStrokeData', strokeData);
  strokeData.length = 0;
});

canvas.addEventListener('mousemove', (e) => {
  if(!isDrawing) return;
  const x = e.offsetX;
  const y = e.offsetY;
  myPath.lineTo(x, y);
  ctx.stroke(myPath);
  strokeData.push([x / scaleWidth, y / scaleHeight]);
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  socket.emit('erase');
});

socket.on('connect', () => {
  socket.emit('getStrokeData');
});

let otherPath;

let scaleWidth = 1;
let scaleHeight = 1;

const drawStrokeData = (strokeData) => {
  strokeData.forEach(([x,y], index) => {
    if(index === 0) {
      otherPath = new Path2D();
      otherPath.moveTo(x * scaleWidth, y * scaleHeight);
      otherPath.lineTo(x * scaleWidth, y * scaleHeight);
      ctx.stroke(otherPath);
      return;
    }
    otherPath.lineTo(x * scaleWidth, y * scaleHeight);
    ctx.stroke(otherPath);
  });
}


socket.on('sendStrokeData', (strokeData) => {
  drawStrokeData(strokeData);
});

socket.on('erase', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit('getStrokeData');
});

const resizeCanvas = () => {
  let timeout = 500;
  let id = null;
  return () => {
    clearTimeout(id);
    id = setTimeout(() => {
      initializeCanvas(innerWidth, innerHeight);
      scaleWidth = innerWidth/originalWidth;
      scaleHeight = innerHeight/originalHeight;
      socket.emit('getStrokeData');
    }, timeout)
  }
}

const resize = resizeCanvas();

addEventListener('resize', ()=>{
  resize();
});