const express = require('express');
const socket = require('socket.io');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log(path.join(__dirname, 'script.js'))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});

const server = app.listen(PORT, ()=>console.log('server listening in port ' + PORT));

const io = socket(server);

let strokeRecord = [];

io.on('connection', (socket)=>{
  
  socket.on('sendStrokeData', (strokeData) => {
    strokeRecord.push({
      owner: socket.id,
      strokeData
    });
    socket.broadcast.emit('sendStrokeData', strokeData)
  });

  socket.on('getStrokeData', () => {
    strokeRecord.forEach(stroke => {
      socket.emit('sendStrokeData', stroke.strokeData);
    })
  });

  const eraseSocketDrawingFromStrokeRecord = () => {
    strokeRecord = strokeRecord.filter(stroke => {
      return stroke.owner !== socket.id
    });
  }

  socket.on('erase', ()=>{
    eraseSocketDrawingFromStrokeRecord();
    io.emit('erase');
  })

  socket.on('disconnect', () => {
    eraseSocketDrawingFromStrokeRecord();
    io.emit('erase');
  });
})