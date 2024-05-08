import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let w = 1400;
let h = 700;
// let w = window.innerWidth;
// let h = window.innerHeight;
let xPadding = 70;
let yPadding = 50;

let viz = d3.select("#viz2")
    .append("svg")
    .attr("class", "viz")
    // .attr("width", w + xPadding)
    // .attr("height", h + yPadding)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 "+w+" "+h)

function cityName(d) {
    console.log(d.Name)
    return d.City
}
function namelocation(d, i) {
    return 10 + i * 0.35
}




viz.append("circle")
    .attr("cx",30)
    .attr("cy",30)
    .attr("r",7)
    .attr("fill","blue")
    .attr("stroke","white")

viz.append("text")
    .attr("x",45)
    .attr("y",35)
    .text("Female toilets")


viz.append("circle")
    .attr("cx",30)
    .attr("cy",60)
    .attr("r",7)
    .attr("fill","white")
    .attr("stroke","white")

viz.append("text")
    .attr("x",45)
    .attr("y",65)
    .text("Male toilets")



function getColor(d) {
    if (d.properties.name === "北京市" || d.properties.name === "天津市" || d.properties.name === "山东省" || d.properties.name === "甘肃省" || d.properties.name === "陕西省" || d.properties.name === "河南省" || d.properties.name === "湖北省" || d.properties.name === "浙江省" || d.properties.name === "广东省") {
        return "darkgrey"
    } else {
        return "lightgrey"
    }
}



function gotData(geoData, toiletData) {
    console.log(geoData)
    console.log(toiletData)

    function handleMouseOver(event, d) {
        console.log(d)

        
        largeDataGroups.filter(largeGroup => {
            console.log(largeGroup.Name)
            return largeGroup.Name == d.properties.name
        }).selectAll("circle").attr("stroke", "black")


        if (d3.select(this).attr("fill") == "lightgrey") {
            return;
        }
        d3.select(this)
            .attr("fill", "#0D47A1")


        //let toiletInfo = toiletData.find(data => data.country === d.properties.name); 

        // let cityInfo = toiletData.find(data => data.Name === d.properties.name)
        // console.log(cityInfo)
        // if (cityInfo) {
        //     return getStroke();
        // }
    }
    function handleMouseOut(event, d) {

        if (d3.select(this).attr("fill") == "lightgrey") {
            return;
        }
        d3.select(this)
            .attr("fill", "darkgrey")


        let cityInfo = toiletData.find(data => data.Name === d.properties.name)
        if (!cityInfo) {
            return;
        }

        largeDataGroups.filter(largeGroup => {
            console.log(largeGroup.Name)
            return largeGroup.Name == d.properties.name
        }).selectAll("circle").attr("stroke", "white")
    }





    // console.log(projection([149.976679,-37.50506]))

    // let projection = d3.geoEqualEarth()

    // let projection = d3.geoConicConformal()
    // .rotate([-132, 0])
    //     .center([0, -27])
    //     .parallels([-18, -36])
    //     .scale(Math.min(h * 1.2, w * 0.8))
    //     .translate([w / 2, h / 2])
    //     .precision(0.1);



    let projection = d3.geoMercator()
        .translate([w / 2, h / 2 - 500])
        .fitExtent([[0, 0], [w - 10, h - 10]], geoData)

        ;


    //    .fitExtent([[0,0]],[[w,h]],geoData)



    console.log(projection([115.95020622, -31.92183600]))

    let pathMaker = d3.geoPath(projection)



    viz.selectAll(".provinces").data(geoData.features).enter()
        //what is features?
        .append("path")
        .attr("class", "provinces")
        .attr("d", pathMaker)
        .attr("fill", getColor)
        .attr("stroke", "grey")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)




    // viz.append("circle")
    //     .attr("cx",function(d,i){
    //         return projection([149.976679,-37.50506])[0]
    //     })
    //     .attr("cy",function(d,i){
    //         return projection([148.194946,-36.796253])[1]
    //     })
    //     .attr("r",2)
    //     .attr("fill","red")

    // viz.append("rect")
    //     .attr("width",50)
    //     .attr("height",20)
    //     .attr("x",w/2+50)
    //     .attr("y",h/2-20)
    //     .attr("fill","grey")


    function getPosition(d) {
        let x, y;

        let latitude = parseFloat(d.Latitude);
        let longitude = parseFloat(d.Longitude);

        // Check if latitude and longitude are valid numbers
        if (!isNaN(latitude) && !isNaN(longitude)) {
            let projectedCoordinates = projection([longitude, latitude]);
            x = projectedCoordinates[0];
            y = projectedCoordinates[1];
        } else {
            // If latitude or longitude is not a valid number, set default values
            x = 0;
            y = 0;
        }

        return "translate(" + x + "," + y + ")";
    }


    toiletData = toiletData.map(function (d) {
        // d.Number = new Array(parseInt(d.Number)).fill(0);
        d.numFemaleToilets = new Array(parseInt(d.Number))
        d.numMaleToilets = new Array(parseInt(10))
        return d;
    })
    console.log(toiletData)

    let largeDataGroups = viz.selectAll(".largeGroup")
        .data(toiletData)
        .enter()
        .append("g")
        .attr("class", "largeGroup")

    largeDataGroups.append("text")
        .text(cityName)
        .attr("font-size", 15)
        .attr("x", namelocation)
        .attr("y", 40)
        .attr("class", "label")

    // largeDataGroups.append("rect")
    //                 .attr("x",-9)
    //                 .attr("y",-60)
    //                 .attr("width",55)
    //                 .attr("height",100)
    //                 .attr("fill","black")


    largeDataGroups.attr("transform", function (d, i) {
        let x = i * 150 + xPadding;
        let y = h - yPadding
        return "translate(" + x + ", " + y + ")"
    })


    // let max = d3.max(toiletData, d => d.Number)
    // let yScale = d3.scaleLinear().domain([0, max]).range([20, h - (2 * yPadding)])

    // function getStroke() {
    //     return "black"
    // }

    let femaleDataGroups = largeDataGroups.selectAll(".femaleGroup")
        .data(function (d) {
            return d.numFemaleToilets
        })
        .enter()
        .append("g")
        .attr("class", "femaleGroup")
        .attr("transform", "translate(50, -20)")
    ;

    let femaleCircles = femaleDataGroups.append("circle")
        .attr("cx", 0)
        .attr("cy", function (d, i) {
            return 30 - i * 20
        })
        .attr("r", 7)
        .attr("fill", "white")
        // .attr("stroke", getStroke)
        // .attr("stroke-width", 1)

    let maleDataGroups = largeDataGroups.selectAll(".maleGroup")
        .data(function (d) {
            return d.numMaleToilets
        })
        .enter()
        .append("g")
        .attr("class", "maleGroup")
        .attr("transform", "translate(25, -20)")
    ;

    let maleCircles = maleDataGroups.append("circle")
        .attr("cx", 0)
        .attr("cy", function (d, i) {
            return 30 - i * 20
        })
        .attr("r", 7)
        .attr("fill", "blue")
        .attr("stroke", null)
        .attr("stroke-width", 1)








}


d3.json("datasets/china.json").then(function (geoData) {
    d3.csv("datasets/11 Chinese Cities.csv").then(function (toiletData) {
        gotData(geoData, toiletData)
    })
})

// d3.json("china.json").then(gotData)