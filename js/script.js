/**Loads the data  */

/** POWER SYSTEM LOADING
 * NODE feautres
 * 1) Active Load
 * 2) Voltage
 * 3) Charging Station Power */

 /** EDGE features
 * 1) Current
 * 2) Maximum line current
 * 3) Active Power flow
 */
 

Promise.all([
    //Power grid data 
    d3.csv("data/PowerSystem_csvs/activeLoad.csv"),
    d3.csv("data/PowerSystem_csvs/voltage.csv"),
    d3.csv("data/PowerSystem_csvs/chargingStationPower.csv"),
    d3.csv("data/PowerSystem_csvs/current1.csv"),
    d3.csv("data/PowerSystem_csvs/maxLineCurrent1.csv"),
    d3.csv("data/PowerSystem_csvs/activePowerFlow1.csv"),
    //Transit data
    d3.csv("data/TransitSystem_csvs/BEBenergy.csv"),
    d3.csv("data/TransitSystem_csvs/BEBpower.csv"),
    d3.csv("data/TransitSystem_csvs/busStationTime.csv"),
    d3.csv("data/TransitSystem_csvs/speed.csv"),
    d3.csv("data/TransitSystem_csvs/trans_links.csv"),
    //New "reactive" data
    d3.csv("data/PowerSystem_csvs/reactivePowerFlow.csv"),
    d3.csv("data/PowerSystem_csvs/reactiveLoad.csv"),
    d3.csv("data/PowerSystem_csvs/chargingStationReactivePower.csv")

]).then(function(files){

    //Initializaing power network object
    let powNet = {
        "nodes":[],
        "links":[]
    };

    //Adding active load to power net object w/ id
    files[0].forEach( (d, i) => {
        powNet.nodes.push({
            "id": d[""],
            "aLoad": d3.entries(d).slice(1), //.map(f => parseFloat(f[1]), //gets rid of "t1, t2, etc."
            "rLoad": null,
            "volt": null,
            "chSP": null,
            "x": null,
            "y": null,
            "index": i
        });          
    });

    //Adding reactive load to power net object nodes
    files[12].forEach( (d, i) => {
        if (powNet.nodes[i].id == d[""]){
            powNet.nodes[i].rLoad = d3.entries(d).slice(1);
        }
    });

    //Adding voltage to power net object nodes
    files[1].forEach( (d, i) => {
        if (powNet.nodes[i].id == d[""]){
            powNet.nodes[i].volt = d3.entries(d).slice(1)
        }
    });

    //Adding charging station power to correct nodes
    stations = ["n2","n13","n9","n33","n25","n31","n8"];
    files[2].forEach( (d, i) => {
        powNet.nodes.forEach( (e,j) => {
            if(e.id == stations[i]){
                e["chSP"] = d3.entries(d).slice(1);
            } 
        })
    });

    //Creating link properties and adding in current
    files[3].forEach( (d, i) => {
        powNet.links.push({
            "source": Object.assign({},powNet.nodes.filter(f => f.id == d.From))[0],
            "target": Object.assign({},powNet.nodes.filter(f => f.id ==d.To))[0],
            "current": d3.entries(d).slice(2),
            "mLC": null,
            "aPF": null,
            "rPF": null
        })          
    });

    //Add maximum line currents to links
    files[4].forEach( (d, i) => {
        // console.log(powNet.links[i].target.id);
        if((d.From == powNet.links[i].source.id) && (d.To == powNet.links[i].target.id)){
            powNet.links[i].mLC = +d.Imax;
        }
    });

    //Adding in active power flow
    files[5].forEach( (d, i) => {
        if ((d.From == powNet.links[i].source.id) && (d.To == powNet.links[i].target.id)){
            powNet.links[i].aPF = d3.entries(d).slice(2)
        }
    });
    //console.log("Power Net: ",powNet);

    // Now adding in reactive power flow
    files[11].forEach( (d, i) => {
        if ((d.From == powNet.links[i].source.id) && (d.To == powNet.links[i].target.id)){
            powNet.links[i].rPF = d3.entries(d).slice(2)
        }
    });

    /** TRANSIT SYSTEM DATA 
     * Make nodes and links out of bus stations 
     * Each node will contain which busses are there at which times
     * makes separate bus objects w/ time-point data
     * depending on what those bus object values are at certain times,
     * they'll either be present at the station, or on the links
    */

    //Init object that will contain bebs
    let bebs = [];

    //Adding in BEB energy 
    files[6].forEach( (d, i) => {
        bebs.push({
            "id": d[""],
            "route": null,
            "BusID": i+1,
            "energy": d3.entries(d).slice(1),
            "power":null,
            "Stations": {},
            "Speeds": {},
            "Location": {},
            "current_speed": {}
        })
    });

    //Adding in BEB power
    files[7].forEach( (d, i) => {
        if (bebs[i].id == d[""]){
            bebs[i].power = d3.entries(d).slice(1)
        }
    });

    //Adding station data to beb objects
    //console.log("Station Data: ",files[8])

    //Adding location data
    files[8].forEach( (d, i) => {
        //console.log(d)
        bebs.forEach( (c,j) => {
            if (c.BusID == d["BusID"]){
                c.Stations[d["StationName"]] = d3.entries(d).slice(0,-5)
                //Doing location 
                d3.entries(d).slice(0,-5).forEach( (b,k) =>{
                    //return array with stations when bus is there and "on the road" when on the road
                    (b.value == '1') ? c.Location[k] = d.StationName : c.Location[k] = c.Location[k];
                    if (c.Location[k] == undefined){
                        c.Location[k] = "On the road"
                    }
                })

            }
        })
    });

    //Adding speed data to beb objects
    files[9].forEach( (d, i) => {
        bebs.forEach( (c,j) => {
            if (c.BusID == d["BusID"]){
                c.Speeds[d["StationName"]] = d3.entries(d).slice(0,-5)
            }
            if (c.BusID == d["BusID"]){
                c.route = d.Route;
            }
        })
    });

    //console.log("BEBs",bebs)
    

    // Create 7 objects corresponding to each station. This will be the trans network I visualize.
    // Seems pointless to visualize any of the other stops because we have no data about those stops
    // Encode station circles by how many buses currently there

     // Init object that will contain station data 
     let transNet = {
        "nodes":[],
        "links":[]
    };

    // Can feed all station presence data in this way -> I'll also throw in node data as well
     //console.log("Experiments with stations: ", files[8].filter(f => f.StationName == "OTTC"));

    let pow_stations = ["n2","n13","n9","n33","n25","n31","n8"];
    let num_stations = ["1","2","3","4","5","6","7"];
    let name_stations = ["OTTC","KJTC","CTH","JRPR","KPR","EH","GS"]


    function bus_Data(station_name){
        let Bus_Data = [];
        let current_BEB = 0;
        let bus_list = [];
        //Experimenting - save this for implementation in other files - or not
        // goal is to have a stores tuple of sum and unique busses at every time point
        for (let j = 1; j < 289; j++){
            files[8].filter(f => f.StationName == station_name).forEach((d,i) => {
                //console.log(d)
                current_BEB = current_BEB + parseInt(d[j]);
                if (parseInt(d[j])){
                    bus_list.push(d.BusID)
                }
                //console.log(current_BEB);
            })
            Bus_Data.push({
                "total": current_BEB, //Tells you how many buses are there at a given time
                "busses": bus_list //Gives you bus ID's of busses that are there at a given time
            })
            current_BEB = 0;
            bus_list = [];
        }
        return Bus_Data;
    }

    //console.log("aload",files[0])
     //Adding relevant data to bus station nodes
     pow_stations.forEach( (d, i) => {
         transNet.nodes.push({
             "x":null,
             "y":null,
             "index": i,
             "StationName": name_stations[i],
             "StationID":num_stations[i],
             "StationNode":Object.assign({},powNet.nodes.filter(f => f.id == pow_stations[i]))[0],
             //"BusDataRaw": files[8].filter(f => f.StationName == name_stations[i]),
             "BusData": bus_Data(name_stations[i]),
             "chSP": d3.entries(files[2][i]).slice(1),
             "chSRP": d3.entries(files[13][i]).slice(1),
             "aLoad": powNet.nodes.filter(f=>f['id']==pow_stations[i])[0].aLoad, //.map(f => parseFloat(f[1]), //gets rid of "t1, t2, etc."
             "volt": powNet.nodes.filter(f=>f['id']==pow_stations[i])[0].volt

         })
     });


     //Create links, only attaching source data
     files[10].forEach( (d, i) => {
        transNet.links.push({
            "source": Object.assign({},transNet.nodes.filter(f => f.StationID == d.From))[0],
            "target": Object.assign({},transNet.nodes.filter(f => f.StationID == d.To))[0],
            "index":i
        })
    });

    /**Questions
     * 1) Max current units, current exceeds that a lot
     * 2) How to visualize these networks
     *      Power connections don't line up w/ pics
     *      Other than charging statings we don't know where buses are
     *      In email:  Below is a table indicating the mapping between the Bus Station Number/Name and the Power System Node Number.
     *      Where is that table?
     * It doesn't seem like any data in the trans system matters other than charging station stops?
     * Seems like this only needs 1 network visualization then..... idk
     *      
     */


    //console.log("Trans net: ",transNet);

    function updateTime(time) {
        console.log(time)
        transNetwork.activeTime = time;
        transNetwork.updateNet();

        powNetwork.activeTime = time;
        powNetwork.updateNet();

        table.activeTime = time;
        // console.log(table.BEB);
        // table.createTable();
        table.updateTable();


    }


    let time = 50;
    // Pass data into table object
    let table = new Table(bebs,transNet,time,null,updateTime)
    table.createTable();
    table.createLine();
    
    /** Pass data into TransNet class */
    let transNetwork = new TransNet(transNet,powNet,bebs,time,table,updateTime);
    transNetwork.createNet();
    transNetwork.createSlider();
    transNetwork.updateNet();
    // transNetwork.createLine();
    
    /** Pass data into PowNet class */
    let powNetwork = new PowNet(powNet,time,transNetwork,bebs,table);
    powNetwork.createNet();
    powNetwork.updateNet();
    // powNetwork.createLine();
    powNetwork.handleZoom();

    // Adding reference to table
    table.transNet = transNetwork;


    // Find active view and create those charts on screen load
    let target = $('#viewDrop').find('.active')[0].id;
    if (target == 'power'){
        display_power();

    }
    else if (target == 'transit'){
        display_transit();


    }
    else if (target == 'both'){
        display_both();
    }


    // Handling resizing stuff
    window.addEventListener("resize", resize);
    // var redraw = document.getElementById("redraw");
    function resize (event) {
        // Gets new sizes and sets new canvas dimensions
        let view1 = d3.select('.view1').node()

        // // retrieves new size
        let boundingRect = view1.getBoundingClientRect();
        console.log("BOUNDING RECT",boundingRect)

        // // stores new size width
        let newWidth = boundingRect.width;
        // // stores new size height
        let newHeight = boundingRect.height;

        //set new width and height
        transNetwork.WIDTH = 3200; //newWidth;
        transNetwork.HEIGHT = newHeight;

        // redraw
        transNetwork.removeNet()

        transNetwork.createNet()
        transNetwork.updateNet()

        // time bar
        transNetwork.drawTimeBar()


        //powernetwork
        powNetwork.createNet()
        powNetwork.updateNet()
        powNetwork.handleZoom()

        // charts
        let target = $('#viewDrop').find('.active')[0].id;
        if (target == 'power'){
            display_power();

        }
        else if (target == 'transit'){
            // show just the relevant transit system charts
            display_transit();

        }
        else if (target == 'both'){
            display_both();
        }
    }

    // // Handle view reorganization:
    $('#viewDrop a').on('click', function(e){
        let target = $(e.target).attr('id')

        // makes the most recently selected target the 'active' option and removes
        // active class from previously active option
        let start_active = $('#viewDrop').find('active');
        let kids = $('#viewDrop').find('a')
        kids.removeClass( "active" );
        $(`#${target}`).addClass("active")

        // Finds which dataset is active 
        // let active_data = $('#datasetDrop').find('.active')[0].id;

        // Populate views based on target
        if (target == 'power'){
            display_power();

        }
        else if (target == 'transit'){
            display_transit();

        }
        else if (target == 'both'){
            display_both();
        }
        
    });

    function display_transit(){
        // show just the relevant transit system charts
        console.log("TRANSIT")
        transNetwork.removeCharts()
        unmake_both_Chart3() // restores previous layout if coming from both layout
        // transNetwork.createTransitCharts()
        // table.createBusLines()
        let row2_div = ['.chart-1-col1','.chart-1-col2']
        let row1_div = ['.chart-2-col1','.chart-2-col2']
        let row3_div = ['.chart-3']
        // Because the whole of chart 3 is being visualzied,
        // set display of .chart-3-col1 and .chart-3-col2 to none
        // might need to use this trick when I split up charts even further
        d3.select('.chart-3-col1').style("display", "none")
        d3.select('.chart-3-col2').style("display", "none")
        // Make all other blocks a none display
        d3.select('.chart-1-col1').selectAll('div').style("display", "none")
        d3.select('.chart-1-col2').selectAll('div').style("display", "none")
        d3.select('.chart-2-col1').selectAll('div').style("display", "none")
        d3.select('.chart-2-col2').selectAll('div').style("display", "none")
        d3.select('.chart-3-col1').selectAll('div').style("display", "none")
        d3.select('.chart-3-col2').selectAll('div').style("display", "none")

        // pass in correct div levels
        transNetwork.createTransitCharts(row1_div,row3_div)
        table.createBusLines(row2_div)

        // console.log(table.clickedBusses)
        if (table.clickedBusses.length != 0){
            table.updateLine()
        }
        //TODO - implement clicked stations for transnet
        // transNetwork.updateLine()

    }

    function display_power(){
        // show just the relevant power station charts
        console.log("POWER")
        transNetwork.removeCharts()
        unmake_both_Chart3() // restores previous layout if coming from both layout
        // transNetwork.createPowerCharts()
        // powNetwork.createPowerCharts()
        // Make chart-3-col1 and 2 grids again
        d3.select('.chart-3-col1').style("display", "grid")
        d3.select('.chart-3-col2').style("display", "grid")
        // Make all other blocks a none display
        d3.select('.chart-1-col1').selectAll('div').style("display", "none")
        d3.select('.chart-1-col2').selectAll('div').style("display", "none")
        d3.select('.chart-2-col1').selectAll('div').style("display", "none")
        d3.select('.chart-2-col2').selectAll('div').style("display", "none")
        d3.select('.chart-3-col1').selectAll('div').style("display", "none")
        d3.select('.chart-3-col2').selectAll('div').style("display", "none")


        let row1_div = ['.chart-1-col1','.chart-1-col2'] // active load, reactive load
        let row3_div = ['.chart-2-col1','.chart-2-col2'] // active pflow, reactive pflow
        let row2_div = ['.chart-3-col1','.chart-3-col2'] // current, voltage 

        // pass in correct divs
        transNetwork.createPowerCharts(row1_div,row3_div) // active load (and reactive load) and voltage 
        powNetwork.createPowerCharts(row2_div,row3_div) // active pflow (and reactive pflow) and current

        // TODO - implement clicked stations for transNet
        // console.log(transNetwork.clicked != 0)
        if (powNetwork.clickedLinks.length != 0){
            powNetwork.updateLine()
        }
        if (powNetwork.clickedNodes.length != 0){
            powNetwork.updateLineNode()
        }
        // if (transNetwork.clicked != 0){
        //     transNetwork.updateLine()
        // }
        
    }

    function display_both(){
        console.log("BOTH")
        transNetwork.removeCharts()
        // Make chart-3-col1 and 2 grids again
        d3.select('.chart-3-col1').style("display", "grid")
        d3.select('.chart-3-col2').style("display", "grid")
        // Make all other blocks a block display 
        d3.select('.chart-1-col1').selectAll('div').style("display", "block")
        d3.select('.chart-1-col2').selectAll('div').style("display", "block")
        d3.select('.chart-2-col1').selectAll('div').style("display", "block")
        d3.select('.chart-2-col2').selectAll('div').style("display", "block")
        
        // Block layout
        // Chart 1 
        // Transit View: acitve power / reactive power
        // Power View: acive load / reactive load
        // Both: active load / reactive load
        //         current / voltage
        //     

        /* Chart 2:
        Transit View: BEB energy / BEB power
        Power View: Active pflow / reactive pflow
        Both: active pflow / reactive pflow
            BEB energy / BEB power
        */
       /* Chart 3:
        Transit View: BEB count
        Power View: current / voltage
        Both: active power / reactive power
                    BEB count
        */

        // Remakes grid area of chart 3 to work with this 'both' configuration
        unmake_both_Chart3()
        make_both_Chart3()

        // HANDLE POWER CHARTS
        let row1_div = ['.chart-1-col1-row1','.chart-1-col2-row1'] // active load, reactive load
        let row3_div = ['.chart-1-col1-row2','.chart-1-col2-row2'] // active pflow, reactive pflow
        let row2_div = ['.chart-2-col1-row1','.chart-2-col2-row1'] // current, voltage 

        // pass in correct divs
        transNetwork.createPowerCharts(row1_div,row3_div) // active load (and reactive load) and voltage (3rd row - 2nd column) 
        powNetwork.createPowerCharts(row2_div,row3_div) // active pflow (and reactive pflow) and current


        // HANDLE TRANSIT CHARTS
        let row2_div_trans = ['.chart-2-col1-row2','.chart-2-col2-row2'] // bus energy and power
        // let row1_div_trans = ['.chart-3-col1-row1','.chart-3-col2-row1'] // active power reactive power
        let row1_div_trans = ['.chart-3-top-col1','.chart-3-top-col2'] // active power reactive power
        // let row3_div_trans = ['.chart-3-col1-row2'] // bus count
        let row3_div_trans = ['.chart-3-bottom-row'] // bus count

        // pass in correct div levels
        transNetwork.createTransitCharts(row1_div_trans,row3_div_trans) 
        table.createBusLines(row2_div_trans)



        // TODO: Think I will need to do something different with 
        // grids so bus count goes across both columns ....



    }

    function make_both_Chart3(){

        // Chart-3 old grid
        // grid-template-columns:repeat(2,minmax(0,1fr));
        // grid-template-rows:1fr;
        // grid-template-areas:"chart-3-col1 chart-3-col2";

        // Chart 3 new grid
        // grid-template-columns:repeat(2,minmax(0,1fr));
        // grid-template-rows: repeat(2,minmax(0,1fr));
        // grid-template-areas:"chart-3-col1-row1 chart-3-col2-row2" "chart-3-bottom-row chart-3-bottom-row";

        // Altering the grid of chart 3 
        d3.select('.chart-3').selectAll('div').style("display", "none")
        d3.select('.chart-3').selectAll('div').style("display", "none")

        // Shift grid of chart 3
        d3.select(".chart-3").style('grid-template-rows','repeat(2,minmax(0,1fr))')
        d3.select(".chart-3").style('grid-template-areas',' "chart-3-top-col1 chart-3-top-col2" "chart-3-bottom-row chart-3-bottom-row" ')
        // Create bottom row div and set old bottom row divs to display:none
        d3.select(".chart-3").append('div').attr("class","chart-3-top-col1").style("grid-area","chart-3-top-col1")
        d3.select(".chart-3").append('div').attr("class","chart-3-top-col2").style("grid-area","chart-3-top-col2")
        d3.select(".chart-3").append('div').attr("class","chart-3-bottom-row").style("grid-area","chart-3-bottom-row")

    }


    function unmake_both_Chart3(){
        // Chart-3 old grid
        // grid-template-columns:repeat(2,minmax(0,1fr));
        // grid-template-rows:1fr;
        // grid-template-areas:"chart-3-col1 chart-3-col2";

        // Chart 3 new grid
        // grid-template-columns:repeat(2,minmax(0,1fr));
        // grid-template-rows: repeat(2,minmax(0,1fr));
        // grid-template-areas:"chart-3-col1-row1 chart-3-col2-row2" "chart-3-bottom-row chart-3-bottom-row";

        d3.select('.chart-3').selectAll('div').style("display", "block")
        d3.select('.chart-3').selectAll('div').style("display", "block")

        // Shift grid of chart 3 to original configuration
        d3.select(".chart-3").style('grid-template-rows','1fr')
        d3.select(".chart-3").style('grid-template-areas',' "chart-3-col1 chart-3-col2"')
        // Remove previously created divs 
        d3.select(".chart-3-top-col1").remove()
        d3.select(".chart-3-top-col2").remove()
        d3.select(".chart-3-bottom-row").remove()


    }


});

