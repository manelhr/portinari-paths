/* ----------------------------- */
/* ---  Initialization Stuff --- */
/* ----------------------------- */

// Import modules
var d3 = require("./external/d3.min.v4.js"),
    Reactor = require("./external/reactor.js");

// Creates reactor
var reactor = new Reactor();

/* ------------------------ */
/* ---  Interface Stuff --- */
/* ------------------------ */

// Creates modules
var Utils = require("./util/util.js");

// Configures query button
Utils.toggleButton("#expand-query-button", ".content_query", "Query");

/* --------------------- */
/* ---  Query System --- */
/* --------------------- */

/* ---Internal Query System Events--- */
reactor.registerEvent('selected_node_changed');
reactor.registerEvent('constraint_added');
reactor.registerEvent('outcome_added');
/* ---------------------------------- */

// Creates needed selections
var query_graph_selection = d3.select("#query-interface-graph"),
    query_form_selection = d3.select("#query-interface-form"),
    query_current_selection = d3.select("#query-interface-current"),
    outcomes_form_selection = d3.select("#query-outcomes-form"),
    outcomes_current_selection = d3.select("#query-outcomes-current");

// Import modules
var QueryForm = require("./query_system/query_form.js"),
    QueryGraph = require("./query_system/query_graph.js");

// Creates query graph interface
var query_graph = new QueryGraph(query_graph_selection, reactor);

// Creates query form interface
var query_form = new QueryForm(query_form_selection, query_current_selection,
    outcomes_form_selection, outcomes_current_selection, reactor);

/* ------------------------------------ */
/* ---  Prognosis Prediction System --- */
/* ------------------------------------ */

/* ---Internal Query System Events--- */
reactor.registerEvent('query_successful');
/* ---------------------------------- */

// Creates needed selections
var future_form_selection = d3.select("#form-future-nodes");

// Import modules
var PredictionForm = require("./sankey_visualization/prediction_form.js"),
    PredictionGraph = require("./sankey_visualization/prediction_graph.js");

// Creates prediction form interface
var prediction_form = new PredictionForm(future_form_selection, query_graph.graph, reactor);

// reactor.registerEvent('query_successful');
// var future_form_selection = d3.select("#form-future-nodes");
// var prediction_graph_selection1 = d3.select("#query-results1");
// var prediction_graph_selection2 = d3.select("#query-results2");
// Append the svg canvas to the page
// var prediction_graph = new PredictionGraph(prediction_graph_selection1, prediction_graph_selection2, reactor);
