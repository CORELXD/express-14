const express = require("express");
const app = express();
const port = 9000;

const bodyPs = require('body-parser');
app.use(bodyPs.urlencoded({ extended: false}));
app.use(bodyPs.json());

//app.get('/', (req, res)=>{ 
  //  res.send('Hey Kamu')
//})

const kendaraanRouter = require("./kendaraan");
const transmisiRouter = require("./transmisi");
app.use("/api/kendaraan", kendaraanRouter);
app.use("/api/transmisi", transmisiRouter);

app.listen(port, () =>{
    console.log(`aplikasi berjalan di http:://localhost:${port}`)
});