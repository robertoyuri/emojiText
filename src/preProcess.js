let query = window.location.search.substring(1).replaceAll('%20', ' ').split('&');
let r = [];
for(let a=0; a < query.length; a++){
    query[a] = query[a].split('=');
    r[query[a][0]] = query[a][1];
}
if(r['data'] != undefined){
    loadPath("media/data/" + r['data'] + ".json");
}
let datas = [];
let dataType = [];
let filterList = [];
let classType = 'emotion';
let filterListID = 0;
let globalPromises = [];
let globalAttributeListWithout = [];
let modalMissingAttr = new bootstrap.Modal(document.getElementById('selectMissingAttrModal'), {
    keyboard: false
});
let emotionPolarity = [];

function loadPath(filePath){
    hide();
    d3.json(filePath).then((data) => {
        loadData(data);
    });
}

function howAre(attributeList, attributeListWithout){
    d3.select('#selectMissingAttrBody').selectAll('*').remove();
    for(let aw of attributeListWithout){
        let select = document.createElement('select');
        select.value = aw;
        select.setAttribute('id', 'form-select-'+aw);
        select.setAttribute('class', 'form-select');
        select.setAttribute('required', '');
        let label = document.createElement('label');
        label.setAttribute('class','form-label');
        label.innerText = aw+':';
        let div = document.getElementById('selectMissingAttrBody');
        div.appendChild(label);
        div.appendChild(select);
        for(let a in attributeList){
            let option = document.createElement('option');
            option.setAttribute('value', a);
            if(a === aw){
                option.setAttribute('selected', '')
            }
            option.innerText = a;
            select.appendChild(option);
        }
    }
}

function identifyHowAre(){
        for (let a of globalAttributeListWithout) {
            for (let i = 0; i < globalPromises.length; i++) {
                if (globalPromises[i][a] !== undefined){
                    globalPromises[i][a+'2'] = globalPromises[i][a];
                }
                globalPromises[i][a] = globalPromises[i][document.getElementById('form-select-'+a).value];
            }
        }
        modalMissingAttr.hide();
        checkEmotionPolarity(globalPromises);
}

function loadData(promises) {
    globalPromises = promises;
    /*let ttemp = [];
    let ttemp2 = [];
    for(let p of promises){
        console.log(p.message);
        if(!ttemp.includes(p.message)){
            ttemp.push(p.message);
            ttemp2.push(p);
        }
    }
    globalPromises = ttemp2;
    promises = ttemp2;*/
    let attributeListWithout = [];
    let attrList = ['text', 'emotion', 'polarity'];
    if (promises[0].text === undefined) {
        attributeListWithout.push('text');
    }
    if (promises[0].emotion === undefined) {
        attributeListWithout.push('emotion');
    }
    if (promises[0].polarity === undefined) {
        attributeListWithout.push('polarity');
    }
    if (promises[0].test === undefined && r['multi'] == undefined) {
        let confirmTest = confirm('Does the data have attributes to generate multiple emojiText?');
        if(confirmTest){
            attributeListWithout.push('test');
            attrList.push('test');
        }
    }
    if(r['multi'] == 'true'){
        attributeListWithout.push('test');
        attrList.push('test');
    }
    howAre(promises[0], attrList);
    if (attributeListWithout.length > 0) {
        modalMissingAttr.show();
        globalAttributeListWithout = attributeListWithout;
    }else{
        checkEmotionPolarity(promises)
    }
}

function checkEmotionPolarity(promises){
    globalPromises = promises;
    emotionPolarity['positive'] = 'positive';emotionPolarity['neutral'] = 'neutral';
    emotionPolarity['negative'] = 'negative';emotionPolarity['happy'] = 'happy';
    emotionPolarity['surprise'] = 'surprise';emotionPolarity['angry'] = 'angry';emotionPolarity['sad'] = 'sad';
    emotionPolarity['fear'] = 'fear';emotionPolarity['disgust'] = 'disgust';emotionPolarity['contempt'] = 'contempt';
    let control = "positive negative neutral happy surprise angry sad fear disgust contempt";
    let emotions = "";
    let polarities = "";
    for(let data of promises){
        if(!emotions.includes(data.emotion)){
            emotions += data.emotion + ', ';
            if(!control.includes(data.emotion)){control = 'true';}
        }
        if(!polarities.includes(data.polarity)){
            polarities += data.polarity + ', ';
            if(!control.includes(data.polarity)){control = 'true';}
        }
    }
    emotions = emotions.split(',');
    emotions.pop();
    polarities = polarities.split(',');
    polarities.pop();

    d3.select('#checkEmotionLabel').selectAll('*').remove();
    d3.select('#checkPolarityLabel').selectAll('*').remove();

    let select = document.createElement('select');
    select.setAttribute('class', 'form-select form-select-sm');
    select.setAttribute('required', '');
    for(let e in emotionPolarity){
        let option = document.createElement('option');
        option.innerText = e;
        option.value = e;
        select.appendChild(option);
    }

    for(let e of emotions){
        let label = document.createElement('label');
        label.setAttribute('class', 'form-label')
        label.innerText = e + ':';
        let div = document.getElementById('checkEmotionLabel');
        div.appendChild(label);
        let selectEmotion = select.cloneNode(true);
        selectEmotion.setAttribute('name', e);
        selectEmotion.value = e.replaceAll(' ', '');

        div.appendChild(selectEmotion);
    }
    for(let e of polarities){
        let label = document.createElement('label');
        label.setAttribute('class', 'form-label')
        label.innerText = e + ':';
        let div = document.getElementById('checkPolarityLabel');
        div.appendChild(label);
        let selectPolarity = select.cloneNode(true);
        selectPolarity.setAttribute('name', e);
        selectPolarity.value = e.replaceAll(' ', '');
        div.appendChild(selectPolarity);
    }

    if(control === 'true'){
        let modal = new bootstrap.Modal(document.getElementById('checkEmotionPolarity'), {
            keyboard: false
        });
        modal.show();
    }else {
        divideData(globalPromises);
    }
}

function saveEmotionPolarity(){
    let emo = document.getElementById('checkEmotionLabel').childNodes;
    let pol = document.getElementById('checkPolarityLabel').childNodes;
    for(let e of [...emo, ...pol]){
        if(e.tagName === 'SELECT'){
            emotionPolarity[e.name.replaceAll(' ', '')] = e.value.replaceAll(' ', '');
        }
    }
    divideData(globalPromises);
}

function divideData(promises){
    d3.select('#emojiTextBoard').selectAll('*').remove();
    let board = document.getElementById('emojiTextBoard');
    let tests = [];
    createDataModel(promises);
    for(let p of promises){
        if(!tests.includes(p.test)){
            tests.push(p.test)
        }
    }
    if(tests.length > 1){
        let id = 1;
        let row;
        for(let t of tests){
            let subPromises = [];
            for(let p of promises){
                if(t === p.test){
                    subPromises.push(p);
                }
            }
            if(id % 2 === 1){
                row = document.createElement('div');
                row.setAttribute('class', 'row');
                board.append(row);
            }
            let col = document.createElement('div');
            col.setAttribute('class', id % 2 === 1 && id === tests.length ? 'col' : 'col-6');
            col.setAttribute('id', 'emojiText'+id);
            row.append(col);
            preProcess(subPromises, 'emojiText'+id);
            id++;
        }
    }else{
        preProcess(promises, 'emojiTextBoard');
    }
    afterLoad();
}

function afterLoad(){
    let nodesLinks = [...document.getElementsByName('nodes'), ...document.getElementsByName('links')];
    for (let n of nodesLinks){
        n.addEventListener("click", function (e){
            if(parseInt(n.getAttribute('opacity')) !== 1){
                nodesLinksON();
            }else{
                nodesLinksOFF();
                nodeLinkOpacity(n.getAttribute('phraseID'));
            }
        });

    }
}
function preprocessArea(){
    let data = [];
    for(let g of globalPromises){
        data[g.time]= {'total':0,'positive':0,'happy':0,'surprise':0,'neutral':0,'fear':0,'sad':0,'angry':0,'disgust':0,
            'contempt':0,'negative':0};
    }
    for(let g of globalPromises){
        data[g.time]['total'] += 1;
        if(g.emotion == 'neutral'){
            data[g.time]['neutral'] += 1;
        }else{
            data[g.time][g.emotion] += 1;
            data[g.time][g.polarity] += 1;
        }
    }
    stackedarea("#areaBoard", data);
}

function createDataModel(dataJson){
    dataType = [];
    filterList = [];

    d3.select('#datasetInformationData').selectAll('*').remove();
    let select = document.getElementById('selectAttribute');
    for(let opt in select.options){
        select.remove(opt);
    }
    let option = document.createElement('option'); option.text="Select attribute";
    select.add(option, null);

    if(dataJson[0].id === undefined){
        for(let i = 0; i < dataJson.length; i++){
            dataJson[i].id = i;
        }
    }
    let tempCount = 0;
    let row = document.createElement('div');
    for(let item in dataJson[0]){
        if(item !== undefined){
            let option = document.createElement('option');
            option.setAttribute('value', item);
            option.innerText = item;
            option.text = item;
            let datasetInformationData = document.getElementById('datasetInformationData');
            if(tempCount === 0 || tempCount%4 == 0){
                row = document.createElement('div');
                row.setAttribute('class','row');
                if(tempCount > 0){
                    datasetInformationData.innerHTML += "<br>";
                }
                datasetInformationData.appendChild(row);
            }
            tempCount++;
            let col = document.createElement('div');
            col.setAttribute('class', 'col');
            row.appendChild(col);
            let label = document.createElement('label');
            label.setAttribute('class', 'form-label')
            label.setAttribute('id', 'formLabel'+item)
            label.innerText = item+":";
            col.appendChild(label);
            let selectDatasetInformationData = document.createElement('select');
            selectDatasetInformationData.setAttribute('id', 'formSelectDataInfo'+item);
            selectDatasetInformationData.setAttribute('class', 'form-select');
            selectDatasetInformationData.setAttribute('size', 5);
            selectDatasetInformationData.setAttribute('disabled', '');
            col.appendChild(selectDatasetInformationData);

            let dataListOption = document.getElementById('dataListOption'+item);
            if(dataListOption == undefined){
                dataListOption = document.createElement('datalist');
                dataListOption.setAttribute('id','dataListOption'+item);
            }else{
                for(let opt in dataListOption.options){
                    dataListOption.remove(opt);
                }
            }
            if(isNaN(dataJson[0][item])){
                dataType[item] = {"attribute":item, "type":'categorical'};
                option.setAttribute('dataType','categorical');
                let tempOptions = "";
                for(let ddd in dataJson) {
                    let option2 = document.createElement('option');
                    option2.value = dataJson[ddd][item];
                    option2.innerText=dataJson[ddd][item];
                    if(!tempOptions.includes(dataJson[ddd][item]) && item !== 'text'){
                        dataListOption.appendChild(option2);
                        selectDatasetInformationData.appendChild(option2.cloneNode(true));
                        tempOptions += dataJson[ddd][item] + ',';
                    }
                }
            }else{
                option.setAttribute('dataType','continuous');
                let min = Number.MAX_VALUE;
                let max = Number.MIN_VALUE;
                let tempOptions = "";
                for(let ddd in dataJson){
                    let option2 = document.createElement('option');
                    option2.value=dataJson[ddd][item];
                    option2.innerText=dataJson[ddd][item];
                    if(!tempOptions.includes(dataJson[ddd][item]) && item !== 'text') {
                        dataListOption.appendChild(option2);
                        selectDatasetInformationData.appendChild(option2.cloneNode(true));
                        tempOptions += dataJson[ddd][item] + ',';
                    }
                    if(parseFloat(dataJson[ddd][item]) < parseFloat(min)){
                        min = parseFloat(dataJson[ddd][item]);
                    }
                    if(parseFloat(dataJson[ddd][item]) > parseFloat(max)){
                        max = parseFloat(dataJson[ddd][item]);
                    }
                }
                let minmaxlabel = document.createElement('label');
                minmaxlabel.setAttribute('style', 'font-size: 12px;')
                minmaxlabel.innerText = "min: "+ min + " max: " + max + ""
                col.appendChild(minmaxlabel);
                option.setAttribute('min', min);
                option.setAttribute('max', max);
                dataType[item] = {"attribute":item, "type":'continuous', "min":min, "max":max};
                let optAnin = option.cloneNode();
                optAnin.innerText = item;
                document.getElementById('timeAnimation').appendChild(optAnin);
            }
            select.add(option, null);
            document.getElementById('dataLists').appendChild(dataListOption);
        }
    }
}

async function preProcess(dataJson, local){
    hide();
    document.getElementById('filterTable').innerHTML = "<tr><th>Attribute</th><th>Term</th><th></th></tr>";
    filterListID = 0;

    function comparePolarity(words) {
        let polarity = ["", "positive", "negative", "neutral", "positive", "negative", "neutral"];
        let pol = [];
        pol["positive"] = 1;
        pol["negative"] = 2;
        pol["neutral"] = 3;
        if(words.length < 2){
            return words[0].name;
        }else{
            let id = 0;
            for(let i = 0; i < words.length; i++){
                if(words[i].size === words[0].size){
                    id += pol[words[i].name];
                }
            }
            return polarity[id];
        }
    }

    function compareEmotion(words) {
        if(words.length < 2){
            return words[0].name;
        }else{
            return words[0].name;
        }
    }

    function sortSize(words) {
        let sizes = [];
        let keys = [];
        for(let i = 0; i < words.length; i++){
            if(sizes[words[i]] === undefined){
                keys.push(words[i]);
                sizes[words[i]] = 1;
            } else{
                sizes[words[i]] += 1;
            }
        }
        words = [];
        for(let i = 0; i < keys.length; i++){
            words.push({"name":keys[i], "size":sizes[keys[i]]});
        }
        if(words.length > 1){
            words.sort(function(a,b) {
                return a.size > b.size ? -1 : a.size < b.size ? 1 : 0;
            });
        }
        return words;
    }

    let words = [];
    let links = [];
    let keys = [];
    let group = 0;



    let stopwords = " ! rt shift join vou sobre vem de dá ai aí a o que e do da em um para é com não uma os no se na por mais as dos como mas foi ao ele " +
        "das tem à seu sua ou ser quando muito há nos já está eu também só pelo pela até isso ela entre era depois " +
        "sem mesmo aos ter seus quem nas me esse eles estão você tinha foram essa num nem suas meu às minha têm " +
        "numa pelos elas havia seja qual será nós tenho lhe deles essas esses pelas este fosse dele tu te vocês vos" +
        " lhes meus minhas teu tua teus tuas nosso nossa nossos nossas dela delas esta estes estas aquele aquela" +
        " aqueles aquelas isto aquilo estou está estamos estão estive esteve estivemos estiveram estava estávamos" +
        " estavam estivera estivéramos esteja estejamos estejam estivesse estivéssemos estivessem estiver " +
        "estivermos estiverem hei há havemos hão houve houvemos houveram houvera houvéramos haja hajamos hajam " +
        "houvesse houvéssemos houvessem houver houvermos houverem houverei houverá houveremos houverão houveria " +
        "houveríamos houveriam sou somos são era éramos eram fui foi fomos foram fora fôramos seja sejamos sejam " +
        "fosse fôssemos fossem for formos forem serei será seremos serão seria seríamos seriam tenho tem temos tém " +
        "tinha tínhamos tinham tive teve tivemos tiveram tivera tivéramos tenha tenhamos tenham tivesse tivéssemos " +
        "tivessem tiver tivermos tiverem terei terá teremos terão teria teríamos teriam a about above across after " +
        "again against all almost alone along already also although always among an and another any anybody anyone " +
        "anything anywhere are around as ask asked asking asks at away b back backed backing backs be " +
        "became because become becomes been before began behind being beings best better between big both but by c " +
        "came can cannot case cases certain certainly clear clearly come could d did differ different differently " +
        "do does done down down downed downing downs during e each early either end ended ending ends enough even " +
        "evenly ever every everybody everyone everything everywhere f face faces fact facts far felt few find finds" +
        " first for four from full fully further furthered furthering furthers g gave general generally get gets " +
        "give given gives go going good goods got great greater greatest group grouped grouping groups h had has " +
        "have having he her here herself high high high higher highest him himself his how however i if important " +
        "in interest interested interesting interests into is it its itself j just k keep keeps kind knew know " +
        "known knows l large largely last later latest least less let lets like likely long longer longest m made " +
        "make making man many may me member members men might more most mostly mr mrs much must my myself n " +
        "necessary need needed needing needs never new new newer newest next no nobody non noone not nothing " +
        "now nowhere number numbers o of off often old older oldest on once one only open opened opening opens or " +
        "order ordered ordering orders other others our out over p part parted parting parts per perhaps place " +
        "places point pointed pointing points possible present presented presenting presents problem problems put " +
        "puts q quite r rather really right right room rooms s said same saw say says second seconds see seem " +
        "seemed seeming seems sees several shall she should show showed showing shows side sides since small " +
        "smaller smallest so some somebody someone something somewhere state states still still such sure t take " +
        "taken than that the their them then there therefore these they thing things think thinks this those though " +
        "thought thoughts three through thus to today together too took toward turn turned turning turns two u " +
        "under until up upon us use used uses v very w want wanted wanting wants was way ways we well wells went " +
        "were what when where whether which while who whole whose why will with within without work worked working " +
        "works would x y year years yet you young younger youngest your yours z roberto gay";

    for(let i = 0; i < dataJson.length; i++){
        dataJson[i].text = dataJson[i].text.toLowerCase();
        dataJson[i].text = dataJson[i].text.replaceAll(/[^A-Z0-9 áàâãäéèêëíìîïóòôõöúùûüç!]/ig,'');
        dataJson[i].text = dataJson[i].text.replaceAll('  ',' ');
        dataJson[i].text = dataJson[i].text.replaceAll('  ',' ');
        if(dataJson[i].text != undefined && dataJson[i].text != null && dataJson[i].text != ""){
            group++;
            let ws = dataJson[i].text.split(" ");
            let lastWord = "";
            for (let j = 0; j < ws.length; j++) {
                ws[j] = ws[j].toLowerCase();
                if(!stopwords.includes(" " + ws[j] + " ") && ws[j] !== ""){
                    if(words[ws[j]] == undefined){
                        keys.push(ws[j]);
                        words[ws[j]] = [];
                        words[ws[j]]["emotion"] = dataJson[i].emotion;
                        words[ws[j]]["polarity"] = dataJson[i].polarity;
                        words[ws[j]]["size"] = 1;
                        words[ws[j]]["id"] = dataJson[i].id;
                        words[ws[j]]["text"] = dataJson[i].text;
                        if(lastWord != ""){
                            let line = {"source":lastWord, "target":ws[j], "value":1, "group":""+group+",",
                                "id":""+dataJson[i].id, "emotion": dataJson[i].emotion, "polarity": dataJson[i].polarity,
                                "text":dataJson[i].text};
                            let index = links.findIndex(a => (a.source == line.source && a.target == line.target) ||
                                (a.target == line.source && a.source == line.target));

                            if (index === -1){
                                links.push(line);
                            }else {
                                links[index].value++;
                                links[index].group += ""+group+",";
                                links[index].id += ","+dataJson[i].id;
                            }
                        }
                    }else{
                        words[ws[j]]["emotion"] += " " + dataJson[i].emotion;
                        words[ws[j]]["polarity"] += " " + dataJson[i].polarity;
                        words[ws[j]]["size"]++;
                        words[ws[j]]["id"] += "," + dataJson[i].id;
                        words[ws[j]]["text"] = dataJson[i].text;
                        if(lastWord != ""){
                            let line = {"source":lastWord, "target":ws[j], "value":1, "group":""+group+",",
                                "id":""+dataJson[i].id, "emotion": dataJson[i].emotion, "polarity": dataJson[i].polarity,
                                "text":dataJson[i].text};
                            let index = links.findIndex(a => (a.source == line.source && a.target == line.target) ||
                                (a.target == line.source && a.source == line.target));

                            if (index === -1){
                                links.push(line);
                            }else {
                                links[index].value++;
                                links[index].group += ""+group+",";
                                links[index].id += ","+dataJson[i].id;
                            }
                        }
                    }
                    lastWord = ws[j];
                }
            }
        }
    }

    let temp = [];
    for(let i = 0; i < keys.length; i++){
        let emotion = sortSize(words[keys[i]]["emotion"].split(" "))[0].name;
        //let emotion = compareEmotion(sortSize(words[keys[i]]["emotion"].split(" ")));
        //let polarity = comparePolarity(sortSize(words[keys[i]]["polarity"].split(" ")));
        let polarity = sortSize(words[keys[i]]["polarity"].split(" "))[0].name;
        temp.push({
            "word":keys[i],
            "status":emotion,
            "emotion":emotion,
            "polarity":polarity,
            "size":words[keys[i]]["size"],
            "text":words[keys[i]]["text"],
            "id":words[keys[i]]["id"],
        });
    }

    temp.sort(function(a,b) {
        return a.size > b.size ? -1 : a.size < b.size ? 1 : 0;
    });
    words = temp;
    let dataListOptiontext = document.getElementById('dataListOptiontext');
    dataListOptiontext.setAttribute('style', 'max-height:80px !important;');
    let tempOptions = "";
    for(let w in words) {
        let option = document.createElement('option');
        option.value = words[w].word;
        option.innerText = words[w].word;
        if(!tempOptions.includes(words[w].word)){
            dataListOptiontext.appendChild(option);
            tempOptions += words[w].word + ',';
            document.getElementById('formSelectDataInfotext').appendChild(option.cloneNode(true));
        }
    }
    new emojiText("#"+local, words, links, dataJson, emotionPolarity);
    startQuerys();
    //preprocessArea();
}

function loadDataset(){
    hide();
    let file = document.getElementById('loadFile').files[0];
    datas = [{"name":"Content","path":file.name}];
    if (!file) {
        return;
    }
    let reader = new FileReader();
    reader.onload = function(e) {
        let result = e.target.result;
        loadData(JSON.parse(result));
    };
    reader.readAsText(file);
}

function filterW(attribute, term){
    let alertB = document.getElementById('alert');
    let alertMensage = document.getElementById('alertMensage');
    if(attribute !== "Select attribute" && term !== ""){
        let phraseID = "";
        if(dataType[attribute].type == "continuous"){
            if(attribute == 'id' && !term.includes('-')){
                if(globalPromises[term] !== undefined){
                    phraseID = term;
                }
            }else{
                for(let c in globalPromises){
                    if(term.includes('-')){
                        let mimMax = term.split('-');
                        if(parseFloat(globalPromises[c][attribute]) >= parseFloat(mimMax[0]) && parseFloat(globalPromises[c][attribute]) <= parseFloat(mimMax[1])){
                            phraseID += globalPromises[c].id + ",";
                        }
                    }else{
                        if(parseFloat(globalPromises[c][attribute]) == parseFloat(term)){
                            phraseID += globalPromises[c].id + ",";
                        }
                    }
                }
            }
        }else{
            for(let c in globalPromises){
                if(globalPromises[c][attribute].includes(term)){
                    phraseID += globalPromises[c].id + ",";
                }
            }
        }
        if(phraseID.length == 0){
            alertB.setAttribute('class', "alert alert-danger alert-dismissible fade show");
            alertMensage.innerHTML = "ERROR!".bold() + " The term: '" + term + "' in attribute: '" + attribute + "' not found.";
        }else {
            document.getElementById('typeTerm').value = "";
            document.getElementById('filterTable').innerHTML += "<tr id='filterLine"+filterListID+"'><td>"+attribute+
                "</td><td>"+term+"</td><td><a onclick='deleteFilter("+filterListID+")'><img src='media/images/trash.svg' height='15px'></a></td></tr>";
            filterList.push({"id":filterListID,"attribute":attribute, "term":term, "phraseID":phraseID});
            filterListID++;
            mergeFilter();
            alertB.setAttribute('class', "alert alert-success alert-dismissible fade show");
            alertMensage.innerHTML = "DONE!".bold() + " The term: '" + term + "' in attribute: '" + attribute + "' was successfully filtered.";
        }
    }else{
        alertB.setAttribute('class', "alert alert-danger alert-dismissible fade show");
        alertMensage.innerHTML = "ERROR!".bold() + " The term: '" + term + "' in attribute: '" + attribute + "' not found.";
        mergeFilter();
    }
}

function filter(){
    let alertB = document.getElementById('alert');
    let alertMensage = document.getElementById('alertMensage');
    let attribute = document.getElementById('selectAttribute');
    let term = document.getElementById('typeTerm').value;
    if(attribute.value !== "Select attribute" && term !== ""){
        let phraseID = "";
        if(dataType[attribute.value].type == "continuous"){
            if(attribute.value == 'id' && !term.includes('-')){
                if(globalPromises[term] !== undefined){
                    phraseID = term;
                }
            }else{
                for(let c in globalPromises){
                    if(term.includes('-')){
                        let mimMax = term.split('-');
                        if(parseFloat(globalPromises[c][attribute.value]) >= parseFloat(mimMax[0]) && parseFloat(globalPromises[c][attribute.value]) <= parseFloat(mimMax[1])){
                            phraseID += globalPromises[c].id + ",";
                        }
                    }else{
                        if(parseFloat(globalPromises[c][attribute.value]) == parseFloat(term)){
                            phraseID += globalPromises[c].id + ",";
                        }
                    }
                }
            }
        }else{
            for(let c in globalPromises){
                if(globalPromises[c][attribute.value].includes(term)){
                    phraseID += globalPromises[c].id + ",";
                }
            }
        }
        if(phraseID.length == 0){
            alertB.setAttribute('class', "alert alert-danger alert-dismissible fade show");
            alertMensage.innerHTML = "ERROR!".bold() + " The term: '" + term + "' in attribute: '" + attribute.value + "' not found.";
        }else {
            document.getElementById('typeTerm').value = "";
            document.getElementById('filterTable').innerHTML += "<tr id='filterLine"+filterListID+"'><td>"+attribute.value+
                "</td><td>"+term+"</td><td><a onclick='deleteFilter("+filterListID+")'><img src='media/images/trash.svg' height='15px'></a></td></tr>";
            filterList.push({"id":filterListID,"attribute":attribute.value, "term":term, "phraseID":phraseID});
            filterListID++;
            mergeFilter();
            alertB.setAttribute('class', "alert alert-success alert-dismissible fade show");
            alertMensage.innerHTML = "DONE!".bold() + " The term: '" + term + "' in attribute: '" + attribute.value + "' was successfully filtered.";
        }
    }else{
        alertB.setAttribute('class', "alert alert-danger alert-dismissible fade show");
        alertMensage.innerHTML = "ERROR!".bold() + " The term: '" + term + "' in attribute: '" + attribute.value + "' not found.";
        mergeFilter();
    }
}

function mergeFilter(){
    if(filterList.length > 0){
        let phraseID = filterList[0].phraseID;
        for(let f in filterList){
            for (let s of filterList[f].phraseID.split(',')){
                //for(let p of phraseID.split(',')){
                   // if(s == p){
                    if(phraseID.indexOf(s)){
                        phraseID += s + ",";
                    }
                //}
            }
            phraseID = phraseID.replace(',,', ',');
        }
        nodesLinksOFF();
        nodeLinkOpacity(phraseID);
    }else{
        nodesLinksON();
    }
}

function deleteFilter(id){
    for(let i = 0; i < filterList.length; i++){
        if(filterList[i].id == id){
            filterList.splice(i, 1);
            document.getElementById('filterLine'+id).remove();
            mergeFilter();
        }
    }

}

function hide(){
    document.getElementById('alert').setAttribute('class', "collapse");
}

function selectOption(){
    let option = document.getElementById('selectAttribute').value;
    let term = document.getElementById('typeTerm');
    term.setAttribute('list', "dataListOption" + option);
    term.value="";
    if(dataType[option].type == 'continuous'){
        document.getElementById('filterContinuos').setAttribute('class', '');
        let rangeMin = document.getElementById('rangeMin');
        rangeMin.setAttribute("min",dataType[option].min);
        rangeMin.setAttribute("max",dataType[option].max);
        let rangeMax = document.getElementById('rangeMax');
        rangeMax.setAttribute("min",dataType[option].min);
        rangeMax.setAttribute("max",dataType[option].max);
    }else{
        document.getElementById('filterContinuos').setAttribute('class', 'collapse');
    }
}

function setVal(){
    document.getElementById("typeTerm").value = document.getElementById("rangeMin").value;
    if(document.getElementById("checkMax").checked){
        document.getElementById("typeTerm").value += "-" + document.getElementById("rangeMax").value;
    }
}

function selectColor(id, color){
    document.styleSheets[0].rules[id].style.fill=color;
    document.styleSheets[0].rules[id].style.stroke=color;
    document.styleSheets[0].rules[id].style.backgroundColor=color;
}

let control = true;
function player(btn){
    let action = btn.src;
    action = action.split('/');
    action = action[action.length-1].split('.')[0];

    let time = document.getElementById('timeAnimation');
    for(let t of time.childNodes){
        if(t.innerText === time.value){
            time = t;
            break;
        }
    }
    let temp = globalPromises;
    temp.sort(function(a,b) {
        return a[time.innerText] < b[time.innerText] ? -1 : a[time.innerText] > b[time.innerText] ? 1 : 0;
    });
    let range = document.getElementById('playerRange');
    range.setAttribute('max', temp.length );
    if(action == 'play'){
        control = true;
        btn.src = 'media/images/pause.svg';
        play(temp, btn);
    } else if(action == 'pause'){
        control = false;
        btn.src = 'media/images/play.svg';
    } else if(action == 'next'){
        range.value = 5 + parseInt(range.value);
        animationPlay(temp);
    } else if(action == 'previous'){
        document.getElementById('playerRange').value-=5;
        animationPlay(temp);
    }else {
        animationPlay(temp)
    }
}

async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}

async function play(data, btn){
    let duration = document.getElementById('duarationAnimation').value;
    duration = duration == '' ? 500 : duration;
    let range = document.getElementById('playerRange');
    let i = range.value;
    while(parseInt(range.value) < parseInt(range.getAttribute('max'))){
        if(control){
            animationPlay(data);
            await sleep(duration);
            range.value = parseInt(range.getAttribute('step')) + parseInt(range.value);
        }else {
            break;
        }
        i = parseInt(range.value) + parseInt(range.getAttribute('step'));
    }
    if(control){
        range.value = 0;
        btn.src = 'media/images/play.svg';
    }
}

function animationPlay(temp){
    let range = document.getElementById('playerRange').value;
    let phraseID = temp[range].id +',';
    nodesLinksOFF();
    nodeLinkOpacity(phraseID);
}

function showEmotion(){
    classType = 'emotion';
    let circleText = [...document.getElementsByName('circle-emotion'),
        ...document.getElementsByName('text-emotion'), ...document.getElementsByName('shadow')];
    let image = document.getElementsByName('image-emotion');
    for(let c of circleText){
        c.setAttribute('class', c.getAttribute('emotion'));
    }
    for(let i of image){
        i.setAttribute('href', i.getAttribute('emotion'));
    }
}

function showPolarity(){
    classType = 'polarity';
    let circleText = [...document.getElementsByName('circle-emotion'),
        ...document.getElementsByName('text-emotion'), ...document.getElementsByName('shadow')];
    let image = document.getElementsByName('image-emotion');
    for(let c of circleText){
        c.setAttribute('class', c.getAttribute('polarity'));
    }
    for(let i of image){
        i.setAttribute('href', i.getAttribute('polarity'));
    }
}

async function startQuerys() {
    if (r['filt'] != undefined) {
        let f = r['filt'].split(',');
        for (let a = 0; a < f.length; a++) {
            let temp  = f[a].split(':');
            filterW(temp[0], temp[1]);
        }
        let docAF = document.getElementById('attributeFilter');
        docAF.setAttribute('class', docAF.getAttribute('class') + ' show');
    }
    if(r['stype'] != undefined){
        if(r['stype'] == 'emotion'){
            showEmotion();
        }
        if(r['stype'] == 'polarity'){
            showPolarity();
        }
    }
    if(r['duration'] != undefined){
        document.getElementById('duarationAnimation').value = r['duration'];
    }
    if(r['play'] != undefined){
        if(r['play'] == 'true'){
            await sleep(5000);
            player(document.getElementById('pplay'));
            let docAP = document.getElementById('animationPlayer');
            docAP.setAttribute('class', docAP.getAttribute('class') + ' show');
        }
    }
}