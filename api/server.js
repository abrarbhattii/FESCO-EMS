import express from "express";
import mssql from "mssql";
import cors from "cors";
import dotenv from "dotenv";


// app
const app = express();

// app configs
app.use(cors());
app.use(express.json());

// dotenv configuration
dotenv.config();

// sql server configuraion
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: "localhost",
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// API route - calling SP (cirlces)
app.get("/api/circles", async (req, res) => {
    try {
        const pool = await mssql.connect(dbConfig); // pool
        const result = await pool.request().execute("sp_GetCircles"); // our SP
        res.json(result.recordset); // response
        console.log("result returned..");
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "DB error"
        });
    }
});

// API route - calling SP (cirlce hierarchy)
app.get("/api/circle-hierarchy/:circle_id", async (req, res) => {
    try {
        const circleId = parseInt(req.params.circle_id);

        console.log("req.params: ", req.params);
        console.log("circleId: ", circleId);

        const pool = await mssql.connect(dbConfig); // pool

        const result = await pool.request()
        .input("circle_id", mssql.Int, circleId) // PARAM
        // .execute("sp_GetCircleHierarchy"); // our SP
        // .execute("sp_GetCircleHierarchyFlat"); // our SP
        .execute("sp_GetCircleHierarchyOptimized"); // our SP

        // console.log("result: ", result);
        console.log("result.recordset[0]: ", result.recordset[0]);

        // const jsonData = JSON.parse(result.recordset[0]["circleHierarchy"]);
        // const jsonData = JSON.parse(result.recordset[0]["circleHierarchyFlat"]);
        const jsonData = JSON.parse(result.recordset[0]["circleHierarchyOptimized"]);
        console.log(jsonData);
        
        res.json(jsonData); // response
        console.log("result returned..");
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "DB error"
        });
    }
});


// API route - calling SP (divisions based on circle id)
app.get("/api/divisions/:circle_id", async (req, res) => {
    try {
        const circleId = parseInt(req.params.circle_id);

        console.log("req.params: ", req.params);
        console.log("circleId: ", circleId);

        const pool = await mssql.connect(dbConfig); // pool
        
        const result = await pool.request()
        .input("circle_id", mssql.Int, circleId) // PARAM
        .execute("sp_GetDivisionsByCircle"); // our SP

        console.log("result: ", result);
        
        res.json(result.recordset); // response
        console.log("result returned..");
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "DB error"
        });
    }
});

// API route - calling SP (subdivisions based on division id)
app.get("/api/sub_divisions/:division_id", async (req, res) => {
    try {
        const divisionId = parseInt(req.params.division_id);

        console.log("req.params: ", req.params);
        console.log("division_id: ", divisionId);

        const pool = await mssql.connect(dbConfig); // pool
        
        const result = await pool.request()
        .input("division_id", mssql.Int, divisionId) // PARAM
        .execute("sp_GetSubDivisionsByDivision"); // our SP

        console.log("result: ", result);
        
        res.json(result.recordset); // response
        console.log("result returned..");
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "DB error"
        });
    }
});


// API route - calling SP (stations based on subdivision id)
app.get("/api/stations/:sub_division_id", async (req, res) => {
    try {
        const subDivisionId = parseInt(req.params.sub_division_id);

        console.log("req.params: ", req.params);
        console.log("sub_division_id: ", subDivisionId);

        const pool = await mssql.connect(dbConfig); // pool
        
        const result = await pool.request()
        .input("sub_division_id", mssql.Int, subDivisionId) // PARAM
        .execute("sp_GetStationsBySubDivision"); // our SP

        console.log("result: ", result);
        
        res.json(result.recordset); // response
        console.log("result returned..");
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "DB error"
        });
    }
});


// API route - calling SP (feeders based on station id)
app.get("/api/feeders/:station_id", async (req, res) => {
    try {
        const stationId = parseInt(req.params.station_id);

        console.log("req.params: ", req.params);
        console.log("station_id: ", stationId);

        const pool = await mssql.connect(dbConfig); // pool
        
        const result = await pool.request()
        .input("station_id", mssql.Int, stationId) // PARAM
        .execute("sp_GetFeedersByStation"); // our SP

        console.log("result: ", result);
        
        res.json(result.recordset); // response
        console.log("result returned..");
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "DB error"
        });
    }
});


// API route - calling SP (layers based on feeder id)
app.get("/api/layers/:feeder_id", async (req, res) => {
    try {
        const feederId = parseInt(req.params.feeder_id);

        console.log("req.params: ", req.params);
        console.log("feeder_id: ", feederId);

        const pool = await mssql.connect(dbConfig); // pool
        
        const result = await pool.request()
        .input("feeder_id", mssql.Int, feederId) // PARAM
        .execute("sp_GetLayersByFeeder"); // our SP

        console.log("result: ", result);
        
        res.json(result.recordset); // response
        console.log("result returned..");
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "DB error"
        });
    }
});


// API route - calling SP (HTlayers based on feeder id)
app.get("/api/HTLayers/:feeder_id", async (req, res) => {
    try {
        const feederId = parseInt(req.params.feeder_id);

        console.log("req.params: ", req.params);
        console.log("feeder_id: ", feederId);

        const pool = await mssql.connect(dbConfig); // pool
        
        const result = await pool.request()
        .input("feeder_id", mssql.Int, feederId) // PARAM
        .execute("sp_GetHTSectionLayersByFeederID"); // our SP

        console.log("result: ", result);
        
        res.json(result.recordset); // response
        console.log("result returned..");
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "DB error"
        });
    }
});


// starting server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("app is listening on Port 3000")
});
