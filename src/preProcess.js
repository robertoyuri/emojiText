let datas = [];
let dataType = [];
let contents = [];
let filterList = [];
let filterListID = 0;
let globalPromises = [];
let globalAttributeListWithout = [];
let modalMissingAttr = new bootstrap.Modal(document.getElementById('selectMissingAttrModal'), {
    keyboard: false
});

function loadPath(filePath){
    hide();
    datas = [{"name":"Content","path":filePath}];

    let promises = [];
    for (let i = 0; i < datas.length; i++) {
        promises.push(d3.json(datas[i].path));
    }
    loadData(promises);
}

function howAre(attributeList, attributeListWithout){
    d3.select('#selectMissingAttrBody').selectAll('*').remove();
    for(let aw of attributeListWithout){
        let select = document.createElement('select');
        select.setAttribute('id', 'form-select-'+aw);
        select.setAttribute('class', 'form-select');
        let label = document.createElement('label');
        label.setAttribute('class','form-label');
        label.innerText = aw+':';
        let div = document.getElementById('selectMissingAttrBody');
        div.appendChild(label);
        div.appendChild(select);
        for(let a in attributeList){
            let option = document.createElement('option');
            option.setAttribute('value', a);
            option.innerText = a;
            select.appendChild(option);
        }

        modalMissingAttr.show();
    }
}

function hideModalMissingAttr(){
    modalMissingAttr.hide();
}

function identifyHowAre(){
    Promise.all(globalPromises).then((dataJsons) => {
        for (let a of globalAttributeListWithout) {
            for (let i = 0; i < dataJsons[0].length; i++) {

                dataJsons[0][i][a] = dataJsons[0][i][document.getElementById('form-select-'+a).value];
            }
        }
        let modal = new bootstrap.Modal(document.getElementById('selectMissingAttrModal'), {
            keyboard: false
        });
        modalMissingAttr.hide();
        preProcess(globalPromises);
    });
}

function loadData(promises) {
    globalPromises = promises;
    Promise.all(promises).then((dataJsons) => {
        let attributeListWithout = [];
        if (dataJsons[0][0].text == undefined) {
            attributeListWithout.push('text');
        }
        if (dataJsons[0][0].emotion == undefined) {
            attributeListWithout.push('emotion');
        }
        if (dataJsons[0][0].polarity == undefined) {
            attributeListWithout.push('polarity');
        }
        if (attributeListWithout.length > 0) {
            howAre(dataJsons[0][0], attributeListWithout);
            globalAttributeListWithout = attributeListWithout;
        }else{
            preProcess(promises)
        }
    });
}

function preProcess(promises){
    d3.select('#datasetInformationData').selectAll('*').remove();
    document.getElementById('filterTable').innerHTML = "<tr><th>Attribute</th><th>Term</th><th></th></tr>";
    filterListID = 0;
    dataType = [];
    function comparePolarity(words) {
        let polarity = ["", "positive", "negative", "neutral", "positive", "negative", "neutral"];
        let pol = [];
        pol["positive"] = 1;
        pol["negative"] = 2;
        pol["neutral"] = 3;
        let id = 0;
        for(let i = 0; i < words.length; i++){
            if(words[i].size == words[0].size){
                id += pol[words[i].name];
            }
        }
        return polarity[id];
    }

    function compareEmotion(words) {
        return words[0].name;
    }

    function sortSize(words) {
        let sizes = [];
        let keys = [];
        for(let i = 0; i < words.length; i++){
            if(sizes[words[i]] == undefined){
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
    contents = [];
    filterList = [];
    dataType = [];

    let select = document.getElementById('selectAttribute');
    for(let opt in select.options){
        select.remove(opt);
    }
    let option = document.createElement('option'); option.text="Select attribute";
    select.add(option, null);

    Promise.all(promises).then((dataJsons) => {
        for(let i = 0; i < dataJsons.length; i++){
            let dataJson = dataJsons[i];
            if(dataJson[0].id == undefined){
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
                    option.text = item;
                    let datasetInformationData = document.getElementById('datasetInformationData');
                    if(tempCount == 0 || tempCount%4 == 0){
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
                        for(let ddd in dataJson){
                            let option2 = document.createElement('option');
                            option2.value=dataJson[ddd][item];
                            option2.innerText=dataJson[ddd][item];
                            dataListOption.appendChild(option2);
                            selectDatasetInformationData.appendChild(option2.cloneNode(true));
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
                    }
                    select.add(option, null);
                    document.getElementById('dataLists').appendChild(dataListOption);
                }
            }
            if((dataJsons[i].length > 0) && (datas[i].name == "Content")){
                contents = dataJson;
            }
        }

        let stopwords = " vou sobre vem de dá ai aí a o que e do da em um para é com não uma os no se na por mais as dos como mas foi ao ele " +
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
            "anything anywhere are area areas around as ask asked asking asks at away b back backed backing backs be " +
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

        for(let i = 0; i < contents.length; i++){
            contents[i].text = contents[i].text.toLowerCase();
            contents[i].text = contents[i].text.replaceAll(/[^A-Z0-9 áàâãäéèêëíìîïóòôõöúùûüç!-]/ig,'');
            contents[i].text = contents[i].text.replaceAll('  ',' ');
            contents[i].text = contents[i].text.replaceAll('  ',' ');
            if(contents[i].text != undefined && contents[i].text != null && contents[i].text != ""){
                group++;
                let ws = contents[i].text.split(" ");
                let lastWord = "";
                for (let j = 0; j < ws.length; j++) {
                    ws[j] = ws[j].toLowerCase();
                    if(!stopwords.includes(" " + ws[j] + " ")){
                        if(words[ws[j]] == undefined){
                            keys.push(ws[j]);
                            words[ws[j]] = [];
                            words[ws[j]]["emotion"] = contents[i].emotion;
                            words[ws[j]]["polarity"] = contents[i].polarity;
                            words[ws[j]]["size"] = 1;
                            words[ws[j]]["id"] = contents[i].id;
                            words[ws[j]]["text"] = contents[i].text;
                            if(lastWord != ""){
                                let line = {"source":lastWord, "target":ws[j], "value":1, "group":""+group+",",
                                    "id":""+contents[i].id, "emotion": contents[i].emotion, "polarity": contents[i].polarity,
                                    "text":contents[i].text};
                                let index = links.findIndex(a => (a.source == line.source && a.target == line.target) ||
                                    (a.target == line.source && a.source == line.target));

                                if (index === -1){
                                    links.push(line);
                                }else {
                                    links[index].value++;
                                    links[index].group += ""+group+",";
                                    links[index].id += ","+contents[i].id;
                                }
                            }
                        }else{
                            words[ws[j]]["emotion"] += " " + contents[i].emotion;
                            words[ws[j]]["polarity"] += " " + contents[i].polarity;
                            words[ws[j]]["size"]++;
                            words[ws[j]]["id"] += "," + contents[i].id;
                            words[ws[j]]["text"] = contents[i].text;
                            if(lastWord != ""){
                                let line = {"source":lastWord, "target":ws[j], "value":1, "group":""+group+",",
                                    "id":""+contents[i].id, "emotion": contents[i].emotion, "polarity": contents[i].polarity,
                                    "text":contents[i].text};
                                let index = links.findIndex(a => (a.source == line.source && a.target == line.target) ||
                                    (a.target == line.source && a.source == line.target));

                                if (index === -1){
                                    links.push(line);
                                }else {
                                    links[index].value++;
                                    links[index].group += ""+group+",";
                                    links[index].id += ","+contents[i].id;
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
            let emotion = compareEmotion(sortSize(words[keys[i]]["emotion"].split(" ")));
            let polarity = comparePolarity(sortSize(words[keys[i]]["polarity"].split(" ")));
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
        emojiText("#emojiText", words, links, contents);
    });
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
        loadData([JSON.parse(result)]);
    };
    reader.readAsText(file);
}

function filter(){
    let alertB = document.getElementById('alert');
    let alertMensage = document.getElementById('alertMensage');
    let attribute = document.getElementById('selectAttribute');
    let term = document.getElementById('typeTerm').value;
    if(attribute !== "Select attribute" && term !== ""){
        let phraseID = "";
        if(dataType[attribute.value].type == "continuous"){
            if(attribute.value == 'id' && !term.includes('-')){
                if(contents[term] !== undefined){
                    phraseID = term;
                }
            }else{
                for(let c in contents){
                    if(term.includes('-')){
                        let mimMax = term.split('-');
                        if(parseFloat(contents[c][attribute.value]) >= parseFloat(mimMax[0]) && parseFloat(contents[c][attribute.value]) <= parseFloat(mimMax[1])){
                            phraseID += contents[c].id + ",";
                        }
                    }else{
                        if(parseFloat(contents[c][attribute.value]) == parseFloat(term)){
                            phraseID += contents[c].id + ",";
                        }
                    }
                }
            }
        }else{
            for(let c in contents){
                if(contents[c][attribute.value].includes(term)){
                    phraseID += contents[c].id + ",";
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
            let phraseIDTemp = "";
            for (let s of filterList[f].phraseID.split(',')){
                for(let p of phraseID.split(',')){
                    if(s == p){
                        phraseIDTemp += s + ",";
                    }
                }
            }
            phraseID = phraseIDTemp.replace(',,', ',');
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