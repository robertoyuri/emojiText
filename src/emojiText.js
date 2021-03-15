function emojiText(local, nodes, links, dataset) {
    if (nodes.length > 0) {
        const lineSize = 20;
        let height = document.getElementById(local.replace('#', '')).clientHeight;
        if (height < 800) { height = 800 }
        const width = document.getElementById(local.replace('#', '')).clientWidth;
        const colors = d3.schemeSet3;//d3.schemeSet3;
        const distanceScalePart = d3.scaleLinear().domain([nodes[nodes.length - 1].size, nodes[0].size]).range([50, 100]);
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

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).distance(d => distanceScale(d.source, d.target)).id(d => d.word))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));

        draw(nodes, links);

        function draw(nodes, links) {
            let sizeScale = d3.scaleLinear().domain(d3.extent(nodes, d => d.size)).range([15, 25]);
            let circleScale = d3.scaleLinear().domain(d3.extent(nodes, d => d.size)).range([20, 40]);

            let linksLines = svg.append('g')
                .attr('class', 'links')
                .selectAll('g')
                .data(links)
                .enter().append('g');

            linksLines.attr("name", "links")
                .attr("phraseID", function (d){return d.id;})
                .attr("opacity",1);

            linksLines.each(function (groupd) {
                    let lines = groupd.group.split(',');
                    lines = lines.slice(0, lines.length-1).map(v=>({
                        id:groupd.id,
                        value: v,
                        status: groupd.emotion,
                        emotion: groupd.emotion,
                        polarity: groupd.polarity,
                        source: groupd.source,
                        target: groupd.target,
                    }));

                    d3.select(this).selectAll('line').data(lines).enter()
                        .append("line")
                        .attr("class", "shadow")
                        //.attr("class", function (d) {return "shadow " + d.status})
                        //.attr("phraseID", function (d){console.log(d.id);return d.id;})
                        //.attr("transform",d => "translate(" + ((d.id.split(',').length > 2) ? "10,0" : "0,0") + ")")
                        //.attr("transform",d => "translate(" + lineSize/d.id.split(',').length + ",0)")
                        .attr("len", lines.length)
                        .attr("stroke-width", lineSize/lines.length)
                        .attr("stroke", (d) => {return colors[parseInt(d.id) - (colors.length * parseInt(parseInt(d.id) / colors.length))];});
                });

            linksLines.append("line")
                .attr("class", "line")
                .attr("stroke-width", function (d) { return (1); })//2 * d.value); })
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
                .enter().append("g");

            node.attr("name", "nodes")
                .attr("phraseID", function (d){return d.id;})
                .attr("opacity",1);

            node.append("circle")
                .attr("r", function (d) { return (circleScale(d.size) / 2) + 2; })
                .attr("class", function (d) { return d.status; })

                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            node.append("circle")
                .attr("r", function (d) { return (circleScale(d.size) / 2); })
                .attr("fill", "#FFFFFF")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            node.append("image")
                .attr("xlink:href", function (d) { return (document.location.toString().split('index')[0] + "media/images/" + d.status + ".svg"); })
                .attr("width", function (d) { return circleScale(d.size); })
                .attr("height", function (d) { return circleScale(d.size); })
                .attr("transform", function (d) { return ("translate(-" + circleScale(d.size) / 2 + ", -" + circleScale(d.size) / 2 + ")"); })
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            node.append("text")
                .text(function (d) { return d.word; })
                .style("font-size", "14px")
                //.style("font-size", function(d) { return sizeScale(d.size) + "px"; })
                .style("font-family", "Arial")
                .attr("class", function (d) { return d.status; })
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .attr('x', function (d) { return sizeScale(d.size) + "px"; })
                .attr('y', 7);

            node.append("title")
                .text(function (d) { return d.word; });

            node.on("mouseover", handleMouseOver)
                .on("mouseleave", handleMouseOut);

            simulation
                .nodes(nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(links);

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
                if (d.id != "blank") {
                    let top = d3.event.pageY + 10;
                    tooltip.style("top", top + "px")
                        .style("left", d3.event.pageX + 0 + "px")
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
            }

            function handleMouseOut(d, i) {
                tooltip.style("visibility", "hidden");
                tooltip.selectAll('*').remove();
            }
        }

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(1.6).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

}
function calcTranslationExact(targetDistance, point0, point1, len) {
    targetDistance = targetDistance
    var x1_x0 = point1.x - point0.x,
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