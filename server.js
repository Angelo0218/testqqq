const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('恭喜！白日夢冒險王的主機成功啟動了！');
});

app.listen(PORT, () => {
    console.log('---------------------------------------');
    console.log('伺服器啟動成功！');
    console.log('請打開瀏覽器看這裡: http://localhost:3000');
    console.log('---------------------------------------');
});