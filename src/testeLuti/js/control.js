function selectColor(ids, color){
    for (let i = 0; i < ids.length; i++) {
        let id = ids[i];
        for(let l = 1; l < qtdMax; l++){
            let svg = document.getElementById(l);
            let gs = svg.getElementsByTagName('g')
            for(let o = 0; o < gs.length; o++){
                if(gs[o].getAttribute('id') === id){
                    let paths = gs[o].getElementsByTagName('path');
                    for(let j=0; j<paths.length; j++){
                        paths[j].setAttribute('fill', color);
                    }
                }
            }
        }
    }
}

const readFile = async file => {
    const response = await fetch(file)
    const text = await response.text()
    console.log(text)
}

async function download() {
    let duration = document.getElementById('duarationAnimation').value;
    duration = duration == '' ? 50 : duration;
    let encoder = new GIFEncoder();
    encoder.setRepeat(0);
    encoder.setDelay(duration);
    encoder.start();
    for (let i = 1; i < qtdMax; i++) {
        let svg = document.getElementById(i);
        let xml = new XMLSerializer().serializeToString(svg);
        let svg64 = btoa(xml);
        let b64Start = 'data:image/svg+xml;base64,';
        let image64 = b64Start + svg64;
        let img = document.createElement("img");
        img.src = image64;
        let canvas = document.createElement("CANVAS");
        canvas.setAttribute('height', 1000);
        canvas.setAttribute('width', 1000);
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgb(255,255,255)';
        await ctx.fillRect(0, 0, 1000, 1000);
        await ctx.drawImage(img, 0, 0);
        await ctx.save();
        await encoder.addFrame(ctx);
        await canvas.remove();
        await img.remove();
    }
    await encoder.finish();
    await encoder.download("animation.gif");
}

let control = true;
let qtdMax = 27;
let start = 1;
let range = document.getElementById('playerRange');
range.setAttribute('max', qtdMax );
range.setAttribute('min', "1" );
async function player(btn){
    let action = btn.src;
    action = action.split('/');
    action = action[action.length-1].split('.')[0];

    if(action == 'play'){
        control = true;
        btn.src = 'images/pause.svg';
        play();
    } else if(action == 'pause'){
        control = false;
        btn.src = 'images/play.svg';
    }
}

function rangePlay(){
    let range = document.getElementById('playerRange');
    document.getElementById('desenho').innerHTML = (document.getElementById(""+range.value)).innerHTML;
    start=range.value;
}

async function play(){
    let duration = document.getElementById('duarationAnimation').value;
    duration = duration == '' ? 50 : duration;
    let range = document.getElementById('playerRange');
    while(control && start < qtdMax){
        document.getElementById('desenho').innerHTML = (document.getElementById(""+start)).innerHTML;
        await sleep(duration);
        range.value = start;
        start++;
        if(start>=qtdMax){
            start=1;
        }
    }
}

async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}
