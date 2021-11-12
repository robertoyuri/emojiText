function selectColor(ids, color){
    for (let i = 0; i < ids.length; i++) {
        let id = ids[i];
        document.styleSheets[0].rules[id].style.fill=color;
        document.styleSheets[0].rules[id].style.backgroundColor=color;
    }
}
let control = true;
let qtdMax = 27;
let start = 1;
let range = document.getElementById('playerRange');
range.setAttribute('max', qtdMax );
range.setAttribute('min', "1" );
async function player(btn){
    let range = document.getElementById('playerRange');
    range.setAttribute('max', qtdMax );
    range.setAttribute('min', "1" );
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
        console.log(""+(start))
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
