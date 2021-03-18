let datas = [];
let contents = [];
let filterList = [];
let filterListID = 0;
function loadPath(filePath){
    hide();
    datas = [{"name":"Content","path":filePath}];

    let promises = [];
    for (let i = 0; i < datas.length; i++) {
        promises.push(d3.json(datas[i].path));
    }
    loadData(promises);
}

function loadData(promises){
    document.getElementById('filterTable').innerHTML = "<tr><th>Attribute</th><th>Term</th><th></th></tr>";
    filterListID = 0;
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
    let types = [];
    contents = [];
    filterList = [];
    let group = 0;

    Promise.all(promises).then((dataJsons) => {
        for(let i = 0; i < dataJsons.length; i++){
            let dataJson = dataJsons[i];
            let select = document.getElementById('selectAttribute');
            for(let o in select.options){
                select.remove(o);
            }
            let option = document.createElement('option'); option.text="Select attribute";
            select.add(option, null);
            for(let item in dataJson[0]){
                let option = document.createElement('option');
                option.setAttribute('value', item);
                option.text = item;
                select.add(option, null);
            }
            if((dataJsons[i].length > 0) && (datas[i].name == "Content")){
                types.push(datas[i].name);
                for (let j = 0; j < dataJson.length; j++){
                    let line = {
                        "id": dataJson[j].id,
                        "status": dataJson[j].emotion,
                        "polarity": dataJson[j].polarity,
                        "emotion": dataJson[j].emotion,
                        "text": dataJson[j].text,

                        "startDate": new Date(dataJson[j].start * 1000),
                        "endDate": new Date(dataJson[j].stop * 1000),
                        "name": datas[i].name,
                        "image": dataJson[j].image
                    };
                    contents.push(line);
                }
            }
        }

        let stopwords = "? ! ) ( e é , . ; \" I de a o que do da em um para com uma os no se na por mais as dos como mas foi ao ele " +
            "das tem à seu sua ou ser quando há nos já está eu também só pelo pela até isso ela entre era depois " +
            "sem mesmo aos ter seus quem nas me esse eles estão tinha foram essa num nem suas meu às minha têm numa " +
            "pelos elas havia seja qual será nós tenho lhe deles essas esses pelas este fosse dele tu te vocês vos lhes " +
            " meus minhas teu tua teus tuas nosso nossa nossos nossas dela delas esta estes estas aquele aquela aqueles " +
            " aquelas isto aquilo estou está estamos estão estive esteve estivemos estiveram estava estávamos estavam " +
            "estivera estivéramos esteja estejamos estejam estivesse estivéssemos estivessem estiver estivermos estiverem " +
            "hei há havemos hão houve houvemos houveram houvera houvéramos haja hajamos hajam houvesse houvéssemos " +
            "houvessem houver houvermos houverem houverei houverá houveremos houverão houveria houveríamos houveriam sou " +
            "somos são era éramos eram fui foi fomos foram fora fôramos seja sejamos sejam fosse fôssemos fossem for " +
            "formos forem serei será seremos serão seria seríamos seriam tenho tem temos tém tinha tínhamos tinham tive " +
            "teve tivemos tiveram tivera tivéramos tenha tenhamos tenham tivesse tivéssemos tivessem tiver tivermos " +
            "tiverem gay terei terá teremos terão teria teríamos teriam aí c****** = 1 2 3 4 5 6 7 8 9 0 * + : , roberto " +
            "a's able about above according accordingly across actually after afterwards again against ain't all allow" +
            " allows almost alone along already also although always am among amongst an and another any anybody anyhow" +
            " anyone anything anyway anyways anywhere apart appear appreciate appropriate are aren't around as aside ask" +
            " asking associated at available away awfully be became because become becomes becoming been before " +
            "beforehand behind being believe below beside besides best better between beyond both brief but by c'mon" +
            " c's came can can't cannot cant cause causes certain certainly changes clearly co com come comes concerning" +
            " consequently consider considering contain containing contains corresponding could couldn't course currently" +
            " definitely described despite did didn't different do does doesn't doing don't done down downwards during " +
            "each edu eg eight either else elsewhere enough entirely especially et etc even ever every everybody " +
            "everyone everything everywhere ex exactly example except far few fifth first five followed following " +
            "follows for former formerly forth four from further furthermore get gets getting given gives go goes going gone got gotten greetings had hadn't happens hardly has hasn't have haven't having he he's hello help hence her here here's hereafter hereby herein hereupon hers herself hi him himself his hither hopefully how howbeit however i'd i'll i'm i've ie if ignored immediate in inasmuch inc indeed indicate indicated indicates inner insofar instead into inward is isn't it it'd it'll it's its itself just keep keeps kept know known knows last lately later latter latterly least less lest let let's like liked likely little look looking looks ltd mainly many may maybe me mean meanwhile merely might more moreover most mostly much must my myself name namely nd near nearly necessary need needs neither never nevertheless new next nine no nobody non none noone nor normally not nothing novel now nowhere obviously of off often oh ok okay old on once one ones only onto or other others otherwise ought our ours ourselves out outside over overall own particular particularly per perhaps placed please plus possible presumably probably provides que quite qv rather rd re really reasonably regarding regardless regards relatively respectively right said same saw say saying says second secondly see seeing seem seemed seeming seems seen self selves sensible sent serious seriously seven several shall she should shouldn't since six so some somebody somehow someone something sometime sometimes somewhat somewhere soon sorry specified specify specifying still sub such sup sure t's take taken tell tends th than thank thanks thanx that that's thats the their theirs them themselves then thence there there's thereafter thereby therefore therein theres thereupon these they they'd they'll they're they've think third this thorough thoroughly those though three through throughout thru thus to together too took toward towards tried tries truly try trying twice two un under unfortunately unless unlikely until unto up upon us use used useful uses using usually value various very via viz vs want wants was wasn't way we we'd we'll we're we've welcome well went were weren't what what's whatever when whence whenever where where's whereafter whereas whereby wherein whereupon wherever whether which while whither who who's whoever whole whom whose why will willing wish with within without won't wonder would wouldn't yes yet you you'd you'll you're you've your yours yourself yourselves zero";

        for(let i = 0; i < contents.length; i++){
            contents[i].text = contents[i].text.toLowerCase();
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
    let attribute = document.getElementById('selectAttribute').value;
    let term = document.getElementById('typeTerm').value;
    if(attribute !== "Select attribute" && term !== ""){
        let phraseID = "";

        console.log(contents[term]);
        if(attribute == "id"){
            if(contents[term] !== undefined){
                phraseID = term;
            }
        }else{
            for(let c in contents){
                if(contents[c][attribute].includes(term)){
                    phraseID += contents[c].id + ",";
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
            console.log(filterList);

            mergeFilter();
            alertB.setAttribute('class', "alert alert-success alert-dismissible fade show");
            alertMensage.innerHTML = "DONE!".bold() + " The term: '" + term + "' in attribute: '" + attribute + "' was successfully filtered.";
        }
    }else{
        alertB.setAttribute('class', "alert alert-danger alert-dismissible fade show");
        alertMensage.innerHTML = "ERROR!".bold() + " The term: '" + term + "' in attribute: '" + attribute + "' not found.";
    }
}

function mergeFilter(){
    let phraseID = ""
    for(let f in filterList){
        phraseID += filterList[f].phraseID + ",";
    }
    let phraseIDEnd = "";
    for (let s of phraseID.split(',')){
        if(!phraseIDEnd.includes(s)){
            phraseIDEnd += s + ",";
        }
    }
    console.log(phraseIDEnd);
    nodesLinksOFF();
    nodeLinkOpacity(phraseIDEnd);
}

function deleteFilter(id){
    console.log(id);
    for(let i = 0; i < filterList.length; i++){
        if(filterList[i].id == id){
            console.log(filterList);
            console.log(i);
            filterList.splice(i, 1);
            console.log(filterList);
            document.getElementById('filterLine'+id).remove();
            mergeFilter();
        }
    }

}

function hide(){
    document.getElementById('alert').setAttribute('class', "collapse");
}