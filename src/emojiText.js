let cont = 0;
function emojiText(local, nodes, links, dataset, emotionPolarity) {
    let linksLines = '';
    let node = '';
    let tooltip;
    let  svg;
    const lineSize = 15;
    let sizeScale;
    let circleScale;
    let simulation;
    let datasetData;
    datasetData = [...dataset];
    d3.select(local).selectAll('*').remove();
    if (nodes.length > 0) {
        let height = document.getElementById(local.replace('#', '')).clientHeight;
        height = height < 450 ? 450 : height;
        const width = document.getElementById(local.replace('#', '')).clientWidth;
        const colors = d3.schemeSet3;
        sizeScale = d3.scaleLinear().domain(d3.extent(nodes, d => d.size)).range([12, 18]);
        circleScale = d3.scaleLinear().domain(d3.extent(nodes, d => d.size)).range([20, 50]);
        const distanceScalePart = d3.scaleLinear().domain([nodes[nodes.length - 1].size, nodes[0].size]).range([50, nodes[0].size * 15]);

        function distanceScale(source, target) {
            if (source.size > target.size) {
                return distanceScalePart(source.size);
            } else {
                return distanceScalePart(target.size);
            }
        }

        let nodeStart = [];
        let nodeEnd = [];
        for(let n of nodes){
            n['links'] = 0;
            for(let l of links){
                if(n.word == l.source){
                    n['links'] = n['links'] + 1;
                }
                if(n.word == l.target){
                    n['links'] = n['links'] + 1;
                }
            }
        }

        let start = 0;
        let end = 0;
        for(let n of nodes){
            if(n.links == 1){
                for(let l of links){
                    if(n.word == l.source){
                        nodeStart.push(n);
                        n['x'] = start;
                        n['y'] = start/2;
                        start = start + 50;
                    }
                    if(n.word == l.target){
                        nodeEnd.push(n);
                        n['x'] = end;
                        n['y'] = end/2;
                        end = end + 50;
                    }
                }
            }
        }

        svg = d3.select(local)
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

        //simulation = d3.forceSimulation([...nodes, ...links]);
        //simulation.force("link", d3.forceLink(links).distance(function (d) {
        //    return distanceScale(d.source, d.target);
        //}).id(d => d.word));

        //simulation.force("center", d3.forceCenter(width / 2, height / 2));
        //simulation.force('collision', d3.forceCollide().radius(function (d) {
        //    return circleScale(d.size) + (distanceScalePart(d.size) * .25);
        //}));
        //simulation.force("charge", d3.forceManyBody().strength(-250));
        //simulation.force('forceX', d3.forceX(d => d.x > (width * .5) ? (width * .5) : d.x));
        //simulation.force('forceY', d3.forceY(d => d.y > (height * .5) ? (height * .5) : d.y));

        //simulation = d3.forceSimulation(nodes).alphaDecay(0.01)
        //    .force("linkForce",d3.forceLink(links).distance(30).strength(2));

        simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.word).distance(75))
            .force("charge", d3.forceManyBody().strength(-150))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("x", d3.forceX())
            .force("y", d3.forceY());
        simulation.initial=15000;

        /*simulation = d3.forceSimulation(nodes).alphaDecay(0.01)
            .force("link", d3.forceLink(links).distance(d => distanceScale(d.source, d.target)).id(d => d.word))
            //.force('collision', d3.forceCollide().radius(d => (circleScale(d.size) + (distanceScalePart(d.size))* .25)))
            //.force("charge", d3.forceManyBody())
            //.force("charge", d3.forceManyBody().strength(-50))
            .force("center", d3.forceCenter(width / 2, height / 2));
         */
        draw(nodes, links);
    }

    function draw(nodes, links) {
        linksLines = svg.append('g')
            .attr('class', 'links')
            .selectAll('g')
            .data(links)
            .enter().append('g');

        linksLines.attr("name", "links")
            .attr("phraseID", function (d) {
                return d.id;
            })
            .attr("opacity", 1);

        linksLines.append("line")
            .attr("name", "shadow")
            .attr("class", d => "shadow " + d.emotion)
            .attr("emotion", d => "shadow " + d.emotion)
            .attr("polarity", d => "shadow " + d.polarity)
            .attr("stroke-width", lineSize)
            .attr("opacity", 0.5);

        linksLines.append("line")
            .attr("class", "line")
            .attr("stroke-width", function (d) {
                return (Math.sqrt(d.value) + "px");
            })
            .attr("stroke", "black")
            .attr('opacity', .5);

        linksLines.append("line")
            .attr("class", "triangle")
            .attr("stroke-width", function (d) {
                return (Math.sqrt(d.value) + "px");
            })
            .attr("stroke", "black")
            .attr('opacity', .5)
            .attr("marker-end", "url(#arrow)");

        linksLines.on("mouseover", handleMouseOver)
            .on("mouseleave", handleMouseOut);


        node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter().append("g")
            .call(d3.drag()
                .on("start", dragStarted)
                .on("drag", dragged)
                .on("end", dragEnded));

        node.attr('name', d => "nodes " + d.word)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .attr("phraseID", function (d) {
                return d.id;
            })
            .attr("opacity", 1);

        node.append("circle")
            .attr("name", "circle-emotion")
            .attr("class", "circle-emotion")
            .attr("r", function (d) {
                return (circleScale(d.size) / 2) + 3;
            })
            .attr("class", function (d) {
                return emotionPolarity[d.emotion];
            })
            .attr("emotion", function (d) {
                return emotionPolarity[d.emotion];
            })
            .attr("polarity", function (d) {
                return emotionPolarity[d.polarity];
            });

        node.append("circle")
            .attr("r", function (d) {
                return (circleScale(d.size) / 2);
            })
            .attr("fill", "#FFFFFF");

        node.append("image")
            .attr("name", "image-emotion")
            .attr("xlink:href", function (d) {
                return (document.location.origin.toString() + "/media/images/" + emotionPolarity[d.emotion] + ".svg");
            })
            .attr("emotion", function (d) {
                return (document.location.origin.toString() + "/media/images/" + emotionPolarity[d.emotion] + ".svg");
            })
            .attr("polarity", function (d) {
                return (document.location.origin.toString() + "/media/images/" + emotionPolarity[d.polarity] + ".svg");
            })
            .attr("width", function (d) {
                return circleScale(d.size);
            })
            .attr("height", function (d) {
                return circleScale(d.size);
            })
            .attr("transform", function (d) {
                return ("translate(-" + circleScale(d.size) / 2 + ", -" + circleScale(d.size) / 2 + ")");
            });

        node.append("text")
            .attr("name", "text-emotion")
            .text(function (d) {
                return d.word;
            })
            .style("font-size", function (d) {
                return sizeScale(d.size) + "px";
            })
            .style("font-family", "Arial")
            .attr("class", function (d) {
                return emotionPolarity[d.emotion];
            })
            .attr("emotion", function (d) {
                return emotionPolarity[d.emotion];
            })
            .attr("polarity", function (d) {
                return emotionPolarity[d.polarity];
            })
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("stroke", "white")
            .attr("stroke-width", "0.4px")
            .attr('x', function (d) {
                return 2 + circleScale(d.size) * .6 + "px";
            })
            .attr('y', d => sizeScale(d.size) / 2);

        node.append("title")
            .text(function (d) {
                return d.word;
            });

        node.on("mouseover", handleMouseOver)
            .on("mouseleave", handleMouseOut);
    }

    simulation.on("tick", simulationTick());
    simulation.autoplay=false;
    //invalidation.then(() => simulation.stop());
    function simulationTick(){
        if(cont%1000 == 0){
            linksLines.selectAll('line.line')
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            linksLines.selectAll('line.triangle')
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => (d.target.x + d.source.x) / 2)
                .attr("y2", d => (d.target.y + d.source.y) / 2);

            linksLines.selectAll('line.shadow')
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        }
        cont += 1;
    }

    simulation
        .nodes(nodes)
        .on("tick", function(){
            linksLines.selectAll('line.triangle')
                .attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return (d.target.x + d.source.x) / 2;
                })
                .attr("y2", function (d) {
                    return (d.target.y + d.source.y) / 2;
                });

            linksLines.selectAll('line.line')
                .attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

            linksLines.selectAll('line.shadow')
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        });

    tooltip = d3.select(local)
        .append("div")
        .attr("class", "tooltipBig")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("top", "0px")
        .style("left", "0px")
        .style("visibility", "hidden");


    function handleMouseOver(d) {
        let object = d3.select(this).selectAll('line.shadow');
        if(object._groups[0].length > 0){
            object.attr('class', 'shadow selected')
                .attr('opacity', 1);
        }else{
            object = d3.select(this).select('circle');
            object.attr('class', 'selected');
        }
        tooltip.selectAll('*').remove();
        let top = 56;
        let left = document.body.clientWidth - 2*(document.body.clientWidth/12) + 10;
        tooltip.style("top", top + "px")
            .style("left", left + "px")
            .style("visibility", "visible");
        for(let n of datasetData){
            for(let id of (d.id+',').split(',')){
                if((','+n.id+',').includes(','+id+',')){
                    let text = n.text;
                    if(d.word !== undefined){
                        let list = text.split(d.word);
                        text = list[0] + d.word.bold() + list[1];
                    }else{
                        let list = text.split(d.source.word);
                        text = list[0] + d.source.word.bold() + list[1];
                        list = text.split(d.target.word);
                        text = list[0] + d.target.word.bold() + list[1];
                    }
                    text = "(" + id + ") " + text + " (" + emotionPolarity[n.emotion] + " - " + emotionPolarity[n.polarity] + ")";
                    tooltip.style("width", 2*(document.body.clientWidth/12));
                    let p = tooltip.append('div')
                        .style("width", 2*(document.body.clientWidth/12))
                        .style("height", 15)
                        .attr('class', emotionPolarity[n[classType]]);
                    p.append("p")
                        .style('font-size', '14px')
                        .style("margin-top", "0px")
                        .style("margin-bottom", "3px")
                        .style("color", "black")
                        .style('background-color', 1.5)
                        .html(text);
                    p.style('background-color', p.style('background-color').replace('rgb', 'rgba').replace(')', ', 0.5)'));
                }
            }
        }
    }

    function handleMouseOut(d) {
        let object = d3.select(this).selectAll('line.shadow');
        if(object._groups[0].length > 0){
            object.attr('class', classType === 'emotion' ? object.attr('emotion') :  object.attr('polarity'))
                .attr('opacity', 0.5);
        }else{
            object = d3.select(this).select('circle');
            object.attr('class', classType === 'emotion' ? object.attr('emotion') :  object.attr('polarity'));
        }
        tooltip.style("visibility", "hidden");
        tooltip.selectAll('*').remove();
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
    let zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on('zoom', function() {
            svg.selectAll('g.nodes').attr('transform', d3.event.transform);
            svg.selectAll('g.links').attr('transform', d3.event.transform);
        });

    svg.call(zoom);
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

function reorder() {
    let result = {};
    let diameter = (new VertexModel()).diameter;
    let maxDistance = diameter * 3;
    let gravityDistanceSqr =  10  * (maxDistance * maxDistance);
    let edgeGravityKof     =  10  / (maxDistance);
    let kCenterForce       =  10  / (maxDistance * 10);
    let velocityMax = maxDistance * 10;
    let centerPoint = new Point();

    // loop through vertices
    for(let i = 0; i < this.vertices.length; i++) {
        centerPoint.add(this.vertices[i].position);
    }
    centerPoint.multiply(1.0 / this.vertices.length);

    let edgesMatrix = {};
    for (let i = 0; i < this.edges.length; i++) {
        edgesMatrix[this.edges[i].vertex1.id + this.edges[i].vertex2.id * 1000] = 1;
        edgesMatrix[this.edges[i].vertex2.id + this.edges[i].vertex1.id * 1000] = 1;
    }

    let k = 0;
    let bChanged = true;
    while (k < 1000 && bChanged) {
        let vertexData = [];
        // loop through vertices
        for(let i = 0; i < this.vertices.length; i++){
            // Has no in newVertexes.
            let currentVertex = {};
            currentVertex.object    = this.vertices[i];
            currentVertex.net_force = new Point (0, 0);
            currentVertex.velocity   = new Point (0, 0);
            vertexData.push(currentVertex);

            // loop through other vertices
            for(let j = 0; j < this.vertices.length; j++){
                let otherVertex = this.vertices[j];

                if (otherVertex == currentVertex.object) continue;

                // squared distance between "u" and "v" in 2D space
                let rsq = currentVertex.object.position.distanceSqr(otherVertex.position);
                {
                    // counting the repulsion between two vertices
                    let force = (currentVertex.object.position.subtract(otherVertex.position)).normalize(gravityDistanceSqr / rsq);
                    currentVertex.net_force = currentVertex.net_force.add(force);
                }
            }

            // loop through edges
            for(let j = 0; j < this.vertices.length; j++){
                let otherVertex = this.vertices[j];
                if (edgesMatrix.hasOwnProperty(currentVertex.object.id + 1000 * otherVertex.id)) {
                    let distance = currentVertex.object.position.distance(otherVertex.position);

                    if (distance > maxDistance)
                    {
                        // countin the attraction
                        let force = (otherVertex.position.subtract(currentVertex.object.position)).normalize(edgeGravityKof * (distance - maxDistance));
                        currentVertex.net_force = currentVertex.net_force.add(force);
                    }
                }
            }

            // Calculate force to center of world.
            let distanceToCenter = centerPoint.distance(currentVertex.object.position);
            let force = centerPoint.subtract(currentVertex.object.position).normalize(distanceToCenter * kCenterForce);
            currentVertex.net_force = currentVertex.net_force.add(force);

            // counting the velocity (with damping 0.85)
            currentVertex.velocity = currentVertex.velocity.add(currentVertex.net_force);
        }

        bChanged = false;

        // set new positions
        for(let i = 0; i < vertexData.length; i++){
            let v = vertexData[i];
            let velocity = v.velocity;
            if (velocity.length() > velocityMax) {
                velocity = velocity.normalize(velocityMax);
            }
            v.object.position = v.object.position.add(velocity);
            if (velocity.length() >= 1) {
                bChanged = true;
            }
        }
        k++;
    }

    this.app.OnAutoAdjustViewport();
    this.app.SetHandlerMode("default");
    // Looks like somthing going wrong and will use circle algorithm for reposition.

    return result;
}