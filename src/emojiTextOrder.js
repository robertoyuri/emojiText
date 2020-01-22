function emojiText(local, nodes, links) {
    let height = document.getElementById(local.replace('#','')).clientHeight;
    if(height < 700){height = 700}
    const width = document.getElementById(local.replace('#','')).clientWidth;
    const sizeScale = d3.scaleLinear().domain(d3.extent(nodes, d => d.size)).range([15, 25]);
    const circleScale = d3.scaleLinear().domain(d3.extent(nodes, d => d.size)).range([20, 40]);
    //const colors = d3.schemePastel1;//d3.schemeSet3;
    const colors = ["#F0F8FF", "#F8F8FF", "#FFFAFA", "#FFF5EE", "#FFFAF0", "#F5F5F5", "#F5F5DC", "#FDF5E6", "#FFFFF0",
        "#FAF0E6", "#FFF8DC", "#FAEBD7", "#FFEBCD", "#FFE4C4", "#FFFFE0", "#FFFACD", "#FAFAD2", "#FFEFD5", "#FFDAB9",
        "#FFE4B5", "#EEE8AA", "#FFE4E1", "#FFF0F5", "#E6E6FA", "#D8BFD8", "#F0FFFF", "#E0FFFF", "#B0E0E6", "#E0FFFF",
        "#F0FFF0", "#F5FFFA"];

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


    let angles = [0, 45, 90, 135, 180, 225, 315];
    let distances = [100];
    for(let n of nodes){
        let numberNode = 0;
        let x = width/2;
        let y = height/2;
        drawNode(n, {"x":x, "y":y})
        for(let l of links){
            if(l.source == n.word){
                let index = nodes.findIndex(d => (d.word == l.target || d.word == l.source));
                if (index === -1){
                    //drawLink(l);
                }else {
                    drawNode(nodes[index], parsePolar2Cartesiana(
                        angles[numberNode - (angles.length * parseInt(numberNode / angles.length))],
                        distances[numberNode - (distances.length * parseInt(numberNode / distances.length))], x, y));
                    //drawLink(l);
                    nodes.remove(nodes[index]);
                    numberNode++;
                }


            }
        }
        break;
    }


    function parsePolar2Cartesiana (angle, distance, x, y) {
        let X = x + (distance * Math.cos(degrees2Radians(angle)));
        let Y = y + (distance * Math.sin(degrees2Radians(angle)));
        return {"x":X, "y":Y};
    }

    function parseCartesiana2Polar(x, y) {
        let distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        let angle = Math.tan(x / y);

        if (x < 0 && y < 0) {
            angle += 180;
        } elseif ( x > 0 && y < 0) {
            angle -= 360;
        } else if (x < 0 && y > 0) {
            angle -= 180;
        }
        return {"angle":angle, "distance":distance};
    }

    function degrees2Radians(degrees){
        let pi = Math.PI;
        return degrees * (pi/180);
    }

    function drawNode(n, point) {
        let node = svg.append("g")
            .attr("class", "nodes")
            .attr("transform", "translate(" + point.x + "," + point.y + ")");

        node.append("circle")
            .attr("r", (circleScale(n.size)/2)+2)
            .attr("class", n.status);

        node.append("circle")
            .attr("r", (circleScale(n.size)/2))
            .attr("fill", "#FFFFFF");

        node.append("image")
            .attr("xlink:href", "http://localhost:8000/media/images/" + n.status + ".svg")
            .attr("width", circleScale(n.size))
            .attr("height",  circleScale(n.size))
            .attr("transform", "translate(-" + circleScale(n.size)/2 + ", -"  + circleScale(n.size)/2 + ")");

        let text = node.append("text")
            .text(n.word)
            .style("font-size", "14px")
            .style("font-family", "Arial")
            .attr("class", n.status)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            //.attr('x', sizeScale(n.size) + "px")
            //.attr('x', d => {console.log(this); return -18})
            .attr('y', -(circleScale(n.size)/1.6));

        text.attr("x", text.width/2);

        node.append("title")
            .text(n.word);
    }

    function drawLink(l) {
        let shadow = svg.append("g")
            .attr("class", "links")
            .append("line")
            .attr("stroke-width", 10 * l.value)
            .attr("stroke", colors[l.group - (colors.length * parseInt(l.group / colors.length))])
            .attr("x1", l.source.x)
            .attr("y1", l.source.y)
            .attr("x2", l.target.x)
            .attr("y2", l.target.y);

        let triangle = svg.append("g")
            .attr("class", "links")
            .append("line")
            .attr("stroke-width", Math.sqrt(l.value) + "px")
            .attr("stroke", "black")
            .attr("marker-end","url(#arrow)")
            .attr("x1", l.source.x)
            .attr("y1", l.source.y)
            .attr("x2", (l.target.x + l.source.x)/2)
            .attr("y2", (l.target.y + l.source.y)/2);

        let link = svg.append("g")
            .attr("class", "links")
            .append("line")
            .attr("stroke-width", l.value)
            .attr("stroke", "black")
            .attr("x1", l.source.x)
            .attr("y1", l.source.y)
            .attr("x2", l.target.x)
            .attr("y2", l.target.y);
    }
}