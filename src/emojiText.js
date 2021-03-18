function emojiText(local, nodes, links, dataset) {
    d3.select(local).selectAll('*').remove();
    if (nodes.length > 0) {
        const lineSize = 20;
        const height = document.getElementById(local.replace('#', '')).clientHeight;
        const width = document.getElementById(local.replace('#', '')).clientWidth;
        const colors = d3.schemeSet3;
        let sizeScale = d3.scaleLinear().domain(d3.extent(nodes, d => d.size)).range([12, 18]);
        let circleScale = d3.scaleLinear().domain(d3.extent(nodes, d => d.size)).range([20, 50]);
        const distanceScalePart = d3.scaleLinear().domain([nodes[nodes.length - 1].size, nodes[0].size]).range([50, nodes[0].size*15]);
        function distanceScale(source, target) {
            if (source.size > target.size) {
                return distanceScalePart(source.size);
            } else {
                return distanceScalePart(target.size);
            }
        }

        const svg = d3.select(local)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        svg.append("defs")
            .append("marker")
            .attr("id", "arrow")
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", "10")
            .attr("markerHeight", "10")
            .attr("viewBox", "-5 -5 10 10")
            .attr("refX", "0")
            .attr("refY", "0")
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0,0 m -5,-5 L 5,0 L -5,5 Z")
            .attr("fill", "black");

        const simulation = d3.forceSimulation([...nodes, ...links]);
        simulation.force("link", d3.forceLink(links).distance(function (d){
            return distanceScale(d.source, d.target);
        }).id(d => d.word));

        simulation.force("center", d3.forceCenter(width / 2, height / 2));
        simulation.force('collision', d3.forceCollide().radius(function(d) {
            return circleScale(d.size)+(distanceScalePart(d.size)*.25);
        }));
        simulation.force("charge", d3.forceManyBody().strength(-125));
        simulation.force('forceX', d3.forceX(d => d.x > (width*.5) ? (width*.5) : d.x));
        simulation.force('forceY', d3.forceY(d => d.y > (height*.5) ? (height*.5) : d.y));

        draw(nodes, links);

        function draw(nodes, links) {

            let linksLines = svg.append('g')
                .attr('class', 'links')
                .selectAll('g')
                .data(links)
                .enter().append('g');

            linksLines.attr("name", "links")
                .attr("phraseID", function (d){return d.id;})
                .attr("opacity",1);

            linksLines.each(function (d) {
                let lines = d.group.split(',');
                lines = lines.slice(0, lines.length-1).map(v=>({
                    id:d.id,
                    value: v,
                    source: d.source,
                    target: d.target,
                }));

                d3.select(this).selectAll('line').data(lines).enter()
                    .append("line")
                    .attr("class", "shadow")
                    .attr("transform",d => "translate(" + ((d.id.split(',').length > 2) ? "10,10" : "0,0") + ")")
                    .attr("len", lines.length)
                    .attr("stroke-width", lineSize/lines.length)
                    .attr("stroke", (d) => {return colors[(parseInt(d.value) - (colors.length * parseInt(""+ parseInt(d.value) / colors.length)))];});
            });

            linksLines.append("line")
                .attr("class", "line")
                .attr("stroke-width", 1)
                .attr("stroke", "black");

            linksLines.append("line")
                .attr("class", "triangle")
                .attr("stroke-width", function (d) { return (Math.sqrt(d.value) + "px"); })
                .attr("stroke", "black")
                .attr("marker-end", "url(#arrow)");

            linksLines.on("mouseover", handleMouseOver)
                .on("mouseleave", handleMouseOut);



            let node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("g")
                .data(nodes)
                .enter().append("g")
                .call(d3.drag()
                    .on("start", dragStarted)
                    .on("drag", dragged)
                    .on("end", dragEnded));

            node.attr("name", "nodes")
                .attr("phraseID", function (d){return d.id;})
                .attr("opacity",1);

            node.append("circle")
                .attr("name", "circle-emotion")
                .attr("r", function (d) { return (circleScale(d.size) / 2) + 3; })
                .attr("class", function (d) { return d.emotion; })
                .attr("emotion", function (d) { return d.emotion; })
                .attr("polarity", function (d) { return d.polarity; });

            node.append("circle")
                .attr("r", function (d) { return (circleScale(d.size) / 2); })
                .attr("fill", "#FFFFFF");

            node.append("image")
                .attr("name", "image-emotion")
                .attr("xlink:href", function (d) { return (document.location.toString().split('index')[0] + "media/images/" + d.emotion + ".svg"); })
                .attr("emotion", function (d) { return (document.location.toString().split('index')[0] + "media/images/" + d.emotion + ".svg"); })
                .attr("polarity", function (d) { return (document.location.toString().split('index')[0] + "media/images/" + d.polarity + ".svg"); })
                .attr("width", function (d) { return circleScale(d.size); })
                .attr("height", function (d) { return circleScale(d.size); })
                .attr("transform", function (d) { return ("translate(-" + circleScale(d.size) / 2 + ", -" + circleScale(d.size) / 2 + ")"); });

            node.append("text")
                .attr("name", "text-emotion")
                .text(function (d) { return d.word; })
                .style("font-size", function(d) { return sizeScale(d.size) + "px"; })
                .style("font-family", "Arial")
                .attr("class", function (d) { return d.emotion; })
                .attr("emotion", function (d) { return d.emotion; })
                .attr("polarity", function (d) { return d.polarity; })
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .attr("stroke", "white")
                .attr("stroke-width", "0.4px")
                .attr('x', function (d) { return 2+circleScale(d.size)*.6 + "px"; })
                .attr('y', d => sizeScale(d.size)/2);

            node.append("title")
                .text(function (d) { return d.word; });

            node.on("mouseover", handleMouseOver)
                .on("mouseleave", handleMouseOut);

            simulation
                .nodes(nodes)
                .on("tick", ticked);

            function ticked() {
                linksLines.selectAll('line.triangle')
                    .attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return (d.target.x + d.source.x) / 2; })
                    .attr("y2", function (d) { return (d.target.y + d.source.y) / 2; });

                linksLines.selectAll('line.line')
                    .attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                linksLines.selectAll('line.shadow')
                    .attr("x1", function (d,i) { return d.source.x + i * calcTranslationExact((lineSize/d3.select(this).attr("len")), d.target, d.source, d3.select(this).attr("len")).dx; })
                    .attr("y1", function (d,i) { return d.source.y + i * calcTranslationExact((lineSize/d3.select(this).attr("len")), d.target, d.source, d3.select(this).attr("len")).dy; })
                    .attr("x2", function (d,i) { return d.target.x + i * calcTranslationExact((lineSize/d3.select(this).attr("len")), d.target, d.source, d3.select(this).attr("len")).dx; })
                    .attr("y2", function (d,i) { return d.target.y + i * calcTranslationExact((lineSize/d3.select(this).attr("len")), d.target, d.source, d3.select(this).attr("len")).dy; });

                node.attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
            }
            afterLoad();

            let tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltipBig")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("top", "0px")
                .style("left", "0px")
                .style("visibility", "hidden");

            function handleMouseOver(d) {
                tooltip.selectAll('*').remove();
                let top = d3.event.pageY + 10;
                tooltip.style("top", top + "px")
                    .style("left", d3.event.pageX + "px")
                    .style("visibility", "visible");
                for(let n of dataset){
                    for(let id of (d.id+',').split(',')){
                        if((','+n.id+',').includes(','+id+',')){
                            tooltip.append('div')
                                .attr("width", 15).attr("height", 15)
                                .style('background-color', colors[parseInt(id) - (colors.length * parseInt(parseInt(id) / colors.length))])
                                .append("p")
                                .style('font-size', '14px')
                                .style("margin-top", "0px")
                                .style("margin-bottom", "3px")
                                .text("(" + id + ") " + n.text + " (" + n.emotion + " - " + n.polarity + ")");
                        }
                    }
                }
            }

            function handleMouseOut() {
                tooltip.style("visibility", "hidden");
                tooltip.selectAll('*').remove();
            }
        }

        function dragStarted(d) {
            if (!d3.event.active) simulation.alphaTarget(1.6).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragEnded(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }


    function calcTranslationExact(targetDistance, point0, point1) {
        let x1_x0 = point1.x - point0.x,
            y1_y0 = point1.y - point0.y,
            x2_x0, y2_y0;
        if (y1_y0 === 0) {
            x2_x0 = 0;
            y2_y0 = targetDistance;
        } else {
            let angle = Math.atan((x1_x0) / (y1_y0));
            x2_x0 = -targetDistance * Math.cos(angle);
            y2_y0 = targetDistance * Math.sin(angle);
        }

        return {
            dx: x2_x0,
            dy: y2_y0
        };
    }

    function afterLoad(){
        let nodesLinks = [...document.getElementsByName('nodes'), ...document.getElementsByName('links')];
        for (let n of nodesLinks){
            n.addEventListener("click", function (){
                if(n.getAttribute('opacity') !== '1'){
                    nodesLinksON();
                }else{
                    nodesLinksOFF();
                    nodeLinkOpacity(n.getAttribute('phraseID'));
                }
            });

        }
    }
}

function nodeLinkOpacity(phraseID){
    let nodesLinks = [...document.getElementsByName('nodes'), ...document.getElementsByName('links')];
    for(let n of nodesLinks){
        for(let p of phraseID.split(',')){
            if((','+n.getAttribute("phraseID")+',').includes(','+p+',')){
                n.setAttribute('opacity', 1);
            }
        }
    }
}

function nodesLinksON(){
    let nodesLinks = [...document.getElementsByName('nodes'), ...document.getElementsByName('links')];
    for(let n of nodesLinks){
        n.setAttribute('opacity', 1);
    }
}

function nodesLinksOFF(){
    let nodesLinks = [...document.getElementsByName('nodes'), ...document.getElementsByName('links')];
    for(let n of nodesLinks){
        n.setAttribute('opacity', 0.1);
    }
}

function showEmotion(){
    let circleText = [...document.getElementsByName('circle-emotion'), ...document.getElementsByName('text-emotion')];
    let image = document.getElementsByName('image-emotion');
    for(let c of circleText){
        c.setAttribute('class', c.getAttribute('emotion'));
    }
    for(let i of image){
        i.setAttribute('href', i.getAttribute('emotion'));
    }
}

function showPolarity(){
    let circleText = [...document.getElementsByName('circle-emotion'), ...document.getElementsByName('text-emotion')];
    let image = document.getElementsByName('image-emotion');
    for(let c of circleText){
        c.setAttribute('class', c.getAttribute('polarity'));
    }
    for(let i of image){
        i.setAttribute('href', i.getAttribute('polarity'));
    }
}