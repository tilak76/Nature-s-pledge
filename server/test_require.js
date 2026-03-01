try { require('./server'); console.log('server ok'); } catch (e) { console.log('server fail', e.stack); }
