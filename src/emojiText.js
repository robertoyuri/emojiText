function emojiText(local, nodes, links) {
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

            let shadow = svg.append("g")
                .attr("class", "links")
                .selectAll("g.par")
                .data(links)
                .enter()
                .append("g")
                .classed("par", true)
                .attr("transform",d => "translate(" + ((d.group.split(',').length > 2) ? "10,10" : "0,0") + ")")
                .each(function (groupd) {
                    let lines = groupd.group.split(',');
                    lines = lines.slice(0, lines.length-1).map(v=>({
                        value: v,
                        source: groupd.source,
                        target: groupd.target,
                    }))

                    
                    d3.select(this).selectAll('line.data').data(lines).enter()
                        .append("line")
                        .classed('data', true)
                        .attr("len", lines.length)
                        .attr("stroke-width", lineSize/lines.length)
                        .attr("stroke", (lined, i) => {
                            console.log(groupd);
                            const group = parseInt(lined.value)
                            let control = parseInt(group / colors.length);
                            return colors[group - (colors.length * control)];
                        })
                });

            let triangle = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(links)
                .enter().append("line")
                .attr("stroke-width", function (d) { return (Math.sqrt(d.value) + "px"); })
                .attr("stroke", "black")
                .attr("marker-end", "url(#arrow)");

            let link = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(links)
                .enter().append("line")
                .attr("stroke-width", function (d) { return (1); })//2 * d.value); })
                .attr("stroke", "black");

            let node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("g")
                .data(nodes)
                .enter().append("g");

            let circles = node.append("circle")
                .attr("r", function (d) { return (circleScale(d.size) / 2) + 2; })
                .attr("class", function (d) { return d.status; })

                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            let circles2 = node.append("circle")
                .attr("r", function (d) { return (circleScale(d.size) / 2); })
                .attr("fill", "#FFFFFF")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            node.append("image")
                .attr("xlink:href", function (d) { return ("http://" + document.location.host + "/emojiText/src/media/images/" + d.status + ".svg"); })
                .attr("width", function (d) { return circleScale(d.size); })
                .attr("height", function (d) { return circleScale(d.size); })
                .attr("transform", function (d) { return ("translate(-" + circleScale(d.size) / 2 + ", -" + circleScale(d.size) / 2 + ")"); })
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            let lables = node.append("text")
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

            simulation
                .nodes(nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(links);

            function ticked() {
                triangle
                    .attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return (d.target.x + d.source.x) / 2; })
                    .attr("y2", function (d) { return (d.target.y + d.source.y) / 2; });

                link
                    .attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                shadow.selectAll('line')
                    .attr("x1", function (d,i) { return d.source.x + i * calcTranslationExact((lineSize/d3.select(this).attr("len")), d.target, d.source, d3.select(this).attr("len")).dx; })
                    .attr("y1", function (d,i) { return d.source.y + i * calcTranslationExact((lineSize/d3.select(this).attr("len")), d.target, d.source, d3.select(this).attr("len")).dy; })
                    .attr("x2", function (d,i) { return d.target.x + i * calcTranslationExact((lineSize/d3.select(this).attr("len")), d.target, d.source, d3.select(this).attr("len")).dx; })
                    .attr("y2", function (d,i) { return d.target.y + i * calcTranslationExact((lineSize/d3.select(this).attr("len")), d.target, d.source, d3.select(this).attr("len")).dy; });

                shadow.selectAll('g')
                    .attr("transform", "translate(30,30)");

                node
                    .attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    })
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

        function adjustment(len) {
            let adj = 0;
            if(len > 1){
                adj = (15*len)/2
            }
            return adj;
        }
    }

}function calcTranslationExact(targetDistance, point0, point1, len) {
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

