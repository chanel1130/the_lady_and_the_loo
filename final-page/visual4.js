import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let w = 1200;
let h = 600;
let xPadding = 70;
let yPadding = 50;

let viz = d3.select("#viz4")
    .append("svg")
    .attr("class", "viz")
    // .attr("width", w)
    // .attr("height", h)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 "+w+" "+h)



    viz.append("line")
    .attr("x1",1010)
    .attr("y1",30)
    .attr("x2",1038)
    .attr("y2",30)
    .attr("stroke","blue")
    .attr("stroke-width",2)

viz.append("text")
    .attr("x",1045)
    .attr("y",35)
    .text("Female respondents")

viz.append("line")
    .attr("x1",1010)
    .attr("y1",60)
    .attr("x2",1038)
    .attr("y2",60)
    .attr("stroke","black")
    .attr("stroke-width",2)

viz.append("text")
    .attr("x",1045)
    .attr("y",65)
    .text("Male respondents")

function gotData(incomingData) {
    console.log(incomingData)

    let timeParser = d3.timeParse("%Y-%m-%d");

    incomingData = incomingData.map(function (d) {
        d.Percentage = parseFloat(d.Percentage);
        return d
    })
    // let perExtent = d3.extent(incomingData, function(d, i){
    //         return d.Percentage;
    //       });
    //       console.log("perExtent", perExtent);


    function getDate(d) {
        return d.Date;

    }
    function mapFunction(d) {
        d.Date = timeParser(d.Date)
        console.log(d.Date)
        return d;
    }

    let filteredDate = incomingData.map(mapFunction);

    let dateExtent = d3.extent(filteredDate, getDate)
    console.log(dateExtent)

    let xScale = d3.scaleTime().domain(dateExtent).range([xPadding, w - xPadding]);
    let yScale = d3.scaleLinear().domain([0, 100]).range([h - yPadding, yPadding]);

    console.log("xScale domain:", xScale.domain());
    console.log("xScale range:", xScale.range());
    console.log("yScale domain:", yScale.domain());
    console.log("yScale range:", yScale.range());


    let xAxisGroup = viz.append("g").attr("class", "xAxisGroup")
    //make a group to contain axis 
    let xAxis = d3.axisBottom(xScale);
    //build the axis with the respective scale supplied, in this case, xScale
    xAxisGroup.call(xAxis);
    xAxisGroup.attr("transform", "translate(0," + (h - yPadding) + ")")
    //把横坐标从最上面移到最下面，记得h-paddingY前后要加括号
    //put axis elements into the group

    let yAxisGroup = viz.append("g").attr("class", "yAxisGroup")


    let yAxis = d3.axisLeft(yScale).tickFormat((d) => d + "%");
    yAxisGroup.call(yAxis);
    yAxisGroup.attr("transform", "translate(40,0)")


    let lineMaker = d3.line()
        .x(function (d) {
            console.log(d)
            return xScale(d.Date)
        })
        .y(function (d) {
            return yScale(d.Percentage)
        })



    // prep data for lines
    // 1. filter out relevant data points


    // let data1 = incomingData.filter(function(d){
    //     return d.Category == "separateMale" || d.Category == "separateFemale"
    // })
    // let data2 = incomingData.filter(function(d){
    //     return d.Category == "bothMale" || d.Category == "bothFemale"
    // })
    // let data3 = incomingData.filter(function(d){
    //     return d.Category == "neutralMale" || d.Category == "neutralFemale"
    // })
    // let data4 = incomingData.filter(function(d){
    //     return d.Category == "noneMale" || d.Category == "noneFemale"
    // })
    // let data5 = incomingData.filter(function(d){
    //     return d.Category == "dkMale" || d.Category == "dkFemale"
    // })

    let dates = incomingData.reduce(function (acc, d, i) {
        if (!acc.includes(d.Date)) {
            acc.push(d.Date)
        }
        return acc
    }, [])
    // console.log("dates", dates)


    let currentDateIndex = 0;
    let currentDate = dates[currentDateIndex];


    let currentData = "separateMale" || "separateFemale";
   
   
    // let currentData;
    let targetCategories = ["separateMale" ,  "separateFemale"]

    function visualizeCurrentData() {

        function filterFunction(d) {
            // document.getElementById("button1").addEventListener("click", function () {
                // return d.Category == "seperateMale" || d.Category == "seperateFemale"
            // })
            console.log(d)
            console.log(targetCategories.includes(d.Category))
            console.log("--------")
            if(targetCategories.includes(d.Category)){
                return true
            }else{
                return false
            }


            // return targetCategories.includes(d.Category)

        }
        let DataToShow = incomingData.filter(filterFunction)
        console.log(incomingData)
        console.log(DataToShow)
        // let DataToShow = incomingData.filter(function(d){

        //   return d.Category == "separateMale" || d.Category == "separateFemale";
        // })

        // 2. group data by category
        let lineDataGroups = d3.groups(DataToShow, function (d) {
            return d.Category
        });
        console.log("lineDataGroups", lineDataGroups)
        let vizGroup = viz.append("g").attr("class", "vizGroup")

        let datagroups = vizGroup.selectAll(".datagroup").data(lineDataGroups).enter()
            .append("g")
            .attr("class", "datagroup")
            ;


        let path = datagroups.append("path")
            .attr("class", "line")
            .attr("d", function (d) {
                return lineMaker(d[1])
            })
            .attr("fill", "none")
            .attr("stroke", function (d, i) {
                console.log(d)
                if (d[0] == "separateFemale" ||d[0] == "bothFemale" || d[0] == "neutralFemale" || d[0] == "noneFemale" || d[0] == "dkFemale") {
                    return "blue"
                } else {
                    return "black"
                }
            })
            .attr("stroke-width", 1)


        // from: https://codepen.io/louisemoxy/pen/jvXzqJ?editors=1010
        console.log(path.node())
        const pathLength = path.node().getTotalLength();
        // D3 provides lots of transition options, have a play around here:
        // https://github.com/d3/d3-transition



        const transitionPath = d3
            .transition()
            .ease(d3.easeSin)
            .duration(2500);

        path
            .attr("stroke-dashoffset", pathLength)
            .attr("stroke-dasharray", pathLength)
            .transition(transitionPath)
            .attr("stroke-dashoffset", 0);



        let circles = datagroups.selectAll(".circle")
            // .enter()
            .data(function (d) {
                return d[1];
            })

        // circles  .enter()
        //         .append("circle")
        //         .attr("cx",0)
        //         .attr("cy",0)
        //         .attr("r",5)
        //         .attr("fill","black")
        //         .transition(function(d,i){
        //             return i * 100;
        //         })
        //         .ease(d3.easeSin)
        //         .attr("transform",getGroupPosition)
        //         // .transition(transitionPath)
        //         // .attr("transform",getGroupPosition)

        circles.enter() // Enter new data
            .append("circle")
            .attr("class", "circle") // Add class to identify circles
            .attr("r", 0) // Set initial radius to 0
            .attr("fill", "black")
            .attr("transform", getGroupPosition) // Set initial position
            .each(function (d, i) {
                // Apply transition to each circle separately
                d3.select(this)
                    .transition()
                    .delay(i * 250) // Add delay based on index to stagger circles
                    .attr("r", 5) // Increase radius to desired size
                    .ease(d3.easeSin)
                    .attr("transform", getGroupPosition); // Transition to final position
            });



        //Question:
        //1.About the circle: what does it mean to select(this)? why the previous one doesn't work? 
        //why enter the datapoints twice?
        //2.About the Year: how to simplify & how to stop it?
        //3.About geting male & female data at the same time
        //4.How to hide the line if clicked once more to be more visually effective?






        function getGroupPosition(d) {
            let x = xScale(d.Date);
            let y = yScale(parseFloat(d.Percentage));
            console.log("x:", x, "y:", y);
            return "translate(" + x + "," + y + ")";

        }

        // datagroups.select("circle")
        // .transition().duration(1000).attr("transform",getGroupPosition)
        // ;


    }

    // let year = viz.append("text")
    // .text("")
    // .attr("x", 100)
    // .attr("y", 100)
    // .attr("font-family", "sans-serif")
    // .attr("font-size", "1em")
    // ;

    // visualizeCurrentData();


    // setInterval(function(){
    // currentDateIndex++;
    // if(currentDateIndex>dates.length){
    // //currentDateIndex = 0;
    // clearInterval();
    // }
    // currentDate = dates[currentDateIndex];
    // year.text(currentDate)
    // visualizeCurrentData();
    // }, 300);





    document.getElementById("button1").addEventListener("click", function () {
        // currentData = "separateMale" || currentData == "separateFemale";
        targetCategories = ["separateMale" ,  "separateFemale"]

        visualizeCurrentData();

    });
    document.getElementById("button2").addEventListener("click", function () {
        targetCategories = ["bothMale" ,  "bothFemale"]
        visualizeCurrentData();

    })
    document.getElementById("button3").addEventListener("click", function () {
        targetCategories = ["neutralMale" ,  "neutralFemale"]
        visualizeCurrentData();
    })
    document.getElementById("button4").addEventListener("click", function () {
        targetCategories = ["noneMale" ,  "noneFemale"]
        visualizeCurrentData();
    })
    document.getElementById("button5").addEventListener("click", function () {
        targetCategories = ["dkMale" ,  "dkFemale"]
        visualizeCurrentData();
    })








}



d3.csv("datasets/clean support rate.csv").then(gotData)





