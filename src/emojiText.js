function emojiText(local, nodes, links) {
    if(nodes.length > 0){
        let height = document.getElementById(local.replace('#','')).clientHeight;
        if(height < 800){height = 800}
        const width = document.getElementById(local.replace('#','')).clientWidth;
        //const colors = d3.scaleLinear().range(["gold", "blue", "green", "yellow", "black", "grey", "darkgreen", "pink", "brown", "slateblue", "grey1", "orange"]);
        const colors = d3.schemeSet3;//d3.schemeSet3;
        const distanceScalePart = d3.scaleLinear().domain([nodes[nodes.length-1].size, nodes[0].size]).range([30, 120]);
        function distanceScale(source, target) {
            if(source.size > target.size){
                return distanceScalePart(source.size);
            }else {
                return distanceScalePart(target.size);
            }
        }
        //const colors = ["#F0F8FF", "#F8F8FF", "#FFFAFA", "#FFF5EE", "#FFFAF0", "#F5F5F5", "#F5F5DC", "#FDF5E6", "#FFFFF0",
        //"#FAF0E6", "#FFF8DC", "#FAEBD7", "#FFEBCD", "#FFE4C4", "#FFFFE0", "#FFFACD", "#FAFAD2", "#FFEFD5", "#FFDAB9",
        ///"#FFE4B5", "#EEE8AA", "#FFE4E1", "#FFF0F5", "#E6E6FA", "#D8BFD8", "#F0FFFF", "#E0FFFF", "#B0E0E6", "#E0FFFF",
        //"#F0FFF0", "#F5FFFA"];

        const svg = d3.select(local)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        svg.append("defs")
            .append("marker")
            .attr("id","arrow")
            .attr("markerUnits","strokeWidth")
            .attr("markerWidth","10")
            .attr("markerHeight","10")
            .attr("viewBox","-5 -5 10 10")
            .attr("refX","0")
            .attr("refY","0")
            .attr("orient","auto")
            .append("path")
            .attr("d","M 0,0 m -5,-5 L 5,0 L -5,5 Z")
            .attr("fill", "black");

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).distance(d => distanceScale(d.source, d.target)).id(d => d.word))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));

        // let simulation = d3.forceSimulation()
        //     .force("link", d3.forceLink().distance(100).id(function(d) { return d.word; }))
        //     //.force("charge", d3.forceManyBody())
        //     .force("center2", d3.forceCenter(width/2.5, height/2.5))
        //
        //     .force("", d3.forceManyBody().strength(200).distanceMax(200).distanceMin(150))
        //     .force("", d3.forceManyBody().strength(-150).distanceMax(200).distanceMin(150))
        //     .force("radial", d3.forceRadial().radius(300))
        // ;
        //.stop();
        //simulation.tick(120);
        draw(nodes,links);

        function draw(nodes, links) {

            let sizeScale = d3.scaleLinear().domain(d3.extent(nodes, d => d.size)).range([15, 25]);
            let circleScale = d3.scaleLinear().domain(d3.extent(nodes, d => d.size)).range([20, 40]);

            let shadow = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(links)
                .enter()
                .append("line")
                .attr("stroke-width", function(d) { return (10 * d.value); })
                //.attr("opacity", 0.2)
                .attr("stroke", d => {
                    let control = parseInt(d.group / colors.length);
                    return colors[d.group - (colors.length * control)];
                });

            let triangle = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(links)
                .enter().append("line")
                .attr("stroke-width", function(d) { return (Math.sqrt(d.value) + "px"); })
                .attr("stroke", "black")
                .attr("marker-end","url(#arrow)");

            let link = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(links)
                .enter().append("line")
                .attr("stroke-width", function(d) { return (d.value); })
                .attr("stroke", "black");

            let node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("g")
                .data(nodes)
                .enter().append("g");

            let circles = node.append("circle")
                .attr("r", function(d) { return (circleScale(d.size)/2)+2; })
                // .attr("x", 0)
                // .attr("y", 0)
                // .attr("width", function(d) { return circleScale(d.size)+3; })
                // .attr("height", function(d) { return circleScale(d.size)+3; })
                //.attr("transform", function(d) { return "translate(-" + (circleScale(d.size)+3)/2 + ",-" + (circleScale(d.size)+3)/2 + ")"; })
                .attr("class", function(d) { return d.status; })
                //.attr("stroke", "#ffcacb")
                //.attr("stroke-width", "5px")
                //.attr("stroke-opacity", 0.2)
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            let circles2 = node.append("circle")
                .attr("r", function(d) { return (circleScale(d.size)/2); })
                //.attr("class", function(d) { return (d.status); })
                .attr("fill", "#FFFFFF")
                //.attr("stroke", "green")
                //.attr("class", function(d) { return d.status; })
                //.attr("stroke-width", "5px")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            node.append("image")
                .attr("xlink:href", function(d) { return ( "http://" + document.location.host + "/emojiText/src/media/images/" + d.status + ".svg"); })
                .attr("width", function(d) { return circleScale(d.size); })
                .attr("height", function(d) { return circleScale(d.size); })
                .attr("transform", function(d) { return ( "translate(-" + circleScale(d.size)/2 + ", -"  + circleScale(d.size)/2 + ")"); })
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            let lables = node.append("text")
                .text(function(d) { return d.word; })
                .style("font-size", "14px")
                //.style("font-size", function(d) { return sizeScale(d.size) + "px"; })
                .style("font-family", "Arial")
                .attr("class", function(d) { return d.status; })
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                //.attr("stroke", "black")
                //.attr("stroke-width", ".5px")
                .attr('x', function(d) { return sizeScale(d.size) + "px"; })
                .attr('y', 7);

            node.append("title")
                .text(function(d) { return d.word; });

            simulation
                .nodes(nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(links);

            function ticked() {
                triangle
                    .attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return (d.target.x + d.source.x)/2; })
                    .attr("y2", function(d) { return (d.target.y + d.source.y)/2; });

                link
                    .attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                shadow
                    .attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                node
                    .attr("transform", function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    })
            }
        }

        function dragstarted(d) {
            // d3.select(this.parentElement)
            //     .attr("transform", function(d) {
            //         return "translate(" + d3.event.x + "," + d3.event.y + ")";
            //     });
            if (!d3.event.active) simulation.alphaTarget(1.6).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            // d3.select(this.parentElements)
            //     .attr("transform", function(d) {
            //         return "translate(" + d3.event.x + "," + d3.event.y + ")";
            //     });
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            // d3.select(this.parentElement)
            //     .attr("transform", function(d) {
            //         return "translate(" + d3.event.x + "," + d3.event.y + ")";
            //     });
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }
}